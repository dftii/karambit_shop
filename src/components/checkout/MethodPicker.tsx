import React from 'react';
import { Coins, CreditCard, Flame, Smartphone, Wallet } from 'lucide-react';
import { METHOD_LABELS, type CheckoutMethod } from '../../lib/payment';
import { formatEUR } from '../../lib/format';

interface MethodPickerProps {
  value: CheckoutMethod;
  onChange: (method: CheckoutMethod) => void;
  balance: number;
  total: number;
}

const ICONS: Record<CheckoutMethod, { icon: React.ReactNode; sub: string }> = {
  credit_card: { icon: <CreditCard className="h-5 w-5 text-krm-accent" />, sub: 'Visa · Mastercard · Amex' },
  bizum_apple_pay: { icon: <Smartphone className="h-5 w-5 text-emerald-400" />, sub: 'Móvil 1 clic' },
  crypto: { icon: <Coins className="h-5 w-5 text-sky-400" />, sub: 'USDT · ETH · BTC · SOL' },
  steam_skins: { icon: <Flame className="h-5 w-5 text-purple-400" />, sub: 'Trade CS2 simulado' },
  balance: { icon: <Wallet className="h-5 w-5 text-emerald-400" />, sub: '' },
};

const ORDER: CheckoutMethod[] = ['credit_card', 'bizum_apple_pay', 'crypto', 'steam_skins', 'balance'];

/** Selector de método (radiogroup accesible). El saldo KRM indica si alcanza. */
export const MethodPicker: React.FC<MethodPickerProps> = ({ value, onChange, balance, total }) => (
  <div role="radiogroup" aria-label="Método de pago" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
    {ORDER.map((method) => {
      const active = method === value;
      const { icon, sub } = ICONS[method];
      const short = method === 'balance' && total > 0 && balance + 0.001 < total;
      return (
        <button
          key={method}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(method)}
          className={`min-w-0 cursor-pointer rounded-2xl border p-3 text-center transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-krm-accent ${
            active
              ? 'border-krm-accent bg-krm-accent/15 text-white shadow-lg shadow-amber-500/10'
              : 'border-krm-border bg-krm-card text-gray-400 hover:border-gray-600'
          } ${method === 'balance' ? 'col-span-2 sm:col-span-1' : ''}`}
        >
          <span className="mx-auto mb-1.5 flex justify-center">{icon}</span>
          <span className="block font-display text-xs font-black uppercase leading-tight">{METHOD_LABELS[method]}</span>
          {method === 'balance' ? (
            <span className={`block font-mono text-[10px] ${short ? 'text-krm-accent' : 'text-emerald-400'}`}>
              {formatEUR(balance)}
              {short ? ' · insuficiente' : ''}
            </span>
          ) : (
            <span className="block truncate text-[10px] text-gray-500">{sub}</span>
          )}
        </button>
      );
    })}
  </div>
);

export default MethodPicker;
