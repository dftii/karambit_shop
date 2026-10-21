import { hideBrokenImage } from '../lib/imageFallback';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Wallet,
  Coins,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  X,
  Copy,
  Check,
  Tag,
  Gamepad2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useStore, useCartTotals, type Order } from '../store/useStore';
import { generateTxHash } from '../lib/ids';
import { toast } from '../lib/toast';
import { useNavigate } from 'react-router-dom';
import KarambitSVG from './KarambitSVG';

type PaymentTab = 'card' | 'balance' | 'crypto' | 'steam';

export const CheckoutModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCheckoutOpen,
    setCheckoutOpen,
    activeCoupon,
    applyCouponCode,
    balance,
    placeOrder,
  } = useStore(
    useShallow((s) => ({
      cart: s.cart,
      isCheckoutOpen: s.isCheckoutOpen,
      setCheckoutOpen: s.setCheckoutOpen,
      activeCoupon: s.activeCoupon,
      applyCouponCode: s.applyCouponCode,
      balance: s.balance,
      placeOrder: s.placeOrder,
    }))
  );

  const [activeTab, setActiveTab] = useState<PaymentTab>('card');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Card form state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardHolder, setCardHolder] = useState('ALEXIS "S1MPLE" PRO');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('777');

  // Crypto state
  const [cryptoCurrency, setCryptoCurrency] = useState<'BTC' | 'ETH' | 'SOL' | 'USDT'>('ETH');
  const [copiedCrypto, setCopiedCrypto] = useState(false);

  // Checkout simulation stages
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const { subtotal, discount: discountAmount, total: finalTotal } = useCartTotals();

  // Quick fill test card
  const handleAutofillCard = () => {
    setCardNumber('4242 8899 1337 4096');
    setCardHolder('NICK "SHROUD" REYNOLDS');
    setCardExpiry('09/29');
    setCardCvv('999');
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    const res = applyCouponCode(code);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError(res.message);
      setCouponSuccess('');
    }
  };

  const handleExecutePayment = async () => {
    if (finalTotal > 0 && activeTab === 'balance' && balance < finalTotal) {
      toast.error('Saldo virtual insuficiente. Recarga saldo simulado con 1 clic en la pestaña Saldo.');
      return;
    }

    setIsProcessing(true);
    setProcessingStage(1);

    // Stage 1
    await new Promise((r) => setTimeout(r, 900));
    setProcessingStage(2);

    // Stage 2
    await new Promise((r) => setTimeout(r, 900));
    setProcessingStage(3);

    // Stage 3
    await new Promise((r) => setTimeout(r, 800));

    // Place actual order in Zustand
    const result = placeOrder({
      paymentMethod: activeTab === 'card' ? 'credit_card' : activeTab === 'steam' ? 'steam_skins' : activeTab,
      paymentDetails: {
        cardLast4: activeTab === 'card' ? cardNumber.slice(-4) : undefined,
        cryptoCurrency: activeTab === 'crypto' ? cryptoCurrency : undefined,
        cryptoTx: activeTab === 'crypto' ? generateTxHash() : undefined,
        skinsTraded: activeTab === 'steam' ? ['AK-47 | Redline (MW)', 'AWP | Asiimov (FT)'] : undefined,
      },
    });

    setIsProcessing(false);
    if (!result.ok) {
      setProcessingStage(0);
      toast.error(result.error);
      return;
    }
    setCompletedOrder(result.order);
  };

  const handleClose = () => {
    setCheckoutOpen(false);
    setCompletedOrder(null);
    setIsProcessing(false);
    setProcessingStage(0);
  };

  if (!isCheckoutOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          onClick={!isProcessing ? handleClose : undefined}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl my-auto rounded-3xl overflow-hidden border border-krm-border shadow-2xl z-10 flex flex-col max-h-[92vh]"
          style={{
            background: 'linear-gradient(180deg, #12141d 0%, #0a0b11 100%)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(245, 158, 11, 0.1)',
          }}
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-krm-border bg-[#0c0d14]/70">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-tech text-xs font-black text-black"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                K
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-display text-xl font-bold tracking-wider uppercase">
                    Pasarela de Pago Segura Simulada
                  </h2>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-body">
                    <ShieldCheck className="w-3 h-3" /> 256-BIT SSL DEMO
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-body">
                  Compra directa digital instantánea · Sin trámites de envío físico
                </p>
              </div>
            </div>

            {!isProcessing && (
              <button
                onClick={handleClose}
                aria-label="Cerrar"
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-krm-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {completedOrder ? (
              /* ─── SUCCESS SCREEN ─── */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center max-w-xl mx-auto space-y-6"
              >
                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-gradient-to-tr from-amber-500 to-emerald-400 p-1 shadow-lg shadow-amber-500/20">
                  <div className="w-full h-full rounded-full bg-[#0d0f17] flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-black tracking-widest text-amber-400 uppercase font-tech bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                    Transacción Completada
                  </span>
                  <h3 className="text-3xl font-black text-white font-display uppercase mt-3 tracking-wide">
                    ¡Orden Confirmada con Éxito!
                  </h3>
                  <p className="text-sm text-gray-400 font-body mt-1">
                    Tu réplica oficial y certificado de propiedad han sido registrados digitalmente.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="p-5 rounded-2xl bg-krm-bg-deep border border-krm-border text-left space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-krm-border">
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-body">Código de Orden</p>
                      <p className="text-base font-bold text-white font-tech">{completedOrder.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-body">Total Pagado</p>
                      <p className="text-xl font-black text-krm-accent font-display">
                        {completedOrder.total.toFixed(2)}€
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase font-display">Artículos del Arsenal:</p>
                    {completedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 text-gray-300">
                        <span className="truncate pr-4 font-display text-sm font-semibold">
                          {item.quantity}x {item.name} {item.bladeType ? `(${item.bladeType})` : ''}
                        </span>
                        <span className="text-amber-400 font-bold whitespace-nowrap">{(item.price * item.quantity).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-krm-border flex items-center justify-between text-xs text-gray-500 font-mono">
                    <span>Certificado: {completedOrder.digitalCertificateId}</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-body font-semibold">
                      <Check className="w-3.5 h-3.5" /> Estado: Confirmado
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      handleClose();
                      navigate('/orders');
                    }}
                    className="flex-1 py-3.5 px-6 rounded-xl font-bold font-display uppercase tracking-wider text-black text-base flex items-center justify-center gap-2 transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                  >
                    Ver en Mis Pedidos
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClose}
                    className="py-3.5 px-6 rounded-xl font-semibold font-display uppercase tracking-wider text-gray-300 hover:text-white bg-krm-border hover:bg-krm-hover transition-colors"
                  >
                    Seguir Comprando
                  </button>
                </div>
              </motion.div>
            ) : isProcessing ? (
              /* ─── PROCESSING ANIMATION ─── */
              <div className="py-20 text-center max-w-md mx-auto space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                  <div className="absolute inset-3 rounded-full border-4 border-purple-500/20 border-b-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-amber-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white font-display uppercase tracking-wider">
                    {processingStage === 1 && '1/3 · Cifrando Token de Pago...'}
                    {processingStage === 2 && '2/3 · Verificando Saldo & 3D Secure...'}
                    {processingStage === 3 && '3/3 · Emitiendo Certificado Digital KRM...'}
                  </h3>
                  <p className="text-xs text-gray-400 font-body">
                    No cierres esta ventana. Transacción simulada en proceso seguro.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-krm-border h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400"
                    animate={{ width: `${(processingStage / 3) * 100}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            ) : (
              /* ─── NORMAL CHECKOUT FORM ─── */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Payment Methods & Details (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Payment Tabs */}
                  <div>
                    <label className="text-xs uppercase font-bold text-gray-400 tracking-wider font-display block mb-2">
                      Selecciona Método de Pago Simulado
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => setActiveTab('card')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                          activeTab === 'card'
                            ? 'bg-krm-accent/10 border-krm-accent text-krm-accent'
                            : 'bg-krm-card-alt border-krm-border text-gray-400 hover:text-white hover:border-krm-hover'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="text-xs font-bold font-display uppercase">Tarjeta Pro</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('balance')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center relative ${
                          activeTab === 'balance'
                            ? 'bg-krm-accent/10 border-krm-accent text-krm-accent'
                            : 'bg-krm-card-alt border-krm-border text-gray-400 hover:text-white hover:border-krm-hover'
                        }`}
                      >
                        <Wallet className="w-5 h-5" />
                        <span className="text-xs font-bold font-display uppercase">Saldo KRM</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">{balance.toFixed(0)}€</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('crypto')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                          activeTab === 'crypto'
                            ? 'bg-krm-accent/10 border-krm-accent text-krm-accent'
                            : 'bg-krm-card-alt border-krm-border text-gray-400 hover:text-white hover:border-krm-hover'
                        }`}
                      >
                        <Coins className="w-5 h-5" />
                        <span className="text-xs font-bold font-display uppercase">Web3 Crypto</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('steam')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                          activeTab === 'steam'
                            ? 'bg-krm-accent/10 border-krm-accent text-krm-accent'
                            : 'bg-krm-card-alt border-krm-border text-gray-400 hover:text-white hover:border-krm-hover'
                        }`}
                      >
                        <Gamepad2 className="w-5 h-5" />
                        <span className="text-xs font-bold font-display uppercase">Skins CS2</span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: CREDIT CARD */}
                  {activeTab === 'card' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      {/* Virtual Gaming Card Preview */}
                      <div
                        className="relative p-5 rounded-2xl overflow-hidden border border-amber-500/30 text-white shadow-xl"
                        style={{
                          background: 'linear-gradient(135deg, #181926 0%, #0d0e15 50%, #1f1b2e 100%)',
                        }}
                      >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-5 rounded bg-amber-400/80 border border-amber-200/50 flex items-center justify-center text-[9px] font-black text-black">
                              CHIP
                            </div>
                            <span className="text-[11px] font-bold text-gray-400 font-tech tracking-widest">KRM PLATINUM</span>
                          </div>
                          <span className="text-sm font-black font-tech tracking-wider text-amber-400">ESPORTS PAY</span>
                        </div>

                        <div className="font-mono text-xl sm:text-2xl tracking-[0.2em] font-bold mb-4 text-gray-100">
                          {cardNumber}
                        </div>

                        <div className="flex justify-between items-end text-xs font-display">
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase">Titular</span>
                            <span className="font-bold text-sm text-gray-200 tracking-wider">{cardHolder}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase">Expira</span>
                            <span className="font-mono font-bold text-sm text-gray-200">{cardExpiry}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card inputs & quick autofill */}
                      <div className="space-y-3 bg-krm-surface p-4 rounded-xl border border-krm-border">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400 font-body">Datos simulados de la tarjeta</span>
                          <button
                            type="button"
                            onClick={handleAutofillCard}
                            className="text-xs text-amber-400 hover:text-amber-300 font-bold font-display uppercase flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Rellenar Demo 1-Clic
                          </button>
                        </div>

                        <div>
                          <input aria-label="Número de tarjeta"
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-krm-card-alt border border-krm-border rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                            placeholder="Número de Tarjeta"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <input aria-label="Nombre del titular"
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="bg-krm-card-alt border border-krm-border rounded-lg px-3 py-2 text-white font-display text-sm uppercase focus:border-amber-500 focus:outline-none"
                            placeholder="Nombre del Titular"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input aria-label="Fecha de caducidad (MM/AA)"
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="bg-krm-card-alt border border-krm-border rounded-lg px-3 py-2 text-white font-mono text-sm text-center focus:border-amber-500 focus:outline-none"
                              placeholder="MM/AA"
                            />
                            <input aria-label="CVV"
                              type="text"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="bg-krm-card-alt border border-krm-border rounded-lg px-3 py-2 text-white font-mono text-sm text-center focus:border-amber-500 focus:outline-none"
                              placeholder="CVV"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: BALANCE */}
                  {activeTab === 'balance' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-krm-surface border border-krm-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 font-body">Saldo Virtual Disponible:</p>
                          <p className="text-3xl font-black text-emerald-400 font-display">
                            {balance.toFixed(2)}€
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {[50, 100].map((amount) => (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => useStore.getState().addBalance(amount)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold font-display text-xs flex items-center gap-1"
                            >
                              +{amount}€ Demo
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 font-body leading-relaxed bg-krm-card-alt p-3 rounded-xl border border-krm-border">
                        {balance >= finalTotal ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                            <Check className="w-4 h-4" /> Tienes saldo suficiente para procesar esta compra inmediatamente.
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" /> Te faltan {(finalTotal - balance).toFixed(2)}€. Pulsa en los botones superiores para añadir saldo simulado al instante.
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: CRYPTO */}
                  {activeTab === 'crypto' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-krm-surface border border-krm-border space-y-4">
                      <div className="flex gap-2">
                        {(['ETH', 'BTC', 'SOL', 'USDT'] as const).map((curr) => (
                          <button
                            key={curr}
                            onClick={() => setCryptoCurrency(curr)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold font-tech ${
                              cryptoCurrency === curr
                                ? 'bg-amber-500 text-black'
                                : 'bg-krm-card-alt text-gray-400 hover:text-white'
                            }`}
                          >
                            {curr}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-krm-card p-4 rounded-xl border border-krm-border">
                        {/* Simulated QR */}
                        <div className="w-24 h-24 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
                          <div className="w-full h-full bg-black/90 flex flex-col items-center justify-center text-[10px] text-amber-400 font-mono font-bold">
                            <span>[QR-KRM]</span>
                            <span className="text-[8px] text-white">SCAN TO PAY</span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 text-left space-y-1">
                          <p className="text-xs text-gray-400 font-body">Importe a transferir:</p>
                          <p className="text-lg font-bold font-mono text-amber-400">
                            {cryptoCurrency === 'ETH' && `${(finalTotal / 3200).toFixed(4)} ETH`}
                            {cryptoCurrency === 'BTC' && `${(finalTotal / 64000).toFixed(5)} BTC`}
                            {cryptoCurrency === 'SOL' && `${(finalTotal / 150).toFixed(3)} SOL`}
                            {cryptoCurrency === 'USDT' && `${finalTotal.toFixed(2)} USDT`}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] font-mono text-gray-500 truncate">
                              0x71C...krm88knife440c
                            </span>
                            <button
                              onClick={() => {
                                setCopiedCrypto(true);
                                setTimeout(() => setCopiedCrypto(false), 2000);
                              }}
                              className="p-1 rounded bg-krm-border text-gray-400 hover:text-white text-xs flex items-center gap-1"
                              aria-label="Copiar dirección de wallet"
                            >
                              {copiedCrypto ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: STEAM SKINS TRADE-IN */}
                  {activeTab === 'steam' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-krm-surface border border-krm-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-300 font-display uppercase flex items-center gap-1.5">
                          <Gamepad2 className="w-4 h-4 text-[#a855f7]" /> Inventario Steam Simulado
                        </span>
                        <span className="text-xs text-emerald-400 font-body">2 Skins seleccionadas</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl border border-amber-500/40 bg-[#161a27] flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                          <div className="text-left min-w-0">
                            <p className="text-xs font-bold text-white truncate font-display">AK-47 | Redline</p>
                            <p className="text-[11px] text-amber-400 font-mono">+32.50€ Valor</p>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl border border-amber-500/40 bg-[#161a27] flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                          <div className="text-left min-w-0">
                            <p className="text-xs font-bold text-white truncate font-display">AWP | Atheris</p>
                            <p className="text-[11px] text-amber-400 font-mono">+28.00€ Valor</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-400 font-body">
                        El trade se confirmará instantáneamente vía bot P2P simulado de KRM.GG.
                      </p>
                    </motion.div>
                  )}

                  {/* Coupons Section */}
                  <div className="bg-krm-surface p-4 rounded-xl border border-krm-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-300 font-display uppercase flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-krm-accent" /> Código de Descuento
                      </span>
                      <span className="text-[11px] text-gray-500 font-body">Pruébalos con 1 clic:</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {['KNIFY10', 'CS2PRO', 'STATTRAKFREE'].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => handleApplyCoupon(code)}
                          className="px-2.5 py-1 rounded bg-[#181c2b] hover:bg-[#22273d] text-gray-300 hover:text-amber-400 text-xs font-mono border border-krm-border"
                        >
                          {code}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input aria-label="Código de descuento"
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="INGRESA CÓDIGO"
                        className="flex-1 bg-krm-card-alt border border-krm-border rounded-lg px-3 py-2 text-white font-mono text-xs uppercase focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="px-4 py-2 rounded-lg bg-krm-border hover:bg-[#2d3448] text-white text-xs font-bold font-display uppercase transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>

                    {couponSuccess && <p className="text-xs text-emerald-400 font-body">{couponSuccess}</p>}
                    {couponError && <p className="text-xs text-red-400 font-body">{couponError}</p>}
                  </div>
                </div>

                {/* Right Column: Order Summary & Instant Checkout CTA (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-krm-bg-deep p-5 rounded-2xl border border-krm-border">
                  <div>
                    <h3 className="text-base font-bold text-white font-display uppercase tracking-wider mb-4 pb-2 border-b border-krm-border">
                      Resumen del Arsenal ({cart.length})
                    </h3>

                    {/* Cart mini-list */}
                    <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1">
                      {cart.map((item) => (
                        <div key={item.lineId} className="flex items-center gap-3 p-2 rounded-xl bg-krm-card border border-[#1a1f2e]">
                          <div className="w-10 h-10 shrink-0 flex items-center justify-center p-0.5 rounded bg-krm-bg-deep">
                            {item.image ? (
                              <img loading="lazy" decoding="async" onError={hideBrokenImage} src={item.image} alt={item.name} className="w-full h-full object-contain drop-shadow" />
                            ) : (
                              <KarambitSVG gradient={item.gradient} size={40} animate={false} alt={item.name} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate font-display">{item.name}</p>
                            <p className="text-[10px] text-gray-500 font-body">
                              {item.quantity}x {item.bladeType || 'Réplica'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-krm-accent font-display">
                              {(item.price * item.quantity).toFixed(2)}€
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Breakdown */}
                    <div className="mt-4 pt-4 border-t border-krm-border space-y-2 text-xs font-body">
                      <div className="flex justify-between text-gray-400">
                        <span>Subtotal</span>
                        <span className="text-white font-medium">{subtotal.toFixed(2)}€</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Descuento Promocional {activeCoupon?.code ? `(${activeCoupon.code})` : ''}</span>
                          <span className="font-mono font-bold">-{discountAmount.toFixed(2)}€</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-400">
                        <span className="flex items-center gap-1">
                          Envío Digital Instantáneo
                          <Zap className="w-3 h-3 text-amber-400" />
                        </span>
                        <span className="text-emerald-400 font-bold uppercase">GRATIS (0.00€)</span>
                      </div>
                      <div className="pt-2 border-t border-krm-border flex justify-between items-baseline">
                        <span className="text-sm font-bold text-white font-display uppercase tracking-wider">Total a Pagar</span>
                        <span className="text-2xl font-black text-krm-accent font-display">
                          {finalTotal.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleExecutePayment}
                      disabled={cart.length === 0}
                      className="w-full py-4 rounded-xl font-black text-black uppercase tracking-wider font-display text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                      }}
                    >
                      <Lock className="w-4 h-4" />
                      Pagar y Confirmar Pedido
                    </button>
                    <p className="text-[10px] text-center text-gray-500 font-body">
                      Simulación protegida. No se debitará dinero real.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckoutModal;
