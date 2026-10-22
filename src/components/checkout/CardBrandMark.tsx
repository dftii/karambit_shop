import React from 'react';
import type { CardBrand } from '../../lib/payment';

/** Marca de tarjeta (Visa / Mastercard / Amex) en línea, plana y monocroma (hereda `currentColor`). */
export const CardBrandMark: React.FC<{ brand: CardBrand; className?: string }> = ({ brand, className = '' }) => {
  if (brand === 'visa' || brand === 'amex') {
    const label = brand === 'visa' ? 'Visa' : 'American Express';
    return (
      <span
        role="img"
        aria-label={label}
        className={`inline-flex h-6 items-center border border-current px-1.5 font-mono text-[11px] font-semibold tracking-[0.12em] ${className}`}
      >
        {brand === 'visa' ? 'VISA' : 'AMEX'}
      </span>
    );
  }
  if (brand === 'mastercard') {
    return (
      <span role="img" aria-label="Mastercard" className={`inline-flex h-6 items-center ${className}`}>
        <span className="h-5 w-5 rounded-full border border-current" />
        <span className="-ml-2 h-5 w-5 rounded-full border border-current bg-current opacity-40" />
      </span>
    );
  }
  return null;
};

export default CardBrandMark;
