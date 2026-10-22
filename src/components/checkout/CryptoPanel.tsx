import React from 'react';
import {
  CRYPTO_CURRENCIES,
  CRYPTO_INFO,
  cryptoAmount,
  type CryptoCurrency,
} from '../../lib/payment';
import { formatEUR } from '../../lib/format';
import { toast } from '../../lib/toast';
import { useTimedValue } from '../../lib/useTimedValue';
import { QrPlaceholder } from './QrPlaceholder';

interface CryptoPanelProps {
  currency: CryptoCurrency;
  onCurrencyChange: (currency: CryptoCurrency) => void;
  total: number;
}

/** Selector de token, conversión con tipos de cambio DEMO fijos, dirección copiable y QR de marcador. */
export const CryptoPanel: React.FC<CryptoPanelProps> = ({ currency, onCurrencyChange, total }) => {
  const info = CRYPTO_INFO[currency];
  const [copied, flashCopied] = useTimedValue<boolean>(false, 2000);

  const handleCopy = () => {
    if (!navigator.clipboard) {
      toast.error('Tu navegador no permite copiar al portapapeles.');
      return;
    }
    navigator.clipboard
      .writeText(info.address)
      .then(() => flashCopied(true))
      .catch(() => toast.error('No se pudo copiar la dirección.'));
  };

  return (
    <div className="space-y-5">
      <div
        role="radiogroup"
        aria-label="Criptomoneda"
        className="grid grid-cols-4 divide-x divide-line border border-line bg-paper-2"
      >
        {CRYPTO_CURRENCIES.map((token) => {
          const active = token === currency;
          return (
            <button
              key={token}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onCurrencyChange(token)}
              className={`cursor-pointer py-3 font-mono text-xs font-medium transition-colors ${
                active ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-tile hover:text-ink'
              }`}
            >
              {token}
            </button>
          );
        })}
      </div>

      <dl className="border-y border-line">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-3">
          <dt className="eyebrow">Importe a transferir</dt>
          <dd className="break-all font-mono text-lg font-medium text-ink sm:text-xl" aria-live="polite">
            {cryptoAmount(total, currency)}
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-line py-3">
          <dt className="eyebrow">Cambio demo fijo</dt>
          <dd className="font-mono text-xs text-ink-2">
            1 {currency} = {formatEUR(info.rate)}
          </dd>
        </div>
      </dl>
      <p className="font-body text-xs text-ink-3">Tipo de cambio DEMO fijo: no refleja el mercado real.</p>

      <div className="flex flex-col items-start gap-5 sm:flex-row">
        <QrPlaceholder seed={`${currency}:${info.address}`} className="h-28 w-28 shrink-0 p-1" />
        <div className="w-full min-w-0 flex-1">
          <span className="eyebrow mb-2 block">Dirección de demostración · {info.network}</span>
          <div className="flex items-center gap-2 border border-line bg-paper-2 p-2.5">
            <code className="min-w-0 flex-1 break-all font-mono text-xs text-ink">{info.address}</code>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 cursor-pointer font-body text-xs font-medium text-ink underline decoration-1 underline-offset-4 transition-colors hover:text-pink-ink hover:decoration-pink"
              aria-label="Copiar dirección"
            >
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="mt-3 font-body text-xs leading-relaxed text-ink-3">
            Dirección ficticia: no envíes fondos reales. Al pulsar «Pagar» se simula la transacción y su confirmación en
            red.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CryptoPanel;
