import React, { useId } from 'react';
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
    <div className="space-y-5">
      <div
        role="radiogroup"
        aria-label="Cartera móvil"
        className="grid grid-cols-3 divide-x divide-line border border-line bg-paper-2"
      >
        {WALLETS.map((kind) => {
          const active = wallet === kind;
          return (
            <button
              key={kind}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onWalletChange(kind)}
              className={`cursor-pointer px-2 py-3 text-center font-body text-sm font-medium transition-colors ${
                active ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-tile hover:text-ink'
              }`}
            >
              {WALLET_LABELS[kind]}
            </button>
          );
        })}
      </div>

      {wallet === 'bizum' ? (
        <div className="space-y-3">
          <p className="eyebrow">Bizum simulado</p>
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
        <p className="border-l-2 border-pink pl-4 font-body text-xs leading-relaxed text-ink-2">
          Con {WALLET_LABELS[wallet]} el pago se autoriza al instante en modo demostración, sin introducir datos. Pulsa
          «Pagar» para simular la confirmación biométrica.
        </p>
      )}
    </div>
  );
};

export default WalletPanel;
