import React, { memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { rarityColors, type Product } from '../../data/karambits';
import { shortKnifeName } from '../../lib/mysteryCases';
import { formatEUR } from '../../lib/format';
import { KarambitVFXImage } from '../KarambitVFXImage';

/** Carta bajo la aguja al reposar antes de la primera tirada y punto de partida de cada giro. */
export const REEL_START_INDEX = 3;

export interface SpinOptions {
  winIndex: number;
  /** Fracción del ancho de carta (-0.4..0.4) donde se detiene la aguja. */
  stopOffset: number;
  durationMs: number;
  /** Sin animación (prefers-reduced-motion): coloca el resultado de golpe. */
  instant: boolean;
  /** Se llama cada vez que una carta nueva cruza la aguja (sonido de tic). */
  onTick?: () => void;
}

export interface ReelHandle {
  /** Anima hasta `winIndex`. Resuelve `true` al terminar o `false` si se cancela (desmontaje). */
  spin: (options: SpinOptions) => Promise<boolean>;
  /** Vuelve a la posición de reposo inicial (al cambiar de caja). */
  reset: () => void;
}

interface Metrics {
  cardW: number;
  step: number;
  viewW: number;
}

interface ReelProps {
  items: Product[];
  winIndex: number;
  /** Resalta la carta ganadora y atenúa el resto. */
  winnerRevealed: boolean;
  /** Color del halo de la carta ganadora (premios míticos: oro/rosa). */
  glow?: string;
  ref?: React.Ref<ReelHandle>;
}

/** Ease-out tipo CS2: arranque rápido y cola muy larga. */
const easeOut = (t: number): number => 1 - Math.pow(1 - t, 4);

/**
 * Carrete de la caja. El paso entre cartas (ancho + gap) se MIDE del DOM (offsetLeft de las dos
 * primeras cartas) en cada giro y en cada cambio de tamaño, así que funciona igual a 375 px que en
 * escritorio. La animación va por requestAnimationFrame con `transform` directo (sin re-render por
 * fotograma) y se cancela al desmontar.
 */
const ReelBase: React.FC<ReelProps> = ({ items, winIndex, winnerRevealed, glow, ref }) => {
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const settleRef = useRef<((finished: boolean) => void) | null>(null);
  const spinningRef = useRef(false);
  const restRef = useRef({ index: REEL_START_INDEX, frac: 0 });

  const measure = useCallback((): Metrics | null => {
    const view = viewRef.current;
    const track = trackRef.current;
    const first = track?.children[0] as HTMLElement | undefined;
    if (!view || !track || !first) return null;
    const second = track.children[1] as HTMLElement | undefined;
    const cardW = first.offsetWidth;
    const step = second ? second.offsetLeft - first.offsetLeft : cardW;
    if (cardW <= 0 || step <= 0) return null;
    return { cardW, step, viewW: view.clientWidth };
  }, []);

  const xFor = (m: Metrics, index: number, frac: number): number =>
    m.viewW / 2 - (index * m.step + m.cardW / 2 + frac * m.cardW);

  const setX = (x: number) => {
    if (trackRef.current) trackRef.current.style.transform = `translate3d(${x}px,0,0)`;
  };

  const placeAtRest = useCallback(() => {
    const m = measure();
    if (m) setX(xFor(m, restRef.current.index, restRef.current.frac));
  }, [measure]);

  const stopAnimation = useCallback((finished: boolean) => {
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    rafRef.current = undefined;
    spinningRef.current = false;
    const settle = settleRef.current;
    settleRef.current = null;
    settle?.(finished);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      spin: (options) =>
        new Promise<boolean>((resolve) => {
          stopAnimation(false);
          const m = measure();
          if (!m) {
            resolve(false);
            return;
          }
          restRef.current = { index: options.winIndex, frac: options.stopOffset };
          const from = xFor(m, REEL_START_INDEX, 0);
          const to = xFor(m, options.winIndex, options.stopOffset);
          if (options.instant) {
            setX(to);
            resolve(true);
            return;
          }
          spinningRef.current = true;
          settleRef.current = resolve;
          setX(from);
          const startedAt = performance.now();
          let lastIndex = -1;
          const frame = (now: number) => {
            const t = Math.min(1, (now - startedAt) / options.durationMs);
            const x = from + (to - from) * easeOut(t);
            setX(x);
            const under = Math.floor((m.viewW / 2 - x) / m.step);
            if (under !== lastIndex) {
              lastIndex = under;
              options.onTick?.();
            }
            if (t < 1) {
              rafRef.current = requestAnimationFrame(frame);
            } else {
              setX(to);
              stopAnimation(true);
            }
          };
          rafRef.current = requestAnimationFrame(frame);
        }),
      reset: () => {
        stopAnimation(false);
        restRef.current = { index: REEL_START_INDEX, frac: 0 };
        placeAtRest();
      },
    }),
    [measure, placeAtRest, stopAnimation]
  );

  // Reposo: al cambiar las cartas y cuando cambia el tamaño del visor/cartas (móvil, rotación...).
  useLayoutEffect(() => {
    if (!spinningRef.current) placeAtRest();
  }, [items, placeAtRest]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      if (!spinningRef.current) placeAtRest();
    });
    observer.observe(view);
    const firstCard = trackRef.current?.children[0];
    if (firstCard) observer.observe(firstCard);
    return () => observer.disconnect();
  }, [placeAtRest, items]);

  // Cancelar el giro y el rAF al desmontar.
  useEffect(() => () => stopAnimation(false), [stopAnimation]);

  return (
    <div
      ref={viewRef}
      className="relative h-[196px] w-full select-none overflow-hidden rounded-2xl border-2 border-krm-border-strong bg-[#07080d] shadow-inner sm:h-64"
      aria-label="Carrete de la caja"
    >
      {/* Aguja central */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-[3px] -translate-x-1/2 bg-krm-accent shadow-[0_0_18px_#f59e0b]" />
      <div className="pointer-events-none absolute left-1/2 top-0 z-30 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[14px] border-x-transparent border-t-krm-accent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-30 h-0 w-0 -translate-x-1/2 border-x-[10px] border-b-[14px] border-x-transparent border-b-krm-accent drop-shadow-[0_-2px_4px_rgba(0,0,0,0.8)]" />
      {/* Máscaras laterales */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[#07080d] to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-[#07080d] to-transparent sm:w-24" />

      <div ref={trackRef} className="absolute left-0 top-0 flex h-full items-center gap-2 will-change-transform sm:gap-3">
        {items.map((knife, index) => {
          const isWinner = winnerRevealed && index === winIndex;
          const color = rarityColors[knife.rarity] ?? '#ef4444';
          return (
            <div
              key={index}
              className={`flex h-[164px] w-[112px] shrink-0 flex-col items-center justify-between rounded-xl border p-2 text-center transition-[opacity,transform,box-shadow] duration-500 sm:h-52 sm:w-40 sm:p-3 ${
                isWinner
                  ? 'z-10 scale-105 border-krm-accent bg-krm-card-hi'
                  : 'border-[#1e2436] bg-[#10131d]'
              } ${winnerRevealed && !isWinner ? 'opacity-40' : ''}`}
              style={
                isWinner
                  ? { boxShadow: `0 0 0 2px ${glow ?? '#f59e0b'}, 0 0 38px ${glow ?? '#f59e0b'}99` }
                  : undefined
              }
            >
              <div className="h-1 w-full rounded-full" style={{ backgroundColor: color }} />
              <div className="relative flex h-20 w-20 items-center justify-center sm:h-28 sm:w-28">
                <KarambitVFXImage
                  image={knife.image}
                  name={knife.name}
                  slug={knife.slug}
                  rarity={knife.rarity}
                  category={knife.category}
                  accentColor={knife.accentColor}
                  visualFilter={knife.visualFilter}
                  interactiveHover={false}
                  showSparkles={false}
                  showShimmer={false}
                />
              </div>
              <div className="w-full">
                <p className="truncate font-display text-[11px] font-bold text-white sm:text-xs">
                  {shortKnifeName(knife)}
                </p>
                <span className="font-mono text-[10px] font-bold sm:text-[11px]" style={{ color }}>
                  {formatEUR(knife.basePrice)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Reel = memo(ReelBase);
