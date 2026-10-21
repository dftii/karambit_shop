import React from 'react';
import { ShieldCheck, Trash2 } from 'lucide-react';
import { rarityColors } from '../../data/karambits';
import { formatEUR } from '../../lib/format';
import { HISTORY_LIMIT, type OpeningOutcome, type OpeningRecord } from '../../store/useMysteryStore';
import { Badge, Button, type BadgeTone } from '../ui';

const OUTCOME_LABEL: Record<OpeningOutcome, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Pendiente', tone: 'amber' },
  claimed: { label: 'Reclamado', tone: 'emerald' },
  sold: { label: 'Vendido', tone: 'sky' },
  converted: { label: 'Convertido', tone: 'purple' },
};

const time = (at: number): string =>
  new Date(at).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

interface HistoryPanelProps {
  history: OpeningRecord[];
  onVerify: (record: OpeningRecord) => void;
  onClear: () => void;
  locked: boolean;
}

/** Últimas aperturas (máx. 20): caja, premio, rareza, valor, hora y roll. */
export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onVerify, onClear, locked }) => (
  <section aria-labelledby="history-title" className="rounded-3xl border border-krm-border bg-krm-surface p-5">
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 id="history-title" className="font-display text-xl font-black uppercase text-white">
        Historial <span className="text-sm font-bold text-gray-500">(últimas {HISTORY_LIMIT})</span>
      </h2>
      <Button
        variant="ghost"
        size="sm"
        icon={<Trash2 className="h-3.5 w-3.5" />}
        onClick={onClear}
        disabled={history.length === 0 || locked}
      >
        Borrar
      </Button>
    </div>

    {history.length === 0 ? (
      <p className="py-8 text-center font-body text-sm text-gray-500">Aún no has abierto ninguna caja.</p>
    ) : (
      <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {history.map((r) => {
          const outcome = OUTCOME_LABEL[r.outcome];
          const color = rarityColors[r.rarity] ?? '#9ca3af';
          return (
            <li key={r.id} className="rounded-xl border border-krm-border bg-krm-card p-3" data-testid="history-row">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-white">
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: color }} />
                    {r.prizeName}
                  </p>
                  <p className="truncate font-body text-[11px] text-gray-500">
                    {r.caseName} · {time(r.at)}
                  </p>
                </div>
                <Badge tone={outcome.tone}>
                  {outcome.label}
                  {r.payout !== undefined ? ` +${formatEUR(r.payout)}` : ''}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-gray-400">
                <span>
                  {r.rarity} · valor {formatEUR(r.value)} · caja {formatEUR(r.casePrice)}
                </span>
                <span title="Número en [0,1) derivado del HMAC">roll {r.roll.toFixed(8)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-gray-600">nonce #{r.nonce}</span>
                <button
                  type="button"
                  onClick={() => onVerify(r)}
                  disabled={!r.revealed}
                  className="inline-flex items-center gap-1 font-display text-[11px] font-black uppercase tracking-wider text-krm-accent hover:text-amber-300 disabled:cursor-not-allowed disabled:text-gray-600"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {r.revealed ? 'Verificar' : 'Semilla oculta'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);
