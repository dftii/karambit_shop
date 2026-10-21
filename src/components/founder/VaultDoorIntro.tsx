import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface VaultDoorIntroProps {
  /** Se llama una vez cuando la puerta termina de abrirse o el usuario la salta. */
  onDone: () => void;
}

const CLOSED_MS = 1100;
const OPEN_MS = 1300;

const RIVETS = Array.from({ length: 7 }, (_, i) => i);

const DoorPanel: React.FC<{ side: 'left' | 'right'; opening: boolean }> = ({ side, opening }) => (
  <motion.div
    className={`absolute inset-y-0 ${side === 'left' ? 'left-0 border-r' : 'right-0 border-l'} w-1/2 border-amber-300/30`}
    initial={{ x: 0 }}
    animate={{ x: opening ? (side === 'left' ? '-101%' : '101%') : 0 }}
    transition={{ duration: OPEN_MS / 1000, ease: [0.7, 0, 0.2, 1] }}
    style={{
      background:
        'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 38px), linear-gradient(90deg, #12141d 0%, #242a3a 50%, #0e1018 100%)',
      boxShadow: side === 'left' ? 'inset -18px 0 40px rgba(0,0,0,0.6)' : 'inset 18px 0 40px rgba(0,0,0,0.6)',
    }}
  >
    <div className={`absolute inset-y-0 ${side === 'left' ? 'right-5' : 'left-5'} flex flex-col justify-around`} aria-hidden="true">
      {RIVETS.map((i) => (
        <span key={i} className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-200 to-amber-700 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
      ))}
    </div>
  </motion.div>
);

/**
 * Entrada cinematográfica: puerta de cámara acorazada que se abre. Se puede saltar (botón, clic,
 * Escape). La página decide si mostrarla (una vez por sesión y nunca con prefers-reduced-motion).
 */
export const VaultDoorIntro: React.FC<VaultDoorIntroProps> = ({ onDone }) => {
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const openTimer = window.setTimeout(() => setOpening(true), CLOSED_MS);
    const doneTimer = window.setTimeout(onDone, CLOSED_MS + OPEN_MS + 100);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(doneTimer);
      window.removeEventListener('keydown', onKey);
    };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[150] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-label="Abriendo The Founder's Vault"
      onClick={onDone}
    >
      {/* Luz que se filtra por la rendija al abrir */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: opening ? 1 : 0.25 }}
        transition={{ duration: 0.8 }}
        style={{
          background:
            'radial-gradient(60% 80% at 50% 50%, rgba(253,224,71,0.55), rgba(245,158,11,0.18) 45%, #06070b 80%)',
        }}
      />

      <DoorPanel side="left" opening={opening} />
      <DoorPanel side="right" opening={opening} />

      {/* Rueda de bloqueo central */}
      <motion.div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-5"
        animate={{ opacity: opening ? 0 : 1, scale: opening ? 1.25 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.svg
          viewBox="0 0 120 120"
          className="h-28 w-28 sm:h-36 sm:w-36"
          animate={{ rotate: opening ? 120 : 360 }}
          transition={{ duration: opening ? 0.6 : CLOSED_MS / 1000, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="vaultWheel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="54" fill="#0b0d14" stroke="url(#vaultWheel)" strokeWidth="4" />
          <circle cx="60" cy="60" r="38" fill="none" stroke="url(#vaultWheel)" strokeWidth="1.5" strokeDasharray="3 5" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 60 60)`}>
              <line x1="60" y1="60" x2="60" y2="14" stroke="url(#vaultWheel)" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="60" cy="12" r="5" fill="url(#vaultWheel)" />
            </g>
          ))}
          <circle cx="60" cy="60" r="11" fill="url(#vaultWheel)" />
          <circle cx="60" cy="60" r="4" fill="#0b0d14" />
        </motion.svg>
        <div className="text-center">
          <p className="font-tech text-[10px] font-bold uppercase tracking-[0.35em] text-amber-300 sm:text-xs">
            Acceso autorizado
          </p>
          <p className="mt-1 font-display text-lg font-black uppercase tracking-wider text-white sm:text-2xl">
            The Founder&apos;s Vault
          </p>
        </div>
      </motion.div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDone();
        }}
        className="absolute bottom-6 right-6 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-4 py-2 font-display text-xs font-black uppercase tracking-wider text-gray-200 transition-colors hover:border-amber-300 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-krm-accent"
      >
        <X className="h-3.5 w-3.5" />
        Saltar
      </button>
    </motion.div>
  );
};

export default VaultDoorIntro;
