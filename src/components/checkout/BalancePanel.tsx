import React from 'react';
import { AlertCircle, CheckCircle2, Wallet } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-krm-border-strong bg-krm-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="font-body text-xs text-gray-400">Saldo KRM disponible</p>
            <Price value={balance} size="lg" tone="emerald" />
          </div>
        </div>
        <div className="text-right">
          <p className="font-body text-xs text-gray-400">Saldo tras el pago</p>
          <Price value={Math.max(0, roundMoney(balance - total))} size="md" tone={enough ? 'white' : 'muted'} />
        </div>
      </div>

      <div
        role={enough ? 'status' : 'alert'}
        className={`flex items-start gap-2 rounded-xl border p-3 font-body text-xs ${
          enough
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            : 'border-krm-accent/30 bg-krm-accent/10 text-amber-300'
        }`}
      >
        {enough ? (
          <CheckCircle2 className="mt-px h-4 w-4 shrink-0" />
        ) : (
          <AlertCircle className="mt-px h-4 w-4 shrink-0" />
        )}
        <span>
          {enough
            ? 'Tienes saldo suficiente para completar este pedido.'
            : `Saldo insuficiente: te faltan ${formatEUR(missing)}. El botón de pago está desactivado hasta que recargues o elijas otro método.`}
        </span>
      </div>

      <div className="space-y-2">
        {!enough && (
          <Button fullWidth icon={<Wallet className="h-4 w-4" />} onClick={() => onRecharge(needed)}>
            Recargar saldo simulado (+{formatEUR(needed)})
          </Button>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body text-[11px] text-gray-500">{enough ? 'Recargar saldo simulado:' : 'O recarga:'}</span>
          {QUICK_AMOUNTS.map((amount) => (
            <Button key={amount} size="sm" variant="secondary" onClick={() => onRecharge(amount)}>
              +{formatEUR(amount)}
            </Button>
          ))}
        </div>
        <p className="font-body text-[11px] text-gray-500">
          El saldo es virtual y se recarga gratis: no hay ningún cobro real.
        </p>
      </div>
    </div>
  );
};

export default BalancePanel;
