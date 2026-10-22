import React, { createContext, useContext, useId } from 'react';
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
      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-ink bg-paper-2 peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pink [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
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

const ChoiceGroupContext = createContext<string | undefined>(undefined);

/**
 * Contenedor de opciones segmentadas cuadradas (2 columnas, una sola caja de 1px). Es un grupo de radio:
 * las opciones son radios nativos (flechas del teclado, un único elemento seleccionado).
 */
export const ChoiceGroup: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label,
  children,
  className = '',
}) => {
  const name = useId();
  return (
    <ChoiceGroupContext value={name}>
      <div role="radiogroup" aria-label={label} className={`grid grid-cols-2 border border-ink ${className}`}>
        {children}
      </div>
    </ChoiceGroupContext>
  );
};

interface ChoiceProps {
  active: boolean;
  /** Se llama al elegir la opción. */
  onClick: () => void;
  disabled?: boolean;
  title: React.ReactNode;
  /** Línea secundaria (descripción corta). */
  sub?: React.ReactNode;
  /** Contenido mono inferior (precio, etc.); recibe `active` para ajustar el color. */
  footer?: (active: boolean) => React.ReactNode;
  compact?: boolean;
}

/** Opción para ChoiceGroup (radio nativo oculto + etiqueta): tinta sólida cuando está activa. */
export const Choice: React.FC<ChoiceProps> = ({ active, onClick, disabled = false, title, sub, footer, compact = false }) => {
  const name = useContext(ChoiceGroupContext);
  return (
    <label
      className={`relative flex min-w-0 cursor-pointer flex-col items-start gap-1 text-left transition-colors first:border-0 [&:not(:first-child)]:border-l [&:not(:first-child)]:border-ink has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-40 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-pink ${
        compact ? 'px-3 py-2.5' : 'px-3.5 py-3'
      } ${active ? 'bg-ink text-paper' : 'bg-transparent text-ink hover:bg-tile has-[:disabled]:hover:bg-transparent'}`}
    >
      <input type="radio" name={name} checked={active} disabled={disabled} onChange={onClick} className="sr-only" />
      <span className="font-body text-sm font-medium leading-snug">{title}</span>
      {sub && <span className={`font-body text-xs leading-snug ${active ? 'text-paper/70' : 'text-ink-2'}`}>{sub}</span>}
      {footer?.(active)}
    </label>
  );
};
