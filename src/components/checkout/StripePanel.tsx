import React, { useEffect, useId, useRef, useState } from 'react';
import type { StripeCardElement, StripeCardElementOptions } from '@stripe/stripe-js';
import {
  createTestPaymentMethod,
  loadStripeTest,
  type StripeCardController,
  type StripeStatus,
} from '../../lib/stripe';
import { Button } from '../ui/Button';
import { LABEL_CLASSES } from './fieldStyles';

interface StripePanelProps {
  /** Error devuelto por Stripe al pagar (se muestra bajo el campo). */
  payError: string | null;
  /** Bloquea el campo mientras se valida el pago. */
  disabled: boolean;
  /** Se llama en cada cambio del campo (carga, edición, completado); la página lo usa para habilitar «Pagar». */
  onStatusChange: (status: StripeStatus) => void;
  /** Entrega (o retira, con `null`) las acciones del Card Element a la página. */
  onController: (controller: StripeCardController | null) => void;
}

// Fuente Geist (la misma de la web): el iframe de Stripe no hereda las fuentes de la página.
const FONTS = [
  { cssSrc: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500&display=swap' },
];
const FONT_FAMILY = 'Geist, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// Colores del sistema de diseño: ink #111, ink-3 #7D766D, danger #C8102E.
const CARD_OPTIONS: StripeCardElementOptions = {
  hidePostalCode: true,
  style: {
    base: {
      color: '#111111',
      iconColor: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#7D766D' },
    },
    invalid: { color: '#C8102E', iconColor: '#C8102E' },
  },
};

/** Card Element de Stripe (modo prueba) dentro de un campo con borde de 1px como el resto de inputs. */
export const StripePanel: React.FC<StripePanelProps> = ({ payError, disabled, onStatusChange, onController }) => {
  const uid = useId();
  const mountRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<StripeCardElement | null>(null);
  const [status, setStatus] = useState<StripeStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const [focused, setFocused] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Callbacks siempre actuales sin reiniciar el efecto de montaje.
  const callbacksRef = useRef({ onStatusChange, onController });
  useEffect(() => {
    callbacksRef.current = { onStatusChange, onController };
  });

  useEffect(() => {
    let cancelled = false;
    let element: StripeCardElement | null = null;

    const report = (next: StripeStatus) => {
      setStatus(next);
      callbacksRef.current.onStatusChange(next);
    };

    report('loading');

    loadStripeTest()
      .then((stripe) => {
        const container = mountRef.current;
        if (cancelled || !container) return;
        const elements = stripe.elements({ locale: 'es', fonts: FONTS });
        const card = elements.create('card', CARD_OPTIONS);
        element = card;
        elementRef.current = card;
        card.on('ready', () => {
          if (!cancelled) report('incomplete');
        });
        card.on('change', (event) => {
          if (cancelled) return;
          setFieldError(event.error?.message ?? null);
          report(event.complete && !event.error ? 'complete' : 'incomplete');
        });
        card.on('focus', () => setFocused(true));
        card.on('blur', () => setFocused(false));
        card.mount(container);
        callbacksRef.current.onController({
          createPaymentMethod: (billing) => createTestPaymentMethod(stripe, card, billing),
        });
      })
      .catch(() => {
        if (!cancelled) report('error');
      });

    return () => {
      cancelled = true;
      callbacksRef.current.onController(null);
      elementRef.current = null;
      // Destruir el Element libera el iframe de Stripe al cambiar de método o salir de la página.
      element?.destroy();
    };
  }, [attempt]);

  useEffect(() => {
    elementRef.current?.update({ disabled });
  }, [disabled, status]);

  const message = payError ?? fieldError;
  const failed = status === 'error';

  return (
    <div className="space-y-5">
      <p className="border-l-2 border-pink pl-4 font-body text-xs leading-relaxed text-ink-2">
        Modo prueba de Stripe: usa la tarjeta{' '}
        <strong className="font-mono font-medium text-ink">4242 4242 4242 4242</strong>, cualquier fecha futura y cualquier
        CVC. Nunca se cobra nada. A Stripe solo se envían la tarjeta de prueba, tu alias y tu email.
      </p>

      <div>
        <span id={`${uid}-label`} className={LABEL_CLASSES}>
          Tarjeta de prueba (Stripe)
        </span>

        {failed && (
          <div role="alert" className="space-y-3 border border-danger bg-paper-2 px-3 py-3">
            <p className="font-body text-sm text-danger">
              No se ha podido cargar Stripe (¿conexión o bloqueador de contenido?). Reintenta o elige otro método de pago.
            </p>
            <Button size="sm" variant="secondary" onClick={() => setAttempt((n) => n + 1)}>
              Reintentar
            </Button>
          </div>
        )}

        {/* El contenedor siempre existe (Stripe monta aquí su iframe); se oculta si la carga falla. */}
        <div
          className={`relative border bg-paper-2 px-3 py-3 transition-colors ${failed ? 'hidden' : ''} ${
            message ? 'border-danger' : focused ? 'border-ink' : 'border-line hover:border-ink-3'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          {status === 'loading' && (
            <p className="absolute inset-0 flex items-center px-3 font-body text-sm text-ink-3" aria-live="polite">
              Cargando Stripe…
            </p>
          )}
          <div ref={mountRef} aria-labelledby={`${uid}-label`} className={status === 'loading' ? 'invisible min-h-5' : 'min-h-5'} />
        </div>

        {message && !failed && (
          <p role="alert" className="mt-1.5 font-body text-xs text-danger">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default StripePanel;
