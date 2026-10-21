import { useMemo } from 'react';
import { useStore, useIsOwned, type Order } from '../../store/useStore';
import { getLineSerials } from '../../lib/ids';
import type { Product } from '../../data/karambits';

export interface PieceOwnership {
  /** Ya está en algún pedido. */
  owned: boolean;
  /** Está en el carrito (sin comprar todavía). */
  inCart: boolean;
  /** Pedido que contiene la pieza (el más reciente). */
  order?: Order;
  /** Serial asignado en ese pedido. */
  serial?: string;
  /** Id del certificado digital del pedido. */
  certificateId?: string;
}

/** Estado de propiedad de una pieza 1-of-1: carrito, pedido, serial y certificado. */
export function usePieceOwnership(product: Pick<Product, 'id'>): PieceOwnership {
  const owned = useIsOwned(product.id);
  const inCart = useStore((s) => s.cart.some((line) => line.productId === product.id));
  const orders = useStore((s) => s.orders);

  return useMemo(() => {
    if (!owned) return { owned, inCart };
    const order = orders.find((o) => o.items.some((item) => item.productId === product.id));
    const line = order?.items.find((item) => item.productId === product.id);
    const serial = order && line ? getLineSerials(order.serialNumbers, line.lineId, 1)[0] : undefined;
    return { owned, inCart, order, serial, certificateId: order?.digitalCertificateId };
  }, [owned, inCart, orders, product.id]);
}
