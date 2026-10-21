import React from 'react';
import { Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Product } from '../data/karambits';

interface QuickViewButtonProps {
  product: Product;
  /** `overlay`: pastilla sobre la imagen de una tarjeta (visible al pasar el ratón; siempre en táctil). `icon`: botón cuadrado. */
  variant?: 'overlay' | 'icon';
  className?: string;
}

/** Abre la "Vista rápida" (ProductDetailModal global) para un producto sin navegar. */
export const QuickViewButton: React.FC<QuickViewButtonProps> = ({ product, variant = 'overlay', className = '' }) => {
  const openQuickView = useStore((s) => s.setSelectedProductForModal);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    openQuickView(product);
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`p-2.5 rounded-lg hover:bg-krm-border transition-colors text-gray-400 hover:text-amber-400 ${className}`}
        title="Vista rápida"
        aria-label={`Vista rápida: ${product.name}`}
      >
        <Eye className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Vista rápida: ${product.name}`}
      className={`absolute bottom-3 left-1/2 z-20 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-krm-accent/40 bg-black/70 px-3.5 py-1.5 font-display text-xs font-black uppercase tracking-wider text-amber-400 backdrop-blur-sm transition-all hover:bg-krm-accent hover:text-black focus-visible:opacity-100 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${className}`}
    >
      <Eye className="w-3.5 h-3.5" />
      Vista rápida
    </button>
  );
};

export default QuickViewButton;
