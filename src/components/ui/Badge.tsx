import React from 'react';

export type BadgeTone = 'amber' | 'emerald' | 'red' | 'sky' | 'purple' | 'gray';

const TONES: Record<BadgeTone, string> = {
  amber: 'bg-krm-accent/10 text-amber-400 border-krm-accent/30',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  red: 'bg-red-500/10 text-red-400 border-red-500/30',
  sky: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  gray: 'bg-krm-card-alt text-gray-300 border-krm-border',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Color libre (p. ej. el de rareza): sustituye al tono con fondo/borde/texto derivados. */
  color?: string;
  icon?: React.ReactNode;
}

/** Etiqueta pequeña tipo CS2 (rareza, estado, descuento...). */
export const Badge: React.FC<BadgeProps> = ({ tone = 'gray', color, icon, className = '', style, children, ...rest }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-display text-[11px] font-black uppercase tracking-wider ${
      color ? '' : TONES[tone]
    } ${className}`}
    style={color ? { background: `${color}15`, color, borderColor: `${color}40`, ...style } : style}
    {...rest}
  >
    {icon}
    {children}
  </span>
);

export default Badge;
