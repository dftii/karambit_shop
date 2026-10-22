import React from 'react';
import { formatEUR } from '../../lib/format';

export type PriceSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PriceTone = 'ink' | 'pink' | 'success' | 'muted' | 'accent' | 'white' | 'emerald';

const SIZES: Record<PriceSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

// accent/white/emerald = alias de los tonos antiguos.
const TONES: Record<PriceTone, string> = {
  ink: 'text-ink',
  pink: 'text-pink-ink',
  success: 'text-success',
  muted: 'text-ink-3',
  accent: 'text-ink',
  white: 'text-ink',
  emerald: 'text-success',
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

/** Importe en euros con formato es-ES, en mono. */
export const Price: React.FC<PriceProps> = ({
  value,
  size = 'md',
  tone = 'ink',
  strike = false,
  prefix = '',
  className = '',
  ...rest
}) => (
  <span
    className={`font-mono font-medium tabular-nums tracking-tight ${SIZES[size]} ${TONES[tone]} ${strike ? 'line-through decoration-1' : ''} ${className}`}
    {...rest}
  >
    {prefix}
    {formatEUR(value)}
  </span>
);

export default Price;
