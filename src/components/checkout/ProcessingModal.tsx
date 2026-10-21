import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2, RotateCw, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { STEP_COUNT, type RunnerState } from './useCheckoutRunner';

interface ProcessingModalProps {
  state: RunnerState;
  /** Texto del paso 2 según el método (3D-Secure, red cripto, oferta de Steam...). */
  verifyLabel: string;
  canCancel: boolean;
  onCancel: () => void;
  onRetry: () => void;
  /** Cambia el modo simulación a «pago aprobado» y reintenta (solo en rechazos simulados). */
  onRetryApproved: () => void;
  onChangeMethod: () => void;
  onReviewCart: () => void;
}

const PROGRESS = ['25%', '55%', '80%', '100%'] as const;

/** Overlay del pago simulado: pasos, progreso, cancelación y vista de rechazo (Reintentar / Cambiar método). */
export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  state,
  verifyLabel,
  canCancel,
  onCancel,
  onRetry,
  onRetryApproved,
  onChangeMethod,
  onReviewCart,
}) => {
  const open = state.phase !== 'idle';
  const failed = state.phase === 'failed';

  const steps = [
    { title: 'Conectando con la pasarela simulada...', done: 'Conexión segura simulada establecida' },
    { title: `${verifyLabel}...`, done: verifyLabel },
    { title: 'Grabando StatTrak™, NameTag y serial en taller...', done: 'Grabado láser de seriales de acero 440C' },
    { title: 'Pago verificado. Generando certificado...', done: 'Emisión del certificado de autenticidad digital' },
  ];
  const current = steps[Math.min(state.step, STEP_COUNT) - 1];

  const handleClose = () => {
    if (failed) onChangeMethod();
    else if (canCancel) onCancel();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      ariaLabel={failed ? 'Pago rechazado' : 'Procesando pago simulado'}
      size="sm"
      closeOnBackdrop={false}
      zIndex={200}
      panelClassName="rounded-3xl border border-krm-border-strong bg-krm-surface p-6 text-center shadow-2xl sm:p-8"
    >
      {failed ? (
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
            <AlertCircle className="h-9 w-9" />
          </div>
          <h2 className="font-display text-2xl font-black uppercase text-white">
            {state.errorKind === 'declined' ? 'Transacción rechazada' : 'No se pudo crear el pedido'}
          </h2>
          <p
            role="alert"
            className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-left font-body text-xs leading-relaxed text-red-300"
          >
            {state.error}
          </p>
          {state.errorKind === 'declined' && (
            <p className="font-body text-[11px] text-gray-500">
              Es un rechazo simulado (Modo simulación: pago rechazado). Reintentar lo repetirá igual.
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button fullWidth icon={<RotateCw className="h-4 w-4" />} onClick={onRetry}>
              Reintentar
            </Button>
            <Button fullWidth variant="secondary" onClick={state.errorKind === 'store' ? onReviewCart : onChangeMethod}>
              {state.errorKind === 'store' ? 'Revisar carrito' : 'Cambiar método'}
            </Button>
          </div>
          {state.errorKind === 'declined' && (
            <Button fullWidth variant="ghost" size="sm" onClick={onRetryApproved}>
              Cambiar a «pago aprobado» y reintentar
            </Button>
          )}
          {state.errorKind === 'store' && (
            <Button fullWidth variant="ghost" size="sm" onClick={onChangeMethod}>
              Cambiar método
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6" role="status" aria-live="polite">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30">
            <Zap className="h-8 w-8 motion-safe:animate-pulse" />
          </div>

          <div>
            <span className="rounded-full border border-krm-accent/20 bg-krm-accent/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-krm-accent">
              Paso {Math.min(state.step, STEP_COUNT)} de {STEP_COUNT}
            </span>
            <h2 className="mt-3 font-display text-xl font-black uppercase text-white sm:text-2xl">{current.title}</h2>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-krm-card-alt p-0.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400"
              initial={{ width: '10%' }}
              animate={{ width: PROGRESS[Math.min(state.step, STEP_COUNT) - 1] }}
              transition={{ duration: 0.6 }}
            />
          </div>

          <ul className="space-y-2 text-left font-body text-xs">
            {steps.map((step, index) => {
              const n = index + 1;
              const reached = state.step >= n;
              const finished = state.step > n || state.phase === 'done';
              return (
                <li
                  key={step.done}
                  className={`flex items-center gap-2.5 ${
                    finished ? 'text-emerald-400' : reached ? 'text-krm-accent' : 'text-gray-600'
                  }`}
                >
                  {reached && !finished ? (
                    <Loader2 className="h-4 w-4 shrink-0 motion-safe:animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  )}
                  <span>{step.done}</span>
                </li>
              );
            })}
          </ul>

          <p className="font-body text-[11px] text-gray-500">Pasarela simulada: no se realiza ningún cargo real.</p>

          {canCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ProcessingModal;
