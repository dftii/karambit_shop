import { useCallback, useEffect, useRef, useState } from 'react';
import type { Order, PlaceOrderResult } from '../../store/useStore';

/** Fases del pago simulado. `done` = pedido creado (la página navega a /order-success/:id). */
export type RunnerPhase = 'idle' | 'running' | 'failed' | 'done';

export interface RunnerState {
  phase: RunnerPhase;
  /** Paso actual (1..STEP_COUNT) mientras corre. */
  step: number;
  error: string | null;
  /** `declined`: rechazo simulado de la entidad · `store`: el store rechazó el pedido (saldo, pieza 1-of-1...). */
  errorKind: 'declined' | 'store' | null;
}

export const STEP_COUNT = 4;
/** Duración (ms) de cada paso; el último termina con la creación real del pedido en el store. */
const STEP_MS = [800, 900, 900, 900] as const;

const INITIAL: RunnerState = { phase: 'idle', step: 1, error: null, errorKind: null };

export interface StartOptions {
  /** Si es true, la secuencia termina en rechazo tras el paso 2 (modo simulación: pago rechazado). */
  decline: boolean;
  declineMessage: string;
  /** Crea el pedido (punto de no retorno, síncrono). */
  commit: () => PlaceOrderResult;
  onSuccess: (order: Order) => void;
}

class AbortedError extends Error {}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new AbortedError());
      return;
    }
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new AbortedError());
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Secuencia de pago simulada: UNA sola promesa cancelable (AbortController).
 * - `start` ignora llamadas mientras haya una secuencia en curso (sin doble envío).
 * - Al desmontar se aborta y nunca se hace setState después.
 * - `cancel` solo vale antes del último paso (el pedido aún no se ha creado).
 */
export function useCheckoutRunner() {
  const [state, setState] = useState<RunnerState>(INITIAL);
  const controllerRef = useRef<AbortController | null>(null);
  const stepRef = useRef(1);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    },
    []
  );

  const start = useCallback(async (options: StartOptions) => {
    if (controllerRef.current) return;
    const controller = new AbortController();
    const { signal } = controller;
    controllerRef.current = controller;

    const update = (next: RunnerState) => {
      if (signal.aborted) throw new AbortedError();
      stepRef.current = next.step;
      setState(next);
    };
    const running = (step: number): RunnerState => ({ phase: 'running', step, error: null, errorKind: null });

    try {
      update(running(1));
      await sleep(STEP_MS[0], signal);

      update(running(2));
      await sleep(STEP_MS[1], signal);

      if (options.decline) {
        update({ phase: 'failed', step: 2, error: options.declineMessage, errorKind: 'declined' });
        return;
      }

      update(running(3));
      await sleep(STEP_MS[2], signal);

      update(running(4));
      await sleep(STEP_MS[3], signal);

      if (signal.aborted) throw new AbortedError();
      const result = options.commit();
      if (!result.ok) {
        update({ phase: 'failed', step: 4, error: result.error, errorKind: 'store' });
        return;
      }
      update({ phase: 'done', step: 4, error: null, errorKind: null });
      options.onSuccess(result.order);
    } catch (error) {
      if (!(error instanceof AbortedError)) throw error;
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  const canCancel = state.phase === 'running' && state.step < STEP_COUNT;

  const cancel = useCallback(() => {
    if (!controllerRef.current || stepRef.current >= STEP_COUNT) return;
    controllerRef.current.abort();
    controllerRef.current = null;
    stepRef.current = 1;
    setState(INITIAL);
  }, []);

  /** Cierra el estado de error y vuelve al formulario. */
  const dismiss = useCallback(() => {
    if (controllerRef.current) return;
    stepRef.current = 1;
    setState(INITIAL);
  }, []);

  return { state, start, cancel, dismiss, canCancel };
}
