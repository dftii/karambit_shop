import React from 'react';
import { getCartItemImage, type CartItem } from '../../lib/cart';
import { KarambitVFXImage } from '../KarambitVFXImage';

/** Miniatura cuadrada de una línea de carrito/pedido sobre `bg-tile` (estilo editorial, sin filtros). */
export const LineThumb: React.FC<{
  item: Pick<CartItem, 'productId' | 'image' | 'name' | 'gradient'>;
  /** Tamaño y relleno (por defecto 64px / p-2). */
  className?: string;
  priority?: boolean;
}> = ({ item, className = 'h-16 w-16 p-2', priority = false }) => (
  <div className={`shrink-0 overflow-hidden bg-tile ${className}`}>
    <KarambitVFXImage
      plain
      interactiveHover={false}
      priority={priority}
      image={getCartItemImage(item)}
      name={item.name}
      gradient={item.gradient}
    />
  </div>
);

export default LineThumb;
