/**
 * KRM.GG store (zustand + persist 'krm-shop-storage', versión 3).
 *
 * API pública
 * ───────────
 * Lib relacionada:
 *   src/lib/pricing.ts  getConditionPrice(product, condition) · ADDON_PRICES · computeConfiguredPrice(product, options)
 *                       normalizeOptions · getRestrictions · isOneOfOne  (única fuente de precios/reglas)
 *   src/lib/cart.ts     CartItem · CartItemInput · computeLineId · buildKnifeCartItem(product, opts) ·
 *                       buildAccessoryCartItem(acc) · getCartItemImage/Filter · notifyCartResult(result)
 *   src/lib/ids.ts      generateOrderId · generateSerialNumber · generateCertificateId · serialKey · getLineSerials
 *
 * Carrito (las líneas se identifican por `lineId` = productId + configuración; configuraciones idénticas se fusionan)
 *   cart: CartItem[]
 *   addToCart(item: CartItemInput): AddToCartResult   -> { ok, message, lineId? }. Nunca lanza.
 *   canAddToCart(item): AddToCartResult                -> igual que addToCart pero sin modificar el estado.
 *   removeFromCart(lineId) · updateQuantity(lineId, qty) (qty <= 0 elimina; máx. MAX_LINE_QUANTITY por línea) · clearCart()
 *   Piezas 1-of-1 (Product.isOneOfOne): cantidad siempre 1, se rechaza una segunda unidad (en carrito o ya
 *   adquirida en pedidos) y se fuerzan Factory New / sin filo / sin Kydex.
 *
 * Derivados (usar los hooks; no hay getters que lean get() en render):
 *   computeCartTotals(cart, coupon, ctx?) -> { subtotal, discount, total, count }   (función pura)
 *   useCartTotals() / useCartCount() / useCouponNotice()                            (hooks con selector estable)
 *
 * Cupones (reglas y elegibilidad en src/lib/coupons.ts): activeCoupon · applyCouponCode(code) -> { success, message } ·
 *   removeCoupon(). Ninguno aplica a piezas Founder Bespoke ni al Founder's Vault Pack; el descuento se calcula solo
 *   sobre el subtotal elegible. Un cupón sin efecto posible (p. ej. DOPPLER20 sin Doppler) se rechaza al aplicarlo.
 *
 * Varias pestañas: un listener `storage` rehidrata el store cuando otra pestaña escribe (evita comprar dos veces una
 * pieza 1-of-1); `placeOrder` rehidrata también justo antes de validar.
 *
 * Pedidos (ÚNICO camino de creación)
 *   placeOrder(details?) -> { ok: true, order } | { ok: false, error }
 *   Vacía carrito y cupón, genera ids/seriales/certificado únicos, cobra saldo si paymentMethod === 'balance'
 *   y falla (sin tocar nada) si el saldo no alcanza. Seriales por unidad: Order.serialNumbers[serialKey(lineId, n)].
 *   orders · getOrderById(id)
 *   isOwned(productId) / isProductOwned(orders, productId) / useIsOwned(productId): ¿ya está en algún pedido?
 *
 * Saldo virtual: balance · addBalance(amount) · spendBalance(amount): boolean (false si no alcanza)
 *
 * Wishlist y estado de UI: ver `StoreState`. `isInWishlist`/`isOwned` (métodos) no son reactivos: en render usar
 *   useIsInWishlist(id) / useIsOwned(productId). Consumir siempre con selector:
 *   useStore((s) => s.cart)  ·  useStore(useShallow((s) => ({ a: s.a, b: s.b })))
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { getProductById, karambits, type Product } from '../data/karambits';
import {
  computeLineId,
  MAX_LINE_QUANTITY,
  type AddToCartResult,
  type CartItem,
  type CartItemInput,
} from '../lib/cart';
import {
  generateCertificateId,
  generateOrderId,
  generateSerialNumber,
  serialKey,
} from '../lib/ids';
import {
  checkCoupon,
  computeCouponDiscount,
  DEFAULT_COUPON_CONTEXT,
  getCouponNotice,
  sanitizeActiveCoupon,
  type ActiveCoupon,
  type CouponContext,
} from '../lib/coupons';
import { isOneOfOne, roundMoney } from '../lib/pricing';

export type { CartItem, CartItemInput, AddToCartResult } from '../lib/cart';
export type { ActiveCoupon, CouponContext } from '../lib/coupons';

// ─── Types ─────────────────────────────────────────────
export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  gradient: string[];
  category?: string;
  rarity?: string;
}

export type PaymentMethod = 'credit_card' | 'bizum_apple_pay' | 'crypto' | 'steam_skins' | 'balance' | string;

export interface PaymentDetails {
  cardLast4?: string;
  cardHolder?: string;
  cryptoTx?: string;
  cryptoCurrency?: string;
  skinsTraded?: string[];
  bizumPhone?: string;
  cardBrand?: string;
  wallet?: string;
  cryptoAmount?: string;
  skinsValue?: number;
  balancePaid?: number;
}

export interface Order {
  id: string;
  date: string;
  collectorAlias: string;
  email: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponApplied?: string;
  total: number;
  status: 'Verificado & Grabado' | 'Confirmado' | 'En Preparación' | 'Completado';
  paymentMethod: PaymentMethod;
  paymentDetails?: PaymentDetails;
  /** Un serial por unidad: clave `serialKey(lineId, n)` (n desde 1). */
  serialNumbers: Record<string, string>;
  digitalCertificateId: string;
}

export interface OrderCheckoutDetails {
  collectorAlias?: string;
  email?: string;
  paymentMethod?: PaymentMethod;
  paymentDetails?: PaymentDetails;
}

export type PlaceOrderResult = { ok: true; order: Order } | { ok: false; error: string };

export interface CartTotals {
  subtotal: number;
  discount: number;
  total: number;
  count: number;
}

interface StoreState {
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItemInput) => AddToCartResult;
  canAddToCart: (item: CartItemInput) => AddToCartResult;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;

  // Coupons
  activeCoupon: ActiveCoupon | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;

  // Orders
  orders: Order[];
  placeOrder: (details?: OrderCheckoutDetails) => PlaceOrderResult;
  getOrderById: (id: string) => Order | undefined;
  isOwned: (productId: string) => boolean;

  // Balance
  balance: number;
  addBalance: (amount: number) => void;
  spendBalance: (amount: number) => boolean;

  // UI state
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setWishlistOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
}

// ─── Constantes ────────────────────────────────────────
const STORE_NAME = 'krm-shop-storage';
const STORE_VERSION = 3;
/** Variante de línea de la Mystery Box retirada: sus líneas persistidas se descartan al migrar. */
const REMOVED_CART_VARIANTS = new Set(['mystery']);
const INITIAL_BALANCE = 150.0;

/** Contexto de cupones derivado de los pedidos (FIRSTORDER solo vale sin pedidos previos). */
const couponContext = (orders: Order[]): CouponContext => ({ hasOrders: orders.length > 0 });

// ─── Funciones puras ───────────────────────────────────
/**
 * Subtotal, descuento, total y nº de unidades de un carrito + cupón. El descuento solo cuenta las líneas elegibles
 * del cupón (lib/coupons.ts); `ctx` indica si ya hay pedidos (FIRSTORDER).
 */
export function computeCartTotals(
  cart: CartItem[],
  coupon: ActiveCoupon | null,
  ctx: CouponContext = DEFAULT_COUPON_CONTEXT
): CartTotals {
  const subtotal = roundMoney(cart.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const discount = Math.min(subtotal, computeCouponDiscount(cart, coupon, ctx));
  return { subtotal, discount, total: Math.max(0, roundMoney(subtotal - discount)), count };
}

/** ¿Algún pedido contiene ya este producto? (para piezas 1-of-1: "Adquirida / En tu colección"). */
export function isProductOwned(orders: Order[], productId: string): boolean {
  return orders.some((order) => order.items.some((item) => item.productId === productId));
}

const ONE_OF_ONE_OWNED = 'Esta pieza 1-of-1 ya forma parte de tu colección.';
const ONE_OF_ONE_CONFIG =
  'Las piezas 1 de 1 solo se entregan en Factory New, sin filo real y sin funda Kydex.';
const ONE_OF_ONE_IN_CART = 'Esta pieza 1-of-1 ya está en tu arsenal: solo existe una unidad.';
const MAX_QUANTITY_REACHED = `Máximo ${MAX_LINE_QUANTITY} unidades por línea.`;

/** Valida y normaliza una línea nueva contra el estado actual. No modifica nada. */
function prepareLine(
  state: Pick<StoreState, 'cart' | 'orders'>,
  input: CartItemInput
): { ok: true; line: CartItem; merge: boolean } | { ok: false; message: string } {
  if (!input || typeof input.name !== 'string' || !Number.isFinite(input.price) || input.price < 0) {
    return { ok: false, message: 'Artículo no válido.' };
  }
  const quantity = Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.floor(input.quantity ?? 1) || 1));
  const product = input.productId ? getProductById(input.productId) : undefined;
  let draft: CartItemInput = { ...input, quantity };

  if (product && isOneOfOne(product)) {
    if (isProductOwned(state.orders, product.id)) return { ok: false, message: ONE_OF_ONE_OWNED };
    if (state.cart.some((line) => line.productId === product.id)) {
      return { ok: false, message: ONE_OF_ONE_IN_CART };
    }
    const sharpened = typeof input.bladeType === 'string' && input.bladeType.includes('Afilada');
    if (input.condition === 'Battle-Scarred' || sharpened || input.kydexIncluded) {
      return { ok: false, message: ONE_OF_ONE_CONFIG };
    }
    draft = { ...draft, quantity: 1 };
  }

  const lineId = computeLineId(draft);
  const existing = state.cart.find((line) => line.lineId === lineId);
  if (existing && existing.quantity >= MAX_LINE_QUANTITY) return { ok: false, message: MAX_QUANTITY_REACHED };
  const { quantity: finalQuantity = 1, ...rest } = draft;
  return {
    ok: true,
    merge: Boolean(existing),
    line: {
      ...rest,
      lineId,
      quantity: Math.min(MAX_LINE_QUANTITY, existing ? existing.quantity + finalQuantity : finalQuantity),
    },
  };
}

// ─── Migración de datos persistidos ────────────────────
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

/** Deduce el productId de un item antiguo (sin productId) a partir de su `id` o su nombre. */
function legacyProductId(raw: Record<string, unknown>): string | undefined {
  const explicit = asString(raw.productId);
  if (explicit && getProductById(explicit)) return explicit;
  const legacyId = asString(raw.id);
  if (!legacyId) return undefined;
  if (raw.type === 'accessory') return legacyId;
  // El id antiguo era `${productId}-...`: gana el prefijo más largo (krm-gamma-doppler-phase1 vs krm-gamma-doppler).
  let best: string | undefined;
  for (const { id } of karambits) {
    if ((legacyId === id || legacyId.startsWith(`${id}-`)) && (!best || id.length > best.length)) best = id;
  }
  return best;
}

function sanitizeLine(raw: unknown): CartItem | null {
  if (!isRecord(raw)) return null;
  const name = asString(raw.name);
  const price = typeof raw.price === 'number' && Number.isFinite(raw.price) && raw.price >= 0 ? raw.price : undefined;
  if (!name || price === undefined) return null;

  const type = raw.type === 'accessory' || raw.type === 'bundle' ? raw.type : 'karambit';
  const productId = legacyProductId(raw);
  const quantity =
    typeof raw.quantity === 'number' && Number.isFinite(raw.quantity) && raw.quantity >= 1
      ? Math.min(MAX_LINE_QUANTITY, Math.floor(raw.quantity))
      : 1;

  const base: Omit<CartItem, 'lineId'> = {
    productId,
    name,
    price,
    quantity: isOneOfOne(productId ? getProductById(productId) : undefined) ? 1 : quantity,
    gradient: Array.isArray(raw.gradient) ? raw.gradient.filter((c): c is string => typeof c === 'string') : [],
    image: asString(raw.image),
    type,
    condition: raw.condition === 'Battle-Scarred' ? 'Battle-Scarred' : raw.condition === 'Factory New' ? 'Factory New' : undefined,
    bladeType: asString(raw.bladeType),
    statTrak: raw.statTrak === true ? true : undefined,
    statTrakCount:
      typeof raw.statTrakCount === 'string' || typeof raw.statTrakCount === 'number' ? raw.statTrakCount : undefined,
    nameTag: asString(raw.nameTag),
    standIncluded: raw.standIncluded === true ? true : undefined,
    kydexIncluded: raw.kydexIncluded === true ? true : undefined,
    visualFilter: asString(raw.visualFilter),
    variant: asString(raw.variant),
  };
  return { ...base, lineId: asString(raw.lineId) ?? computeLineId(base) };
}

function sanitizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, CartItem>();
  for (const entry of raw) {
    const line = sanitizeLine(entry);
    if (!line) continue;
    if (line.variant && REMOVED_CART_VARIANTS.has(line.variant)) continue;
    const existing = merged.get(line.lineId);
    if (existing) {
      const single = isOneOfOne(line.productId ? getProductById(line.productId) : undefined);
      merged.set(line.lineId, {
        ...existing,
        quantity: single ? 1 : Math.min(MAX_LINE_QUANTITY, existing.quantity + line.quantity),
      });
    } else {
      merged.set(line.lineId, line);
    }
  }
  return [...merged.values()];
}

function sanitizeWishlist(raw: unknown): WishlistItem[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: WishlistItem[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) continue;
    const id = asString(entry.id);
    const name = asString(entry.name);
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      name,
      price: typeof entry.price === 'number' && Number.isFinite(entry.price) ? entry.price : 0,
      gradient: Array.isArray(entry.gradient) ? entry.gradient.filter((c): c is string => typeof c === 'string') : [],
      category: asString(entry.category),
      rarity: asString(entry.rarity),
    });
  }
  return out;
}

function sanitizeOrders(raw: unknown): Order[] {
  if (!Array.isArray(raw)) return [];
  const takenSerials = new Set<string>();
  const out: Order[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) continue;
    const id = asString(entry.id);
    if (!id || !Array.isArray(entry.items)) continue;

    const legacySerials = isRecord(entry.serialNumbers) ? entry.serialNumbers : {};
    const serialNumbers: Record<string, string> = {};
    const usedLineIds = new Set<string>();
    const items: CartItem[] = [];

    entry.items.forEach((rawItem, index) => {
      const line = sanitizeLine(rawItem);
      if (!line) return;
      // Líneas antiguas distintas que ahora comparten lineId: se conservan separadas con sufijo.
      let lineId = line.lineId;
      for (let n = 2; usedLineIds.has(lineId); n += 1) lineId = `${line.lineId}~${n}`;
      usedLineIds.add(lineId);
      const item = { ...line, lineId };
      items.push(item);

      const legacyKey = isRecord(rawItem) ? asString(rawItem.id) ?? `item-${index}` : `item-${index}`;
      for (let unit = 1; unit <= item.quantity; unit += 1) {
        const key = serialKey(lineId, unit);
        const existing = asString(legacySerials[key]) ?? (unit === 1 ? asString(legacySerials[legacyKey]) : undefined);
        const serial = existing ?? generateSerialNumber((s) => takenSerials.has(s));
        takenSerials.add(serial);
        serialNumbers[key] = serial;
      }
    });

    const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
    out.push({
      id,
      date: asString(entry.date) ?? new Date(0).toISOString(),
      collectorAlias: asString(entry.collectorAlias) ?? 'GhostCS2',
      email: asString(entry.email) ?? 'collector@krm.gg',
      items,
      subtotal: num(entry.subtotal),
      discount: num(entry.discount),
      couponApplied: asString(entry.couponApplied),
      total: num(entry.total),
      status: (asString(entry.status) as Order['status'] | undefined) ?? 'Verificado & Grabado',
      paymentMethod: asString(entry.paymentMethod) ?? 'credit_card',
      paymentDetails: isRecord(entry.paymentDetails) ? (entry.paymentDetails as PaymentDetails) : undefined,
      serialNumbers,
      digitalCertificateId: asString(entry.digitalCertificateId) ?? `CERT-${id}`,
    });
  }
  return out;
}

/** Migra/limpia lo persistido (versiones anteriores sin `version`, items sin lineId, cupones legacy). */
function migratePersistedState(persisted: unknown): Partial<StoreState> {
  if (!isRecord(persisted)) return {};
  try {
    const orders = sanitizeOrders(persisted.orders);
    return {
      cart: sanitizeCart(persisted.cart),
      wishlist: sanitizeWishlist(persisted.wishlist),
      orders,
      balance:
        typeof persisted.balance === 'number' && Number.isFinite(persisted.balance) && persisted.balance >= 0
          ? persisted.balance
          : INITIAL_BALANCE,
      // Descarta cupones retirados (KARAMBIT10...) y FIRSTORDER si ya hay pedidos.
      activeCoupon: sanitizeActiveCoupon(persisted.activeCoupon, couponContext(orders)),
    };
  } catch {
    // Datos irrecuperables: se descartan y se parte del estado inicial.
    return {};
  }
}

// ─── Store ─────────────────────────────────────────────
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ── Cart ──────────────────────────────
      cart: [],

      canAddToCart: (item) => {
        const prepared = prepareLine(get(), item);
        return prepared.ok
          ? { ok: true, message: 'Añadido al arsenal.', lineId: prepared.line.lineId }
          : { ok: false, message: prepared.message };
      },

      addToCart: (item) => {
        const prepared = prepareLine(get(), item);
        if (!prepared.ok) return { ok: false, message: prepared.message };
        const { line, merge } = prepared;
        set((state) => ({
          cart: merge
            ? state.cart.map((l) => (l.lineId === line.lineId ? { ...l, quantity: line.quantity } : l))
            : [...state.cart, line],
        }));
        return { ok: true, message: 'Añadido al arsenal.', lineId: line.lineId };
      },

      removeFromCart: (lineId) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.lineId !== lineId),
        })),

      updateQuantity: (lineId, quantity) =>
        set((state) => {
          if (!Number.isFinite(quantity)) return state;
          const next = Math.floor(quantity);
          if (next <= 0) return { cart: state.cart.filter((i) => i.lineId !== lineId) };
          return {
            cart: state.cart.map((i) => {
              if (i.lineId !== lineId) return i;
              const single = isOneOfOne(i.productId ? getProductById(i.productId) : undefined);
              return { ...i, quantity: single ? 1 : Math.min(MAX_LINE_QUANTITY, next) };
            }),
          };
        }),

      clearCart: () => set({ cart: [] }),

      // ── Coupons ───────────────────────────
      activeCoupon: null,

      applyCouponCode: (code: string) => {
        if (!code.trim()) {
          return { success: false, message: 'Ingresa un código de cupón' };
        }
        const { cart, orders } = get();
        const check = checkCoupon(cart, code, couponContext(orders));
        if (!check.ok) return { success: false, message: check.message };
        set({ activeCoupon: check.coupon });
        return {
          success: true,
          message: `¡Cupón ${check.coupon.code} aplicado con éxito! (${check.coupon.description})`,
        };
      },

      removeCoupon: () => set({ activeCoupon: null }),

      // ── Wishlist ──────────────────────────
      wishlist: [],
      addToWishlist: (item) =>
        set((state) =>
          state.wishlist.some((i) => i.id === item.id) ? state : { wishlist: [...state.wishlist, item] }
        ),
      removeFromWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.filter((i) => i.id !== id),
        })),
      clearWishlist: () => set({ wishlist: [] }),
      isInWishlist: (id) => get().wishlist.some((i) => i.id === id),
      toggleWishlist: (item) => {
        const { isInWishlist, addToWishlist, removeFromWishlist } = get();
        if (isInWishlist(item.id)) {
          removeFromWishlist(item.id);
        } else {
          addToWishlist(item);
        }
      },

      // ── Orders ────────────────────────────
      orders: [],
      placeOrder: (details = {}) => {
        // Otra pestaña puede haber cambiado carrito/pedidos/cupón: se valida sobre el estado persistido más reciente.
        void useStore.persist.rehydrate();
        const { cart, activeCoupon, orders, balance } = get();
        if (cart.length === 0) return { ok: false, error: 'Tu arsenal está vacío.' };

        // Revalida las piezas 1-of-1 (adquiridas entre tanto o duplicadas por datos antiguos).
        const seenUnique = new Set<string>();
        for (const line of cart) {
          const product = line.productId ? getProductById(line.productId) : undefined;
          if (!product || !isOneOfOne(product)) continue;
          if (isProductOwned(orders, product.id)) return { ok: false, error: ONE_OF_ONE_OWNED };
          if (seenUnique.has(product.id) || line.quantity > 1) return { ok: false, error: ONE_OF_ONE_IN_CART };
          seenUnique.add(product.id);
        }

        const totals = computeCartTotals(cart, activeCoupon, couponContext(orders));
        const paymentMethod = details.paymentMethod ?? 'credit_card';
        if (paymentMethod === 'balance' && balance + 0.001 < totals.total) {
          return {
            ok: false,
            error: `Saldo insuficiente: necesitas ${totals.total.toFixed(2)}€ y tienes ${balance.toFixed(2)}€.`,
          };
        }

        // Seriales únicos por unidad (clave: lineId#unidad), sin mutar `details`.
        const taken = new Set<string>(orders.flatMap((o) => Object.values(o.serialNumbers)));
        const serialNumbers: Record<string, string> = {};
        for (const line of cart) {
          for (let unit = 1; unit <= line.quantity; unit += 1) {
            const serial = generateSerialNumber((s) => taken.has(s));
            taken.add(serial);
            serialNumbers[serialKey(line.lineId, unit)] = serial;
          }
        }

        const existingIds = new Set(orders.map((o) => o.id));
        const order: Order = {
          id: generateOrderId((id) => existingIds.has(id)),
          date: new Date().toISOString(),
          collectorAlias: details.collectorAlias?.trim() || 'GhostCS2',
          email: details.email?.trim() || 'collector@krm.gg',
          items: cart.map((line) => ({ ...line })),
          subtotal: totals.subtotal,
          discount: totals.discount,
          couponApplied: totals.discount > 0 ? activeCoupon?.code : undefined,
          total: totals.total,
          status: 'Verificado & Grabado',
          paymentMethod,
          paymentDetails: details.paymentDetails ?? {},
          serialNumbers,
          digitalCertificateId: generateCertificateId(),
        };

        set((state) => ({
          orders: [order, ...state.orders],
          cart: [],
          activeCoupon: null,
          balance:
            paymentMethod === 'balance'
              ? Math.max(0, roundMoney(state.balance - totals.total))
              : state.balance,
        }));

        return { ok: true, order };
      },
      getOrderById: (id: string) => get().orders.find((o) => o.id === id),
      isOwned: (productId) => isProductOwned(get().orders, productId),

      // ── Balance ───────────────────────────
      balance: INITIAL_BALANCE,
      addBalance: (amount) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        set((state) => ({ balance: roundMoney(state.balance + amount) }));
      },
      spendBalance: (amount) => {
        if (!Number.isFinite(amount) || amount < 0) return false;
        if (get().balance + 0.001 < amount) return false;
        set((state) => ({ balance: Math.max(0, roundMoney(state.balance - amount)) }));
        return true;
      },

      // ── UI ────────────────────────────────
      isCartOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      isWishlistOpen: false,
      setWishlistOpen: (open) => set({ isWishlistOpen: open }),
      isSearchOpen: false,
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      selectedProductForModal: null,
      setSelectedProductForModal: (product) => set({ selectedProductForModal: product }),
    }),
    {
      name: STORE_NAME,
      version: STORE_VERSION,
      migrate: (persisted) => migratePersistedState(persisted) as StoreState,
      // Sanea siempre lo persistido (también con la versión actual: localStorage puede estar corrupto o editado)
      // y revalida el cupón (código retirado, o FIRSTORDER con pedidos): vale para la carga inicial y para las
      // rehidrataciones desde otra pestaña.
      merge: (persisted, current) => {
        const merged = { ...current, ...migratePersistedState(persisted) };
        return { ...merged, activeCoupon: sanitizeActiveCoupon(merged.activeCoupon, couponContext(merged.orders)) };
      },
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        orders: state.orders,
        balance: state.balance,
        activeCoupon: state.activeCoupon,
      }),
    }
  )
);

// ─── Hooks de selección (re-render solo cuando cambia el valor derivado) ───
export const useCartTotals = (): CartTotals =>
  useStore(useShallow((s) => computeCartTotals(s.cart, s.activeCoupon, couponContext(s.orders))));

/** Aviso sobre el alcance del cupón activo ("No aplica a piezas Founder", "Sin efecto...") o null. */
export const useCouponNotice = (): string | null =>
  useStore((s) => getCouponNotice(s.cart, s.activeCoupon, couponContext(s.orders)));

export const useCartCount = (): number =>
  useStore((s) => s.cart.reduce((sum, i) => sum + i.quantity, 0));

export const useIsInWishlist = (id: string | undefined): boolean =>
  useStore((s) => (id ? s.wishlist.some((i) => i.id === id) : false));

export const useIsOwned = (productId: string | undefined): boolean =>
  useStore((s) => (productId ? isProductOwned(s.orders, productId) : false));

// ─── Sincronización entre pestañas ─────────────────────────
// `storage` solo se dispara en las OTRAS pestañas: al cambiar la clave del persist se rehidrata, de modo que un
// pedido hecho en una pestaña vacía el carrito de la otra y marca las piezas 1-of-1 como adquiridas.
if (typeof window !== 'undefined') {
  const syncFromOtherTab = (event: StorageEvent) => {
    if (event.key !== STORE_NAME || event.newValue === null) return;
    void useStore.persist.rehydrate();
  };
  window.addEventListener('storage', syncFromOtherTab);
  import.meta.hot?.dispose(() => window.removeEventListener('storage', syncFromOtherTab));
}
