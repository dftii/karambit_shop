/**
 * Estado de Mystery Boxes (zustand + persist 'krm-mystery-storage', versión 1).
 * El saldo y el carrito siguen en `useStore`; aquí solo viven las semillas provably fair (simuladas),
 * el historial de aperturas y las preferencias de la página.
 *
 *   serverSeed / serverSeedHash  semilla del "servidor" vigente y su SHA-256 publicado ANTES de abrir.
 *                                (Simulación: está en localStorage, pero la UI no la muestra hasta revelarla.)
 *   clientSeed / nonce           semilla del jugador (editable) y contador de aperturas.
 *   history                      últimas 20 aperturas (la más reciente primero).
 *
 * Flujo de una apertura: computeRoll(seeds) -> addOpening(record, revealed:false) -> animación ->
 * revealOpening(id): marca la apertura como revelada, sube el nonce y rota el serverSeed.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Rarity } from '../data/karambits';
import { MAX_CLIENT_SEED_LENGTH, randomClientSeed, randomHex, sanitizeClientSeed, sha256Hex } from '../lib/fairness';

export const HISTORY_LIMIT = 20;
export const MYSTERY_STORE_NAME = 'krm-mystery-storage';

export type OpeningOutcome = 'pending' | 'claimed' | 'sold' | 'converted';

export interface OpeningRecord {
  id: string;
  /** Marca de tiempo (ms). */
  at: number;
  caseId: string;
  caseName: string;
  casePrice: number;
  prizeId: string;
  prizeName: string;
  rarity: Rarity;
  /** Valor de catálogo del premio. */
  value: number;
  /** Lo que paga "Vender por saldo" por este premio. */
  buyback: number;
  roll: number;
  hash: string;
  clientSeed: string;
  nonce: number;
  serverSeed: string;
  serverSeedHash: string;
  /** `true` cuando terminó la animación y el serverSeed ya es público. */
  revealed: boolean;
  outcome: OpeningOutcome;
  /** Saldo abonado si se vendió / convirtió. */
  payout?: number;
}

interface MysteryState {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  history: OpeningRecord[];
  /** Sonido del carrete (apagado por defecto). */
  soundOn: boolean;
  /** "Abrir rápido": animación corta. */
  fastMode: boolean;

  /** Calcula el hash si falta o no corresponde a la semilla (tras recargar). */
  ensureCommitment: () => Promise<void>;
  setClientSeed: (seed: string) => void;
  randomizeClientSeed: () => void;
  setSoundOn: (on: boolean) => void;
  setFastMode: (on: boolean) => void;
  addOpening: (record: OpeningRecord) => void;
  setOutcome: (id: string, outcome: Exclude<OpeningOutcome, 'pending'>, payout?: number) => void;
  /** Revela la apertura (publica su serverSeed), sube el nonce y rota la semilla del servidor. */
  revealOpening: (id: string) => Promise<void>;
  clearHistory: () => void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const str = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);
const num = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const OUTCOMES: readonly OpeningOutcome[] = ['pending', 'claimed', 'sold', 'converted'];

function sanitizeHistory(raw: unknown): OpeningRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: OpeningRecord[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) continue;
    const id = str(entry.id);
    const caseId = str(entry.caseId);
    const prizeId = str(entry.prizeId);
    if (!id || !caseId || !prizeId) continue;
    const outcome = OUTCOMES.find((o) => o === entry.outcome) ?? 'claimed';
    out.push({
      id,
      at: num(entry.at, Date.now()),
      caseId,
      caseName: str(entry.caseName, caseId),
      casePrice: num(entry.casePrice),
      prizeId,
      prizeName: str(entry.prizeName, prizeId),
      rarity: str(entry.rarity, 'Covert') as Rarity,
      value: num(entry.value),
      buyback: num(entry.buyback),
      roll: num(entry.roll),
      hash: str(entry.hash),
      clientSeed: str(entry.clientSeed),
      nonce: Math.max(0, Math.floor(num(entry.nonce))),
      serverSeed: str(entry.serverSeed),
      serverSeedHash: str(entry.serverSeedHash),
      revealed: entry.revealed === true,
      outcome,
      payout: typeof entry.payout === 'number' && Number.isFinite(entry.payout) ? entry.payout : undefined,
    });
  }
  return out.slice(0, HISTORY_LIMIT);
}

export const useMysteryStore = create<MysteryState>()(
  persist(
    (set, get) => ({
      serverSeed: randomHex(32),
      serverSeedHash: '',
      clientSeed: randomClientSeed(),
      nonce: 0,
      history: [],
      soundOn: false,
      fastMode: false,

      ensureCommitment: async () => {
        const { serverSeed, serverSeedHash } = get();
        const expected = await sha256Hex(serverSeed);
        if (expected !== serverSeedHash && get().serverSeed === serverSeed) set({ serverSeedHash: expected });
      },

      setClientSeed: (seed) => {
        const clean = sanitizeClientSeed(seed);
        if (clean) set({ clientSeed: clean });
      },
      randomizeClientSeed: () => set({ clientSeed: randomClientSeed() }),
      setSoundOn: (soundOn) => set({ soundOn }),
      setFastMode: (fastMode) => set({ fastMode }),

      addOpening: (record) =>
        set((state) => ({ history: [record, ...state.history.filter((r) => r.id !== record.id)].slice(0, HISTORY_LIMIT) })),

      setOutcome: (id, outcome, payout) =>
        set((state) => ({
          history: state.history.map((r) => (r.id === id ? { ...r, outcome, payout } : r)),
        })),

      revealOpening: async (id) => {
        const record = get().history.find((r) => r.id === id);
        if (!record || record.revealed) return;
        // La siguiente semilla (y su hash) se preparan antes del set: estado siempre consistente.
        const nextSeed = randomHex(32);
        const nextHash = await sha256Hex(nextSeed);
        set((state) => {
          const target = state.history.find((r) => r.id === id);
          if (!target || target.revealed) return state;
          const advance = state.nonce === target.nonce;
          return {
            history: state.history.map((r) => (r.id === id ? { ...r, revealed: true } : r)),
            ...(advance
              ? { nonce: state.nonce + 1, serverSeed: nextSeed, serverSeedHash: nextHash }
              : {}),
          };
        });
      },

      clearHistory: () => set((state) => ({ history: state.history.filter((r) => r.outcome === 'pending') })),
    }),
    {
      name: MYSTERY_STORE_NAME,
      version: 1,
      partialize: (state) => ({
        serverSeed: state.serverSeed,
        serverSeedHash: state.serverSeedHash,
        clientSeed: state.clientSeed,
        nonce: state.nonce,
        history: state.history,
        soundOn: state.soundOn,
        fastMode: state.fastMode,
      }),
      merge: (persisted, current) => {
        if (!isRecord(persisted)) return current;
        const serverSeed = str(persisted.serverSeed);
        return {
          ...current,
          serverSeed: /^[0-9a-f]{64}$/.test(serverSeed) ? serverSeed : current.serverSeed,
          serverSeedHash: /^[0-9a-f]{64}$/.test(serverSeed) ? str(persisted.serverSeedHash) : '',
          clientSeed: sanitizeClientSeed(str(persisted.clientSeed)).slice(0, MAX_CLIENT_SEED_LENGTH) || current.clientSeed,
          nonce: Math.max(0, Math.floor(num(persisted.nonce))),
          history: sanitizeHistory(persisted.history),
          soundOn: persisted.soundOn === true,
          fastMode: persisted.fastMode === true,
        };
      },
    }
  )
);
