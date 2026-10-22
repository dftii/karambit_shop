import React from 'react';
import { LABEL_CLASSES } from './fieldStyles';

interface FieldProps {
  /** Id del control (para `htmlFor` y `aria-describedby`: el id del mensaje es `${id}-msg`). */
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/** Etiqueta mono + control + mensaje de error/ayuda en línea. */
export const Field: React.FC<FieldProps> = ({ id, label, error, hint, className = '', children }) => (
  <div className={`min-w-0 ${className}`}>
    <label htmlFor={id} className={LABEL_CLASSES}>
      {label}
    </label>
    {children}
    {error ? (
      <p id={`${id}-msg`} role="alert" className="mt-1.5 font-body text-xs text-danger">
        {error}
      </p>
    ) : hint ? (
      <p id={`${id}-msg`} className="mt-1.5 font-body text-xs text-ink-3">
        {hint}
      </p>
    ) : null}
  </div>
);

export default Field;
