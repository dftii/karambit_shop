import { hideBrokenImage } from '../lib/imageFallback';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  Shield,
  Award,
  Zap,
  ArrowRight,
  ChevronDown,
  Heart,
  ShoppingCart,
  Sparkles,
  Gift,
} from 'lucide-react';
import {
  karambits,
  getFounderBespoke,
  rarityColors,
  type Product,
  type Category,
} from '../data/karambits';
import { useShallow } from 'zustand/react/shallow';
import { useStore, useIsInWishlist } from '../store/useStore';
import { buildKnifeCartItem, notifyCartResult } from '../lib/cart';
import { KarambitVFXImage } from '../components/KarambitVFXImage';
import { QuickViewButton } from '../components/QuickViewButton';
import { PageMeta } from '../components/PageMeta';

// Nombre corto de una pieza Founder para chips (sin estrella, sin firma de colección).
const founderShortName = (name: string) =>
  name.replace(/^★ Karambit \| /, '').split(' — ')[0].replace(/ \(.*\)$/, '');

// ─── Product Card ──────────────────────────────────────
const renderHomeBadges = (product: Product) => {
  const isMythic = product.rarity === 'Mythic Bespoke';
  const isExclusive = product.isExclusive || product.slug === 'celestial-pink-diamond';
  const badges: React.ReactNode[] = [];

  if (isExclusive) {
    badges.push(
      <span
        key="exclusive"
        className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider font-display flex items-center gap-1 text-white bg-gradient-to-r from-rose-500 via-amber-500 to-sky-500 border border-amber-300 animate-exclusive-badge shadow-lg"
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
        className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-amber-500/25 to-sky-500/25 text-amber-300 border border-amber-400/60 font-display uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
      >
        👑 DuFiTuFi CEO 1:1
      </span>
    );
  }

  if (product.isLimitedEdition && badges.length < 2) {
    badges.push(
      <span
        key="limited"
        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 font-display uppercase tracking-wider"
      >
        Edición Limitada
      </span>
    );
  }

  if (product.isNew && badges.length < 2) {
    badges.push(
      <span
        key="new"
        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-display uppercase tracking-wider"
      >
        Nuevo
      </span>
    );
  }

  return badges;
};

const ProductCard: React.FC<{ product: Product; index: number }> = ({ product, index }) => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, setCartOpen } = useStore(
    useShallow((s) => ({
      addToCart: s.addToCart,
      toggleWishlist: s.toggleWishlist,
      setCartOpen: s.setCartOpen,
    }))
  );
  const wishlisted = useIsInWishlist(product.id);
  const isMythic = product.rarity === 'Mythic Bespoke';

  return (
    <motion.div
      onClick={() => navigate(`/product/${product.slug}`)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-500 ${
        isMythic
          ? 'border border-sky-400/50 hover:border-amber-300 shadow-[0_0_30px_-5px_rgba(56,189,248,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.35)]'
          : 'border border-krm-border hover:border-gray-700'
      }`}
      style={{
        background: isMythic
          ? 'linear-gradient(180deg, #131726 0%, #0a0d16 100%)'
          : '#12141d',
      }}
    >
      {/* Badges Container - Compact horizontal wrap with max 2 badges */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-row flex-wrap gap-1.5 max-w-[80%] pointer-events-none">
        {renderHomeBadges(product)}
      </div>

      {/* Wishlist */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleWishlist({
            id: product.id,
            name: product.name,
            price: product.basePrice,
            gradient: product.gradient,
          });
        }}
        className="absolute top-3.5 right-3.5 z-20 p-2 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/75 transition-all"
        aria-label={wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        aria-pressed={wishlisted}
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
        />
      </button>

      {/* VFX Karambit Image Display - Clear of Badges */}
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
        <QuickViewButton product={product} />
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        {/* Rarity bar */}
        <div className="flex items-center gap-2">
          <div
            className="h-0.5 flex-1 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${rarityColors[product.rarity]}, transparent)`,
            }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-wider font-display"
            style={{ color: rarityColors[product.rarity] }}
          >
            {product.rarity}
          </span>
        </div>

        <h3 className="text-white font-bold font-display text-lg leading-tight group-hover:text-krm-accent transition-colors line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-body">({product.reviewsCount})</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xl font-bold text-krm-accent font-display">
              {product.basePrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
            </span>
            <span className="ml-2 text-sm text-gray-500 line-through font-body">
              {(product.originalPrice ?? product.basePrice * 1.4).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (notifyCartResult(addToCart(buildKnifeCartItem(product)))) {
                setCartOpen(true);
              }
            }}
            className="p-2.5 rounded-xl transition-all duration-300 hover:scale-105"
            aria-label="Añadir al carrito"
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
};

// ─── Review Card ───────────────────────────────────────
const ReviewCard: React.FC<{
  name: string;
  rating: number;
  text: string;
  product: string;
  badge: string;
  index: number;
}> = ({ name, rating, text, product, badge, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="p-5 rounded-2xl flex flex-col justify-between"
    style={{ background: '#12141d', border: '1px solid #1f2433' }}
  >
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-bold font-display text-lg">
          {name[0]}
        </div>
        <div>
          <p className="text-white font-semibold text-sm font-display">{name}</p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
              />
            ))}
          </div>
        </div>
        <span className="ml-auto px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/20 text-emerald-400 font-bold font-display uppercase">
          {badge}
        </span>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed font-body">{text}</p>
    </div>
    <p className="mt-3 text-xs text-gray-600 font-body">Compró: {product}</p>
  </motion.div>
);

// ─── FAQ Item ──────────────────────────────────────────
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#12141d', border: '1px solid #1f2433' }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="text-white font-semibold font-display text-lg">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-krm-accent transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="px-4 pb-4 text-gray-400 text-sm leading-relaxed font-body">{answer}</p>
      </motion.div>
    </div>
  );
};

// ─── HOME PAGE ─────────────────────────────────────────
const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState<Category | 'all'>('all');
  const featuredProduct = karambits.find((k) => k.slug === 'lore') || karambits[0];

  const filteredProducts =
    activeCategory === 'all'
      ? karambits.slice(0, 8)
      : karambits.filter((k) => k.category === activeCategory).slice(0, 8);

  const categories: (Category | 'all')[] = [
    'all',
    'Founder Bespoke (Joyería 1:1)',
    'Doppler Series',
    'Iconic Skins',
    'Tactical & Forged CS2',
    'Military Spec-Ops CS2',
    'Esports Edition',
  ];
  const founderKnives = getFounderBespoke();
  const flagshipKnife = founderKnives.reduce((top, k) => (k.basePrice > top.basePrice ? k : top), founderKnives[0]);

  return (
    <main id="main" tabIndex={-1} className="min-h-screen w-full" style={{ background: '#090a0f' }}>
      <PageMeta title="Inicio" description="Tienda de réplicas artesanales de karambit inspirados en CS2. Escala 1:1, acero 440C y personalización StatTrak™ y NameTag." />
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.04]"
            style={{
              background: `radial-gradient(circle, ${featuredProduct.accentColor}, transparent 70%)`,
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05]"
            style={{
              background: `radial-gradient(circle, #f59e0b, transparent 70%)`,
            }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 w-full py-32 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Top badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
            >
              <Sparkles className="w-4 h-4 text-krm-accent" />
              <span className="text-krm-accent text-sm font-semibold font-display uppercase tracking-wider">
                Réplicas Premium CS2
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] font-display uppercase">
              Karambits
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #f59e0b, #d97706, #f59e0b)' }}
              >
                de Leyenda
              </span>
              <br />
              <span className="text-3xl sm:text-4xl text-gray-500">en tus manos.</span>
            </h1>

            <p className="text-gray-400 text-lg max-w-lg font-body leading-relaxed">
              Réplicas artesanales 1:1 en acero inoxidable 440C de las skins más icónicas de CS2.
              Grabado StatTrak™ personalizado y NameTag única en cada pieza.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Shield className="w-4 h-4" />, text: 'Escala 1:1 Real' },
                { icon: <Award className="w-4 h-4" />, text: 'Acero 440C' },
                { icon: <Sparkles className="w-4 h-4" />, text: 'StatTrak™ & NameTag' },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-display"
                  style={{ background: '#12141d', border: '1px solid #1f2433', color: '#9ca3af' }}
                >
                  <span className="text-krm-accent">{badge.icon}</span>
                  {badge.text}
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-black uppercase tracking-wider transition-all duration-300 hover:scale-105 font-display text-lg"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)',
                }}
              >
                Ver Catálogo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/mystery-boxes"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 font-display text-lg text-white"
                style={{ background: '#12141d', border: '1px solid #1f2433' }}
              >
                Mystery Box
                <Gift className="w-5 h-5 text-[#a855f7]" />
              </Link>
            </div>
          </motion.div>

          {/* Right - High Quality Karambits Fusion Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[520px] aspect-square flex items-center justify-center">
              {/* Dynamic multicolor ambient aura glow */}
              <div
                className="absolute inset-0 rounded-3xl blur-3xl opacity-40 animate-pulse pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 70% 30%, #10b981 0%, transparent 50%), radial-gradient(circle at 50% 50%, #f59e0b 0%, transparent 60%), radial-gradient(circle at 80% 70%, #ef4444 0%, transparent 50%), radial-gradient(circle at 20% 70%, #a855f7 0%, transparent 50%)',
                }}
              />

              {/* Fusion Image Card */}
              <Link
                to="/shop"
                className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-amber-500/40 p-1 bg-[#0c0e17] shadow-2xl group cursor-pointer block transition-all duration-500 hover:border-amber-400 hover:shadow-amber-500/20"
                style={{
                  boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.9), 0 0 40px rgba(245, 158, 11, 0.2)',
                }}
              >
                <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-black/80">
                  <img fetchPriority="high" decoding="async" onError={hideBrokenImage}
                    src="/hero_karambits_fusion.jpg"
                    alt="Fusión de Karambits CS2 de Leyenda"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient vignettes */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Top-Right Badge */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="absolute top-4 right-4 px-3.5 py-1.5 rounded-xl text-xs font-black font-display uppercase tracking-wider bg-black/70 backdrop-blur-md border border-amber-400/40 text-amber-400 flex items-center gap-1.5 shadow-lg"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    COLECCIÓN DE ÉLITE CS2
                  </motion.div>

                  {/* Bottom-Left Information Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 uppercase block w-fit">
                        5 ACABADOS SUPREMOS
                      </span>
                      <p className="text-sm font-black font-display text-white uppercase tracking-wide drop-shadow">
                        Doppler · Emerald · Lore · Ruby · Fade
                      </p>
                    </div>

                    <span className="text-xs font-bold font-display uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 rounded-xl flex items-center gap-1 group-hover:scale-105 transition-transform shadow-md">
                      Explorar
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="border-y border-krm-border bg-[#0c0d14]">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '10.000+', label: 'Karambits Coleccionados', icon: '⚔️' },
            { value: '4.8/5', label: 'Valoración Media', icon: '⭐' },
            { value: '100%', label: 'Escala 1:1 CS2', icon: '🎯' },
            { value: '1 de 1', label: 'Piezas Founder Certificadas', icon: '💎' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center space-y-1"
            >
              <span className="text-2xl mb-1 block">{stat.icon}</span>
              <p className="text-3xl sm:text-4xl font-black text-white font-display">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 font-body uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ THE FOUNDER'S VAULT — TEASER ═══ */}
      <section className="relative isolate overflow-hidden border-y border-amber-300/10 bg-[#06070b]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(60% 70% at 78% 45%, rgba(244,114,182,0.14), transparent 70%), radial-gradient(50% 60% at 15% 20%, rgba(245,158,11,0.12), transparent 70%), radial-gradient(40% 50% at 95% 100%, rgba(56,189,248,0.10), transparent 70%)',
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="animate-vault-sweep absolute inset-y-0 left-0 w-1/4"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(253,224,71,0.06) 30%, rgba(255,255,255,0.12) 50%, rgba(253,224,71,0.06) 70%, transparent)',
            }}
          />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="min-w-0"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/10 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span className="font-tech text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200 sm:text-xs">
                1-of-1 · Alta joyería
              </span>
            </div>
            <h2 className="mt-5 font-display text-5xl font-black uppercase leading-[0.92] tracking-tight text-white sm:text-6xl">
              The Founder&apos;s
              <br />
              <span className="text-vault-gold">Vault</span>
            </h2>
            <p className="mt-3 font-display text-lg font-bold uppercase tracking-[0.12em] text-gray-300 sm:text-xl">
              DuFiTuFi Design <span className="text-amber-300">(CEO)</span>
            </p>
            <p className="mt-4 max-w-lg font-body text-base leading-relaxed text-gray-400">
              {founderKnives.length} karambits de platino, oro y gemas auténticas. Diseñados y firmados por el
              fundador, existen una sola vez y llevan su certificado de autenticidad digital.
            </p>

            <ul className="mt-6 grid max-w-lg grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
              {founderKnives.map((jewel) => (
                <li key={jewel.id}>
                  <Link
                    to="/founders-vault"
                    className="group flex min-w-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-2 transition-colors hover:border-amber-300/50"
                  >
                    <span
                      className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg"
                      style={{ background: `radial-gradient(circle, ${jewel.accentColor}2a, transparent 70%)` }}
                    >
                      <KarambitVFXImage
                        image={jewel.image}
                        name={jewel.name}
                        slug={jewel.slug}
                        gradient={jewel.gradient}
                        accentColor={jewel.accentColor}
                        showSparkles={false}
                        showShimmer={false}
                        animateLevitate={false}
                        interactiveHover={false}
                        className="p-0.5"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[13px] font-black uppercase tracking-wide text-white group-hover:text-amber-300">
                        {founderShortName(jewel.name)}
                      </span>
                      <span className="block font-mono text-[11px] text-amber-400">
                        {jewel.basePrice.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/founders-vault"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-4 font-display text-lg font-black uppercase tracking-wider text-black transition-transform duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #fde68a, #f59e0b 55%, #d97706)',
                  boxShadow: '0 0 40px rgba(245,158,11,0.35)',
                }}
              >
                Entrar al Vault
                <ArrowRight className="h-5 w-5" />
              </Link>
              <span className="font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Firmado por DuFiTuFi (CEO)
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="relative mx-auto w-full max-w-[500px]"
          >
            <div
              aria-hidden="true"
              className="animate-vault-glow pointer-events-none absolute inset-6 rounded-full"
              style={{
                background: `radial-gradient(closest-side, ${flagshipKnife.accentColor}40, rgba(56,189,248,0.12) 55%, transparent 75%)`,
              }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full border border-amber-300/20" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-8 rounded-full border border-dashed border-amber-300/15" />
            <Link to="/founders-vault" aria-label="Entrar a The Founder's Vault" className="relative block aspect-square w-full p-3">
              <KarambitVFXImage
                image={flagshipKnife.image}
                name={flagshipKnife.name}
                slug={flagshipKnife.slug}
                accentColor={flagshipKnife.accentColor}
                gradient={flagshipKnife.gradient}
                interactiveHover={false}
                showGlow={false}
              />
            </Link>
            <div className="absolute inset-x-0 -bottom-2 flex justify-center">
              <span className="rounded-full border border-amber-300/40 bg-black/70 px-4 py-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200">
                1 of 1 · desde {Math.min(...founderKnives.map((k) => k.basePrice)).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ BESTSELLERS GRID ═══ */}
      <section className="max-w-7xl mx-auto px-6 w-full py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider font-display mb-3">
            <Zap className="w-3.5 h-3.5" />
            Catálogo Destacado
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            Los Karambits <span className="text-krm-accent">Más Deseados</span>
          </h2>
          <p className="text-gray-400 font-body text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Explora las piezas favoritas de la comunidad gaming y coleccionistas.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-krm-accent text-black shadow-lg shadow-amber-500/20'
                    : 'bg-krm-panel text-gray-400 hover:text-white border border-krm-border hover:border-gray-600'
                }`}
              >
                {cat === 'all' ? 'Todos los Modelos' : cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-white border border-krm-border hover:border-krm-accent bg-krm-panel hover:bg-[#1a1d2b] transition-all duration-300 font-display text-base group"
          >
            Explorar Catálogo Completo ({karambits.length} Modelos)
            <ArrowRight className="w-4 h-4 text-krm-accent group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ═══ CUSTOMIZATION SHOWCASE ═══ */}
      <section className="border-t border-krm-border bg-[#0c0d14] py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-6"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider font-display mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Personalización Láser
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white font-display uppercase tracking-tight mb-4 leading-tight">
                Hazlo Tuyo con <span className="text-krm-accent">StatTrak™</span> y <span className="text-purple-400">NameTag</span>
              </h2>
              <p className="text-gray-400 font-body leading-relaxed mb-6">
                Cada karambit puede personalizarse con un contador StatTrak™ grabado a láser y una
                placa NameTag con tu alias, clan o mensaje. Un acabado premium que eleva tu réplica
                a pieza única de coleccionista.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'StatTrak™', desc: 'Contador grabado a láser', color: '#f59e0b' },
                  { title: 'NameTag', desc: 'Tu alias personalizado', color: '#a855f7' },
                  { title: 'Font Premium', desc: '12 tipografías gaming', color: '#ef4444' },
                  { title: 'Acabado', desc: 'Dorado, plata o negro', color: '#22c55e' },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/30 border border-krm-border">
                    <p className="font-bold text-white font-display text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 font-body">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
                <KarambitVFXImage
                  image={featuredProduct.image}
                  name={featuredProduct.name}
                  slug={featuredProduct.slug}
                  rarity={featuredProduct.rarity}
                  accentColor={featuredProduct.accentColor}
                  visualFilter={featuredProduct.visualFilter}
                  interactiveHover={true}
                />
                {/* StatTrak overlay */}
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg font-tech text-sm font-bold text-krm-accent"
                  style={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    textShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
                  }}
                >
                  StatTrak™ 001337
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section className="max-w-7xl mx-auto px-6 w-full py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            Reseñas <span className="text-krm-accent">Verificadas</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-white font-bold font-display text-xl">4.8/5</span>
            <span className="text-gray-500 font-body">· 2,847 reseñas</span>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'xDarkWolf',
              rating: 5,
              text: 'Increíble calidad. El Doppler Ruby es idéntico al del CS2. El grabado StatTrak™ es brutal, mis colegas del clan flipan.',
              product: 'Karambit Doppler Ruby',
              badge: 'Compra Verificada',
            },
            {
              name: 'NataliaGG',
              rating: 5,
              text: 'Compré el Fade como regalo de cumpleaños y la reacción fue épica. Los colores son exactos y el peso se siente premium.',
              product: 'Karambit Fade 100%',
              badge: 'Compra Verificada',
            },
            {
              name: 'ProSniper_ES',
              rating: 4,
              text: 'Tercer karambit que compro aquí. La versión sin filo es perfecta para tricks. El Case Hardened Blue Gem es una locura visual.',
              product: 'Karambit Case Hardened',
              badge: 'Cliente Recurrente',
            },
            {
              name: 'KnifeFlipperMX',
              rating: 5,
              text: 'El mejor sitio para réplicas gaming. La atención al detalle del Marble Fade Fire & Ice es impresionante. 100% recomendado.',
              product: 'Karambit Marble Fade',
              badge: 'Compra Verificada',
            },
            {
              name: 'AceTactical',
              rating: 5,
              text: 'Colecciono réplicas y estas son las mejores que he encontrado. El acero 440C es real y el grabado NameTag es un toque genial.',
              product: 'Karambit Tiger Tooth',
              badge: 'Coleccionista',
            },
            {
              name: 'StreamerJP',
              rating: 5,
              text: 'Lo mostré en stream y mis viewers se volvieron locos. El Sapphire Doppler brilla increíble en cámara. Ya quiero el Emerald.',
              product: 'Karambit Doppler Sapphire',
              badge: 'Compra Verificada',
            },
          ].map((review, i) => (
            <ReviewCard key={i} {...review} index={i} />
          ))}
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-3xl mx-auto px-6 w-full py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-black text-white font-display uppercase tracking-tight">
            Preguntas <span className="text-krm-accent">Frecuentes</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {[
            {
              question: '¿Las réplicas son escala 1:1 real?',
              answer:
                'Sí, todas nuestras réplicas son escala 1:1 fiel al modelo in-game de CS2. Miden 19cm de longitud total con hoja de 9cm, fabricadas en acero inoxidable 440C con mango de G10.',
            },
            {
              question: '¿Qué es el grabado StatTrak™?',
              answer:
                'Es un grabado a láser de alta precisión que simula el contador StatTrak™ del juego. Puedes elegir el número que quieras y se graba directamente en la hoja con acabado dorado, plateado o negro.',
            },
            {
              question: '¿Cuál es la diferencia entre hoja sin filo y afilada?',
              answer:
                'La versión sin filo tiene el borde completamente redondeado, perfecta para tricks, flipping y exhibición segura. La versión afilada tiene filo real de corte y requiere ser mayor de 18 años.',
            },
            {
              question: '¿Puedo personalizar mi NameTag?',
              answer:
                'Sí, con el Kit de Placa NameTag puedes grabar tu alias, nombre de clan, o cualquier mensaje personal (máx. 20 caracteres) en una placa de acero inoxidable que se fija al mango.',
            },
            {
              question: '¿De qué material están hechas?',
              answer:
                'Hoja de acero inoxidable 440C templado, mango de G10 (fibra de vidrio texturizada) con tornillos de acero inoxidable. Peso aproximado de 210g por unidad.',
            },
            {
              question: '¿Ofrecen garantía?',
              answer:
                'Todas nuestras réplicas incluyen garantía de satisfacción. Si no estás contento con tu compra, puedes solicitar un reembolso completo contactando con nuestro soporte.',
            },
          ].map((faq, i) => (
            <FAQItem key={i} {...faq} />
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-krm-border mt-10">
        <div className="max-w-7xl mx-auto px-6 w-full py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-tech text-xs font-black text-black"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  K
                </div>
                <span className="font-tech text-white text-sm font-bold tracking-widest">
                  KRM.GG
                </span>
              </div>
              <p className="text-gray-500 text-sm font-body">
                Réplicas artesanales de cuchillos Karambit inspirados en CS2. Calidad premium, diseño fiel.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold font-display uppercase tracking-wider mb-3">
                Tienda
              </h4>
              <ul className="space-y-2">
                {['Catálogo', 'Mystery Boxes', 'Packs', 'Accesorios'].map((item) => (
                  <li key={item}>
                    <Link to="/shop" className="text-gray-500 hover:text-krm-accent text-sm font-body transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold font-display uppercase tracking-wider mb-3">
                Personalización
              </h4>
              <ul className="space-y-2">
                {['Grabado StatTrak™', 'NameTag Custom', 'Tipografías', 'Acabados'].map((item) => (
                  <li key={item}>
                    <Link to="/stattrak-lab" className="text-gray-500 hover:text-krm-accent text-sm font-body transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold font-display uppercase tracking-wider mb-3">
                Soporte
              </h4>
              <ul className="space-y-2">
                {['FAQ', 'Contacto', 'Política de Devoluciones', 'Términos'].map((item) => (
                  <li key={item}>
                    <span className="text-gray-500 text-sm font-body cursor-pointer hover:text-krm-accent transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-krm-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-xs font-body">
              © 2024 KRM.GG – Karambit Shop. Todos los derechos reservados.
            </p>
            <p className="text-gray-700 text-xs font-body">
              No afiliado con Valve Corporation. CS2 es una marca registrada de Valve.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default HomePage;
