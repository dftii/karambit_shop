import { useCallback, useMemo, useReducer } from 'react';
import type { Product } from '../../data/karambits';
import { useStore } from '../../store/useStore';
import { buildKnifeCartItem, notifyCartResult, type CartItemInput } from '../../lib/cart';
import {
  DEFAULT_BLADE,
  DEFAULT_CONDITION,
  getConditionPrice,
  getRestrictions,
  computeConfiguredPrice,
  normalizeOptions,
  type BladeChoice,
  type Condition,
  type NormalizedOptions,
  type ProductRestrictions,
} from '../../lib/pricing';
import { formatStatTrak } from '../../lib/productDisplay';

/** Máximo de dígitos del contador StatTrak™ y de caracteres de la placa NameTag. */
export const STATTRAK_MAX_DIGITS = 4;
export const NAMETAG_MAX_CHARS = 12;

/** Contador StatTrak™: solo dígitos, hasta 4. */
export const sanitizeStatTrak = (value: string): string => value.replace(/\D/g, '').slice(0, STATTRAK_MAX_DIGITS);

/** Texto de la placa NameTag: mayúsculas, hasta 12 caracteres. */
export const sanitizeNameTag = (value: string): string => value.toUpperCase().slice(0, NAMETAG_MAX_CHARS);

/** Lo que el usuario ha elegido (antes de aplicar las restricciones de las piezas 1-of-1). */
export interface ConfiguratorState {
  condition: Condition;
  bladeType: BladeChoice;
  statTrak: boolean;
  statTrakNumber: string;
  nameTag: boolean;
  nameTagText: string;
  stand: boolean;
  kydex: boolean;
}

const INITIAL_STATE: ConfiguratorState = {
  condition: DEFAULT_CONDITION,
  bladeType: DEFAULT_BLADE,
  statTrak: false,
  statTrakNumber: '007',
  nameTag: false,
  nameTagText: 'HEADSHOT',
  stand: false,
  kydex: false,
};

type ToggleField = 'statTrak' | 'nameTag' | 'stand' | 'kydex';

type Action =
  | { type: 'condition'; value: Condition }
  | { type: 'blade'; value: BladeChoice }
  | { type: 'toggle'; field: ToggleField; value: boolean }
  | { type: 'statTrakNumber'; value: string }
  | { type: 'nameTagText'; value: string };

function reducer(state: ConfiguratorState, action: Action): ConfiguratorState {
  switch (action.type) {
    case 'condition':
      return { ...state, condition: action.value };
    case 'blade':
      return { ...state, bladeType: action.value };
    case 'toggle':
      return { ...state, [action.field]: action.value };
    case 'statTrakNumber':
      return { ...state, statTrakNumber: sanitizeStatTrak(action.value) };
    case 'nameTagText':
      return { ...state, nameTagText: sanitizeNameTag(action.value) };
  }
}

/** Acciones estables (misma identidad entre renders) para pasar a componentes memoizados. */
export interface ConfiguratorActions {
  setCondition: (value: Condition) => void;
  setBlade: (value: BladeChoice) => void;
  setStatTrak: (value: boolean) => void;
  setStatTrakNumber: (value: string) => void;
  setNameTag: (value: boolean) => void;
  setNameTagText: (value: string) => void;
  setStand: (value: boolean) => void;
  setKydex: (value: boolean) => void;
}

export interface ConfiguratorModel {
  state: ConfiguratorState;
  actions: ConfiguratorActions;
  /** Restricciones del producto (1-of-1: solo Factory New, sin filo, sin Kydex). */
  rules: ProductRestrictions;
  /** Opciones ya normalizadas con las restricciones: lo que de verdad se compra. */
  config: NormalizedOptions;
  /** Estado de acabado efectivo (tras restricciones). */
  condition: Condition;
  sharpened: boolean;
  /** NameTag activo = casilla marcada y texto no vacío. */
  nameTagActive: boolean;
  /** Contador StatTrak™ tal y como se grabará (mínimo 3 dígitos). */
  statTrakLabel: string;
  /** Precio del cuchillo según desgaste, sin complementos. */
  baseKnifePrice: number;
  /** Precio unitario final con complementos (única fuente: lib/pricing). */
  price: number;
  /** % de descuento de Battle-Scarred respecto a Factory New. */
  battleScarredDiscount: number;
  /** Línea lista para `addToCart` / `canAddToCart` del store. */
  cartItem: CartItemInput;
  /** Añade la configuración al carrito y avisa con toast si el store la rechaza. Devuelve `true` si entró. */
  addConfiguredToCart: () => boolean;
}

/**
 * Configurador de karambit compartido por la ficha y la vista rápida: estado de opciones (useReducer),
 * validación del número StatTrak™ y del texto NameTag, y derivados (precio, línea de carrito).
 */
export function useConfigurator(product: Product): ConfiguratorModel {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const addToCart = useStore((s) => s.addToCart);

  const actions = useMemo<ConfiguratorActions>(
    () => ({
      setCondition: (value) => dispatch({ type: 'condition', value }),
      setBlade: (value) => dispatch({ type: 'blade', value }),
      setStatTrak: (value) => dispatch({ type: 'toggle', field: 'statTrak', value }),
      setStatTrakNumber: (value) => dispatch({ type: 'statTrakNumber', value }),
      setNameTag: (value) => dispatch({ type: 'toggle', field: 'nameTag', value }),
      setNameTagText: (value) => dispatch({ type: 'nameTagText', value }),
      setStand: (value) => dispatch({ type: 'toggle', field: 'stand', value }),
      setKydex: (value) => dispatch({ type: 'toggle', field: 'kydex', value }),
    }),
    []
  );

  const derived = useMemo(() => {
    const rules = getRestrictions(product);
    const nameTagActive = state.nameTag && state.nameTagText.trim().length > 0;
    const config = normalizeOptions(product, {
      condition: state.condition,
      bladeType: state.bladeType,
      statTrak: state.statTrak,
      nameTag: nameTagActive,
      stand: state.stand,
      kydex: state.kydex,
    });
    return {
      rules,
      nameTagActive,
      config,
      condition: config.condition,
      sharpened: config.bladeType.includes('Afilada'),
      statTrakLabel: formatStatTrak(state.statTrakNumber),
      baseKnifePrice: getConditionPrice(product, config.condition),
      price: computeConfiguredPrice(product, config),
      battleScarredDiscount: Math.round((1 - product.battleScarredPrice / product.basePrice) * 100),
      cartItem: buildKnifeCartItem(product, {
        ...config,
        statTrakCount: state.statTrakNumber || '000',
        nameTagText: state.nameTagText,
      }),
    };
  }, [product, state]);

  const { cartItem } = derived;
  const addConfiguredToCart = useCallback(() => notifyCartResult(addToCart(cartItem)), [addToCart, cartItem]);

  return { state, actions, ...derived, addConfiguredToCart };
}
