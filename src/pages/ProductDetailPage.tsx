import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, RotateCcw, ShoppingBag, Star } from 'lucide-react';
import { karambits, rarityColors, type Product } from '../data/karambits';
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
import { ProductCard } from '../components/ProductCard';
import { formatStatTrak, skinName } from '../lib/productDisplay';
import { CheckRow, Choice, ChoiceGroup } from '../components/CheckRow';
import { NameTagPreview, StatTrakPreview } from '../components/EngravingPreview';
import NotFoundPage from './NotFoundPage';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Price } from '../components/ui/Price';
import { buttonClasses } from '../components/ui/buttonStyles';

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

type TabId = 'specs' | 'guarantee' | 'reviews';

/** Fila del configurador: índice mono + título, nota a la derecha y regla inferior. */
const ConfigRow: React.FC<{
  index: string;
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
}> = ({ index, title, note, children }) => (
  <section className="border-b border-line py-5">
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="eyebrow !text-ink">
        {index} — {title}
      </h2>
      {note && <span className="text-right font-mono text-[11px] tabular-nums text-ink-3">{note}</span>}
    </div>
    {children}
  </section>
);

const inputClass =
  'w-full border border-line bg-paper-2 px-3 py-2.5 text-ink placeholder:text-ink-3 focus:border-ink';

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

  const wishlisted = useIsInWishlist(product.id);

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
  const [activeTab, setActiveTab] = useState<TabId>('specs');

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

  const displayName = skinName(product.name).split(' — ')[0];
  const isFounder = product.collection === 'founder-bespoke' || product.isOneOfOne === true;
  const hasDiscount = product.originalPrice !== undefined && product.originalPrice > product.basePrice;

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
  const sharpened = bladeType.includes('Afilada');

  // ── Actions ────────────────────────────────────────
  const handleStatTrakInput = (val: string) => {
    setStatTrakNumber(val.replace(/\D/g, '').slice(0, 4));
  };

  const handleNameTagInput = (val: string) => {
    setNameTagText(val.toUpperCase().slice(0, 12));
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

  const specRows: [string, string][] = [
    ['Acero de la hoja', product.specs.steel],
    ['Longitud total', product.specs.totalLength],
    ['Longitud de hoja', product.specs.bladeLength],
    ['Grosor de hoja', '4,0 mm'],
    ['Diámetro de anillo', '2,5 cm (ergonómico)'],
    ['Peso total', product.specs.weight],
    ['Dureza Rockwell', '58 – 60 HRC'],
    ['Material del mango', product.specs.handleMaterial],
    ['Tratamiento', 'Curado térmico al vacío'],
    ['Protección', 'Anti-rayones UV'],
    ['Escala', product.specs.scale],
    ['Inspección in-game', 'Fiel al original'],
  ];

  const tabs: { id: TabId; label: string }[] = [
    { id: 'specs', label: 'Especificaciones' },
    { id: 'guarantee', label: 'Garantía' },
    { id: 'reviews', label: `Reseñas (${reviews.length})` },
  ];

  const viewButton = (mode: 'full' | 'blade' | 'handle', label: string) => (
    <button
      key={mode}
      type="button"
      onClick={() => setInspectMode(mode)}
      aria-pressed={inspectMode === mode}
      className={`px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors [&:not(:first-child)]:border-l [&:not(:first-child)]:border-ink ${
        inspectMode === mode ? 'bg-ink text-paper' : 'text-ink hover:bg-tile'
      }`}
    >
      {label}
    </button>
  );

  const miniButton =
    'border border-ink px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-paper';

  return (
    <main id="main" tabIndex={-1} className="wrap py-8 outline-none sm:py-12">
      <PageMeta title={product.name} description={metaDescription} />

      {/* Migas */}
      <nav aria-label="Migas de pan" className="eyebrow flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link to="/" className="transition-colors hover:text-pink-ink">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/shop" className="transition-colors hover:text-pink-ink">
          Catálogo
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-ink">
          {displayName}
        </span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
        {/* ══════════ IZQUIERDA: ESCENARIO ══════════ */}
        <div className="min-w-0 lg:col-span-7 lg:self-start lg:sticky lg:top-24">
          <div className="relative aspect-square overflow-hidden bg-tile">
            <p className="eyebrow absolute left-3 top-3 z-20 sm:left-4 sm:top-4">
              Fig. 01 — {condition}
              <span className="text-ink-3"> · Float {condition === 'Battle-Scarred' ? '0.65' : '0.01'}</span>
            </p>
            {(hasStatTrak || nameTagActive) && (
              <p className="eyebrow absolute bottom-3 left-3 z-20 !text-ink sm:bottom-4 sm:left-4">
                Vista previa del grabado
              </p>
            )}

            {/* Zoom de inspección */}
            <div
              className="absolute inset-0 transition-transform duration-500 ease-out"
              style={{
                transform:
                  inspectMode === 'blade'
                    ? 'scale(1.55) translate(-15%, 15%)'
                    : inspectMode === 'handle'
                    ? 'scale(1.7) translate(25%, -20%)'
                    : 'scale(1)',
              }}
            >
              {/* Rotación / volteo + patina de Battle-Scarred */}
              <div
                className={`relative h-full w-full p-8 sm:p-14 ${
                  condition === 'Battle-Scarred' ? 'contrast-125 saturate-75 brightness-90' : ''
                }`}
                style={{
                  transform: `rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
                  transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              >
                <KarambitVFXImage
                  plain
                  priority
                  image={product.image}
                  name={product.name}
                  slug={product.slug}
                  gradient={product.gradient}
                  accentColor={product.accentColor}
                  interactiveHover={false}
                />
                {hasStatTrak && <StatTrakPreview value={statTrakNumber} />}
                {nameTagActive && <NameTagPreview text={nameTagText} />}
              </div>
            </div>
          </div>

          {/* Controles de inspección */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Zona de inspección" className="inline-flex border border-ink">
              {viewButton('full', 'General')}
              {viewButton('blade', 'Hoja')}
              {viewButton('handle', 'Mango')}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev - 45) % 360)}
                aria-label="Rotar a la izquierda"
                title="Rotar a la izquierda"
                className="flex h-[34px] w-[34px] items-center justify-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setRotation(0)}
                title="Restablecer ángulo"
                aria-label={`Restablecer ángulo (${rotation} grados)`}
                className={`${miniButton} min-w-[3.5rem] tabular-nums`}
              >
                {rotation}°
              </button>
              <button type="button" onClick={() => setIsFlipped(!isFlipped)} aria-pressed={isFlipped} className={miniButton}>
                Voltear
              </button>
            </div>
          </div>

          {/* Datos de calidad */}
          <dl className="mt-8 grid grid-cols-3 border-t border-line">
            {[
              ['Acero', '440C'],
              ['Escala', '1:1 CS2'],
              ['Peso', product.specs.weight],
            ].map(([term, value], i) => (
              <div key={term} className={`py-4 ${i > 0 ? 'border-l border-line pl-4' : ''}`}>
                <dt className="eyebrow">{term}</dt>
                <dd className="mt-1 font-display text-base font-medium tracking-[-0.02em] sm:text-lg">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ══════════ DERECHA: INFORMACIÓN + CONFIGURADOR ══════════ */}
        <div className="min-w-0 lg:col-span-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="eyebrow">{product.category}</p>
            <span aria-hidden="true" className="eyebrow">
              ·
            </span>
            <Badge color={rarityColors[product.rarity]}>{product.rarity}</Badge>
          </div>

          <h1 className="display-lg mt-4">{displayName}</h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Price value={product.basePrice} size="xl" />
            {hasDiscount && <Price value={product.originalPrice!} size="md" tone="muted" strike />}
          </div>

          <p className="mt-3 font-mono text-xs tabular-nums text-ink-2">
            {product.rating.toFixed(1)} / 5 ·{' '}
            <button
              type="button"
              onClick={() => {
                setActiveTab('reviews');
                document.getElementById('detalles')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="underline decoration-1 underline-offset-4 transition-colors hover:text-pink-ink"
            >
              {reviews.length} reseñas
            </button>
          </p>

          {isFounder && (
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink">
              <span>Pieza 1 de 1 · DuFiTuFi Design (CEO)</span>
              <Link to="/founders-vault" className="text-pink-ink underline decoration-1 underline-offset-4 hover:text-ink">
                Founder&apos;s Vault →
              </Link>
            </p>
          )}

          <p className="mt-5 font-body text-[15px] leading-relaxed text-ink-2">{product.description}</p>

          {/* ─── Configurador ─── */}
          <div className="mt-8 border-t border-ink">
            {rules.singleUnit && (
              <p className="border-b border-line py-4 font-body text-sm leading-relaxed text-ink-2">
                <span className="eyebrow mr-2 !text-ink">Pieza 1 de 1</span>
                Solo existe una unidad: se fabrica únicamente en Factory New, sin filo real y sin funda Kydex.
              </p>
            )}

            <ConfigRow
              index="01"
              title="Estado del acabado"
              note={condition === 'Battle-Scarred' ? `-${battleScarredDiscount}%` : 'Float 0.01'}
            >
              <ChoiceGroup label="Estado del acabado">
                <Choice
                  active={condition === 'Factory New'}
                  onClick={() => setCondition('Factory New')}
                  title="Factory New"
                  sub="Recién fabricado · impecable"
                  footer={(a) => <Price value={product.basePrice} size="sm" className={a ? '!text-paper' : ''} />}
                />
                <Choice
                  active={condition === 'Battle-Scarred'}
                  onClick={() => setCondition('Battle-Scarred')}
                  disabled={!rules.conditions.includes('Battle-Scarred')}
                  title="Battle-Scarred"
                  sub="Defectos leves cosméticos"
                  footer={(a) => (
                    <span className="flex items-baseline gap-2">
                      <Price value={product.battleScarredPrice} size="sm" className={a ? '!text-paper' : ''} />
                      <Price value={product.basePrice} size="xs" tone="muted" strike className={a ? '!text-paper/60' : ''} />
                    </span>
                  )}
                />
              </ChoiceGroup>
              {!rules.conditions.includes('Battle-Scarred') && (
                <p className="mt-2 font-body text-xs text-ink-3">Battle-Scarred no está disponible en piezas 1 de 1.</p>
              )}
            </ConfigRow>

            <ConfigRow index="02" title="Tipo de hoja" note={sharpened ? 'Corte real' : 'Apta para tricks'}>
              <ChoiceGroup label="Tipo de hoja">
                <Choice
                  active={!sharpened}
                  onClick={() => setBladeType('Sin Filo (Unsharpened)')}
                  title="Sin filo"
                  sub="Segura para tricks y exposición"
                />
                <Choice
                  active={sharpened}
                  onClick={() => setBladeType('Afilada (Sharpened)')}
                  disabled={!rules.allowSharpened}
                  title="Afilada"
                  sub="Filo real cortante · +18 años"
                />
              </ChoiceGroup>
              {!rules.allowSharpened && (
                <p className="mt-2 font-body text-xs text-ink-3">Las piezas 1 de 1 se entregan siempre sin filo.</p>
              )}
            </ConfigRow>

            <ConfigRow index="03" title="Grabados">
              <div className="-mt-2.5">
                <CheckRow
                  checked={hasStatTrak}
                  onChange={setHasStatTrak}
                  aside={<Price value={ADDON_PRICES.statTrak} size="xs" prefix="+" />}
                  hint="Contador grabado a láser en la hoja"
                >
                  StatTrak™
                </CheckRow>
                {hasStatTrak && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="border-b border-line pb-4 pl-7"
                  >
                    <label htmlFor="stattrak-input" className="eyebrow block">
                      Bajas · hasta 4 dígitos
                    </label>
                    <div className="mt-2 flex items-stretch gap-3">
                      <input
                        id="stattrak-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={statTrakNumber}
                        onChange={(e) => handleStatTrakInput(e.target.value)}
                        placeholder="007"
                        className={`${inputClass} w-28 font-mono text-base font-medium tracking-[0.12em]`}
                      />
                      <p className="flex flex-1 items-center border border-dashed border-line px-3 font-mono text-xs tabular-nums text-ink-2">
                        ST™ <span className="ml-1.5 text-sm font-medium text-ink">{formatStatTrak(statTrakNumber)}</span>
                      </p>
                    </div>
                    <p className="mt-2 font-body text-xs text-ink-3">Se previsualiza sobre la hoja, en la imagen.</p>
                  </motion.div>
                )}

                <CheckRow
                  checked={hasNameTag}
                  onChange={setHasNameTag}
                  aside={<Price value={ADDON_PRICES.nameTag} size="xs" prefix="+" />}
                  hint="Placa de acero atornillada al mango"
                >
                  NameTag
                </CheckRow>
                {hasNameTag && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="pb-1 pl-7"
                  >
                    <label htmlFor="nametag-input" className="eyebrow block">
                      Texto de la placa · máx. 12
                    </label>
                    <input
                      id="nametag-input"
                      type="text"
                      maxLength={12}
                      value={nameTagText}
                      onChange={(e) => handleNameTagInput(e.target.value)}
                      placeholder="HEADSHOT"
                      className={`${inputClass} mt-2 font-mono text-base font-medium uppercase tracking-[0.1em]`}
                    />
                    <p className="mt-2 font-body text-xs text-ink-3">Se previsualiza sobre el mango, en la imagen.</p>
                  </motion.div>
                )}
              </div>
            </ConfigRow>

            <ConfigRow index="04" title="Accesorios">
              <div className="-mt-2.5">
                <CheckRow
                  checked={includeStand}
                  onChange={setIncludeStand}
                  aside={<Price value={ADDON_PRICES.stand} size="xs" prefix="+" />}
                  hint="Acrílico de 8 mm con grabado láser KRM—GG"
                >
                  Soporte de exhibición
                </CheckRow>
                <CheckRow
                  checked={includeKydex}
                  onChange={setIncludeKydex}
                  disabled={!rules.allowKydex}
                  bare
                  aside={<Price value={ADDON_PRICES.kydex} size="xs" prefix="+" />}
                  hint={
                    rules.allowKydex
                      ? 'Funda táctica con clip de cinturón y bloqueo'
                      : 'No disponible en piezas 1 de 1'
                  }
                >
                  Funda Kydex
                </CheckRow>
              </div>
            </ConfigRow>

            {/* Total */}
            <dl className="space-y-2 border-b border-line py-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="font-body text-ink-2">Karambit · {condition}</dt>
                <dd>
                  <Price value={baseKnifePrice} size="sm" />
                </dd>
              </div>
              {hasStatTrak && (
                <div className="flex justify-between gap-4">
                  <dt className="font-body text-ink-2">StatTrak™ · {formatStatTrak(statTrakNumber)}</dt>
                  <dd>
                    <Price value={ADDON_PRICES.statTrak} size="sm" prefix="+" />
                  </dd>
                </div>
              )}
              {nameTagActive && (
                <div className="flex justify-between gap-4">
                  <dt className="min-w-0 truncate font-body text-ink-2">NameTag · {nameTagText}</dt>
                  <dd>
                    <Price value={ADDON_PRICES.nameTag} size="sm" prefix="+" />
                  </dd>
                </div>
              )}
              {includeStand && (
                <div className="flex justify-between gap-4">
                  <dt className="font-body text-ink-2">Soporte de exhibición</dt>
                  <dd>
                    <Price value={ADDON_PRICES.stand} size="sm" prefix="+" />
                  </dd>
                </div>
              )}
              {includeKydex && (
                <div className="flex justify-between gap-4">
                  <dt className="font-body text-ink-2">Funda Kydex</dt>
                  <dd>
                    <Price value={ADDON_PRICES.kydex} size="sm" prefix="+" />
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex items-baseline justify-between gap-4 py-5">
              <p className="eyebrow !text-ink">Total</p>
              <Price value={finalPrice} size="xl" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button size="lg" fullWidth icon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />} onClick={handleAddToCart}>
                Añadir al carrito
              </Button>
              <Button size="lg" variant="secondary" fullWidth onClick={handleBuyNow}>
                Comprar ahora
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
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
                aria-pressed={wishlisted}
                className={`${buttonClasses({ variant: 'link', size: 'md' })} gap-2`}
              >
                <Heart className={`h-4 w-4 ${wishlisted ? 'fill-pink text-pink' : ''}`} aria-hidden="true" />
                {wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              </button>
              <p className="eyebrow">Pago simulado · certificado digital único</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ DETALLES: ESPECIFICACIONES · GARANTÍA · RESEÑAS ══════════ */}
      <section id="detalles" className="mt-20 scroll-mt-24 sm:mt-28" aria-label="Detalles del producto">
        <div role="tablist" aria-label="Detalles del producto" className="-mx-4 flex gap-x-8 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={active}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px whitespace-nowrap border-b py-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                  active ? 'border-pink text-ink' : 'border-transparent text-ink-3 hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Especificaciones */}
        {activeTab === 'specs' && (
          <motion.div
            role="tabpanel"
            id="panel-specs"
            aria-labelledby="tab-specs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pt-2"
          >
            <dl className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16">
              {specRows.map(([term, value]) => (
                <div key={term} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                  <dt className="eyebrow shrink-0">{term}</dt>
                  <dd className="text-right font-body text-[15px] text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}

        {/* Garantía */}
        {activeTab === 'guarantee' && (
          <motion.div
            role="tabpanel"
            id="panel-guarantee"
            aria-labelledby="tab-guarantee"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="grid grid-cols-1 border-b border-line md:grid-cols-2"
          >
            <div className="py-8 md:pr-10">
              <span className="font-mono text-sm font-medium tabular-nums text-pink-ink">01</span>
              <h3 className="display-md mt-5">Garantía de por vida en acero 440C</h3>
              <p className="mt-3 max-w-md font-body text-[15px] leading-relaxed text-ink-2">
                Cada pieza de KRM—GG cuenta con garantía ilimitada contra fracturas, holguras mecánicas o defectos
                estructurales. Si tu réplica sufre algún defecto de aleación, la reemplazamos.
              </p>
            </div>
            <div className="border-t border-line py-8 md:border-l md:border-t-0 md:pl-10">
              <span className="font-mono text-sm font-medium tabular-nums text-pink-ink">02</span>
              <h3 className="display-md mt-5">Certificado de autenticidad</h3>
              <p className="mt-3 max-w-md font-body text-[15px] leading-relaxed text-ink-2">
                Tu karambit incluye un identificador digital único emitido al realizar el pedido. Podrás consultar el
                certificado y su número de serie en cualquier momento desde Mis pedidos.
              </p>
            </div>
          </motion.div>
        )}

        {/* Reseñas */}
        {activeTab === 'reviews' && (
          <motion.div
            role="tabpanel"
            id="panel-reviews"
            aria-labelledby="tab-reviews"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="grid grid-cols-1 gap-x-12 gap-y-10 pt-8 lg:grid-cols-12"
          >
            <div className="lg:col-span-7">
              <div className="flex items-end gap-4 border-b border-ink pb-4">
                <span className="font-mono text-4xl font-medium leading-none tabular-nums tracking-tight">4.9</span>
                <p className="eyebrow pb-0.5">Basado en {reviews.length} opiniones verificadas</p>
              </div>

              <ul>
                {reviews.map((rev) => (
                  <li key={rev.id} className="border-b border-line py-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-body text-[15px] font-medium text-ink">{rev.author}</span>
                        {rev.verified && <Badge tone="success">Compra verificada</Badge>}
                      </div>
                      <span className="eyebrow">{rev.date}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-0.5" role="img" aria-label={`${rev.rating} de 5 estrellas`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          aria-hidden="true"
                          className={`h-3.5 w-3.5 ${n <= rev.rating ? 'fill-ink text-ink' : 'text-line'}`}
                        />
                      ))}
                    </div>
                    <p className="mt-3 max-w-xl font-body text-[15px] leading-relaxed text-ink-2">{rev.comment}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handlePostReview} className="border border-line bg-paper-2 p-5 sm:p-6">
                <h3 className="display-md">Publicar tu reseña</h3>

                <div className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="review-author" className="eyebrow block">
                      Nombre o nickname de CS2
                    </label>
                    <input
                      id="review-author"
                      type="text"
                      required
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      placeholder="Ej: NiKo, ZywOo, Karrigan"
                      className={`${inputClass} mt-2 font-body text-[15px]`}
                    />
                  </div>

                  <div>
                    <p className="eyebrow" id="review-rating-label">
                      Valoración
                    </p>
                    <div role="group" aria-labelledby="review-rating-label" className="mt-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
                          aria-pressed={star === newReviewRating}
                          className="p-1"
                        >
                          <Star
                            aria-hidden="true"
                            className={`h-5 w-5 transition-colors ${star <= newReviewRating ? 'fill-ink text-ink' : 'text-line hover:text-ink-3'}`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-mono text-xs tabular-nums text-ink-2">{newReviewRating} / 5</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="review-comment" className="eyebrow block">
                      Tu experiencia con el karambit
                    </label>
                    <textarea
                      id="review-comment"
                      required
                      rows={4}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Cuéntanos sobre el acabado, el peso, el filo o los grabados..."
                      className={`${inputClass} mt-2 resize-none font-body text-[15px]`}
                    />
                  </div>

                  <Button type="submit" size="lg" fullWidth>
                    Enviar reseña
                  </Button>

                  {reviewSubmitted && (
                    <p role="status" className="border-l-2 border-success pl-3 font-body text-sm text-success">
                      Tu reseña se ha publicado en la ficha.
                    </p>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </section>

      {/* ══════════ RELACIONADOS ══════════ */}
      <section className="mt-20 sm:mt-28" aria-labelledby="relacionados">
        <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Relacionados</p>
            <h2 id="relacionados" className="display-lg mt-4">
              Otros coleccionistas <span className="serif-accent text-pink-ink">también miraron</span>
            </h2>
          </div>
          <Link to="/shop" className={`${buttonClasses({ variant: 'link', size: 'md' })} self-start sm:self-end`}>
            Ver todo el catálogo →
          </Link>
        </div>

        <div className="grid grid-cols-2 border-l border-line lg:grid-cols-4">
          {relatedKarambits.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
};
export default ProductDetailPage;
