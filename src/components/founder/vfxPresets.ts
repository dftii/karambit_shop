// ─── Presets VFX de las piezas Founder Bespoke ──────────────────────────────
// ÚNICA fuente de los efectos por pieza. Clave = `slug` del producto. Añadir una pieza nueva
// es añadir una entrada aquí (no hay detección por nombre/imagen).
export interface VfxPreset {
  /** Filtro CSS (contorno luminoso multicapa) aplicado a la imagen. */
  filter: string;
  /** Color de los destellos de diamante. */
  sparkle: string;
  /** Color del halo radial de fondo. */
  glow: string;
}

export const VFX_PRESETS = {
  'celestial-pink-diamond': {
    filter:
      'contrast(1.12) saturate(1.25) drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 10px rgba(244,114,182,0.95)) drop-shadow(0 0 28px rgba(56,189,248,0.75))',
    sparkle: '#f472b6',
    glow: '#f472b6',
  },
  'diamond-sovereign': {
    filter:
      'contrast(1.15) drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 12px rgba(224,242,254,0.95)) drop-shadow(0 0 30px rgba(56,189,248,0.65))',
    sparkle: '#bae6fd',
    glow: '#38bdf8',
  },
  'royal-blood-ruby-platinum': {
    filter:
      'contrast(1.15) saturate(1.2) drop-shadow(0 0 2px #fecdd3) drop-shadow(0 0 12px rgba(225,29,72,0.95)) drop-shadow(0 0 28px rgba(159,18,57,0.75))',
    sparkle: '#fda4af',
    glow: '#e11d48',
  },
  '24k-gold-meteorite': {
    filter:
      'contrast(1.15) saturate(1.2) drop-shadow(0 0 2px #fef08a) drop-shadow(0 0 12px rgba(245,158,11,0.95)) drop-shadow(0 0 28px rgba(217,119,6,0.75))',
    sparkle: '#fef08a',
    glow: '#facc15',
  },
} as const satisfies Record<string, VfxPreset>;

export type VfxPresetId = keyof typeof VFX_PRESETS;

export const getVfxPreset = (id: string | undefined): VfxPreset | undefined =>
  id && id in VFX_PRESETS ? VFX_PRESETS[id as VfxPresetId] : undefined;
