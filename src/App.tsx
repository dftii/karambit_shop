import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import { Toaster } from './components/ui/Toaster';
import Footer from './components/Footer';
import { buttonClasses } from './components/ui/buttonStyles';

// Páginas con carga diferida (un chunk por ruta).
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const PacksPage = lazy(() => import('./pages/PacksPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const FoundersVaultPage = lazy(() => import('./pages/FoundersVaultPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Modal global, también diferido (siempre montado para poder animar la salida).
const ProductDetailModal = lazy(() => import('./components/ProductDetailModal'));

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col justify-center bg-paper text-ink">
          <div className="wrap w-full py-16">
            <p className="eyebrow">Error inesperado</p>
            <h1 className="display-xl mt-4 max-w-3xl">
              Algo ha fallado al cargar la <span className="serif-accent">interfaz</span>.
            </h1>
            <p className="mt-6 max-w-xl break-words border-l border-pink pl-4 font-mono text-xs leading-relaxed text-ink-2">
              {this.state.error?.message || 'Se produjo un error inesperado al renderizar el componente.'}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('krm-shop-storage');
                  window.location.href = '/';
                }}
                className={buttonClasses({ variant: 'primary', size: 'lg' })}
              >
                Restablecer datos locales
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className={buttonClasses({ variant: 'link', size: 'md' })}
              >
                Recargar la página
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Fallback de Suspense mientras se descarga el chunk de una ruta. Estático (sin spinners ni pulsos). */
const RouteLoader: React.FC = () => (
  <main
    id="main"
    tabIndex={-1}
    role="status"
    aria-live="polite"
    className="wrap flex min-h-[70vh] items-center outline-none"
  >
    <p className="eyebrow">Cargando&hellip;</p>
  </main>
);

/**
 * Al cambiar de ruta (pathname) vuelve arriba. Con #ancla desplaza hasta el elemento en cuanto exista
 * (las páginas son lazy, así que se reintenta unos instantes).
 */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let timer = 0;
    const seek = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ block: 'start' });
      else if (tries++ < 20) timer = window.setTimeout(seek, 50);
    };
    seek();
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);
  return null;
};

function App() {
  return (
    <ErrorBoundary>
      {/* reducedMotion="user": las animaciones de framer-motion respetan prefers-reduced-motion. */}
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-paper text-ink">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:border focus:border-ink focus:bg-ink focus:px-4 focus:py-2.5 focus:font-body focus:text-sm focus:font-medium focus:text-paper"
            >
              Saltar al contenido
            </a>
            <Navbar />
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/founders-vault" element={<FoundersVaultPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />

                {/* Rutas canónicas (las del Navbar) y sus alias */}
                <Route path="/bundles" element={<PacksPage />} />
                <Route path="/packs" element={<Navigate to="/bundles" replace />} />

                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            <Footer />

            {/* Global Drawers & Modals */}
            <CartDrawer />
            <WishlistDrawer />
            <Suspense fallback={null}>
              <ProductDetailModal />
            </Suspense>
            <Toaster />
          </div>
        </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
