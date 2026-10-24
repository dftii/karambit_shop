import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import type { Product } from '../../data/karambits';
import { ADDON_PRICES, isOneOfOne } from '../../lib/pricing';
import { useIsInWishlist, useIsOwned, useStore } from '../../store/useStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Price } from '../ui/Price';
import { buttonClasses } from '../ui/buttonStyles';
import { useVaultPick, useVaultTone } from '../ui/vaultTone';
import type { ConfiguratorModel } from './useConfigurator';

interface PurchaseBarProps {
  product: Product;
  cfg: ConfiguratorModel;
}

/** Desglose de precio, total, acciones de compra y favoritos de la ficha. */
export const PurchaseBar: React.FC<PurchaseBarProps> = ({ product, cfg }) => {
  const navigate = useNavigate();
  const { toggleWishlist, setCartOpen } = useStore(
    useShallow((s) => ({ toggleWishlist: s.toggleWishlist, setCartOpen: s.setCartOpen }))
  );
  const wishlisted = useIsInWishlist(product.id);
  // Solo las piezas 1-of-1 se agotan al comprarlas; el resto se puede volver a pedir.
  const owned = useIsOwned(product.id) && isOneOfOne(product);
  const { state, condition, config, nameTagActive, statTrakLabel, baseKnifePrice, price, addConfiguredToCart } = cfg;
  const tone = useVaultTone();
  const t = useVaultPick();
  const dtClass = t('text-ink-2', 'text-paper/70');

  const handleAddToCart = () => {
    if (addConfiguredToCart()) setCartOpen(true);
  };

  const handleBuyNow = () => {
    if (cfg.prepareForCheckout()) navigate('/checkout');
  };

  return (
    <>
      {/* Total */}
      <dl className={`space-y-2 border-b py-5 text-sm ${t('border-line', 'border-paper/20')}`}>
        <div className="flex justify-between gap-4">
          <dt className={`font-body ${dtClass}`}>Karambit · {condition}</dt>
          <dd>
            <Price value={baseKnifePrice} size="sm" />
          </dd>
        </div>
        {state.statTrak && (
          <div className="flex justify-between gap-4">
            <dt className={`font-body ${dtClass}`}>StatTrak™ · {statTrakLabel}</dt>
            <dd>
              <Price value={ADDON_PRICES.statTrak} size="sm" prefix="+" />
            </dd>
          </div>
        )}
        {nameTagActive && (
          <div className="flex justify-between gap-4">
            <dt className={`min-w-0 truncate font-body ${dtClass}`}>NameTag · {state.nameTagText}</dt>
            <dd>
              <Price value={ADDON_PRICES.nameTag} size="sm" prefix="+" />
            </dd>
          </div>
        )}
        {state.stand && (
          <div className="flex justify-between gap-4">
            <dt className={`font-body ${dtClass}`}>Soporte de exhibición</dt>
            <dd>
              <Price value={ADDON_PRICES.stand} size="sm" prefix="+" />
            </dd>
          </div>
        )}
        {config.kydex && (
          <div className="flex justify-between gap-4">
            <dt className={`font-body ${dtClass}`}>Funda Kydex</dt>
            <dd>
              <Price value={ADDON_PRICES.kydex} size="sm" prefix="+" />
            </dd>
          </div>
        )}
      </dl>

      <div className="flex items-baseline justify-between gap-4 py-5">
        <p className={`eyebrow ${t('!text-ink', '!text-paper')}`}>Total</p>
        <Price value={price} size="xl" tone={tone === 'dark' ? 'pink' : 'ink'} />
      </div>

      {owned ? (
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="success">En tu colección</Badge>
          <Link to="/orders" className={buttonClasses({ variant: 'secondary', size: 'md', tone })}>
            Ver mis pedidos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button size="lg" fullWidth icon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />} onClick={handleAddToCart}>
            Añadir al carrito
          </Button>
          <Button size="lg" variant="secondary" fullWidth onClick={handleBuyNow}>
            Comprar ahora
          </Button>
        </div>
      )}

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
          className={`${buttonClasses({ variant: 'link', size: 'md', tone })} gap-2`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-pink text-pink' : ''}`} aria-hidden="true" />
          {wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        </button>
        <p className={`eyebrow ${t('', '!text-paper/60')}`}>Pago simulado · certificado digital único</p>
      </div>
    </>
  );
};

export default PurchaseBar;
