// ─── Types ────────────────────────────────────────────────
export type Rarity = 'Covert' | 'Extraordinary' | 'Classified' | 'Mil-Spec' | 'Mythic Bespoke';
export type Category =
  | 'Doppler Series'
  | 'Iconic Skins'
  | 'Esports Edition'
  | 'Tactical & Forged CS2'
  | 'Military Spec-Ops CS2'
  | 'Founder Bespoke (Joyería 1:1)';
export type BladeType = 'Sin Filo (Tricks/Exhibición)' | 'Afilada';

export interface ProductSpecs {
  steel: string;
  totalLength: string;
  bladeLength: string;
  scale: string;
  weight: string;
  handleMaterial: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  rarity: Rarity;
  basePrice: number;
  originalPrice?: number;
  battleScarredPrice: number;
  rating: number;
  reviewsCount: number;
  description: string;
  specs: ProductSpecs;
  gradient: string[];
  accentColor: string;
  patternStyle: 'linear' | 'radial' | 'conic' | 'multi';
  tags: string[];
  image: string;
  visualFilter?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isLimitedEdition?: boolean;
  isExclusive?: boolean;
}

export interface Accessory {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  icon: string;
  gradient: string[];
}

// ─── Shared specs ────────────────────────────────────────
const BASE_SPECS: ProductSpecs = {
  steel: 'Acero Inoxidable 440C',
  totalLength: '19 cm',
  bladeLength: '9 cm',
  scale: '1:1 (Réplica fiel al modelo in-game)',
  weight: '210 g',
  handleMaterial: 'G10 Fibra de vidrio texturizada',
};

const BESPOKE_SPECS: ProductSpecs = {
  steel: 'Oro 18K / 24K & Platino 950 sobre núcleo 440C',
  totalLength: '19.2 cm',
  bladeLength: '9 cm',
  scale: '1:1 (Joyería fina funcional CS2)',
  weight: '340 g',
  handleMaterial: 'Fibra de carbono forjada y engaste de piedras preciosas',
};

// ─── Catálogo de Karambits ───────────────────────────────
export const karambits: Product[] = [
    // ═════════════════════════════════════════════════════════
  // 1. THE FOUNDER'S VAULT (ALTA JOYERÍA 1:1 - MYTHIC BESPOKE)
  // ═════════════════════════════════════════════════════════
  {
    id: 'krm-celestial-pink-diamond',
    name: '★ Karambit | Imperial Celestial Pink Diamond & Californium — DuFiTuFi Design (CEO)',
    slug: 'celestial-pink-diamond',
    category: 'Founder Bespoke (Joyería 1:1)',
    rarity: 'Mythic Bespoke',
    basePrice: 24990.00,
    originalPrice: 34986.00,
    battleScarredPrice: 19990.00,
    rating: 5.0,
    reviewsCount: 77,
    description:
      'La obra cumbre firmada personalmente por DuFiTuFi (CEO). Forjado en una aleación irrepetible de Platino Imperial, Oro Rosa de 24K y núcleo de meteorito lunar, completamente recubierto con 680 Diamantes Rosas Argyle VVS1 y Diamantes Azules Hope engastados al microscopio. Incluye maletín blindado biométrico y certificado vitalicio firmados por DuFiTuFi.',
    specs: {
      steel: 'Platino Imperial 950 & Oro Rosa 24K con Californio-252',
      totalLength: '19 cm',
      bladeLength: '9 cm',
      scale: '1:1 (Réplica fiel al modelo in-game)',
      weight: '210 g',
      handleMaterial: 'Meteorito Lunar y 680 Diamantes Rosas Argyle VVS1 engastados a mano',
    },
    gradient: ['#fce7f3', '#f472b6', '#ec4899', '#38bdf8', '#fbbf24'],
    accentColor: '#f472b6',
    patternStyle: 'conic',
    tags: ['Pink Diamond', 'Californium', 'CEO Edition', 'DuFiTuFi Design', '1 of 1', 'Bespoke', 'Imperial Platinum'],
    image: '/images/bespoke/celestial-pink-diamond-ceo.png',
    isLimitedEdition: true,
    isNew: true,
    isExclusive: true,
  },
  {
    id: 'krm-diamond-sovereign',
    name: '★ Karambit | Diamond Sovereign (18K White Gold & VVS1) — DuFiTuFi Design (CEO)',
    slug: 'diamond-sovereign',
    category: 'Founder Bespoke (Joyería 1:1)',
    rarity: 'Mythic Bespoke',
    basePrice: 9990.00,
    originalPrice: 13990.00,
    battleScarredPrice: 7990.00,
    rating: 5.0,
    reviewsCount: 54,
    description:
      'Creado artesanalmente y firmado por DuFiTuFi (CEO). Hoja de oro blanco macizo de 18 quilates con más de 420 diamantes naturales VVS1 engastados a mano en pavé táctico y anillo de exhibición. Pieza única numerada 1-of-1 con certificado gemológico notariado.',
    specs: BESPOKE_SPECS,
    gradient: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0284c7'],
    accentColor: '#38bdf8',
    patternStyle: 'conic',
    tags: ['Diamond', '18K Gold', 'CEO Edition', 'DuFiTuFi Design', '1 of 1', 'VVS1', 'Bespoke'],
    image: '/images/bespoke/diamond-sovereign-ceo.png',
    isLimitedEdition: true,
    isNew: true,
  },
  {
    id: 'krm-24k-gold-meteorite',
    name: '★ Karambit | 24K Solid Gold & Gibeon Meteorite — DuFiTuFi Design (CEO)',
    slug: '24k-gold-meteorite',
    category: 'Founder Bespoke (Joyería 1:1)',
    rarity: 'Mythic Bespoke',
    basePrice: 4990.00,
    originalPrice: 6990.00,
    battleScarredPrice: 3990.00,
    rating: 5.0,
    reviewsCount: 46,
    description:
      'Forjado en el taller privado del CEO DuFiTuFi fusionando filo de oro macizo de 24 quilates con patrones Widmanstätten del meteorito prehistórico Gibeon en el núcleo, mango de lujo y anillo en oro macizo.',
    specs: {
      steel: 'Oro Macizo 24K y Meteorito Gibeon prehistórico',
      totalLength: '19 cm',
      bladeLength: '9 cm',
      scale: '1:1 (Réplica fiel al modelo in-game)',
      weight: '210 g',
      handleMaterial: 'Fibra de carbono mate aeroespacial con anillo macizo de oro 24K',
    },
    gradient: ['#fef08a', '#facc15', '#eab308', '#ca8a04', '#a16207'],
    accentColor: '#facc15',
    patternStyle: 'conic',
    tags: ['24K Gold', 'Meteorite', 'CEO Edition', 'DuFiTuFi Design', '1 of 1', 'Bespoke'],
    image: '/images/bespoke/gold-meteorite-ceo.png',
    isLimitedEdition: true,
    isNew: true,
  },
  {
    id: 'krm-royal-blood-ruby-platinum',
    name: '★ Karambit | Royal Blood Ruby & Platinum 950 — DuFiTuFi Design (CEO)',
    slug: 'royal-blood-ruby-platinum',
    category: 'Founder Bespoke (Joyería 1:1)',
    rarity: 'Mythic Bespoke',
    basePrice: 2490.00,
    originalPrice: 3490.00,
    battleScarredPrice: 1990.00,
    rating: 4.9,
    reviewsCount: 58,
    description:
      'Hoja de platino 950 forjado y pulido a espejo con incrustaciones de rubíes naturales sangre de paloma facetados de máxima pureza, mango de fibra de carbono forjada táctica y anillo sellado con la firma DuFiTuFi (CEO).',
    specs: {
      steel: 'Platino Puro 950 y Rubíes Sangre de Paloma birmanos',
      totalLength: '19 cm',
      bladeLength: '9 cm',
      scale: '1:1 (Réplica fiel al modelo in-game)',
      weight: '210 g',
      handleMaterial: 'Fibra de carbono forjada de 3 ranuras con anillo de platino y rubí táctico',
    },
    gradient: ['#fda4af', '#f43f5e', '#e11d48', '#be123c', '#881337'],
    accentColor: '#f43f5e',
    patternStyle: 'conic',
    tags: ['Platinum 950', 'Blood Ruby', 'CEO Edition', 'DuFiTuFi Design', '1 of 1', 'Bespoke'],
    image: '/images/bespoke/ruby-platinum-ceo.png',
    isLimitedEdition: true,
    isNew: true,
  },

  // ═════════════════════════════════════════════════════════
  // 2. DOPPLER SERIES (AMPLIADA CON TODAS LAS FASES CS2)
  // ═════════════════════════════════════════════════════════
  {
    id: 'krm-doppler-ruby',
    name: 'Karambit | Doppler Ruby',
    slug: 'doppler-ruby',
    category: 'Doppler Series',
    rarity: 'Covert',
    basePrice: 54.90,
    battleScarredPrice: 44.90,
    rating: 4.9,
    reviewsCount: 347,
    description:
      'La joya más codiciada del arsenal CS. Nuestro Doppler Ruby reproduce fielmente el rojo profundo y los reflejos de galaxia del original, con un grabado artesanal que captura cada matiz del patrón Doppler Phase Ruby.',
    specs: BASE_SPECS,
    gradient: ['#ff0040', '#8b0000', '#ff1744', '#d50000', '#ff0040'],
    accentColor: '#ff0040',
    patternStyle: 'conic',
    tags: ['Doppler', 'Ruby', 'Premium', 'Collectors'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iC1Oxvj-xoXSu_kBQ9tjm6lob-KT-JbgMoW8Z5Ee8Isha9k9K1YeLr7wXci4wQzyqsjCxBuytssrkLV6Ek-LqX0V8zRrFpiQ',
    isBestseller: true,
  },
  {
    id: 'krm-doppler-sapphire',
    name: 'Karambit | Doppler Sapphire',
    slug: 'doppler-sapphire',
    category: 'Doppler Series',
    rarity: 'Covert',
    basePrice: 54.90,
    battleScarredPrice: 44.90,
    rating: 4.9,
    reviewsCount: 312,
    description:
      'Un azul profundo como el vacío del espacio. El Sapphire es sinónimo de estatus y exclusividad. Cada réplica reproduce las ondas cristalinas y la profundidad óptica que hacen de esta skin una leyenda.',
    specs: BASE_SPECS,
    gradient: ['#0040ff', '#000080', '#1565c0', '#0d47a1', '#0040ff'],
    accentColor: '#1565c0',
    patternStyle: 'conic',
    tags: ['Doppler', 'Sapphire', 'Premium', 'Collectors'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iDwP5muOh7Sha-lA8lvziMgIr9HifOOV5kFMRxFuEM5hi_xNXhMbmx5VCMjd9MyCv6jigc6n064ucLAvZ3_6bViV3fcepqpLtspE0',
    isBestseller: true,
  },
  {
    id: 'krm-doppler-emerald',
    name: 'Karambit | Gamma Doppler Emerald',
    slug: 'gamma-doppler-emerald',
    category: 'Doppler Series',
    rarity: 'Covert',
    basePrice: 52.90,
    battleScarredPrice: 42.90,
    rating: 4.8,
    reviewsCount: 198,
    description:
      'El verde esmeralda más puro, forjado en oscuridad. La variante Emerald del Gamma Doppler combina matices jade con reflejos nebulosos que cambian bajo la luz.',
    specs: BASE_SPECS,
    gradient: ['#00c853', '#1b5e20', '#00e676', '#2e7d32', '#00c853'],
    accentColor: '#00c853',
    patternStyle: 'conic',
    tags: ['Doppler', 'Emerald', 'Gamma', 'Premium'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iVzOtkse1tcCSyhx8rtjSfn4vGLSLANkI-X8MjTLFYskTsw9bnZOuwsgSIj4sTniz-2i5A7yY6tbwGV6Nx-qGEjxaBb-MuPavopw',
    isNew: true,
  },
  {
    id: 'krm-doppler-black-pearl',
    name: 'Karambit | Doppler Black Pearl',
    slug: 'doppler-black-pearl',
    category: 'Doppler Series',
    rarity: 'Covert',
    basePrice: 54.90,
    battleScarredPrice: 44.90,
    rating: 4.9,
    reviewsCount: 156,
    description:
      'Oscura, enigmática, irresistible. La Black Pearl mezcla púrpuras abisales con verdes tóxicos sobre una base de obsidiana pulida. Una pieza que exige respeto.',
    specs: BASE_SPECS,
    gradient: ['#4a0080', '#1a0033', '#00695c', '#311b92', '#4a0080'],
    accentColor: '#7c4dff',
    patternStyle: 'conic',
    tags: ['Doppler', 'Black Pearl', 'Ultra Rare', 'Collectors'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iSze91u_FsTju_qhAmoT-Jn4bjJC_4Ml93UtZuRLQPsBawkNfiMbnl5AKMiopCnin7iCJBv31j4rkBBKEg-6zUjV3GY6p9v8dpLWT3Fg',
    isLimitedEdition: true,
  },
  {
    id: 'krm-doppler-phase1',
    name: 'Karambit | Doppler (Phase 1)',
    slug: 'doppler-phase-1',
    category: 'Doppler Series',
    rarity: 'Covert',
    basePrice: 89.90,
    battleScarredPrice: 72.90,
    rating: 4.8,
    reviewsCount: 172,
    description:
      'La mítica Phase 1 con predominio de azul noche profundo, negro espacial y un toque sutil de destello púrpura sobre la punta de la hoja.',
    specs: BASE_SPECS,
    gradient: ['#1e1b4b', '#312e81', '#4338ca', '#1e1b4b'],
    accentColor: '#4338ca',
    patternStyle: 'conic',
    tags: ['Doppler', 'Phase 1', 'Dark Blue', 'Official CS2'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i4gKJk4jxNWXFb1cpDJR2FOFbsBTql9bjYbzq7gPZiN1MxH7_2ytNuCdpte1UB_Ui5OSJ2GbkVqni',
    isNew: true,
  },
  {
    id: 'krm-doppler-phase2',
    name: 'Karambit | Doppler Phase 2',
    slug: 'doppler-phase-2',
    category: 'Doppler Series',
    rarity: 'Covert',
    basePrice: 47.90,
    battleScarredPrice: 39.90,
    rating: 4.7,
    reviewsCount: 423,
    description:
      'La Phase 2 "Pink Galaxy" es la favorita de la comunidad. Rosas intensos sobre un lienzo de negro espacial crean un efecto hipnótico que captura la esencia del CS competitivo.',
    specs: BASE_SPECS,
    gradient: ['#e91e90', '#880e4f', '#f48fb1', '#ad1457', '#e91e90'],
    accentColor: '#e91e90',
    patternStyle: 'conic',
    tags: ['Doppler', 'Phase 2', 'Pink Galaxy', 'Popular'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i4QKJk4jxNWWXawUgA8dxRLEO40KwkobnMbnj5QKL348Qmy-sji5K7i466uxUUKQn5OSJ2KBZjkQR',
    isBestseller: true,
  },
  {
    id: 'krm-doppler-phase4',
    name: 'Karambit | Doppler (Phase 4)',
    slug: 'doppler-phase-4',
    category: 'Doppler Series',
    rarity: 'Covert',
    basePrice: 94.90,
    battleScarredPrice: 76.90,
    rating: 4.9,
    reviewsCount: 215,
    description:
      'Conocida como la "Fake Sapphire", la Phase 4 presenta la mayor saturación de azul cielo y azul cobalto vibrante sobre el cuerpo de acero 440C.',
    specs: BASE_SPECS,
    gradient: ['#0284c7', '#0369a1', '#075985', '#0c4a6e', '#0284c7'],
    accentColor: '#0284c7',
    patternStyle: 'conic',
    tags: ['Doppler', 'Phase 4', 'Blue Water', 'Max Blue'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i5wKJk4jxNWXCaQQnA5B5Q-8O4xnpltazNri37gGPgtlDzin7iXhN6y44tb0GUaYg5OSJ2A0QBM1-',
    isNew: true,
  },
  {
    id: 'krm-gamma-doppler-phase1',
    name: 'Karambit | Gamma Doppler (Phase 1)',
    slug: 'gamma-doppler-phase-1',
    category: 'Doppler Series',
    rarity: 'Covert',
    basePrice: 92.90,
    battleScarredPrice: 74.90,
    rating: 4.8,
    reviewsCount: 148,
    description:
      'Gama de verde oscuro militar con reflejos cian sutiles en la curva interna de la garra, forjada para misiones sigilosas.',
    specs: BASE_SPECS,
    gradient: ['#064e3b', '#047857', '#10b981', '#064e3b'],
    accentColor: '#047857',
    patternStyle: 'conic',
    tags: ['Gamma Doppler', 'Phase 1', 'Stealth Green'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iXwON7sd5tQDmjmRg1jC2Nm5z8cBTLN1F4TowkROZctEXqxNO2Nevn4QzZ2I9Mz3r62C9L634_5uhTWKEh_fKD2w7HL_RjthCBcAWy',
    isNew: true,
  },
  {
    id: 'krm-gamma-doppler',
    name: 'Karambit | Gamma Doppler Phase 2',
    slug: 'gamma-doppler-phase2',
    category: 'Doppler Series',
    rarity: 'Covert',
    basePrice: 49.90,
    battleScarredPrice: 41.90,
    rating: 4.7,
    reviewsCount: 187,
    description:
      'Verdes radiactivos y destellos de esmeralda se funden en la Phase 2 del Gamma Doppler. Un diseño hiperreactivo con máxima intensidad de color.',
    specs: BASE_SPECS,
    gradient: ['#00bfa5', '#004d40', '#64ffda', '#00897b', '#00bfa5'],
    accentColor: '#00bfa5',
    patternStyle: 'conic',
    tags: ['Gamma Doppler', 'Phase 2', 'Toxic Green'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i4QKJk4jxNWWXawUgA8dxRLEO40KwkobnMbnj5QKL348Qmy-sji5K7i466uxUUKQn5OSJ2KBZjkQR',
  },
  {
    id: 'krm-gamma-doppler-phase3',
    name: 'Karambit | Gamma Doppler (Phase 3 - Aqua/Cyan)',
    slug: 'gamma-doppler-phase-3',
    category: 'Doppler Series',
    rarity: 'Covert',
    basePrice: 99.90,
    battleScarredPrice: 79.90,
    rating: 4.9,
    reviewsCount: 165,
    description:
      'El codiciado patrón Aqua/Cyan. Mezcla de turquesa polar con cian luminiscente que simula hielo glacial bajo aguas radioactivas.',
    specs: BASE_SPECS,
    gradient: ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#0891b2'],
    accentColor: '#06b6d4',
    patternStyle: 'conic',
    tags: ['Gamma Doppler', 'Phase 3', 'Cyan Aqua', 'Collector Gimmick'],
    image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20kPb5PrrukmRB-Ml0mNbR_Y3mjQeLpxo7Oy3tIteQJwc7aAnW_VK3wu27g8DtvsjLzSdksnIk4izYlha-0x8ebrZnguveFwtRKpxn8A',
    isNew: true,
  },

  // ═════════════════════════════════════════════════════════
  // 3. TACTICAL & FORGED CS2 (FORJA REAL Y OPERACIONES CS2)
  // ═════════════════════════════════════════════════════════
  {
    id: 'krm-damascus-steel-tactical',
    name: 'Karambit | Damascus Steel',
    slug: 'damascus-steel-tactical',
    category: 'Tactical & Forged CS2',
    rarity: 'Covert',
    basePrice: 119.90,
    battleScarredPrice: 94.90,
    rating: 4.9,
    reviewsCount: 289,
    description:
      'Ondulaciones de acero damasco forjado en crisol. Capas entrelazadas de carbono y acero inoxidable pulido a espejo para un contraste hipnótico.',
    specs: BASE_SPECS,
    gradient: ['#cfd8dc', '#78909c', '#eceff1', '#546e7a', '#cfd8dc'],
    accentColor: '#90a4ae',
    patternStyle: 'linear',
    tags: ['Damascus', 'Forged', 'Pattern', 'CS2 Official'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SH1iUwON3o-J8XBa_nBovp3PUmdetJHyUblInCZF5TeID40bum9znMeKwtleKi4pCyC-q2CofuCxq_a9cBl9itWvl',
    isBestseller: true,
  },
  {
    id: 'krm-black-laminate',
    name: 'Karambit | Black Laminate',
    slug: 'black-laminate',
    category: 'Tactical & Forged CS2',
    rarity: 'Covert',
    basePrice: 94.90,
    battleScarredPrice: 74.90,
    rating: 4.8,
    reviewsCount: 231,
    description:
      'Hoja táctica recubierta en negro mate antirreflejos combinada con una empuñadura de madera laminada oscura de altísima densidad.',
    specs: BASE_SPECS,
    gradient: ['#18181b', '#27272a', '#3f3f46', '#18181b'],
    accentColor: '#71717a',
    patternStyle: 'linear',
    tags: ['Black Laminate', 'Tactical', 'Matte Black', 'Dark Wood'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-QG1ibwPx3vd56Wya9kAomoDW6lob-KT-JbwIlWcYmQ-UM40LrldXkZO6wslONiN0UmCT52iIdui8-5LlUAqUn-LqX0V8xd7EU5Q',
    isNew: true,
  },
  {
    id: 'krm-ultraviolet',
    name: 'Karambit | Ultraviolet',
    slug: 'ultraviolet',
    category: 'Tactical & Forged CS2',
    rarity: 'Covert',
    basePrice: 79.90,
    battleScarredPrice: 64.90,
    rating: 4.8,
    reviewsCount: 194,
    description:
      'Acabado negro mate táctico de alta resistencia con detalles y empuñadura en violeta profundo. Contraste agresivo e icónico en CS2.',
    specs: BASE_SPECS,
    gradient: ['#18181b', '#581c87', '#7e22ce', '#18181b'],
    accentColor: '#a855f7',
    patternStyle: 'linear',
    tags: ['Ultraviolet', 'Purple', 'Matte', 'Tactical'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-AAViA1PxmvORWQyC0nQlpt2uHwtqvdS6WZlUjXJt2RrFbuhC5wYG0MOKz41Hc2IIRm36sjnwf7jErvbiyCF9_ug',
    isNew: true,
  },
  {
    id: 'krm-night',
    name: 'Karambit | Night',
    slug: 'night',
    category: 'Tactical & Forged CS2',
    rarity: 'Covert',
    basePrice: 74.90,
    battleScarredPrice: 59.90,
    rating: 4.7,
    reviewsCount: 167,
    description:
      'Diseñado para operaciones de infiltración nocturna. Tono azul marino medianoche que se mimetiza con la oscuridad absoluta.',
    specs: BASE_SPECS,
    gradient: ['#0f172a', '#1e293b', '#020617', '#0f172a'],
    accentColor: '#38bdf8',
    patternStyle: 'linear',
    tags: ['Night', 'Midnight Blue', 'Stealth', 'Spec-Ops'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-AAVieyOl-pN5lRi67gVNxsmzXyd2tJ3-QPwB2W8MkFu5YshG8lN3jYbnm5wTc34NNzS_423wd8G81tLSi0nj9',
  },
  {
    id: 'krm-freehand',
    name: 'Karambit | Freehand',
    slug: 'freehand',
    category: 'Tactical & Forged CS2',
    rarity: 'Covert',
    basePrice: 79.90,
    battleScarredPrice: 64.90,
    rating: 4.8,
    reviewsCount: 153,
    description:
      'Grabado artesanal a mano alzada con motivos urbanos y figuras de guerreros en plata sobre una base púrpura oscuro pulida.',
    specs: BASE_SPECS,
    gradient: ['#3b0764', '#581c87', '#d8b4fe', '#3b0764'],
    accentColor: '#c084fc',
    patternStyle: 'multi',
    tags: ['Freehand', 'Purple', 'Artisan', 'Engraved'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1idwPx9teVWWjmMkxQptgKJk4jxNWXCOlJ2CZpyEeBbuxbrltXkMbzlsgTXit1NyST9hiJBu3ptsesLAPJ35OSJ2AmQpzvF',
    isNew: true,
  },
  {
    id: 'krm-stained',
    name: 'Karambit | Stained',
    slug: 'stained',
    category: 'Tactical & Forged CS2',
    rarity: 'Covert',
    basePrice: 64.90,
    battleScarredPrice: 52.90,
    rating: 4.6,
    reviewsCount: 138,
    description:
      'Acero crudo tratado con pátina de aceite forjado al calor, creando reflejos iridiscentes sobre una superficie industrial.',
    specs: BASE_SPECS,
    gradient: ['#94a3b8', '#cbd5e1', '#64748b', '#94a3b8'],
    accentColor: '#94a3b8',
    patternStyle: 'multi',
    tags: ['Stained', 'Industrial', 'Raw Steel', 'Battle Ready'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SH1iWzvx1teVWQyC0nQlp5zmEyI6rcC7DZg8pXpRyQOMOsBG-xNaxZbzl4wPdit5Azij3239MvDErvbgAJOXq8Q',
  },
  {
    id: 'krm-rust-coat',
    name: 'Karambit | Rust Coat',
    slug: 'rust-coat',
    category: 'Tactical & Forged CS2',
    rarity: 'Covert',
    basePrice: 54.90,
    battleScarredPrice: 44.90,
    rating: 4.5,
    reviewsCount: 224,
    description:
      'Aspecto brutalista e industrial oxidado por el combate. Cada hoja posee un veteado de óxido de hierro y pátina de combate real.',
    specs: BASE_SPECS,
    gradient: ['#7c2d12', '#9a3412', '#c2410c', '#451a03'],
    accentColor: '#ea580c',
    patternStyle: 'multi',
    tags: ['Rust Coat', 'Industrial', 'Oxide', 'Heavy Combat'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SH1iD1etzvN5iQSC1kCIqtjmMj4K3cC2TZgQgWJUjR7QIukK7lNO0Prjk41PXjdgXySj4iCJMvH5p4rlRUL1lpPMtop-Pnw',
  },
  {
    id: 'krm-scorched',
    name: 'Karambit | Scorched',
    slug: 'scorched',
    category: 'Tactical & Forged CS2',
    rarity: 'Covert',
    basePrice: 49.90,
    battleScarredPrice: 39.90,
    rating: 4.5,
    reviewsCount: 119,
    description:
      'Acabado quemado al fuego soplete con patrones de carbón y ceniza sobre acero inoxidable templado de alta resistencia.',
    specs: BASE_SPECS,
    gradient: ['#292524', '#44403c', '#1c1917', '#292524'],
    accentColor: '#78716c',
    patternStyle: 'linear',
    tags: ['Scorched', 'Burned', 'Fire', 'Combat'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-AHliUwP5mvORWQyC0nQlptmzcntmody-fbAYlDpElTLZf50W_ltS2NrywsgWMidlFyS2riS0Y7DErvbjAAm1c_A',
  },

  // ═════════════════════════════════════════════════════════
  // 4. MILITARY SPEC-OPS CS2 (CAMUFLAJES OFICIALES CS2)
  // ═════════════════════════════════════════════════════════
  {
    id: 'krm-bright-water',
    name: 'Karambit | Bright Water',
    slug: 'bright-water',
    category: 'Military Spec-Ops CS2',
    rarity: 'Covert',
    basePrice: 64.90,
    battleScarredPrice: 52.90,
    rating: 4.8,
    reviewsCount: 182,
    description:
      'Camuflaje naval azul hidrografiado en tonos azul océano y gris acorazado, diseñado para operaciones anfibias especiales.',
    specs: BASE_SPECS,
    gradient: ['#0369a1', '#0284c7', '#38bdf8', '#0c4a6e'],
    accentColor: '#0284c7',
    patternStyle: 'multi',
    tags: ['Bright Water', 'Naval Camo', 'Blue', 'Spec-Ops'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-bF1ifwut3vt5iQSC1kCIrujqNjsGteH6ebFR1XJp3E-MNtxK7lYbiM-rg5wLZgoNGyyX62Hsb7ixq5e9RT-N7reSUYiY6',
    isNew: true,
  },
  {
    id: 'krm-forest-ddpat',
    name: 'Karambit | Forest DDPAT',
    slug: 'forest-ddpat',
    category: 'Military Spec-Ops CS2',
    rarity: 'Classified',
    basePrice: 49.90,
    battleScarredPrice: 39.90,
    rating: 4.6,
    reviewsCount: 145,
    description:
      'Patrón digital pixelado de camuflaje boscoso (Disruptive Pattern Material) oficial de las fuerzas armadas para máxima discreción.',
    specs: BASE_SPECS,
    gradient: ['#166534', '#14532d', '#3f6212', '#15803d'],
    accentColor: '#16a34a',
    patternStyle: 'multi',
    tags: ['DDPAT', 'Digital Camo', 'Forest', 'Military'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-bF1iUxf53pN5lRi67gVN25WuBmNqpeC-RbgdxCZAkRucN4xC8w4axY-O07wfW3YkTzCn6jC9N8G81tIWhen7s',
  },
  {
    id: 'krm-boreal-forest',
    name: 'Karambit | Boreal Forest',
    slug: 'boreal-forest',
    category: 'Military Spec-Ops CS2',
    rarity: 'Classified',
    basePrice: 46.90,
    battleScarredPrice: 37.90,
    rating: 4.6,
    reviewsCount: 161,
    description:
      'El clásico camuflaje forestal de Counter-Strike con franjas en verde musgo, oliva y tierra quemada sobre la hoja.',
    specs: BASE_SPECS,
    gradient: ['#365314', '#1a2e05', '#4d7c0f', '#365314'],
    accentColor: '#4d7c0f',
    patternStyle: 'multi',
    tags: ['Boreal Forest', 'Camo', 'Classic', 'Green'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-bF1iWzvxzo_VWTSahkBwrjDGMnYftbyifZgQlA8EhRrRfuhm7lIa2MerjtlaKi4NGnius3SMc6Slv574AUPA7uvqA0RoB8ZE',
  },
  {
    id: 'krm-urban-masked',
    name: 'Karambit | Urban Masked',
    slug: 'urban-masked',
    category: 'Military Spec-Ops CS2',
    rarity: 'Mil-Spec',
    basePrice: 46.90,
    battleScarredPrice: 37.90,
    rating: 4.5,
    reviewsCount: 133,
    description:
      'Camuflaje urbano en escala de grises y blanco tiza pintado a mano alzada para combate a corta distancia en entornos de hormigón.',
    specs: BASE_SPECS,
    gradient: ['#e2e8f0', '#94a3b8', '#64748b', '#cbd5e1'],
    accentColor: '#94a3b8',
    patternStyle: 'multi',
    tags: ['Urban Masked', 'Urban Camo', 'Grey', 'Concrete'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-AHliEwP5zj_R7TSi9qhEutDWR1N2qeXnGPQN2CcdxRucP5xK6kd3mP7jn4gyNiN1HxSiojHtN6Cc_t7wcEf1yQHicti4',
  },
  {
    id: 'krm-safari-mesh',
    name: 'Karambit | Safari Mesh',
    slug: 'safari-mesh',
    category: 'Military Spec-Ops CS2',
    rarity: 'Mil-Spec',
    basePrice: 39.90,
    battleScarredPrice: 31.90,
    rating: 4.5,
    reviewsCount: 310,
    description:
      'El icono de supervivencia en desierto. Pintura en espray con plantilla de malla sobre base beige desértica. Durabilidad absoluta.',
    specs: BASE_SPECS,
    gradient: ['#78716c', '#a8a29e', '#57534e', '#d6d3d1'],
    accentColor: '#a8a29e',
    patternStyle: 'multi',
    tags: ['Safari Mesh', 'Desert', 'Mesh', 'Budget Icon'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-AHlidxP1-j_VoQRa_nBovp3PRw9yhcHyTawJ1X8N4ELVb5BXqw9OxZu-x5wSKit1Mmyj83C9M7Ss__a9cBidCCPpT',
  },

  // ═════════════════════════════════════════════════════════
  // 5. ICONIC SKINS (CLÁSICOS DE SIEMPRE)
  // ═════════════════════════════════════════════════════════
  {
    id: 'krm-case-hardened',
    name: 'Karambit | Case Hardened (Blue Gem)',
    slug: 'case-hardened-blue-gem',
    category: 'Iconic Skins',
    rarity: 'Extraordinary',
    basePrice: 49.90,
    battleScarredPrice: 39.90,
    rating: 4.8,
    reviewsCount: 267,
    description:
      'El mítico Blue Gem Pattern 387. Azul cobalto puro sobre acero templado, esta réplica captura el patrón más buscado de CS con una fidelidad que desafía a la realidad.',
    specs: BASE_SPECS,
    gradient: ['#1565c0', '#b8860b', '#0d47a1', '#daa520', '#1565c0'],
    accentColor: '#1565c0',
    patternStyle: 'multi',
    tags: ['Case Hardened', 'Blue Gem', 'Iconic', 'Collectors'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SH1ifyOJztN5lRi67gVNz5DvUmdj4eXuWOFAhAsF4RLFc5BC4xtbuY7yx7wDbgo9CzSj2h3xK8G81tB_XeHWq',
    isLimitedEdition: true,
  },
  {
    id: 'krm-fade',
    name: 'Karambit | Fade (100%)',
    slug: 'fade-100',
    category: 'Iconic Skins',
    rarity: 'Covert',
    basePrice: 49.90,
    battleScarredPrice: 41.90,
    rating: 4.9,
    reviewsCount: 534,
    description:
      'Full Fade. Del amarillo solar al rosa eléctrico pasando por el púrpura profundo. Un degradado perfecto que ha definido una era del gaming competitivo.',
    specs: BASE_SPECS,
    gradient: ['#ffd700', '#ff6b00', '#ff1493', '#8b00ff', '#4b0082'],
    accentColor: '#ff6b00',
    patternStyle: 'linear',
    tags: ['Fade', '100%', 'Iconic', 'Classic'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SD1iWwOpzj-1gSCGn20tztm_UyIn_JHKUbgYlWMcmQ-ZcskSwldS0MOnntAfd3YlMzH35jntXrnE8SOGRGG8',
    isBestseller: true,
  },
  {
    id: 'krm-marble-fade',
    name: 'Karambit | Marble Fade (Fire & Ice)',
    slug: 'marble-fade-fire-ice',
    category: 'Iconic Skins',
    rarity: 'Covert',
    basePrice: 52.90,
    battleScarredPrice: 42.90,
    rating: 4.8,
    reviewsCount: 298,
    description:
      'Fuego y hielo forjados en acero. El patrón Fire & Ice es una dualidad visual hipnótica: rojo lava contra azul glaciar sin tonos amarillos. La pureza hecha cuchillo.',
    specs: BASE_SPECS,
    gradient: ['#ff0000', '#cc0000', '#0000ff', '#0033cc', '#ff0000'],
    accentColor: '#ff3300',
    patternStyle: 'multi',
    tags: ['Marble Fade', 'Fire & Ice', 'Premium', 'Rare'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1idwPx0vORWSSi3kCIrujqNjsGveH2RaVRxX5ohEe4Juhawm4fiM-ji4APf2YMXmSz_hyoduytv4uhWT-N7rfLHGBJ4',
  },
  {
    id: 'krm-tiger-tooth',
    name: 'Karambit | Tiger Tooth',
    slug: 'tiger-tooth',
    category: 'Iconic Skins',
    rarity: 'Covert',
    basePrice: 46.90,
    battleScarredPrice: 38.90,
    rating: 4.7,
    reviewsCount: 456,
    description:
      'Oro líquido en hoja de acero. El Tiger Tooth combina un dorado intenso con patrones de rayas felinas que reflejan la luz con ferocidad salvaje.',
    specs: BASE_SPECS,
    gradient: ['#ffd700', '#b8860b', '#ffb300', '#ff8f00', '#ffd700'],
    accentColor: '#ffd700',
    patternStyle: 'linear',
    tags: ['Tiger Tooth', 'Gold', 'Popular', 'Classic'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SAFiEyOlzot5mXSi9khgYvzSCkpu3eC3BbwUmCcMlQbMD4xG_w9zkPu7gsQXe2YJFzHqqjixL5ylr4ukAWb1lpPNV9oeSnQ',
    isBestseller: true,
  },
  {
    id: 'krm-lore',
    name: 'Karambit | Lore',
    slug: 'lore',
    category: 'Iconic Skins',
    rarity: 'Covert',
    basePrice: 49.90,
    battleScarredPrice: 41.90,
    rating: 4.8,
    reviewsCount: 321,
    description:
      'Inspirado en la mítica Dragon Lore. Verde oliva profundo con filigrana dorada artesanal grabada a mano. Cada pieza cuenta una historia de leyendas.',
    specs: BASE_SPECS,
    gradient: ['#2e7d32', '#1b5e20', '#c8a415', '#8d6e0f', '#2e7d32'],
    accentColor: '#c8a415',
    patternStyle: 'multi',
    tags: ['Lore', 'Dragon', 'Premium', 'Artesanal'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-QG1ibwPx3vd5lQDu2qhEutDWR1IqrIHLCZlUmDJYlTLFb50HuwdyxPu2w4lCKjI5HniT2jS1PuCxj5e0cEf1y9ZCADXU',
  },
  {
    id: 'krm-crimson-web',
    name: 'Karambit | Crimson Web',
    slug: 'crimson-web',
    category: 'Iconic Skins',
    rarity: 'Covert',
    basePrice: 46.90,
    battleScarredPrice: 38.90,
    rating: 4.7,
    reviewsCount: 389,
    description:
      'Rojo sangre con telarañas negras. El Crimson Web es un clásico atemporal que evoca la peligrosidad silenciosa de un depredador nocturno.',
    specs: BASE_SPECS,
    gradient: ['#b71c1c', '#7f0000', '#d32f2f', '#c62828', '#b71c1c'],
    accentColor: '#d32f2f',
    patternStyle: 'radial',
    tags: ['Crimson Web', 'Classic', 'Red', 'Iconic'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-bF1iHxOxlj-1gSCGn20wi4mTcyoyoeS_Dbwd2Cpd0RrMK4RbqxNTvZLyw7lff3Y5GxX6oiiNXrnE86bQY1_c',
  },
  {
    id: 'krm-slaughter',
    name: 'Karambit | Slaughter',
    slug: 'slaughter',
    category: 'Iconic Skins',
    rarity: 'Covert',
    basePrice: 44.90,
    battleScarredPrice: 36.90,
    rating: 4.6,
    reviewsCount: 234,
    description:
      'Acero plateado con patrones de sangre grabados. El Slaughter revela formas ocultas en sus reflejos: diamantes, corazones, ángeles. ¿Qué patrón descubrirás tú?',
    specs: BASE_SPECS,
    gradient: ['#e0e0e0', '#c62828', '#bdbdbd', '#d32f2f', '#e0e0e0'],
    accentColor: '#c62828',
    patternStyle: 'linear',
    tags: ['Slaughter', 'Pattern', 'Silver', 'Classic'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iKxOxksd5lRi67gVNx5GzQztqrdH-ea1AjApImFuEJ5EO5wYHmP-2w7gGLgowTz3r5jCwY8G81tFw9kDjw',
  },
  {
    id: 'krm-autotronic',
    name: 'Karambit | Autotronic',
    slug: 'autotronic',
    category: 'Iconic Skins',
    rarity: 'Covert',
    basePrice: 46.90,
    battleScarredPrice: 38.90,
    rating: 4.7,
    reviewsCount: 178,
    description:
      'Rojo mecánico sobre negro industrial. El Autotronic fusiona la estética cyberpunk con la ingeniería militar, creando un acabado que parece salido de una armería futurista.',
    specs: BASE_SPECS,
    gradient: ['#d32f2f', '#1a1a1a', '#ff5252', '#212121', '#d32f2f'],
    accentColor: '#ff5252',
    patternStyle: 'linear',
    tags: ['Autotronic', 'Cyberpunk', 'Red', 'Modern'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-UHVibwPx3vd5oWj28gQ8ovTSGpYPwJiPTcAMkCJt3QuVY4xXrloHhP-nlsw2Ljo1NzS6ohitJvCc4sOcHAqInqKfJz1aWliaAF_M',
    isNew: true,
  },
  {
    id: 'krm-blue-steel',
    name: 'Karambit | Blue Steel',
    slug: 'blue-steel',
    category: 'Iconic Skins',
    rarity: 'Classified',
    basePrice: 39.90,
    battleScarredPrice: 32.90,
    rating: 4.5,
    reviewsCount: 567,
    description:
      'La elegancia brutalista. Acero azulado con pátina industrial que evoca la maquinaria pesada y el minimalismo táctico. La elección del pragmático.',
    specs: BASE_SPECS,
    gradient: ['#37474f', '#263238', '#455a64', '#546e7a', '#37474f'],
    accentColor: '#546e7a',
    patternStyle: 'linear',
    tags: ['Blue Steel', 'Minimal', 'Industrial', 'Budget'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SH1iSzftztN5lRi67gVNw4D_WytioJX2WO1AmCpJ5Qu9Z4EK-wYLjMOzm4gKMjt9BnC732i9M8G81tP_ecAuH',
  },
  {
    id: 'krm-vanilla',
    name: 'Karambit | Vanilla (★)',
    slug: 'vanilla',
    category: 'Iconic Skins',
    rarity: 'Extraordinary',
    basePrice: 39.90,
    battleScarredPrice: 34.90,
    rating: 4.6,
    reviewsCount: 678,
    description:
      'Puro. Sin pintura, sin patrón, sin excusas. El Karambit Vanilla es acero desnudo en su máxima expresión. La silueta icónica habla por sí sola.',
    specs: BASE_SPECS,
    gradient: ['#9e9e9e', '#757575', '#bdbdbd', '#e0e0e0', '#9e9e9e'],
    accentColor: '#bdbdbd',
    patternStyle: 'linear',
    tags: ['Vanilla', 'Classic', 'Clean', 'Essential'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XuWbwcuyMESA4Fdl-4nnpU7iQA3-kKnr8ytd6s2labZsLfKaGinEx-0u5LhqGHrjlElz52jRmN2sd3yfb1NzWZVwRbNeu0S5k9WxMuvh-UWA3ObnwJvj',
  },

  // ═════════════════════════════════════════════════════════
  // 6. ESPORTS / PRO EDITIONS
  // ═════════════════════════════════════════════════════════
  {
    id: 'krm-navi-champion',
    name: 'Karambit | NAVI Champions Edition',
    slug: 'navi-champions',
    category: 'Esports Edition',
    rarity: 'Extraordinary',
    basePrice: 52.90,
    battleScarredPrice: 44.90,
    rating: 4.9,
    reviewsCount: 145,
    description:
      'Edición especial tributo al equipo más legendario del CS competitivo. Acabado Black Laminate con grabados y tonos dorados NAVI conmemorativos.',
    specs: BASE_SPECS,
    gradient: ['#ffd700', '#1a1a1a', '#ffca28', '#212121', '#ffd700'],
    accentColor: '#ffd700',
    patternStyle: 'linear',
    tags: ['NAVI', 'Champions', 'Esports', 'Limited'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-QG1ibwPx3vd56Wya9kAomoDW6lob-KT-JbwIlWcYmQ-UM40LrldXkZO6wslONiN0UmCT52iIdui8-5LlUAqUn-LqX0V8xd7EU5Q',
    isLimitedEdition: true,
    isNew: true,
  },
  {
    id: 'krm-faze-edition',
    name: 'Karambit | FaZe Clan Edition',
    slug: 'faze-clan-edition',
    category: 'Esports Edition',
    rarity: 'Extraordinary',
    basePrice: 49.90,
    battleScarredPrice: 41.90,
    rating: 4.8,
    reviewsCount: 112,
    description:
      'Rojo FaZe sobre negro profundo. El estilo agresivo del clan más mediático del gaming plasmado en acero 440C con acabados de alta fidelidad.',
    specs: BASE_SPECS,
    gradient: ['#ff0000', '#1a1a1a', '#ff4444', '#333333', '#ff0000'],
    accentColor: '#ff0000',
    patternStyle: 'linear',
    tags: ['FaZe', 'Esports', 'Clan', 'Limited'],
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-UHVibwPx3vd5oWj28gQ8ovTSGpYPwJiPTcAMkCJt3QuVY4xXrloHhP-nlsw2Ljo1NzS6ohitJvCc4sOcHAqInqKfJz1aWliaAF_M',
    isLimitedEdition: true,
  },
];

// ─── Accesorios ──────────────────────────────────────────
export const accessories: Accessory[] = [
  {
    id: 'acc-soporte-acrilico',
    name: 'Soporte Acrílico Oficial Premium',
    slug: 'soporte-acrilico-oficial',
    price: 14.90,
    description:
      'Soporte de exhibición en acrílico cristal de 8mm con base antideslizante y grabado láser del logo KRM.GG. Compatible con todos los modelos.',
    icon: 'trophy',
    gradient: ['#64b5f6', '#1565c0'],
  },
  {
    id: 'acc-funda-kydex',
    name: 'Funda Táctica Kydex',
    slug: 'funda-tactica-kydex',
    price: 5.90,
    description:
      'Funda moldeada en Kydex termoformado con clip de cintura. Retención ajustable y extracción silenciosa. Color negro táctico.',
    icon: 'shield',
    gradient: ['#455a64', '#1a237e'],
  },
  {
    id: 'acc-nametag-kit',
    name: 'Kit de Placa NameTag Personalizada',
    slug: 'kit-placa-nametag',
    price: 9.90,
    description:
      'Graba tu alias, clan o mensaje personal en una placa de acero inoxidable que se fija al mango. Incluye herramienta de montaje y 2 placas de repuesto.',
    icon: 'tag',
    gradient: ['#ffd54f', '#f57f17'],
  },
];

// ─── Helpers ─────────────────────────────────────────────
export const getProductBySlug = (slug: string) =>
  karambits.find((k) => k.slug === slug);

export const getProductsByCategory = (category: Category) =>
  karambits.filter((k) => k.category === category);

export const getBestsellers = () =>
  karambits.filter((k) => k.isBestseller);

export const getNewArrivals = () =>
  karambits.filter((k) => k.isNew);

export const getLimitedEditions = () =>
  karambits.filter((k) => k.isLimitedEdition);

export const rarityColors: Record<Rarity, string> = {
  Covert: '#ef4444',
  Extraordinary: '#a855f7',
  Classified: '#ec4899',
  'Mil-Spec': '#3b82f6',
  'Mythic Bespoke': '#38bdf8',
};

export const categoryIcons: Record<Category, string> = {
  'Doppler Series': '🌀',
  'Iconic Skins': '🔥',
  'Esports Edition': '🏆',
  'Tactical & Forged CS2': '⚔️',
  'Military Spec-Ops CS2': '🎖️',
  'Founder Bespoke (Joyería 1:1)': '💎',
};
