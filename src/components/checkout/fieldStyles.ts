// Clases compartidas de los campos del checkout (fichero aparte para no romper Fast Refresh).

/** Clases de un <input>: borde ámbar al enfocar, rojo si hay error. */
export function inputClasses(hasError: boolean, extra = ''): string {
  return [
    'w-full min-w-0 rounded-xl border bg-krm-card px-3.5 py-2.5 text-sm text-white outline-none transition-colors',
    'placeholder:text-gray-600 disabled:opacity-50',
    hasError
      ? 'border-red-500/60 focus:border-red-400'
      : 'border-krm-border-strong focus:border-krm-accent',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

export const LABEL_CLASSES = 'mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-gray-400';
