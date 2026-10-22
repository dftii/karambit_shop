import React from 'react';
import { Check } from 'lucide-react';

interface CheckRowProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Etiqueta principal (a la izquierda). */
  children: React.ReactNode;
  /** Contenido a la derecha (recuento, precio...). */
  aside?: React.ReactNode;
  /** Línea secundaria bajo la etiqueta. */
  hint?: React.ReactNode;
  /** Redondo (radio) en lugar de casilla. */
  radio?: boolean;
  /** Sin borde inferior (cuando el contenedor ya dibuja las reglas). */
  bare?: boolean;
  className?: string;
}

/** Fila de casilla cuadrada (checkbox nativo oculto + marca propia) para filtros y configurador. */
export const CheckRow: React.FC<CheckRowProps> = ({
  checked,
  onChange,
  disabled = false,
  children,
  aside,
  hint,
  radio = false,
  bare = false,
  className = '',
}) => (
  <label
    className={`flex items-start gap-3 py-2.5 ${bare ? '' : 'border-b border-line'} ${
      disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'
    } ${className}`}
  >
    <input
      type={radio ? 'radio' : 'checkbox'}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="peer sr-only"
    />
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-ink bg-paper-2 peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pink [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100 ${
        radio ? '!rounded-full' : ''
      }`}
    >
      <Check className="h-3 w-3 text-paper" strokeWidth={3} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block font-body text-sm leading-snug text-ink">{children}</span>
      {hint && <span className="mt-0.5 block font-body text-xs leading-snug text-ink-3">{hint}</span>}
    </span>
    {aside && <span className="shrink-0 font-mono text-xs tabular-nums text-ink-2">{aside}</span>}
  </label>
);

export default CheckRow;

/** Contenedor de opciones segmentadas cuadradas (2 columnas, una sola caja de 1px). */
export const ChoiceGroup: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label,
  children,
  className = '',
}) => (
  <div role="group" aria-label={label} className={`grid grid-cols-2 border border-ink ${className}`}>
    {children}
  </div>
);

interface ChoiceProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: React.ReactNode;
  /** Línea secundaria (descripción corta). */
  sub?: React.ReactNode;
  /** Contenido mono inferior (precio, etc.); recibe `active` para ajustar el color. */
  footer?: (active: boolean) => React.ReactNode;
  compact?: boolean;
}

/** Botón de opción para ChoiceGroup: tinta sólida cuando está activo. */
export const Choice: React.FC<ChoiceProps> = ({ active, onClick, disabled = false, title, sub, footer, compact = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
    className={`flex min-w-0 flex-col items-start gap-1 text-left transition-colors first:border-0 [&:not(:first-child)]:border-l [&:not(:first-child)]:border-ink disabled:cursor-not-allowed disabled:opacity-40 ${
      compact ? 'px-3 py-2.5' : 'px-3.5 py-3'
    } ${active ? 'bg-ink text-paper' : 'bg-transparent text-ink enabled:hover:bg-tile'}`}
  >
    <span className="font-body text-sm font-medium leading-snug">{title}</span>
    {sub && <span className={`font-body text-xs leading-snug ${active ? 'text-paper/70' : 'text-ink-2'}`}>{sub}</span>}
    {footer?.(active)}
  </button>
);
