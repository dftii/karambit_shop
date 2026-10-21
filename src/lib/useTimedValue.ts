import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Estado que vuelve solo a `idle` pasados `ms` (p. ej. el "¡Copiado!" de un botón).
 * El temporizador se cancela al desmontar y se reinicia si se vuelve a llamar a `flash`.
 *
 *   const [copied, flashCopied] = useTimedValue<string | null>(null, 2000);
 *   flashCopied(serial)  ->  copied === serial durante 2 s, luego null
 */
export function useTimedValue<T>(idle: T, ms: number): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(idle);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = useCallback(
    (next: T) => {
      window.clearTimeout(timer.current);
      setValue(next);
      timer.current = window.setTimeout(() => setValue(idle), ms);
    },
    [idle, ms]
  );

  return [value, flash];
}
