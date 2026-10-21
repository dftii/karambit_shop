import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  Star,
  Heart,
  ShoppingCart,
  X,
  Grid3X3,
  LayoutList,
  Filter,
  Sparkles,
} from 'lucide-react';
import {
  karambits,
  accessories,
  rarityColors,
  type Category,
  type Rarity,
} from '../data/karambits';
import { useStore } from '../store/useStore';
import { KarambitVFXImage } from '../components/KarambitVFXImage';

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'name';

const renderCardBadges = (product: typeof karambits[0]) => {
  const isMythic = product.rarity === 'Mythic Bespoke';
  const isExclusive = product.isExclusive || product.slug === 'celestial-pink-diamond';
  const badges: React.ReactNode[] = [];

  if (isExclusive) {
    badges.push(
      <span
        key="exclusive"
        className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider font-['Rajdhani'] flex items-center gap-1 text-white bg-gradient-to-r from-rose-500 via-amber-500 to-sky-500 border border-amber-300 animate-exclusive-badge shadow-lg"
      >
        <Sparkles className="w-2.5 h-2.5 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
        EXCLUSIVE
      </span>
    );
  }

  if (isMythic && badges.length < 2) {
    badges.push(
      <span
        key="ceo"
        className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-amber-500/25 to-sky-500/25 text-amber-300 border border-amber-400/60 font-['Rajdhani'] uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
      >
        👑 DuFiTuFi CEO 1:1
      </span>
    );
  }

  if (product.isLimitedEdition && badges.length < 2) {
    badges.push(
      <span
        key="limited"
        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 font-['Rajdhani'] uppercase tracking-wider"
      >
        Edición Limitada
      </span>
    );
  }

  if (product.isNew && badges.length < 2) {
    badges.push(
      <span
        key="new"
        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-['Rajdhani'] uppercase tracking-wider"
      >
        Nuevo
      </span>
    );
  }

  return badges;
};

const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, setCartOpen } = useStore();

  // ── Filter state ──────────────────────
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<Rarity[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 25000]);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAccessories, setShowAccessories] = useState(true);

  // ── Filtering logic ───────────────────
  const filteredProducts = useMemo(() => {
    let result = [...karambits];

    // Search
    if (search.length >= 2) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Rarity
    if (selectedRarities.length > 0) {
      result = result.filter((p) => selectedRarities.includes(p.rarity));
    }

    // Price
    result = result.filter(
      (p) => p.basePrice >= priceRange[0] && p.basePrice <= priceRange[1]
    );

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
      default:
        result.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
    }

    return result;
  }, [search, selectedCategories, selectedRarities, priceRange, sortBy]);

  // Toggle category
  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Toggle rarity
  const toggleRarity = (rar: Rarity) => {
    setSelectedRarities((prev) =>
      prev.includes(rar) ? prev.filter((r) => r !== rar) : [...prev, rar]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedRarities([]);
    setPriceRange([0, 25000]);
    setSortBy('popular');
  };

  const hasActiveFilters =
    search ||
    selectedCategories.length > 0 ||
    selectedRarities.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 25000;

  const allCategories: Category[] = [
    'Founder Bespoke (Joyería 1:1)',
    'Doppler Series',
    'Iconic Skins',
    'Tactical & Forged CS2',
    'Military Spec-Ops CS2',
    'Esports Edition',
  ];

  const allRarities: Rarity[] = [
    'Mythic Bespoke',
    'Covert',
    'Extraordinary',
    'Classified',
    'Mil-Spec',
  ];

  return (
    <main className="min-h-screen pt-24 pb-16" style={{ background: '#090a0f' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ═══ HEADER ═══ */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#f59e0b] uppercase">
                // CATÁLOGO COMPLETO
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-white font-['Rajdhani'] uppercase tracking-tight mt-1">
                Arsenal <span className="text-[#f59e0b]">Karambit</span>
              </h1>
              <p className="text-gray-400 font-['Inter'] text-sm mt-1">
                {filteredProducts.length} modelos tácticos y piezas de alta joyería disponibles
              </p>
            </div>

            {/* View Mode & Filter Toggle (Mobile) */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl font-['Rajdhani'] font-bold text-sm uppercase tracking-wider text-white bg-[#12141d] border border-[#1f2433]"
              >
                <Filter className="w-4 h-4 text-[#f59e0b]" />
                Filtros
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                )}
              </button>

              <div className="flex items-center rounded-xl overflow-hidden border border-[#1f2433] bg-[#12141d]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#f59e0b] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Vista cuadrícula"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#f59e0b] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Vista lista"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══ SEARCH & QUICK BAR ═══ */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, acabado, gema, tag..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#12141d] border border-[#1f2433] text-white placeholder-gray-500 font-['Inter'] text-sm focus:border-[#f59e0b] focus:outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative sm:w-56">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full appearance-none px-4 py-3 rounded-xl bg-[#12141d] border border-[#1f2433] text-white font-['Rajdhani'] font-bold text-sm uppercase tracking-wider focus:border-[#f59e0b] focus:outline-none cursor-pointer"
            >
              <option value="popular">Más Populares</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="rating">Mejor Valorados</option>
              <option value="name">Nombre A-Z</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* ═══ ACTIVE FILTERS PILLS ═══ */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-['Rajdhani'] uppercase tracking-wider">
              Filtros activos:
            </span>
            {selectedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Rajdhani'] font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/25 transition-colors"
              >
                {cat}
                <X className="w-3 h-3" />
              </button>
            ))}
            {selectedRarities.map((rar) => (
              <button
                key={rar}
                onClick={() => toggleRarity(rar)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Rajdhani'] font-bold border transition-colors"
                style={{
                  color: rarityColors[rar],
                  borderColor: `${rarityColors[rar]}40`,
                  background: `${rarityColors[rar]}15`,
                }}
              >
                {rar}
                <X className="w-3 h-3" />
              </button>
            ))}
            {(priceRange[0] > 0 || priceRange[1] < 25000) && (
              <button
                onClick={() => setPriceRange([0, 25000])}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Rajdhani'] font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
              >
                {priceRange[0]}€ - {priceRange[1]}€
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-white underline font-['Inter'] ml-2"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* ═══ MAIN LAYOUT ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ─── SIDEBAR FILTERS ─── */}
          <aside
            className={`md:block ${
              showFilters ? 'block' : 'hidden'
            } space-y-6 md:sticky md:top-28 md:self-start`}
          >
            {/* Categories */}
            <div className="p-5 rounded-2xl bg-[#12141d] border border-[#1f2433]">
              <h3 className="text-white font-bold font-['Rajdhani'] text-base uppercase tracking-wider mb-4 flex items-center justify-between">
                Categorías
                <span className="text-xs text-gray-500 font-mono">
                  ({allCategories.length})
                </span>
              </h3>
              <div className="space-y-2">
                {allCategories.map((cat) => {
                  const count = karambits.filter((k) => k.category === cat).length;
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-['Rajdhani'] font-bold transition-all text-left ${
                        isSelected
                          ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      <span className="text-[10px] font-mono text-gray-500 ml-2">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rarity */}
            <div className="p-5 rounded-2xl bg-[#12141d] border border-[#1f2433]">
              <h3 className="text-white font-bold font-['Rajdhani'] text-base uppercase tracking-wider mb-4">
                Rareza CS2 / Joyería
              </h3>
              <div className="space-y-2">
                {allRarities.map((rar) => {
                  const count = karambits.filter((k) => k.rarity === rar).length;
                  const isSelected = selectedRarities.includes(rar);
                  return (
                    <button
                      key={rar}
                      onClick={() => toggleRarity(rar)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-['Rajdhani'] font-bold transition-all text-left ${
                        isSelected
                          ? 'border'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                      style={{
                        color: rarityColors[rar],
                        borderColor: isSelected
                          ? `${rarityColors[rar]}60`
                          : 'transparent',
                        background: isSelected
                          ? `${rarityColors[rar]}15`
                          : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: rarityColors[rar] }}
                        />
                        <span>{rar}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="p-5 rounded-2xl bg-[#12141d] border border-[#1f2433]">
              <h3 className="text-white font-bold font-['Rajdhani'] text-base uppercase tracking-wider mb-4">
                Rango de Precio
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>{priceRange[0]}€</span>
                  <span className="text-[#f59e0b] font-bold">{priceRange[1]}€</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25000}
                  step={50}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full cursor-pointer accent-[#f59e0b]"
                />
                <div className="flex gap-2">
                  {[
                    { label: '<150€', max: 150 },
                    { label: '<300€', max: 300 },
                    { label: '<1000€', max: 1000 },
                    { label: 'Todas', max: 25000 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setPriceRange([0, preset.max])}
                      className="flex-1 py-1 px-2 rounded-lg text-[10px] font-mono bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Toggle Accessories */}
            <div className="p-5 rounded-2xl bg-[#12141d] border border-[#1f2433]">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-bold font-['Rajdhani'] text-white uppercase tracking-wider">
                  Ver Accesorios
                </span>
                <input
                  type="checkbox"
                  checked={showAccessories}
                  onChange={(e) => setShowAccessories(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#f59e0b]"
                />
              </label>
            </div>
          </aside>

          {/* ─── PRODUCT GRID / LIST ─── */}
          <div className="md:col-span-3">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => {
                    const isMythic = product.rarity === 'Mythic Bespoke';

                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => navigate(`/product/${product.slug}`)}
                        className={`group relative rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-500 ${
                          isMythic
                            ? 'border border-sky-400/50 hover:border-amber-300 shadow-[0_0_30px_-5px_rgba(56,189,248,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.35)]'
                            : 'border border-[#1f2433] hover:border-gray-700'
                        }`}
                        style={{
                          background: isMythic
                            ? 'linear-gradient(180deg, #131726 0%, #0a0d16 100%)'
                            : '#12141d',
                        }}
                      >
                        {/* Badges Container - Compact horizontal wrap with max 2 badges */}
                        <div className="absolute top-3.5 left-3.5 z-20 flex flex-row flex-wrap gap-1.5 max-w-[80%] pointer-events-none">
                          {renderCardBadges(product)}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist({
                              id: product.id,
                              name: product.name,
                              price: product.basePrice,
                              gradient: product.gradient,
                            });
                          }}
                          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/75 transition-all"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              isInWishlist(product.id)
                                ? 'text-red-500 fill-red-500'
                                : 'text-gray-400 hover:text-red-400'
                            }`}
                          />
                        </button>

                        {/* Karambit VFX Image Stage with Live Glow, Shimmer, & Sparkles - Clear of Badges */}
                        <div className="relative aspect-square flex items-center justify-center overflow-hidden p-6 pt-12 mt-2">
                          <KarambitVFXImage
                            image={product.image}
                            name={product.name}
                            slug={product.slug}
                            rarity={product.rarity}
                            category={product.category}
                            accentColor={product.accentColor}
                            visualFilter={product.visualFilter}
                            interactiveHover={true}
                            animateLevitate={isMythic}
                            showSparkles={isMythic}
                            showShimmer={isMythic}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-5 space-y-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-0.5 flex-1 rounded-full"
                              style={{
                                background: `linear-gradient(90deg, ${rarityColors[product.rarity]}, transparent)`,
                              }}
                            />
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider font-['Rajdhani']"
                              style={{ color: rarityColors[product.rarity] }}
                            >
                              {product.rarity}
                            </span>
                          </div>

                          <h3 className="text-white font-bold font-['Rajdhani'] text-lg leading-tight group-hover:text-[#f59e0b] transition-colors line-clamp-2">
                            {product.name}
                          </h3>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, j) => (
                                <Star
                                  key={j}
                                  className={`w-3 h-3 ${
                                    j < Math.floor(product.rating)
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 font-['Inter']">
                              ({product.reviewsCount})
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div>
                              <span className="text-xl font-bold text-[#f59e0b] font-['Rajdhani']">
                                {product.basePrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                              </span>
                              <span className="ml-2 text-sm text-gray-500 line-through font-['Inter']">
                                {(product.originalPrice ?? product.basePrice * 1.4).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart({
                                  id: `${product.id}-fn-${Date.now().toString(36)}`,
                                  productId: product.id,
                                  name: product.name.startsWith('★') || product.name.startsWith('Karambit') ? product.name : `Karambit | ${product.name}`,
                                  price: product.basePrice,
                                  quantity: 1,
                                  gradient: product.gradient,
                                  image: product.image,
                                  visualFilter: product.visualFilter,
                                  type: 'karambit',
                                  condition: 'Factory New',
                                  bladeType: 'Sin Filo (Unsharpened)',
                                });
                                setCartOpen(true);
                              }}
                              className="p-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                              style={{
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)',
                              }}
                              title="Añadir al Arsenal"
                            >
                              <ShoppingCart className="w-4 h-4 text-black" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => {
                    const isMythic = product.rarity === 'Mythic Bespoke';

                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={() => navigate(`/product/${product.slug}`)}
                        className={`flex items-center gap-6 p-4 rounded-2xl group cursor-pointer transition-all ${
                          isMythic
                            ? 'border border-sky-400/40 hover:border-amber-300 shadow-[0_0_20px_-5px_rgba(56,189,248,0.2)]'
                            : 'border border-[#1f2433] hover:border-gray-700'
                        }`}
                        style={{
                          background: isMythic
                            ? 'linear-gradient(180deg, #131726 0%, #0a0d16 100%)'
                            : '#12141d',
                        }}
                      >
                        <div className="w-28 h-28 flex-shrink-0 flex items-center justify-center p-2 relative">
                          <KarambitVFXImage
                            image={product.image}
                            name={product.name}
                            slug={product.slug}
                            rarity={product.rarity}
                            category={product.category}
                            accentColor={product.accentColor}
                            visualFilter={product.visualFilter}
                            interactiveHover={true}
                            showSparkles={isMythic}
                            showShimmer={isMythic}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {renderCardBadges(product)}
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider font-['Rajdhani'] px-1.5 py-0.5 rounded"
                              style={{
                                color: rarityColors[product.rarity],
                                background: `${rarityColors[product.rarity]}15`,
                              }}
                            >
                              {product.rarity}
                            </span>
                            <span className="text-[10px] text-gray-500 font-['Inter']">
                              {product.category}
                            </span>
                          </div>
                          <h3 className="text-white font-bold font-['Rajdhani'] text-lg group-hover:text-[#f59e0b] transition-colors truncate">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            {[...Array(5)].map((_, j) => (
                              <Star
                                key={j}
                                className={`w-3 h-3 ${
                                  j < Math.floor(product.rating)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 font-['Inter'] ml-1">
                              ({product.reviewsCount})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <span className="text-xl font-bold text-[#f59e0b] font-['Rajdhani']">
                              {product.basePrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </span>
                            <br />
                            <span className="text-sm text-gray-600 line-through font-['Inter']">
                              {(product.originalPrice ?? product.basePrice * 1.4).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist({
                                id: product.id,
                                name: product.name,
                                price: product.basePrice,
                                gradient: product.gradient,
                              });
                            }}
                            className="p-2.5 rounded-lg hover:bg-[#1f2433] transition-colors text-gray-400 hover:text-red-400"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isInWishlist(product.id)
                                  ? 'text-red-500 fill-red-500'
                                  : 'text-gray-500'
                              }`}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart({
                                id: `${product.id}-fn-${Date.now().toString(36)}`,
                                productId: product.id,
                                name: `Karambit | ${product.name}`,
                                price: product.basePrice,
                                quantity: 1,
                                gradient: product.gradient,
                                image: product.image,
                                visualFilter: product.visualFilter,
                                type: 'karambit',
                                condition: 'Factory New',
                                bladeType: 'Sin Filo (Unsharpened)',
                              });
                              setCartOpen(true);
                            }}
                            className="p-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                            style={{
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            }}
                            title="Añadir al Arsenal"
                          >
                            <ShoppingCart className="w-4 h-4 text-black" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* No results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-['Rajdhani']">
                  No se encontraron karambits con estos filtros
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 rounded-xl text-[#f59e0b] font-['Rajdhani'] uppercase tracking-wider hover:bg-[#f59e0b]/10 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* ═══ ACCESSORIES SECTION ═══ */}
            {showAccessories && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16"
              >
                <h2 className="text-3xl font-black text-white font-['Rajdhani'] uppercase tracking-tight mb-6">
                  Accesorios <span className="text-[#f59e0b]">Oficiales</span>
                </h2>
                <div className="grid sm:grid-cols-3 gap-6">
                  {accessories.map((acc, i) => (
                    <motion.div
                      key={acc.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-2xl group flex flex-col justify-between"
                      style={{ background: '#12141d', border: '1px solid #1f2433' }}
                    >
                      <div>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl"
                          style={{
                            background: `linear-gradient(135deg, ${acc.gradient[0]}20, ${acc.gradient[1]}20)`,
                          }}
                        >
                          {acc.icon === 'trophy' && '🏆'}
                          {acc.icon === 'shield' && '🛡️'}
                          {acc.icon === 'tag' && '🏷️'}
                        </div>
                        <h3 className="text-white font-bold font-['Rajdhani'] text-lg mb-1 group-hover:text-[#f59e0b] transition-colors">
                          {acc.name}
                        </h3>
                        <p className="text-gray-500 text-sm font-['Inter'] mb-4 line-clamp-2">
                          {acc.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xl font-bold text-[#f59e0b] font-['Rajdhani']">
                          {acc.price.toFixed(2)}€
                        </span>
                        <button
                          onClick={() =>
                            addToCart({
                              id: acc.id,
                              name: acc.name,
                              price: acc.price,
                              quantity: 1,
                              gradient: acc.gradient,
                              type: 'accessory',
                            })
                          }
                          className="px-4 py-2 rounded-xl text-sm font-bold font-['Rajdhani'] uppercase tracking-wider transition-all duration-300 hover:scale-105 text-black"
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          }}
                        >
                          Añadir
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ShopPage;
