import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { rarityColors, type Product } from '../data/karambits';
import { useShallow } from 'zustand/react/shallow';
import { useStore, useIsInWishlist, useIsOwned } from '../store/useStore';
import { isOneOfOne } from '../lib/pricing';
import { buildKnifeCartItem, notifyCartResult } from '../lib/cart';
import { KarambitVFXImage } from './KarambitVFXImage';
import { QuickViewButton } from './QuickViewButton';
import { skinName, productTags, isFounderPiece, FOUNDER_CHIP } from '../lib/productDisplay';
import { Badge } from './ui/Badge';
import { Price } from './ui/Price';

/** Botón corazón cuadrado sobre la imagen (mismo patrón que la portada). */
export const WishlistHeart: React.FC<{ product: Product; className?: string; inverted?: boolean }> = ({
  product,
  className = '',
  inverted = false,
}) => {
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlisted = useIsInWishlist(product.id);
  return (
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
      className={`flex h-8 w-8 items-center justify-center transition-colors hover:text-pink ${
        inverted ? 'border border-paper/30 bg-ink text-paper' : 'bg-paper text-ink'
      } ${className}`}
      aria-label={wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      aria-pressed={wishlisted}
    >
      <Heart className={`h-4 w-4 ${wishlisted ? 'fill-pink text-pink' : ''}`} aria-hidden="true" />
    </button>
  );
};

/** Botón cuadrado "añadir al carrito" (icono). */
export const AddToCartIcon: React.FC<{ product: Product; inverted?: boolean }> = ({ product, inverted = false }) => {
  const { addToCart, setCartOpen } = useStore(
    useShallow((s) => ({ addToCart: s.addToCart, setCartOpen: s.setCartOpen }))
  );
  const owned = useIsOwned(product.id) && isOneOfOne(product);
  // Pieza 1-of-1 ya adquirida: no hay nada que añadir.
  if (owned) return null;
  return (
    <button
      type="button"
      onClick={() => {
        if (notifyCartResult(addToCart(buildKnifeCartItem(product)))) setCartOpen(true);
      }}
      className={`flex h-9 w-9 shrink-0 items-center justify-center border transition-colors ${
        inverted
          ? 'border-paper text-paper hover:bg-paper hover:text-ink'
          : 'border-ink text-ink hover:bg-ink hover:text-paper'
      }`}
      aria-label={`Añadir al carrito: ${skinName(product.name)}`}
      title="Añadir al carrito"
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
    </button>
  );
};

/** Tarjeta de producto editorial: celda de rejilla con reglas de 1px (ver docs/DESIGN.md). */
export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const to = `/product/${product.slug}`;
  const founder = isFounderPiece(product);
  const tags = founder ? [FOUNDER_CHIP] : productTags(product);

  return (
    <article
      className={`group relative flex flex-col border-b border-r ${
        founder ? 'border-paper/20 bg-ink text-paper' : 'border-line bg-paper'
      }`}
    >
      <div className={`relative aspect-square overflow-hidden ${founder ? 'bg-[#1a1918]' : 'bg-tile'}`}>
        <Link to={to} tabIndex={-1} aria-hidden="true" className="block h-full w-full p-7 sm:p-9">
          <KarambitVFXImage
            image={product.image}
            name={product.name}
            gleam={founder}
            slug={product.slug}
          />
        </Link>

        {tags.length > 0 && (
          <div
            className={`pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1 sm:left-3 sm:top-3 ${
              founder ? 'z-10 max-w-[calc(100%-3.5rem)] sm:max-w-[calc(100%-4rem)]' : ''
            }`}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${
                  founder ? 'bg-pink leading-[1.25] text-ink' : 'bg-paper leading-none text-ink'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <WishlistHeart product={product} inverted={founder} className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3" />

        <QuickViewButton product={product} inverted={founder} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <Badge color={rarityColors[product.rarity]} className={founder ? '!text-paper/60' : ''}>
          {product.rarity}
        </Badge>
        <h3 className={`line-clamp-2 font-body text-[15px] font-medium leading-snug tracking-normal ${founder ? 'text-paper' : 'text-ink'}`}>
          <Link
            to={to}
            className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-pink"
          >
            {skinName(product.name)}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Price value={product.basePrice} size="md" className={founder ? '!text-pink' : ''} />
            {product.originalPrice && product.originalPrice > product.basePrice && (
              <Price
                value={product.originalPrice}
                size="xs"
                tone="muted"
                strike
                className={founder ? '!text-paper/50' : ''}
              />
            )}
          </div>
          <AddToCartIcon product={product} inverted={founder} />
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
