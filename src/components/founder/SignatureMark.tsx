import React from 'react';

interface SignatureMarkProps {
  /** Tinta (sobre papel) o papel (sobre banda oscura). */
  tone?: 'ink' | 'paper';
  /** Tamaño del texto de la firma. */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Línea de firma editorial plana: "Firmado por DuFiTuFi (CEO)" en serif cursiva con un filete.
 * Es un recurso tipográfico, no una firma manuscrita real de ninguna persona.
 */
export const SignatureMark: React.FC<SignatureMarkProps> = ({ tone = 'ink', size = 'md', className = '' }) => {
  const dark = tone === 'paper';
  return (
    <p
      className={`inline-block border-t pt-2 ${dark ? 'border-paper/30 text-paper/80' : 'border-ink/40 text-ink-2'} ${className}`}
    >
      <span className={`font-serif italic ${size === 'sm' ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
        Firmado por DuFiTuFi (CEO)
      </span>
    </p>
  );
};

export default SignatureMark;
