import React from 'react';
import { Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Product } from '../data/karambits';

interface QuickViewButtonProps {
  product: Product;
  /** `overlay`: barra a pie de la imagen de una tarjeta (visible al pasar el ratón; siempre en táctil). El contenedor debe ser relative + group. `icon`: botón cuadrado. */
  variant?: 'overlay' | 'icon';
  /** Sobre una celda oscura (Founder): barra de papel en vez de tinta. */
  inverted?: boolean;
  className?: string;
}

/** Abre la "Vista rápida" (ProductDetailModal global) para un producto sin navegar. */
export const QuickViewButton: React.FC<QuickViewButtonProps> = ({ product, variant = 'overlay', inverted = false, className = '' }) => {
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
        className={`border p-2.5 transition-colors ${
          inverted
            ? 'border-paper/30 bg-ink text-paper/70 hover:border-paper hover:text-paper'
            : 'border-line bg-paper-2 text-ink-2 hover:border-ink hover:text-ink'
        } ${className}`}
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
      className={`absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-2 ${inverted ? 'bg-paper text-ink' : 'bg-ink text-paper'} px-3 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] opacity-0 transition-[opacity,background-color,color] duration-200 hover:bg-pink hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${className}`}
    >
      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
      Vista rápida
    </button>
  );
};

export default QuickViewButton;
