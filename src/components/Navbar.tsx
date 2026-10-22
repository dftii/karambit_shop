import { hideBrokenImage } from '../lib/imageFallback';
import React, { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, Heart, ShoppingBag, X, ArrowUpRight } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useStore, useCartCount } from '../store/useStore';
import { karambits, rarityColors, type Product } from '../data/karambits';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { Price } from './ui/Price';
import { useOverlay } from './ui/useOverlay';
import { Wordmark } from './Wordmark';

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
      <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
        <Search className="h-5 w-5 shrink-0 text-ink-3" aria-hidden="true" />
        <input
          data-autofocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar skin, categoría o rareza"
          aria-label="Buscar karambits"
          className="min-w-0 flex-1 bg-transparent font-display text-xl tracking-tight text-ink outline-none placeholder:text-ink-3"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1 text-ink-3 transition-colors hover:text-ink"
            aria-label="Borrar búsqueda"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="max-h-[26rem] overflow-y-auto">
        {query.length < 2 ? (
          <p className="px-4 py-10 text-center font-body text-sm text-ink-3">
            Escribe al menos 2 caracteres para buscar en el catálogo.
          </p>
        ) : results.length === 0 ? (
          <p className="px-4 py-10 text-center font-body text-sm text-ink-2">
            Sin resultados para &laquo;{query}&raquo;.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {results.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  className="group flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-tile"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-tile p-1.5 group-hover:bg-paper">
                    <img
                      src={product.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={hideBrokenImage}
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-body text-[15px] font-medium text-ink group-hover:underline group-hover:decoration-pink group-hover:decoration-1 group-hover:underline-offset-4">
                      {product.name}
                    </span>
                    <Badge color={rarityColors[product.rarity]} className="mt-1.5">
                      {product.rarity}
                    </Badge>
                  </span>
                  <Price value={product.basePrice} size="sm" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
        <span className="eyebrow">Esc para cerrar</span>
        <span className="eyebrow">{results.length} resultados</span>
      </div>
    </>
  );
};

/** Buscador sobre el shell común Modal (Escape, trampa de foco, bloqueo de scroll, foco restaurado). */
const SearchModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} ariaLabel="Buscar en el catálogo" size="md" zIndex={110} panelClassName="overflow-hidden">
    <SearchPanel onClose={onClose} />
  </Modal>
);

// ─── Navegación ────────────────────────────────────────
const NAV_LINKS = [
  { to: '/shop', label: 'Catálogo' },
  { to: '/founders-vault', label: "Founder's Vault" },
  { to: '/bundles', label: 'Packs' },
  { to: '/orders', label: 'Mis pedidos' },
];

/** Celda cuadrada de la barra de acciones, separada por una regla de 1px. */
const cellClass =
  'flex h-16 items-center gap-2 border-l border-line px-3.5 text-ink transition-colors hover:bg-tile sm:px-4';

const pad2 = (n: number) => String(n).padStart(2, '0');

// ─── Navbar ────────────────────────────────────────────
export const Navbar: React.FC = () => {
  const location = useLocation();
  const reduced = useReducedMotion() ?? false;
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
  const closeMobile = () => setMobileMenuKey(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useOverlay(mobileOpen, menuRef, closeMobile);

  // El alias /packs redirige a /bundles (ruta canónica en App).
  const isLinkActive = (to: string) => location.pathname === to;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-paper">
        <nav aria-label="Principal" className="wrap">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" aria-label="KRM—GG, inicio" className="shrink-0 text-[22px] sm:text-2xl">
              <Wordmark />
            </Link>

            {/* Desktop */}
            <ul className="hidden items-center gap-9 lg:flex">
              {NAV_LINKS.map((link) => {
                const active = isLinkActive(link.to);
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      aria-current={active ? 'page' : undefined}
                      className={`whitespace-nowrap py-1 font-body text-sm underline-offset-[10px] decoration-1 transition-colors hover:text-ink hover:underline hover:decoration-pink ${
                        active ? 'text-ink underline decoration-pink' : 'text-ink-2'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Acciones */}
            <div className="-mr-4 flex items-center sm:-mr-6 lg:-mr-8">
              <button type="button" onClick={() => setSearchOpen(true)} className={cellClass} aria-label="Buscar">
                <Search className="h-[18px] w-[18px]" aria-hidden="true" />
                <span className="hidden font-body text-sm md:inline">Buscar</span>
              </button>

              <button
                type="button"
                onClick={() => setWishlistOpen(true)}
                className={cellClass}
                aria-label={`Lista de deseos${wishlist.length ? `, ${wishlist.length}` : ''}`}
              >
                <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
                {wishlist.length > 0 && <span className="font-mono text-xs tabular-nums">{pad2(wishlist.length)}</span>}
              </button>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className={cellClass}
                aria-label={`Carrito${cartCount ? `, ${cartCount} artículos` : ''}`}
              >
                <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
                <span className="hidden font-body text-sm md:inline">Carrito</span>
                <span className={`font-mono text-xs tabular-nums ${cartCount > 0 ? 'text-pink-ink' : 'text-ink-3'}`}>
                  {pad2(cartCount)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuKey(mobileOpen ? null : location.key)}
                className={`${cellClass} font-body text-sm lg:hidden`}
                aria-label="Abrir menú"
                aria-expanded={mobileOpen}
                aria-controls="menu-movil"
              >
                Menú
              </button>
            </div>
          </div>
        </nav>

        {/* Menú móvil: pantalla completa en papel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="menu"
              ref={menuRef}
              id="menu-movil"
              role="dialog"
              aria-modal="true"
              aria-label="Menú"
              tabIndex={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
              className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-paper outline-none lg:hidden"
            >
              <div className="wrap flex h-16 shrink-0 items-center justify-between border-b border-line">
                <Link to="/" onClick={closeMobile} aria-label="KRM—GG, inicio" className="text-[22px]">
                  <Wordmark />
                </Link>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="-mr-4 flex h-16 items-center gap-2 border-l border-line px-4 font-body text-sm sm:-mr-6"
                  aria-label="Cerrar menú"
                >
                  Cerrar
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <ul className="wrap flex-1 py-4">
                {NAV_LINKS.map((link, i) => {
                  const active = isLinkActive(link.to);
                  return (
                    <li key={link.to} className="border-b border-line">
                      <Link
                        to={link.to}
                        onClick={closeMobile}
                        aria-current={active ? 'page' : undefined}
                        className="group flex items-baseline gap-4 py-5"
                      >
                        <span className="eyebrow w-6 shrink-0">{pad2(i + 1)}</span>
                        <span
                          className={`display-lg flex-1 group-hover:text-pink-ink ${active ? 'text-pink-ink' : 'text-ink'}`}
                        >
                          {link.label}
                        </span>
                        <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-3 group-hover:text-pink" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <p className="wrap eyebrow shrink-0 pb-6">Pasarela simulada · Proyecto fan-made</p>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchModal open={isSearchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
