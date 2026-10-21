import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Check, Copy, Dices, ShieldCheck, X } from 'lucide-react';
import { MAX_CLIENT_SEED_LENGTH, verifyOpening, type VerifyResult } from '../../lib/fairness';
import { MYSTERY_CASES, getMysteryCase, shortKnifeName } from '../../lib/mysteryCases';
import { useMysteryStore } from '../../store/useMysteryStore';
import { Button, toast } from '../ui';
import { useTimedValue } from '../../lib/useTimedValue';

/** Datos con los que se rellena el verificador (p. ej. desde una fila del historial). */
export interface VerifyDraft {
  serverSeed: string;
  clientSeed: string;
  nonce: string;
  caseId: string;
  expectedHash: string;
  expectedPrizeId?: string;
}

const inputClass =
  'w-full rounded-lg border border-krm-border bg-krm-bg px-3 py-2 font-mono text-xs text-white outline-none transition-colors placeholder:text-gray-600 focus:border-krm-accent disabled:opacity-50';

const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1 block font-display text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
    {children}
    {hint && <span className="mt-1 block font-body text-[10px] text-gray-500">{hint}</span>}
  </label>
);

const CopyButton: React.FC<{ text: string; label: string }> = ({ text, label }) => {
  const [copied, flash] = useTimedValue(false, 1500);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={!text}
      onClick={() => {
        navigator.clipboard
          ?.writeText(text)
          .then(() => flash(true))
          .catch(() => toast.error('No se pudo copiar al portapapeles.'));
      }}
      className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-krm-border hover:text-white disabled:opacity-40"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

const Mono: React.FC<{ value: string; placeholder?: string }> = ({ value, placeholder }) => (
  <div className="flex items-center gap-1 rounded-lg border border-krm-border bg-krm-bg px-3 py-2">
    <code className="min-w-0 flex-1 break-all font-mono text-[11px] leading-snug text-gray-200">
      {value || placeholder}
    </code>
    <CopyButton text={value} label="Copiar" />
  </div>
);

interface FairnessPanelProps {
  /** Bloquea la edición del client seed mientras gira el carrete. */
  locked: boolean;
  initialVerify: VerifyDraft | null;
}

/** Provably fair (simulado): hash del servidor, client seed, nonce y verificador. */
export const FairnessPanel: React.FC<FairnessPanelProps> = ({ locked, initialVerify }) => {
  const { serverSeedHash, clientSeed, nonce, history, setClientSeed, randomizeClientSeed } = useMysteryStore(
    useShallow((s) => ({
      serverSeedHash: s.serverSeedHash,
      clientSeed: s.clientSeed,
      nonce: s.nonce,
      history: s.history,
      setClientSeed: s.setClientSeed,
      randomizeClientSeed: s.randomizeClientSeed,
    }))
  );
  const [draftSeed, setDraftSeed] = useState<string | null>(null);
  const lastRevealed = history.find((r) => r.revealed);

  const [verifyOpen, setVerifyOpen] = useState(initialVerify !== null);
  const [form, setForm] = useState<VerifyDraft>(
    initialVerify ?? { serverSeed: '', clientSeed: '', nonce: '', caseId: MYSTERY_CASES[0]?.id ?? '', expectedHash: '' }
  );
  const [result, setResult] = useState<{ data: VerifyResult; prizeName: string; prizeMatches: boolean | null } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const shownSeed = draftSeed ?? clientSeed;

  const runVerify = async () => {
    setError('');
    setResult(null);
    const caseDef = getMysteryCase(form.caseId);
    const nonceNumber = Number(form.nonce);
    if (!caseDef) return setError('Selecciona una caja.');
    if (!form.serverSeed.trim() || !form.clientSeed.trim()) return setError('Indica el server seed y el client seed.');
    if (!Number.isInteger(nonceNumber) || nonceNumber < 0) return setError('El nonce debe ser un entero ≥ 0.');
    setBusy(true);
    try {
      const data = await verifyOpening({
        serverSeed: form.serverSeed.trim(),
        clientSeed: form.clientSeed.trim(),
        nonce: nonceNumber,
        expectedServerSeedHash: form.expectedHash.trim() ? form.expectedHash.trim() : undefined,
        weights: caseDef.weightsBp,
      });
      const prize = caseDef.pool[data.prizeIndex].product;
      setResult({
        data,
        prizeName: shortKnifeName(prize),
        prizeMatches: form.expectedPrizeId ? form.expectedPrizeId === prize.id : null,
      });
    } catch {
      setError('No se pudo calcular la verificación en este navegador.');
    } finally {
      setBusy(false);
    }
  };

  const update = (patch: Partial<VerifyDraft>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setResult(null);
  };

  return (
    <section aria-labelledby="fair-title" className="rounded-3xl border border-krm-border bg-krm-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
        <h2 id="fair-title" className="font-display text-xl font-black uppercase text-white">
          Provably fair <span className="text-sm font-bold text-gray-500">(simulado)</span>
        </h2>
      </div>
      <p className="mb-4 font-body text-xs leading-relaxed text-gray-400">
        Antes de abrir ves el hash SHA-256 del server seed. El resultado sale de{' '}
        <code className="text-gray-200">HMAC-SHA256(serverSeed, clientSeed:nonce)</code> → número en [0, 1) → premio según
        las probabilidades. Al terminar se revela el server seed para que lo verifiques. Todo ocurre en tu navegador.
      </p>

      <div className="space-y-3">
        <Field label="Hash del server seed (próxima apertura)">
          <Mono value={serverSeedHash} placeholder="calculando…" />
        </Field>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <Field label="Client seed (editable)">
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={shownSeed}
                maxLength={MAX_CLIENT_SEED_LENGTH}
                disabled={locked}
                spellCheck={false}
                onChange={(e) => {
                  setDraftSeed(e.target.value);
                  setClientSeed(e.target.value);
                }}
                onBlur={() => setDraftSeed(null)}
                aria-label="Client seed"
              />
              <Button
                variant="secondary"
                size="icon"
                aria-label="Client seed aleatorio"
                title="Client seed aleatorio"
                disabled={locked}
                onClick={() => {
                  setDraftSeed(null);
                  randomizeClientSeed();
                }}
              >
                <Dices className="h-4 w-4" />
              </Button>
            </div>
          </Field>
          <Field label="Nonce">
            <div className="rounded-lg border border-krm-border bg-krm-bg px-3 py-2 text-center font-mono text-xs text-white">
              {nonce}
            </div>
          </Field>
        </div>

        <Field label="Última semilla revelada">
          {lastRevealed ? (
            <div className="space-y-1.5">
              <Mono value={lastRevealed.serverSeed} />
              <p className="font-mono text-[10px] text-gray-500">
                nonce #{lastRevealed.nonce} · hash {lastRevealed.serverSeedHash.slice(0, 16)}…
              </p>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-krm-border p-3 text-center font-body text-xs text-gray-500">
              Se mostrará aquí al terminar tu primera apertura.
            </p>
          )}
        </Field>
      </div>

      <div className="mt-4 border-t border-krm-border pt-4">
        <Button variant="ghost" size="sm" onClick={() => setVerifyOpen((v) => !v)} aria-expanded={verifyOpen}>
          {verifyOpen ? 'Ocultar verificador' : 'Verificar una apertura'}
        </Button>

        {verifyOpen && (
          <div className="mt-3 space-y-3" data-testid="verify-panel">
            <Field label="Server seed (revelado)">
              <input className={inputClass} value={form.serverSeed} onChange={(e) => update({ serverSeed: e.target.value })} spellCheck={false} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Client seed">
                <input className={inputClass} value={form.clientSeed} onChange={(e) => update({ clientSeed: e.target.value })} spellCheck={false} />
              </Field>
              <Field label="Nonce">
                <input className={inputClass} inputMode="numeric" value={form.nonce} onChange={(e) => update({ nonce: e.target.value })} />
              </Field>
            </div>
            <Field label="Caja">
              <select className={inputClass} value={form.caseId} onChange={(e) => update({ caseId: e.target.value })}>
                {MYSTERY_CASES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hash publicado (opcional)">
              <input className={inputClass} value={form.expectedHash} onChange={(e) => update({ expectedHash: e.target.value })} spellCheck={false} />
            </Field>
            <Button size="sm" fullWidth onClick={runVerify} disabled={busy}>
              {busy ? 'Calculando…' : 'Verificar'}
            </Button>

            {error && <p className="font-body text-xs text-red-400">{error}</p>}
            {result && (
              <div className="space-y-1.5 rounded-xl border border-krm-border bg-krm-card p-3 font-mono text-[11px] text-gray-300" aria-live="polite">
                <p className="break-all">SHA-256(serverSeed): {result.data.serverSeedHash}</p>
                {result.data.commitmentMatches !== null && (
                  <p className={`flex items-center gap-1 font-bold ${result.data.commitmentMatches ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.data.commitmentMatches ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    {result.data.commitmentMatches ? 'Coincide con el hash publicado' : 'NO coincide con el hash publicado'}
                  </p>
                )}
                <p className="break-all">HMAC: {result.data.hash}</p>
                <p>roll: {result.data.roll.toFixed(10)}</p>
                <p className="font-bold text-white">Premio calculado: {result.prizeName}</p>
                {result.prizeMatches !== null && (
                  <p className={`flex items-center gap-1 font-bold ${result.prizeMatches ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.prizeMatches ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    {result.prizeMatches ? 'Coincide con el premio entregado' : 'NO coincide con el premio entregado'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
