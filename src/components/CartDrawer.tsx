import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  Gift,
  Tag,
  Lock,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { karambits } from '../data/karambits';

const FREE_GIFT_THRESHOLD = 75.0;

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    getCartSubtotal,
    getDiscountAmount,
    getFinalTotal,
    activeCoupon,
    applyCouponCode,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const subtotal = getCartSubtotal();
  const discountAmount = getDiscountAmount();
  const finalTotal = getFinalTotal();
  const giftUnlocked = subtotal >= FREE_GIFT_THRESHOLD;
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_GIFT_THRESHOLD) * 100));
  const remainingForGift = Math.max(0, FREE_GIFT_THRESHOLD - subtotal);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) {
      setCouponFeedback({ type: 'error', message: 'Escribe un código de cupón' });
      return;
    }
    const result = applyCouponCode(code);
    if (result.success) {
      setCouponFeedback({ type: 'success', message: result.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', message: result.message });
    }
  };

  const getItemImage = (item: { id: string; productId?: string; image?: string }) => {
    if (item.image) return item.image;
    const baseId = item.productId || item.id.split('-')[0];
    const found = karambits.find((k) => k.id === baseId || item.id.startsWith(k.id));
    return found?.image || karambits[0].image;
  };

  const getItemFilter = (item: { id: string; productId?: string; visualFilter?: string }) => {
    if (item.visualFilter) return item.visualFilter;
    const baseId = item.productId || item.id.split('-')[0];
    const found = karambits.find((k) => k.id === baseId || item.id.startsWith(k.id));
    return found?.visualFilter || undefined;
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[120] overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md flex flex-col shadow-2xl"
              style={{
                background: '#0d0f17',
                borderLeft: '1px solid #1f2433',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 border-b border-[#1f2433] flex items-center justify-between bg-[#12141d]/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black font-['Rajdhani'] uppercase tracking-wider text-white">
                      Tu Arsenal Digital
                    </h2>
                    <p className="text-xs text-gray-400 font-['Inter']">
                      {cart.length === 0
                        ? 'Arsenal vacío'
                        : `${cart.reduce((s, i) => s + i.quantity, 0)} ${
                            cart.reduce((s, i) => s + i.quantity, 0) === 1
                              ? 'artículo seleccionado'
                              : 'artículos seleccionados'
                          }`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1f2433] transition-colors"
                  aria-label="Cerrar carrito"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Gift Progress Bar */}
              <div className="p-4 border-b border-[#1f2433] bg-[#121520]">
                <div className="flex items-center justify-between text-xs font-['Rajdhani'] font-bold mb-1.5 uppercase">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <Gift
                      className={`w-4 h-4 ${
                        giftUnlocked ? 'text-amber-400 animate-bounce' : 'text-gray-400'
                      }`}
                    />
                    {giftUnlocked
                      ? '¡Regalo Exclusivo Desbloqueado!'
                      : 'Regalo Exclusivo por compra > 75€'}
                  </span>
                  <span className={giftUnlocked ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                    {giftUnlocked ? 'COMPLETADO' : `${progressPercent}%`}
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="w-full h-2 rounded-full bg-[#1b2030] overflow-hidden p-0.5">
                  <motion.div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      background: giftUnlocked
                        ? 'linear-gradient(90deg, #10b981, #059669)'
                        : 'linear-gradient(90deg, #f59e0b, #ea580c)',
                    }}
                  />
                </div>

                <p className="text-[11px] font-['Inter'] mt-1.5 text-gray-400">
                  {giftUnlocked ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Llavero Mini-Karambit Oficial incluido GRATIS en tu pedido.
                    </span>
                  ) : (
                    <span>
                      Añade{' '}
                      <strong className="text-amber-400 font-mono">
                        {remainingForGift.toFixed(2)}€
                      </strong>{' '}
                      más para recibir el Llavero Mini-Karambit de regalo.
                    </span>
                  )}
                </p>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                    <div className="w-20 h-20 rounded-2xl bg-[#141824] border border-[#1f2433] flex items-center justify-center text-gray-600 mb-4">
                      <ShoppingCart className="w-10 h-10 opacity-40" />
                    </div>
                    <h3 className="text-xl font-bold font-['Rajdhani'] uppercase text-white mb-1">
                      Tu arsenal está vacío
                    </h3>
                    <p className="text-xs text-gray-500 max-w-xs font-['Inter'] mb-6">
                      Explora nuestras réplicas 1:1 forjadas en acero inoxidable 440C y personaliza tu Karambit soñado.
                    </p>
                    <Link
                      to="/shop"
                      onClick={() => setCartOpen(false)}
                      className="px-6 py-3 rounded-xl font-bold font-['Rajdhani'] uppercase tracking-wider text-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      Explorar Catálogo
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <>
                    {cart.map((item) => {
                      const knifeImg = getItemImage(item);
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="rounded-xl p-3.5 relative flex flex-col gap-2.5 transition-all"
                          style={{
                            background: '#12141e',
                            border: '1px solid #1f2537',
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {/* Product PNG image */}
                            <div className="w-16 h-16 shrink-0 rounded-lg bg-[#0a0c13] border border-[#1b2030] p-1 flex items-center justify-center relative overflow-hidden">
                              <img
                                src={knifeImg}
                                alt={item.name}
                                style={{ filter: getItemFilter(item) }}
                                className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(245,158,11,0.25)]"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-bold font-['Rajdhani'] text-base truncate leading-snug">
                                {item.name}
                              </h4>
                              <p className="text-amber-400 font-mono font-bold text-sm">
                                {item.price.toFixed(2)}€
                              </p>

                              {/* Customization Badges Breakdown */}
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {item.condition && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                      item.condition === 'Battle-Scarred'
                                        ? 'bg-amber-900/30 text-amber-300 border border-amber-800/40'
                                        : 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/40'
                                    }`}
                                  >
                                    {item.condition}
                                  </span>
                                )}

                                {item.bladeType && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1c2235] text-gray-300 font-['Inter']">
                                    {item.bladeType.includes('Afilada') ? 'Afilada (Real)' : 'Sin Filo (Tricks)'}
                                  </span>
                                )}

                                {item.statTrak && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono font-bold flex items-center gap-1">
                                    <Zap className="w-2.5 h-2.5" />
                                    ST™ #{String(item.statTrakCount ?? '000').padStart(3, '0')}
                                  </span>
                                )}

                                {item.nameTag && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-600 text-zinc-200 font-mono flex items-center gap-1">
                                    <Tag className="w-2.5 h-2.5" />
                                    "{item.nameTag}"
                                  </span>
                                )}

                                {item.standIncluded && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-800/40">
                                    + Soporte Acrílico
                                  </span>
                                )}

                                {item.kydexIncluded && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-800/40">
                                    + Funda Kydex
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Eliminar artículo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Quantity control & line subtotal */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#1a1f2e] text-xs">
                            <div className="flex items-center gap-1.5 bg-[#090b11] border border-[#1f2435] rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1f30] transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-white font-mono font-bold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1f30] transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="text-[11px] text-gray-500 font-['Inter']">Subtotal: </span>
                              <span className="text-white font-mono font-bold text-sm">
                                {(item.price * item.quantity).toFixed(2)}€
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Free gift item card in cart if threshold met */}
                    {giftUnlocked && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl p-3 bg-gradient-to-r from-emerald-950/40 to-[#0e171b] border border-emerald-500/40 flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Gift className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="text-white font-bold font-['Rajdhani'] text-sm">
                              Llavero Mini-Karambit CS2
                            </h5>
                            <span className="px-1.5 py-0.2 text-[9px] font-mono font-black rounded bg-emerald-500 text-black uppercase">
                              GRATIS
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 font-['Inter']">
                            Regalo exclusivo por pedido superior a 75€
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500 line-through mr-1.5 font-mono">
                            12.90€
                          </span>
                          <span className="text-emerald-400 font-mono font-black text-sm">
                            0.00€
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* Coupon section */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-[#1f2433] bg-[#0f121a]">
                  <label className="block text-xs font-['Rajdhani'] uppercase tracking-wider font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    Código de Descuento
                  </label>

                  {activeCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-mono font-bold text-emerald-300">
                            {activeCoupon.code}
                          </p>
                          <p className="text-[10px] text-gray-400 font-['Inter']">
                            {activeCoupon.description} (-{discountAmount.toFixed(2)}€)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors font-['Rajdhani'] uppercase font-bold"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Ej: KNIFY10, CS2PRO..."
                          className="flex-1 bg-[#151926] border border-[#232a3d] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 font-mono outline-none uppercase transition-colors"
                        />
                        <button
                          onClick={() => handleApplyCoupon()}
                          className="px-4 py-2 rounded-xl bg-[#222a3d] hover:bg-amber-500 hover:text-black font-bold font-['Rajdhani'] uppercase tracking-wider text-xs text-white transition-all"
                        >
                          Aplicar
                        </button>
                      </div>

                      {/* Quick chip buttons for coupons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-gray-500 font-['Inter']">Disponibles:</span>
                        {['KNIFY10', 'CS2PRO', 'STATTRAKFREE'].map((code) => (
                          <button
                            key={code}
                            onClick={() => handleApplyCoupon(code)}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161b2a] hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 transition-all cursor-pointer"
                          >
                            +{code}
                          </button>
                        ))}
                      </div>

                      {couponFeedback.message && (
                        <p
                          className={`text-[11px] font-['Inter'] flex items-center gap-1 ${
                            couponFeedback.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {couponFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {couponFeedback.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Footer Summary & Checkout */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-[#1f2433] bg-[#0c0e15] space-y-3">
                  <div className="space-y-1.5 text-sm font-['Inter']">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span className="text-white font-mono">{subtotal.toFixed(2)}€</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          Descuento ({activeCoupon?.code})
                        </span>
                        <span className="font-mono font-bold">-{discountAmount.toFixed(2)}€</span>
                      </div>
                    )}

                    {giftUnlocked && (
                      <div className="flex justify-between text-amber-400">
                        <span className="flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5" />
                          Regalo Mini-Karambit
                        </span>
                        <span className="font-mono font-bold text-emerald-400">GRATIS</span>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline pt-2 border-t border-[#1e2333]">
                      <span className="text-base font-bold font-['Rajdhani'] uppercase text-white tracking-wider">
                        Total Final
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-black font-['Rajdhani'] text-amber-400">
                          {finalTotal.toFixed(2)}€
                        </span>
                        <p className="text-[10px] text-gray-500 font-['Inter']">
                          IVA incluido · Orden simulada
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCartOpen(false);
                      navigate('/checkout');
                    }}
                    className="w-full py-3.5 rounded-xl font-black font-['Rajdhani'] uppercase tracking-wider text-black text-base bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <Lock className="w-4 h-4" />
                    Tramitar Pedido / Checkout
                  </button>

                  <div className="flex items-center justify-center gap-3 text-[11px] text-gray-500 font-['Inter'] pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Garantía 1:1 CS2
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Sin Envíos Físicos
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
