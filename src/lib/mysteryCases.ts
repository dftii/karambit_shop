// ─── Mystery Boxes: definición de cajas, economía y validación ───────────────
// Pura (sin React ni store). Todo el dinero es SIMULADO (saldo virtual).
//
// Economía (estilo knify.gg):
//   · Abrir una caja cuesta `price` de saldo virtual.
//   · El premio se puede RECLAMAR (se añade al carrito a 0 €) o VENDER por saldo: BUYBACK_RATE × valor
//     de catálogo (`basePrice`).
//   · EV (vendiendo) = Σ prob_i × BUYBACK_RATE × basePrice_i. Cada caja se valida al cargar para que
//     EV < precio (ventaja de la casa > 0): no existe bucle infinito de saldo abriendo y vendiendo.
//
// Las probabilidades se definen en % (máx. 2 decimales), se convierten a puntos básicos enteros
// (1% = 100) y deben sumar exactamente 10 000. Las referencias a productos se resuelven por id real
// del catálogo: si algo no existe NO hay fallback por índice; en desarrollo se lanza un error y en
// producción la caja inválida se descarta con console.error.
import { getProductById, type Product, type Rarity } from '../data/karambits';
import { roundMoney } from './pricing';

/** Porcentaje del valor de catálogo que paga "Vender por saldo". */
export const BUYBACK_RATE = 0.7;
/** Ventaja mínima exigida a cada caja (1 - EV/precio). */
export const MIN_HOUSE_EDGE = 0.05;
export const TOTAL_BP = 10_000;
/** Importes de recarga de saldo simulado. */
export const TOP_UP_AMOUNTS = [50, 100, 250, 500] as const;

export interface PoolEntry {
  product: Product;
  /** % de probabilidad (p. ej. 0.25). */
  chance: number;
  /** Puntos básicos enteros (1% = 100). */
  chanceBp: number;
}

export interface MysteryCase {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  gradient: string[];
  /** Caja del coleccionista Founder Bespoke — DuFiTuFi Design (CEO): branding premium. */
  founder: boolean;
  /** Orden de definición: es el que usa la selección ponderada (y la verificación). */
  pool: PoolEntry[];
  /** `pool[i].chanceBp` en el mismo orden (para `pickByWeights`). */
  weightsBp: number[];
}

interface CaseSpec {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  gradient: string[];
  founder?: boolean;
  /** [id de catálogo, % de probabilidad] */
  pool: ReadonlyArray<readonly [string, number]>;
}

const SPECS: readonly CaseSpec[] = [
  {
    id: 'case-millionaire-founder',
    name: "Millionaire Founder's Case",
    tagline: 'Founder Bespoke — DuFiTuFi Design (CEO)',
    description:
      'Caja Suprema del Fundador: opción real a la Obra Cumbre de 24.990 € firmada por DuFiTuFi Design (CEO), piezas de Alta Joyería 1-of-1 y gemas Doppler.',
    price: 249.9,
    gradient: ['#fbbf24', '#f472b6', '#38bdf8'],
    founder: true,
    pool: [
      ['krm-celestial-pink-diamond', 0.1],
      ['krm-diamond-sovereign', 0.4],
      ['krm-24k-gold-meteorite', 1.5],
      ['krm-royal-blood-ruby-platinum', 4],
      ['krm-doppler-ruby', 16],
      ['krm-doppler-sapphire', 16],
      ['krm-doppler-emerald', 16],
      ['krm-damascus-steel-tactical', 6],
      ['krm-black-laminate', 40],
    ],
  },
  {
    id: 'case-doppler',
    name: 'Doppler Gem Case',
    tagline: 'Gemas míticas y fases Doppler',
    description:
      'Probabilidades de gemas míticas y fases CS2: Ruby, Sapphire, Emerald, Black Pearl y las Fases 1 a 4.',
    price: 49.9,
    gradient: ['#a855f7', '#ec4899', '#3b82f6'],
    pool: [
      ['krm-doppler-ruby', 3],
      ['krm-doppler-sapphire', 3],
      ['krm-doppler-emerald', 8],
      ['krm-doppler-black-pearl', 8],
      ['krm-gamma-doppler-phase3', 8],
      ['krm-doppler-phase4', 10],
      ['krm-doppler-phase1', 15],
      ['krm-doppler-phase2', 45],
    ],
  },
  {
    id: 'case-legends',
    name: 'Spec-Ops & Legends Case',
    tagline: 'Leyendas y camuflajes militares',
    description:
      'Las leyendas de CS2 y los camuflajes militares: Case Hardened, Fade, Marble Fade, Lore, Bright Water, Tiger Tooth y Forest DDPAT.',
    price: 39.9,
    gradient: ['#f59e0b', '#ef4444', '#a855f7'],
    pool: [
      ['krm-case-hardened', 4],
      ['krm-fade', 8],
      ['krm-marble-fade', 10],
      ['krm-lore', 14],
      ['krm-bright-water', 6],
      ['krm-tiger-tooth', 28],
      ['krm-forest-ddpat', 30],
    ],
  },
  {
    id: 'case-offensive',
    name: 'Tactical & Forged CS2 Case',
    tagline: 'Acero forjado y diseños tácticos',
    description:
      'Serie táctica forjada en acero 440C: Damascus Steel, Black Laminate, Ultraviolet, Night, Freehand y Stained.',
    price: 59.9,
    gradient: ['#10b981', '#3b82f6', '#6366f1'],
    pool: [
      ['krm-damascus-steel-tactical', 3],
      ['krm-black-laminate', 10],
      ['krm-ultraviolet', 17],
      ['krm-night', 22],
      ['krm-freehand', 18],
      ['krm-stained', 30],
    ],
  },
];

// ─── Valores derivados ───────────────────────────────────────────────────────
/** Lo que paga "Vender por saldo" por un premio. */
export const buybackValue = (product: Pick<Product, 'basePrice'>): number =>
  roundMoney(product.basePrice * BUYBACK_RATE);

export interface CaseStats {
  /** Valor esperado a precio de catálogo (si se reclaman los premios). */
  evCatalog: number;
  /** Valor esperado vendiendo cada premio (EV de la economía de saldo). */
  evBuyback: number;
  /** Retorno al jugador vendiendo: evBuyback / precio. */
  rtp: number;
  /** Ventaja de la casa: 1 - rtp. */
  houseEdge: number;
}

export function computeCaseStats(c: Pick<MysteryCase, 'price' | 'pool'>): CaseStats {
  const evCatalog = c.pool.reduce((sum, e) => sum + (e.chanceBp / TOTAL_BP) * e.product.basePrice, 0);
  const evBuyback = c.pool.reduce((sum, e) => sum + (e.chanceBp / TOTAL_BP) * buybackValue(e.product), 0);
  const rtp = evBuyback / c.price;
  return { evCatalog, evBuyback, rtp, houseEdge: 1 - rtp };
}

// ─── Rareza / orden ──────────────────────────────────────────────────────────
const RARITY_RANK: Record<Rarity, number> = {
  'Mythic Bespoke': 0,
  Extraordinary: 1,
  Covert: 2,
  Classified: 3,
  'Mil-Spec': 4,
};

export const rarityRank = (rarity: Rarity): number => RARITY_RANK[rarity] ?? 99;

/** Copia del pool ordenada de mayor a menor rareza (y valor) para mostrarla. No altera el orden de sorteo. */
export function sortPoolByRarity(pool: readonly PoolEntry[]): PoolEntry[] {
  return [...pool].sort(
    (a, b) =>
      rarityRank(a.product.rarity) - rarityRank(b.product.rarity) ||
      b.product.basePrice - a.product.basePrice
  );
}

/** Nombre corto de una pieza para tarjetas ("Doppler Ruby", "Imperial Celestial Pink Diamond & Californium"). */
export const shortKnifeName = (product: Pick<Product, 'name'>): string =>
  product.name
    .replace(/^★\s*/, '')
    .replace(/^Karambit \|\s*/, '')
    .replace(/\s*—\s*DuFiTuFi Design \(CEO\)\s*$/, '');

// ─── Validación y construcción ───────────────────────────────────────────────
function buildCase(spec: CaseSpec): { value?: MysteryCase; errors: string[] } {
  const errors: string[] = [];
  const pool: PoolEntry[] = [];
  const seen = new Set<string>();

  for (const [productId, chance] of spec.pool) {
    const product = getProductById(productId);
    if (!product) {
      errors.push(`producto inexistente "${productId}"`);
      continue;
    }
    if (seen.has(productId)) errors.push(`producto repetido "${productId}"`);
    seen.add(productId);
    const chanceBp = Math.round(chance * 100);
    if (!(chance > 0) || Math.abs(chanceBp - chance * 100) > 1e-6) {
      errors.push(`probabilidad no válida (${chance}) para "${productId}" (máx. 2 decimales, > 0)`);
    }
    pool.push({ product, chance: chanceBp / 100, chanceBp });
  }

  const totalBp = pool.reduce((sum, e) => sum + e.chanceBp, 0);
  if (totalBp !== TOTAL_BP) errors.push(`las probabilidades suman ${totalBp / 100}% (deben sumar 100%)`);
  if (!(spec.price > 0)) errors.push('precio no válido');

  const built: MysteryCase = {
    id: spec.id,
    name: spec.name,
    tagline: spec.tagline,
    description: spec.description,
    price: spec.price,
    gradient: spec.gradient,
    founder: spec.founder === true,
    pool,
    weightsBp: pool.map((e) => e.chanceBp),
  };

  if (errors.length === 0) {
    const stats = computeCaseStats(built);
    if (stats.houseEdge < MIN_HOUSE_EDGE) {
      errors.push(
        `economía insostenible: EV vendiendo ${stats.evBuyback.toFixed(2)}€ vs precio ${spec.price.toFixed(2)}€ ` +
          `(ventaja ${(stats.houseEdge * 100).toFixed(1)}% < ${MIN_HOUSE_EDGE * 100}%)`
      );
    }
  }
  return { value: errors.length === 0 ? built : undefined, errors };
}

const isDev = (): boolean => {
  try {
    return import.meta.env?.DEV === true;
  } catch {
    return false;
  }
};

function buildAllCases(): MysteryCase[] {
  const cases: MysteryCase[] = [];
  const problems: string[] = [];
  for (const spec of SPECS) {
    const { value, errors } = buildCase(spec);
    if (value) cases.push(value);
    else problems.push(`[Mystery] Caja "${spec.id}" inválida: ${errors.join('; ')}`);
  }
  if (problems.length > 0) {
    if (isDev()) throw new Error(problems.join('\n'));
    problems.forEach((message) => console.error(message));
  }
  return cases;
}

/** Cajas válidas (validadas al cargar el módulo). */
export const MYSTERY_CASES: readonly MysteryCase[] = buildAllCases();

export const getMysteryCase = (id: string): MysteryCase | undefined =>
  MYSTERY_CASES.find((c) => c.id === id);
