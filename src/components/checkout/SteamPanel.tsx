import React from 'react';
import { AlertCircle, Check, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import {
  DEMO_SKINS,
  DEMO_STEAM_ACCOUNT,
  autoSelectSkins,
  skinsValue,
} from '../../lib/payment';
import { Button } from '../ui/Button';
import { Price } from '../ui/Price';
import { formatEUR } from '../../lib/format';

interface SteamPanelProps {
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
  total: number;
}

/** Inventario Steam de demostración: elige skins cuyo valor cubra el total del pedido. */
export const SteamPanel: React.FC<SteamPanelProps> = ({ selected, onSelectedChange, total }) => {
  const value = skinsValue(selected);
  const covered = value + 0.001 >= total;
  const missing = Math.max(0, Math.round((total - value) * 100) / 100);
  const surplus = Math.max(0, Math.round((value - total) * 100) / 100);
  const inventoryTotal = skinsValue(DEMO_SKINS.map((s) => s.id));
  const unreachable = inventoryTotal + 0.001 < total;

  const toggle = (id: string) =>
    onSelectedChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-purple-500/30 bg-krm-card p-3.5 sm:gap-4 sm:p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-400">
          <Flame className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-display text-sm font-bold uppercase text-white">
              {DEMO_STEAM_ACCOUNT.username}
            </span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
              Cuenta demo
            </span>
          </div>
          <p className="mt-0.5 break-all font-mono text-[11px] text-gray-500">SteamID: {DEMO_STEAM_ACCOUNT.steamId}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-xs font-bold uppercase tracking-wider text-gray-400">
          Inventario de demostración ({DEMO_SKINS.length})
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Sparkles className="h-3.5 w-3.5" />}
            onClick={() => onSelectedChange(autoSelectSkins(total))}
            disabled={total <= 0}
          >
            Auto-seleccionar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onSelectedChange([])} disabled={selected.length === 0}>
            Limpiar
          </Button>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DEMO_SKINS.map((skin) => {
          const active = selected.includes(skin.id);
          return (
            <li key={skin.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={active}
                onClick={() => toggle(skin.id)}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                  active
                    ? 'border-krm-accent bg-krm-accent/10'
                    : 'border-krm-border bg-krm-card hover:border-gray-600'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    active ? 'border-krm-accent bg-krm-accent text-black' : 'border-krm-border-strong'
                  }`}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                </span>
                <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: skin.color }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-body text-xs text-gray-200">{skin.name}</span>
                  <Price value={skin.value} size="sm" tone="accent" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div
        className={`flex items-start gap-2 rounded-xl border p-3 font-body text-xs ${
          total <= 0 || covered
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            : 'border-krm-accent/30 bg-krm-accent/10 text-amber-300'
        }`}
        aria-live="polite"
      >
        {total <= 0 || covered ? (
          <CheckCircle2 className="mt-px h-4 w-4 shrink-0" />
        ) : (
          <AlertCircle className="mt-px h-4 w-4 shrink-0" />
        )}
        <div className="min-w-0">
          <p>
            Valor seleccionado: <strong className="font-mono">{formatEUR(value)}</strong> de{' '}
            <strong className="font-mono">{formatEUR(total)}</strong> necesarios.
          </p>
          {unreachable ? (
            <p className="mt-1 text-gray-400">
              Este pedido supera el valor de todo el inventario de demostración. Elige otro método de pago.
            </p>
          ) : !covered ? (
            <p className="mt-1 text-gray-400">Faltan {formatEUR(missing)} en skins para cubrir el pedido.</p>
          ) : surplus > 0 ? (
            <p className="mt-1 text-gray-400">El exceso de {formatEUR(surplus)} no se devuelve en la demo.</p>
          ) : null}
        </div>
      </div>
      <p className="font-body text-[11px] text-gray-500">
        El «bot» de intercambio es simulado: no se envía ninguna oferta real de Steam.
      </p>
    </div>
  );
};

export default SteamPanel;
