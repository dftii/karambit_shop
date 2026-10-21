import { hideBrokenImage } from '../lib/imageFallback';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
import { useShallow } from 'zustand/react/shallow';
import { useStore, useCartTotals } from '../store/useStore';
import { getCartItemFilter, getCartItemImage } from '../lib/cart';
import { formatEUR } from '../lib/format';
import { Drawer } from './ui/Drawer';
import { Price } from './ui/Price';
import { Button } from './ui/Button';
import { LineBadges } from './checkout/LineBadges';
import { isSingleUnitLine } from './checkout/isSingleUnitLine';

const FREE_GIFT_THRESHOLD = 75.0;

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    activeCoupon,
    applyCouponCode,
    removeCoupon,
  } = useStore(
    useShallow((s) => ({
      cart: s.cart,
      isCartOpen: s.isCartOpen,
      setCartOpen: s.setCartOpen,
      removeFromCart: s.removeFromCart,
      updateQuantity: s.updateQuantity,
      activeCoupon: s.activeCoupon,
      applyCouponCode: s.applyCouponCode,
      removeCoupon: s.removeCoupon,
    }))
  );
  const { subtotal, discount: discountAmount, total: finalTotal, count: itemCount } = useCartTotals();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

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

  return (
    <Drawer open={isCartOpen} onClose={() => setCartOpen(false)} ariaLabel="Tu arsenal digital (carrito)" zIndex={120}>
      {/* Header */}
      <div className="p-5 border-b border-krm-border flex items-center justify-between bg-krm-panel/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black font-display uppercase tracking-wider text-white">
              Tu Arsenal Digital
            </h2>
            <p className="text-xs text-gray-400 font-body">
              {cart.length === 0
                ? 'Arsenal vacío'
                : `${itemCount} ${
                    itemCount === 1
                      ? 'artículo seleccionado'
                      : 'artículos seleccionados'
                  }`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCartOpen(false)}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-krm-border transition-colors"
          aria-label="Cerrar carrito"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Free Gift Progress Bar */}
      <div className="p-4 border-b border-krm-border bg-[#121520]">
        <div className="flex items-center justify-between text-xs font-display font-bold mb-1.5 uppercase">
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

        <p className="text-[11px] font-body mt-1.5 text-gray-400">
          {giftUnlocked ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Llavero Mini-Karambit Oficial incluido GRATIS en tu pedido.
            </span>
          ) : (
            <span>
              Añade{' '}
              <strong className="text-amber-400 font-mono">{formatEUR(remainingForGift)}</strong>{' '}
              más para recibir el Llavero Mini-Karambit de regalo.
            </span>
          )}
        </p>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <div className="w-20 h-20 rounded-2xl bg-[#141824] border border-krm-border flex items-center justify-center text-gray-600 mb-4">
              <ShoppingCart className="w-10 h-10 opacity-40" />
            </div>
            <h3 className="text-xl font-bold font-display uppercase text-white mb-1">
              Tu arsenal está vacío
            </h3>
            <p className="text-xs text-gray-500 max-w-xs font-body mb-6">
              Explora nuestras réplicas 1:1 forjadas en acero inoxidable 440C y personaliza tu Karambit soñado.
            </p>
            <Link
              to="/shop"
              onClick={() => setCartOpen(false)}
              className="px-6 py-3 rounded-xl font-bold font-display uppercase tracking-wider text-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              Explorar Catálogo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {cart.map((item) => {
              const knifeImg = getCartItemImage(item);
              const singleUnit = isSingleUnitLine(item);
              return (
                <motion.div
                  key={item.lineId}
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
                    <div className="w-16 h-16 shrink-0 rounded-lg bg-krm-bg-deep border border-[#1b2030] p-1 flex items-center justify-center relative overflow-hidden">
                      <img loading="lazy" decoding="async" onError={hideBrokenImage}
                        src={knifeImg}
                        alt={item.name}
                        style={{ filter: getCartItemFilter(item) }}
                        className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(245,158,11,0.25)]"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold font-display text-base truncate leading-snug">
                        {item.name}
                      </h4>
                      <p className="font-mono text-xs text-gray-500">
                        <Price value={item.price} size="sm" /> / ud.
                      </p>

                      {/* Opciones de la línea: 1 of 1, desgaste, filo, StatTrak™, NameTag, soporte, Kydex */}
                      <LineBadges item={item} className="mt-1.5" />
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.lineId)}
                      className="text-gray-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Eliminar artículo"
                      aria-label={`Eliminar ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity control & line subtotal */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1a1f2e] text-xs">
                    {singleUnit ? (
                      <span className="text-[11px] font-body text-gray-500">Pieza única · 1 unidad</span>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-[#090b11] border border-[#1f2435] rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                          aria-label={`Quitar una unidad de ${item.name}`}
                          className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1f30] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-white font-mono font-bold" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                          aria-label={`Añadir una unidad de ${item.name}`}
                          className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1f30] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="text-right">
                      <span className="text-[11px] text-gray-500 font-body">Subtotal: </span>
                      <Price value={item.price * item.quantity} size="sm" tone="white" />
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
                    <h5 className="text-white font-bold font-display text-sm">
                      Llavero Mini-Karambit CS2
                    </h5>
                    <span className="px-1.5 py-0.2 text-[9px] font-mono font-black rounded bg-emerald-500 text-black uppercase">
                      GRATIS
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-body">
                    Regalo exclusivo por pedido superior a 75€
                  </p>
                </div>
                <div className="text-right">
                  <Price value={12.9} size="xs" tone="muted" strike className="mr-1.5" />
                  <Price value={0} size="sm" tone="emerald" />
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Coupon section */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-krm-border bg-[#0f121a]">
          <label className="block text-xs font-display uppercase tracking-wider font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
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
                  <p className="text-[10px] text-gray-400 font-body">
                    {activeCoupon.description} (-{formatEUR(discountAmount)})
                  </p>
                </div>
              </div>
              <button
                onClick={removeCoupon}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors font-display uppercase font-bold"
              >
                Quitar
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input aria-label="Código de descuento"
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Ej: KNIFY10, CS2PRO..."
                  className="flex-1 bg-[#151926] border border-[#232a3d] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 font-mono outline-none uppercase transition-colors"
                />
                <button
                  onClick={() => handleApplyCoupon()}
                  className="px-4 py-2 rounded-xl bg-[#222a3d] hover:bg-amber-500 hover:text-black font-bold font-display uppercase tracking-wider text-xs text-white transition-all"
                >
                  Aplicar
                </button>
              </div>

              {/* Quick chip buttons for coupons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-gray-500 font-body">Disponibles:</span>
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
                  className={`text-[11px] font-body flex items-center gap-1 ${
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
        <div className="p-5 border-t border-krm-border bg-[#0c0e15] space-y-3">
          <div className="space-y-1.5 text-sm font-body">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <Price value={subtotal} size="sm" tone="white" />
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Descuento ({activeCoupon?.code})
                </span>
                <Price value={discountAmount} size="sm" tone="emerald" prefix="-" />
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
              <span className="text-base font-bold font-display uppercase text-white tracking-wider">
                Total Final
              </span>
              <div className="text-right">
                <Price value={finalTotal} size="lg" />
                <p className="text-[10px] text-gray-500 font-body">
                  IVA incluido · Pasarela simulada
                </p>
              </div>
            </div>
          </div>

          <Button
            fullWidth
            size="lg"
            icon={<Lock className="w-4 h-4" />}
            onClick={() => {
              setCartOpen(false);
              navigate('/checkout');
            }}
          >
            Tramitar pedido
          </Button>

          <div className="flex items-center justify-center gap-3 text-[11px] text-gray-500 font-body pt-1">
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
    </Drawer>
  );
};
export default CartDrawer;
