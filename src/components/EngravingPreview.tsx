import React from 'react';
import { formatStatTrak } from '../lib/productDisplay';
import { useVaultPick } from './ui/vaultTone';

const POSITION = {
  statTrak: { top: '55%', left: '42%', transform: 'translate(-50%, -50%) rotate(-35deg)' },
  nameTag: { top: '38%', left: '44%', transform: 'translate(-50%, -50%) rotate(22deg)' },
} as const;

/**
 * Vista previa del grabado StatTrak™ sobre la hoja. Se coloca DENTRO del contenedor de la imagen
 * (position: relative) para que rote y se voltee con ella. Plano, mono, sin brillos.
 */
export const StatTrakPreview: React.FC<{ value: string; compact?: boolean }> = ({ value, compact = false }) => {
  const t = useVaultPick();
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-30 select-none whitespace-nowrap border ${t(
        'border-ink',
        'border-paper/40'
      )} bg-ink font-mono font-medium leading-none tracking-[0.08em] text-paper ${
        compact ? 'px-1.5 py-1 text-[10px]' : 'px-2 py-1.5 text-[11px]'
      }`}
      style={POSITION.statTrak}
    >
      ST™ <span className="text-pink">{formatStatTrak(value)}</span>
    </span>
  );
};

/** Vista previa de la placa NameTag sobre el mango. */
export const NameTagPreview: React.FC<{ text: string; compact?: boolean }> = ({ text, compact = false }) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none absolute z-30 select-none whitespace-nowrap border border-ink bg-paper font-mono font-medium uppercase leading-none tracking-[0.08em] text-ink ${
      compact ? 'px-1.5 py-1 text-[10px]' : 'px-2 py-1.5 text-[11px]'
    }`}
    style={POSITION.nameTag}
  >
    {text}
  </span>
);
