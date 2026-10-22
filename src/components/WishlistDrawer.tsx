import React from 'react';
import { X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useStore, type WishlistItem } from '../store/useStore';
import { getProductById } from '../data/karambits';
import { buildKnifeCartItem } from '../lib/cart';
import { Link } from 'react-router-dom';
import { Drawer } from './ui/Drawer';
import { Price } from './ui/Price';
import { Button } from './ui/Button';
import { buttonClasses } from './ui/buttonStyles';
import { KarambitVFXImage } from './KarambitVFXImage';
import { toast } from '../lib/toast';

const LINK_BTN =
  'cursor-pointer font-body text-xs font-medium text-ink underline decoration-1 underline-offset-4 transition-colors hover:text-pink-ink hover:decoration-pink';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    isWishlistOpen,
    setWishlistOpen,
    removeFromWishlist,
    clearWishlist,
    addToCart,
    setCartOpen,
  } = useStore(
    useShallow((s) => ({
      wishlist: s.wishlist,
      isWishlistOpen: s.isWishlistOpen,
      setWishlistOpen: s.setWishlistOpen,
      removeFromWishlist: s.removeFromWishlist,
      clearWishlist: s.clearWishlist,
      addToCart: s.addToCart,
      setCartOpen: s.setCartOpen,
    }))
  );

  /** Mueve un favorito al carrito. `missing`: la pieza ya no existe en el catálogo (se retira de favoritos sin añadir). */
  const moveItem = (item: WishlistItem): { added: boolean; missing: boolean; error: string | null } => {
    const product = getProductById(item.id);
    if (!product) {
      removeFromWishlist(item.id);
      return { added: false, missing: true, error: null };
    }
    const result = addToCart(buildKnifeCartItem(product));
    if (!result.ok) return { added: false, missing: false, error: result.message };
    removeFromWishlist(item.id);
    return { added: true, missing: false, error: null };
  };

  const handleMoveToCart = (item: WishlistItem) => {
    const { error, missing } = moveItem(item);
    if (error) toast.error(error);
    else if (missing) toast.error('Esa pieza ya no está disponible en el catálogo.');
  };

  const handleMoveAllToCart = () => {
    const results = [...wishlist].map(moveItem);
    const errors = results.filter((r) => r.error !== null);
    const added = results.filter((r) => r.added).length;
    const missing = results.filter((r) => r.missing).length;
    if (errors.length > 0) {
      toast.error(errors[0].error as string);
      return;
    }
    if (missing > 0) {
      toast.error(
        missing === 1 ? 'Una pieza ya no está disponible y se ha retirado.' : `${missing} piezas ya no están disponibles y se han retirado.`
      );
    }
    if (added === 0) return;
    clearWishlist();
    setWishlistOpen(false);
    setCartOpen(true);
  };

  return (
    <Drawer open={isWishlistOpen} onClose={() => setWishlistOpen(false)} labelledBy="wishlist-drawer-title" zIndex={95}>
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-5">
        <div>
          <p className="eyebrow">
            Favoritos · {wishlist.length} {wishlist.length === 1 ? 'pieza' : 'piezas'}
          </p>
          <h2 id="wishlist-drawer-title" className="display-md mt-2">
            Lista de <span className="serif-accent text-pink-ink">deseos</span>
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setWishlistOpen(false)}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border border-line text-ink transition-colors hover:border-ink"
          aria-label="Cerrar lista de deseos"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-1 flex-col items-start justify-center px-5 py-10">
          <p className="eyebrow">00 — Sin favoritos</p>
          <h3 className="display-md mt-3 max-w-xs">Tu lista de deseos está vacía.</h3>
          <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-ink-2">
            Guarda los karambits que quieras coleccionar pulsando el corazón.
          </p>
          <Link
            to="/shop"
            onClick={() => setWishlistOpen(false)}
            className={`${buttonClasses({ variant: 'primary', size: 'md' })} mt-6`}
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-line overflow-y-auto">
            {wishlist.map((item) => {
              const product = getProductById(item.id);
              return (
                <li key={item.id} className="flex gap-4 px-5 py-5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden bg-tile p-2">
                    {product && (
                      <KarambitVFXImage
                        interactiveHover={false}
                        image={product.image}
                        name={item.name}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 font-body text-sm font-medium leading-snug tracking-normal text-ink [overflow-wrap:anywhere]">
                        {item.name}
                      </h3>
                      <Price value={item.price} size="sm" className="shrink-0" />
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <Button size="sm" variant="secondary" onClick={() => handleMoveToCart(item)}>
                        Mover al carrito
                      </Button>
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        aria-label={`Quitar ${item.name} de favoritos`}
                        className={LINK_BTN}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="space-y-3 border-t border-ink px-5 py-5">
            <Button fullWidth size="lg" onClick={handleMoveAllToCart}>
              Mover todo al carrito
            </Button>
            <div className="text-center">
              <button type="button" onClick={clearWishlist} className={LINK_BTN}>
                Vaciar lista de deseos
              </button>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
};

export default WishlistDrawer;
