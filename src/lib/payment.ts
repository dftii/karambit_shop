// ─── Pasarela de pago SIMULADA: validación, formato y descripción de pagos ───
// Funciones puras. Nada de aquí contacta con ningún proveedor ni guarda números de tarjeta completos:
// en el pedido solo se registran últimos 4 dígitos + marca (ver `buildCardPaymentDetails`).
import type { Order, PaymentDetails } from '../store/useStore';
import { formatEUR } from './format';

// ─── Métodos de pago ──────────────────────────────────────────────────────────
export type CheckoutMethod = 'credit_card' | 'stripe_test' | 'bizum_apple_pay' | 'crypto' | 'steam_skins' | 'balance';

export const METHOD_LABELS: Record<CheckoutMethod, string> = {
  credit_card: 'Tarjeta',
  stripe_test: 'Stripe (modo prueba)',
  bizum_apple_pay: 'Bizum / Apple Pay',
  crypto: 'Cripto',
  steam_skins: 'Skins de Steam',
  balance: 'Saldo KRM',
};

/** Detalles de pago tal y como los guarda este checkout (campos extra sobre `PaymentDetails` del store). */
export interface ExtendedPaymentDetails extends PaymentDetails {
  cardBrand?: CardBrand;
  /** 'bizum' | 'apple_pay' | 'google_pay' */
  wallet?: string;
  /** Importe cripto mostrado (tipo de cambio DEMO), p. ej. "0.01893 ETH". */
  cryptoAmount?: string;
  /** Valor total (€) de las skins entregadas. */
  skinsValue?: number;
  /** Saldo KRM debitado (€). */
  balancePaid?: number;
  /** Tarjeta validada con Stripe en modo prueba (solo marca + últimos 4; nunca se cobra). */
  stripeTest?: boolean;
}

export const readPaymentDetails = (order: Pick<Order, 'paymentDetails'>): ExtendedPaymentDetails =>
  (order.paymentDetails ?? {}) as ExtendedPaymentDetails;

// ─── Tarjeta ──────────────────────────────────────────────────────────────────
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export const BRAND_LABELS: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  unknown: 'Tarjeta',
};

/** Tarjeta de prueba Luhn-válida para el botón de autocompletado. */
export const TEST_CARD_NUMBER = '4242424242424242';

export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

export function detectCardBrand(rawNumber: string): CardBrand {
  const n = onlyDigits(rawNumber);
  if (/^3[47]/.test(n)) return 'amex';
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (n.length >= 4) {
    const prefix = Number(n.slice(0, 4));
    if (prefix >= 2221 && prefix <= 2720) return 'mastercard';
  }
  return 'unknown';
}

/** Máximo de dígitos según marca (Amex 15, resto 16). */
export const cardMaxDigits = (brand: CardBrand): number => (brand === 'amex' ? 15 : 16);

/** Longitud del CVV según marca (Amex 4, resto 3). */
export const cvvLength = (brand: CardBrand): number => (brand === 'amex' ? 4 : 3);

/** Formatea mientras se escribe: grupos de 4 (Amex 4-6-5). */
export function formatCardNumber(raw: string): string {
  const brand = detectCardBrand(raw);
  const digits = onlyDigits(raw).slice(0, cardMaxDigits(brand));
  if (brand === 'amex') {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(' ');
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** Algoritmo de Luhn. */
export function luhnValid(rawNumber: string): boolean {
  const digits = onlyDigits(rawNumber);
  if (digits.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Formatea la caducidad mientras se escribe: "1" -> "1", "5" -> "05", "123" -> "12/3". */
export function formatExpiry(raw: string): string {
  let digits = onlyDigits(raw).slice(0, 4);
  if (digits.length >= 1 && Number(digits[0]) > 1) digits = `0${digits}`.slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** MM/YY válido, mes 1-12 y no caducada (vale hasta el último día del mes indicado). */
export function validateExpiry(expiry: string, now: Date = new Date()): string | null {
  if (/^\d{2}/.test(expiry) && (Number(expiry.slice(0, 2)) < 1 || Number(expiry.slice(0, 2)) > 12)) return 'Mes no válido';
  const m = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!m) return 'Usa el formato MM/AA';
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return 'Mes no válido';
  const startOfNextMonth = new Date(year, month, 1);
  if (startOfNextMonth <= now) return 'La tarjeta está caducada';
  if (year > now.getFullYear() + 20) return 'Fecha de caducidad no válida';
  return null;
}

/** Caducidad de prueba (MM/AA) dentro de 3 años. */
export function testExpiry(now: Date = new Date()): string {
  const year = String((now.getFullYear() + 3) % 100).padStart(2, '0');
  return `${String(now.getMonth() + 1).padStart(2, '0')}/${year}`;
}

export interface CardFields {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

/** Valores del botón "Autocompletar tarjeta de prueba" (Luhn-válida; no es una tarjeta real). */
export const buildTestCard = (now: Date = new Date()): CardFields => ({
  number: formatCardNumber(TEST_CARD_NUMBER),
  holder: 'PRO COLLECTOR',
  expiry: testExpiry(now),
  cvv: '123',
});

export type CardErrors = Partial<Record<keyof CardFields, string>>;

export function validateCard(fields: CardFields, now: Date = new Date()): CardErrors {
  const errors: CardErrors = {};
  const digits = onlyDigits(fields.number);
  const brand = detectCardBrand(digits);

  if (!digits) errors.number = 'Introduce el número de tarjeta';
  else if (brand === 'unknown') errors.number = 'Solo se admiten Visa, Mastercard o American Express';
  else if (digits.length < cardMaxDigits(brand)) errors.number = `Faltan ${cardMaxDigits(brand) - digits.length} dígitos`;
  else if (!luhnValid(digits)) errors.number = 'Número de tarjeta no válido (comprobación Luhn)';

  const holder = fields.holder.trim();
  if (!holder) errors.holder = 'El titular es obligatorio';
  else if (holder.length < 3 || !/^[\p{L}][\p{L} '.-]*$/u.test(holder)) errors.holder = 'Nombre de titular no válido';

  if (!fields.expiry) errors.expiry = 'Obligatorio';
  else {
    const expiryError = validateExpiry(fields.expiry, now);
    if (expiryError) errors.expiry = expiryError;
  }

  const cvv = onlyDigits(fields.cvv);
  const need = cvvLength(brand);
  if (!cvv) errors.cvv = 'Obligatorio';
  else if (cvv.length !== need) errors.cvv = `${need} dígitos`;

  return errors;
}

/** Solo marca + últimos 4 dígitos (nunca el número completo, ni CVV, ni caducidad, ni titular). */
export function buildCardPaymentDetails(fields: CardFields): ExtendedPaymentDetails {
  const digits = onlyDigits(fields.number);
  return {
    cardLast4: digits.slice(-4),
    cardBrand: detectCardBrand(digits),
  };
}

// ─── Identificación ───────────────────────────────────────────────────────────
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return 'El email es obligatorio';
  if (value.length > 120 || !EMAIL_PATTERN.test(value)) return 'Introduce un email válido (nombre@dominio.com)';
  return null;
}

export function validateAlias(alias: string): string | null {
  const value = alias.trim();
  if (!value) return 'El alias es obligatorio';
  if (value.length < 2) return 'Mínimo 2 caracteres';
  if (value.length > 24) return 'Máximo 24 caracteres';
  return null;
}

// ─── Bizum / carteras ─────────────────────────────────────────────────────────
export type WalletKind = 'bizum' | 'apple_pay' | 'google_pay';

export const WALLET_LABELS: Record<WalletKind, string> = {
  bizum: 'Bizum',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
};

/** Móvil español de 9 dígitos que empieza por 6 o 7 (solo para autorizar el pago Bizum simulado). */
export function validateBizumPhone(phone: string): string | null {
  const digits = onlyDigits(phone);
  if (!digits) return 'Introduce el móvil asociado a Bizum';
  if (!/^[67]\d{8}$/.test(digits)) return 'Móvil de 9 dígitos que empiece por 6 o 7';
  return null;
}

export function formatPhone(raw: string): string {
  const d = onlyDigits(raw).slice(0, 9);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(' ');
}

// ─── Cripto (tipos de cambio DEMO fijos) ──────────────────────────────────────
export type CryptoCurrency = 'USDT' | 'ETH' | 'BTC' | 'SOL';

export interface CryptoInfo {
  /** Precio de 1 unidad en EUR (valor ficticio fijo). */
  rate: number;
  decimals: number;
  network: string;
  /** Dirección de demostración: no corresponde a ninguna wallet real. */
  address: string;
}

export const CRYPTO_INFO: Record<CryptoCurrency, CryptoInfo> = {
  USDT: { rate: 0.92, decimals: 2, network: 'ERC-20 (demo)', address: '0xDEM0KRM0USDT00000000000000000000000TEST' },
  ETH: { rate: 2850, decimals: 5, network: 'Ethereum (demo)', address: '0xDEM0KRM0ETH0000000000000000000000000TEST' },
  BTC: { rate: 64200, decimals: 7, network: 'Bitcoin (demo)', address: 'bc1qdem0krm0btc0000000000000000test0000' },
  SOL: { rate: 135, decimals: 3, network: 'Solana (demo)', address: 'DEM0KRMsoL1111111111111111111111111TEST' },
};

export const CRYPTO_CURRENCIES = Object.keys(CRYPTO_INFO) as CryptoCurrency[];

export function cryptoAmount(totalEur: number, currency: CryptoCurrency): string {
  const info = CRYPTO_INFO[currency];
  return `${(totalEur / info.rate).toFixed(info.decimals)} ${currency}`;
}

// ─── Skins de Steam (inventario de demostración) ──────────────────────────────
export interface DemoSkin {
  id: string;
  name: string;
  /** Valor ficticio en EUR. */
  value: number;
  color: string;
}

export const DEMO_STEAM_ACCOUNT = {
  username: 'Ghost_Clutch_CS2',
  steamId: '76561198000000000',
} as const;

export const DEMO_SKINS: readonly DemoSkin[] = [
  { id: 's1', name: 'AK-47 | Redline (Field-Tested)', value: 28.4, color: '#eb4b4b' },
  { id: 's2', name: 'AWP | Asiimov (Well-Worn)', value: 46.9, color: '#eb4b4b' },
  { id: 's3', name: 'M4A4 | Neo-Noir (Minimal Wear)', value: 19.2, color: '#d32ce6' },
  { id: 's4', name: 'USP-S | Kill Confirmed (Field-Tested)', value: 72.5, color: '#eb4b4b' },
  { id: 's5', name: 'Glock-18 | Fade (Factory New)', value: 640, color: '#d32ce6' },
  { id: 's6', name: 'Desert Eagle | Blaze (Factory New)', value: 495, color: '#d32ce6' },
  { id: 's7', name: '★ Butterfly Knife | Doppler (Factory New)', value: 1180, color: '#ffd700' },
  { id: 's8', name: '★ Sport Gloves | Vice (Field-Tested)', value: 1450, color: '#ffd700' },
  { id: 's9', name: 'AK-47 | Fire Serpent (Minimal Wear)', value: 1100, color: '#eb4b4b' },
  { id: 's10', name: 'Souvenir P250 | Sand Dune (Factory New)', value: 6.4, color: '#8847ff' },
];

export const skinsValue = (ids: readonly string[]): number =>
  Math.round(DEMO_SKINS.filter((s) => ids.includes(s.id)).reduce((sum, s) => sum + s.value, 0) * 100) / 100;

/** Subconjunto de skins de menor valor que cubre `target` (con 10 skins basta fuerza bruta); si no alcanza, todas. */
export function autoSelectSkins(target: number): string[] {
  const n = DEMO_SKINS.length;
  let best: { mask: number; sum: number; count: number } | null = null;
  for (let mask = 1; mask < 1 << n; mask += 1) {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < n; i += 1) {
      if (mask & (1 << i)) {
        sum += DEMO_SKINS[i].value;
        count += 1;
      }
    }
    if (sum + 0.001 < target) continue;
    if (!best || sum < best.sum - 0.001 || (Math.abs(sum - best.sum) <= 0.001 && count < best.count)) {
      best = { mask, sum, count };
    }
  }
  if (!best) return DEMO_SKINS.map((s) => s.id);
  const mask = best.mask;
  return DEMO_SKINS.filter((_, i) => mask & (1 << i)).map((s) => s.id);
}

// ─── Descripción de un pago ya realizado (OrderSuccessPage / OrdersPage) ──────
export interface PaymentSummaryLine {
  label: string;
  value: string;
}

export interface PaymentSummary {
  /** Etiqueta corta: "Visa •••• 4242", "Saldo KRM", "ETH (cripto)"... */
  label: string;
  /** Líneas de detalle para mostrar bajo la etiqueta. */
  lines: PaymentSummaryLine[];
}

export function describePayment(order: Pick<Order, 'paymentMethod' | 'paymentDetails' | 'total'>): PaymentSummary {
  const d = readPaymentDetails(order);
  const lines: PaymentSummaryLine[] = [];

  switch (order.paymentMethod) {
    case 'credit_card': {
      const brand = d.cardBrand ? BRAND_LABELS[d.cardBrand] : 'Tarjeta';
      const last4 = d.cardLast4 ? `•••• ${d.cardLast4}` : '';
      if (d.cardHolder) lines.push({ label: 'Titular', value: d.cardHolder });
      return { label: `${brand} ${last4}`.trim(), lines };
    }
    case 'stripe_test': {
      const brand = d.cardBrand ? BRAND_LABELS[d.cardBrand] : 'Tarjeta';
      const last4 = d.cardLast4 ? `•••• ${d.cardLast4}` : '';
      lines.push({ label: 'Pasarela', value: 'Stripe · modo prueba (sin cargos)' });
      return { label: `${brand} ${last4}`.trim() + ' · Stripe (prueba)', lines };
    }
    case 'bizum_apple_pay': {
      const wallet = d.wallet ? WALLET_LABELS[d.wallet as WalletKind] ?? d.wallet : 'Bizum / Apple Pay';
      if (d.bizumPhone) lines.push({ label: 'Móvil', value: d.bizumPhone });
      return { label: wallet, lines };
    }
    case 'crypto': {
      if (d.cryptoAmount) lines.push({ label: 'Importe (cambio demo)', value: d.cryptoAmount });
      if (d.cryptoTx) lines.push({ label: 'Transacción simulada', value: d.cryptoTx });
      return { label: d.cryptoCurrency ? `${d.cryptoCurrency} (cripto)` : 'Cripto', lines };
    }
    case 'steam_skins': {
      const skins = d.skinsTraded ?? [];
      if (skins.length > 0) lines.push({ label: 'Skins entregadas', value: skins.join(' · ') });
      if (typeof d.skinsValue === 'number') lines.push({ label: 'Valor de las skins', value: formatEUR(d.skinsValue) });
      return { label: 'Skins de Steam', lines };
    }
    case 'balance': {
      lines.push({ label: 'Saldo KRM debitado', value: formatEUR(d.balancePaid ?? order.total) });
      return { label: 'Saldo KRM', lines };
    }
    default:
      return { label: String(order.paymentMethod || 'Pago simulado'), lines };
  }
}
