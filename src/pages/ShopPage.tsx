import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronDown, X, Grid3X3, LayoutList, SlidersHorizontal } from 'lucide-react';
import { karambits, accessories, rarityColors, type Category, type Rarity, type Product } from '../data/karambits';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store/useStore';
import { buildAccessoryCartItem, notifyCartResult } from '../lib/cart';
import { KarambitVFXImage } from '../components/KarambitVFXImage';
import { QuickViewButton } from '../components/QuickViewButton';
import { PageMeta } from '../components/PageMeta';
import { CheckRow } from '../components/CheckRow';
import { ProductCard, WishlistHeart, AddToCartIcon } from '../components/ProductCard';
import { FOUNDER_CHIP, isFounderPiece, productTags, skinName } from '../lib/productDisplay';
import { Badge } from '../components/ui/Badge';
import { Price } from '../components/ui/Price';
import { buttonClasses } from '../components/ui/buttonStyles';

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'name';

const MAX_PRICE = 25000;
const pad2 = (n: number) => String(n).padStart(2, '0');

const ALL_CATEGORIES: Category[] = [
  'Founder Bespoke (Joyería 1:1)',
  'Doppler Series',
  'Iconic Skins',
  'Tactical & Forged CS2',
  'Military Spec-Ops CS2',
  'Esports Edition',
];

const ALL_RARITIES: Rarity[] = ['Mythic Bespoke', 'Covert', 'Extraordinary', 'Classified', 'Mil-Spec'];

const PRICE_PRESETS = [
  { label: '< 150 €', max: 150 },
  { label: '< 300 €', max: 300 },
  { label: '< 1.000 €', max: 1000 },
  { label: 'Todas', max: MAX_PRICE },
];

/** Cabecera de grupo de filtros: etiqueta mono + regla. */
const FilterGroup: React.FC<{ title: string; aside?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  aside,
  children,
}) => (
  <fieldset className="min-w-0 border-0 p-0">
    <legend className="sr-only">{title}</legend>
    <div className="flex items-baseline justify-between border-b border-ink pb-2" aria-hidden="true">
      <p className="eyebrow !text-ink">{title}</p>
      {aside}
    </div>
    {children}
  </fieldset>
);

/** Fila de producto para la vista de lista. */
const ProductRow: React.FC<{ product: Product }> = ({ product }) => {
  const to = `/product/${product.slug}`;
  const founder = isFounderPiece(product);
  const tags = founder ? [FOUNDER_CHIP] : productTags(product);
  const priceClass = founder ? '!text-pink' : '';
  const strikeClass = founder ? '!text-paper/50' : '';
  return (
    <article
      className={`group flex items-center gap-3 border-b p-3 sm:gap-6 sm:p-4 ${
        founder ? 'border-paper/20 bg-ink text-paper' : 'border-line bg-paper'
      }`}
    >
      <div className={`relative h-20 w-20 shrink-0 overflow-hidden sm:h-28 sm:w-28 ${founder ? 'bg-[#1a1918]' : 'bg-tile'}`}>
        <Link to={to} tabIndex={-1} aria-hidden="true" className="block h-full w-full p-2.5 sm:p-3">
          <KarambitVFXImage
            image={product.image}
            name={product.name}
          />
        </Link>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Badge color={rarityColors[product.rarity]} className={founder ? '!text-paper/60' : ''}>
            {product.rarity}
          </Badge>
          {tags.map((tag) =>
            founder ? (
              <span
                key={tag}
                className="bg-pink px-2 py-1 font-mono text-[10px] font-medium uppercase leading-[1.25] tracking-[0.08em] text-ink"
              >
                {tag}
              </span>
            ) : (
              <span key={tag} className="eyebrow !text-ink">
                {tag}
              </span>
            )
          )}
        </div>
        <h3
          className={`mt-2 font-body text-[15px] font-medium leading-snug tracking-normal sm:text-base ${
            founder ? 'text-paper' : 'text-ink'
          }`}
        >
          <Link
            to={to}
            className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-pink"
          >
            {skinName(product.name)}
          </Link>
        </h3>
        <p className={`eyebrow mt-1.5 hidden sm:block ${founder ? '!text-paper/60' : ''}`}>
          {product.category} · {product.rating.toFixed(1)} ({product.reviewsCount})
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 sm:hidden">
          <Price value={product.basePrice} size="md" className={priceClass} />
          {product.originalPrice && product.originalPrice > product.basePrice && (
            <Price value={product.originalPrice} size="xs" tone="muted" strike className={strikeClass} />
          )}
        </div>
      </div>

      <div className="hidden shrink-0 flex-col items-end sm:flex">
        <Price value={product.basePrice} size="md" className={priceClass} />
        {product.originalPrice && product.originalPrice > product.basePrice && (
          <Price value={product.originalPrice} size="xs" tone="muted" strike className={strikeClass} />
        )}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
        <WishlistHeart product={product} inverted={founder} className={founder ? '' : 'border border-line'} />
        <QuickViewButton
          product={product}
          variant="icon"
          inverted={founder}
          className="!p-0 h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center"
        />
        <AddToCartIcon product={product} inverted={founder} />
      </div>
    </article>
  );
};

const ShopPage: React.FC = () => {
  const { addToCart } = useStore(useShallow((s) => ({ addToCart: s.addToCart })));

  // ── Filter state ──────────────────────
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<Rarity[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAccessories, setShowAccessories] = useState(true);

  // ── Filtering logic ───────────────────
  const filteredProducts = useMemo(() => {
    let result = [...karambits];

    if (search.length >= 2) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedRarities.length > 0) {
      result = result.filter((p) => selectedRarities.includes(p.rarity));
    }

    result = result.filter((p) => p.basePrice >= priceRange[0] && p.basePrice <= priceRange[1]);

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

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const toggleRarity = (rar: Rarity) => {
    setSelectedRarities((prev) => (prev.includes(rar) ? prev.filter((r) => r !== rar) : [...prev, rar]));
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedRarities([]);
    setPriceRange([0, MAX_PRICE]);
    setSortBy('popular');
  };

  const priceActive = priceRange[0] > 0 || priceRange[1] < MAX_PRICE;
  const activeCount =
    (search ? 1 : 0) + selectedCategories.length + selectedRarities.length + (priceActive ? 1 : 0);
  const hasActiveFilters = activeCount > 0;

  const chipClass =
    'inline-flex items-center gap-1.5 border border-ink px-2.5 py-1.5 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-paper';

  return (
    <main id="main" tabIndex={-1} className="wrap py-12 outline-none sm:py-20">
      <PageMeta
        title="Catálogo"
        description="Catálogo completo de réplicas de karambit CS2: filtra por categoría, rareza y precio, y personaliza cada pieza."
      />

      {/* ═══ CABECERA ═══ */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="eyebrow">01 — Colección completa</p>
          <h1 className="display-xl mt-4">Catálogo</h1>
        </div>
        <p className="font-mono text-sm tabular-nums text-ink-2" aria-live="polite">
          <span className="text-ink">{pad2(filteredProducts.length)}</span> / {pad2(karambits.length)} modelos
        </p>
      </motion.header>

      {/* ═══ BARRA: búsqueda · orden · vista ═══ */}
      <div className="flex flex-col gap-3 border-b border-line py-5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            aria-label="Buscar productos"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, acabado, gema, tag..."
            className="h-[46px] w-full border border-line bg-paper-2 pl-10 pr-10 font-body text-[15px] text-ink placeholder:text-ink-3 focus:border-ink"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Borrar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-2 transition-colors hover:text-pink-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
            <select
              aria-label="Ordenar por"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-[46px] w-full cursor-pointer appearance-none border border-line bg-paper-2 pl-3 pr-9 font-body text-[15px] text-ink focus:border-ink"
            >
              <option value="popular">Más populares</option>
              <option value="price-asc">Precio: de menor a mayor</option>
              <option value="price-desc">Precio: de mayor a menor</option>
              <option value="rating">Mejor valorados</option>
              <option value="name">Nombre A-Z</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" aria-hidden="true" />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="shop-filters"
            className="flex h-[46px] items-center gap-2 border border-ink px-3.5 font-body text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filtros
            {hasActiveFilters && <span className="font-mono text-xs tabular-nums">({activeCount})</span>}
          </button>

          <div role="group" aria-label="Tipo de vista" className="flex h-[46px] border border-ink">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Vista en cuadrícula"
              aria-pressed={viewMode === 'grid'}
              title="Vista cuadrícula"
              className={`flex w-11 items-center justify-center transition-colors ${
                viewMode === 'grid' ? 'bg-ink text-paper' : 'text-ink hover:bg-tile'
              }`}
            >
              <Grid3X3 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Vista en lista"
              aria-pressed={viewMode === 'list'}
              title="Vista lista"
              className={`flex w-11 items-center justify-center border-l border-ink transition-colors ${
                viewMode === 'list' ? 'bg-ink text-paper' : 'text-ink hover:bg-tile'
              }`}
            >
              <LayoutList className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ FILTROS ACTIVOS ═══ */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line py-4">
          <span className="eyebrow mr-1">Filtros activos</span>
          {selectedCategories.map((cat) => (
            <button key={cat} type="button" onClick={() => toggleCategory(cat)} className={chipClass}>
              {cat}
              <X className="h-3 w-3" aria-label="Quitar filtro" />
            </button>
          ))}
          {selectedRarities.map((rar) => (
            <button key={rar} type="button" onClick={() => toggleRarity(rar)} className={chipClass}>
              <span aria-hidden="true" className="h-1.5 w-1.5" style={{ background: rarityColors[rar] }} />
              {rar}
              <X className="h-3 w-3" aria-label="Quitar filtro" />
            </button>
          ))}
          {priceActive && (
            <button type="button" onClick={() => setPriceRange([0, MAX_PRICE])} className={chipClass}>
              {priceRange[0]}€ – {priceRange[1]}€
              <X className="h-3 w-3" aria-label="Quitar filtro" />
            </button>
          )}
          <button type="button" onClick={clearFilters} className={`${buttonClasses({ variant: 'link', size: 'sm' })} ml-2`}>
            Limpiar todo
          </button>
        </div>
      )}

      {/* ═══ LAYOUT: filtros | resultados ═══ */}
      <div className="grid grid-cols-1 gap-x-10 pt-8 lg:grid-cols-12">
        {/* ─── Filtros (columna en escritorio · panel desplegable en móvil) ─── */}
        <aside
          id="shop-filters"
          aria-label="Filtros del catálogo"
          className={`${showFilters ? 'block' : 'hidden'} mb-10 space-y-8 lg:col-span-3 lg:mb-0 lg:block lg:self-start lg:sticky lg:top-24`}
        >
          <FilterGroup
            title="Categoría"
            aside={<span className="font-mono text-[11px] tabular-nums text-ink-3">{ALL_CATEGORIES.length}</span>}
          >
            {ALL_CATEGORIES.map((cat) => (
              <CheckRow
                key={cat}
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                aside={karambits.filter((k) => k.category === cat).length}
              >
                {cat}
              </CheckRow>
            ))}
          </FilterGroup>

          <FilterGroup title="Rareza">
            {ALL_RARITIES.map((rar) => (
              <CheckRow
                key={rar}
                checked={selectedRarities.includes(rar)}
                onChange={() => toggleRarity(rar)}
                aside={karambits.filter((k) => k.rarity === rar).length}
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5" style={{ background: rarityColors[rar] }} />
                  {rar}
                </span>
              </CheckRow>
            ))}
          </FilterGroup>

          <FilterGroup title="Precio máximo" aside={<Price value={priceRange[1]} size="xs" />}>
            <div className="border-b border-line py-5">
              <input
                aria-label="Precio máximo"
                type="range"
                min={0}
                max={MAX_PRICE}
                step={50}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full cursor-pointer"
              />
              <div className="mt-2 flex justify-between font-mono text-[11px] tabular-nums text-ink-3">
                <span>0 €</span>
                <span>25.000 €</span>
              </div>
            </div>
            <div role="group" aria-label="Rangos de precio" className="flex flex-wrap gap-x-4 gap-y-1 pt-3">
              {PRICE_PRESETS.map((preset) => {
                const active = priceRange[0] === 0 && priceRange[1] === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPriceRange([0, preset.max])}
                    aria-pressed={active}
                    className={`border-b py-1 font-mono text-[11px] font-medium uppercase tracking-[0.06em] transition-colors ${
                      active ? 'border-pink text-ink' : 'border-transparent text-ink-3 hover:text-ink'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </FilterGroup>

          <div>
            <CheckRow checked={showAccessories} onChange={setShowAccessories} className="border-t border-ink">
              Mostrar accesorios
            </CheckRow>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className={`${buttonClasses({ variant: 'link', size: 'sm' })} mt-3 lg:hidden`}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        {/* ─── Resultados ─── */}
        <div className="min-w-0 lg:col-span-9">
          {filteredProducts.length > 0 &&
            (viewMode === 'grid' ? (
              <div className="grid grid-cols-2 border-l border-t border-line xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="border-t border-line">
                {filteredProducts.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </div>
            ))}

          {filteredProducts.length === 0 && (
            <div className="border-y border-line px-4 py-20 text-center">
              <p className="eyebrow">Sin resultados</p>
              <h2 className="display-md mt-4">
                Ningún karambit <span className="serif-accent text-pink-ink">coincide</span>
              </h2>
              <p className="mx-auto mt-3 max-w-sm font-body text-[15px] leading-relaxed text-ink-2">
                Prueba con otra búsqueda o quita algún filtro para ver más modelos.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className={`${buttonClasses({ variant: 'secondary', size: 'md' })} mt-8`}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ 02 — ACCESORIOS ═══ */}
      {showAccessories && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          aria-labelledby="accesorios"
          className="mt-20 sm:mt-28"
        >
          <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">02 — Complementos</p>
              <h2 id="accesorios" className="display-lg mt-4">
                Accesorios <span className="serif-accent text-pink-ink">oficiales</span>
              </h2>
            </div>
            <p className="max-w-xs font-body text-sm leading-relaxed text-ink-2">
              Compatibles con todos los modelos. También puedes añadirlos desde la ficha de cada pieza.
            </p>
          </div>

          <ul>
            {accessories.map((acc, i) => (
              <li
                key={acc.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 border-b border-line py-5 sm:grid-cols-[3rem_1fr_auto_auto] sm:gap-x-8"
              >
                <span className="font-mono text-[11px] tabular-nums text-ink-3">{pad2(i + 1)}</span>
                <div className="min-w-0">
                  <h3 className="font-body text-base font-medium leading-snug tracking-normal text-ink">{acc.name}</h3>
                  <p className="mt-1 max-w-xl font-body text-sm leading-relaxed text-ink-2 sm:line-clamp-2">
                    {acc.description}
                  </p>
                </div>
                <Price value={acc.price} size="md" />
                <button
                  type="button"
                  onClick={() => notifyCartResult(addToCart(buildAccessoryCartItem(acc)))}
                  className={`${buttonClasses({ variant: 'secondary', size: 'sm' })} col-span-3 justify-self-start sm:col-span-1 sm:justify-self-auto`}
                  aria-label={`Añadir al carrito: ${acc.name}`}
                >
                  Añadir
                </button>
              </li>
            ))}
          </ul>
        </motion.section>
      )}
    </main>
  );
};

export default ShopPage;
