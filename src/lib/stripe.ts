// ─── Stripe en MODO PRUEBA (opcional) ─────────────────────────────────────────
// La web es estática (GitHub Pages, sin backend): no se crean PaymentIntents ni se cobra nada nunca.
// Solo se genera un PaymentMethod de prueba con el Card Element para leer marca + últimos 4 dígitos;
// el pedido sigue pasando por la pasarela simulada. Stripe.js se carga bajo demanda (import dinámico):
// no entra en el bundle principal y no se contacta con Stripe hasta que se elige este método.
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import type { CardBrand } from './payment';

const RAW_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

/** Clave publicable de prueba, o `null` si falta o no es `pk_test_` (las claves `pk_live_` se rechazan siempre). */
export const STRIPE_TEST_KEY: string | null =
  typeof RAW_KEY === 'string' && /^pk_test_[A-Za-z0-9_]{8,}$/.test(RAW_KEY.trim()) ? RAW_KEY.trim() : null;

/** El método "Stripe (modo prueba)" solo existe si hay una clave `pk_test_` válida. */
export const STRIPE_TEST_ENABLED = STRIPE_TEST_KEY !== null;

const LOAD_TIMEOUT_MS = 15000;

let stripePromise: Promise<Stripe> | null = null;

/** Carga Stripe.js (una sola vez) con la clave de prueba. Rechaza si no hay clave de prueba, falla la red o tarda demasiado. */
export function loadStripeTest(): Promise<Stripe> {
  const key = STRIPE_TEST_KEY;
  if (!key) return Promise.reject(new Error('Stripe en modo prueba no está configurado'));
  if (!stripePromise) {
    const load = import('@stripe/stripe-js/pure').then(async ({ loadStripe }) => {
      const stripe = await loadStripe(key);
      if (!stripe) throw new Error('Stripe.js no está disponible');
      return stripe;
    });
    const timeout = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('Stripe.js tarda demasiado en cargar')), LOAD_TIMEOUT_MS);
    });
    stripePromise = Promise.race([load, timeout]);
    // Si falla se descarta la promesa guardada para poder reintentar.
    stripePromise.catch(() => {
      stripePromise = null;
    });
  }
  return stripePromise;
}

/** Resumen de la tarjeta de prueba: lo único que se guarda en el pedido (nunca el id del PaymentMethod). */
export interface StripeTestCard {
  brand: CardBrand;
  last4: string;
}

export type StripeTestResult = { ok: true; card: StripeTestCard } | { ok: false; error: string };

export interface StripeBilling {
  name: string;
  email: string;
}

/** Estado del Card Element: cargando Stripe.js · fallo de carga · tarjeta incompleta/inválida · lista para pagar. */
export type StripeStatus = 'loading' | 'error' | 'incomplete' | 'complete';

/** Acciones que el panel Stripe expone a la página de checkout. */
export interface StripeCardController {
  createPaymentMethod: (billing: StripeBilling) => Promise<StripeTestResult>;
}

/** Marca de Stripe → marca interna (las no soportadas se muestran como "Tarjeta"). */
function mapBrand(stripeBrand: string | undefined): CardBrand {
  return stripeBrand === 'visa' || stripeBrand === 'mastercard' || stripeBrand === 'amex' ? stripeBrand : 'unknown';
}

/** `stripe.createPaymentMethod` con el Card Element montado. Devuelve el error de Stripe (ya en español) o marca + last4. */
export async function createTestPaymentMethod(
  stripe: Stripe,
  card: StripeCardElement,
  billing: StripeBilling
): Promise<StripeTestResult> {
  try {
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card,
      billing_details: { name: billing.name, email: billing.email },
    });
    if (error) return { ok: false, error: error.message ?? 'Stripe no ha podido validar la tarjeta de prueba.' };
    const last4 = paymentMethod.card?.last4;
    if (!last4) return { ok: false, error: 'Stripe no ha devuelto los datos de la tarjeta de prueba.' };
    return { ok: true, card: { brand: mapBrand(paymentMethod.card?.brand), last4 } };
  } catch {
    return { ok: false, error: 'No se ha podido contactar con Stripe. Revisa tu conexión e inténtalo de nuevo.' };
  }
}
