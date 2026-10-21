import React, { useState } from 'react';
import { getProductBySlug, karambits, type CollectionId, type Product, type Rarity } from '../data/karambits';
import { getVfxPreset, type VfxPresetId } from './founder/vfxPresets';

export type { VfxPresetId };

export interface KarambitVFXImageProps {
  image: string;
  name?: string;
  slug?: string;
  rarity?: Rarity | string;
  category?: string;
  accentColor?: string;
  visualFilter?: string;
  /** Colección del producto (p. ej. 'founder-bespoke'). Activa chispas/levitación por defecto. */
  collection?: CollectionId | string;
  /** Pieza 1-of-1: activa chispas/levitación por defecto. */
  isOneOfOne?: boolean;
  /** Preset VFX explícito (por defecto se deriva de `slug`). `'none'` desactiva el preset. */
  vfxPreset?: VfxPresetId | 'none';
  /** Degradado del producto, usado como placeholder si la imagen falla. */
  gradient?: string[];
  /** Halo radial de fondo (por defecto sí). Desactívalo si el contenedor ya pinta su propio halo. */
  showGlow?: boolean;
  /** Carga inmediata (imagen principal visible al entrar). Por defecto `loading="lazy"`. */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  containerClassName?: string;
  showSparkles?: boolean;
  showShimmer?: boolean;
  animateLevitate?: boolean;
  interactiveHover?: boolean;
  condition?: string;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  onClick?: () => void;
}

interface Sparkle {
  top: string;
  left?: string;
  right?: string;
  size: string;
  delay: string;
  duration: string;
  white: boolean;
}

// 7 puntos estratégicos (hoja, lomo, anillo). `white` = destello blanco; si no, color de la pieza.
const SPARKLES: Sparkle[] = [
  { top: '24%', left: '22%', size: 'w-4 h-4', delay: '0s', duration: '2.6s', white: false },
  { top: '30%', left: '34%', size: 'w-5 h-5', delay: '0.6s', duration: '3.0s', white: true },
  { top: '38%', left: '46%', size: 'w-4 h-4', delay: '1.3s', duration: '2.5s', white: false },
  { top: '48%', left: '25%', size: 'w-4 h-4', delay: '1.9s', duration: '3.2s', white: true },
  { top: '56%', right: '20%', size: 'w-5 h-5', delay: '0.8s', duration: '2.8s', white: false },
  { top: '44%', right: '14%', size: 'w-3.5 h-3.5', delay: '1.6s', duration: '2.7s', white: true },
  { top: '19%', left: '28%', size: 'w-3.5 h-3.5', delay: '1.1s', duration: '2.9s', white: false },
];

/** Resuelve el producto del catálogo por slug o (compatibilidad) por la ruta de la imagen. */
function resolveProduct(slug: string, image: string): Product | undefined {
  return (slug ? getProductBySlug(slug) : undefined) ?? karambits.find((k) => k.image === image);
}

/** Placeholder (degradado del producto) cuando la imagen falla — p. ej. la CDN de Steam. */
const ImageFallback: React.FC<{ gradient: string[]; accent: string; label: string }> = ({ gradient, accent, label }) => {
  const colors = gradient.length > 1 ? gradient : [accent, '#0a0d16'];
  return (
    <div
      role="img"
      aria-label={label}
      className="relative flex h-3/4 w-3/4 items-center justify-center rounded-[28%] opacity-80"
      style={{
        background: `conic-gradient(from 210deg, ${[...colors, colors[0]].join(', ')})`,
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.18), 0 10px 30px ${accent}40`,
      }}
    >
      <svg viewBox="0 0 64 64" className="h-1/2 w-1/2 text-white/70" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M44 8c-14 2-26 14-26 30 0 8 4 14 10 18-2-6 0-12 6-16 6-4 12-10 10-32Z" />
        <circle cx="46" cy="50" r="6" />
      </svg>
    </div>
  );
};

export const KarambitVFXImage: React.FC<KarambitVFXImageProps> = ({
  image,
  name = '',
  slug = '',
  rarity = '',
  category = '',
  accentColor = '#f59e0b',
  visualFilter,
  collection,
  isOneOfOne,
  vfxPreset,
  gradient,
  priority = false,
  showGlow = true,
  className = '',
  imgClassName = '',
  containerClassName = '',
  showSparkles,
  showShimmer = true,
  animateLevitate,
  interactiveHover = true,
  condition,
  style,
  imgStyle,
  onClick,
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const product = resolveProduct(slug, image);
  const resolvedCollection = collection ?? product?.collection;
  const resolvedOneOfOne = isOneOfOne ?? product?.isOneOfOne ?? false;
  const presetId = vfxPreset === 'none' ? undefined : vfxPreset ?? (product?.slug ?? slug);
  const preset = getVfxPreset(presetId);

  // Compatibilidad: rarity/category de pantallas antiguas siguen marcando una pieza Founder.
  const isFounderBespoke =
    Boolean(preset) ||
    resolvedCollection === 'founder-bespoke' ||
    resolvedOneOfOne ||
    rarity === 'Mythic Bespoke' ||
    category.includes('Founder Bespoke');

  let vfxFilter: string;
  let sparkleColor = '#ffffff';
  let radialGlowColor = accentColor;

  if (preset) {
    vfxFilter = preset.filter;
    sparkleColor = preset.sparkle;
    radialGlowColor = preset.glow;
  } else if (visualFilter) {
    vfxFilter = visualFilter;
  } else if (rarity === 'Covert' || rarity === 'Extraordinary') {
    vfxFilter =
      'drop-shadow(0 0 2px rgba(255,255,255,0.45)) drop-shadow(0 10px 24px rgba(239,68,68,0.4))';
    radialGlowColor = '#ef4444';
  } else if (name.toLowerCase().includes('doppler')) {
    vfxFilter =
      'drop-shadow(0 0 2px rgba(255,255,255,0.45)) drop-shadow(0 10px 24px rgba(168,85,247,0.45))';
    radialGlowColor = '#a855f7';
  } else if (rarity === 'Classified') {
    vfxFilter =
      'drop-shadow(0 0 2px rgba(255,255,255,0.35)) drop-shadow(0 8px 20px rgba(236,72,153,0.35))';
    radialGlowColor = '#ec4899';
  } else if (rarity === 'Mil-Spec') {
    vfxFilter =
      'drop-shadow(0 0 2px rgba(255,255,255,0.3)) drop-shadow(0 8px 16px rgba(59,130,246,0.3))';
    radialGlowColor = '#3b82f6';
  } else {
    vfxFilter = `drop-shadow(0 0 2px rgba(255,255,255,0.3)) drop-shadow(0 10px 22px ${accentColor}40)`;
    radialGlowColor = accentColor;
  }

  const shouldSparkle = showSparkles !== undefined ? showSparkles : isFounderBespoke;
  const shouldLevitate = animateLevitate !== undefined ? animateLevitate : isFounderBespoke;
  const failed = failedSrc === image;
  const fallbackGradient = gradient ?? product?.gradient ?? [];

  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full flex items-center justify-center select-none ${containerClassName} ${className}`}
      style={style}
    >
      {/* Background Radial Glow */}
      {showGlow && (
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle at 48% 52%, ${radialGlowColor}38 0%, ${radialGlowColor}12 45%, transparent 72%)`,
          opacity: isFounderBespoke ? 0.75 : 0.35,
        }}
      />
      )}

      {/* Main Knife Stage with Floating and Hover Effects */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${
          shouldLevitate ? 'animate-bespoke-levitate' : ''
        } ${
          interactiveHover
            ? 'group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500'
            : ''
        }`}
      >
        {failed ? (
          <ImageFallback gradient={fallbackGradient} accent={accentColor} label={name || 'Karambit'} />
        ) : (
          <img
            src={image}
            alt={name || 'Karambit'}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailedSrc(image)}
            style={{
              filter: vfxFilter,
              ...imgStyle,
            }}
            className={`w-full h-full object-contain pointer-events-none transition-all duration-500 ${
              condition === 'Battle-Scarred' ? 'contrast-125 saturate-75 brightness-90' : ''
            } ${imgClassName}`}
          />
        )}

        {/* Luxury Shimmer Sweep (Diagonal Light Beam crossing the knife) */}
        {showShimmer && isFounderBespoke && !failed && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute -inset-y-full -left-full w-2/3 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer-sweep" />
          </div>
        )}

        {/* Live VVS1 Animated 4-Pointed Diamond Sparkles */}
        {shouldSparkle && !failed && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {SPARKLES.map((sp, idx) => {
              const color = sp.white ? '#ffffff' : sparkleColor;
              return (
                <div
                  key={idx}
                  className={`absolute ${sp.size} animate-sparkle-twinkle`}
                  style={{
                    top: sp.top,
                    left: sp.left,
                    right: sp.right,
                    animationDelay: sp.delay,
                    animationDuration: sp.duration,
                    color,
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-full h-full drop-shadow-[0_0_6px_rgba(255,255,255,0.95)]"
                    style={{
                      filter: `drop-shadow(0 0 3px #ffffff) drop-shadow(0 0 8px ${color})`,
                    }}
                  >
                    <path
                      d="M12 0 C12 6.5 6.5 12 0 12 C6.5 12 12 17.5 12 24 C12 17.5 17.5 12 24 12 C17.5 12 12 6.5 12 0 Z"
                      fill="#ffffff"
                    />
                    <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
                  </svg>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default KarambitVFXImage;
