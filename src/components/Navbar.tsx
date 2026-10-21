import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingCart,
  Menu,
  X,
  Package,
  Sparkles,
  Gift,
  Crosshair,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { karambits, type Product } from '../data/karambits';

// ─── Search Modal ──────────────────────────────────────
const SearchModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const results =
    query.length >= 2
      ? karambits.filter(
          (k) =>
            k.name.toLowerCase().includes(query.toLowerCase()) ||
            k.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
            k.category.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  const handleSelectProduct = (product: Product) => {
    onClose();
    navigate(`/product/${product.slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#12141d', border: '1px solid #1f2433' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-[#1f2433]">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por skin (Ruby, Fade, Lore...), categoría o rareza..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg font-['Rajdhani']"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-[#1f2433] text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-['Inter'] text-sm">
                Escribe al menos 2 caracteres para buscar en el arsenal
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="font-['Inter']">No se encontraron réplicas para "{query}"</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#1f2433] transition-colors group cursor-pointer"
                >
                  <div className="w-14 h-14 shrink-0 flex items-center justify-center p-1 rounded-lg bg-[#0a0c13]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(245,158,11,0.2)]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate group-hover:text-[#f59e0b] transition-colors font-['Rajdhani'] text-lg">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400 font-['Inter']">
                      {product.category} · {product.rarity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#f59e0b] font-bold font-['Rajdhani'] text-lg">
                      {product.basePrice.toFixed(2)}€
                    </p>
                    <span className="text-[10px] text-gray-500 uppercase font-['Rajdhani']">
                      Personalizar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#1f2433] bg-[#0d0f17] flex justify-between items-center text-xs text-gray-500 font-['Inter']">
          <span>Presiona ESC para cerrar</span>
          <span>{results.length} resultados encontrados</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Navbar ────────────────────────────────────────────
export const Navbar: React.FC = () => {
  const location = useLocation();
  const {
    wishlist,
    getCartCount,
    setCartOpen,
    setWishlistOpen,
    isSearchOpen,
    setSearchOpen,
  } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/shop', label: 'Catálogo', icon: <Package className="w-4 h-4" /> },
    { to: '/mystery-boxes', label: 'Mystery Boxes', icon: <Gift className="w-4 h-4" /> },
    { to: '/bundles', label: 'Packs Coleccionista', icon: <Sparkles className="w-4 h-4" /> },
    { to: '/stattrak-lab', label: 'StatTrak™ Lab', icon: <Crosshair className="w-4 h-4" /> },
    { to: '/orders', label: 'Mis Pedidos', icon: <Package className="w-4 h-4" /> },
  ];

  const isLinkActive = (to: string) => {
    if (to === '/mystery-boxes') return location.pathname === '/mystery-boxes' || location.pathname === '/mystery';
    if (to === '/bundles') return location.pathname === '/bundles' || location.pathname === '/packs';
    if (to === '/stattrak-lab') return location.pathname === '/stattrak-lab' || location.pathname === '/stattrak' || location.pathname === '/customization';
    return location.pathname === to;
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 w-full ${
          scrolled
            ? 'bg-[#090a0f]/95 backdrop-blur-md border-b border-[#1f2433] shadow-lg shadow-black/40'
            : 'bg-[#090a0f] border-b border-[#1f2433]/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center font-black text-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform font-['Rajdhani']">
                K
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-wider text-white font-['Rajdhani'] group-hover:text-[#f59e0b] transition-colors leading-none">
                  KRM<span className="text-[#f59e0b]">.GG</span>
                </span>
                <span className="text-[10px] text-gray-400 tracking-widest uppercase font-['Rajdhani'] font-semibold mt-0.5">
                  Karambit Shop
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 font-['Rajdhani'] tracking-wide uppercase ${
                      isActive
                        ? 'text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20'
                        : 'text-gray-400 hover:text-white hover:bg-[#1f2433]/50'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-xl hover:bg-[#1f2433] transition-colors text-gray-400 hover:text-white relative group"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
                <span className="sr-only">Buscar</span>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setWishlistOpen(true)}
                className="p-2.5 rounded-xl hover:bg-[#1f2433] transition-colors text-gray-400 hover:text-white relative"
                aria-label="Lista de deseos"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center font-['Rajdhani']">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-300 relative group font-['Rajdhani']"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.15))',
                  border: '1px solid rgba(245,158,11,0.3)',
                }}
                aria-label="Carrito"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-[#f59e0b]" />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#f59e0b] text-black text-[10px] font-black flex items-center justify-center">
                      {getCartCount()}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-white">
                  Arsenal
                </span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-[#1f2433] transition-colors text-gray-400"
                aria-label="Menú móvil"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="py-3 space-y-1 border-t border-[#1f2433] mt-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors font-['Rajdhani'] uppercase tracking-wider ${
                        isLinkActive(link.to)
                          ? 'text-[#f59e0b] bg-[#f59e0b]/10'
                          : 'text-gray-400 hover:text-white hover:bg-[#1f2433]'
                      }`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Modals & Drawers */}
      <AnimatePresence>
        {isSearchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
