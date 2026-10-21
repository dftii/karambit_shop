// ─── Notificaciones (toast) ──────────────────────────────────────────────────
// API imperativa sin dependencias de componentes (se puede llamar desde store/lib/handlers):
//   toast('Mensaje')                       -> info
//   toast.success('Hecho') · toast.error('Algo falló') · toast.warning('Ojo') · toast.info('Aviso')
//   toast('Mensaje', { type, title, duration })   duration en ms (0 = no se cierra solo)
//   toast.dismiss(id?)                     -> cierra uno (o todos si no hay id)
// El render lo hace <Toaster /> (src/components/ui/Toaster.tsx), montado una vez en App.
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  /** ms antes de cerrarse solo; 0 = permanente hasta que el usuario lo cierre. */
  duration: number;
}

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  push: (item: Omit<ToastItem, 'id'>) => number;
  dismiss: (id?: number) => void;
}

const MAX_VISIBLE = 4;
const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3500,
  info: 4000,
  warning: 5000,
  error: 6000,
};

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (item) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { ...item, id }].slice(-MAX_VISIBLE) }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ toasts: id === undefined ? [] : state.toasts.filter((t) => t.id !== id) })),
}));

function show(message: string, options: ToastOptions = {}): number {
  const type = options.type ?? 'info';
  return useToastStore.getState().push({
    type,
    title: options.title,
    message,
    duration: options.duration ?? DEFAULT_DURATION[type],
  });
}

type TypedShow = (message: string, options?: Omit<ToastOptions, 'type'>) => number;

export const toast = Object.assign(show, {
  success: ((message, options) => show(message, { ...options, type: 'success' })) as TypedShow,
  error: ((message, options) => show(message, { ...options, type: 'error' })) as TypedShow,
  warning: ((message, options) => show(message, { ...options, type: 'warning' })) as TypedShow,
  info: ((message, options) => show(message, { ...options, type: 'info' })) as TypedShow,
  dismiss: (id?: number) => useToastStore.getState().dismiss(id),
});
