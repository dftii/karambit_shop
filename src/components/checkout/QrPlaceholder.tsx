import React, { useMemo } from 'react';

const SIZE = 25;

/** PRNG determinista (mulberry32) a partir de una cadena. */
function seeded(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const inFinder = (x: number, y: number) =>
  (x < 8 && y < 8) || (x >= SIZE - 8 && y < 8) || (x < 8 && y >= SIZE - 8);

/**
 * Patrón con aspecto de código QR generado a partir del texto. Es SOLO un marcador visual de demostración
 * (no codifica datos reales ni se puede escanear) y no usa ningún servicio externo.
 */
export const QrPlaceholder: React.FC<{ seed: string; className?: string }> = ({ seed, className = '' }) => {
  const cells = useMemo(() => {
    const rand = seeded(seed);
    const out: { x: number; y: number }[] = [];
    for (let y = 0; y < SIZE; y += 1) {
      for (let x = 0; x < SIZE; x += 1) {
        if (inFinder(x, y)) continue;
        if (rand() > 0.52) out.push({ x, y });
      }
    }
    return out;
  }, [seed]);

  const finder = (ox: number, oy: number) => (
    <g key={`${ox}-${oy}`}>
      <rect x={ox} y={oy} width={7} height={7} fill="#0a0c13" />
      <rect x={ox + 1} y={oy + 1} width={5} height={5} fill="#fff" />
      <rect x={ox + 2} y={oy + 2} width={3} height={3} fill="#0a0c13" />
    </g>
  );

  return (
    <svg
      viewBox={`-1 -1 ${SIZE + 2} ${SIZE + 2}`}
      role="img"
      aria-label="Código QR de demostración (no escaneable)"
      className={`rounded-lg bg-white ${className}`}
      shapeRendering="crispEdges"
    >
      {cells.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0a0c13" />
      ))}
      {finder(0, 0)}
      {finder(SIZE - 7, 0)}
      {finder(0, SIZE - 7)}
    </svg>
  );
};

export default QrPlaceholder;
