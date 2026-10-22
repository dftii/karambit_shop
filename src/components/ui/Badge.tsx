import React from 'react';

export type BadgeTone = 'pink' | 'success' | 'danger' | 'ink' | 'neutral' | 'amber' | 'emerald' | 'red' | 'sky' | 'purple' | 'gray';

// Color del punto por tono. Los nombres antiguos (amber, emerald...) se mantienen como alias.
const DOT: Record<BadgeTone, string> = {
  pink: 'bg-pink',
  success: 'bg-success',
  danger: 'bg-danger',
  ink: 'bg-ink',
  neutral: 'bg-ink-3',
  amber: 'bg-pink',
  emerald: 'bg-success',
  red: 'bg-danger',
  sky: 'bg-ink',
  purple: 'bg-pink',
  gray: 'bg-ink-3',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Color libre del punto (p. ej. el de rareza). */
  color?: string;
  icon?: React.ReactNode;
}

/** Etiqueta mono diminuta con punto de color (rareza, estado, descuento...). Sin fondo ni borde. */
export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', color, icon, className = '', children, ...rest }) => (
  <span
    className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-ink-2 ${className}`}
    {...rest}
  >
    {icon ?? (
      <span
        aria-hidden="true"
        className={`inline-block h-1.5 w-1.5 shrink-0 ${color ? '' : DOT[tone]}`}
        style={color ? { background: color } : undefined}
      />
    )}
    {children}
  </span>
);

export default Badge;
