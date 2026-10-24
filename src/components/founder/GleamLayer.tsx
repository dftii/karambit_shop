import React, { useEffect, useRef } from 'react';
import { GLEAM_SPARKLES, SPARKLE_WIDTH } from './gleamConfig';

interface GleamLayerProps {
  image: string;
  slug?: string;
  imgRef: React.RefObject<HTMLImageElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Replica el zoom 1.03 de la imagen al pasar el ratón por un ancestro `.group`. */
  interactiveHover: boolean;
}

// Ángulo del reflejo especular (grados CSS) y posición en reposo (fracción de la caja).
const ANGLE = 115;
const REST = { x: 0.3, y: 0.4 };
const REACH = 0.22; // radio de influencia del puntero sobre los destellos (fracción del ancho)

// Banda de luz nítida (~8 % de ancho, bordes de ~1 %) + filo fino detrás: reflejo funcional, no un brillo difuso.
const BAND =
  `linear-gradient(${ANGLE}deg,` +
  ' transparent calc(var(--gleam-x) - 6%),' +
  ' rgba(255,255,255,0.36) calc(var(--gleam-x) - 5%),' +
  ' rgba(255,255,255,0.36) calc(var(--gleam-x) + 3%),' +
  ' transparent calc(var(--gleam-x) + 4%),' +
  ' transparent calc(var(--gleam-x) + 7%),' +
  ' rgba(255,255,255,0.22) calc(var(--gleam-x) + 7.5%),' +
  ' rgba(255,255,255,0.22) calc(var(--gleam-x) + 9%),' +
  ' transparent calc(var(--gleam-x) + 9.5%))';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Estrella de 4 puntas con trazos rectos de 1px (no escala con el tamaño). */
const Star: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-full w-full" fill="currentColor" aria-hidden="true">
    <polygon
      points="12,0 14,10 24,12 14,14 12,24 10,14 0,12 10,10"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="miter"
      vectorEffect="non-scaling-stroke"
      shapeRendering="crispEdges"
    />
  </svg>
);

/**
 * Capa de brillo "joyería" para piezas Founder: reflejo especular enmascarado con la silueta del cuchillo
 * y micro-destellos sobre hoja y anilla. Vive dentro del contenedor de `KarambitVFXImage`, así que hereda
 * cualquier transform del ancestro. El puntero se sigue sin re-render: un único rAF activo solo mientras
 * el puntero está encima (y mientras se asienta de vuelta al reposo).
 */
export const GleamLayer: React.FC<GleamLayerProps> = ({ image, slug, imgRef, containerRef, interactiveHover }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const hlRef = useRef<HTMLDivElement>(null);
  const sparkles = (slug && GLEAM_SPARKLES[slug]) || [];

  useEffect(() => {
    const box = boxRef.current;
    const hl = hlRef.current;
    const container = containerRef.current;
    const img = imgRef.current;
    if (!box || !hl || !container || !img) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stars = Array.from(box.querySelectorAll<HTMLElement>('[data-sparkle]'));
    const twinkles = Array.from(box.querySelectorAll<HTMLElement>('[data-twinkle]'));
    let w = 0;
    let h = 0;

    // Posición de la banda (% sobre la línea del degradado) para que quede justo bajo el puntero.
    const bandAt = (fx: number, fy: number) => {
      const rad = (ANGLE * Math.PI) / 180;
      const dx = Math.sin(rad);
      const dy = -Math.cos(rad);
      const len = Math.abs(w * dx) + Math.abs(h * dy) || 1;
      return 50 + (((fx - 0.5) * w * dx + (fy - 0.5) * h * dy) / len) * 100;
    };

    const cur = { ...REST };
    const tgt = { ...REST };
    let strength = 0; // 0 = reposo, 1 = puntero activo (suaviza la reacción de los destellos)
    let active = false;
    let raf = 0;

    const apply = () => {
      hl.style.setProperty('--gleam-x', `${bandAt(cur.x, cur.y).toFixed(2)}%`);
      if (reduced) return;
      for (const el of stars) {
        const sx = Number(el.dataset.x) / 100;
        const sy = Number(el.dataset.y) / 100;
        const dist = Math.hypot((cur.x - sx) * w, (cur.y - sy) * h) / (w || 1);
        const p = clamp01(1 - dist / REACH) * strength;
        el.style.transform = `translate(-50%, -50%) scale(${(1 + 0.7 * p).toFixed(3)})`;
        el.style.opacity = (0.8 + 0.2 * p).toFixed(3);
      }
    };

    const tick = () => {
      cur.x += (tgt.x - cur.x) * 0.2;
      cur.y += (tgt.y - cur.y) * 0.2;
      strength += ((active ? 1 : 0) - strength) * 0.12;
      apply();
      const settled =
        Math.abs(tgt.x - cur.x) < 0.002 && Math.abs(tgt.y - cur.y) < 0.002 && Math.abs((active ? 1 : 0) - strength) < 0.01;
      raf = active || !settled ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Caja renderizada de la imagen dentro del <img> (object-contain) a partir de su proporción natural.
    const layout = () => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const cw = img.clientWidth;
      const ch = img.clientHeight;
      if (!nw || !nh || !cw || !ch) return;
      const scale = Math.min(cw / nw, ch / nh);
      w = nw * scale;
      h = nh * scale;
      box.style.left = `${img.offsetLeft + (cw - w) / 2}px`;
      box.style.top = `${img.offsetTop + (ch - h) / 2}px`;
      box.style.width = `${w}px`;
      box.style.height = `${h}px`;
      box.style.visibility = 'visible';
      apply();
    };

    const onMove = (event: PointerEvent) => {
      if (!w || !h) return;
      const r = box.getBoundingClientRect();
      if (!r.width || !r.height) return;
      tgt.x = (event.clientX - r.left) / r.width;
      tgt.y = (event.clientY - r.top) / r.height;
      active = true;
      kick();
    };
    const onLeave = () => {
      active = false;
      tgt.x = REST.x;
      tgt.y = REST.y;
      kick();
    };

    if (reduced) {
      // Sin animación: reflejo fijo y destellos estáticos a baja opacidad.
      for (const el of twinkles) el.style.animation = 'none';
      for (const el of stars) el.style.opacity = '0.45';
    } else {
      container.addEventListener('pointermove', onMove, { passive: true });
      container.addEventListener('pointerleave', onLeave);
      container.addEventListener('pointercancel', onLeave);
    }

    layout();
    img.addEventListener('load', layout);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(layout);
    ro?.observe(container);
    ro?.observe(img);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerleave', onLeave);
      container.removeEventListener('pointercancel', onLeave);
      img.removeEventListener('load', layout);
      ro?.disconnect();
    };
  }, [image, containerRef, imgRef]);

  const mask = `url("${image}")`;

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      className={`pointer-events-none absolute transition-transform duration-300 ease-out ${
        interactiveHover ? 'group-hover:scale-[1.03]' : ''
      }`}
      style={{ visibility: 'hidden', mixBlendMode: 'screen' }}
    >
      {/* Reflejo especular recortado con la silueta de la pieza */}
      <div
        ref={hlRef}
        className="absolute inset-0"
        style={{
          background: BAND,
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }}
      />
      {/* Micro-destellos sobre hoja, mango y anilla */}
      {sparkles.map((sp, i) => (
        <span
          key={i}
          data-sparkle=""
          data-x={sp.x}
          data-y={sp.y}
          className="absolute block aspect-square"
          style={{
            left: `${sp.x}%`,
            top: `${sp.y}%`,
            width: SPARKLE_WIDTH[sp.size],
            color: sp.color,
            transform: 'translate(-50%, -50%)',
            opacity: 0.8,
          }}
        >
          <span
            data-twinkle=""
            className="krm-twinkle block h-full w-full"
            style={
              {
                '--krm-tw-delay': `${sp.delay}s`,
                '--krm-tw-dur': `${sp.duration}s`,
              } as React.CSSProperties
            }
          >
            <Star />
          </span>
        </span>
      ))}
    </div>
  );
};

export default GleamLayer;
