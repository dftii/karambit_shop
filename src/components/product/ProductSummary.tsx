import { memo } from 'react';
import { Link } from 'react-router-dom';
import { rarityColors, type Product } from '../../data/karambits';
import { skinName } from '../../lib/productDisplay';
import { Badge } from '../ui/Badge';
import { Price } from '../ui/Price';
import { useIsVault, useVaultPick } from '../ui/vaultTone';
import { useReviews } from './reviewsStore';

interface ProductSummaryProps {
  product: Product;
  /** Abre la pestaña de reseñas y desplaza hasta ella. */
  onShowReviews: () => void;
}

/** Cabecera informativa de la ficha (categoría, rareza, título, precio base, valoración, descripción). */
export const ProductSummary = memo(function ProductSummary({ product, onShowReviews }: ProductSummaryProps) {
  const reviewCount = useReviews(product.slug).length;
  const displayName = skinName(product.name).split(' — ')[0];
  const isFounder = product.collection === 'founder-bespoke' || product.isOneOfOne === true;
  const hasDiscount = product.originalPrice !== undefined && product.originalPrice > product.basePrice;
  const t = useVaultPick();
  const vault = useIsVault();
  const eyebrow = `eyebrow ${t('', '!text-paper/60')}`;

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className={eyebrow}>{product.category}</p>
        <span aria-hidden="true" className={eyebrow}>
          ·
        </span>
        <Badge color={rarityColors[product.rarity]}>{product.rarity}</Badge>
      </div>

      <h1 className="display-lg mt-4">{displayName}</h1>

      <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Price value={product.basePrice} size="xl" tone={vault ? 'pink' : 'ink'} />
        {hasDiscount && <Price value={product.originalPrice!} size="md" tone="muted" strike />}
      </div>

      <p className={`mt-3 font-mono text-xs tabular-nums ${t('text-ink-2', 'text-paper/70')}`}>
        {product.rating.toFixed(1)} / 5 ·{' '}
        <button
          type="button"
          onClick={onShowReviews}
          className={`underline decoration-1 underline-offset-4 transition-colors ${t('hover:text-pink-ink', 'hover:text-pink')}`}
        >
          {reviewCount} reseñas
        </button>
      </p>

      {isFounder && (
        <p
          className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] ${t(
            'text-ink',
            'text-paper'
          )}`}
        >
          <span>Pieza 1 de 1 · DuFiTuFi Design (CEO)</span>
          <Link
            to="/founders-vault"
            className={`underline decoration-1 underline-offset-4 ${t('text-pink-ink hover:text-ink', 'text-pink hover:text-paper')}`}
          >
            Founder&apos;s Vault →
          </Link>
        </p>
      )}

      <p className={`mt-5 font-body text-[15px] leading-relaxed ${t('text-ink-2', 'text-paper/75')}`}>
        {product.description}
      </p>
    </>
  );
});

export default ProductSummary;
