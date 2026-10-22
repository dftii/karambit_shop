import React from 'react';
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
  const ok = total <= 0 || covered;

  const toggle = (id: string) =>
    onSelectedChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-y border-line py-3">
        <div className="min-w-0">
          <p className="eyebrow">Cuenta demo</p>
          <p className="truncate font-body text-[15px] font-medium text-ink">{DEMO_STEAM_ACCOUNT.username}</p>
        </div>
        <p className="break-all font-mono text-[11px] text-ink-3">SteamID {DEMO_STEAM_ACCOUNT.steamId}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="eyebrow">Inventario de demostración ({DEMO_SKINS.length})</span>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => onSelectedChange(autoSelectSkins(total))} disabled={total <= 0}>
            Auto-seleccionar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onSelectedChange([])} disabled={selected.length === 0}>
            Limpiar
          </Button>
        </div>
      </div>

      <ul className="grid grid-cols-1 border-l border-t border-line bg-paper-2 sm:grid-cols-2">
        {DEMO_SKINS.map((skin) => {
          const active = selected.includes(skin.id);
          return (
            <li key={skin.id} className="border-b border-r border-line">
              <button
                type="button"
                role="checkbox"
                aria-checked={active}
                onClick={() => toggle(skin.id)}
                className={`flex h-full w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors ${
                  active ? 'bg-pink-soft' : 'hover:bg-tile'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                    active ? 'border-ink bg-ink text-paper' : 'border-ink-3'
                  }`}
                >
                  {active && (
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 6.5 5 9.5 10 3" />
                    </svg>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: skin.color }}
                    />
                    <span className="block truncate font-body text-[13px] text-ink">{skin.name}</span>
                  </span>
                  <Price value={skin.value} size="sm" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div
        className={`border-l-2 pl-4 font-body text-xs ${ok ? 'border-success text-ink-2' : 'border-pink text-ink-2'}`}
        aria-live="polite"
      >
        <p>
          Valor seleccionado: <strong className="font-mono font-medium text-ink">{formatEUR(value)}</strong> de{' '}
          <strong className="font-mono font-medium text-ink">{formatEUR(total)}</strong> necesarios.
        </p>
        {unreachable ? (
          <p className="mt-1 text-ink-3">
            Este pedido supera el valor de todo el inventario de demostración. Elige otro método de pago.
          </p>
        ) : !covered ? (
          <p className="mt-1 text-ink-3">Faltan {formatEUR(missing)} en skins para cubrir el pedido.</p>
        ) : surplus > 0 ? (
          <p className="mt-1 text-ink-3">El exceso de {formatEUR(surplus)} no se devuelve en la demo.</p>
        ) : null}
      </div>
      <p className="font-body text-xs text-ink-3">
        El «bot» de intercambio es simulado: no se envía ninguna oferta real de Steam.
      </p>
    </div>
  );
};

export default SteamPanel;
