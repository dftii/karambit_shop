import React from 'react';
import type { Rarity } from '../data/karambits';

export interface KarambitVFXImageProps {
  image: string;
  name?: string;
  slug?: string;
  rarity?: Rarity | string;
  category?: string;
  accentColor?: string;
  visualFilter?: string;
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

export const KarambitVFXImage: React.FC<KarambitVFXImageProps> = ({
  image,
  name = '',
  slug = '',
  rarity = '',
  category = '',
  accentColor = '#f59e0b',
  visualFilter,
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
  const normalizedSlug = slug.toLowerCase();
  const normalizedName = name.toLowerCase();

  const isPinkDiamond =
    normalizedSlug.includes('celestial-pink') ||
    normalizedName.includes('celestial pink') ||
    image.includes('celestial-pink-diamond');

  const isDiamondSovereign =
    normalizedSlug.includes('diamond-sovereign') ||
    normalizedName.includes('diamond sovereign') ||
    image.includes('diamond-sovereign');

  const isRubyPlatinum =
    normalizedSlug.includes('ruby-platinum') ||
    normalizedName.includes('blood ruby') ||
    image.includes('ruby-platinum');

  const isGoldMeteorite =
    normalizedSlug.includes('gold-meteorite') ||
    normalizedName.includes('gibeon meteorite') ||
    image.includes('gold-meteorite');

  const isFounderBespoke =
    isPinkDiamond ||
    isDiamondSovereign ||
    isRubyPlatinum ||
    isGoldMeteorite ||
    rarity === 'Mythic Bespoke' ||
    category.includes('Founder Bespoke');

  // Compute bespoke filter based on official prompt specs
  let vfxFilter = '';
  let sparkleColor = '#ffffff';
  let radialGlowColor = accentColor;

  if (isPinkDiamond) {
    vfxFilter =
      'contrast(1.12) saturate(1.25) drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 10px rgba(244,114,182,0.95)) drop-shadow(0 0 28px rgba(56,189,248,0.75))';
    sparkleColor = '#f472b6';
    radialGlowColor = '#f472b6';
  } else if (isDiamondSovereign) {
    vfxFilter =
      'contrast(1.15) drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 12px rgba(224,242,254,0.95)) drop-shadow(0 0 30px rgba(56,189,248,0.65))';
    sparkleColor = '#bae6fd';
    radialGlowColor = '#38bdf8';
  } else if (isRubyPlatinum) {
    vfxFilter =
      'contrast(1.15) saturate(1.2) drop-shadow(0 0 2px #fecdd3) drop-shadow(0 0 12px rgba(225,29,72,0.95)) drop-shadow(0 0 28px rgba(159,18,57,0.75))';
    sparkleColor = '#fda4af';
    radialGlowColor = '#e11d48';
  } else if (isGoldMeteorite) {
    vfxFilter =
      'contrast(1.15) saturate(1.2) drop-shadow(0 0 2px #fef08a) drop-shadow(0 0 12px rgba(245,158,11,0.95)) drop-shadow(0 0 28px rgba(217,119,6,0.75))';
    sparkleColor = '#fef08a';
    radialGlowColor = '#facc15';
  } else if (visualFilter) {
    vfxFilter = visualFilter;
  } else if (rarity === 'Covert' || rarity === 'Extraordinary') {
    vfxFilter =
      'drop-shadow(0 0 2px rgba(255,255,255,0.45)) drop-shadow(0 10px 24px rgba(239,68,68,0.4))';
    radialGlowColor = '#ef4444';
  } else if (normalizedName.includes('doppler')) {
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

  // 7 Strategic VVS1 Diamond Sparkle Coordinates on Blade and Ring
  const sparkles = [
    { top: '24%', left: '22%', size: 'w-4 h-4', delay: '0s', duration: '2.6s', color: sparkleColor },
    { top: '30%', left: '34%', size: 'w-5 h-5', delay: '0.6s', duration: '3.0s', color: '#ffffff' },
    { top: '38%', left: '46%', size: 'w-4 h-4', delay: '1.3s', duration: '2.5s', color: sparkleColor },
    { top: '48%', left: '25%', size: 'w-4 h-4', delay: '1.9s', duration: '3.2s', color: '#ffffff' },
    { top: '56%', right: '20%', size: 'w-5 h-5', delay: '0.8s', duration: '2.8s', color: sparkleColor }, // Finger Ring Hole Edge
    { top: '44%', right: '14%', size: 'w-3.5 h-3.5', delay: '1.6s', duration: '2.7s', color: '#ffffff' }, // Ring Pommel
    { top: '19%', left: '28%', size: 'w-3.5 h-3.5', delay: '1.1s', duration: '2.9s', color: sparkleColor }, // Upper Blade Spine
  ];

  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full flex items-center justify-center select-none ${containerClassName} ${className}`}
      style={style}
    >
      {/* Background Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle at 48% 52%, ${radialGlowColor}38 0%, ${radialGlowColor}12 45%, transparent 72%)`,
          opacity: isFounderBespoke ? 0.75 : 0.35,
        }}
      />

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
        {/* Real Transparent PNG Image with Multi-layer Glow Contour */}
        <img
          src={image}
          alt={name || 'Karambit'}
          style={{
            filter: vfxFilter,
            ...imgStyle,
          }}
          className={`w-full h-full object-contain pointer-events-none transition-all duration-500 ${
            condition === 'Battle-Scarred' ? 'contrast-125 saturate-75 brightness-90' : ''
          } ${imgClassName}`}
        />

        {/* Luxury Shimmer Sweep (Diagonal Light Beam crossing the knife) */}
        {showShimmer && isFounderBespoke && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute -inset-y-full -left-full w-2/3 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer-sweep" />
          </div>
        )}

        {/* Live VVS1 Animated 4-Pointed Diamond Sparkles */}
        {shouldSparkle && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {sparkles.map((sp, idx) => (
              <div
                key={idx}
                className={`absolute ${sp.size} animate-sparkle-twinkle`}
                style={{
                  top: sp.top,
                  left: sp.left,
                  right: sp.right,
                  animationDelay: sp.delay,
                  animationDuration: sp.duration,
                  color: sp.color,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full drop-shadow-[0_0_6px_rgba(255,255,255,0.95)]"
                  style={{
                    filter: `drop-shadow(0 0 3px #ffffff) drop-shadow(0 0 8px ${sp.color})`,
                  }}
                >
                  <path
                    d="M12 0 C12 6.5 6.5 12 0 12 C6.5 12 12 17.5 12 24 C12 17.5 17.5 12 24 12 C17.5 12 12 6.5 12 0 Z"
                    fill="#ffffff"
                  />
                  <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KarambitVFXImage;
