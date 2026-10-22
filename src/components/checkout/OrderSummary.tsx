import React, { useId, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCartTotals, useStore } from '../../store/useStore';
import { Price } from '../ui/Price';
import { Button } from '../ui/Button';
import { LineBadges } from './LineBadges';
import { LineThumb } from './LineThumb';
import { inputClasses, LABEL_CLASSES } from './fieldStyles';

const FREE_GIFT_THRESHOLD = 75;

/**
 * Resumen del pedido: líneas con opciones y precio por unidad, cupón (store) y totales.
 * En móvil va primero y el detalle es plegable (la cabecera siempre muestra el total).
 */
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
  const [open, setOpen] = useState(false); // solo afecta a < lg

  const handleApply = () => {
    const result = applyCouponCode(code);
    setFeedback({ ok: result.success, text: result.message });
    if (result.success) setCode('');
  };

  const giftUnlocked = subtotal >= FREE_GIFT_THRESHOLD;

  return (
    <section aria-labelledby={`${uid}-title`} className="border border-line bg-paper-2">
      {/* Cabecera (siempre visible) */}
      <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
        <div className="min-w-0">
          <p className="eyebrow">
            Resumen · {count} {count === 1 ? 'artículo' : 'artículos'}
          </p>
          <h2 id={`${uid}-title`} className="display-md mt-2">
            Tu pedido
          </h2>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 lg:hidden">
          <Price value={total} size="lg" />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={`${uid}-detail`}
            className="cursor-pointer font-body text-xs font-medium text-ink underline decoration-1 underline-offset-4 transition-colors hover:text-pink-ink hover:decoration-pink"
          >
            {open ? 'Ocultar detalle' : 'Ver detalle'}
          </button>
        </div>
      </div>

      <div id={`${uid}-detail`} className={`${open ? 'block' : 'hidden'} lg:block`}>
        <ul className="max-h-96 divide-y divide-line overflow-y-auto border-t border-line">
          {cart.map((item) => (
            <li key={item.lineId} className="flex items-start gap-3 px-4 py-4 sm:px-6">
              <LineThumb item={item} className="h-14 w-14 p-1.5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 font-body text-sm font-medium leading-snug tracking-normal text-ink [overflow-wrap:anywhere]">
                    {item.name}
                  </h3>
                  <Price value={item.price * item.quantity} size="sm" className="shrink-0" />
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-ink-3">
                  {item.quantity} × <Price value={item.price} size="xs" tone="muted" />
                </p>
                <LineBadges item={item} className="mt-1" />
              </div>
            </li>
          ))}

          {giftUnlocked && (
            <li className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="font-body text-sm font-medium text-ink">Llavero Mini-Karambit CS2</p>
                <p className="eyebrow mt-0.5">Regalo · pedido ≥ 75 €</p>
              </div>
              <Price value={0} size="sm" tone="success" />
            </li>
          )}
        </ul>

        {/* Cupón */}
        <div className="space-y-2 border-t border-line p-4 sm:p-6">
          <label htmlFor={`${uid}-coupon`} className={LABEL_CLASSES}>
            Cupón de descuento
          </label>
          {activeCoupon ? (
            <div className="flex items-center justify-between gap-3 border border-line px-3 py-2">
              <div className="min-w-0">
                <p className="font-mono text-xs font-medium text-ink">{activeCoupon.code}</p>
                <p className="font-body text-xs text-ink-2 [overflow-wrap:anywhere]">{activeCoupon.description}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  removeCoupon();
                  setFeedback(null);
                }}
                aria-label={`Quitar cupón ${activeCoupon.code}`}
                className="shrink-0 cursor-pointer font-body text-xs font-medium text-ink underline decoration-1 underline-offset-4 transition-colors hover:text-pink-ink hover:decoration-pink"
              >
                Quitar
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
            <p role="alert" className={`font-body text-xs ${feedback.ok ? 'text-success' : 'text-danger'}`}>
              {feedback.text}
            </p>
          )}
        </div>

        {/* Totales */}
        <dl className="space-y-2 border-t border-line p-4 font-body text-sm text-ink-2 sm:p-6">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>
              <Price value={subtotal} size="sm" />
            </dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <dt>Descuento{activeCoupon ? ` (${activeCoupon.code})` : ''}</dt>
              <dd>
                <Price value={discount} size="sm" tone="success" prefix="-" />
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Certificado digital oficial</dt>
            <dd className="font-mono text-xs uppercase tracking-[0.08em] text-success">Incluido</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-ink pt-3 text-ink">
            <dt className="font-body text-base font-medium">Total</dt>
            <dd>
              <Price value={total} size="lg" />
            </dd>
          </div>
        </dl>
      </div>

      {children}
    </section>
  );
};

export default OrderSummary;
