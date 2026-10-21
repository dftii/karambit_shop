import React, { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { Crown, Gauge, Package, Sparkles, Volume2, VolumeX, Wallet } from 'lucide-react';
import { getProductById, type Product } from '../data/karambits';
import { buildKnifeCartItem, notifyCartResult } from '../lib/cart';
import { formatEUR } from '../lib/format';
import { computeRoll, pickByWeights } from '../lib/fairness';
import {
  MYSTERY_CASES,
  TOP_UP_AMOUNTS,
  buybackValue,
  computeCaseStats,
  getMysteryCase,
  shortKnifeName,
  type MysteryCase,
} from '../lib/mysteryCases';
import { isOneOfOne, roundMoney } from '../lib/pricing';
import { playTick, playWin, unlockAudio } from '../lib/reelSound';
import { useStore } from '../store/useStore';
import { useMysteryStore, type OpeningRecord } from '../store/useMysteryStore';
import { Badge, Button, Price, toast } from '../components/ui';
import { Confetti } from '../components/mystery/Confetti';
import { FairnessPanel, type VerifyDraft } from '../components/mystery/FairnessPanel';
import { HistoryPanel } from '../components/mystery/HistoryPanel';
import { PoolTable } from '../components/mystery/PoolTable';
import { PrizeCard } from '../components/mystery/PrizeCard';
import { Reel, type ReelHandle } from '../components/mystery/Reel';
import { TopUpModal } from '../components/mystery/TopUpModal';
import { PageMeta } from '../components/PageMeta';

// MYSTERY BOXES — simulador de apertura estilo CS2 / knify.gg.
// Pago con SALDO VIRTUAL (dinero ficticio). Premios: reclamar al carrito a 0 € o vender por saldo.
// Economía y validación de cajas: src/lib/mysteryCases.ts · provably fair: src/lib/fairness.ts.
// ═══════════════════════════════════════════════════════════════════════════════

const REEL_LENGTH = 56;
const WIN_INDEX = 48;
const SPIN_MS = 5500;
const FAST_SPIN_MS = 2200;
const FOUNDER_GRADIENT = 'linear-gradient(120deg, #fbbf24, #f472b6 55%, #38bdf8)';

/** Cartas del carrete: relleno ponderado por las probabilidades de la caja (visual) y el premio real en WIN_INDEX. */
function buildReel(c: MysteryCase, prize?: Product): Product[] {
  const items = Array.from({ length: REEL_LENGTH }, () => c.pool[pickByWeights(Math.random(), c.weightsBp)].product);
  if (prize) items[WIN_INDEX] = prize;
  return items;
}

const claimItem = (product: Product) =>
  buildKnifeCartItem(product, { price: 0, nameSuffix: ' [Premio Mystery Box]', variant: 'mystery' });

const fmtPct = (value: number): string => `${(value * 100).toLocaleString('es-ES', { maximumFractionDigits: 1 })}%`;

const Toggle: React.FC<{
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}> = ({ checked, onChange, label, icon, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-display text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 ${
      checked
        ? 'border-krm-accent bg-krm-accent/15 text-krm-accent'
        : 'border-krm-border bg-krm-card text-gray-400 hover:text-white'
    }`}
  >
    {icon}
    {label}
    <span className={`ml-1 h-2 w-2 rounded-full ${checked ? 'bg-krm-accent' : 'bg-gray-600'}`} />
  </button>
);

type Phase = 'idle' | 'preparing' | 'spinning';

const MysteryPage: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const { balance, addToCart, addBalance, setCartOpen } = useStore(
    useShallow((s) => ({
      balance: s.balance,
      addToCart: s.addToCart,
      addBalance: s.addBalance,
      setCartOpen: s.setCartOpen,
    }))
  );
  const { history, soundOn, fastMode, setSoundOn, setFastMode, addOpening, setOutcome, revealOpening, clearHistory } =
    useMysteryStore(
      useShallow((s) => ({
        history: s.history,
        soundOn: s.soundOn,
        fastMode: s.fastMode,
        setSoundOn: s.setSoundOn,
        setFastMode: s.setFastMode,
        addOpening: s.addOpening,
        setOutcome: s.setOutcome,
        revealOpening: s.revealOpening,
        clearHistory: s.clearHistory,
      }))
    );

  const [caseId, setCaseId] = useState(MYSTERY_CASES[0]?.id ?? '');
  const selectedCase = getMysteryCase(caseId) ?? MYSTERY_CASES[0];
  const [reelItems, setReelItems] = useState<Product[]>(() => (selectedCase ? buildReel(selectedCase) : []));
  const [phase, setPhase] = useState<Phase>('idle');
  const [winnerRevealed, setWinnerRevealed] = useState(false);
  const [convertedId, setConvertedId] = useState<string | null>(null);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [verifyDraft, setVerifyDraft] = useState<VerifyDraft | null>(null);
  const [verifyKey, setVerifyKey] = useState(0);

  const reelRef = useRef<ReelHandle>(null);
  const fairRef = useRef<HTMLDivElement>(null);
  const prizeRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const timerRef = useRef<number | undefined>(undefined);

  // ── Premio pendiente / convertido ───────────────────────────────────────────
  const pending = history.find((r) => r.outcome === 'pending');
  const shown = pending ?? (convertedId ? history.find((r) => r.id === convertedId) : undefined);
  const shownProduct = shown ? getProductById(shown.prizeId) : undefined;
  const showCard = phase === 'idle' && shown !== undefined && shown.revealed;

  // ¿Pieza 1-of-1 que ya tienes (pedidos o carrito)? Reactivo a ambos.
  const oneOfOneTaken = useStore((s) => {
    if (!shownProduct || !isOneOfOne(shownProduct)) return false;
    return (
      s.orders.some((o) => o.items.some((i) => i.productId === shownProduct.id)) ||
      s.cart.some((line) => line.productId === shownProduct.id)
    );
  });

  // ── Cierre de una apertura: revela semilla, resalta y convierte duplicados 1-of-1 ─────────────
  const sellRecord = useCallback(
    (record: OpeningRecord, outcome: 'sold' | 'converted'): boolean => {
      const fresh = useMysteryStore.getState().history.find((r) => r.id === record.id);
      if (!fresh || fresh.outcome !== 'pending') return false;
      setOutcome(fresh.id, outcome, fresh.buyback);
      addBalance(fresh.buyback);
      return true;
    },
    [addBalance, setOutcome]
  );

  const finalizeOpening = useCallback(
    async (record: OpeningRecord, highlight: boolean) => {
      await revealOpening(record.id);
      if (!mountedRef.current) return;
      const product = getProductById(record.prizeId);
      if (highlight) setWinnerRevealed(true);
      if (highlight && useMysteryStore.getState().soundOn) {
        playWin(product?.rarity === 'Mythic Bespoke' ? 2 : product && product.basePrice >= 90 ? 1 : 0);
      }
      if (product && isOneOfOne(product) && !useStore.getState().canAddToCart(claimItem(product)).ok) {
        if (sellRecord(record, 'converted')) {
          setConvertedId(record.id);
          toast.info(
            `Ya tienes ${shortKnifeName(product)} (pieza 1-of-1): convertida automáticamente en ${formatEUR(record.buyback)} de saldo.`,
            { title: 'Pieza duplicada', duration: 8000 }
          );
        }
      }
    },
    [revealOpening, sellRecord]
  );

  // Montaje: compromiso del servidor, recuperar aperturas a medias y limpiar al desmontar.
  useEffect(() => {
    mountedRef.current = true;
    void useMysteryStore.getState().ensureCommitment();
    const stale = useMysteryStore.getState().history.find((r) => !r.revealed);
    if (stale) void Promise.resolve().then(() => finalizeOpening(stale, false));
    return () => {
      mountedRef.current = false;
      window.clearTimeout(timerRef.current);
    };
  }, [finalizeOpening]);

  // Lleva la tarjeta del premio a la vista al aparecer.
  const cardId = showCard ? shown?.id : undefined;
  useEffect(() => {
    if (cardId) prizeRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  }, [cardId, reduced]);

  // ── Selección de caja ───────────────────────────────────────────────────────
  const handleSelectCase = (c: MysteryCase) => {
    if (phase !== 'idle' || c.id === caseId) return;
    setCaseId(c.id);
    setReelItems(buildReel(c));
    setWinnerRevealed(false);
    setConvertedId(null);
    reelRef.current?.reset();
  };

  // ── Abrir caja ──────────────────────────────────────────────────────────────
  const openCase = async () => {
    if (busyRef.current || !selectedCase) return;
    if (useMysteryStore.getState().history.some((r) => r.outcome === 'pending')) {
      toast.warning('Reclama o vende tu premio antes de abrir otra caja.');
      return;
    }
    if (useStore.getState().balance + 0.001 < selectedCase.price) {
      toast.error('Saldo insuficiente para abrir esta caja. Recarga saldo simulado.');
      return;
    }

    busyRef.current = true;
    setPhase('preparing');
    if (useMysteryStore.getState().soundOn) unlockAudio();

    try {
      await useMysteryStore.getState().ensureCommitment();
      const seeds = useMysteryStore.getState();
      const rolled = await computeRoll({ serverSeed: seeds.serverSeed, clientSeed: seeds.clientSeed, nonce: seeds.nonce });
      if (!mountedRef.current) return;

      // 1) Cobro del precio de la caja (saldo virtual). Sin saldo no hay giro.
      if (!useStore.getState().spendBalance(selectedCase.price)) {
        toast.error('Saldo insuficiente para abrir esta caja.');
        return;
      }

      // 2) Premio por selección ponderada del roll (verificable).
      const entry = selectedCase.pool[pickByWeights(rolled.roll, selectedCase.weightsBp)];
      const prize = entry.product;
      const record: OpeningRecord = {
        id: `op-${Date.now().toString(36)}-${seeds.nonce}`,
        at: Date.now(),
        caseId: selectedCase.id,
        caseName: selectedCase.name,
        casePrice: selectedCase.price,
        prizeId: prize.id,
        prizeName: shortKnifeName(prize),
        rarity: prize.rarity,
        value: prize.basePrice,
        buyback: buybackValue(prize),
        roll: rolled.roll,
        hash: rolled.hash,
        clientSeed: seeds.clientSeed,
        nonce: seeds.nonce,
        serverSeed: seeds.serverSeed,
        serverSeedHash: seeds.serverSeedHash,
        revealed: false,
        outcome: 'pending',
      };
      addOpening(record);
      setConvertedId(null);

      // 3) Carrete nuevo con el premio en WIN_INDEX y animación (paso de carta medido del DOM).
      flushSync(() => {
        setReelItems(buildReel(selectedCase, prize));
        setWinnerRevealed(false);
        setPhase('spinning');
      });
      const finished = await reelRef.current?.spin({
        winIndex: WIN_INDEX,
        stopOffset: rolled.stopOffset,
        durationMs: useMysteryStore.getState().fastMode ? FAST_SPIN_MS : SPIN_MS,
        instant: reduced,
        onTick: useMysteryStore.getState().soundOn ? playTick : undefined,
      });
      if (!finished || !mountedRef.current) return;
      if (reduced) {
        await new Promise<void>((resolve) => {
          timerRef.current = window.setTimeout(resolve, 350);
        });
        if (!mountedRef.current) return;
      }
      await finalizeOpening(record, true);
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setPhase('idle');
    }
  };

  // ── Acciones sobre el premio ────────────────────────────────────────────────
  const handleClaim = () => {
    if (!pending || !shownProduct) return;
    const fresh = useMysteryStore.getState().history.find((r) => r.id === pending.id);
    if (!fresh || fresh.outcome !== 'pending') return;
    const result = addToCart(claimItem(shownProduct));
    if (!notifyCartResult(result)) return;
    setOutcome(fresh.id, 'claimed');
    toast.success(`${shortKnifeName(shownProduct)} añadido a tu arsenal por 0,00 €.`, { title: 'Premio reclamado' });
    setCartOpen(true);
  };

  const handleSell = () => {
    if (!pending) return;
    if (sellRecord(pending, 'sold')) {
      toast.success(`Has vendido ${pending.prizeName} por ${formatEUR(pending.buyback)} de saldo virtual.`, {
        title: 'Venta completada',
      });
    }
  };

  const handleVerify = (record: OpeningRecord) => {
    setVerifyDraft({
      serverSeed: record.serverSeed,
      clientSeed: record.clientSeed,
      nonce: String(record.nonce),
      caseId: record.caseId,
      expectedHash: record.serverSeedHash,
      expectedPrizeId: record.prizeId,
    });
    setVerifyKey((k) => k + 1);
    window.setTimeout(() => fairRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }), 60);
  };

  if (!selectedCase) {
    return (
      <main id="main" tabIndex={-1} className="min-h-screen bg-krm-bg px-4 pb-24 pt-28 text-center text-gray-300">
        <PageMeta title="Mystery Boxes" description="Abre cajas misteriosas con probabilidades publicadas y semilla verificable en KRM.GG." />
        <p className="font-display text-xl font-black uppercase text-white">Mystery Boxes no disponible</p>
        <p className="mt-2 text-sm text-gray-400">Ninguna caja superó la validación de datos. Revisa la consola.</p>
      </main>
    );
  }

  // ── Derivados de render ─────────────────────────────────────────────────────
  const busy = phase !== 'idle';
  const canAfford = balance + 0.001 >= selectedCase.price;
  const missing = roundMoney(selectedCase.price - balance);
  const stats = computeCaseStats(selectedCase);
  const founder = selectedCase.founder;
  const latest = history[0];
  const mythicHit =
    winnerRevealed &&
    phase === 'idle' &&
    latest?.revealed === true &&
    getProductById(latest.prizeId)?.rarity === 'Mythic Bespoke';

  let buttonLabel = `Abrir caja · ${formatEUR(selectedCase.price)}`;
  if (phase === 'preparing') buttonLabel = 'Preparando…';
  else if (phase === 'spinning') buttonLabel = 'Abriendo…';
  else if (pending) buttonLabel = 'Resuelve tu premio';
  else if (!canAfford) buttonLabel = 'Saldo insuficiente';

  return (
    <main id="main" tabIndex={-1} className="min-h-screen w-full bg-krm-bg pb-24 pt-28 text-gray-200">
      <PageMeta title="Mystery Boxes" description="Abre cajas misteriosas con probabilidades publicadas y semilla verificable en KRM.GG." />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* Cabecera */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <Badge tone="amber" className="px-4 py-1.5 text-xs tracking-widest">
            Simulador de apertura CS2
          </Badge>
          <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-6xl">
            Mystery{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">Boxes</span>
          </h1>
          <p className="mx-auto mt-2 max-w-2xl font-body text-sm text-gray-400">
            Abre cajas con tu saldo virtual y desbloquea réplicas Karambit 1:1. Todo es simulado: el saldo es dinero
            ficticio y no se realiza ningún pago real.
          </p>
        </motion.div>

        {/* Saldo */}
        <section
          aria-label="Saldo virtual"
          className="mb-8 flex flex-col gap-4 rounded-2xl border border-krm-border bg-krm-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-krm-accent/30 bg-krm-accent/10 text-krm-accent">
              <Wallet className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-widest text-gray-500">Tu saldo virtual</p>
              <Price value={balance} size="lg" className="leading-none" data-testid="mystery-balance" />
              <span className="ml-2 font-body text-[11px] text-gray-500">dinero ficticio</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {TOP_UP_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                variant="secondary"
                size="sm"
                onClick={() => {
                  addBalance(amount);
                  toast.success(`+${amount} € de saldo simulado añadidos.`, { title: 'Saldo recargado' });
                }}
              >
                +{amount} €
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setTopUpOpen(true)}>
              Recargar saldo (simulado)
            </Button>
          </div>
        </section>

        {/* Selector de cajas */}
        <div role="radiogroup" aria-label="Elegir caja" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MYSTERY_CASES.map((c) => {
            const selected = c.id === selectedCase.id;
            const cStats = computeCaseStats(c);
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={busy && !selected}
                onClick={() => handleSelectCase(c)}
                className={`relative rounded-2xl p-[1.5px] text-left transition-all disabled:cursor-not-allowed ${
                  selected ? 'scale-[1.015] shadow-xl' : 'opacity-80 hover:opacity-100'
                }`}
                style={{
                  background: selected || c.founder ? `linear-gradient(135deg, ${c.gradient.join(', ')})` : '#1f2433',
                  boxShadow: selected ? `0 12px 40px ${c.gradient[0]}33` : undefined,
                }}
              >
                <div className="flex h-full flex-col rounded-[14px] bg-krm-card-hi p-4 sm:p-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    {c.founder ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-display text-[10px] font-black uppercase tracking-wider text-black"
                        style={{ background: FOUNDER_GRADIENT }}
                      >
                        <Crown className="h-3 w-3" /> DuFiTuFi Design (CEO)
                      </span>
                    ) : (
                      <Badge tone="amber">{c.pool.length} Karambits</Badge>
                    )}
                    <Price value={c.price} size="md" />
                  </div>
                  <h3 className="font-display text-lg font-black uppercase leading-tight text-white">{c.name}</h3>
                  <p className="mt-1 flex-1 font-body text-xs leading-relaxed text-gray-400">{c.description}</p>
                  <p className="mt-3 font-mono text-[10px] text-gray-500">
                    RTP vendiendo {fmtPct(cStats.rtp)} · ventaja {fmtPct(cStats.houseEdge)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Arena */}
        <motion.div
          className="relative mb-10 overflow-hidden rounded-3xl border bg-krm-bg-deep p-4 shadow-2xl sm:p-8"
          style={{ borderColor: founder ? '#f472b655' : '#1f2433' }}
          animate={
            mythicHit && !reduced
              ? { boxShadow: ['0 0 0px #fbbf2400', '0 0 90px #f472b6aa', '0 0 30px #fbbf2466'] }
              : { boxShadow: founder ? '0 0 50px #fbbf2414' : '0 0 0px #0000' }
          }
          transition={{ duration: 1.6 }}
        >
          {founder && (
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  'radial-gradient(60% 50% at 20% 0%, #fbbf2418, transparent 70%), radial-gradient(50% 50% at 90% 100%, #38bdf814, transparent 70%), radial-gradient(40% 40% at 60% 0%, #f472b614, transparent 70%)',
              }}
            />
          )}
          {mythicHit && latest && <Confetti key={latest.id} />}

          <div className="relative">
            <Reel
              ref={reelRef}
              items={reelItems}
              winIndex={WIN_INDEX}
              winnerRevealed={winnerRevealed && !busy}
              glow={mythicHit ? '#f472b6' : undefined}
            />

            <div className="mt-5 flex flex-col gap-4 border-t border-krm-border pt-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span className="font-body text-xs text-gray-400">Caja seleccionada</span>
                <p className="font-display text-xl font-black uppercase text-white">{selectedCase.name}</p>
                <p className="font-body text-[11px] text-gray-500">{selectedCase.tagline}</p>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <div className="flex flex-wrap gap-2">
                  <Toggle
                    checked={fastMode}
                    onChange={setFastMode}
                    label="Abrir rápido"
                    icon={<Gauge className="h-3.5 w-3.5" />}
                    disabled={busy}
                  />
                  <Toggle
                    checked={soundOn}
                    onChange={(value) => {
                      setSoundOn(value);
                      if (value) unlockAudio();
                    }}
                    label="Sonido"
                    icon={soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {!canAfford && !busy && !pending && (
                    <Button variant="secondary" size="lg" onClick={() => setTopUpOpen(true)} icon={<Wallet className="h-4 w-4" />}>
                      Recargar saldo (simulado)
                    </Button>
                  )}
                  <Button
                    size="lg"
                    onClick={openCase}
                    disabled={busy || !canAfford || Boolean(pending)}
                    icon={founder ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    className="text-lg"
                    data-testid="open-case"
                  >
                    {buttonLabel}
                  </Button>
                </div>
                {!canAfford && !busy && !pending && (
                  <p className="font-body text-xs text-red-400" role="status">
                    Te faltan {formatEUR(missing)} de saldo para esta caja.
                  </p>
                )}
                {pending && !busy && (
                  <p className="font-body text-xs text-amber-400" role="status">
                    Tienes un premio sin resolver: reclámalo o véndelo para abrir otra caja.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premio */}
        <div ref={prizeRef}>
          {showCard && shown && shownProduct && (
            <PrizeCard
              key={shown.id}
              product={shownProduct}
              buyback={shown.buyback}
              mustConvert={shown.outcome === 'converted' || oneOfOneTaken}
              convertedPayout={shown.outcome === 'converted' ? shown.payout : undefined}
              celebrationKey={shown.id}
              disabled={busy}
              onClaim={handleClaim}
              onSell={handleSell}
            />
          )}
        </div>

        {/* Contenido y economía */}
        <PoolTable mysteryCase={selectedCase} />

        <p className="-mt-6 mb-12 flex items-start gap-2 font-body text-xs leading-relaxed text-gray-500">
          <Package className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Abrir una caja cuesta {formatEUR(selectedCase.price)} de saldo virtual. Vender un premio paga el 70% de su
            valor de catálogo, por lo que el retorno esperado vendiendo es del {fmtPct(stats.rtp)} y la ventaja de la casa
            del {fmtPct(stats.houseEdge)}. Las piezas 1-of-1 que ya tienes se convierten automáticamente en saldo (nunca se
            entrega una segunda unidad).
          </span>
        </p>

        {/* Provably fair + historial */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div ref={fairRef} className="scroll-mt-28">
            <FairnessPanel key={verifyKey} locked={busy} initialVerify={verifyDraft} />
          </div>
          <HistoryPanel history={history} onVerify={handleVerify} onClear={clearHistory} locked={busy} />
        </div>
      </div>

      <TopUpModal open={topUpOpen} onClose={() => setTopUpOpen(false)} />
    </main>
  );
};

export default MysteryPage;
