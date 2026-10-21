import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import { MysteryPage, PacksPage, StatTrakPage } from './pages/ComingSoonPages';
import CartDrawer from './components/CartDrawer';
import ProductDetailModal from './components/ProductDetailModal';
import WishlistDrawer from './components/WishlistDrawer';
import CheckoutModal from './components/CheckoutModal';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
        <div className="min-h-screen bg-[#090a0f] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black font-['Rajdhani'] uppercase tracking-tight text-white mb-2">
            Error al cargar la interfaz
          </h1>
          <p className="text-gray-400 text-sm max-w-md font-['Inter'] mb-6">
            {this.state.error?.message || 'Se produjo un error inesperado al renderizar el componente.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                localStorage.removeItem('krm-shop-storage');
                window.location.href = '/';
              }}
              className="px-6 py-2.5 rounded-xl font-bold font-['Rajdhani'] uppercase tracking-wider text-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Restablecer Arsenal
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl font-bold font-['Rajdhani'] uppercase tracking-wider text-gray-300 bg-[#1f2433] hover:bg-[#2a3144] text-sm"
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

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen text-gray-200" style={{ background: '#090a0f' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/mystery" element={<MysteryPage />} />
            <Route path="/mystery-boxes" element={<MysteryPage />} />
            <Route path="/packs" element={<PacksPage />} />
            <Route path="/bundles" element={<PacksPage />} />
            <Route path="/stattrak" element={<StatTrakPage />} />
            <Route path="/stattrak-lab" element={<StatTrakPage />} />
            <Route path="/customization" element={<StatTrakPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:id" element={<OrderSuccessPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>

          {/* Global Drawers & Modals */}
          <CartDrawer />
          <WishlistDrawer />
          <ProductDetailModal />
          <CheckoutModal />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
