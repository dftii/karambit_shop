import React from 'react';
import type { CardBrand } from '../../lib/payment';

/** Marca de tarjeta (Visa / Mastercard / Amex) dibujada en línea; sin recursos externos. */
export const CardBrandMark: React.FC<{ brand: CardBrand; className?: string }> = ({ brand, className = '' }) => {
  if (brand === 'visa') {
    return (
      <span
        role="img"
        aria-label="Visa"
        className={`inline-flex h-6 items-center rounded bg-white px-1.5 font-display text-sm font-black italic tracking-tight text-[#1a1f71] ${className}`}
      >
        VISA
      </span>
    );
  }
  if (brand === 'mastercard') {
    return (
      <span role="img" aria-label="Mastercard" className={`inline-flex h-6 items-center ${className}`}>
        <span className="h-5 w-5 rounded-full bg-[#eb001b]" />
        <span className="-ml-2 h-5 w-5 rounded-full bg-[#f79e1b] mix-blend-screen" />
      </span>
    );
  }
  if (brand === 'amex') {
    return (
      <span
        role="img"
        aria-label="American Express"
        className={`inline-flex h-6 items-center rounded bg-[#2e77bb] px-1.5 font-display text-[11px] font-black tracking-wider text-white ${className}`}
      >
        AMEX
      </span>
    );
  }
  return null;
};

export default CardBrandMark;
