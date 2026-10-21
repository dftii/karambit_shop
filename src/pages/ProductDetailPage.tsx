import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Star,
  Heart,
  ShoppingCart,
  Zap,
  Tag,
  RotateCcw,
  ZoomIn,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  ChevronRight,
  Layers,
  Send,
  Sliders,
  Check,
} from 'lucide-react';
import {
  karambits,
  rarityColors,
  type Product,
} from '../data/karambits';
import { useShallow } from 'zustand/react/shallow';
import { useStore, useIsInWishlist } from '../store/useStore';
import { buildKnifeCartItem, notifyCartResult } from '../lib/cart';
import {
  ADDON_PRICES,
  computeConfiguredPrice,
  getConditionPrice,
  getRestrictions,
  normalizeOptions,
} from '../lib/pricing';
import { KarambitVFXImage } from '../components/KarambitVFXImage';
import NotFoundPage from './NotFoundPage';
import { PageMeta } from '../components/PageMeta';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

const DEFAULT_REVIEWS: Record<string, Review[]> = {
  default: [
    {
      id: 'rev-1',
      author: 'Alejandro "S1mple_Fan" M.',
      rating: 5,
      date: 'Hace 3 días',
      comment:
        'La réplica es idéntica al modelo in-game de CS2. El acabado y el brillo tienen una profundidad brutal. El peso de 210 g se siente muy equilibrado para hacer trucos.',
      verified: true,
    },
    {
      id: 'rev-2',
      author: 'Carlos G. (Global Elite)',
      rating: 5,
      date: 'Hace 1 semana',
      comment:
        'El grabado de StatTrak en la hoja quedó perfecto con mis 3 dígitos. La pedí sin filo y la calidad del acero 440C es de 10. Muy recomendada.',
      verified: true,
    },
    {
      id: 'rev-3',
      author: 'Víctor "KennyS" R.',
      rating: 5,
      date: 'Hace 2 semanas',
      comment:
        'La placa NameTag metálica atornillada en el mango le da un toque de coleccionista único. El certificado digital y el número de serie quedaron registrados al instante.',
      verified: true,
    },
  ],
};

function loadReviews(slug: string): Review[] {
  try {
    const stored = localStorage.getItem(`krm-reviews-${slug}`);
    if (stored) return JSON.parse(stored) as Review[];
  } catch {
    // almacenamiento no disponible o JSON corrupto: se usan las reseñas por defecto
  }
  return DEFAULT_REVIEWS.default;
}

/** Ficha de producto. Slug desconocido -> 404 temático. La vista se remonta por slug (estado limpio). */
export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = karambits.find((k) => k.slug === slug);

  if (!product) {
    return (
      <NotFoundPage
        eyebrow="Réplica no encontrada"
        title="Este Karambit no existe"
        description="El enlace no corresponde a ninguna pieza del catálogo. Puede que se haya retirado o que la dirección esté mal escrita."
      />
    );
  }
  return <ProductDetailView key={product.slug} product={product} />;
};

const ProductDetailView: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, setCartOpen } = useStore(
    useShallow((s) => ({
      addToCart: s.addToCart,
      toggleWishlist: s.toggleWishlist,
      setCartOpen: s.setCartOpen,
    }))
  );

  const wishlistedState = useIsInWishlist(product.id);

  // ── Configurator State ─────────────────────────────
  const [conditionChoice, setCondition] = useState<'Factory New' | 'Battle-Scarred'>('Factory New');
  const [bladeChoice, setBladeType] = useState<'Sin Filo (Unsharpened)' | 'Afilada (Sharpened)'>(
    'Sin Filo (Unsharpened)'
  );
  const [hasStatTrak, setHasStatTrak] = useState<boolean>(false);
  const [statTrakNumber, setStatTrakNumber] = useState<string>('007');
  const [hasNameTag, setHasNameTag] = useState<boolean>(false);
  const [nameTagText, setNameTagText] = useState<string>('HEADSHOT');
  const [includeStand, setIncludeStand] = useState<boolean>(false);
  const [kydexChoice, setIncludeKydex] = useState<boolean>(false);

  // ── Visualizer inspection state ────────────────────
  const [inspectMode, setInspectMode] = useState<'full' | 'blade' | 'handle'>('full');
  const [rotation, setRotation] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // ── Tab state ──────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'specs' | 'guarantee' | 'reviews'>('specs');

  // ── Reviews state ──────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>(() => loadReviews(product.slug));
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Aviso "reseña enviada": se oculta solo (temporizador limpiado al desmontar).
  useEffect(() => {
    if (!reviewSubmitted) return;
    const timer = window.setTimeout(() => setReviewSubmitted(false), 4000);
    return () => window.clearTimeout(timer);
  }, [reviewSubmitted]);

  const wishlisted = wishlistedState;
  const rarityColor = rarityColors[product.rarity] || '#ef4444';
  const fullName = product.name.startsWith('Karambit') ? product.name : `Karambit | ${product.name}`;
  const skinOnly = product.name.replace(/^Karambit\s*\|\s*/i, '');

  // ── Dynamic Pricing Calculation ────────────────────
  // Restricciones de piezas 1-of-1 (solo Factory New, sin filo, sin Kydex) aplicadas sobre lo elegido.
  const rules = getRestrictions(product);
  const nameTagActive = hasNameTag && nameTagText.trim().length > 0;
  const config = normalizeOptions(product, {
    condition: conditionChoice,
    bladeType: bladeChoice,
    statTrak: hasStatTrak,
    nameTag: nameTagActive,
    stand: includeStand,
    kydex: kydexChoice,
  });
  const { condition, bladeType, kydex: includeKydex } = config;
  const baseKnifePrice = getConditionPrice(product, condition);
  const finalPrice = computeConfiguredPrice(product, config);
  const battleScarredDiscount = Math.round((1 - product.battleScarredPrice / product.basePrice) * 100);

  // ── Actions ────────────────────────────────────────
  const handleStatTrakInput = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 4);
    setStatTrakNumber(numeric);
  };

  const handleNameTagInput = (val: string) => {
    const uppercase = val.toUpperCase().slice(0, 12);
    setNameTagText(uppercase);
  };

  const addConfiguredToCart = (): boolean => {
    const result = addToCart(
      buildKnifeCartItem(product, {
        ...config,
        statTrakCount: statTrakNumber || '000',
        nameTagText,
      })
    );
    return notifyCartResult(result);
  };

  const handleAddToCart = () => {
    if (addConfiguredToCart()) setCartOpen(true);
  };

  const handleBuyNow = () => {
    if (addConfiguredToCart()) navigate('/checkout');
  };

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      date: 'Justo ahora',
      comment: newReviewComment.trim(),
      verified: true,
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem(`krm-reviews-${product.slug}`, JSON.stringify(updated));
    setNewReviewAuthor('');
    setNewReviewComment('');
    setReviewSubmitted(true);
  };

  // 4 Related Karambits
  const relatedKarambits = karambits
    .filter((k) => k.id !== product.id)
    .sort((a, b) => (a.category === product.category ? -1 : b.category === product.category ? 1 : 0))
    .slice(0, 4);

  const metaDescription =
    product.description.length > 155 ? `${product.description.slice(0, 152).trimEnd()}...` : product.description;

  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-krm-bg text-gray-200 pb-24">
      <PageMeta title={product.name} description={metaDescription} />
      {/* Breadcrumb */}
      <div className="border-b border-[#181d2a] bg-[#0c0e15]">
        <div className="max-w-7xl mx-auto px-6 w-full py-3.5 flex items-center gap-2 text-xs font-body text-gray-400">
          <Link to="/" className="hover:text-amber-400 transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <Link to="/shop" className="hover:text-amber-400 transition-colors">
            Catálogo
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-gray-200 font-medium">{fullName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full pt-8">
        {/* Main Grid: Left Visualizer, Right Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ══════════ LEFT COLUMN: VISUALIZER ══════════ */}
          <div className="lg:col-span-7 flex flex-col gap-4 sticky top-24">
            <div
              className="relative rounded-3xl overflow-hidden border border-[#1f2537] shadow-2xl p-6 sm:p-10 flex flex-col items-center justify-center min-h-[440px] sm:min-h-[520px]"
              style={{
                background:
                  'radial-gradient(circle at 50% 40%, #151a28 0%, #0c0f18 70%, #07080d 100%)',
              }}
            >
              {/* Subtle ambient skin glow */}
              <div
                className="absolute inset-0 opacity-25 pointer-events-none transition-all duration-700"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${product.accentColor}35 0%, transparent 70%)`,
                }}
              />

              {/* Rarity & Condition Badges */}
              <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                <span
                  className="px-3 py-1 rounded-lg text-xs font-black font-display uppercase tracking-wider shadow-md"
                  style={{
                    backgroundColor: `${rarityColor}20`,
                    color: rarityColor,
                    border: `1px solid ${rarityColor}40`,
                  }}
                >
                  ★ {product.rarity}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wide uppercase border ${
                    condition === 'Battle-Scarred'
                      ? 'bg-amber-950/40 text-amber-300 border-amber-700/50'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                  }`}
                >
                  {condition} {condition === 'Battle-Scarred' ? '(Float 0.65)' : '(Float 0.01)'}
                </span>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() =>
                  toggleWishlist({
                    id: product.id,
                    name: product.name,
                    price: product.basePrice,
                    gradient: product.gradient,
                  })
                }
                className="absolute top-5 right-5 z-20 p-3 rounded-2xl bg-[#131722]/80 border border-[#232a3d] hover:border-red-500/50 transition-all backdrop-blur-md"
                aria-label={wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  aria-pressed={wishlisted}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'
                  }`}
                />
              </button>

              {/* ─── LIVE KNIFE STAGE ─── */}
              <div
                className="relative w-full aspect-square max-w-[420px] sm:max-w-[480px] flex items-center justify-center transition-all duration-700"
                style={{
                  transform:
                    inspectMode === 'blade'
                      ? 'scale(1.55) translate(-15%, 15%)'
                      : inspectMode === 'handle'
                      ? 'scale(1.7) translate(25%, -20%)'
                      : 'scale(1)',
                }}
              >
                {/* Condition Visual Filter: Battle-Scarred slight vintage patina */}
                <div
                  className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${
                    condition === 'Battle-Scarred' ? 'contrast-125 saturate-75 brightness-90' : ''
                  }`}
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
                    transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  {/* Karambit VFX Image with High-Jewelry Contours and Live Sparkles */}
                  <KarambitVFXImage
                    image={product.image}
                    name={product.name}
                    slug={product.slug}
                    rarity={product.rarity}
                    category={product.category}
                    accentColor={product.accentColor}
                    visualFilter={product.visualFilter}
                    condition={condition}
                    interactiveHover={false}
                    animateLevitate={false}
                    showSparkles={product.rarity === 'Mythic Bespoke'}
                    showShimmer={product.rarity === 'Mythic Bespoke'}
                  />

                  {/* ── LIVE STATTRAK™ ENGRAVED DISPLAY ON BLADE ── */}
                  {hasStatTrak && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute z-30 pointer-events-none select-none flex items-center gap-1 px-2 py-0.5 rounded shadow-lg"
                      style={{
                        top: '55%',
                        left: '42%',
                        transform: 'translate(-50%, -50%) rotate(-35deg)',
                        background: 'linear-gradient(180deg, #18191d 0%, #0d0e12 100%)',
                        border: '1px solid #d97706',
                        boxShadow: '0 0 12px rgba(245, 158, 11, 0.45)',
                      }}
                    >
                      <span className="text-[9px] font-black tracking-tighter text-amber-500 font-mono">
                        ST™
                      </span>
                      <span
                        className="text-xs font-black tracking-widest font-mono text-krm-accent"
                        style={{
                          textShadow: '0 0 8px #f59e0b, 0 0 16px rgba(245, 158, 11, 0.6)',
                        }}
                      >
                        {String(statTrakNumber || '000').padStart(3, '0')}
                      </span>
                    </motion.div>
                  )}

                  {/* ── LIVE NAMETAG METALLIC PLATE ON HANDLE ── */}
                  {hasNameTag && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute z-30 pointer-events-none select-none px-2.5 py-0.5 rounded-sm flex items-center justify-between gap-1.5 shadow-2xl"
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
                      {/* Left Rivet */}
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-inner block" />
                      {/* Engraved Text */}
                      <span
                        className="text-[10px] font-black tracking-wider text-zinc-900 font-mono uppercase px-1"
                        style={{
                          textShadow: '0 1px 0 rgba(255,255,255,0.6)',
                        }}
                      >
                        "{nameTagText || 'NAMETAG'}"
                      </span>
                      {/* Right Rivet */}
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-inner block" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* ── Inspection Mode Controls ── */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 bg-[#0d1019]/90 backdrop-blur-md p-2 rounded-2xl border border-[#1e2538]">
                {/* View Zoom Options */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setInspectMode('full')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all flex items-center gap-1.5 ${
                      inspectMode === 'full'
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-[#181d2c]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    General
                  </button>

                  <button
                    onClick={() => setInspectMode('blade')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all flex items-center gap-1.5 ${
                      inspectMode === 'blade'
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-[#181d2c]'
                    }`}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    Hoja {hasStatTrak && '(StatTrak)'}
                  </button>

                  <button
                    onClick={() => setInspectMode('handle')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all flex items-center gap-1.5 ${
                      inspectMode === 'handle'
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-[#181d2c]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Mango {hasNameTag && '(NameTag)'}
                  </button>
                </div>

                {/* Rotation & Flip Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRotation((prev) => (prev - 45) % 360)}
                    aria-label="Rotar a la izquierda"
                    className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a2030] transition-colors"
                    title="Rotar a la izquierda"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRotation(0)}
                    className="px-2 py-1 text-[11px] font-mono text-gray-400 hover:text-white rounded-lg hover:bg-[#1a2030]"
                    title="Restablecer ángulo"
                  >
                    {rotation}°
                  </button>
                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="px-2.5 py-1 text-xs font-display font-bold text-gray-300 hover:text-white rounded-xl hover:bg-[#1a2030] transition-colors uppercase"
                  >
                    Voltear
                  </button>
                </div>
              </div>
            </div>

            {/* Quality Badges Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-[#121520] border border-[#1e2436] flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold font-display text-white uppercase">
                    Acero 440C
                  </p>
                  <p className="text-[10px] text-gray-400 font-body">Forja artesanal</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#121520] border border-[#1e2436] flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold font-display text-white uppercase">
                    Escala 1:1 CS2
                  </p>
                  <p className="text-[10px] text-gray-400 font-body">145g equilibrado</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#121520] border border-[#1e2436] flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold font-display text-white uppercase">
                    Garantía Total
                  </p>
                  <p className="text-[10px] text-gray-400 font-body">Acabado UV permanente</p>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════ RIGHT COLUMN: CONFIGURATOR ══════════ */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-display uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold font-mono">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-gray-500 font-normal">({reviews.length} valoraciones)</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight uppercase">
                Karambit | <span className="text-amber-400">{skinOnly}</span>
              </h1>

              <p className="text-gray-400 text-sm font-body mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* ─── OPTION 1: CONDITION / FLOAT ─── */}
            <div className="p-4 rounded-2xl bg-[#121522] border border-krm-border-soft space-y-3">
              <label className="text-xs font-black font-display uppercase tracking-wider text-gray-300 flex items-center justify-between">
                <span>1. Estado del Acabado (Float)</span>
                <span className="text-[11px] text-amber-400 font-mono">
                  {condition === 'Battle-Scarred' ? `-${battleScarredDiscount}% DESCUENTO` : 'Float 0.01 Premium'}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCondition('Factory New')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    condition === 'Factory New'
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                      : 'bg-krm-card-hi border-[#22293d] text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold font-display uppercase text-white">
                      Factory New
                    </p>
                    {condition === 'Factory New' && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-body mt-0.5">
                    Recién Fabricado · Impecable
                  </p>
                  <p className="text-xs font-mono font-bold text-amber-400 mt-1">
                    {product.basePrice.toFixed(2)}€
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCondition('Battle-Scarred')}
                  disabled={!rules.conditions.includes('Battle-Scarred')}
                  className={`p-3 rounded-xl border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    condition === 'Battle-Scarred'
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                      : 'bg-krm-card-hi border-[#22293d] text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold font-display uppercase text-white">
                      Battle-Scarred
                    </p>
                    {condition === 'Battle-Scarred' && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-body mt-0.5">
                    Defectos leves cosméticos
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {product.battleScarredPrice.toFixed(2)}€
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 line-through">
                      {product.basePrice.toFixed(2)}€
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* ─── OPTION 2: BLADE TYPE ─── */}
            <div className="p-4 rounded-2xl bg-[#121522] border border-krm-border-soft space-y-3">
              <label className="text-xs font-black font-display uppercase tracking-wider text-gray-300 flex items-center justify-between">
                <span>2. Tipo de Hoja</span>
                <span className="text-[11px] text-emerald-400 font-body">
                  {bladeType.includes('Sin Filo') ? 'Apta para spinning' : 'Corte real 100%'}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setBladeType('Sin Filo (Unsharpened)')}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    bladeType.includes('Sin Filo')
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                      : 'bg-krm-card-hi border-[#22293d] text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[9px] font-bold font-display bg-emerald-500 text-black uppercase">
                    Recomendado
                  </span>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold font-display uppercase text-white">
                      Sin Filo
                    </p>
                    {bladeType.includes('Sin Filo') && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-body mt-0.5">
                    Unsharpened · Segura para trucos y exposición
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBladeType('Afilada (Sharpened)')}
                  disabled={!rules.allowSharpened}
                  className={`p-3 rounded-xl border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    bladeType.includes('Afilada')
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                      : 'bg-krm-card-hi border-[#22293d] text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold font-display uppercase text-white flex items-center gap-1">
                      Afilada
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    </p>
                    {bladeType.includes('Afilada') && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-body mt-0.5">
                    Sharpened · Hoja real cortante
                  </p>
                </button>
              </div>
            </div>

            {/* ─── OPTION 3: STATTRAK™ & NAMETAG PERSONALIZATION ─── */}
            <div className="p-4 rounded-2xl bg-[#121522] border border-krm-border-soft space-y-4">
              <label className="text-xs font-black font-display uppercase tracking-wider text-gray-300">
                3. Grabados y Personalizaciones
              </label>

              {/* StatTrak Customization Toggle */}
              <div className="rounded-xl p-3 bg-krm-card-hi border border-krm-border-strong space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="stattrak-check"
                      checked={hasStatTrak}
                      onChange={(e) => setHasStatTrak(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    />
                    <label
                      htmlFor="stattrak-check"
                      className="text-sm font-bold font-display uppercase text-white cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="w-4 h-4 text-amber-400" />
                      Personalización StatTrak™
                    </label>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">+{ADDON_PRICES.statTrak.toFixed(2)}€</span>
                </div>

                {hasStatTrak && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 border-t border-krm-border-strong space-y-1.5"
                  >
                    <label className="text-[11px] text-gray-400 font-body flex justify-between">
                      <span>Número de bajas grabado en la hoja (hasta 4 dígitos):</span>
                      <span className="text-amber-400 font-mono font-bold">
                        Previsualización: #{String(statTrakNumber || '000').padStart(3, '0')}
                      </span>
                    </label>
                    <input aria-label="Número StatTrak"
                      type="text"
                      maxLength={4}
                      value={statTrakNumber}
                      onChange={(e) => handleStatTrakInput(e.target.value)}
                      placeholder="Ej: 007, 420, 1337"
                      className="w-full bg-[#0d101a] border border-[#2b3550] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-amber-400 font-mono font-bold tracking-widest outline-none transition-colors"
                    />
                    <p className="text-[10px] text-gray-500 font-body">
                      Grabado artesanal de alta precisión con técnica Dremel y relleno fotoluminiscente.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* NameTag Customization Toggle */}
              <div className="rounded-xl p-3 bg-krm-card-hi border border-krm-border-strong space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="nametag-check"
                      checked={hasNameTag}
                      onChange={(e) => setHasNameTag(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    />
                    <label
                      htmlFor="nametag-check"
                      className="text-sm font-bold font-display uppercase text-white cursor-pointer flex items-center gap-1.5"
                    >
                      <Tag className="w-4 h-4 text-gray-300" />
                      Personalización NameTag
                    </label>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">+{ADDON_PRICES.nameTag.toFixed(2)}€</span>
                </div>

                {hasNameTag && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 border-t border-krm-border-strong space-y-1.5"
                  >
                    <label className="text-[11px] text-gray-400 font-body flex justify-between">
                      <span>Texto grabado en la placa metálica (máx 12 letras):</span>
                      <span className="text-gray-300 font-mono font-bold">
                        "{nameTagText || 'TU_ALIAS'}"
                      </span>
                    </label>
                    <input aria-label="Texto de la placa NameTag"
                      type="text"
                      maxLength={12}
                      value={nameTagText}
                      onChange={(e) => handleNameTagInput(e.target.value)}
                      placeholder="Ej: HEADSHOT, ACE, CLUTCH"
                      className="w-full bg-[#0d101a] border border-[#2b3550] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold tracking-wider outline-none uppercase transition-colors"
                    />
                    <p className="text-[10px] text-gray-500 font-body">
                      Placa de acero cepillado remachada y atornillada al mango en posición visible.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* ─── OPTION 4: CROSS-SELL ACCESSORIES ─── */}
            <div className="p-4 rounded-2xl bg-[#121522] border border-krm-border-soft space-y-3">
              <label className="text-xs font-black font-display uppercase tracking-wider text-gray-300">
                4. Accesorios Oficiales Cross-Sell
              </label>

              <div className="space-y-2.5">
                {/* Stand Cross-Sell */}
                <div
                  onClick={() => setIncludeStand(!includeStand)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    includeStand
                      ? 'bg-blue-950/20 border-blue-500 text-white'
                      : 'bg-krm-card-hi border-[#22293d] text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input aria-label="Soporte de exhibición acrílico"
                      type="checkbox"
                      checked={includeStand}
                      onChange={() => {}}
                      className="w-4 h-4 rounded accent-blue-500 cursor-pointer pointer-events-none"
                    />
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold font-display uppercase text-white">
                        Soporte de Exhibición Acrílico
                      </p>
                      <p className="text-[10px] text-gray-400 font-body">
                        Cristal de 8mm con grabado láser KRM.GG
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">+{ADDON_PRICES.stand.toFixed(2)}€</span>
                </div>

                {/* Kydex Sheath Cross-Sell */}
                <div
                  onClick={() => rules.allowKydex && setIncludeKydex(!includeKydex)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    rules.allowKydex ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
                  } ${
                    includeKydex
                      ? 'bg-purple-950/20 border-purple-500 text-white'
                      : 'bg-krm-card-hi border-[#22293d] text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input aria-label="Funda protectora Kydex"
                      type="checkbox"
                      checked={includeKydex}
                      onChange={() => {}}
                      className="w-4 h-4 rounded accent-purple-500 cursor-pointer pointer-events-none"
                    />
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold font-display uppercase text-white">
                        Funda Protectora Kydex Táctica
                      </p>
                      <p className="text-[10px] text-gray-400 font-body">
                        Clip de sujeción para cinturón y bloqueo seguro
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">+{ADDON_PRICES.kydex.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            {/* ─── PRICE BREAKDOWN & CTAS ─── */}
            <div className="p-5 rounded-3xl bg-[#0f121d] border border-[#232c44] shadow-2xl space-y-4">
              <div className="space-y-1.5 text-xs font-body text-gray-400">
                <div className="flex justify-between">
                  <span>
                    Karambit ({condition})
                  </span>
                  <span className="text-white font-mono">{baseKnifePrice.toFixed(2)}€</span>
                </div>
                {hasStatTrak && (
                  <div className="flex justify-between text-amber-400">
                    <span>StatTrak™ (#{String(statTrakNumber || '000').padStart(3, '0')})</span>
                    <span className="font-mono">+{ADDON_PRICES.statTrak.toFixed(2)}€</span>
                  </div>
                )}
                {nameTagActive && (
                  <div className="flex justify-between text-zinc-300">
                    <span>NameTag ("{nameTagText}")</span>
                    <span className="font-mono">+{ADDON_PRICES.nameTag.toFixed(2)}€</span>
                  </div>
                )}
                {includeStand && (
                  <div className="flex justify-between text-blue-400">
                    <span>Soporte Acrílico</span>
                    <span className="font-mono">+{ADDON_PRICES.stand.toFixed(2)}€</span>
                  </div>
                )}
                {includeKydex && (
                  <div className="flex justify-between text-purple-400">
                    <span>Funda Kydex</span>
                    <span className="font-mono">+{ADDON_PRICES.kydex.toFixed(2)}€</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-3 border-t border-[#1e2538]">
                  <div>
                    <p className="text-base font-black font-display uppercase text-white tracking-wider">
                      Precio Configurado
                    </p>
                    <p className="text-[10px] text-emerald-400 font-body">
                      ✓ Listo para forjar en el arsenal
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black font-display text-amber-400">
                      {finalPrice.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3.5 px-4 rounded-xl font-black font-display uppercase tracking-wider text-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Añadir al Arsenal
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3.5 px-4 rounded-xl font-black font-display uppercase tracking-wider text-white text-sm bg-[#1c2234] hover:bg-[#252e46] border border-[#2e3957] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  Comprar Ahora
                </button>
              </div>

              <p className="text-center text-[11px] text-gray-500 font-body">
                🔒 Compra digital simulada · Certificado digital único de autenticidad incluido
              </p>
            </div>
          </div>
        </div>

        {/* ══════════ TABS SECTION: SPECS, GUARANTEE, REVIEWS ══════════ */}
        <div className="mt-16 pt-12 border-t border-[#1c2233]">
          {/* Tab Navigation */}
          <div className="flex items-center gap-3 border-b border-krm-border-soft pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-5 py-2.5 rounded-xl font-bold font-display uppercase tracking-wider text-sm transition-all flex items-center gap-2 ${
                activeTab === 'specs'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-krm-card-hi'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Especificaciones Técnicas
            </button>

            <button
              onClick={() => setActiveTab('guarantee')}
              className={`px-5 py-2.5 rounded-xl font-bold font-display uppercase tracking-wider text-sm transition-all flex items-center gap-2 ${
                activeTab === 'guarantee'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-krm-card-hi'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Garantía y Calidad
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-5 py-2.5 rounded-xl font-bold font-display uppercase tracking-wider text-sm transition-all flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-krm-card-hi'
              }`}
            >
              <Star className="w-4 h-4" />
              Reseñas ({reviews.length})
            </button>
          </div>

          {/* Tab 1: Specs */}
          {activeTab === 'specs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div className="p-5 rounded-2xl bg-[#121522] border border-krm-border-soft">
                <h4 className="text-amber-400 font-bold font-display uppercase text-base mb-3">
                  Dimensiones Exactas
                </h4>
                <ul className="space-y-2 text-sm text-gray-300 font-body">
                  <li className="flex justify-between border-b border-[#1c2235] pb-1.5">
                    <span className="text-gray-500">Longitud Total:</span>
                    <span className="font-mono font-bold">19 cm</span>
                  </li>
                  <li className="flex justify-between border-b border-[#1c2235] pb-1.5">
                    <span className="text-gray-500">Longitud de Hoja:</span>
                    <span className="font-mono font-bold">9 cm</span>
                  </li>
                  <li className="flex justify-between border-b border-[#1c2235] pb-1.5">
                    <span className="text-gray-500">Grosor de Hoja:</span>
                    <span className="font-mono font-bold">4.0 mm</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Diámetro de Anillo:</span>
                    <span className="font-mono font-bold">2.5 cm (Ergonómico)</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-[#121522] border border-krm-border-soft">
                <h4 className="text-amber-400 font-bold font-display uppercase text-base mb-3">
                  Materiales y Peso
                </h4>
                <ul className="space-y-2 text-sm text-gray-300 font-body">
                  <li className="flex justify-between border-b border-[#1c2235] pb-1.5">
                    <span className="text-gray-500">Peso Total:</span>
                    <span className="font-mono font-bold text-amber-400">145 g (Equilibrado)</span>
                  </li>
                  <li className="flex justify-between border-b border-[#1c2235] pb-1.5">
                    <span className="text-gray-500">Acero de la Hoja:</span>
                    <span className="font-bold">Acero Inox 440C</span>
                  </li>
                  <li className="flex justify-between border-b border-[#1c2235] pb-1.5">
                    <span className="text-gray-500">Dureza Rockwell:</span>
                    <span className="font-mono font-bold">58 - 60 HRC</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Material de Mango:</span>
                    <span className="font-bold">Polímero ABS Texturizado</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-[#121522] border border-krm-border-soft">
                <h4 className="text-amber-400 font-bold font-display uppercase text-base mb-3">
                  Tecnología de Acabado
                </h4>
                <ul className="space-y-2 text-sm text-gray-300 font-body">
                  <li className="flex justify-between border-b border-[#1c2235] pb-1.5">
                    <span className="text-gray-500">Tratamiento:</span>
                    <span>Curado Térmico al Vacío</span>
                  </li>
                  <li className="flex justify-between border-b border-[#1c2235] pb-1.5">
                    <span className="text-gray-500">Protección:</span>
                    <span className="text-emerald-400 font-bold">Anti-Rayones UV</span>
                  </li>
                  <li className="flex justify-between border-b border-[#1c2235] pb-1.5">
                    <span className="text-gray-500">Escala de Modelo:</span>
                    <span className="font-mono font-bold">1:1 Réplica CS2</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Inspección In-Game:</span>
                    <span className="text-amber-400 font-bold">Fiel al Original</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Guarantee */}
          {activeTab === 'guarantee' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="p-6 rounded-2xl bg-[#121522] border border-krm-border-soft space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold font-display uppercase text-white">
                  Garantía de Por Vida en Acero 440C
                </h4>
                <p className="text-sm text-gray-400 font-body leading-relaxed">
                  Cada pieza forjada en KRM.GG cuenta con garantía ilimitada contra fracturas, holguras mecánicas o defectos estructurales. Si tu réplica sufre algún defecto de aleación, la reemplazamos de inmediato.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#121522] border border-krm-border-soft space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold font-display uppercase text-white">
                  Certificado Criptográfico de Autenticidad
                </h4>
                <p className="text-sm text-gray-400 font-body leading-relaxed">
                  Tu Karambit incluye un identificador digital único emitido al realizar tu pedido digital. Podrás verificar su autenticidad y número de forja en nuestro laboratorio de StatTrak.
                </p>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Reviews with Form */}
          {activeTab === 'reviews' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Reviews List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1e2538]">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black font-display text-amber-400">
                      4.9
                    </span>
                    <div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 font-body">
                        Basado en {reviews.length} opiniones verificadas
                      </p>
                    </div>
                  </div>
                </div>

                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#121522] border border-[#1e2436] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-display text-white">
                          {rev.author}
                        </span>
                        {rev.verified && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 font-display font-bold uppercase flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Comprador Verificado
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-body">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-gray-300 font-body leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>

              {/* Form to submit review */}
              <div className="lg:col-span-5">
                <div className="p-6 rounded-2xl bg-[#121522] border border-krm-border-soft space-y-4">
                  <h4 className="text-lg font-bold font-display uppercase text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-amber-400" />
                    Publicar tu Reseña
                  </h4>

                  <form onSubmit={handlePostReview} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-display uppercase font-bold text-gray-400 mb-1">
                        Tu Nombre / Nickname de CS2
                      </label>
                      <input aria-label="Nombre del autor de la reseña"
                        type="text"
                        required
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        placeholder="Ej: NiKo, ZywOo, Karrigan"
                        className="w-full bg-krm-card-hi border border-[#232b3f] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white outline-none font-body"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-display uppercase font-bold text-gray-400 mb-1">
                        Valoración
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= newReviewRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-mono text-amber-400 ml-2">
                          {newReviewRating} de 5 estrellas
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-display uppercase font-bold text-gray-400 mb-1">
                        Tu Experiencia con el Karambit
                      </label>
                      <textarea aria-label="Comentario de la reseña"
                        required
                        rows={3}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Cuéntanos sobre el acabado, el peso, el filo o los grabados..."
                        className="w-full bg-krm-card-hi border border-[#232b3f] focus:border-amber-500 rounded-xl p-3 text-sm text-white outline-none font-body resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl font-bold font-display uppercase tracking-wider text-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all shadow-md shadow-amber-500/20"
                    >
                      Enviar Reseña Simulada
                    </button>

                    {reviewSubmitted && (
                      <p className="text-xs text-emerald-400 font-body flex items-center gap-1.5 justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                        ¡Tu reseña ha sido publicada y añadida a la ficha!
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ══════════ RELATED KARAMBITS ══════════ */}
        <div className="mt-16 pt-12 border-t border-[#1c2233]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold font-display uppercase tracking-widest text-amber-500">
                Catálogo Exclusivo
              </p>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-tight">
                Otros Coleccionistas También Miraron
              </h3>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold font-display uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              Ver Todo el Arsenal <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedKarambits.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.slug}`}
                className="group rounded-2xl p-4 bg-krm-panel border border-krm-border hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                <div className="aspect-square relative flex items-center justify-center p-4 overflow-hidden rounded-xl bg-[#090b10]">
                  <KarambitVFXImage
                    image={item.image}
                    name={item.name}
                    slug={item.slug}
                    rarity={item.rarity}
                    category={item.category}
                    accentColor={item.accentColor}
                    visualFilter={item.visualFilter}
                    interactiveHover={true}
                  />
                  <span
                    className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black font-display uppercase"
                    style={{
                      backgroundColor: `${rarityColors[item.rarity]}20`,
                      color: rarityColors[item.rarity],
                    }}
                  >
                    ★ {item.rarity}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-white font-bold font-display text-base group-hover:text-amber-400 transition-colors truncate">
                    Karambit | {item.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400 font-body">{item.category}</span>
                    <span className="text-amber-400 font-mono font-bold text-sm">
                      {item.basePrice.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};
export default ProductDetailPage;
