// Clases compartidas de los campos del checkout (fichero aparte para no romper Fast Refresh).

/** Clases de un <input>: cuadrado, borde de 1px; foco = borde tinta + anillo rosa global; error = borde rojo. */
export function inputClasses(hasError: boolean, extra = ''): string {
  return [
    'w-full min-w-0 border bg-paper-2 px-3 py-2.5 font-body text-sm text-ink transition-colors',
    'placeholder:text-ink-3 disabled:opacity-50',
    hasError ? 'border-danger focus:border-danger' : 'border-line hover:border-ink-3 focus:border-ink',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Etiqueta mini en mono (eyebrow). */
export const LABEL_CLASSES = 'eyebrow mb-2 block';
