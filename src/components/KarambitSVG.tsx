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
}) => {
  // Resolve authentic CS2 high-res transparent PNG image from Steam
  const resolvedImage =
    image ||
    karambits.find((k) => k.gradient[0]?.toLowerCase() === gradient[0]?.toLowerCase())?.image ||
    karambits[0].image;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className} ${
        animate ? 'hover:scale-105 hover:-rotate-6 transition-all duration-500' : ''
      }`}
      style={{ width: size, height: size }}
    >
      <img
        src={resolvedImage}
        alt="CS2 Karambit"
        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_35px_rgba(245,158,11,0.25)]"
      />
      {statTrak && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-black/90 border border-amber-500/50 text-amber-400 font-mono text-[10px] shadow-lg tracking-wider font-bold">
          ★ {String(statTrakCount).padStart(6, '0')}
        </div>
      )}
      {nameTag && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-gray-900/90 border border-gray-400 text-gray-200 font-mono text-[9px] tracking-widest shadow-md uppercase">
          '{nameTag}'
        </div>
      )}
    </div>
  );
};

export default KarambitSVG;
