// ─── Líneas de carrito: tipos, clave estable (lineId) y constructores ────────
// Sin dependencias del store (el store importa de aquí).
import { getProductById, karambits, type Accessory, type Product } from '../data/karambits';
import { computeConfiguredPrice, normalizeOptions, type ProductOptions } from './pricing';
import { toast } from './toast';

export type CartItemType = 'karambit' | 'accessory' | 'bundle';

export interface CartItem {
  /** Clave estable de la línea: productId + configuración. Identifica la línea en el carrito y en pedidos. */
  lineId: string;
  /** Id de catálogo (siempre presente en cuchillos y bundles; id del accesorio en accesorios). */
  productId?: string;
  name: string;
  /** Precio por unidad. */
  price: number;
  quantity: number;
  gradient: string[];
  image?: string;
  type: CartItemType;
  condition?: 'Factory New' | 'Battle-Scarred';
  bladeType?: 'Sin Filo (Unsharpened)' | 'Afilada (Sharpened)' | 'Sin Filo (Tricks/Exhibición)' | 'Afilada' | string;
  statTrak?: boolean;
  statTrakCount?: number | string;
  nameTag?: string;
  standIncluded?: boolean;
  kydexIncluded?: boolean;
  visualFilter?: string;
  /** Distingue líneas con la misma configuración pero origen distinto (p. ej. 'mystery', 'pack:bundle-x'). */
  variant?: string;
}

/** Lo que reciben `addToCart` y los constructores: sin `lineId` (se calcula) y con `quantity` opcional. */
export type CartItemInput = Omit<CartItem, 'lineId' | 'quantity'> & { quantity?: number };

export type AddToCartResult =
  | { ok: true; message: string; lineId: string }
  | { ok: false; message: string };

const slug = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Clave determinista de línea: misma configuración => mismo lineId (las líneas se fusionan). */
export function computeLineId(
  item: Omit<CartItem, 'lineId' | 'quantity' | 'price' | 'name' | 'gradient'> & { name?: string }
): string {
  const parts = [
    item.type,
    item.productId ?? slug(item.name ?? 'item'),
    item.variant ?? '',
    item.condition ?? '',
    item.bladeType ? (item.bladeType.includes('Afilada') ? 'sharp' : 'blunt') : '',
    item.statTrak ? `st${String(item.statTrakCount ?? '').trim()}` : '',
    item.nameTag ? `nt:${item.nameTag.trim().toUpperCase()}` : '',
    item.standIncluded ? 'stand' : '',
    item.kydexIncluded ? 'kydex' : '',
  ];
  return parts.join('|');
}

// ─── Constructores ───────────────────────────────────────────────────────────
/** `Karambit | X` salvo que el nombre ya empiece por `Karambit` o `★`. */
export function getProductFullName(product: Pick<Product, 'name'>): string {
  return product.name.startsWith('Karambit') || product.name.startsWith('★')
    ? product.name
    : `Karambit | ${product.name}`;
}

export interface KnifeLineOptions extends ProductOptions {
  statTrakCount?: string | number;
  /** Texto de la placa NameTag; si está vacío no hay placa ni coste. */
  nameTagText?: string;
  /** Sustituye al nombre completo del producto. */
  name?: string;
  /** Sufijo del nombre (por defecto ` (StatTrak™)` si hay StatTrak). */
  nameSuffix?: string;
  /** Sustituye al precio calculado (bundles, premios de Mystery Box). */
  price?: number;
  type?: 'karambit' | 'bundle';
  variant?: string;
}

/**
 * Línea de carrito de un cuchillo con su configuración. El precio sale de `pricing.ts` y las
 * restricciones de las piezas 1-of-1 se aplican aquí (Factory New, sin filo, sin Kydex).
 */
export function buildKnifeCartItem(product: Product, options: KnifeLineOptions = {}): CartItemInput {
  const nameTagText = options.nameTag ? options.nameTagText?.trim().toUpperCase() : undefined;
  const hasNameTag = Boolean(nameTagText);
  const normalized = normalizeOptions(product, { ...options, nameTag: hasNameTag });
  const price =
    options.price ?? computeConfiguredPrice(product, { ...normalized, nameTag: hasNameTag });

  return {
    productId: product.id,
    name: `${options.name ?? getProductFullName(product)}${
      options.nameSuffix ?? (normalized.statTrak ? ' (StatTrak™)' : '')
    }`,
    price,
    quantity: 1,
    gradient: product.gradient,
    image: product.image,
    visualFilter: product.visualFilter,
    type: options.type ?? 'karambit',
    condition: normalized.condition,
    bladeType: normalized.bladeType,
    statTrak: normalized.statTrak,
    statTrakCount: normalized.statTrak ? String(options.statTrakCount ?? '') || '000' : undefined,
    nameTag: hasNameTag ? nameTagText : undefined,
    standIncluded: normalized.stand,
    kydexIncluded: normalized.kydex,
    variant: options.variant,
  };
}

export function buildAccessoryCartItem(accessory: Accessory): CartItemInput {
  return {
    productId: accessory.id,
    name: accessory.name,
    price: accessory.price,
    quantity: 1,
    gradient: accessory.gradient,
    type: 'accessory',
  };
}

// ─── Consulta de producto / imagen por productId ─────────────────────────────
export function findCartItemProduct(item: { productId?: string }): Product | undefined {
  return item.productId ? getProductById(item.productId) : undefined;
}

export function getCartItemImage(item: { productId?: string; image?: string }): string {
  return findCartItemProduct(item)?.image ?? item.image ?? karambits[0].image;
}

export function getCartItemFilter(item: { productId?: string; visualFilter?: string }): string | undefined {
  return item.visualFilter ?? findCartItemProduct(item)?.visualFilter;
}

/**
 * Feedback de `addToCart`: si el store lo rechaza muestra un toast de error (src/lib/toast.ts)
 * y devuelve `ok` para encadenar (`if (notifyCartResult(r)) setCartOpen(true)`).
 */
export function notifyCartResult(result: AddToCartResult): boolean {
  if (!result.ok) toast.error(result.message);
  return result.ok;
}
