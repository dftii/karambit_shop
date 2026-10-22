import React from 'react';
import { METHOD_LABELS, type CheckoutMethod } from '../../lib/payment';
import { formatEUR } from '../../lib/format';
import { STRIPE_TEST_ENABLED } from '../../lib/stripe';

interface MethodPickerProps {
  value: CheckoutMethod;
  onChange: (method: CheckoutMethod) => void;
  balance: number;
  total: number;
}

const SUBS: Record<CheckoutMethod, string> = {
  credit_card: 'Visa · Mastercard · Amex',
  stripe_test: 'Tarjeta de prueba · sin cargos',
  bizum_apple_pay: 'Bizum · Apple Pay · Google Pay',
  crypto: 'USDT · ETH · BTC · SOL',
  steam_skins: 'Trade CS2 simulado',
  balance: 'Saldo KRM virtual',
};

// "Stripe (modo prueba)" solo aparece si hay una clave pk_test_ configurada (ver src/lib/stripe.ts).
const ORDER: CheckoutMethod[] = [
  'credit_card',
  ...(STRIPE_TEST_ENABLED ? (['stripe_test'] as const) : []),
  'bizum_apple_pay',
  'crypto',
  'steam_skins',
  'balance',
];

/** Selector de método: lista con filas de 1px (radiogroup accesible). El saldo KRM indica si alcanza. */
export const MethodPicker: React.FC<MethodPickerProps> = ({ value, onChange, balance, total }) => (
  <div role="radiogroup" aria-label="Método de pago" className="divide-y divide-line border border-line bg-paper-2">
    {ORDER.map((method, i) => {
      const active = method === value;
      const short = method === 'balance' && total > 0 && balance + 0.001 < total;
      return (
        <button
          key={method}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(method)}
          className={`flex w-full min-w-0 cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors sm:gap-4 ${
            active ? 'bg-pink-soft' : 'hover:bg-tile'
          }`}
        >
          <span
            aria-hidden="true"
            className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
              active ? 'border-ink' : 'border-ink-3'
            }`}
          >
            {active && <span className="h-2 w-2 bg-ink" />}
          </span>
          <span className="eyebrow w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
          <span className="min-w-0 flex-1">
            <span className="block font-body text-[15px] font-medium leading-snug text-ink">{METHOD_LABELS[method]}</span>
            <span className="block truncate font-mono text-[11px] text-ink-3">{SUBS[method]}</span>
          </span>
          {method === 'balance' && (
            <span className={`shrink-0 text-right font-mono text-xs ${short ? 'text-danger' : 'text-ink-2'}`}>
              {formatEUR(balance)}
              {short ? <span className="block">insuficiente</span> : null}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export default MethodPicker;
