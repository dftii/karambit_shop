import { hideBrokenImage } from '../../lib/imageFallback';
import React, { useId, useState } from 'react';
import { CheckCircle2, Gift, Tag, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useCartTotals, useStore } from '../../store/useStore';
import { getCartItemFilter, getCartItemImage } from '../../lib/cart';
import { Price } from '../ui/Price';
import { Button } from '../ui/Button';
import { LineBadges } from './LineBadges';
import { inputClasses } from './fieldStyles';

const FREE_GIFT_THRESHOLD = 75;

/** Resumen del pedido: líneas con opciones y precio por unidad, cupón (store) y totales. */
export const OrderSummary: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const uid = useId();
  const { cart, activeCoupon, applyCouponCode, removeCoupon } = useStore(
    useShallow((s) => ({
      cart: s.cart,
      activeCoupon: s.activeCoupon,
      applyCouponCode: s.applyCouponCode,
      removeCoupon: s.removeCoupon,
    }))
  );
  const { subtotal, discount, total, count } = useCartTotals();

  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const handleApply = () => {
    const result = applyCouponCode(code);
    setFeedback({ ok: result.success, text: result.message });
    if (result.success) setCode('');
  };

  const giftUnlocked = subtotal >= FREE_GIFT_THRESHOLD;

  return (
    <section
      aria-labelledby={`${uid}-title`}
      className="space-y-5 rounded-3xl border border-krm-border bg-krm-surface p-4 shadow-2xl sm:p-6"
    >
      <h2
        id={`${uid}-title`}
        className="flex items-center justify-between gap-3 border-b border-krm-border pb-3 font-display text-xl font-black uppercase text-white"
      >
        <span>Resumen del pedido</span>
        <span className="font-mono text-xs font-bold text-krm-accent">
          {count} {count === 1 ? 'artículo' : 'artículos'}
        </span>
      </h2>

      <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {cart.map((item) => (
          <li key={item.lineId} className="flex items-start gap-3 rounded-2xl border border-krm-border-soft bg-krm-card p-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-krm-border-soft bg-krm-bg-deep p-1">
              <img aria-hidden="true" loading="lazy" decoding="async" onError={hideBrokenImage}
                src={getCartItemImage(item)}
                alt=""
                style={{ filter: getCartItemFilter(item) }}
                className="h-full w-full object-contain drop-shadow"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 font-display text-sm font-bold leading-snug text-white [overflow-wrap:anywhere]">
                  {item.name}
                </h3>
                <Price value={item.price * item.quantity} size="sm" tone="white" className="shrink-0" />
              </div>
              <p className="mt-0.5 font-mono text-[11px] text-gray-500">
                {item.quantity} × <Price value={item.price} size="xs" tone="muted" /> / ud.
              </p>
              <LineBadges item={item} className="mt-1.5" />
            </div>
          </li>
        ))}

        {giftUnlocked && (
          <li className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Gift className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xs font-bold text-white">Llavero Mini-Karambit CS2</p>
              <span className="font-mono text-[10px] font-bold text-emerald-400">GRATIS (pedido ≥ 75 €)</span>
            </div>
          </li>
        )}
      </ul>

      {/* Cupón */}
      <div className="space-y-2 border-t border-krm-border pt-4">
        <label htmlFor={`${uid}-coupon`} className="block font-display text-xs font-bold uppercase tracking-wider text-gray-400">
          Cupón de descuento
        </label>
        {activeCoupon ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-emerald-300">{activeCoupon.code}</p>
                <p className="font-body text-[10px] text-gray-400 [overflow-wrap:anywhere]">{activeCoupon.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                removeCoupon();
                setFeedback(null);
              }}
              aria-label={`Quitar cupón ${activeCoupon.code}`}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 font-display text-xs font-bold uppercase text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <X className="h-3.5 w-3.5" /> Quitar
            </button>
          </div>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleApply();
            }}
          >
            <input
              id={`${uid}-coupon`}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="KNIFY10, CS2PRO..."
              autoComplete="off"
              className={inputClasses(feedback?.ok === false, 'flex-1 py-2 font-mono text-xs uppercase')}
            />
            <Button type="submit" variant="secondary" size="sm" disabled={!code.trim()}>
              Aplicar
            </Button>
          </form>
        )}
        {feedback && !activeCoupon && (
          <p role="alert" className={`font-body text-[11px] ${feedback.ok ? 'text-emerald-400' : 'text-red-400'}`}>
            {feedback.text}
          </p>
        )}
      </div>

      {/* Totales */}
      <dl className="space-y-2 border-t border-krm-border pt-4 font-body text-sm">
        <div className="flex justify-between text-gray-400">
          <dt>Subtotal</dt>
          <dd>
            <Price value={subtotal} size="sm" tone="white" />
          </dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <dt className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> Descuento{activeCoupon ? ` (${activeCoupon.code})` : ''}
            </dt>
            <dd>
              <Price value={discount} size="sm" tone="emerald" prefix="-" />
            </dd>
          </div>
        )}
        <div className="flex justify-between text-gray-400">
          <dt>Certificado digital oficial</dt>
          <dd className="font-mono text-xs font-bold text-emerald-400">GRATIS</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-krm-border pt-3">
          <dt className="font-display text-base font-black uppercase text-white">Total</dt>
          <dd>
            <Price value={total} size="lg" />
          </dd>
        </div>
      </dl>

      {children}
    </section>
  );
};

export default OrderSummary;
