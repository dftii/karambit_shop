import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import type { Product } from '../../data/karambits';
import { useStore } from '../../store/useStore';
import { buildKnifeCartItem, notifyCartResult } from '../../lib/cart';
import { toast } from '../../lib/toast';
import { Price } from '../ui';
import { KarambitVFXImage } from '../KarambitVFXImage';
import { getPieceMeta } from './pieceMeta';
import { usePieceOwnership } from './useOwnership';
import { SignatureMark } from './SignatureMark';

interface PieceShowcaseProps {
  product: Product;
  /** Posición (0-based) en el Vault. */
  index: number;
  total: number;
  onOpenCertificate: (product: Product) => void;
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

// Botones sobre la banda de tinta: papel sólido → rosa al pasar el ratón.
const BTN_BASE =
  'inline-flex items-center justify-center gap-2 border px-7 py-3.5 font-body text-[15px] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:pointer-events-none';
const BTN_PRIMARY = `${BTN_BASE} border-paper bg-paper text-ink hover:border-pink hover:bg-pink`;
const BTN_SECONDARY = `${BTN_BASE} border-paper/40 bg-transparent text-paper hover:border-paper hover:bg-paper hover:text-ink`;
const LINK =
  'font-body text-[15px] text-paper underline decoration-paper/40 decoration-1 underline-offset-4 transition-colors hover:text-pink hover:decoration-pink';

/** Pieza 1-of-1 del Vault como doble página editorial (imagen a un lado, ficha al otro). */
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

  const numeral = meta.numeral !== '·' ? meta.numeral : (ROMAN[index + 1] ?? String(index + 1));
  const totalRoman = ROMAN[total] ?? String(total);

  return (
    <motion.article
      id={`pieza-${product.slug}`}
      aria-labelledby={`pieza-${product.slug}-title`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="scroll-mt-20 border-t border-paper/20 py-12 sm:py-16"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
        {/* ── Imagen ── */}
        <div className={`min-w-0 lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
          <div className="group relative aspect-square w-full overflow-hidden border border-paper/20 bg-[#1a1918] sm:aspect-[5/4]">
            <span className="absolute left-4 top-4 z-10 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/60">
              Pieza {numeral} / {totalRoman}
            </span>
            <span className="absolute right-4 top-4 z-10 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/60">
              {owned ? 'En tu colección' : 'Disponible'}
            </span>
            <div className="h-full w-full p-10 pb-20 pt-12 sm:p-14 sm:pb-24">
              <KarambitVFXImage
                image={product.image}
                name={product.name}
                priority={index === 0}
              />
            </div>
            {/* Placa de serie 1 de 1 */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex max-w-full items-stretch border border-paper/30 bg-[#1a1918] sm:right-auto">
              <span className="flex items-center border-r border-paper/30 px-3 font-mono text-sm font-medium tabular-nums text-paper">
                1 de 1
              </span>
              <span className="min-w-0 px-3 py-2">
                <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-paper/50">
                  Serial
                </span>
                <span className="block break-all font-mono text-xs text-paper">
                  {serial ?? 'Se asigna al adquirir'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Ficha ── */}
        <div className={`min-w-0 lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/60">
            Founder Bespoke · Pieza {numeral} / {totalRoman}
          </p>
          <h3 id={`pieza-${product.slug}-title`} className="display-lg mt-4">
            {meta.shortName}
          </h3>
          <p className="mt-3 font-serif text-xl italic text-pink">{meta.tagline}</p>
          <p className="mt-4 max-w-md font-body text-[15px] leading-relaxed text-paper/75">{meta.story}</p>

          {/* Ficha técnica */}
          <dl className="mt-8 border-t border-paper/20">
            {specs.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b border-paper/20 py-2.5 sm:grid-cols-[8rem_minmax(0,1fr)]"
              >
                <dt className="pt-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/50">
                  {label}
                </dt>
                <dd className="break-words font-body text-sm text-paper">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Precio + firma */}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/50">
                Valor de la pieza
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Price value={product.basePrice} size="xl" className="!text-paper" />
                {product.originalPrice && (
                  <Price value={product.originalPrice} size="md" strike className="!text-paper/50" />
                )}
                {discount > 0 && (
                  <span className="font-mono text-xs font-medium tabular-nums text-pink">−{discount} %</span>
                )}
              </div>
            </div>
            <SignatureMark tone="paper" size="sm" />
          </div>

          {/* Estado / acciones */}
          {owned ? (
            <div className="mt-8 border border-paper/20 p-5">
              <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper">
                <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-pink" />
                En tu colección
              </p>
              {certificateId && (
                <p className="mt-2 break-all font-mono text-xs text-paper/70">Certificado #{certificateId}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onOpenCertificate(product)}
                  disabled={!certificateId}
                  className={BTN_PRIMARY}
                >
                  Ver certificado
                </button>
                <button type="button" disabled className={BTN_SECONDARY}>
                  Pieza adquirida
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap gap-3">
              {inCart ? (
                <>
                  <button type="button" disabled className={`${BTN_SECONDARY} flex-1 sm:flex-none`}>
                    En tu arsenal
                  </button>
                  <button type="button" onClick={() => setCartOpen(true)} className={BTN_PRIMARY}>
                    Abrir carrito
                  </button>
                </>
              ) : (
                <button type="button" onClick={handleAcquire} className={`${BTN_PRIMARY} w-full sm:w-auto`}>
                  Adquirir pieza
                </button>
              )}
            </div>
          )}
          <Link to={`/product/${product.slug}`} className={`${LINK} mt-6 inline-block`}>
            Ver ficha
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default PieceShowcase;
