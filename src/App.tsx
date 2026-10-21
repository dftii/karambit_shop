import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import { Toaster } from './components/ui/Toaster';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Páginas con carga diferida (un chunk por ruta).
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const MysteryPage = lazy(() => import('./pages/MysteryPage'));
const PacksPage = lazy(() => import('./pages/PacksPage'));
const StatTrakPage = lazy(() => import('./pages/StatTrakPage'));
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
        <div className="min-h-screen bg-krm-bg text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black font-display uppercase tracking-tight text-white mb-2">
            Error al cargar la interfaz
          </h1>
          <p className="text-gray-400 text-sm max-w-md font-body mb-6">
            {this.state.error?.message || 'Se produjo un error inesperado al renderizar el componente.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                localStorage.removeItem('krm-shop-storage');
                window.location.href = '/';
              }}
              className="px-6 py-2.5 rounded-xl font-bold font-display uppercase tracking-wider text-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Restablecer Arsenal
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl font-bold font-display uppercase tracking-wider text-gray-300 bg-krm-border hover:bg-krm-hover text-sm"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Fallback de Suspense mientras se descarga el chunk de una ruta. Sin animación si prefers-reduced-motion. */
const RouteLoader: React.FC = () => (
  <main
    id="main"
    tabIndex={-1}
    role="status"
    aria-live="polite"
    className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center"
  >
    <div className="relative w-14 h-14">
      <div className="absolute inset-0 rounded-full border-2 border-krm-border" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-krm-accent motion-safe:animate-spin" />
      <div className="absolute inset-[18px] rounded-full bg-krm-accent/80 shadow-[0_0_18px_#f59e0b] motion-safe:animate-pulse" />
    </div>
    <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-krm-accent">Cargando arsenal...</p>
  </main>
);

/** Al cambiar de ruta (pathname) vuelve arriba. Los enlaces con #ancla conservan su scroll nativo. */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
          <div className="min-h-screen text-gray-200 bg-krm-bg">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-krm-accent focus:px-4 focus:py-2.5 focus:font-display focus:text-sm focus:font-bold focus:uppercase focus:tracking-wider focus:text-black"
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
                <Route path="/mystery-boxes" element={<MysteryPage />} />
                <Route path="/mystery" element={<Navigate to="/mystery-boxes" replace />} />
                <Route path="/bundles" element={<PacksPage />} />
                <Route path="/packs" element={<Navigate to="/bundles" replace />} />
                <Route path="/stattrak-lab" element={<StatTrakPage />} />
                <Route path="/stattrak" element={<Navigate to="/stattrak-lab" replace />} />
                <Route path="/customization" element={<Navigate to="/stattrak-lab" replace />} />

                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>

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
