// Formato monetario es-ES (única fuente).
const EUR = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: 'always', // es-ES no agrupa los miles de 4 cifras por defecto (4990 -> 4.990)
});

/** "4.990,00 €" (es-ES). Única función de formato monetario de la UI. */
export const formatEUR = (value: number): string => EUR.format(Number.isFinite(value) ? value : 0);
