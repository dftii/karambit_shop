// ─── Packs coleccionista: definición, precios derivados y reparto exacto ─────
// Pura (sin React ni store). Los precios "originales" y el ahorro se DERIVAN del catálogo y de los
// complementos (pricing.ts), así que no pueden descuadrarse. El precio del pack se reparte entre sus
// piezas en céntimos enteros: la suma de las líneas del carrito es EXACTAMENTE `bundlePrice`.
import { getProductById, type Product } from '../data/karambits';
import { ADDON_PRICES, isOneOfOne, roundMoney } from './pricing';

export interface BundleExtras {
  stand?: boolean;
  kydex?: boolean;
  statTrak?: boolean;
  /** Placa NameTag grabada con este texto. */
  nameTag?: string;
}

export interface BundleDefinition {
  id: string;
  name: string;
  /** Nombre corto para las líneas del carrito. */
  tag: string;
  tagline: string;
  badge: string;
  bundlePrice: number;
  /** Complementos incluidos en CADA pieza del pack. */
  extras: BundleExtras;
  itemsIncluded: string[];
  knives: Product[];
  /** Suma de piezas (Factory New) + complementos a precio individual. */
  originalPrice: number;
  savings: number;
  discountPercent: number;
  /** Contiene al menos una pieza 1-of-1 Founder Bespoke. */
  hasOneOfOne: boolean;
}

interface BundleSpec {
  id: string;
  name: string;
  tag: string;
  tagline: string;
  badge: string;
  bundlePrice: number;
  extras: BundleExtras;
  itemsIncluded: string[];
  knifeIds: string[];
}

/** Id del Founder's Vault Luxury Pack (los cupones no se aplican a sus líneas, ver lib/coupons.ts). */
export const FOUNDER_BUNDLE_ID = 'bundle-founders-vault';

/** Valor de `CartItem.variant` de las líneas que vienen de un pack. */
export const bundleVariant = (bundleId: string): string => `pack:${bundleId}`;

const SPECS: readonly BundleSpec[] = [
  {
    id: FOUNDER_BUNDLE_ID,
    name: "Founder's Vault Luxury Pack — DuFiTuFi Design (CEO)",
    tag: 'Founder Vault',
    tagline:
      'Las 4 creaciones maestras de Alta Joyería firmadas por DuFiTuFi (CEO) reunidas en una colección irrepetible: Obra cumbre de 24.990€ con Californio, Diamantes VVS1, Oro Macizo 24K y Platino 950.',
    badge: 'DuFiTuFi Design (CEO) 1-of-1',
    bundlePrice: 32990,
    extras: {},
    itemsIncluded: [
      '★ Karambit | Imperial Celestial Pink Diamond & Californium (24.990€)',
      '★ Karambit | Diamond Sovereign (18K White Gold & VVS1) (9.990€)',
      '★ Karambit | 24K Solid Gold & Gibeon Meteorite (4.990€)',
      '★ Karambit | Royal Blood Ruby & Platinum 950 (2.490€)',
      '4x Vitrinas Blindadas Biométricas con iluminación LED integrada (GRATIS)',
      '4x Certificados Gemológicos Notariados firmados por DuFiTuFi (CEO) (GRATIS)',
    ],
    knifeIds: [
      'krm-celestial-pink-diamond',
      'krm-diamond-sovereign',
      'krm-24k-gold-meteorite',
      'krm-royal-blood-ruby-platinum',
    ],
  },
  {
    id: 'bundle-tactical-cs2',
    name: 'Pack Táctico CS2',
    tag: 'Pack Táctico',
    tagline:
      'La trilogía táctica definitiva de CS2: Damascus Steel forjado en 440C, Black Laminate mate y Night operaciones nocturnas.',
    badge: 'Trilogía Táctica CS2',
    bundlePrice: 219.9,
    extras: { stand: true },
    itemsIncluded: [
      '★ Karambit | Damascus Steel Acero Forjado (119.90€)',
      '★ Karambit | Black Laminate Mate Táctico (94.90€)',
      '★ Karambit | Night Azul Medianoche (74.90€)',
      '3x Soportes Acrílicos Oficiales de Exhibición (Valor 44.70€ GRATIS)',
    ],
    knifeIds: ['krm-damascus-steel-tactical', 'krm-black-laminate', 'krm-night'],
  },
  {
    id: 'bundle-doppler-trinity',
    name: 'Doppler Trinity Pack',
    tag: 'Doppler Trinity',
    tagline: 'Las tres gemas supremas de CS2 forjadas en acero inoxidable 440C con 3 soportes incluidos.',
    badge: 'Pack Coleccionista Definitivo',
    bundlePrice: 149.9,
    extras: { stand: true },
    itemsIncluded: [
      'Karambit | Doppler Ruby (54.90€)',
      'Karambit | Doppler Sapphire (54.90€)',
      'Karambit | Gamma Doppler Emerald (52.90€)',
      '3x Soportes Acrílicos Oficiales de Exhibición (Valor 44.70€ GRATIS)',
    ],
    knifeIds: ['krm-doppler-ruby', 'krm-doppler-sapphire', 'krm-doppler-emerald'],
  },
  {
    id: 'bundle-pro-esports',
    name: 'Pro Esports Legends Pack',
    tag: 'Pro Esports',
    tagline: 'Los dos acabados más laureados en la historia de los Majors, con fundas Kydex y StatTrak.',
    badge: 'Favorito Competitivo',
    bundlePrice: 89.9,
    extras: { kydex: true, statTrak: true },
    itemsIncluded: [
      'Karambit | Fade 100% (49.90€)',
      'Karambit | Lore Dragón (49.90€)',
      '2x Fundas Tácticas Kydex con Clip (Valor 11.80€ GRATIS)',
      'Contador StatTrak™ en ambas hojas incluido (Valor 13.80€ GRATIS)',
    ],
    knifeIds: ['krm-fade', 'krm-lore'],
  },
  {
    id: 'bundle-yin-yang',
    name: 'Yin & Yang Dual Pack',
    tag: 'Yin & Yang',
    tagline: 'La dualidad absoluta entre la oscuridad abisal de Black Pearl y la pureza del acero desnudo Vanilla.',
    badge: 'Edición Dual Limitada',
    bundlePrice: 89.9,
    extras: { stand: true },
    itemsIncluded: [
      'Karambit | Doppler Black Pearl (54.90€)',
      'Karambit | Vanilla ★ Acero Desnudo (39.90€)',
      '2x Soportes Acrílicos de Exhibición Oficiales (Valor 29.80€ GRATIS)',
    ],
    knifeIds: ['krm-doppler-black-pearl', 'krm-vanilla'],
  },
  {
    id: 'bundle-starter',
    name: 'Starter Collector Pack',
    tag: 'Starter',
    tagline: 'El set completo ideal para iniciar tu colección: Tiger Tooth, soporte, funda y placa metálica.',
    badge: 'Mejor Para Empezar',
    bundlePrice: 59.9,
    extras: { stand: true, kydex: true, nameTag: 'KRM.GG' },
    itemsIncluded: [
      '1x Karambit | Tiger Tooth (46.90€)',
      `1x Soporte de Exhibición Acrílico Oficial (${ADDON_PRICES.stand.toFixed(2)}€)`,
      `1x Funda Protectora Kydex Táctica (${ADDON_PRICES.kydex.toFixed(2)}€)`,
      `1x Placa Metálica NameTag grabada «KRM.GG» (${ADDON_PRICES.nameTag.toFixed(2)}€)`,
    ],
    knifeIds: ['krm-tiger-tooth'],
  },
];

/** Valor de los complementos de UNA pieza del pack a precio individual. */
export function extrasValue(extras: BundleExtras, product: Pick<Product, 'isOneOfOne'>): number {
  return roundMoney(
    (extras.stand ? ADDON_PRICES.stand : 0) +
      (extras.kydex && !isOneOfOne(product) ? ADDON_PRICES.kydex : 0) +
      (extras.statTrak ? ADDON_PRICES.statTrak : 0) +
      (extras.nameTag ? ADDON_PRICES.nameTag : 0)
  );
}

/**
 * Reparte `total` entre piezas en céntimos enteros, proporcional a `weights` (valor de catálogo).
 * El resto de céntimos va a la ÚLTIMA línea: la suma es exactamente `total`.
 */
export function splitBundlePrice(total: number, weights: readonly number[]): number[] {
  if (weights.length === 0) return [];
  const totalCents = Math.round(total * 100);
  const weightCents = weights.map((w) => Math.max(0, Math.round(w * 100)));
  const weightSum = weightCents.reduce((sum, w) => sum + w, 0);
  const parts =
    weightSum > 0
      ? weightCents.map((w) => Math.floor((totalCents * w) / weightSum))
      : weights.map(() => Math.floor(totalCents / weights.length));
  const remainder = totalCents - parts.reduce((sum, c) => sum + c, 0);
  parts[parts.length - 1] += remainder;
  return parts.map((cents) => cents / 100);
}

const isDev = (): boolean => {
  try {
    return import.meta.env?.DEV === true;
  } catch {
    return false;
  }
};

function buildBundles(): BundleDefinition[] {
  const bundles: BundleDefinition[] = [];
  const problems: string[] = [];

  for (const spec of SPECS) {
    const knives: Product[] = [];
    for (const id of spec.knifeIds) {
      const product = getProductById(id);
      if (product) knives.push(product);
      else problems.push(`[Packs] "${spec.id}": producto inexistente "${id}"`);
    }
    if (knives.length !== spec.knifeIds.length) continue;
    if (new Set(spec.knifeIds).size !== spec.knifeIds.length) {
      problems.push(`[Packs] "${spec.id}": piezas repetidas`);
      continue;
    }

    const originalPrice = roundMoney(
      knives.reduce((sum, k) => sum + k.basePrice + extrasValue(spec.extras, k), 0)
    );
    if (!(spec.bundlePrice > 0 && spec.bundlePrice < originalPrice)) {
      problems.push(
        `[Packs] "${spec.id}": el precio del pack (${spec.bundlePrice}) debe ser menor que la suma de piezas (${originalPrice})`
      );
      continue;
    }
    const savings = roundMoney(originalPrice - spec.bundlePrice);
    bundles.push({
      id: spec.id,
      name: spec.name,
      tag: spec.tag,
      tagline: spec.tagline,
      badge: spec.badge,
      bundlePrice: spec.bundlePrice,
      extras: spec.extras,
      itemsIncluded: spec.itemsIncluded,
      knives,
      originalPrice,
      savings,
      discountPercent: Math.round((savings / originalPrice) * 100),
      hasOneOfOne: knives.some((k) => isOneOfOne(k)),
    });
  }

  if (problems.length > 0) {
    if (isDev()) throw new Error(problems.join('\n'));
    problems.forEach((message) => console.error(message));
  }
  return bundles;
}

export const BUNDLES: readonly BundleDefinition[] = buildBundles();
