// ─── Fuente única de precios y reglas de configuración ───────────────────────
// Funciones puras: ningún componente debe calcular precios con multiplicadores
// ni constantes propias. Precios de complementos derivados de `accessories`
// (StatTrak™ no tiene entrada de accesorio y se define aquí).
import { accessories, type Product } from '../data/karambits';

export type Condition = 'Factory New' | 'Battle-Scarred';
export type BladeChoice = 'Sin Filo (Unsharpened)' | 'Afilada (Sharpened)';

export const DEFAULT_CONDITION: Condition = 'Factory New';
export const DEFAULT_BLADE: BladeChoice = 'Sin Filo (Unsharpened)';

/** Redondeo monetario a 2 decimales. */
export const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

function accessoryPrice(id: string): number {
  const accessory = accessories.find((a) => a.id === id);
  if (!accessory) throw new Error(`Accesorio "${id}" no encontrado en src/data/karambits.ts`);
  return accessory.price;
}

/** Contador StatTrak™ grabado: no existe como accesorio, se define aquí. */
export const STATTRAK_PRICE = 6.9;

export const ADDON_PRICES = {
  statTrak: STATTRAK_PRICE,
  nameTag: accessoryPrice('acc-nametag-kit'),
  stand: accessoryPrice('acc-soporte-acrilico'),
  kydex: accessoryPrice('acc-funda-kydex'),
} as const;

// ─── Piezas 1-of-1 ────────────────────────────────────────────────────────────
export const isOneOfOne = (product: Pick<Product, 'isOneOfOne'> | undefined | null): boolean =>
  product?.isOneOfOne === true;

export interface ProductRestrictions {
  /** Estados de desgaste disponibles. */
  conditions: readonly Condition[];
  /** ¿Se puede pedir con filo real? */
  allowSharpened: boolean;
  /** ¿Se puede añadir funda Kydex? */
  allowKydex: boolean;
  /** Solo una unidad (nunca cantidad > 1). */
  singleUnit: boolean;
}

/** Restricciones de configuración (las piezas 1-of-1 solo admiten Factory New, sin filo y sin Kydex). */
export function getRestrictions(product: Pick<Product, 'isOneOfOne'>): ProductRestrictions {
  if (isOneOfOne(product)) {
    return {
      conditions: ['Factory New'],
      allowSharpened: false,
      allowKydex: false,
      singleUnit: true,
    };
  }
  return {
    conditions: ['Factory New', 'Battle-Scarred'],
    allowSharpened: true,
    allowKydex: true,
    singleUnit: false,
  };
}

// ─── Configuración ────────────────────────────────────────────────────────────
export interface ProductOptions {
  condition?: Condition;
  bladeType?: BladeChoice;
  statTrak?: boolean;
  /** `true` si hay placa NameTag (el texto va aparte, no afecta al precio). */
  nameTag?: boolean;
  stand?: boolean;
  kydex?: boolean;
}

export interface NormalizedOptions {
  condition: Condition;
  bladeType: BladeChoice;
  statTrak: boolean;
  nameTag: boolean;
  stand: boolean;
  kydex: boolean;
}

/** Rellena valores por defecto y fuerza las restricciones del producto. */
export function normalizeOptions(
  product: Pick<Product, 'isOneOfOne'>,
  options: ProductOptions = {}
): NormalizedOptions {
  const rules = getRestrictions(product);
  const condition = options.condition ?? DEFAULT_CONDITION;
  const bladeType = options.bladeType ?? DEFAULT_BLADE;
  return {
    condition: rules.conditions.includes(condition) ? condition : DEFAULT_CONDITION,
    bladeType: !rules.allowSharpened && bladeType === 'Afilada (Sharpened)' ? DEFAULT_BLADE : bladeType,
    statTrak: options.statTrak === true,
    nameTag: options.nameTag === true,
    stand: options.stand === true,
    kydex: rules.allowKydex && options.kydex === true,
  };
}

/** Precio del cuchillo según desgaste (usa `battleScarredPrice` del catálogo). */
export function getConditionPrice(
  product: Pick<Product, 'basePrice' | 'battleScarredPrice' | 'isOneOfOne'>,
  condition: Condition
): number {
  if (condition === 'Battle-Scarred' && getRestrictions(product).conditions.includes('Battle-Scarred')) {
    return product.battleScarredPrice;
  }
  return product.basePrice;
}

/** Suma de los complementos activos de una configuración (ya normalizada). */
export function computeAddonsPrice(options: ProductOptions): number {
  return roundMoney(
    (options.statTrak ? ADDON_PRICES.statTrak : 0) +
      (options.nameTag ? ADDON_PRICES.nameTag : 0) +
      (options.stand ? ADDON_PRICES.stand : 0) +
      (options.kydex ? ADDON_PRICES.kydex : 0)
  );
}

/** Precio final de una unidad configurada (aplica restricciones 1-of-1). */
export function computeConfiguredPrice(product: Product, options: ProductOptions = {}): number {
  const normalized = normalizeOptions(product, options);
  return roundMoney(getConditionPrice(product, normalized.condition) + computeAddonsPrice(normalized));
}
