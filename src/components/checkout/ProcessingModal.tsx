import React from 'react';
import { motion } from 'framer-motion';
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
  const stepIndex = Math.min(state.step, STEP_COUNT);
  const current = steps[stepIndex - 1];

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
      panelClassName={`border-t-2 p-6 sm:p-8 ${failed ? 'border-t-danger' : 'border-t-ink'}`}
    >
      {failed ? (
        <div className="space-y-5">
          <p className="eyebrow text-danger">Pago rechazado</p>
          <h2 className="display-md">
            {state.errorKind === 'declined' ? 'Transacción rechazada' : 'No se pudo crear el pedido'}
          </h2>
          <p
            role="alert"
            className="border-l-2 border-danger pl-4 font-body text-sm leading-relaxed text-ink-2"
          >
            {state.error}
          </p>
          {state.errorKind === 'declined' && (
            <p className="font-body text-xs text-ink-3">
              Es un rechazo simulado (Modo simulación: pago rechazado). Reintentar lo repetirá igual.
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button fullWidth onClick={onRetry}>
              Reintentar
            </Button>
            <Button fullWidth variant="secondary" onClick={state.errorKind === 'store' ? onReviewCart : onChangeMethod}>
              {state.errorKind === 'store' ? 'Revisar carrito' : 'Cambiar método'}
            </Button>
          </div>
          {state.errorKind === 'declined' && (
            <Button variant="link" size="sm" onClick={onRetryApproved}>
              Cambiar a «pago aprobado» y reintentar
            </Button>
          )}
          {state.errorKind === 'store' && (
            <Button variant="link" size="sm" onClick={onChangeMethod}>
              Cambiar método
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6" role="status" aria-live="polite">
          <div>
            <p className="eyebrow">
              Paso {String(stepIndex).padStart(2, '0')} de {String(STEP_COUNT).padStart(2, '0')}
            </p>
            <h2 className="display-md mt-3">{current.title}</h2>
          </div>

          <div className="h-0.5 w-full bg-line">
            <motion.div
              className="h-full bg-pink"
              initial={{ width: '10%' }}
              animate={{ width: PROGRESS[stepIndex - 1] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <ol className="divide-y divide-line border-y border-line">
            {steps.map((step, index) => {
              const n = index + 1;
              const reached = state.step >= n;
              const finished = state.step > n || state.phase === 'done';
              return (
                <li key={step.done} className="flex items-baseline gap-3 py-2.5">
                  <span className={`font-mono text-[11px] ${reached ? 'text-ink' : 'text-ink-3'}`}>
                    {String(n).padStart(2, '0')}
                  </span>
                  <span
                    className={`flex-1 font-body text-[13px] leading-snug ${
                      finished ? 'text-ink' : reached ? 'text-ink' : 'text-ink-3'
                    }`}
                  >
                    {step.done}
                  </span>
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.08em] ${
                      finished ? 'text-success' : reached ? 'text-pink-ink' : 'text-ink-3'
                    }`}
                  >
                    {finished ? 'Hecho' : reached ? 'En curso' : 'Espera'}
                  </span>
                </li>
              );
            })}
          </ol>

          <p className="font-body text-xs text-ink-3">Pasarela simulada: no se realiza ningún cargo real.</p>

          {canCancel && (
            <Button variant="link" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ProcessingModal;
