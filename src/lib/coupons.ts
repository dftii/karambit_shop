// ─── Cupones: catálogo, elegibilidad por línea y descuento ───────────────────
// Puro (sin React ni store). Regla general: ningún cupón toca las piezas Founder Bespoke ni el
// Founder's Vault Luxury Pack; los porcentajes se calculan SOLO sobre el subtotal elegible.
import { getProductById } from '../data/karambits';
import { bundleVariant, FOUNDER_BUNDLE_ID } from './bundles';
import type { CartItem } from './cart';
import { ADDON_PRICES, roundMoney } from './pricing';

export interface ActiveCoupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  description: string;
}

/** Contexto externo al carrito que condiciona algunos cupones. */
export interface CouponContext {
  /** ¿El comprador ya tiene algún pedido? (FIRSTORDER solo vale sin pedidos previos). */
  hasOrders: boolean;
}

export const DEFAULT_COUPON_CONTEXT: CouponContext = { hasOrders: false };

interface CouponDef {
  type: 'percent' | 'fixed';
  value: number;
  description: string;
  /** Líneas (no Founder) a las que se aplica; sin definir = todas. */
  matches?: (line: CartItem) => boolean;
  /** Nota corta para la UI cuando el cupón solo cubre parte del carrito. */
  scopeNote?: string;
  /** Mensaje si el carrito no tiene ninguna línea que cumpla `matches` (cupón con alcance propio). */
  noMatchMessage?: string;
  /** Solo válido sin pedidos previos. */
  firstOrderOnly?: boolean;
}

const FIRST_ORDER_ONLY = 'Solo válido en tu primer pedido.';
const FOUNDER_EXCLUDED = 'No aplica a piezas Founder Bespoke ni al Founder\'s Vault Pack.';

const isPackLine = (line: CartItem): boolean => Boolean(line.variant?.startsWith('pack:'));

export const COUPONS: Record<string, CouponDef> = {
  KNIFY10: { type: 'percent', value: 10, description: '10% de descuento en todo tu arsenal' },
  CS2PRO: { type: 'percent', value: 15, description: '15% de descuento nivel Profesional CS2' },
  STATTRAKFREE: {
    type: 'fixed',
    value: ADDON_PRICES.statTrak,
    description: `StatTrak™ GRATIS (-${ADDON_PRICES.statTrak.toFixed(2)}€)`,
    // Descuenta UN contador: solo si hay líneas con StatTrak™ (los packs ya lo traen incluido).
    matches: (line) => line.statTrak === true && !isPackLine(line),
    scopeNote: 'Solo líneas con StatTrak™ (los packs ya lo incluyen).',
    noMatchMessage: 'Necesitas una pieza con StatTrak™ en el carrito para usar este cupón.',
  },
  DOPPLER20: {
    type: 'percent',
    value: 20,
    description: '20% de descuento en réplicas Doppler',
    matches: (line) => getProductById(line.productId ?? '')?.category === 'Doppler Series',
    scopeNote: 'Solo réplicas Doppler y Gamma Doppler.',
    noMatchMessage: 'Este cupón solo vale para réplicas Doppler o Gamma Doppler y no hay ninguna en el carrito.',
  },
  FIRSTORDER: {
    type: 'percent',
    value: 15,
    description: '15% de descuento en tu primer pedido',
    firstOrderOnly: true,
  },
};

/** Cupón activo normalizado (con los datos actuales del catálogo) o null si el código no existe. */
export function resolveCoupon(code: string): ActiveCoupon | null {
  const clean = code.trim().toUpperCase();
  const def = clean ? COUPONS[clean] : undefined;
  return def ? { code: clean, type: def.type, value: def.value, description: def.description } : null;
}

// ─── Elegibilidad ────────────────────────────────────────────────────────────
/** Piezas Founder Bespoke y líneas del Founder's Vault Pack: ningún cupón las toca. */
export function isCouponExcluded(line: CartItem): boolean {
  const product = line.productId ? getProductById(line.productId) : undefined;
  return (
    product?.isOneOfOne === true ||
    product?.collection === 'founder-bespoke' ||
    line.variant === bundleVariant(FOUNDER_BUNDLE_ID)
  );
}

/** Líneas del carrito sobre las que el cupón calcula el descuento. */
export function eligibleLines(cart: CartItem[], coupon: Pick<ActiveCoupon, 'code'>): CartItem[] {
  const def = COUPONS[coupon.code];
  return cart.filter((line) => !isCouponExcluded(line) && (def?.matches?.(line) ?? true));
}

/** Subtotal sobre el que se calcula el descuento (0 si el cupón no puede usarse en este contexto). */
export function eligibleSubtotal(
  cart: CartItem[],
  coupon: Pick<ActiveCoupon, 'code'>,
  ctx: CouponContext = DEFAULT_COUPON_CONTEXT
): number {
  if (COUPONS[coupon.code]?.firstOrderOnly && ctx.hasOrders) return 0;
  return roundMoney(eligibleLines(cart, coupon).reduce((sum, line) => sum + line.price * line.quantity, 0));
}

/** Descuento en € de un cupón sobre un carrito (nunca supera el subtotal elegible). */
export function computeCouponDiscount(
  cart: CartItem[],
  coupon: ActiveCoupon | null,
  ctx: CouponContext = DEFAULT_COUPON_CONTEXT
): number {
  if (!coupon) return 0;
  const base = eligibleSubtotal(cart, coupon, ctx);
  if (base <= 0) return 0;
  return coupon.type === 'percent' ? roundMoney((base * coupon.value) / 100) : Math.min(base, coupon.value);
}

// ─── Validación al aplicar ───────────────────────────────────────────────────
export type CouponCheck = { ok: true; coupon: ActiveCoupon } | { ok: false; message: string };

/** ¿Se puede aplicar este código ahora? Un cupón sin efecto posible se rechaza con un mensaje claro. */
export function checkCoupon(cart: CartItem[], code: string, ctx: CouponContext = DEFAULT_COUPON_CONTEXT): CouponCheck {
  const coupon = resolveCoupon(code);
  if (!coupon) return { ok: false, message: 'Cupón no válido o caducado' };
  const def = COUPONS[coupon.code];
  if (def.firstOrderOnly && ctx.hasOrders) return { ok: false, message: FIRST_ORDER_ONLY };
  // Carrito vacío: los cupones generales se pueden guardar antes de comprar; los de alcance propio, no.
  const needsLines = cart.length > 0 || def.matches !== undefined;
  if (needsLines && eligibleLines(cart, coupon).length === 0) {
    return { ok: false, message: def.noMatchMessage ?? FOUNDER_EXCLUDED };
  }
  return { ok: true, coupon };
}

/** Cupón persistido válido para el contexto (código conocido y, si es de primer pedido, sin pedidos), o null. */
export function sanitizeActiveCoupon(raw: unknown, ctx: CouponContext): ActiveCoupon | null {
  const code = typeof raw === 'object' && raw !== null ? (raw as { code?: unknown }).code : undefined;
  const coupon = typeof code === 'string' ? resolveCoupon(code) : null;
  if (!coupon) return null;
  return COUPONS[coupon.code].firstOrderOnly && ctx.hasOrders ? null : coupon;
}

// ─── Avisos para la UI ───────────────────────────────────────────────────────
/**
 * Texto breve para el cupón activo cuando no cubre todo el carrito (o nada): "No aplica a piezas Founder",
 * "Solo réplicas Doppler...", etc. `null` si no hay nada que avisar.
 */
export function getCouponNotice(
  cart: CartItem[],
  coupon: ActiveCoupon | null,
  ctx: CouponContext = DEFAULT_COUPON_CONTEXT
): string | null {
  if (!coupon || cart.length === 0) return null;
  const def = COUPONS[coupon.code];
  if (def?.firstOrderOnly && ctx.hasOrders) return FIRST_ORDER_ONLY;

  const eligible = eligibleLines(cart, coupon);
  if (eligible.length === 0) {
    return `Sin efecto en este carrito. ${def?.noMatchMessage ?? FOUNDER_EXCLUDED}`;
  }
  const notes: string[] = [];
  if (cart.some(isCouponExcluded)) notes.push('No aplica a piezas Founder.');
  if (def?.scopeNote && cart.some((line) => !isCouponExcluded(line) && !def.matches?.(line))) {
    notes.push(def.scopeNote);
  }
  return notes.length > 0 ? notes.join(' ') : null;
}
