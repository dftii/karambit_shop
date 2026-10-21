import React from 'react';
import { Check, Copy, Info } from 'lucide-react';
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
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Criptomoneda" className="grid grid-cols-4 gap-2">
        {CRYPTO_CURRENCIES.map((token) => {
          const active = token === currency;
          return (
            <button
              key={token}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onCurrencyChange(token)}
              className={`cursor-pointer rounded-xl border py-2.5 font-tech text-xs font-bold transition-all ${
                active
                  ? 'border-krm-accent bg-krm-accent text-black'
                  : 'border-krm-border bg-krm-card text-gray-400 hover:border-gray-600 hover:text-white'
              }`}
            >
              {token}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 rounded-2xl border border-krm-border-strong bg-krm-card p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="font-body text-xs text-gray-400">Importe a transferir</span>
          <span className="break-all font-mono text-lg font-black text-krm-accent sm:text-xl" aria-live="polite">
            {cryptoAmount(total, currency)}
          </span>
        </div>
        <p className="flex items-start gap-1.5 font-body text-[11px] text-gray-500">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          Tipo de cambio DEMO fijo: 1 {currency} = {formatEUR(info.rate)}. No refleja el mercado real.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <QrPlaceholder seed={`${currency}:${info.address}`} className="h-28 w-28 shrink-0 p-1" />
          <div className="w-full min-w-0 flex-1">
            <span className="mb-1 block font-body text-[11px] uppercase tracking-wider text-gray-500">
              Dirección de demostración · {info.network}
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-krm-border-soft bg-krm-bg-deep p-2.5">
              <code className="min-w-0 flex-1 break-all font-mono text-xs text-gray-300">{info.address}</code>
              <button
                type="button"
                onClick={handleCopy}
                className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-krm-card-hi px-2.5 py-1.5 font-display text-xs font-bold uppercase text-krm-accent transition-colors hover:bg-krm-hover"
                aria-label="Copiar dirección"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copiar
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 font-body text-[11px] leading-relaxed text-gray-500">
              Dirección ficticia: no envíes fondos reales. Al pulsar «Pagar» se simula la transacción y su confirmación en
              red.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoPanel;
