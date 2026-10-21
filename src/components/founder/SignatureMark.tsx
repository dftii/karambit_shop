import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SignatureMarkProps {
  /** Color del trazo y del texto. */
  color?: string;
  /** Anima el trazo al entrar en pantalla. */
  animate?: boolean;
  /** Muestra la leyenda "Firmado por DuFiTuFi (CEO)" bajo la marca. */
  caption?: boolean;
  className?: string;
}

/**
 * Marca de firma estilizada de DuFiTuFi (CEO). Es un logotipo tipográfico + trazo vectorial
 * decorativo (no es una firma manuscrita real de ninguna persona).
 */
export const SignatureMark: React.FC<SignatureMarkProps> = ({
  color = '#fcd34d',
  animate = true,
  caption = true,
  className = '',
}) => {
  const reduced = useReducedMotion() ?? false;
  const draw = animate && !reduced;

  return (
    <figure className={`inline-flex flex-col items-start ${className}`}>
      <svg
        viewBox="0 0 220 64"
        className="h-12 w-44 overflow-visible sm:h-14 sm:w-52"
        role="img"
        aria-label="Marca de firma de DuFiTuFi (CEO)"
      >
        <text
          x="6"
          y="38"
          fill={color}
          fontSize="34"
          fontStyle="italic"
          style={{ fontFamily: "'Snell Roundhand','Segoe Script','Brush Script MT','Lucida Handwriting',cursive" }}
        >
          DuFiTuFi
        </text>
        <motion.path
          d="M4 50 C 40 58, 70 44, 112 50 S 176 56, 214 40"
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={draw ? { pathLength: 0, opacity: 0 } : false}
          whileInView={draw ? { pathLength: 1, opacity: 1 } : undefined}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.2 }}
        />
        <circle cx="214" cy="40" r="2" fill={color} />
      </svg>
      {caption && (
        <figcaption className="mt-0.5 font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200/70">
          Firmado por DuFiTuFi (CEO)
        </figcaption>
      )}
    </figure>
  );
};

export default SignatureMark;
