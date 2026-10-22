import { hideBrokenImage } from '../lib/imageFallback';
import React from 'react';
import { karambits } from '../data/karambits';

interface KarambitSVGProps {
  gradient?: string[];
  patternStyle?: 'linear' | 'radial' | 'conic' | 'multi';
  size?: number;
  className?: string;
  glowColor?: string;
  animate?: boolean;
  statTrak?: boolean;
  statTrakCount?: number | string;
  nameTag?: string;
  image?: string;
  /** Texto alternativo (p. ej. nombre del producto). */
  alt?: string;
}

const KarambitSVG: React.FC<KarambitSVGProps> = ({
  gradient = ['#ffd700', '#ff6b00', '#ff1493'],
  size = 280,
  className = '',
  animate = true,
  statTrak = false,
  statTrakCount = '007',
  nameTag,
  image,
  alt = 'CS2 Karambit',
}) => {
  // Resolve authentic CS2 high-res transparent PNG image from Steam
  const resolvedImage =
    image ||
    karambits.find((k) => k.gradient[0]?.toLowerCase() === gradient[0]?.toLowerCase())?.image ||
    karambits[0].image;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className} ${
        animate ? 'transition-transform duration-300 ease-out hover:scale-[1.03]' : ''
      }`}
      style={{ width: size, height: size }}
    >
      <img loading="lazy" decoding="async" onError={hideBrokenImage}
        src={resolvedImage}
        alt={alt}
        className="pointer-events-none h-full w-full object-contain"
      />
      {statTrak && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap border border-ink bg-ink px-2 py-1 font-mono text-[10px] font-medium leading-none tracking-[0.08em] text-paper">
          ST™ <span className="text-pink">{String(statTrakCount).padStart(3, '0')}</span>
        </div>
      )}
      {nameTag && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 whitespace-nowrap border border-ink bg-paper px-2 py-1 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink">
          {nameTag}
        </div>
      )}
    </div>
  );
};

export default KarambitSVG;
