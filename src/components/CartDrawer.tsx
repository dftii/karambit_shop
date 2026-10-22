import React, { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useStore, useCartTotals, useCouponNotice } from '../store/useStore';
import { formatEUR } from '../lib/format';
import { Drawer } from './ui/Drawer';
import { Price } from './ui/Price';
import { Button } from './ui/Button';
import { buttonClasses } from './ui/buttonStyles';
import { LineBadges } from './checkout/LineBadges';
import { LineThumb } from './checkout/LineThumb';
import { inputClasses } from './checkout/fieldStyles';
import { isSingleUnitLine } from './checkout/isSingleUnitLine';
import { MAX_LINE_QUANTITY } from '../lib/cart';

const FREE_GIFT_THRESHOLD = 75.0;

const LINK_BTN =
  'cursor-pointer font-body text-xs font-medium text-ink underline decoration-1 underline-offset-4 transition-colors hover:text-pink-ink hover:decoration-pink';

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
  const couponNotice = useCouponNotice();

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
    <Drawer open={isCartOpen} onClose={() => setCartOpen(false)} labelledBy="cart-drawer-title" zIndex={120}>
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-5">
        <div>
          <p className="eyebrow">
            {cart.length === 0 ? 'Carrito vacío' : `Carrito · ${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}`}
          </p>
          <h2 id="cart-drawer-title" className="display-md mt-2">
            Tu <span className="serif-accent text-pink-ink">arsenal</span>
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setCartOpen(false)}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border border-line text-ink transition-colors hover:border-ink"
          aria-label="Cerrar carrito"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-start justify-center px-5 py-10">
          <p className="eyebrow">00 — Sin artículos</p>
          <h3 className="display-md mt-3 max-w-xs">Aún no has elegido ninguna pieza.</h3>
          <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-ink-2">
            Explora las réplicas 1:1 en acero inoxidable 440C y personaliza tu karambit.
          </p>
          <Link
            to="/shop"
            onClick={() => setCartOpen(false)}
            className={`${buttonClasses({ variant: 'primary', size: 'md' })} mt-6`}
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <>
          {/* Regalo por compra */}
          <div className="border-b border-line px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-body text-xs text-ink-2">
                {giftUnlocked ? (
                  'Llavero Mini-Karambit de regalo incluido en tu pedido.'
                ) : (
                  <>
                    Añade <span className="font-mono text-ink">{formatEUR(remainingForGift)}</span> más y llévate un
                    llavero Mini-Karambit de regalo.
                  </>
                )}
              </p>
              <span className="eyebrow shrink-0">{giftUnlocked ? 'Listo' : `${progressPercent}%`}</span>
            </div>
            <div
              role="progressbar"
              aria-label="Progreso hacia el regalo"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              className="mt-3 h-0.5 w-full bg-line"
            >
              <div className="h-full bg-pink transition-[width] duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Líneas */}
          <ul className="flex-1 divide-y divide-line overflow-y-auto">
            {cart.map((item) => {
              const singleUnit = isSingleUnitLine(item);
              return (
                <li key={item.lineId} className="flex gap-4 px-5 py-5">
                  <LineThumb item={item} className="h-20 w-20 p-2" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 font-body text-sm font-medium leading-snug tracking-normal text-ink [overflow-wrap:anywhere]">
                        {item.name}
                      </h3>
                      <Price value={item.price * item.quantity} size="sm" className="shrink-0" />
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-3">
                      <Price value={item.price} size="xs" tone="muted" /> / ud.
                    </p>

                    {/* Opciones de la línea */}
                    <LineBadges item={item} className="mt-1.5" />

                    <div className="mt-3 flex items-center justify-between gap-3">
                      {singleUnit ? (
                        <span className="eyebrow">Pieza única · 1 unidad</span>
                      ) : (
                        <div className="inline-flex items-stretch border border-line">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                            aria-label={`Quitar una unidad de ${item.name}`}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center text-ink transition-colors hover:bg-tile"
                          >
                            <Minus className="h-3 w-3" aria-hidden="true" />
                          </button>
                          <span
                            className="flex w-9 items-center justify-center border-x border-line font-mono text-xs tabular-nums text-ink"
                            aria-live="polite"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                            disabled={item.quantity >= MAX_LINE_QUANTITY}
                            aria-label={`Añadir una unidad de ${item.name}`}
                            title={item.quantity >= MAX_LINE_QUANTITY ? `Máximo ${MAX_LINE_QUANTITY} unidades` : undefined}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center text-ink transition-colors hover:bg-tile disabled:cursor-not-allowed disabled:text-ink-3 disabled:hover:bg-transparent"
                          >
                            <Plus className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.lineId)}
                        aria-label={`Eliminar ${item.name}`}
                        className={LINK_BTN}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}

            {giftUnlocked && (
              <li className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-body text-sm font-medium text-ink">Llavero Mini-Karambit CS2</p>
                  <p className="eyebrow mt-0.5">Regalo · pedido superior a 75 €</p>
                </div>
                <div className="flex shrink-0 items-baseline gap-2">
                  <Price value={12.9} size="xs" tone="muted" strike />
                  <Price value={0} size="sm" tone="success" />
                </div>
              </li>
            )}
          </ul>

          {/* Cupón */}
          <div className="border-t border-line px-5 py-4">
            <label htmlFor="cart-coupon" className="eyebrow mb-2 block">
              Código de descuento
            </label>

            {activeCoupon ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 border border-line px-3 py-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-medium text-ink">{activeCoupon.code}</p>
                    <p className="font-body text-xs text-ink-2">
                      {activeCoupon.description} (-{formatEUR(discountAmount)})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponFeedback({ type: null, message: '' });
                    }}
                    className={LINK_BTN}
                  >
                    Quitar
                  </button>
                </div>
                {couponNotice && (
                  <p role="status" className="font-mono text-[11px] text-ink-3 [overflow-wrap:anywhere]">
                    {couponNotice}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApplyCoupon();
                  }}
                >
                  <input
                    id="cart-coupon"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Ej: KNIFY10"
                    autoComplete="off"
                    className={inputClasses(couponFeedback.type === 'error', 'flex-1 py-2 font-mono text-xs uppercase')}
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    Aplicar
                  </Button>
                </form>

                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-ink-3">
                  <span>Disponibles:</span>
                  {['KNIFY10', 'CS2PRO', 'STATTRAKFREE'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleApplyCoupon(code)}
                      className="cursor-pointer text-ink underline decoration-1 underline-offset-4 transition-colors hover:text-pink-ink hover:decoration-pink"
                    >
                      {code}
                    </button>
                  ))}
                </p>

                {couponFeedback.message && (
                  <p
                    role="status"
                    className={`font-body text-xs ${couponFeedback.type === 'success' ? 'text-success' : 'text-danger'}`}
                  >
                    {couponFeedback.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Resumen y tramitar */}
          <div className="space-y-4 border-t border-ink px-5 py-5">
            <dl className="space-y-1.5 font-body text-sm text-ink-2">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>
                  <Price value={subtotal} size="sm" />
                </dd>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <dt>Descuento ({activeCoupon?.code})</dt>
                  <dd>
                    <Price value={discountAmount} size="sm" tone="success" prefix="-" />
                  </dd>
                </div>
              )}

              {giftUnlocked && (
                <div className="flex justify-between">
                  <dt>Regalo Mini-Karambit</dt>
                  <dd className="font-mono text-xs uppercase tracking-[0.08em] text-success">Incluido</dd>
                </div>
              )}

              <div className="flex items-baseline justify-between border-t border-line pt-3 text-ink">
                <dt className="font-body text-base font-medium">Total</dt>
                <dd className="text-right">
                  <Price value={finalTotal} size="lg" />
                </dd>
              </div>
            </dl>

            <Button
              fullWidth
              size="lg"
              onClick={() => {
                setCartOpen(false);
                navigate('/checkout');
              }}
            >
              Tramitar pedido
            </Button>

            <p className="eyebrow text-center">IVA incluido · Pasarela simulada</p>
          </div>
        </>
      )}
    </Drawer>
  );
};
export default CartDrawer;
