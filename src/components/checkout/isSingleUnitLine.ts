import { findCartItemProduct } from '../../lib/cart';
import { isOneOfOne } from '../../lib/pricing';

/** ¿La línea es una pieza 1-of-1 (única unidad existente)? */
export const isSingleUnitLine = (item: { productId?: string }): boolean => isOneOfOne(findCartItemProduct(item));
