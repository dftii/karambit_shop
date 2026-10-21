import { hideBrokenImage } from '../lib/imageFallback';
import React, { useState, useEffect } from 'react';
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
  Crown,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useStore, useCartCount } from '../store/useStore';
import { karambits, type Product } from '../data/karambits';
import { Modal } from './ui/Modal';

// ─── Search Modal ──────────────────────────────────────
// Contenido del buscador: se monta al abrir (la búsqueda empieza vacía cada vez).
const SearchPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

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
    <>
      <div className="flex items-center gap-3 p-4 border-b border-krm-border">
        <Search className="w-5 h-5 text-gray-400" aria-hidden="true" />
        <input
          data-autofocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por skin (Ruby, Fade, Lore...), categoría o rareza..."
          aria-label="Buscar karambits"
          className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg font-display"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1 rounded-lg hover:bg-krm-border text-gray-400"
            aria-label="Borrar búsqueda"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {query.length < 2 ? (
          <div className="p-8 text-center text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" aria-hidden="true" />
            <p className="font-body text-sm">Escribe al menos 2 caracteres para buscar en el arsenal</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="font-body">No se encontraron réplicas para "{query}"</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {results.map((product) => (
              <div
                key={product.id}
                role="link"
                tabIndex={0}
                onClick={() => handleSelectProduct(product)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSelectProduct(product);
                }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-krm-border transition-colors group cursor-pointer"
              >
                <div className="w-14 h-14 shrink-0 flex items-center justify-center p-1 rounded-lg bg-krm-bg-deep">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    onError={hideBrokenImage}
                    className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(245,158,11,0.2)]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate group-hover:text-krm-accent transition-colors font-display text-lg">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400 font-body">
                    {product.category} · {product.rarity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-krm-accent font-bold font-display text-lg">{product.basePrice.toFixed(2)}€</p>
                  <span className="text-[10px] text-gray-500 uppercase font-display">Personalizar</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-krm-border bg-[#0d0f17] flex justify-between items-center text-xs text-gray-500 font-body">
        <span>Presiona ESC para cerrar</span>
        <span>{results.length} resultados encontrados</span>
      </div>
    </>
  );
};

/** Buscador sobre el shell común Modal (Escape, trampa de foco, bloqueo de scroll, foco restaurado). */
const SearchModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <Modal
    open={open}
    onClose={onClose}
    ariaLabel="Buscar en el arsenal"
    size="md"
    zIndex={110}
    panelClassName="overflow-hidden rounded-2xl shadow-2xl"
    panelStyle={{ background: '#12141d', border: '1px solid #1f2433' }}
  >
    <SearchPanel onClose={onClose} />
  </Modal>
);

// ─── Navbar ────────────────────────────────────────────
export const Navbar: React.FC = () => {
  const location = useLocation();
  const { wishlist, setCartOpen, setWishlistOpen, isSearchOpen, setSearchOpen } = useStore(
    useShallow((s) => ({
      wishlist: s.wishlist,
      setCartOpen: s.setCartOpen,
      setWishlistOpen: s.setWishlistOpen,
      isSearchOpen: s.isSearchOpen,
      setSearchOpen: s.setSearchOpen,
    }))
  );
  const cartCount = useCartCount();
  // El menú móvil se asocia a la navegación en la que se abrió: al cambiar de ruta se cierra solo (sin efecto).
  const [mobileMenuKey, setMobileMenuKey] = useState<string | null>(null);
  const mobileOpen = mobileMenuKey === location.key;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/shop', label: 'Catálogo', icon: <Package className="w-4 h-4" /> },
    { to: '/founders-vault', label: "Founder's Vault", icon: <Crown className="w-4 h-4" /> },
    { to: '/mystery-boxes', label: 'Mystery Boxes', icon: <Gift className="w-4 h-4" /> },
    { to: '/bundles', label: 'Packs Coleccionista', icon: <Sparkles className="w-4 h-4" /> },
    { to: '/stattrak-lab', label: 'StatTrak™ Lab', icon: <Crosshair className="w-4 h-4" /> },
    { to: '/orders', label: 'Mis Pedidos', icon: <Package className="w-4 h-4" /> },
  ];

  // Los alias (/mystery, /packs, /stattrak, /customization) redirigen a las rutas canónicas de App.
  const isLinkActive = (to: string) => location.pathname === to;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 w-full ${
          scrolled
            ? 'bg-krm-bg/95 backdrop-blur-md border-b border-krm-border shadow-lg shadow-black/40'
            : 'bg-krm-bg border-b border-krm-border/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between h-20 gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-krm-accent to-krm-accent-dark flex items-center justify-center font-black text-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform font-display">
                K
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-wider text-white font-display group-hover:text-krm-accent transition-colors leading-none">
                  KRM<span className="text-krm-accent">.GG</span>
                </span>
                <span className="text-[10px] text-gray-400 tracking-widest uppercase font-display font-semibold mt-0.5">
                  Karambit Shop
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 font-display tracking-wide uppercase ${
                      isActive
                        ? 'text-krm-accent bg-krm-accent/10 border border-krm-accent/20'
                        : 'text-gray-400 hover:text-white hover:bg-krm-border/50'
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
                className="p-2.5 rounded-xl hover:bg-krm-border transition-colors text-gray-400 hover:text-white relative group"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" aria-hidden="true" />
                <span className="sr-only">Buscar</span>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setWishlistOpen(true)}
                className="p-2.5 rounded-xl hover:bg-krm-border transition-colors text-gray-400 hover:text-white relative"
                aria-label="Lista de deseos"
              >
                <Heart className="w-5 h-5" aria-hidden="true" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center font-display">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-300 relative group font-display"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.15))',
                  border: '1px solid rgba(245,158,11,0.3)',
                }}
                aria-label="Carrito"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-krm-accent" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-krm-accent text-black text-[10px] font-black flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-white">
                  Arsenal
                </span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuKey(mobileOpen ? null : location.key)}
                className="xl:hidden p-2.5 rounded-xl hover:bg-krm-border transition-colors text-gray-400"
                aria-label="Menú móvil"
                aria-expanded={mobileOpen}
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
                className="xl:hidden overflow-hidden"
              >
                <div className="py-3 space-y-1 border-t border-krm-border mt-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      aria-current={isLinkActive(link.to) ? 'page' : undefined}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors font-display uppercase tracking-wider ${
                        isLinkActive(link.to)
                          ? 'text-krm-accent bg-krm-accent/10'
                          : 'text-gray-400 hover:text-white hover:bg-krm-border'
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
      <SearchModal open={isSearchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
