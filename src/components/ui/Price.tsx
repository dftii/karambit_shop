import React from 'react';
import { formatEUR } from '../../lib/format';

export type PriceSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PriceTone = 'accent' | 'white' | 'emerald' | 'muted';

const SIZES: Record<PriceSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

const TONES: Record<PriceTone, string> = {
  accent: 'text-krm-accent',
  white: 'text-white',
  emerald: 'text-emerald-400',
  muted: 'text-gray-500',
};

export interface PriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  size?: PriceSize;
  tone?: PriceTone;
  /** Tachado (precio original). */
  strike?: boolean;
  /** Prefijo opcional, p. ej. "+" o "-". */
  prefix?: string;
}

/** Importe en euros con formato es-ES. */
export const Price: React.FC<PriceProps> = ({
  value,
  size = 'md',
  tone = 'accent',
  strike = false,
  prefix = '',
  className = '',
  ...rest
}) => (
  <span
    className={`font-display font-black tabular-nums ${SIZES[size]} ${TONES[tone]} ${strike ? 'line-through' : ''} ${className}`}
    {...rest}
  >
    {prefix}
    {formatEUR(value)}
  </span>
);

export default Price;
