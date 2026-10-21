import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Flame,
  Tag,
  Check,
  ShoppingCart,
  Zap,
  RotateCcw,
  AlertTriangle,
  Eye,
  DollarSign,
  Layers,
} from 'lucide-react';
import { karambits, rarityColors, type Product } from '../data/karambits';
import { useStore, type CartItem } from '../store/useStore';
import { KarambitVFXImage } from '../components/KarambitVFXImage';

// ═══════════════════════════════════════════════════════
// 1. MYSTERY BOXES - CS2 CASE OPENING SIMULATOR
// ═══════════════════════════════════════════════════════

interface DropRateItem {
  knife: Product;
  chance: number; // percentage (e.g. 5 for 5%)
}

interface CaseDefinition {
  id: string;
  name: string;
  price: number;
  description: string;
  gradient: string[];
  pool: DropRateItem[];
}

export const MysteryPage: React.FC = () => {
  const { addToCart, addBalance, setCartOpen } = useStore();

  // Define 4 cases with exact drop rates & verified knives
  const cases: CaseDefinition[] = [
    {
      id: 'case-millionaire-founder',
      name: "👑 Millionaire Founder's Case",
      price: 249.90,
      description: 'Caja Suprema del Fundador. Posibilidad real de desbloquear la Obra Cumbre de 24.990€ firmada por DuFiTuFi (CEO), gemas Doppler y piezas de Alta Joyería.',
      gradient: ['#fbbf24', '#f472b6', '#38bdf8'],
      pool: [
        { knife: karambits.find((k) => k.id === 'krm-celestial-pink-diamond') || karambits[0], chance: 1 },
        { knife: karambits.find((k) => k.id === 'krm-diamond-sovereign') || karambits[1], chance: 2 },
        { knife: karambits.find((k) => k.id === 'krm-24k-gold-meteorite') || karambits[2], chance: 4 },
        { knife: karambits.find((k) => k.id === 'krm-royal-blood-ruby-platinum') || karambits[3], chance: 5 },
        { knife: karambits.find((k) => k.id === 'krm-doppler-ruby') || karambits[4], chance: 14 },
        { knife: karambits.find((k) => k.id === 'krm-doppler-sapphire') || karambits[5], chance: 14 },
        { knife: karambits.find((k) => k.id === 'krm-gamma-emerald') || karambits[6], chance: 15 },
        { knife: karambits.find((k) => k.id === 'krm-damascus-steel') || karambits[7], chance: 22 },
        { knife: karambits.find((k) => k.id === 'krm-black-laminate') || karambits[8], chance: 23 },
      ],
    },
    {
      id: 'case-doppler',
      name: 'Doppler Gem Case',
      price: 49.90,
      description: 'Probabilidades exclusivas de gemas míticas y fases CS2: Ruby, Sapphire, Emerald, Black Pearl y Fases 1 a 4.',
      gradient: ['#a855f7', '#ec4899', '#3b82f6'],
      pool: [
        { knife: karambits.find((k) => k.id === 'krm-doppler-ruby') || karambits[0], chance: 4 },
        { knife: karambits.find((k) => k.id === 'krm-doppler-sapphire') || karambits[1], chance: 4 },
        { knife: karambits.find((k) => k.id === 'krm-gamma-emerald') || karambits[2], chance: 6 },
        { knife: karambits.find((k) => k.id === 'krm-doppler-black-pearl') || karambits[3], chance: 8 },
        { knife: karambits.find((k) => k.id === 'krm-gamma-phase3') || karambits[4], chance: 16 },
        { knife: karambits.find((k) => k.id === 'krm-doppler-phase4') || karambits[5], chance: 18 },
        { knife: karambits.find((k) => k.id === 'krm-doppler-phase1') || karambits[6], chance: 22 },
        { knife: karambits.find((k) => k.id === 'krm-doppler-phase2') || karambits[7], chance: 22 },
      ],
    },
    {
      id: 'case-legends',
      name: 'Spec-Ops & Legends Case',
      price: 45.90,
      description: 'Las leyendas de CS2 y camuflajes militares reales: Fade, Marble Fade, Lore, Bright Water y Forest DDPAT.',
      gradient: ['#f59e0b', '#ef4444', '#a855f7'],
      pool: [
        { knife: karambits.find((k) => k.id === 'krm-case-hardened') || karambits[0], chance: 8 },
        { knife: karambits.find((k) => k.id === 'krm-fade') || karambits[1], chance: 10 },
        { knife: karambits.find((k) => k.id === 'krm-marble-fade') || karambits[2], chance: 12 },
        { knife: karambits.find((k) => k.id === 'krm-lore') || karambits[3], chance: 15 },
        { knife: karambits.find((k) => k.id === 'krm-bright-water') || karambits[4], chance: 17 },
        { knife: karambits.find((k) => k.id === 'krm-tiger-tooth') || karambits[5], chance: 18 },
        { knife: karambits.find((k) => k.id === 'krm-forest-ddpat') || karambits[6], chance: 20 },
      ],
    },
    {
      id: 'case-offensive',
      name: 'Tactical & Forged CS2 Case',
      price: 39.90,
      description: 'Serie táctica forjada en acero 440C: Damascus Steel, Black Laminate, Ultraviolet, Night y Stained.',
      gradient: ['#10b981', '#3b82f6', '#6366f1'],
      pool: [
        { knife: karambits.find((k) => k.id === 'krm-damascus-steel') || karambits[0], chance: 10 },
        { knife: karambits.find((k) => k.id === 'krm-black-laminate') || karambits[1], chance: 12 },
        { knife: karambits.find((k) => k.id === 'krm-ultraviolet') || karambits[2], chance: 15 },
        { knife: karambits.find((k) => k.id === 'krm-night') || karambits[3], chance: 18 },
        { knife: karambits.find((k) => k.id === 'krm-freehand') || karambits[4], chance: 20 },
        { knife: karambits.find((k) => k.id === 'krm-stained') || karambits[5], chance: 25 },
      ],
    },
  ];

  const [selectedCase, setSelectedCase] = useState<CaseDefinition>(cases[0]);
  const [reelItems, setReelItems] = useState<Product[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonItem, setWonItem] = useState<Product | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const reelContainerRef = useRef<HTMLDivElement>(null);

  // Helper to pick random item according to weighted pool
  const pickWinnerFromCase = (c: CaseDefinition): Product => {
    const rand = Math.random() * 100;
    let accumulated = 0;
    for (const item of c.pool) {
      accumulated += item.chance;
      if (rand <= accumulated) {
        return item.knife;
      }
    }
    return c.pool[c.pool.length - 1].knife;
  };

  // Helper to generate 80 random items for initial reel
  const generateInitialReel = (c: CaseDefinition): Product[] => {
    const list: Product[] = [];
    for (let i = 0; i < 80; i++) {
      const idx = Math.floor(Math.random() * c.pool.length);
      list.push(c.pool[idx].knife);
    }
    return list;
  };

  // Generate initial reel on mount and when switching cases
  useEffect(() => {
    setReelItems(generateInitialReel(selectedCase));
    setTranslateX(0);
    setIsTransitioning(false);
    setWonItem(null);
  }, [selectedCase]);

  // Spin Roulette function with exact math
  const startSpin = () => {
    if (isSpinning) return;

    setWonItem(null);

    // 1. Pick winner based on drop chances
    const winner = pickWinnerFromCase(selectedCase);

    // 2. Generate 85 random items and insert winner at WINNING_INDEX = 65
    const newItems: Product[] = [];
    for (let i = 0; i < 85; i++) {
      const randomIdx = Math.floor(Math.random() * selectedCase.pool.length);
      newItems.push(selectedCase.pool[randomIdx].knife);
    }
    newItems[65] = winner;
    setReelItems(newItems);

    // 3. Reset position without animation
    setIsTransitioning(false);
    setTranslateX(0);
    setIsSpinning(true);

    // 4. Activate 5.5s CS2 ease-out transition via double requestAnimationFrame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const containerWidth = reelContainerRef.current?.offsetWidth || 900;
        // Each card is 160px with 12px gap -> step is 172px
        const cardCenter = 65 * 172 + 160 / 2;
        const randomOffset = Math.floor(Math.random() * 70) - 35; // random stop within the card
        const targetX = -(cardCenter - containerWidth / 2 + randomOffset);

        setIsTransitioning(true);
        setTranslateX(targetX);
      });
    });

    // 5. When spin finishes at 5.5s, keep reel in place and show won card
    setTimeout(() => {
      setIsSpinning(false);
      setWonItem(winner);
    }, 5500);
  };

  const handleClaimWonItem = () => {
    if (!wonItem) return;
    const cartItem: CartItem = {
      id: `mystery-${wonItem.id}-${Date.now().toString(36)}`,
      productId: wonItem.id,
      name: `${wonItem.name} [Premio Mystery Box]`,
      price: 0.0,
      quantity: 1,
      gradient: wonItem.gradient,
      image: wonItem.image,
      type: 'karambit',
      condition: 'Factory New',
      bladeType: 'Sin Filo (Unsharpened)',
      visualFilter: wonItem.visualFilter,
    };
    addToCart(cartItem);
    setCartOpen(true);
  };

  const handleSellForBalance = () => {
    if (!wonItem) return;
    const sellValue = Math.round(wonItem.basePrice * 0.7);
    addBalance(sellValue);
    alert(`¡Has vendido ${wonItem.name} por ${sellValue}.00€ de saldo virtual!`);
    setWonItem(null);
  };

  return (
    <main className="min-h-screen pt-28 pb-24 w-full bg-[#090a0f] text-gray-200">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header with sufficient top padding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-black tracking-widest text-amber-400 uppercase font-['Rajdhani'] bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/30 shadow-md">
            SIMULADOR DE APERTURA CS2
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white font-['Rajdhani'] uppercase tracking-tight mt-3">
            Mystery{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
              Boxes
            </span>
          </h1>
          <p className="mt-2 text-gray-400 font-['Inter'] text-sm max-w-xl mx-auto">
            Abre cajas virtuales con animación fiel a Counter-Strike 2 y desbloquea réplicas reales 1:1 en acero 440C para tu arsenal digital.
          </p>
        </motion.div>

        {/* Case Selection Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {cases.map((c) => {
            const isSelected = selectedCase.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  if (!isSpinning) setSelectedCase(c);
                }}
                className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-[#141724] shadow-xl shadow-amber-500/15 scale-[1.02]'
                    : 'border-[#1f2433] bg-[#0e1017] hover:border-gray-600 opacity-80'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                    {c.pool.length} Karambits
                  </span>
                  <span className="text-2xl font-black font-['Rajdhani'] text-[#f59e0b]">
                    {c.price.toFixed(2)}€
                  </span>
                </div>
                <h3 className="text-xl font-black font-['Rajdhani'] text-white uppercase mb-1">
                  {c.name}
                </h3>
                <p className="text-xs text-gray-400 font-['Inter'] leading-relaxed">
                  {c.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ══════════ CS2 CASE ROULETTE ARENA ══════════ */}
        <div className="rounded-3xl p-6 sm:p-8 border border-[#1f2433] bg-[#0a0c13] shadow-2xl relative overflow-hidden mb-12">
          {/* Central Roulette Indicator Needle */}
          <div
            ref={reelContainerRef}
            className="relative w-full h-64 bg-[#07080d] rounded-2xl border-2 border-[#1f2538] overflow-hidden flex items-center mb-6 shadow-inner"
          >
            {/* Center Orange Needle Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[3px] bg-amber-400 z-30 shadow-[0_0_18px_#f59e0b] pointer-events-none -translate-x-1/2" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-amber-400 z-30 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[14px] border-b-amber-400 z-30 pointer-events-none drop-shadow-[0_-2px_4px_rgba(0,0,0,0.8)]" />

            {/* Left & Right fade gradient masks */}
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#07080d] to-transparent z-20 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#07080d] to-transparent z-20 pointer-events-none" />

            {/* Scrolling track: w-[160px] + gap-[12px] = 172px per card */}
            <div
              className="flex items-center gap-[12px] absolute left-0 select-none"
              style={{
                transform: `translateX(${translateX}px)`,
                transition: isTransitioning
                  ? 'transform 5.5s cubic-bezier(0.12, 0.8, 0.18, 1)'
                  : 'none',
                willChange: 'transform',
              }}
            >
              {reelItems.map((knife, idx) => {
                const isTheWinner = idx === 65 && wonItem !== null;
                const rarityColor = rarityColors[knife.rarity] || '#ef4444';
                return (
                  <div
                    key={idx}
                    className={`w-[160px] h-52 rounded-xl p-3 flex flex-col items-center justify-between shrink-0 shadow-lg text-center transition-all ${
                      isTheWinner
                        ? 'ring-2 ring-amber-400 scale-105 shadow-amber-500/40 bg-[#161a29] border-amber-400'
                        : 'bg-[#10131d] border border-[#1e2436]'
                    }`}
                  >
                    {/* Knife rarity accent bar */}
                    <div
                      className="w-full h-1 rounded-full mb-1"
                      style={{ backgroundColor: rarityColor }}
                    />

                    {/* PNG Knife image with VFX */}
                    <div className="w-28 h-28 flex items-center justify-center p-1 relative">
                      <KarambitVFXImage
                        image={knife.image}
                        name={knife.name}
                        slug={knife.slug}
                        rarity={knife.rarity}
                        category={knife.category}
                        accentColor={knife.accentColor}
                        visualFilter={knife.visualFilter}
                        interactiveHover={false}
                        showSparkles={knife.rarity === 'Mythic Bespoke'}
                        showShimmer={false}
                      />
                    </div>

                    <div className="w-full">
                      <p className="text-xs font-bold text-white truncate font-['Rajdhani']">
                        {knife.name.replace('Karambit | ', '')}
                      </p>
                      <span className="text-[11px] text-amber-400 font-mono font-bold">
                        {knife.basePrice.toFixed(0)}€
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1f2433]">
            <div className="text-left">
              <span className="text-xs text-gray-400 font-['Inter']">Caja activa seleccionada:</span>
              <p className="text-xl font-black text-white font-['Rajdhani'] uppercase">
                {selectedCase.name}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startSpin}
                disabled={isSpinning}
                className="px-8 py-4 rounded-xl font-black text-black uppercase tracking-wider font-['Rajdhani'] text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
              >
                <Sparkles className="w-5 h-5" />
                {isSpinning ? 'Girando Ruleta...' : `ABRIR CAJA (${selectedCase.price.toFixed(2)}€)`}
              </button>
            </div>
          </div>
        </div>

        {/* ══════════ WON ITEM REWARD CARD ══════════ */}
        <AnimatePresence>
          {wonItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="p-8 rounded-3xl border border-amber-500/50 bg-[#121524] text-center max-w-xl mx-auto shadow-2xl relative mb-16"
              style={{ boxShadow: '0 0 60px rgba(245, 158, 11, 0.3)' }}
            >
              <span className="inline-block text-xs font-black tracking-widest text-amber-400 uppercase font-['Rajdhani'] bg-amber-400/15 px-4 py-1.5 rounded-full border border-amber-400/40">
                ¡ENHORABUENA! HAS DESBLOQUEADO:
              </span>

              {/* Knife Display with VFX */}
              <div className="my-6 w-full max-w-[280px] aspect-square mx-auto flex items-center justify-center relative">
                <KarambitVFXImage
                  image={wonItem.image}
                  name={wonItem.name}
                  slug={wonItem.slug}
                  rarity={wonItem.rarity}
                  category={wonItem.category}
                  accentColor={wonItem.accentColor}
                  visualFilter={wonItem.visualFilter}
                  interactiveHover={false}
                  animateLevitate={true}
                  showSparkles={true}
                  showShimmer={true}
                />
              </div>

              <h2 className="text-3xl font-black text-white font-['Rajdhani'] uppercase">
                {wonItem.name}
              </h2>
              <p className="text-sm text-gray-400 font-['Inter'] mt-1">
                Valor oficial de catálogo:{' '}
                <strong className="text-amber-400 font-mono text-base">
                  {wonItem.basePrice.toFixed(2)}€
                </strong>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleClaimWonItem}
                  className="flex-1 py-3.5 px-4 rounded-xl font-black font-['Rajdhani'] uppercase tracking-wider text-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:scale-105 transition-all cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Añadir al Carrito / Reclamar (0.00€)
                </button>

                <button
                  onClick={startSpin}
                  className="py-3.5 px-5 rounded-xl font-bold font-['Rajdhani'] uppercase tracking-wider text-amber-400 bg-[#1a1f30] hover:bg-[#232b42] text-sm border border-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Volver a Girar
                </button>

                <button
                  onClick={handleSellForBalance}
                  className="py-3.5 px-4 rounded-xl font-bold font-['Rajdhani'] uppercase tracking-wider text-emerald-400 bg-[#131f24] hover:bg-[#1a2d34] text-sm border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Vender por saldo virtual"
                >
                  <DollarSign className="w-4 h-4" />
                  Vender (+{Math.round(wonItem.basePrice * 0.7)}€)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════ DROP RATES TABLE ══════════ */}
        <div className="pt-8 border-t border-[#1c2233]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold font-['Rajdhani'] uppercase tracking-widest text-amber-500">
                Transparencia de Probabilidades
              </p>
              <h3 className="text-2xl font-black font-['Rajdhani'] text-white uppercase">
                Tabla de Drop Rates ({selectedCase.name})
              </h3>
            </div>
            <span className="text-xs text-gray-500 font-['Inter']">Algoritmo RNG verificado</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {selectedCase.pool.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#10131e] border border-[#1e2538] flex flex-col items-center text-center justify-between group hover:border-amber-500/40 transition-all"
              >
                <span
                  className="text-[10px] font-black font-['Rajdhani'] uppercase px-2 py-0.5 rounded-md mb-2"
                  style={{
                    backgroundColor: `${rarityColors[item.knife.rarity]}20`,
                    color: rarityColors[item.knife.rarity],
                  }}
                >
                  ★ {item.knife.rarity}
                </span>

                <div className="w-24 h-24 flex items-center justify-center my-1 relative">
                  <KarambitVFXImage
                    image={item.knife.image}
                    name={item.knife.name}
                    slug={item.knife.slug}
                    rarity={item.knife.rarity}
                    category={item.knife.category}
                    accentColor={item.knife.accentColor}
                    visualFilter={item.knife.visualFilter}
                    interactiveHover={true}
                    showSparkles={item.knife.rarity === 'Mythic Bespoke'}
                    showShimmer={false}
                  />
                </div>

                <div className="w-full mt-2">
                  <p className="text-xs font-bold text-white truncate font-['Rajdhani']">
                    {item.knife.name.replace('Karambit | ', '')}
                  </p>
                  <p className="text-xs font-black font-mono text-amber-400 mt-1">
                    {item.chance}% Drop
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

// ═══════════════════════════════════════════════════════
// 2. PACKS - COLLECTOR BUNDLES (/bundles y /packs)
// ═══════════════════════════════════════════════════════

interface BundleDefinition {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  originalPrice: number;
  bundlePrice: number;
  discountBadge: string;
  savingsEuro: number;
  itemsIncluded: string[];
  knives: Product[];
}

export const PacksPage: React.FC = () => {
  const { addToCart, setCartOpen } = useStore();
  const [selectedBlade, setSelectedBlade] = useState<Record<string, 'Sin Filo' | 'Afilada'>>({
    'bundle-founders-vault': 'Sin Filo',
    'bundle-tactical-cs2': 'Sin Filo',
    'bundle-doppler-trinity': 'Sin Filo',
    'bundle-pro-esports': 'Sin Filo',
    'bundle-yin-yang': 'Sin Filo',
    'bundle-starter': 'Sin Filo',
  });

  const bundles: BundleDefinition[] = [
    {
      id: 'bundle-founders-vault',
      name: "Founder's Vault Luxury Pack — DuFiTuFi Design (CEO)",
      tagline: 'Las 4 creaciones maestras de Alta Joyería firmadas por DuFiTuFi (CEO) reunidas en una colección irrepetible: Obra cumbre de 24.990€ con Californio, Diamantes VVS1, Oro Macizo 24K y Platino 950.',
      badge: 'DuFiTuFi Design (CEO) 1-of-1',
      originalPrice: 42460.0,
      bundlePrice: 32990.0,
      discountBadge: '-22% DTO',
      savingsEuro: 9470.0,
      itemsIncluded: [
        '★ Karambit | Imperial Celestial Pink Diamond & Californium (24.990€)',
        '★ Karambit | Diamond Sovereign (18K White Gold & VVS1) (9.990€)',
        '★ Karambit | 24K Solid Gold & Gibeon Meteorite (4.990€)',
        '★ Karambit | Royal Blood Ruby & Platinum 950 (2.490€)',
        '4x Vitrinas Blindadas Biométricas con iluminación LED integrada (GRATIS)',
        '4x Certificados Gemológicos Notariados firmados por DuFiTuFi (CEO) (GRATIS)',
      ],
      knives: [
        karambits.find((k) => k.id === 'krm-celestial-pink-diamond') || karambits[0],
        karambits.find((k) => k.id === 'krm-diamond-sovereign') || karambits[1],
        karambits.find((k) => k.id === 'krm-24k-gold-meteorite') || karambits[2],
        karambits.find((k) => k.id === 'krm-royal-blood-ruby-platinum') || karambits[3],
      ],
    },
    {
      id: 'bundle-tactical-cs2',
      name: 'Pack Táctico CS2',
      tagline: 'La trilogía táctica definitiva de CS2: Damascus Steel forjado en 440C, Black Laminate mate y Night operaciones nocturnas.',
      badge: 'Trilogía Táctica CS2',
      originalPrice: 334.4,
      bundlePrice: 219.9,
      discountBadge: '-34% DTO',
      savingsEuro: 114.5,
      itemsIncluded: [
        '★ Karambit | Damascus Steel Acero Forjado (119.90€)',
        '★ Karambit | Black Laminate Mate Táctico (94.90€)',
        '★ Karambit | Night Azul Medianoche (74.90€)',
        '3x Soportes Acrílicos Oficiales de Exhibición (Valor 44.70€ GRATIS)',
        'Grabado Láser de Código Táctico Militar en las hojas (GRATIS)',
      ],
      knives: [
        karambits.find((k) => k.id === 'krm-damascus-steel') || karambits[0],
        karambits.find((k) => k.id === 'krm-black-laminate') || karambits[1],
        karambits.find((k) => k.id === 'krm-night') || karambits[2],
      ],
    },
    {
      id: 'bundle-doppler-trinity',
      name: 'Doppler Trinity Pack',
      tagline: 'Las tres gemas supremas de CS2 forjadas en acero inoxidable 440C con 3 soportes incluidos.',
      badge: 'Pack Coleccionista Definitivo',
      originalPrice: 207.4,
      bundlePrice: 149.9,
      discountBadge: '-28% DTO',
      savingsEuro: 57.5,
      itemsIncluded: [
        'Karambit | Doppler Ruby (54.90€)',
        'Karambit | Doppler Sapphire (54.90€)',
        'Karambit | Gamma Doppler Emerald (52.90€)',
        '3x Soportes Acrílicos Oficiales de Exhibición (Valor 44.70€ GRATIS)',
      ],
      knives: [
        karambits.find((k) => k.id === 'krm-doppler-ruby') || karambits[0],
        karambits.find((k) => k.id === 'krm-doppler-sapphire') || karambits[1],
        karambits.find((k) => k.id === 'krm-doppler-emerald') || karambits[2],
      ],
    },
    {
      id: 'bundle-pro-esports',
      name: 'Pro Esports Legends Pack',
      tagline: 'Los dos acabados más laureados en la historia de los Majors, con fundas Kydex y StatTrak.',
      badge: 'Favorito Competitivo',
      originalPrice: 125.4,
      bundlePrice: 89.9,
      discountBadge: '-28% DTO',
      savingsEuro: 35.5,
      itemsIncluded: [
        'Karambit | Fade 100% (49.90€)',
        'Karambit | Lore Dragón (49.90€)',
        '2x Fundas Tácticas Kydex con Clip (Valor 11.80€ GRATIS)',
        'Grabado Artesanal StatTrak™ en ambas hojas incluido (Valor 13.80€ GRATIS)',
      ],
      knives: [
        karambits.find((k) => k.id === 'krm-fade') || karambits[7],
        karambits.find((k) => k.id === 'krm-lore') || karambits[10],
      ],
    },
    {
      id: 'bundle-yin-yang',
      name: 'Yin & Yang Dual Pack',
      tagline: 'La dualidad absoluta entre la oscuridad abisal de Black Pearl y la pureza del acero desnudo Vanilla.',
      badge: 'Edición Dual Limitada',
      originalPrice: 124.6,
      bundlePrice: 89.9,
      discountBadge: '-28% DTO',
      savingsEuro: 34.7,
      itemsIncluded: [
        'Karambit | Doppler Black Pearl (54.90€)',
        'Karambit | Vanilla ★ Acero Desnudo (39.90€)',
        '2x Soportes Acrílicos de Exhibición Oficiales (Valor 29.80€ GRATIS)',
      ],
      knives: [
        karambits.find((k) => k.id === 'krm-doppler-black-pearl') || karambits[3],
        karambits.find((k) => k.id === 'krm-vanilla') || karambits[14],
      ],
    },
    {
      id: 'bundle-starter',
      name: 'Starter Collector Pack',
      tagline: 'El set completo ideal para iniciar tu colección: réplica dorada, soporte, funda y placa metálica.',
      badge: 'Mejor Para Empezar',
      originalPrice: 77.6,
      bundlePrice: 59.9,
      discountBadge: '-23% DTO',
      savingsEuro: 17.7,
      itemsIncluded: [
        '1x Karambit | Tiger Tooth Dorado (46.90€)',
        '1x Soporte de Exhibición Acrílico Oficial (14.90€)',
        '1x Funda Protectora Kydex Táctica (5.90€)',
        '1x Placa Metálica NameTag Atornillada (9.90€)',
      ],
      knives: [karambits.find((k) => k.id === 'krm-tiger-tooth') || karambits[9]],
    },
  ];

  const handleAddBundleToCart = (bundle: BundleDefinition) => {
    const bladeChoice = selectedBlade[bundle.id] || 'Sin Filo';
    const pricePerKnife = Number((bundle.bundlePrice / bundle.knives.length).toFixed(2));

    bundle.knives.forEach((knife, index) => {
      const item: CartItem = {
        id: `pack-${bundle.id}-${knife.id}-${Date.now().toString(36)}-${index}`,
        productId: knife.id,
        name: `[${bundle.name}] ${knife.name}`,
        price: pricePerKnife,
        quantity: 1,
        gradient: knife.gradient,
        image: knife.image,
        type: 'bundle',
        condition: 'Factory New',
        bladeType: bladeChoice === 'Sin Filo' ? 'Sin Filo (Unsharpened)' : 'Afilada (Sharpened)',
        standIncluded: true,
        visualFilter: knife.visualFilter,
      };
      addToCart(item);
    });

    setCartOpen(true);
  };

  return (
    <main className="min-h-screen pt-28 pb-24 w-full bg-[#090a0f] text-gray-200">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-black tracking-widest text-[#ef4444] uppercase font-['Rajdhani'] bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 shadow-md">
            AHORRO EXCLUSIVO COLECCIONISTAS
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white font-['Rajdhani'] uppercase tracking-tight mt-3">
            Packs <span className="text-[#f59e0b]">Coleccionista</span>
          </h1>
          <p className="mt-2 text-gray-400 font-['Inter'] text-sm max-w-xl mx-auto">
            Combina réplicas icónicas 1:1 con soportes acrílicos y fundas tácticas incluidas con descuentos de hasta el 28%.
          </p>
        </motion.div>

        {/* Bundles List */}
        <div className="space-y-8">
          {bundles.map((bundle, idx) => {
            const currentBlade = selectedBlade[bundle.id] || 'Sin Filo';
            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-3xl p-6 sm:p-8 border border-[#1f2538] bg-[#0e1017] flex flex-col lg:flex-row gap-8 items-center shadow-xl hover:border-amber-500/40 transition-all"
              >
                {/* Visualizer with Real PNG Knives */}
                <div className="w-full lg:w-1/2 flex items-center justify-center relative py-6">
                  <div className="flex -space-x-12 sm:-space-x-16 overflow-visible items-center justify-center">
                    {bundle.knives.map((k, i) => (
                      <div
                        key={i}
                        className="w-36 sm:w-44 aspect-square flex items-center justify-center transition-transform duration-500 hover:scale-115 hover:z-30 relative group"
                        style={{ zIndex: 10 - i }}
                      >
                        <KarambitVFXImage
                          image={k.image}
                          name={k.name}
                          slug={k.slug}
                          rarity={k.rarity}
                          category={k.category}
                          accentColor={k.accentColor}
                          visualFilter={k.visualFilter}
                          interactiveHover={true}
                          showSparkles={k.rarity === 'Mythic Bespoke'}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bundle Details & Options */}
                <div className="w-full lg:w-1/2 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-md text-xs font-bold font-['Rajdhani'] uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {bundle.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      {bundle.discountBadge} (Ahorras {bundle.savingsEuro.toFixed(2)}€)
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white font-['Rajdhani'] uppercase">
                      {bundle.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-['Inter'] mt-1 leading-relaxed">
                      {bundle.tagline}
                    </p>
                  </div>

                  {/* Included Items */}
                  <div className="p-3.5 rounded-2xl bg-[#121520] border border-[#1b2133] space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider font-['Rajdhani']">
                      Contenido Incluido en el Pack:
                    </p>
                    <ul className="space-y-1.5 text-xs text-gray-300 font-['Inter']">
                      {bundle.itemsIncluded.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Blade Sharpness Choice */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 font-['Rajdhani'] block mb-2">
                      Selecciona Tipo de Hoja para el Pack:
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedBlade({ ...selectedBlade, [bundle.id]: 'Sin Filo' })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          currentBlade === 'Sin Filo'
                            ? 'bg-amber-500/15 border-amber-500 text-white'
                            : 'bg-[#141724] border-[#20273a] text-gray-400'
                        }`}
                      >
                        <p className="text-xs font-bold font-['Rajdhani'] uppercase flex justify-between">
                          Sin Filo (Tricks)
                          {currentBlade === 'Sin Filo' && (
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </p>
                        <p className="text-[10px] text-gray-500">Exhibición y maniobras seguras</p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedBlade({ ...selectedBlade, [bundle.id]: 'Afilada' })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          currentBlade === 'Afilada'
                            ? 'bg-amber-500/15 border-amber-500 text-white'
                            : 'bg-[#141724] border-[#20273a] text-gray-400'
                        }`}
                      >
                        <p className="text-xs font-bold font-['Rajdhani'] uppercase flex justify-between">
                          Hoja Afilada
                          {currentBlade === 'Afilada' && (
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </p>
                        <p className="text-[10px] text-gray-500">Corte funcional real 100%</p>
                      </button>
                    </div>
                  </div>

                  {/* Pricing & 1-Click Buy */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#1f2433]">
                    <div>
                      <span className="text-xs text-gray-500 line-through block font-mono">
                        {bundle.originalPrice.toFixed(2)}€
                      </span>
                      <span className="text-3xl font-black text-[#f59e0b] font-['Rajdhani']">
                        {bundle.bundlePrice.toFixed(2)}€
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddBundleToCart(bundle)}
                      className="px-6 py-3.5 rounded-xl font-black font-['Rajdhani'] uppercase tracking-wider text-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:scale-105 cursor-pointer text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Añadir Pack al Arsenal
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

// ═══════════════════════════════════════════════════════
// 3. STATTRAK LAB - INTERACTIVE WORKBENCH (/stattrak)
// ═══════════════════════════════════════════════════════

export const StatTrakPage: React.FC = () => {
  const { addToCart, setCartOpen, setCheckoutOpen } = useStore();

  const [selectedKnife, setSelectedKnife] = useState<Product>(karambits[0]);
  const [statTrakNumber, setStatTrakNumber] = useState<string>('0420');
  const [nameTagText, setNameTagText] = useState<string>('ACE CLUTCH');
  const [condition, setCondition] = useState<'Factory New' | 'Battle-Scarred'>('Factory New');
  const [bladeType, setBladeType] = useState<'Sin Filo (Unsharpened)' | 'Afilada (Sharpened)'>(
    'Sin Filo (Unsharpened)'
  );
  const [includeStand, setIncludeStand] = useState<boolean>(true);
  const [includeKydex, setIncludeKydex] = useState<boolean>(false);
  const [inspectMode, setInspectMode] = useState<'full' | 'blade' | 'handle'>('full');

  // Calculations
  const conditionMultiplier = condition === 'Battle-Scarred' ? 0.75 : 1.0;
  const basePrice = Number((selectedKnife.basePrice * conditionMultiplier).toFixed(2));
  const statTrakFee = 6.9;
  const nameTagFee = 9.9;
  const standFee = includeStand ? 14.9 : 0;
  const kydexFee = includeKydex ? 5.9 : 0;
  const totalConfigPrice = Number(
    (basePrice + statTrakFee + nameTagFee + standFee + kydexFee).toFixed(2)
  );

  const handleOrderCustomKnife = (directBuy = false) => {
    const item: CartItem = {
      id: `custom-st-${selectedKnife.id}-${condition}-${Date.now().toString(36)}`,
      productId: selectedKnife.id,
      name: `${selectedKnife.name} (StatTrak™ Lab)`,
      price: totalConfigPrice,
      quantity: 1,
      gradient: selectedKnife.gradient,
      image: selectedKnife.image,
      type: 'karambit',
      condition,
      bladeType,
      statTrak: true,
      statTrakCount: statTrakNumber || '000',
      nameTag: nameTagText || undefined,
      standIncluded: includeStand,
      kydexIncluded: includeKydex,
      visualFilter: selectedKnife.visualFilter,
    };

    addToCart(item);

    if (directBuy) {
      setCheckoutOpen(true);
    } else {
      setCartOpen(true);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-24 w-full bg-[#090a0f] text-gray-200">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-black tracking-widest text-amber-400 uppercase font-['Rajdhani'] bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/30 shadow-md">
            TALLER ARTESANAL DE PERSONALIZACIÓN
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white font-['Rajdhani'] uppercase tracking-tight mt-3">
            StatTrak™ <span className="text-[#f59e0b]">& NameTag Lab</span>
          </h1>
          <p className="mt-2 text-gray-400 font-['Inter'] text-sm max-w-xl mx-auto">
            Elige cualquier Karambit del arsenal y personaliza en vivo el grabado digital StatTrak™ en la hoja y la placa NameTag atornillada en el mango.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ══════════ WORKBENCH PREVIEW (6 cols) ══════════ */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#0e1017] border border-[#1f2433] flex flex-col items-center justify-center relative sticky top-28 shadow-2xl overflow-hidden min-h-[500px]">
            {/* Ambient Skin Glow */}
            <div
              className="absolute inset-0 opacity-25 rounded-3xl pointer-events-none transition-all duration-700"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${selectedKnife.accentColor}35 0%, transparent 70%)`,
              }}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <span className="text-[11px] font-bold text-amber-400 font-['Rajdhani'] uppercase bg-amber-500/15 px-3 py-1 rounded-lg border border-amber-500/30">
                StatTrak™ ACTIVO
              </span>
              <span className="text-[11px] font-bold text-gray-300 font-['Rajdhani'] uppercase bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                NameTag ACTIVO
              </span>
            </div>

            {/* Stage */}
            <div
              className="relative w-full aspect-square max-w-[420px] flex items-center justify-center transition-all duration-700 py-6"
              style={{
                transform:
                  inspectMode === 'blade'
                    ? 'scale(1.55) translate(-15%, 15%)'
                    : inspectMode === 'handle'
                    ? 'scale(1.7) translate(25%, -20%)'
                    : 'scale(1)',
              }}
            >
              <div
                className={`relative w-full h-full flex items-center justify-center transition-all duration-300 ${
                  condition === 'Battle-Scarred' ? 'contrast-125 saturate-75 brightness-90' : ''
                }`}
              >
                {/* Karambit VFX Image */}
                <KarambitVFXImage
                  image={selectedKnife.image}
                  name={selectedKnife.name}
                  slug={selectedKnife.slug}
                  rarity={selectedKnife.rarity}
                  category={selectedKnife.category}
                  accentColor={selectedKnife.accentColor}
                  visualFilter={selectedKnife.visualFilter}
                  condition={condition}
                  interactiveHover={false}
                  animateLevitate={selectedKnife.rarity === 'Mythic Bespoke'}
                  showSparkles={selectedKnife.rarity === 'Mythic Bespoke'}
                  showShimmer={selectedKnife.rarity === 'Mythic Bespoke'}
                />

                {/* Live StatTrak Digital LED on Blade */}
                <div
                  className="absolute z-20 px-2 py-0.5 rounded shadow-lg flex items-center gap-1 select-none pointer-events-none"
                  style={{
                    top: '55%',
                    left: '42%',
                    transform: 'translate(-50%, -50%) rotate(-35deg)',
                    background: 'linear-gradient(180deg, #18191d 0%, #0d0e12 100%)',
                    border: '1px solid #d97706',
                    boxShadow: '0 0 12px rgba(245, 158, 11, 0.45)',
                  }}
                >
                  <span className="text-[9px] font-black text-amber-500 font-mono">ST™</span>
                  <span
                    className="text-xs font-black tracking-widest font-mono text-[#f59e0b]"
                    style={{
                      textShadow: '0 0 8px #f59e0b, 0 0 16px rgba(245, 158, 11, 0.6)',
                    }}
                  >
                    {String(statTrakNumber || '000').padStart(3, '0')}
                  </span>
                </div>

                {/* Live NameTag Plate on Handle */}
                <div
                  className="absolute z-20 px-2.5 py-0.5 rounded-sm flex items-center justify-between gap-1.5 shadow-2xl select-none pointer-events-none"
                  style={{
                    top: '38%',
                    left: '44%',
                    transform: 'translate(-50%, -50%) rotate(22deg)',
                    background:
                      'linear-gradient(180deg, #d4d4d8 0%, #a1a1aa 45%, #71717a 100%)',
                    border: '1px solid #e4e4e7',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.8), inset 0 1px 1px #ffffff',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-inner block" />
                  <span
                    className="text-[10px] font-black tracking-wider text-zinc-900 font-mono uppercase px-1"
                    style={{ textShadow: '0 1px 0 rgba(255,255,255,0.6)' }}
                  >
                    "{nameTagText || 'TU_ALIAS'}"
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-inner block" />
                </div>
              </div>
            </div>

            {/* Inspection Zoom Buttons */}
            <div className="flex gap-2 z-20 mb-3 bg-[#080a10]/80 p-1.5 rounded-xl border border-[#1b2133] backdrop-blur-sm">
              <button
                onClick={() => setInspectMode('full')}
                className={`px-3 py-1 rounded-lg text-xs font-['Rajdhani'] font-bold uppercase transition-all ${
                  inspectMode === 'full' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                General
              </button>
              <button
                onClick={() => setInspectMode('blade')}
                className={`px-3 py-1 rounded-lg text-xs font-['Rajdhani'] font-bold uppercase transition-all ${
                  inspectMode === 'blade' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 inline mr-1" />
                Hoja (StatTrak)
              </button>
              <button
                onClick={() => setInspectMode('handle')}
                className={`px-3 py-1 rounded-lg text-xs font-['Rajdhani'] font-bold uppercase transition-all ${
                  inspectMode === 'handle' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1" />
                Mango (NameTag)
              </button>
            </div>

            {/* Bottom info */}
            <div className="w-full pt-4 border-t border-[#1f2433] text-center">
              <h3 className="text-2xl font-black text-white font-['Rajdhani'] uppercase">
                {selectedKnife.name}
              </h3>
              <p className="text-xs text-gray-400 font-['Inter'] mt-1">
                Acero Inoxidable 440C · Réplica 1:1 · Módulo LED Orange StatTrak™ (+6.90€) · Placa NameTag (+9.90€)
              </p>
            </div>
          </div>

          {/* ══════════ CONFIGURATION FORM (6 cols) ══════════ */}
          <div className="lg:col-span-6 space-y-5">
            {/* 1. Base Knife Selector (All 18+ Karambits) */}
            <div className="bg-[#0e1017] p-5 rounded-2xl border border-[#1f2433] space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-gray-300 font-['Rajdhani'] block flex justify-between">
                <span>1. Elige tu Skin Base (34+ Modelos CS2 & Joyería)</span>
                <span className="text-amber-400 font-mono">{selectedKnife.name.replace('Karambit | ', '')}</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 pr-1.5">
                {karambits.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => setSelectedKnife(k)}
                    className={`p-2 rounded-xl border flex flex-col items-center text-center gap-1 transition-all ${
                      selectedKnife.id === k.id
                        ? 'border-amber-500 bg-[#161a29] shadow-md shadow-amber-500/20 scale-105'
                        : 'border-[#1f2433] bg-[#12141e] hover:border-gray-600'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center p-0.5 relative">
                      <KarambitVFXImage
                        image={k.image}
                        name={k.name}
                        slug={k.slug}
                        rarity={k.rarity}
                        category={k.category}
                        accentColor={k.accentColor}
                        visualFilter={k.visualFilter}
                        interactiveHover={false}
                        showSparkles={false}
                        showShimmer={false}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-200 truncate w-full font-['Rajdhani']">
                      {k.name.replace('Karambit | ', '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. StatTrak Configuration */}
            <div className="bg-[#0e1017] p-5 rounded-2xl border border-[#1f2433] space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-wider text-gray-300 font-['Rajdhani'] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  2. Grabado Digital StatTrak™ (+6.90€)
                </label>
                <span className="text-xs font-mono text-amber-400 font-bold">LED CS2 Orange</span>
              </div>
              <p className="text-xs text-gray-400 font-['Inter']">
                Introduce el número de bajas que se grabará sobre la hoja (hasta 4 dígitos):
              </p>
              <div className="flex gap-2">
                {['007', '420', '777', '1337'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setStatTrakNumber(val)}
                    className="px-2.5 py-1 rounded-lg bg-[#141724] border border-[#1f2433] text-xs font-mono text-gray-300 hover:text-amber-400"
                  >
                    #{val}
                  </button>
                ))}
                <input
                  type="text"
                  maxLength={4}
                  value={statTrakNumber}
                  onChange={(e) => setStatTrakNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="000"
                  className="flex-1 bg-[#12141e] border border-[#2b3550] focus:border-amber-500 rounded-lg px-3 py-1.5 text-sm font-mono text-amber-400 text-center font-bold outline-none"
                />
              </div>
            </div>

            {/* 3. NameTag Laser Text */}
            <div className="bg-[#0e1017] p-5 rounded-2xl border border-[#1f2433] space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-wider text-gray-300 font-['Rajdhani'] flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-gray-300" />
                  3. Placa NameTag con Remaches (+9.90€)
                </label>
                <span className="text-xs text-gray-500 font-mono">Máx 12 Letras</span>
              </div>
              <input
                type="text"
                maxLength={12}
                value={nameTagText}
                onChange={(e) => setNameTagText(e.target.value.toUpperCase().slice(0, 12))}
                placeholder="EJ: S1MPLE, CLUTCH, ACE..."
                className="w-full bg-[#12141e] border border-[#2b3550] focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm font-mono uppercase text-white tracking-widest outline-none"
              />
            </div>

            {/* 4. Condition & Blade Type */}
            <div className="bg-[#0e1017] p-5 rounded-2xl border border-[#1f2433] space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-gray-300 font-['Rajdhani'] block flex justify-between">
                <span>4. Estado y Filo</span>
                <span className="text-amber-400 font-mono">
                  {condition === 'Battle-Scarred' ? '-25% DESCUENTO' : 'Float 0.01'}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCondition('Factory New')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    condition === 'Factory New'
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-[#12141e] border-[#1f2433] text-gray-400'
                  }`}
                >
                  <p className="text-xs font-bold font-['Rajdhani'] uppercase flex justify-between">
                    Factory New
                    {condition === 'Factory New' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </p>
                  <p className="text-[10px] text-gray-500">Recién Fabricado · Impecable</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCondition('Battle-Scarred')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    condition === 'Battle-Scarred'
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-[#12141e] border-[#1f2433] text-gray-400'
                  }`}
                >
                  <p className="text-xs font-bold font-['Rajdhani'] uppercase flex justify-between">
                    Battle-Scarred
                    {condition === 'Battle-Scarred' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </p>
                  <p className="text-[10px] text-emerald-400">-25% Descuento</p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBladeType('Sin Filo (Unsharpened)')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    bladeType.includes('Sin Filo')
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-[#12141e] border-[#1f2433] text-gray-400'
                  }`}
                >
                  <p className="text-xs font-bold font-['Rajdhani'] uppercase flex justify-between">
                    Sin Filo (Tricks)
                    {bladeType.includes('Sin Filo') && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </p>
                  <p className="text-[10px] text-gray-500">Seguro para spinning</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBladeType('Afilada (Sharpened)')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    bladeType.includes('Afilada')
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-[#12141e] border-[#1f2433] text-gray-400'
                  }`}
                >
                  <p className="text-xs font-bold font-['Rajdhani'] uppercase flex justify-between">
                    Hoja Afilada
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                  </p>
                  <p className="text-[10px] text-gray-500">Corte real funcional</p>
                </button>
              </div>
            </div>

            {/* 5. Accessories Cross-Sell */}
            <div className="bg-[#0e1017] p-5 rounded-2xl border border-[#1f2433] space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-gray-300 font-['Rajdhani'] block">
                5. Accesorios Opcionales
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#141724] border border-[#1f2433] cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={includeStand}
                    onChange={(e) => setIncludeStand(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white font-['Rajdhani'] uppercase block">
                      Soporte Acrílico Oficial (+14.90€)
                    </span>
                    <span className="text-[10px] text-gray-400 font-['Inter']">
                      Cristal de 8mm con grabado láser KRM
                    </span>
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#141724] border border-[#1f2433] cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={includeKydex}
                    onChange={(e) => setIncludeKydex(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white font-['Rajdhani'] uppercase block">
                      Funda Protectora Kydex (+5.90€)
                    </span>
                    <span className="text-[10px] text-gray-400 font-['Inter']">
                      Clip de cintura y retención táctica
                    </span>
                  </div>
                </div>
              </label>
            </div>

            {/* Price & Action */}
            <div className="p-6 rounded-3xl bg-[#090b10] border border-[#232c44] shadow-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-gray-500 block font-['Inter']">
                  Total Personalizado en Taller
                </span>
                <span className="text-3xl font-black text-[#f59e0b] font-['Rajdhani']">
                  {totalConfigPrice.toFixed(2)}€
                </span>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOrderCustomKnife(false)}
                  className="px-5 py-3 rounded-xl font-bold font-['Rajdhani'] uppercase text-white bg-[#1f2433] hover:bg-[#2c3347] transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Al Carrito
                </button>
                <button
                  type="button"
                  onClick={() => handleOrderCustomKnife(true)}
                  className="px-6 py-3 rounded-xl font-black font-['Rajdhani'] uppercase text-black transition-all hover:scale-105 flex items-center gap-1.5 shadow-lg shadow-amber-500/25 cursor-pointer text-xs"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  <Zap className="w-4 h-4" />
                  Comprar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
