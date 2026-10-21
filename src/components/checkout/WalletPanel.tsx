import React, { useId } from 'react';
import { Smartphone } from 'lucide-react';
import { WALLET_LABELS, formatPhone, type WalletKind } from '../../lib/payment';
import { Field } from './Field';
import { inputClasses } from './fieldStyles';

interface WalletPanelProps {
  wallet: WalletKind;
  onWalletChange: (wallet: WalletKind) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  phoneError?: string | null;
  onPhoneBlur: () => void;
}

const WALLETS: WalletKind[] = ['bizum', 'apple_pay', 'google_pay'];

/** Bizum (con móvil de autorización simulada) / Apple Pay / Google Pay (autorización instantánea simulada). */
export const WalletPanel: React.FC<WalletPanelProps> = ({
  wallet,
  onWalletChange,
  phone,
  onPhoneChange,
  phoneError,
  onPhoneBlur,
}) => {
  const uid = useId();
  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Cartera móvil" className="grid grid-cols-3 gap-2">
        {WALLETS.map((kind) => {
          const active = wallet === kind;
          return (
            <button
              key={kind}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onWalletChange(kind)}
              className={`cursor-pointer rounded-xl border px-2 py-3 text-center font-display text-xs font-black uppercase tracking-wide transition-all sm:text-sm ${
                active
                  ? 'border-krm-accent bg-krm-accent/15 text-white'
                  : 'border-krm-border bg-krm-card text-gray-400 hover:border-gray-600 hover:text-white'
              }`}
            >
              {WALLET_LABELS[kind]}
            </button>
          );
        })}
      </div>

      {wallet === 'bizum' ? (
        <div className="rounded-2xl border border-krm-border-strong bg-krm-card p-4">
          <div className="mb-3 flex items-center gap-2 text-emerald-400">
            <Smartphone className="h-4 w-4" />
            <span className="font-display text-xs font-black uppercase tracking-wider">Bizum simulado</span>
          </div>
          <Field
            id={`${uid}-phone`}
            label="Móvil asociado a Bizum"
            error={phoneError}
            hint="Solo para autorizar el pago de demostración. No se envía a ningún servicio."
          >
            <input
              id={`${uid}-phone`}
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              value={phone}
              onChange={(e) => onPhoneChange(formatPhone(e.target.value))}
              onBlur={onPhoneBlur}
              placeholder="600 000 000"
              aria-invalid={Boolean(phoneError)}
              aria-describedby={`${uid}-phone-msg`}
              className={inputClasses(Boolean(phoneError), 'font-mono tracking-wider')}
            />
          </Field>
        </div>
      ) : (
        <div className="rounded-2xl border border-krm-border-strong bg-krm-card p-4 font-body text-xs leading-relaxed text-gray-300">
          Con {WALLET_LABELS[wallet]} el pago se autoriza al instante en modo demostración, sin introducir datos. Pulsa
          «Pagar» para simular la confirmación biométrica.
        </div>
      )}
    </div>
  );
};

export default WalletPanel;
