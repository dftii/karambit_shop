import React, { memo, useState } from 'react';

export interface KarambitVFXImageProps {
  image: string;
  name?: string;
  /** Carga inmediata (imagen principal visible al entrar). Por defecto `loading="lazy"`. */
  priority?: boolean;
  /** Hover = zoom 1.03 (requiere un ancestro `.group`). */
  interactiveHover?: boolean;
  className?: string;
  imgClassName?: string;
  containerClassName?: string;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  onClick?: () => void;
}

/** Placeholder editorial cuando la imagen falla: recuadro de 1px con el icono de la pieza. */
const PlainFallback: React.FC<{ label: string }> = ({ label }) => (
  <div role="img" aria-label={label} className="flex h-3/4 w-3/4 items-center justify-center border border-line text-ink-3">
    <svg viewBox="0 0 64 64" className="h-1/2 w-1/2" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M44 8c-14 2-26 14-26 30 0 8 4 14 10 18-2-6 0-12 6-16 6-4 12-10 10-32Z" />
      <circle cx="46" cy="50" r="6" />
    </svg>
  </div>
);

export const KarambitVFXImage = memo(function KarambitVFXImage({
  image,
  name = '',
  priority = false,
  interactiveHover = true,
  className = '',
  imgClassName = '',
  containerClassName = '',
  style,
  imgStyle,
  onClick,
}: KarambitVFXImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === image;

  return (
    <div
      onClick={onClick}
      className={`relative flex h-full w-full select-none items-center justify-center ${containerClassName} ${className}`}
      style={style}
    >
      {failed ? (
        <PlainFallback label={name || 'Karambit'} />
      ) : (
        <img
          src={image}
          alt={name || 'Karambit'}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailedSrc(image)}
          style={imgStyle}
          className={`pointer-events-none h-full w-full object-contain transition-transform duration-300 ease-out ${
            interactiveHover ? 'group-hover:scale-[1.03]' : ''
          } ${imgClassName}`}
        />
      )}
    </div>
  );
});

export default KarambitVFXImage;
