import React, { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useToastStore, type ToastItem, type ToastType } from '../../lib/toast';

// Toast editorial: tinta con texto papel y filete izquierdo de 3px. Rosa por defecto; error en rojo.
const STYLES: Record<ToastType, { rule: string; label: string }> = {
  success: { rule: 'border-l-pink', label: 'Hecho' },
  error: { rule: 'border-l-danger', label: 'Error' },
  warning: { rule: 'border-l-pink', label: 'Aviso' },
  info: { rule: 'border-l-pink', label: 'Info' },
};

const ToastCard: React.FC<{ toast: ToastItem; reduced: boolean }> = ({ toast, reduced }) => {
  const dismiss = useToastStore((s) => s.dismiss);
  const style = STYLES[toast.type];

  // Auto-cierre: el temporizador se limpia al desmontar o al cerrar a mano.
  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <motion.div
      layout={!reduced}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }}
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex items-start gap-3 border-l-[3px] bg-ink px-4 py-3 text-paper shadow-overlay ${style.rule}`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] font-medium uppercase leading-tight tracking-[0.08em] text-paper/60">
          {toast.title ?? style.label}
        </p>
        <p className="mt-1 break-words font-body text-sm leading-snug text-paper">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="-mr-1 shrink-0 p-1 text-paper/60 transition-colors hover:text-pink"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
};

/** Región aria-live con las notificaciones. Montar una sola vez (App). */
export const Toaster: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const reduced = useReducedMotion() ?? false;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[200] flex flex-col gap-2 sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} reduced={reduced} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toaster;
