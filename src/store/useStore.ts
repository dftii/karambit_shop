import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../data/karambits';

// ─── Types ─────────────────────────────────────────────
export interface CartItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  gradient: string[];
  image?: string;
  type: 'karambit' | 'accessory' | 'bundle';
  condition?: 'Factory New' | 'Battle-Scarred';
  bladeType?: 'Sin Filo (Unsharpened)' | 'Afilada (Sharpened)' | 'Sin Filo (Tricks/Exhibición)' | 'Afilada' | string;
  statTrak?: boolean;
  statTrakCount?: number | string;
  nameTag?: string;
  standIncluded?: boolean;
  kydexIncluded?: boolean;
  visualFilter?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  gradient: string[];
  category?: string;
  rarity?: string;
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
  paymentMethod: 'credit_card' | 'bizum_apple_pay' | 'crypto' | 'steam_skins' | 'balance' | string;
  paymentDetails?: {
    cardLast4?: string;
    cardHolder?: string;
    cryptoTx?: string;
    cryptoCurrency?: string;
    skinsTraded?: string[];
    bizumPhone?: string;
  };
  serialNumbers: Record<string, string>;
  digitalCertificateId: string;
}

export interface OrderCheckoutDetails {
  collectorAlias?: string;
  email?: string;
  paymentMethod?: 'credit_card' | 'bizum_apple_pay' | 'crypto' | 'steam_skins' | 'balance' | string;
  discount?: number;
  coupon?: string;
  paymentDetails?: {
    cardLast4?: string;
    cardHolder?: string;
    cryptoTx?: string;
    cryptoCurrency?: string;
    skinsTraded?: string[];
    bizumPhone?: string;
  };
  serialNumbers?: Record<string, string>;
}

export interface ActiveCoupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  description: string;
}

interface StoreState {
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Coupons
  activeCoupon: ActiveCoupon | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  getDiscountAmount: () => number;
  getFinalTotal: () => number;

  // Legacy coupon helpers
  applyCoupon: (code: string) => number;
  appliedCoupons: string[];

  // Wishlist
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  placeOrder: (details?: OrderCheckoutDetails) => Order;
  getOrderById: (id: string) => Order | undefined;

  // Balance
  balance: number;
  addBalance: (amount: number) => void;

  // UI state
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setWishlistOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
}

// Available discount coupons
const KNOWN_COUPONS: Record<string, { type: 'percent' | 'fixed'; value: number; description: string }> = {
  KNIFY10: { type: 'percent', value: 10, description: '10% de descuento en todo tu arsenal' },
  CS2PRO: { type: 'percent', value: 15, description: '15% de descuento nivel Profesional CS2' },
  STATTRAKFREE: { type: 'fixed', value: 6.90, description: 'StatTrak™ GRATIS (-6.90€)' },
  KARAMBIT10: { type: 'percent', value: 10, description: '10% de descuento de bienvenida' },
  DOPPLER20: { type: 'percent', value: 20, description: '20% de descuento en réplicas Doppler' },
  FIRSTORDER: { type: 'percent', value: 15, description: '15% de descuento en tu primer pedido' },
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ── Cart ──────────────────────────────
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const itemKey = `${item.id}-${item.condition || ''}-${item.bladeType || ''}-${item.statTrak ? 'st' : ''}-${item.statTrakCount || ''}-${item.nameTag || ''}-${item.standIncluded ? 'stand' : ''}-${item.kydexIncluded ? 'kydex' : ''}`;
          const existingIndex = state.cart.findIndex(
            (i) =>
              `${i.id}-${i.condition || ''}-${i.bladeType || ''}-${i.statTrak ? 'st' : ''}-${i.statTrakCount || ''}-${i.nameTag || ''}-${i.standIncluded ? 'stand' : ''}-${i.kydexIncluded ? 'kydex' : ''}` === itemKey
          );

          if (existingIndex > -1) {
            const updated = [...state.cart];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + (item.quantity || 1),
            };
            return { cart: updated };
          }
          return { cart: [...state.cart, { ...item, quantity: item.quantity || 1 }] };
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((i) => i.id !== id)
              : state.cart.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ cart: [] }),

      getCartSubtotal: () =>
        get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getCartTotal: () => get().getCartSubtotal(),

      getCartCount: () =>
        get().cart.reduce((sum, i) => sum + i.quantity, 0),

      // ── Coupons ───────────────────────────
      activeCoupon: null,

      applyCouponCode: (code: string) => {
        const clean = code.trim().toUpperCase();
        if (!clean) {
          return { success: false, message: 'Ingresa un código de cupón' };
        }
        const coupon = KNOWN_COUPONS[clean];
        if (!coupon) {
          return { success: false, message: 'Cupón no válido o caducado' };
        }
        const active: ActiveCoupon = {
          code: clean,
          type: coupon.type,
          value: coupon.value,
          description: coupon.description,
        };
        set({ activeCoupon: active });
        return {
          success: true,
          message: `¡Cupón ${clean} aplicado con éxito! (${coupon.description})`,
        };
      },

      removeCoupon: () => set({ activeCoupon: null }),

      getDiscountAmount: () => {
        const { activeCoupon } = get();
        if (!activeCoupon) return 0;
        const subtotal = get().getCartSubtotal();
        if (activeCoupon.type === 'percent') {
          return Number(((subtotal * activeCoupon.value) / 100).toFixed(2));
        }
        return Math.min(subtotal, activeCoupon.value);
      },

      getFinalTotal: () => {
        const subtotal = get().getCartSubtotal();
        const discount = get().getDiscountAmount();
        return Math.max(0, Number((subtotal - discount).toFixed(2)));
      },

      // Legacy support
      appliedCoupons: [],
      applyCoupon: (code) => {
        const clean = code.trim().toUpperCase();
        const found = KNOWN_COUPONS[clean];
        if (found) {
          set({
            activeCoupon: {
              code: clean,
              type: found.type,
              value: found.value,
              description: found.description,
            },
            appliedCoupons: [clean],
          });
          return found.value;
        }
        return 0;
      },

      // ── Wishlist ──────────────────────────
      wishlist: [],
      addToWishlist: (item) =>
        set((state) => ({
          wishlist: [...state.wishlist, item],
        })),
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
      addOrder: (order: Order) => {
        set((state) => ({
          orders: [order, ...state.orders],
          cart: [],
          activeCoupon: null,
        }));
      },
      placeOrder: (details) => {
        const cart = get().cart;
        const subtotal = get().getCartSubtotal();
        const discountAmount = details?.discount ?? get().getDiscountAmount();
        const finalTotal = Math.max(0, subtotal - discountAmount);

        if (details?.paymentMethod === 'balance') {
          set((state) => ({ balance: Math.max(0, state.balance - finalTotal) }));
        }

        const serialNumbers: Record<string, string> = details?.serialNumbers || {};
        cart.forEach((item, index) => {
          const key = item.id || `item-${index}`;
          if (!serialNumbers[key]) {
            serialNumbers[key] = `SN-440C-${Math.floor(1000 + Math.random() * 9000)}`;
          }
        });

        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const newOrder: Order = {
          id: `KRM-2026-${randomSuffix}`,
          date: new Date().toISOString(),
          collectorAlias: details?.collectorAlias || 'GhostCS2',
          email: details?.email || 'collector@krm.gg',
          items: [...cart],
          subtotal,
          discount: discountAmount,
          couponApplied: details?.coupon || get().activeCoupon?.code,
          total: finalTotal,
          status: 'Verificado & Grabado',
          paymentMethod: details?.paymentMethod || 'credit_card',
          paymentDetails: details?.paymentDetails || { cardLast4: '8891' },
          serialNumbers,
          digitalCertificateId: `CERT-KRM-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
          cart: [],
          activeCoupon: null,
        }));

        return newOrder;
      },
      getOrderById: (id: string) => {
        return get().orders.find((o) => o.id === id);
      },

      // ── Balance ───────────────────────────
      balance: 150.0,
      addBalance: (amount) =>
        set((state) => ({ balance: state.balance + amount })),

      // ── UI ────────────────────────────────
      isCartOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      isWishlistOpen: false,
      setWishlistOpen: (open) => set({ isWishlistOpen: open }),
      isSearchOpen: false,
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      isCheckoutOpen: false,
      setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),
      selectedProductForModal: null,
      setSelectedProductForModal: (product) => set({ selectedProductForModal: product }),
    }),
    {
      name: 'krm-shop-storage',
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
