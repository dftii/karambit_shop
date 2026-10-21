// ─── Metadatos editoriales de las piezas Founder Bespoke (The Founder's Vault) ──
// Datos de presentación (materiales, gemas, relato). Precio, nombre, specs técnicos y rareza
// salen SIEMPRE del catálogo (src/data/karambits.ts); aquí solo se añade lo narrativo.
import { getFounderBespoke, type Product } from '../../data/karambits';

export interface PieceGem {
  label: string;
  value: string;
}

export interface PieceMeta {
  /** Numeral romano de la pieza dentro del Vault. */
  numeral: string;
  /** Nombre corto para chips y títulos. */
  shortName: string;
  /** Frase de apertura del panel. */
  tagline: string;
  /** Relato corto (no repite la descripción del catálogo). */
  story: string;
  /** Gemas / metales destacados. */
  gems: PieceGem[];
  /** Color principal del panel (borde, halo). */
  tint: string;
  /** Segundo color del panel (contraluz). */
  tint2: string;
}

export const PIECE_META: Record<string, PieceMeta> = {
  'celestial-pink-diamond': {
    numeral: 'I',
    shortName: 'Celestial Pink Diamond',
    tagline: 'La obra cumbre del Vault.',
    story:
      'Platino imperial y oro rosa sobre un núcleo de meteorito lunar, cubierto por diamantes rosas Argyle y destellos azules Hope. La pieza más alta de la colección y la que da nombre al Vault.',
    gems: [
      { label: 'Gemas', value: '680 diamantes rosas Argyle VVS1' },
      { label: 'Acento', value: 'Diamantes azules Hope' },
      { label: 'Metal', value: 'Platino 950 · Oro rosa 24K' },
    ],
    tint: '#f472b6',
    tint2: '#38bdf8',
  },
  'diamond-sovereign': {
    numeral: 'II',
    shortName: 'Diamond Sovereign',
    tagline: 'Pavé táctico en oro blanco.',
    story:
      'Hoja de oro blanco macizo de 18 quilates con pavé de diamantes naturales engastados a mano y anillo de exhibición. Frío, afilado y absolutamente soberano.',
    gems: [
      { label: 'Gemas', value: '420+ diamantes naturales VVS1' },
      { label: 'Metal', value: 'Oro blanco macizo 18K' },
      { label: 'Respaldo', value: 'Certificado gemológico notariado' },
    ],
    tint: '#38bdf8',
    tint2: '#e0f2fe',
  },
  '24k-gold-meteorite': {
    numeral: 'III',
    shortName: '24K Gold & Gibeon',
    tagline: 'Oro macizo y hierro de las estrellas.',
    story:
      'Oro de 24 quilates fusionado con los patrones Widmanstätten de un meteorito Gibeon prehistórico en el núcleo. Forjado en el taller privado del CEO.',
    gems: [
      { label: 'Núcleo', value: 'Meteorito Gibeon (Widmanstätten)' },
      { label: 'Metal', value: 'Oro macizo 24K' },
      { label: 'Anillo', value: 'Oro macizo 24K' },
    ],
    tint: '#facc15',
    tint2: '#f59e0b',
  },
  'royal-blood-ruby-platinum': {
    numeral: 'IV',
    shortName: 'Royal Blood Ruby',
    tagline: 'Rubíes sangre de paloma sobre platino.',
    story:
      'Platino 950 pulido a espejo con rubíes sangre de paloma birmanos facetados de máxima pureza y anillo sellado con la firma de DuFiTuFi (CEO).',
    gems: [
      { label: 'Gemas', value: 'Rubíes sangre de paloma birmanos' },
      { label: 'Metal', value: 'Platino puro 950' },
      { label: 'Anillo', value: 'Platino con rubí táctico' },
    ],
    tint: '#f43f5e',
    tint2: '#fda4af',
  },
};

const FALLBACK_META: PieceMeta = {
  numeral: '·',
  shortName: 'Pieza Founder',
  tagline: 'Pieza 1-of-1.',
  story: 'Pieza irrepetible de la colección Founder Bespoke.',
  gems: [],
  tint: '#f59e0b',
  tint2: '#fde68a',
};

export const getPieceMeta = (product: Pick<Product, 'slug' | 'accentColor'>): PieceMeta =>
  PIECE_META[product.slug] ?? { ...FALLBACK_META, tint: product.accentColor };

/** Piezas del Vault en orden de presentación (de mayor a menor valor). */
export const getVaultPieces = (): Product[] =>
  [...getFounderBespoke()].sort((a, b) => b.basePrice - a.basePrice);
