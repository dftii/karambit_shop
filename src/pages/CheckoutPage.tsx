import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCw,
  QrCode,
  Flame,
  ShoppingCart,
  Coins,
  ArrowRight,
  Gift,
  X,
  Smartphone,
} from 'lucide-react';
import { useStore, type CartItem, type Order } from '../store/useStore';
import { karambits } from '../data/karambits';

type PaymentMethodType = 'credit_card' | 'bizum_apple_pay' | 'crypto' | 'steam_skins';
type SimulationMode = 'success' | 'failure';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    clearCart,
    getCartSubtotal,
    getDiscountAmount,
    getFinalTotal,
    activeCoupon,
    applyCouponCode,
    removeCoupon,
    addOrder,
  } = useStore();

  // ── Identification (Minimal: Alias + Email only) ───────
  const [collectorAlias, setCollectorAlias] = useState('GhostCS2');
  const [email, setEmail] = useState('collector@cs2pro.gg');

  // ── Simulation Testing Toggle ──────────────────────────
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('success');

  // ── Payment Method Selected ────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('credit_card');

  // ── Card State & 3D Flip ───────────────────────────────
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 8891');
  const [cardHolder, setCardHolder] = useState('PRO COLLECTOR');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('777');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // ── Bizum / Apple Pay State ────────────────────────────
  const [bizumPhone, setBizumPhone] = useState('600 440 220');

  // ── Crypto State ───────────────────────────────────────
  const [cryptoCurrency, setCryptoCurrency] = useState<'USDT' | 'ETH' | 'BTC'>('USDT');
  const [copiedWallet, setCopiedWallet] = useState(false);
  const cryptoAddress = '0x71C28B5947a5b3aE27A81283DeF919C02941KRM9';

  // ── Steam Skins State ──────────────────────────────────
  const steamAccount = {
    username: 'Ghost_Clutch_CS2',
    steamId: '76561198842109845',
    inventoryBalance: 320.5,
  };

  // ── Coupon State ───────────────────────────────────────
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: '',
  });

  // ── Processing Overlay State ───────────────────────────
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Price calculations
  const subtotal = getCartSubtotal();
  const discountAmount = getDiscountAmount();
  const finalTotal = getFinalTotal();
  const giftUnlocked = subtotal >= 75.0;

  // Autocomplete test card button handler
  const handleAutocompleteTestCard = () => {
    setCardNumber('4532 8901 2345 8891');
    setCardHolder('PRO COLLECTOR');
    setCardExpiry('12/29');
    setCardCvv('777');
    setIsCardFlipped(false);
  };

  // Coupon application handler
  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) return;
    const res = applyCouponCode(couponCodeInput);
    if (res.success) {
      setCouponMsg({ type: 'success', text: res.message });
      setCouponCodeInput('');
    } else {
      setCouponMsg({ type: 'error', text: res.message });
    }
  };

  // Crypto copy address handler
  const handleCopyCrypto = () => {
    navigator.clipboard.writeText(cryptoAddress);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  // Helper for real PNG image lookup
  const getItemImage = (item: CartItem) => {
    const baseId = item.productId || item.id.split('-')[0];
    const found = karambits.find(
      (k) =>
        k.id === baseId ||
        item.id.includes(k.id) ||
        (item.name &&
          item.name.toLowerCase().includes(k.name.replace('Karambit | ', '').toLowerCase()))
    );
    if (found?.image) return found.image;
    if (item.image && item.image.startsWith('http')) return item.image;
    return karambits[0].image;
  };

  const getItemFilter = (item: CartItem) => {
    if (item.visualFilter) return item.visualFilter;
    const baseId = item.productId || item.id.split('-')[0];
    const found = karambits.find((k) => k.id === baseId || item.id.startsWith(k.id));
    return found?.visualFilter || undefined;
  };

  // ── Start Checkout Payment Flow ─────────────────────────
  const handleStartPayment = () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    setProcessingStep(1);
    setProcessingError(null);

    // Step 1: Connecting with encrypted SSL (0.8s)
    setTimeout(() => {
      setProcessingStep(2);

      // Step 2: Verifying funds (0.9s)
      setTimeout(() => {
        if (simulationMode === 'failure') {
          setProcessingError(
            'Error Bancario Simulado: Fondos insuficientes o transacción rechazada por la entidad emisora (Código: REF-501-DECLINED). Cambia a "Simular Pago Exitoso" en la barra de control para completar la compra.'
          );
          return;
        }

        setProcessingStep(3);

        // Step 3: Engraving StatTrak & NameTag in workshop (0.9s)
        setTimeout(() => {
          setProcessingStep(4);

          // Step 4: Final verification & Certificate generation (0.9s)
          setTimeout(() => {
            // Generate unique serial numbers for each knife
            const serialNumbers: Record<string, string> = {};
            cart.forEach((item, index) => {
              const key = item.id || `item-${index}`;
              serialNumbers[key] = `SN-440C-${Math.floor(1000 + Math.random() * 9000)}`;
            });

            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const orderId = `KRM-2026-${randomSuffix}`;

            const newOrder: Order = {
              id: orderId,
              date: new Date().toISOString(),
              collectorAlias: collectorAlias.trim() || 'GhostCS2',
              email: email.trim() || 'collector@cs2pro.gg',
              items: [...cart],
              subtotal,
              discount: discountAmount,
              couponApplied: activeCoupon?.code,
              total: finalTotal,
              status: 'Verificado & Grabado',
              paymentMethod,
              paymentDetails: {
                cardLast4: paymentMethod === 'credit_card' ? cardNumber.slice(-4) || '8891' : undefined,
                cardHolder: paymentMethod === 'credit_card' ? cardHolder : undefined,
                bizumPhone: paymentMethod === 'bizum_apple_pay' ? bizumPhone : undefined,
                cryptoCurrency: paymentMethod === 'crypto' ? cryptoCurrency : undefined,
                cryptoTx:
                  paymentMethod === 'crypto'
                    ? `0x${Math.random().toString(16).substring(2, 14)}...`
                    : undefined,
                skinsTraded:
                  paymentMethod === 'steam_skins'
                    ? ['AK-47 | Redline (Field-Tested)', 'AWP | Asiimov (Well-Worn)']
                    : undefined,
              },
              serialNumbers,
              digitalCertificateId: `CERT-KRM-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            };

            addOrder(newOrder);
            clearCart();
            setIsProcessing(false);
            navigate(`/order-success/${newOrder.id}`);
          }, 900);
        }, 900);
      }, 900);
    }, 800);
  };

  // Crypto conversion rate
  const getCryptoAmount = () => {
    if (cryptoCurrency === 'USDT') return `${finalTotal.toFixed(2)} USDT`;
    if (cryptoCurrency === 'ETH') return `${(finalTotal / 2850).toFixed(4)} ETH`;
    return `${(finalTotal / 64200).toFixed(6)} BTC`;
  };

  if (cart.length === 0 && !isProcessing) {
    return (
      <main className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-6 w-full text-gray-200">
        <div className="text-center py-20 bg-[#0e1017] rounded-3xl border border-[#1f2433] p-8 max-w-2xl mx-auto shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black font-['Rajdhani'] uppercase text-white mb-2">
            Tu Arsenal Digital está Vacío
          </h1>
          <p className="text-gray-400 text-sm font-['Inter'] mb-6 max-w-md mx-auto">
            Añade al menos un Karambit réplica 1:1, Mystery Box o Pack Coleccionista antes de tramitar el pedido.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/shop"
              className="px-6 py-3 rounded-xl font-black font-['Rajdhani'] uppercase tracking-wider text-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-amber-500/25"
            >
              Explorar Catálogo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/orders"
              className="px-6 py-3 rounded-xl font-bold font-['Rajdhani'] uppercase tracking-wider text-gray-300 bg-[#161a26] border border-[#232b40] hover:text-white text-sm"
            >
              Ver Mis Pedidos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-6 w-full text-gray-200">
      {/* ══════════ TOP HEADER ══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-left"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-black font-['Rajdhani'] text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/25">
            PASARELA DE PAGO 100% SIMULADA & SEGURA
          </span>
          <span className="text-xs text-gray-400 font-['Inter'] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cero Envíos Físicos
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-['Rajdhani'] uppercase tracking-tight">
          Tramitar <span className="text-[#f59e0b]">Pedido & Arsenal</span>
        </h1>
        <p className="mt-1 text-gray-400 font-['Inter'] text-sm">
          Personalización en taller, emisión de certificado de autenticidad digital y número de serie único.
        </p>
      </motion.div>

      {/* ══════════ SIMULATION TESTING TOGGLE BAR ══════════ */}
      <div className="mb-8 p-4 rounded-2xl bg-[#10131d] border border-[#232a3d] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          <div>
            <span className="text-xs font-black uppercase tracking-wider font-['Rajdhani'] text-white block">
              Entorno de Pruebas Sandbox KRM
            </span>
            <span className="text-[11px] text-gray-400 font-['Inter']">
              Elige el comportamiento que deseas simular para esta transacción:
            </span>
          </div>
        </div>

        <div className="flex items-center bg-[#07090e] p-1 rounded-xl border border-[#1b2234]">
          <button
            type="button"
            onClick={() => setSimulationMode('success')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-['Rajdhani'] uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              simulationMode === 'success'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            ✅ Simular Pago Exitoso
          </button>
          <button
            type="button"
            onClick={() => setSimulationMode('failure')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-['Rajdhani'] uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              simulationMode === 'failure'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            ❌ Simular Error: Fondos Insuficientes
          </button>
        </div>
      </div>

      {/* ══════════ 2-COLUMN CHECKOUT MAIN GRID ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── LEFT COLUMN: Identification + 4 Payment Methods (7 cols) ─── */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Identification Box (Strict Minimal: Alias + Email Only) */}
          <div className="p-6 rounded-3xl bg-[#0e1017] border border-[#1f2433] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1f2433] pb-3">
              <h3 className="text-lg font-black text-white font-['Rajdhani'] uppercase flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                  1
                </span>
                Identificación de Coleccionista
              </h3>
              <span className="text-[11px] text-gray-500 font-['Inter']">
                Sin datos de envío postal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-400 font-['Rajdhani'] block mb-1.5">
                  Alias de Coleccionista (CS2 Tag)
                </label>
                <input
                  type="text"
                  value={collectorAlias}
                  onChange={(e) => setCollectorAlias(e.target.value)}
                  placeholder="Ej: GhostCS2"
                  className="w-full bg-[#12141e] border border-[#232b40] focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm font-['Rajdhani'] font-bold text-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-400 font-['Rajdhani'] block mb-1.5">
                  Email para Certificado Digital
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collector@cs2pro.gg"
                  className="w-full bg-[#12141e] border border-[#232b40] focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm font-['Inter'] text-white outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Tabs & Interfaces */}
          <div className="p-6 rounded-3xl bg-[#0e1017] border border-[#1f2433] space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1f2433] pb-3">
              <h3 className="text-lg font-black text-white font-['Rajdhani'] uppercase flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                  2
                </span>
                Método de Pago Simulado
              </h3>
              <span className="text-xs text-amber-400 font-mono font-bold">100% Sin Coste Real</span>
            </div>

            {/* 4 Tabs Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-[#12141e] border-[#1f2433] text-gray-400 hover:border-gray-600'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1.5 text-amber-400" />
                <span className="text-xs font-black font-['Rajdhani'] uppercase block leading-tight">
                  Tarjeta 3D
                </span>
                <span className="text-[10px] text-gray-500">Giro Dinámico</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bizum_apple_pay')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'bizum_apple_pay'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-[#12141e] border-[#1f2433] text-gray-400 hover:border-gray-600'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1.5 text-emerald-400" />
                <span className="text-xs font-black font-['Rajdhani'] uppercase block leading-tight">
                  Bizum / Pay
                </span>
                <span className="text-[10px] text-gray-500">1-Clic Móvil</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('crypto')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'crypto'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-[#12141e] border-[#1f2433] text-gray-400 hover:border-gray-600'
                }`}
              >
                <Coins className="w-5 h-5 mx-auto mb-1.5 text-blue-400" />
                <span className="text-xs font-black font-['Rajdhani'] uppercase block leading-tight">
                  Crypto Web3
                </span>
                <span className="text-[10px] text-gray-500">USDT / ETH / BTC</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('steam_skins')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'steam_skins'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-[#12141e] border-[#1f2433] text-gray-400 hover:border-gray-600'
                }`}
              >
                <Flame className="w-5 h-5 mx-auto mb-1.5 text-purple-400" />
                <span className="text-xs font-black font-['Rajdhani'] uppercase block leading-tight">
                  Steam Skins
                </span>
                <span className="text-[10px] text-gray-500">Trade CS2 Bot</span>
              </button>
            </div>

            {/* ─── OPTION A: 3D INTERACTIVE CARD ─── */}
            {paymentMethod === 'credit_card' && (
              <div className="space-y-6 pt-2">
                {/* 3D Flip Card Container */}
                <div
                  className="w-full max-w-sm mx-auto h-52 relative select-none"
                  style={{ perspective: '1000px' }}
                >
                  <div
                    className="w-full h-full relative transition-transform duration-700 ease-in-out"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* Front Face */}
                    <div
                      className="absolute inset-0 rounded-2xl p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        background:
                          'linear-gradient(135deg, #181c2b 0%, #0d0f17 50%, #1e1b12 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245,158,11,0.15)',
                      }}
                    >
                      {/* Carbon fiber grid pattern overlay */}
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />

                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black font-['Rajdhani'] tracking-widest text-white">
                            KRM<span className="text-amber-400">.CARD</span>
                          </span>
                          <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                            ELITE CS2
                          </span>
                        </div>
                        <div className="w-9 h-6 rounded bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-amber-400" />
                        </div>
                      </div>

                      {/* Chip */}
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-200 border border-amber-500/80 shadow-md flex items-center justify-center">
                          <div className="w-6 h-4 border border-amber-600/50 rounded-sm" />
                        </div>
                        <span className="text-xs font-mono text-gray-400">Contactless )))</span>
                      </div>

                      {/* Card Number */}
                      <div className="relative z-10">
                        <p className="font-mono text-lg sm:text-xl font-bold tracking-widest text-amber-300 drop-shadow">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </p>
                      </div>

                      {/* Footer: Holder & Expiry */}
                      <div className="flex justify-between items-end relative z-10">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-['Inter']">
                            Titular
                          </span>
                          <p className="font-mono text-xs font-bold uppercase truncate max-w-[170px]">
                            {cardHolder || 'NOMBRE TITULAR'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-['Inter']">
                            Caducidad
                          </span>
                          <p className="font-mono text-xs font-bold">{cardExpiry || 'MM/AA'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div
                      className="absolute inset-0 rounded-2xl p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background:
                          'linear-gradient(135deg, #0b0d14 0%, #171a26 60%, #1e1610 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      <div className="w-full h-9 bg-black -mx-6 mt-1 opacity-90" />

                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-['Inter']">
                          Código de Seguridad (CVV)
                        </span>
                        <div className="bg-white/10 rounded-lg p-2 flex justify-end items-center border border-white/20">
                          <span className="font-mono text-sm tracking-widest text-amber-400 font-black">
                            {cardCvv || '•••'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-['Inter']">
                        <span>Firma Autorizada</span>
                        <span className="text-amber-400 font-mono font-bold">KRM-SECURE-3D</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flip manual toggle and Autocomplete buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-['Rajdhani'] font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    {isCardFlipped ? 'Ver Cara Delantera' : 'Girar Tarjeta (Ver CVV Trasero)'}
                  </button>

                  <button
                    type="button"
                    onClick={handleAutocompleteTestCard}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold font-['Rajdhani'] uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    ⚡ Autocompletar Tarjeta de Prueba
                  </button>
                </div>

                {/* Card Inputs Form */}
                <div className="space-y-3 pt-2 border-t border-[#1f2433]">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 font-['Rajdhani'] block mb-1">
                      Número de Tarjeta Virtual
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 8901 2345 8891"
                      className="w-full bg-[#12141e] border border-[#232b40] focus:border-amber-500 rounded-xl px-4 py-2 text-sm font-mono text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 font-['Rajdhani'] block mb-1">
                        Nombre del Titular
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="PRO COLLECTOR"
                        className="w-full bg-[#12141e] border border-[#232b40] focus:border-amber-500 rounded-xl px-4 py-2 text-sm font-mono uppercase text-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold uppercase text-gray-400 font-['Rajdhani'] block mb-1">
                          Caducidad
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/29"
                          className="w-full bg-[#12141e] border border-[#232b40] focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono text-white text-center outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-gray-400 font-['Rajdhani'] block mb-1">
                          CVV (Gira)
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={cardCvv}
                          onFocus={() => setIsCardFlipped(true)}
                          onBlur={() => setIsCardFlipped(false)}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="777"
                          className="w-full bg-[#12141e] border border-[#232b40] focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono text-amber-400 text-center font-bold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── OPTION B: BIZUM / APPLE PAY / GOOGLE PAY ─── */}
            {paymentMethod === 'bizum_apple_pay' && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#12141e] border border-[#232b40] flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-white p-2 flex items-center justify-center shrink-0">
                    <QrCode className="w-full h-full text-black" />
                  </div>
                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <span className="text-xs font-black font-['Rajdhani'] uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Bizum Simulado 1-Clic
                    </span>
                    <p className="text-xs text-gray-300 font-['Inter']">
                      Introduce tu número móvil asociado a Bizum para autorizar la orden digital al instante:
                    </p>
                    <div className="flex gap-2 max-w-xs mx-auto sm:mx-0">
                      <input
                        type="text"
                        value={bizumPhone}
                        onChange={(e) => setBizumPhone(e.target.value)}
                        placeholder="600 000 000"
                        className="flex-1 bg-[#090b10] border border-[#2b3550] focus:border-emerald-500 rounded-xl px-3 py-1.5 text-sm font-mono text-emerald-400 font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleStartPayment}
                    className="p-3 rounded-xl bg-black border border-white/20 hover:border-white text-white font-bold font-['Rajdhani'] uppercase text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                     Apple Pay (1 Clic)
                  </button>
                  <button
                    type="button"
                    onClick={handleStartPayment}
                    className="p-3 rounded-xl bg-[#1a1e2b] border border-blue-500/30 hover:border-blue-400 text-white font-bold font-['Rajdhani'] uppercase text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    GPay Google Pay
                  </button>
                </div>
              </div>
            )}

            {/* ─── OPTION C: CRYPTO WEB3 PAY ─── */}
            {paymentMethod === 'crypto' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-gray-400 font-['Rajdhani']">
                    Selecciona Token de Pago
                  </span>
                  <div className="flex gap-1.5">
                    {(['USDT', 'ETH', 'BTC'] as const).map((token) => (
                      <button
                        key={token}
                        type="button"
                        onClick={() => setCryptoCurrency(token)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          cryptoCurrency === token
                            ? 'bg-amber-500 text-black'
                            : 'bg-[#141724] text-gray-400 border border-[#20273a]'
                        }`}
                      >
                        {token}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#12141e] border border-[#232b40] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-['Inter']">Importe a transferir:</span>
                    <span className="text-xl font-mono font-black text-amber-400">
                      {getCryptoAmount()}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-gray-500 block font-['Inter'] mb-1">
                      Dirección Wallet de Taller Karambit (Red ERC-20 / Arbitrum):
                    </label>
                    <div className="flex items-center gap-2 bg-[#08090f] p-2.5 rounded-xl border border-[#1e2538]">
                      <code className="text-xs font-mono text-gray-300 truncate flex-1">
                        {cryptoAddress}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyCrypto}
                        className="px-2.5 py-1 rounded-lg bg-[#181d2c] hover:bg-[#232b42] text-xs font-['Rajdhani'] text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedWallet ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── OPTION D: STEAM SKINS PAY ─── */}
            {paymentMethod === 'steam_skins' && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#12141e] border border-purple-500/30 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Flame className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-['Rajdhani'] uppercase text-white truncate">
                        {steamAccount.username}
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.2 rounded font-mono">
                        Conectado
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                      SteamID: {steamAccount.steamId}
                    </p>
                    <p className="text-xs text-amber-400 font-mono font-bold mt-1">
                      Saldo en skins disponible: {steamAccount.inventoryBalance.toFixed(2)}€
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 font-['Inter']">
                  El bot oficial de KRM.GG enviará una oferta de intercambio en Steam para debitar los{' '}
                  <strong className="text-white font-mono">{finalTotal.toFixed(2)}€</strong> de tu inventario.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Order Summary & Pay Action (5 cols) ─── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0e1017] border border-[#1f2433] space-y-5 shadow-2xl sticky top-28">
            <h3 className="text-xl font-black text-white font-['Rajdhani'] uppercase flex items-center justify-between border-b border-[#1f2433] pb-3">
              <span>Resumen del Pedido</span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {cart.reduce((s, i) => s + i.quantity, 0)} {cart.reduce((s, i) => s + i.quantity, 0) === 1 ? 'artículo' : 'artículos'}
              </span>
            </h3>

            {/* Knife Items List */}
            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => {
                const knifeImage = getItemImage(item);
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#12141e] border border-[#1e2538] flex items-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-xl bg-[#08090f] border border-[#1b2133] p-1 flex items-center justify-center shrink-0">
                      <img
                        src={knifeImage}
                        alt={item.name}
                        style={{ filter: getItemFilter(item) }}
                        className="w-full h-full object-contain drop-shadow"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white font-['Rajdhani'] truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-amber-400 font-mono font-bold">
                        {item.price.toFixed(2)}€{' '}
                        {item.quantity > 1 && (
                          <span className="text-gray-500 font-normal">x{item.quantity}</span>
                        )}
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.condition && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-white/5 text-gray-300 border border-white/10">
                            {item.condition}
                          </span>
                        )}
                        {item.bladeType && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-['Inter'] bg-[#1a2133] text-gray-300">
                            {item.bladeType.includes('Afilada') ? 'Afilada' : 'Sin Filo'}
                          </span>
                        )}
                        {item.statTrak && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            ST™ #{String(item.statTrakCount ?? '000').padStart(3, '0')}
                          </span>
                        )}
                        {item.nameTag && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-zinc-200">
                            "{item.nameTag}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Free Gift Preview */}
              {giftUnlocked && (
                <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <Gift className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold font-['Rajdhani'] text-white">
                      Llavero Mini-Karambit CS2
                    </p>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">
                      GRATIS (Pedido &gt; 75€)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-[#1f2433] space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 font-['Rajdhani'] block">
                Cupón de Descuento
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  placeholder="KNIFY10, CS2PRO..."
                  className="flex-1 bg-[#12141e] border border-[#232b40] focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs font-mono uppercase text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-1.5 rounded-xl bg-[#1e2538] hover:bg-[#2b354f] text-xs font-bold font-['Rajdhani'] uppercase text-amber-400 transition-colors cursor-pointer"
                >
                  Aplicar
                </button>
              </div>

              {couponMsg.text && (
                <p
                  className={`text-[11px] font-['Inter'] ${
                    couponMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {couponMsg.text}
                </p>
              )}

              {activeCoupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-400">
                  <span className="font-mono font-bold">
                    {activeCoupon.code} ({activeCoupon.description})
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-2 pt-2 border-t border-[#1f2433] text-xs font-['Inter']">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">{subtotal.toFixed(2)}€</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento Aplicado</span>
                  <span className="font-mono font-bold">-{discountAmount.toFixed(2)}€</span>
                </div>
              )}

              <div className="flex justify-between text-gray-400">
                <span>Certificado Digital Oficial</span>
                <span className="font-mono text-emerald-400">GRATIS</span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-[#1f2433]">
                <span className="text-base font-black font-['Rajdhani'] uppercase text-white">
                  Total Final
                </span>
                <span className="text-3xl font-black text-[#f59e0b] font-['Rajdhani']">
                  {finalTotal.toFixed(2)}€
                </span>
              </div>
            </div>

            {/* Action Pay Button */}
            <button
              type="button"
              onClick={handleStartPayment}
              className="w-full py-4 rounded-2xl font-black font-['Rajdhani'] uppercase tracking-wider text-black text-lg shadow-xl shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
            >
              <Lock className="w-5 h-5" />
              PAGAR AHORA ({finalTotal.toFixed(2)}€)
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-gray-500 font-['Inter']">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Pasarela SSL 256-bit
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Entrega Digital Instantánea
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ PROCESSING FULLSCREEN OVERLAY ══════════ */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg p-8 rounded-3xl bg-[#0e1017] border border-[#232a3d] shadow-2xl text-center space-y-6"
            >
              {processingError ? (
                /* Bank Error View */
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                    <AlertCircle className="w-9 h-9 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black font-['Rajdhani'] uppercase text-white">
                    Transacción Rechazada
                  </h3>
                  <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 font-['Inter'] leading-relaxed text-left">
                    {processingError}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProcessing(false)}
                    className="w-full py-3.5 rounded-xl font-bold font-['Rajdhani'] uppercase tracking-wider text-white bg-[#1a1f30] hover:bg-[#252c44] border border-[#2e3752] transition-colors cursor-pointer text-sm"
                  >
                    Volver a la Pasarela de Pago
                  </button>
                </div>
              ) : (
                /* Sequential Processing Flow View */
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-black mx-auto shadow-lg shadow-amber-500/30">
                    <Zap className="w-8 h-8 animate-pulse" />
                  </div>

                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      PASO {processingStep} DE 4
                    </span>
                    <h3 className="text-2xl font-black font-['Rajdhani'] uppercase text-white mt-3">
                      {processingStep === 1 && 'Conectando con pasarela cifrada SSL...'}
                      {processingStep === 2 && 'Verificando fondos simulados...'}
                      {processingStep === 3 &&
                        'Grabando contador StatTrak™ y placa NameTag en taller...'}
                      {processingStep === 4 &&
                        '¡Pago verificado! Generando certificados de autenticidad...'}
                    </h3>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-[#161a26] overflow-hidden p-0.5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400"
                      initial={{ width: '15%' }}
                      animate={{
                        width:
                          processingStep === 1
                            ? '25%'
                            : processingStep === 2
                            ? '55%'
                            : processingStep === 3
                            ? '80%'
                            : '100%',
                      }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>

                  {/* Steps Checklist */}
                  <div className="space-y-2 text-left text-xs font-['Inter']">
                    <div
                      className={`flex items-center gap-2.5 ${
                        processingStep >= 1 ? 'text-amber-400' : 'text-gray-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Conexión segura 256-bit establecida</span>
                    </div>
                    <div
                      className={`flex items-center gap-2.5 ${
                        processingStep >= 2 ? 'text-amber-400' : 'text-gray-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Comprobación de fondos y autenticación 3D-Secure</span>
                    </div>
                    <div
                      className={`flex items-center gap-2.5 ${
                        processingStep >= 3 ? 'text-amber-400' : 'text-gray-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Grabado láser de seriales de acero 440C</span>
                    </div>
                    <div
                      className={`flex items-center gap-2.5 ${
                        processingStep >= 4 ? 'text-emerald-400' : 'text-gray-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Emisión del Certificado de Autenticidad Digital</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default CheckoutPage;
