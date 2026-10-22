import { hideBrokenImage } from '../lib/imageFallback';
import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
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
import { formatEUR } from '../lib/format';
import { KarambitVFXImage } from '../components/KarambitVFXImage';
import { QuickViewButton } from '../components/QuickViewButton';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '../components/ui/Badge';
import { Price } from '../components/ui/Price';
import { buttonClasses } from '../components/ui/buttonStyles';

// ─── Helpers ───────────────────────────────────────────
// Nombre corto de una pieza Founder (sin estrella, sin firma de colección).
const founderShortName = (name: string) =>
  name.replace(/^★ Karambit \| /, '').split(' — ')[0].replace(/ \(.*\)$/, '');

// Nombre de la skin sin el prefijo común "Karambit | ".
const skinName = (name: string) => name.replace(/^★? ?Karambit \| /, '');

// Importe sin decimales con separador de miles también en 4 cifras (es-ES no agrupa 9990 por defecto).
const EUR0 = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0, useGrouping: 'always' });

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Aparición sutil: opacidad + 12px de desplazamiento (MotionConfig respeta reduced-motion). */
const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.3, ease: 'easeOut', delay }}
    className={className}
  >
    {children}
  </motion.div>
);

/** Cabecera de sección numerada: "01 — Destacados" + titular + aside opcional. */
const SectionHead: React.FC<{
  index: string;
  label: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}> = ({ index, label, children, aside }) => (
  <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="eyebrow">
        {index} — {label}
      </p>
      <h2 className="display-lg mt-4">{children}</h2>
    </div>
    {aside}
  </div>
);

// ─── Tarjeta de producto ───────────────────────────────
const productTags = (product: Product): string[] => {
  const tags: string[] = [];
  if (product.isOneOfOne) tags.push('1 de 1');
  if (product.isLimitedEdition) tags.push('Edición limitada');
  if (product.isNew) tags.push('Nuevo');
  return tags.slice(0, 2);
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, toggleWishlist, setCartOpen } = useStore(
    useShallow((s) => ({
      addToCart: s.addToCart,
      toggleWishlist: s.toggleWishlist,
      setCartOpen: s.setCartOpen,
    }))
  );
  const wishlisted = useIsInWishlist(product.id);
  const to = `/product/${product.slug}`;

  return (
    <article className="group relative flex flex-col border-b border-r border-line bg-paper">
      <div className="relative aspect-square overflow-hidden bg-tile">
        <Link to={to} tabIndex={-1} aria-hidden="true" className="block h-full w-full p-7 sm:p-9">
          <KarambitVFXImage
            plain
            image={product.image}
            name={product.name}
            slug={product.slug}
            gradient={product.gradient}
            accentColor={product.accentColor}
          />
        </Link>

        {productTags(product).length > 0 && (
          <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1 sm:left-3 sm:top-3">
            {productTags(product).map((tag) => (
              <span key={tag} className="bg-paper px-2 py-1 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink">
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            toggleWishlist({
              id: product.id,
              name: product.name,
              price: product.basePrice,
              gradient: product.gradient,
            })
          }
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center bg-paper text-ink transition-colors hover:text-pink sm:right-3 sm:top-3"
          aria-label={wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          aria-pressed={wishlisted}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-pink text-pink' : ''}`} aria-hidden="true" />
        </button>

        <QuickViewButton product={product} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <Badge color={rarityColors[product.rarity]}>{product.rarity}</Badge>
        <h3 className="line-clamp-2 font-body text-[15px] font-medium leading-snug tracking-normal text-ink">
          <Link
            to={to}
            className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-pink"
          >
            {skinName(product.name)}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Price value={product.basePrice} size="md" />
            {product.originalPrice && product.originalPrice > product.basePrice && (
              <Price value={product.originalPrice} size="xs" tone="muted" strike />
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (notifyCartResult(addToCart(buildKnifeCartItem(product)))) setCartOpen(true);
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
            aria-label={`Añadir al carrito: ${skinName(product.name)}`}
            title="Añadir al carrito"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};

// ─── FAQ ───────────────────────────────────────────────
const FAQItem: React.FC<{ index: number; question: string; answer: string }> = ({ index, question, answer }) => {
  const [open, setOpen] = React.useState(false);
  const panelId = `faq-${index}`;
  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={panelId}
          className="group flex w-full items-baseline gap-4 py-5 text-left"
        >
          <span className="eyebrow w-6 shrink-0">{pad2(index + 1)}</span>
          <span className="flex-1 font-display text-lg font-medium leading-snug tracking-[-0.02em] text-ink group-hover:text-pink-ink sm:text-xl">
            {question}
          </span>
          {open ? (
            <Minus className="h-4 w-4 shrink-0 translate-y-0.5 text-pink" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4 shrink-0 translate-y-0.5 text-ink" aria-hidden="true" />
          )}
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 pl-10 font-body text-[15px] leading-relaxed text-ink-2">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQS = [
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
    question: '¿Es real el pago?',
    answer:
      'No. KRM—GG es un proyecto de demostración: la pasarela de pago es una simulación, no se realiza ningún cargo y no hace falta introducir datos bancarios reales.',
  },
];

const STEPS = [
  {
    title: 'Elige tu pieza',
    text: 'Explora el catálogo, escoge el acabado y personalízala con grabado StatTrak™ y NameTag.',
  },
  {
    title: 'Confirma en la pasarela',
    text: 'El pago es una simulación de demostración: sigues todo el proceso sin que se realice ningún cargo.',
  },
  {
    title: 'Recibe tu certificado',
    text: 'Al confirmar se emite un certificado digital con número de serie único. Lo tendrás siempre en Mis pedidos.',
  },
];

const CATEGORY_TABS: (Category | 'all')[] = [
  'all',
  'Doppler Series',
  'Iconic Skins',
  'Tactical & Forged CS2',
  'Military Spec-Ops CS2',
  'Esports Edition',
];

// ─── HOME PAGE ─────────────────────────────────────────
const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState<Category | 'all'>('all');

  const founderKnives = getFounderBespoke();
  const flagshipKnife = founderKnives.reduce((top, k) => (k.basePrice > top.basePrice ? k : top), founderKnives[0]);
  const founderFrom = Math.min(...founderKnives.map((k) => k.basePrice));
  const founderShowcase = [...founderKnives].sort((a, b) => b.basePrice - a.basePrice);

  // El catálogo "general" excluye la colección Founder, que tiene su propia banda.
  const regular = karambits.filter((k) => k.collection !== 'founder-bespoke');
  const featured = (activeCategory === 'all' ? regular : regular.filter((k) => k.category === activeCategory)).slice(0, 8);

  const tickerItems = karambits.slice(0, 16).map((k) => ({
    id: k.id,
    label: k.collection === 'founder-bespoke' ? founderShortName(k.name) : skinName(k.name),
    price: k.basePrice,
  }));

  return (
    <main id="main" tabIndex={-1} className="w-full outline-none">
      <PageMeta
        title="Inicio"
        description="Tienda de réplicas de karambit inspiradas en CS2. Escala 1:1, acero 440C, grabado StatTrak™ y NameTag, y la colección Founder Bespoke de DuFiTuFi Design."
      />

      {/* ═══ HERO ═══ */}
      <section className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="flex flex-col py-10 sm:py-14 lg:col-span-7 lg:py-20 lg:pr-12">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="eyebrow"
            >
              Réplicas de coleccionista · Inspiradas en CS2
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
              className="display-hero mt-6"
            >
              Karambits de <span className="serif-accent text-pink-ink">colección</span>.
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
              className="mt-8 max-w-xl"
            >
              <p className="font-body text-lg leading-relaxed text-ink-2">
                Réplicas 1:1 en acero 440C de las skins más reconocibles, con grabado StatTrak™ y NameTag
                a tu nombre. Y, aparte, una colección de piezas 1 de 1 firmada por el fundador.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link to="/shop" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
                  Ver catálogo
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to="/founders-vault" className={buttonClasses({ variant: 'link', size: 'lg' })}>
                  Founder&apos;s Vault →
                </Link>
              </div>
            </motion.div>

            <dl className="mt-12 grid grid-cols-3 border-t border-line lg:mt-auto lg:pt-0">
              {[
                ['Escala', '1:1 CS2'],
                ['Acero', '440C'],
                ['Grabado', 'StatTrak™'],
              ].map(([term, value], i) => (
                <div key={term} className={`py-4 ${i > 0 ? 'border-l border-line pl-4' : ''}`}>
                  <dt className="eyebrow">{term}</dt>
                  <dd className="mt-1 font-display text-lg font-medium tracking-[-0.02em] sm:text-xl">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Vitrina: las 4 piezas Founder recortadas directamente sobre el papel */}
          <div className="flex flex-col border-line pb-10 lg:col-span-5 lg:border-l lg:py-14 lg:pl-8">
            <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3">
              <p className="eyebrow">Fig. 01 — Founder Bespoke</p>
              <p className="eyebrow">{founderShowcase.length} piezas · 1 de 1</p>
            </div>
            <ul className="flex flex-1 flex-col justify-between divide-y divide-line">
              {founderShowcase.map((k, i) => (
                <li key={k.id}>
                  <Link to={`/product/${k.slug}`} className="group flex items-center gap-4 py-3 sm:py-4">
                    <span className="eyebrow w-5 shrink-0 self-start pt-1">{pad2(i + 1)}</span>
                    <img
                      fetchPriority={i === 0 ? 'high' : undefined}
                      decoding="async"
                      onError={hideBrokenImage}
                      src={k.image}
                      alt={founderShortName(k.name)}
                      className="aspect-[12/5] w-[56%] shrink-0 object-contain transition-transform duration-500 ease-out group-hover:-translate-x-1 group-hover:-rotate-3"
                    />
                    <span className="ml-auto min-w-0 text-right">
                      <span className="block font-body text-sm font-medium leading-snug text-ink group-hover:text-pink-ink">
                        {founderShortName(k.name)}
                      </span>
                      <Price value={k.basePrice} size="sm" className="mt-1" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/founders-vault"
              className="group flex items-center justify-between gap-4 border-t border-ink pt-3"
            >
              <span className="eyebrow group-hover:text-pink-ink">Entrar al Founder&apos;s Vault</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-ink transition-colors group-hover:text-pink" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ TICKER (decorativo) ═══ */}
      <div aria-hidden="true" className="krm-marquee overflow-hidden border-y border-line bg-paper-2">
        <div className="krm-marquee-track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center">
              {tickerItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 whitespace-nowrap py-3 pr-8 font-mono text-xs font-medium uppercase tracking-[0.06em] text-ink-2"
                >
                  <span className="text-pink">/</span>
                  {item.label}
                  <span className="text-ink">{formatEUR(item.price)}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* ═══ 01 — DESTACADOS ═══ */}
      <section className="wrap pt-20 sm:pt-28" aria-labelledby="destacados">
        <Reveal>
          <SectionHead
            index="01"
            label="Destacados"
            aside={
              <Link to="/shop" className={`${buttonClasses({ variant: 'link', size: 'md' })} self-start sm:self-end`}>
                Ver los {regular.length} modelos →
              </Link>
            }
          >
            <span id="destacados">
              Los más <span className="serif-accent text-pink-ink">deseados</span>
            </span>
          </SectionHead>

          {/* Filtros: texto mono con subrayado; desplazables en móvil */}
          <div role="group" aria-label="Filtrar por categoría" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-x-6 border-b border-line">
              {CATEGORY_TABS.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={active}
                    className={`-mb-px whitespace-nowrap border-b py-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                      active ? 'border-pink text-ink' : 'border-transparent text-ink-3 hover:text-ink'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 border-l border-line lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {featured.length === 0 && (
          <p className="border-b border-line py-16 text-center font-body text-sm text-ink-2">
            No hay modelos en esta categoría.
          </p>
        )}
      </section>

      {/* ═══ 02 — FOUNDER BESPOKE (banda invertida) ═══ */}
      <section className="mt-20 bg-ink text-paper sm:mt-28" aria-labelledby="vault-title">
        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <Reveal className="py-14 sm:py-20 lg:col-span-6 lg:pr-12">
              <p className="eyebrow !text-paper/60">02 — Founder Bespoke</p>
              <h2 id="vault-title" className="display-xl mt-4">
                The Founder&apos;s <span className="serif-accent text-pink">Vault</span>
              </h2>
              <p className="mt-4 font-mono text-xs font-medium uppercase tracking-[0.08em] text-paper/70">
                DuFiTuFi Design (CEO)
              </p>
              <p className="mt-6 max-w-md font-body text-base leading-relaxed text-paper/75">
                {founderKnives.length} karambits de platino, oro y gemas auténticas. Diseñados y firmados por el
                fundador: existen una sola vez y cada uno lleva su certificado de autenticidad digital.
              </p>

              <ul className="mt-8 border-t border-paper/20">
                {founderKnives.map((jewel, i) => (
                  <li key={jewel.id} className="border-b border-paper/20">
                    <Link
                      to="/founders-vault"
                      className="group flex items-center gap-4 py-3 outline-offset-0"
                    >
                      <span className="font-mono text-[11px] tabular-nums text-paper/50">{pad2(i + 1)}</span>
                      <span className="h-11 w-11 shrink-0 border border-paper/20 p-1">
                        <KarambitVFXImage plain image={jewel.image} name={jewel.name} slug={jewel.slug} gradient={jewel.gradient} interactiveHover={false} />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-body text-[15px] text-paper underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-pink">
                        {founderShortName(jewel.name)}
                      </span>
                      <span className="font-mono text-sm tabular-nums text-paper">
                        {EUR0.format(jewel.basePrice)} €
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link
                  to="/founders-vault"
                  className="inline-flex items-center justify-center gap-2 border border-paper bg-paper px-7 py-3.5 font-body text-[15px] font-medium text-ink transition-colors hover:border-pink hover:bg-pink"
                >
                  Entrar al Vault
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/50">
                  Firmado por DuFiTuFi (CEO)
                </span>
              </div>
            </Reveal>

            <div className="border-paper/20 pb-14 lg:col-span-6 lg:border-l lg:py-20 lg:pl-12">
              <Link
                to="/founders-vault"
                aria-label="Entrar a The Founder's Vault"
                className="group relative block aspect-square overflow-hidden border border-paper/20 bg-[#1a1918]"
              >
                <span className="absolute left-4 top-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/50">
                  1 de 1
                </span>
                <span className="absolute right-4 top-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/50">
                  {pad2(founderKnives.length)} piezas
                </span>
                <div className="h-full w-full p-10 sm:p-16">
                  <KarambitVFXImage
                    plain
                    image={flagshipKnife.image}
                    name={flagshipKnife.name}
                    slug={flagshipKnife.slug}
                    gradient={flagshipKnife.gradient}
                  />
                </div>
              </Link>
              <p className="mt-3 flex flex-wrap justify-between gap-x-6 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/60">
                <span>Fig. 02 — {founderShortName(flagshipKnife.name)}</span>
                <span className="text-paper">
                  Desde {EUR0.format(founderFrom)} €
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 03 — CÓMO FUNCIONA ═══ */}
      <section id="como-funciona" className="wrap scroll-mt-20 pt-20 sm:pt-28" aria-labelledby="como-title">
        <Reveal>
          <SectionHead index="03" label="Cómo funciona">
            <span id="como-title">
              Tres pasos, <span className="serif-accent text-pink-ink">sin complicaciones</span>
            </span>
          </SectionHead>
        </Reveal>
        <ol className="grid grid-cols-1 border-b border-line md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className={`py-8 md:py-12 ${i > 0 ? 'border-t border-line md:border-l md:border-t-0 md:pl-8' : ''} ${i < 2 ? 'md:pr-8' : ''}`}
            >
              <span className="font-mono text-sm font-medium tabular-nums text-pink-ink">{pad2(i + 1)}</span>
              <h3 className="display-md mt-6">{step.title}</h3>
              <p className="mt-3 max-w-xs font-body text-[15px] leading-relaxed text-ink-2">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ═══ 04 — FAQ ═══ */}
      <section id="faq" className="wrap scroll-mt-20 pt-20 sm:pt-28" aria-labelledby="faq-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <Reveal className="lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
            <p className="eyebrow">04 — FAQ</p>
            <h2 id="faq-title" className="display-lg mt-4">
              Preguntas <span className="serif-accent text-pink-ink">frecuentes</span>
            </h2>
          </Reveal>
          <div className="border-t border-line lg:col-span-8">
            {FAQS.map((faq, i) => (
              <FAQItem key={faq.question} index={i} {...faq} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
