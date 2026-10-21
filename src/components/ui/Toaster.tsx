import React, { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore, type ToastItem, type ToastType } from '../../lib/toast';

const STYLES: Record<ToastType, { icon: React.ReactNode; border: string; iconColor: string }> = {
  success: { icon: <CheckCircle2 className="w-5 h-5" />, border: 'border-emerald-500/40', iconColor: 'text-emerald-400' },
  error: { icon: <XCircle className="w-5 h-5" />, border: 'border-red-500/40', iconColor: 'text-red-400' },
  warning: { icon: <AlertTriangle className="w-5 h-5" />, border: 'border-krm-accent/40', iconColor: 'text-krm-accent' },
  info: { icon: <Info className="w-5 h-5" />, border: 'border-sky-500/40', iconColor: 'text-sky-400' },
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
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-krm-panel/95 backdrop-blur-md px-4 py-3 shadow-2xl shadow-black/60 ${style.border}`}
    >
      <span className={`mt-0.5 shrink-0 ${style.iconColor}`} aria-hidden="true">
        {style.icon}
      </span>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-display font-black uppercase tracking-wider text-sm text-white leading-tight">
            {toast.title}
          </p>
        )}
        <p className="font-body text-sm text-gray-300 leading-snug break-words">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="shrink-0 p-1 -mr-1 rounded-lg text-gray-500 hover:text-white hover:bg-krm-border transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
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
      className="pointer-events-none fixed z-[200] inset-x-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 sm:w-full sm:max-w-md flex flex-col gap-2"
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
