import React from 'react';

/** Marca tipográfica KRM—GG (la raya es el único toque de rosa). Hereda el tamaño del contenedor. */
export const Wordmark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`font-display font-semibold leading-none tracking-[-0.05em] text-ink ${className}`}>
    KRM<span className="text-pink">—</span>GG
  </span>
);

export default Wordmark;
