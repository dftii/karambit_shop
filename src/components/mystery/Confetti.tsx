import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const COLORS = ['#fbbf24', '#f472b6', '#38bdf8', '#fde68a', '#f9a8d4', '#ffffff'];

/** Pseudo-aleatorio determinista (puro): mismo confeti en cada render, sin Math.random en render. */
const noise = (i: number, k: number): number => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const PIECES = Array.from({ length: 48 }, (_, i) => ({
  x: (noise(i, 1) - 0.5) * 640,
  rise: 140 + noise(i, 2) * 280,
  fall: 120 + noise(i, 3) * 200,
  rotate: (noise(i, 4) - 0.5) * 900,
  delay: noise(i, 5) * 0.3,
  size: 6 + noise(i, 6) * 8,
  round: noise(i, 7) > 0.6,
  color: COLORS[i % COLORS.length],
}));

/** Ráfaga de confeti con framer-motion (sin dependencias). No renderiza nada con prefers-reduced-motion. */
export const Confetti: React.FC<{ colors?: string[] }> = ({ colors = COLORS }) => {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden="true">
      {PIECES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-[45%] block"
          style={{
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            borderRadius: p.round ? '9999px' : 2,
            background: colors[i % colors.length],
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{
            x: [0, p.x * 0.7, p.x],
            y: [0, -p.rise, -p.rise + p.fall + 220],
            opacity: [1, 1, 0],
            scale: [0.4, 1, 0.9],
            rotate: p.rotate,
          }}
          transition={{ duration: 2.2, delay: p.delay, ease: 'easeOut', times: [0, 0.4, 1] }}
        />
      ))}
    </div>
  );
};
