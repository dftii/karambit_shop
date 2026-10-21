import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ShoppingCart, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import KarambitSVG from './KarambitSVG';
import { Link } from 'react-router-dom';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    isWishlistOpen,
    setWishlistOpen,
    removeFromWishlist,
    clearWishlist,
    addToCart,
    setCartOpen,
  } = useStore();

  const handleMoveToCart = (item: any) => {
    addToCart({
      id: `${item.id}-${Date.now().toString(36)}`,
      name: item.name,
      price: item.price,
      quantity: 1,
      gradient: item.gradient,
      type: 'karambit',
      bladeType: 'Sin Filo (Tricks/Exhibición)',
    });
    removeFromWishlist(item.id);
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach((item) => {
      addToCart({
        id: `${item.id}-${Date.now().toString(36)}`,
        name: item.name,
        price: item.price,
        quantity: 1,
        gradient: item.gradient,
        type: 'karambit',
        bladeType: 'Sin Filo (Tricks/Exhibición)',
      });
    });
    clearWishlist();
    setWishlistOpen(false);
    setCartOpen(true);
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            onClick={() => setWishlistOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-[95] flex flex-col"
            style={{ background: '#0d0f17', borderLeft: '1px solid #1f2433' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1f2433]">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <h2 className="text-xl font-bold text-white font-['Rajdhani'] uppercase tracking-wider">
                  Lista de Deseos ({wishlist.length})
                </h2>
              </div>
              <button
                onClick={() => setWishlistOpen(false)}
                className="p-2 rounded-lg hover:bg-[#1f2433] transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {wishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center px-4">
                  <Heart className="w-16 h-16 mb-4 opacity-20 text-red-500" />
                  <p className="text-lg font-['Rajdhani'] text-gray-400">Tu lista de deseos está vacía</p>
                  <p className="text-xs mt-1 font-['Inter'] text-gray-600 mb-6">
                    Guarda los Karambits que quieras coleccionar haciendo clic en el corazón
                  </p>
                  <Link
                    to="/shop"
                    onClick={() => setWishlistOpen(false)}
                    className="px-6 py-2.5 rounded-xl font-bold text-black uppercase tracking-wider font-['Rajdhani'] text-sm"
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
                      <KarambitSVG gradient={item.gradient} size={48} animate={false} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate font-['Rajdhani']">
                        {item.name}
                      </p>
                      <p className="text-[#f59e0b] font-bold text-sm font-['Rajdhani']">
                        {item.price.toFixed(2)}€
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#1f2433] hover:bg-[#2a3144] text-[#f59e0b] hover:text-white transition-colors text-xs font-['Rajdhani'] font-bold flex items-center gap-1"
                        title="Mover al Carrito"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Comprar
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
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
              <div className="p-6 border-t border-[#1f2433] space-y-3">
                <button
                  onClick={handleMoveAllToCart}
                  className="w-full py-3 rounded-xl font-bold text-black uppercase tracking-wider font-['Rajdhani'] text-base transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
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
                  className="w-full py-2 rounded-xl text-gray-500 hover:text-red-400 text-xs font-['Rajdhani'] uppercase tracking-wider transition-colors"
                >
                  Vaciar Lista de Deseos
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
