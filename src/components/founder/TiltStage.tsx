import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

interface TiltStageProps {
  children: React.ReactNode;
  /** Inclinación máxima en grados. */
  maxTilt?: number;
  /** Desplazamiento de paralaje del contenido (px). */
  parallax?: number;
  className?: string;
}

/**
 * Contenedor con inclinación 3D + paralaje + brillo especular que sigue al ratón.
 * Solo usa transform/opacity. Se desactiva en táctil (sin hover/puntero fino) y con
 * prefers-reduced-motion: en ese caso renderiza los hijos sin efecto.
 */
export const TiltStage: React.FC<TiltStageProps> = ({ children, maxTilt = 9, parallax = 14, className = '' }) => {
  const reduced = useReducedMotion() ?? false;
  const [finePointer, setFinePointer] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0); // -0.5 … 0.5
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 140, damping: 16, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 140, damping: 16, mass: 0.6 });

  const rotateY = useTransform(sx, (v) => v * maxTilt * 2);
  const rotateX = useTransform(sy, (v) => -v * maxTilt * 2);
  const shiftX = useTransform(sx, (v) => v * -parallax);
  const shiftY = useTransform(sy, (v) => v * -parallax);
  // El centro del brillo se mantiene dentro de la caja y su radio es menor que la distancia al borde,
  // así el degradado nunca se corta en un borde visible.
  const glareX = useTransform(sx, (v) => 25 + (v + 0.5) * 50);
  const glareY = useTransform(sy, (v) => 25 + (v + 0.5) * 50);
  const glare = useMotionTemplate`radial-gradient(circle 110px at ${glareX}% ${glareY}%, rgba(255,255,255,0.12), transparent)`;

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const enabled = finePointer && !reduced;

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className} style={{ perspective: 1000 }} onPointerMove={handleMove} onPointerLeave={reset}>
      <motion.div className="relative h-full w-full" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
        <motion.div className="h-full w-full" style={{ x: shiftX, y: shiftY }}>
          {children}
        </motion.div>
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background: glare }} />
      </motion.div>
    </div>
  );
};

export default TiltStage;
