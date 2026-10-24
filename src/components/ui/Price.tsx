import React from 'react';
import { formatEUR } from '../../lib/format';
import { useIsVault } from './vaultTone';

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

// Sobre la banda vault (bg-ink): papel, rosa vivo y papel atenuado.
const TONES_DARK: Record<PriceTone, string> = {
  ink: 'text-paper',
  pink: 'text-pink',
  success: 'text-success',
  muted: 'text-paper/50',
  accent: 'text-paper',
  white: 'text-paper',
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
}) => {
  const dark = useIsVault();
  return (
    <span
      className={`font-mono font-medium tabular-nums tracking-tight ${SIZES[size]} ${(dark ? TONES_DARK : TONES)[tone]} ${strike ? 'line-through decoration-1' : ''} ${className}`}
      {...rest}
    >
      {prefix}
      {formatEUR(value)}
    </span>
  );
};

export default Price;
