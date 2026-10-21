import React from 'react';
import { motion } from 'framer-motion';
import { Heart, X, ShoppingCart, Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useStore, type WishlistItem } from '../store/useStore';
import { getProductById } from '../data/karambits';
import { buildKnifeCartItem } from '../lib/cart';
import KarambitSVG from './KarambitSVG';
import { Link } from 'react-router-dom';
import { Drawer } from './ui/Drawer';
import { toast } from '../lib/toast';

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

  /** Mueve un favorito al carrito; devuelve el mensaje de error si el store lo rechaza. */
  const moveItem = (item: WishlistItem): string | null => {
    const product = getProductById(item.id);
    if (product) {
      const result = addToCart(buildKnifeCartItem(product));
      if (!result.ok) return result.message;
    }
    removeFromWishlist(item.id);
    return null;
  };

  const handleMoveToCart = (item: WishlistItem) => {
    const error = moveItem(item);
    if (error) toast.error(error);
  };

  const handleMoveAllToCart = () => {
    const errors = wishlist.map(moveItem).filter((e): e is string => e !== null);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    clearWishlist();
    setWishlistOpen(false);
    setCartOpen(true);
  };

  return (
    <Drawer open={isWishlistOpen} onClose={() => setWishlistOpen(false)} ariaLabel="Lista de deseos" zIndex={95}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-krm-border">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <h2 className="text-xl font-bold text-white font-display uppercase tracking-wider">
            Lista de Deseos ({wishlist.length})
          </h2>
        </div>
        <button
          onClick={() => setWishlistOpen(false)}
          className="p-2 rounded-lg hover:bg-krm-border transition-colors text-gray-400 hover:text-white"
          aria-label="Cerrar lista de deseos"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center px-4">
            <Heart className="w-16 h-16 mb-4 opacity-20 text-red-500" />
            <p className="text-lg font-display text-gray-400">Tu lista de deseos está vacía</p>
            <p className="text-xs mt-1 font-body text-gray-600 mb-6">
              Guarda los Karambits que quieras coleccionar haciendo clic en el corazón
            </p>
            <Link
              to="/shop"
              onClick={() => setWishlistOpen(false)}
              className="px-6 py-2.5 rounded-xl font-bold text-black uppercase tracking-wider font-display text-sm"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              Explorar Skins
            </Link>
          </div>
        ) : (
          wishlist.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#12141d', border: '1px solid #1f2433' }}
            >
              <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                <KarambitSVG gradient={item.gradient} size={48} animate={false} alt={item.name} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate font-display">
                  {item.name}
                </p>
                <p className="text-krm-accent font-bold text-sm font-display">
                  {item.price.toFixed(2)}€
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="px-2.5 py-1.5 rounded-lg bg-krm-border hover:bg-krm-hover text-krm-accent hover:text-white transition-colors text-xs font-display font-bold flex items-center gap-1"
                  title="Mover al Carrito"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Comprar
                </button>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  aria-label={`Quitar ${item.name} de favoritos`}
                  className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-colors"
                  title="Eliminar de lista"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      {wishlist.length > 0 && (
        <div className="p-6 border-t border-krm-border space-y-3">
          <button
            onClick={handleMoveAllToCart}
            className="w-full py-3 rounded-xl font-bold text-black uppercase tracking-wider font-display text-base transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 0 25px rgba(245, 158, 11, 0.25)',
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            Mover Todo al Carrito
          </button>
          <button
            onClick={clearWishlist}
            className="w-full py-2 rounded-xl text-gray-500 hover:text-red-400 text-xs font-display uppercase tracking-wider transition-colors"
          >
            Vaciar Lista de Deseos
          </button>
        </div>
      )}
    </Drawer>
  );
};

export default WishlistDrawer;
