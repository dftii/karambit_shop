import React from 'react';
import { roundMoney } from '../../lib/pricing';
import { Button } from '../ui/Button';
import { Price } from '../ui/Price';
import { formatEUR } from '../../lib/format';

interface BalancePanelProps {
  balance: number;
  total: number;
  /** Añade saldo simulado (store.addBalance). */
  onRecharge: (amount: number) => void;
}

const QUICK_AMOUNTS = [50, 100, 500] as const;

/** Saldo KRM virtual: muestra si alcanza y permite recargar saldo simulado. */
export const BalancePanel: React.FC<BalancePanelProps> = ({ balance, total, onRecharge }) => {
  const enough = balance + 0.001 >= total;
  const missing = roundMoney(Math.max(0, total - balance));
  const needed = Math.ceil(missing / 10) * 10; // recarga redondeada a múltiplos de 10 €

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-1 border-y border-line sm:grid-cols-2 sm:divide-x sm:divide-line">
        <div className="py-4 sm:pr-4">
          <dt className="eyebrow">Saldo KRM disponible</dt>
          <dd className="mt-1">
            <Price value={balance} size="lg" />
          </dd>
        </div>
        <div className="border-t border-line py-4 sm:border-t-0 sm:pl-4">
          <dt className="eyebrow">Saldo tras el pago</dt>
          <dd className="mt-1">
            <Price value={Math.max(0, roundMoney(balance - total))} size="lg" tone={enough ? 'ink' : 'muted'} />
          </dd>
        </div>
      </dl>

      <p
        role={enough ? 'status' : 'alert'}
        className={`border-l-2 pl-4 font-body text-xs leading-relaxed ${
          enough ? 'border-success text-ink-2' : 'border-danger text-danger'
        }`}
      >
        {enough
          ? 'Tienes saldo suficiente para completar este pedido.'
          : `Saldo insuficiente: te faltan ${formatEUR(missing)}. El botón de pago está desactivado hasta que recargues o elijas otro método.`}
      </p>

      <div className="space-y-3">
        {!enough && (
          <Button fullWidth onClick={() => onRecharge(needed)}>
            Recargar saldo simulado (+{formatEUR(needed)})
          </Button>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1">{enough ? 'Recargar saldo simulado' : 'O recarga'}</span>
          {QUICK_AMOUNTS.map((amount) => (
            <Button key={amount} size="sm" variant="secondary" onClick={() => onRecharge(amount)}>
              +{formatEUR(amount)}
            </Button>
          ))}
        </div>
        <p className="font-body text-xs text-ink-3">
          El saldo es virtual y se recarga gratis: no hay ningún cobro real.
        </p>
      </div>
    </div>
  );
};

export default BalancePanel;
