import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { BadgeCheck, Eye, FileBadge2, Lock, ShoppingBag } from 'lucide-react';
import type { Product } from '../../data/karambits';
import { useStore } from '../../store/useStore';
import { buildKnifeCartItem, notifyCartResult } from '../../lib/cart';
import { toast } from '../../lib/toast';
import { Badge, Button, Price, buttonClasses } from '../ui';
import { KarambitVFXImage } from '../KarambitVFXImage';
import { getPieceMeta } from './pieceMeta';
import { usePieceOwnership } from './useOwnership';
import { SignatureMark } from './SignatureMark';
import { TiltStage } from './TiltStage';

interface PieceShowcaseProps {
  product: Product;
  /** Posición (0-based) en el Vault. */
  index: number;
  total: number;
  onOpenCertificate: (product: Product) => void;
}

const Bracket: React.FC<{ className: string; color: string }> = ({ className, color }) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none absolute h-6 w-6 ${className}`}
    style={{ borderColor: color }}
  />
);

/** Panel de exhibición a pantalla ancha de una pieza 1-of-1 del Vault. */
export const PieceShowcase: React.FC<PieceShowcaseProps> = ({ product, index, total, onOpenCertificate }) => {
  const meta = getPieceMeta(product);
  const { owned, inCart, serial, certificateId } = usePieceOwnership(product);
  const { addToCart, setCartOpen } = useStore(
    useShallow((s) => ({ addToCart: s.addToCart, setCartOpen: s.setCartOpen }))
  );

  const flip = index % 2 === 1;
  const discount =
    product.originalPrice && product.originalPrice > product.basePrice
      ? Math.round((1 - product.basePrice / product.originalPrice) * 100)
      : 0;

  const handleAcquire = () => {
    const result = addToCart(buildKnifeCartItem(product));
    if (notifyCartResult(result)) {
      toast.success(`${meta.shortName} añadida a tu arsenal.`, { title: 'Pieza 1-of-1' });
      setCartOpen(true);
    }
  };

  const specs: Array<[string, string]> = [
    ['Metal / aleación', product.specs.steel],
    ...meta.gems.filter((g) => g.label === 'Gemas' || g.label === 'Núcleo').map((g): [string, string] => [g.label, g.value]),
    ['Mango', product.specs.handleMaterial],
    ['Longitud', `${product.specs.totalLength} · hoja ${product.specs.bladeLength}`],
    ['Peso', product.specs.weight],
    ['Escala', product.specs.scale],
  ];

  return (
    <motion.article
      id={`pieza-${product.slug}`}
      aria-labelledby={`pieza-${product.slug}-title`}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative scroll-mt-24"
    >
      <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-10">
        {/* ── Escenario ── */}
        <div className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
          <div
            className="group relative overflow-hidden rounded-3xl border"
            style={{
              borderColor: `${meta.tint}55`,
              background: `radial-gradient(70% 60% at 50% 42%, ${meta.tint}26 0%, transparent 70%), radial-gradient(60% 50% at 85% 100%, ${meta.tint2}1f 0%, transparent 70%), linear-gradient(180deg, #0d101a 0%, #07080d 100%)`,
              boxShadow: `0 40px 90px -30px ${meta.tint}55, inset 0 0 0 1px rgba(255,255,255,0.03)`,
            }}
          >
            {/* Haz de luz cenital */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-3/4"
              style={{
                background: `conic-gradient(from 180deg at 50% -10%, transparent 150deg, ${meta.tint}30 175deg, ${meta.tint}55 180deg, ${meta.tint}30 185deg, transparent 210deg)`,
              }}
            />
            {/* Retícula sutil */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                backgroundSize: '44px 44px',
              }}
            />

            <Bracket className="left-3 top-3 border-l-2 border-t-2" color={meta.tint} />
            <Bracket className="right-3 top-3 border-r-2 border-t-2" color={meta.tint} />
            <Bracket className="bottom-3 left-3 border-b-2 border-l-2" color={meta.tint} />
            <Bracket className="bottom-3 right-3 border-b-2 border-r-2" color={meta.tint} />

            {/* Cabecera del escenario */}
            <div className="absolute left-5 right-5 top-5 z-20 flex items-start justify-between gap-2">
              <span className="font-tech text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 sm:text-xs">
                Pieza {meta.numeral} / {total}
              </span>
              {owned ? (
                <Badge tone="emerald" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
                  En tu colección
                </Badge>
              ) : (
                <Badge color={meta.tint}>1 of 1</Badge>
              )}
            </div>

            <TiltStage className="relative z-10 aspect-square w-full p-6 pb-24 pt-12 sm:aspect-[5/4] sm:p-10 sm:pb-24">
              <div className="relative h-full w-full">
                <KarambitVFXImage
                  image={product.image}
                  name={product.name}
                  slug={product.slug}
                  rarity={product.rarity}
                  category={product.category}
                  accentColor={product.accentColor}
                  gradient={product.gradient}
                  collection={product.collection}
                  isOneOfOne={product.isOneOfOne}
                  interactiveHover={false}
                  showGlow={false}
                  priority={index === 0}
                />
              </div>
            </TiltStage>

            {/* Pedestal: sombra elíptica */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-16 left-1/2 h-6 w-2/3 -translate-x-1/2 rounded-[50%]"
              style={{ background: `radial-gradient(closest-side, ${meta.tint}55, transparent)` }}
            />

            {/* Placa de serie 1/1 */}
            <div className="vault-plate absolute bottom-5 left-5 z-20 flex items-center gap-3 rounded-lg border border-white/10 px-3.5 py-2">
              <span className="font-tech text-xl font-black leading-none text-vault-gold sm:text-2xl">1/1</span>
              <span className="h-7 w-px bg-white/15" />
              <span className="min-w-0">
                <span className="block font-tech text-[8px] font-bold uppercase tracking-[0.22em] text-gray-400">
                  Serial
                </span>
                <span className="block break-all font-mono text-[11px] font-bold tracking-wider text-gray-100 sm:text-xs">
                  {serial ?? 'Se asigna al adquirir'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Información ── */}
        <div className={`lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
          <p className="font-tech text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: meta.tint }}>
            Founder Bespoke · Pieza {meta.numeral}
          </p>
          <h2
            id={`pieza-${product.slug}-title`}
            className="mt-2 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl"
          >
            {meta.shortName}
          </h2>
          <p className="mt-2 font-display text-lg font-bold italic text-amber-200/90">{meta.tagline}</p>
          <p className="mt-3 font-body text-sm leading-relaxed text-gray-400">{meta.story}</p>

          {/* Ficha técnica */}
          <dl className="mt-5 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            {specs.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 px-4 py-2.5 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
                <dt className="font-tech text-[9px] font-bold uppercase tracking-[0.16em] text-gray-500">{label}</dt>
                <dd className="break-words font-body text-xs font-medium text-gray-200 sm:text-[13px]">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Firma + precio */}
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Valor de la pieza</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Price value={product.basePrice} size="xl" tone="accent" />
                {product.originalPrice && <Price value={product.originalPrice} size="md" tone="muted" strike />}
                {discount > 0 && <Badge tone="emerald">-{discount}%</Badge>}
              </div>
            </div>
            <SignatureMark />
          </div>

          {/* Estado / acciones */}
          {owned ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-4">
              <p className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-wider text-emerald-300">
                <BadgeCheck className="h-4 w-4 shrink-0" />
                En tu colección
              </p>
              {certificateId && (
                <p className="mt-1 break-all font-mono text-xs tracking-wider text-emerald-200/80">
                  Certificado #{certificateId}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="md"
                  icon={<FileBadge2 className="h-4 w-4" />}
                  onClick={() => onOpenCertificate(product)}
                  disabled={!certificateId}
                >
                  Ver certificado
                </Button>
                <Button variant="secondary" size="md" icon={<Lock className="h-4 w-4" />} disabled>
                  Pieza adquirida
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap gap-2">
              {inCart ? (
                <>
                  <Button variant="secondary" size="lg" icon={<Lock className="h-4 w-4" />} disabled className="flex-1">
                    En tu arsenal
                  </Button>
                  <Button variant="ghost" size="lg" icon={<ShoppingBag className="h-4 w-4" />} onClick={() => setCartOpen(true)}>
                    Abrir carrito
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ShoppingBag className="h-4 w-4" />}
                  onClick={handleAcquire}
                  className="flex-1"
                >
                  Adquirir pieza
                </Button>
              )}
            </div>
          )}
          <Link
            to={`/product/${product.slug}`}
            className={buttonClasses({ variant: 'ghost', size: 'md', className: 'mt-2 w-full' })}
          >
            <Eye className="h-4 w-4" />
            Ver ficha
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default PieceShowcase;
