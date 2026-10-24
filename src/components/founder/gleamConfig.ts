/**
 * Destellos ("gleam") de las piezas Founder Bespoke.
 *
 * Las posiciones son porcentajes de la caja renderizada de la imagen (no del contenedor):
 * hoja a la izquierda (~0–40 %), mango en arco (~35–80 %) y anilla a la derecha (~85–100 %).
 * Se han comprobado contra el canal alfa de cada PNG para que caigan siempre sobre metal opaco.
 */

export const GLEAM_WHITE = '#FFFFFF';
export const GLEAM_PINK = '#FF2E7E';
export const GLEAM_GOLD = '#FFD700';

export type SparkleSize = 'lg' | 'md' | 'sm';

export interface SparkleSpec {
  /** % horizontal dentro de la imagen renderizada. */
  x: number;
  /** % vertical dentro de la imagen renderizada. */
  y: number;
  size: SparkleSize;
  color: string;
  /** Retardo del parpadeo en segundos (escalonado para que no pulsen a la vez). */
  delay: number;
  /** Duración del ciclo de parpadeo en segundos. */
  duration: number;
}

/** Ancho del destello como % de la caja de la imagen, con tope en px (clamp). */
export const SPARKLE_WIDTH: Record<SparkleSize, string> = {
  lg: 'clamp(14px, 6%, 34px)',
  md: 'clamp(11px, 4.2%, 26px)',
  sm: 'clamp(9px, 2.8%, 18px)',
};

const s = (
  x: number,
  y: number,
  size: SparkleSize,
  color: string,
  delay: number,
  duration: number
): SparkleSpec => ({ x, y, size, color, delay, duration });

export const GLEAM_SPARKLES: Record<string, SparkleSpec[]> = {
  // Diamante rosa: blanco + acento rosa.
  'celestial-pink-diamond': [
    s(12, 50, 'lg', GLEAM_PINK, 0, 4.2), // punta de la hoja
    s(22, 31, 'sm', GLEAM_WHITE, 1.4, 3.6), // filo de la hoja
    s(38, 20, 'md', GLEAM_WHITE, 0.7, 4.8), // lomo
    s(60, 16, 'lg', GLEAM_WHITE, 2.1, 4), // mango
    s(96, 47, 'md', GLEAM_WHITE, 1.1, 5), // anilla, lado derecho
    s(90, 63, 'sm', GLEAM_PINK, 2.8, 3.8), // anilla, arco inferior
  ],
  // Diamond Sovereign (oro blanco + VVS1): solo blanco.
  'diamond-sovereign': [
    s(12, 52, 'lg', GLEAM_WHITE, 0.3, 4.4),
    s(22, 34, 'sm', GLEAM_WHITE, 1.8, 3.4),
    s(40, 22, 'md', GLEAM_WHITE, 1, 4.6),
    s(60, 17, 'lg', GLEAM_WHITE, 2.4, 4.2),
    s(96, 49, 'md', GLEAM_WHITE, 0.6, 5.2),
    s(90, 66, 'sm', GLEAM_WHITE, 3, 3.6),
  ],
  // Oro 24K + meteorito: blanco + oro.
  '24k-gold-meteorite': [
    s(12, 53, 'md', GLEAM_WHITE, 0.9, 4.6),
    s(22, 34, 'sm', GLEAM_GOLD, 2, 3.8),
    s(38, 23, 'lg', GLEAM_GOLD, 0.2, 4.4),
    s(60, 17, 'md', GLEAM_WHITE, 1.6, 4.8),
    s(96, 46, 'lg', GLEAM_WHITE, 2.6, 4),
    s(90, 63, 'sm', GLEAM_GOLD, 1.2, 3.6),
  ],
  // Rubí + platino 950: blanco + rosa.
  'royal-blood-ruby-platinum': [
    s(12, 50, 'md', GLEAM_WHITE, 1.3, 4.2),
    s(22, 34, 'sm', GLEAM_PINK, 0.4, 3.6),
    s(38, 22, 'lg', GLEAM_WHITE, 2.2, 4.6),
    s(60, 18, 'md', GLEAM_PINK, 0.8, 4.4),
    s(96, 52, 'lg', GLEAM_WHITE, 1.9, 5),
    s(90, 67, 'sm', GLEAM_WHITE, 3.1, 3.8),
  ],
};
