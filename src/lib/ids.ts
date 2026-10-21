// ─── Generación de identificadores (pedidos, seriales, certificados) ─────────
// Usa crypto.getRandomValues (disponible también fuera de contextos seguros,
// a diferencia de crypto.randomUUID) con un alfabeto legible sin caracteres
// ambiguos (sin 0/O, 1/I). 32 símbolos => 5 bits por carácter, sin sesgo.

const SYMBOLS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 símbolos, sin 0/O ni 1/I

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
    return bytes;
  }
  // Último recurso (entornos sin Web Crypto): no debería ocurrir en navegadores modernos.
  for (let i = 0; i < length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return bytes;
}

/** Cadena aleatoria legible de `length` caracteres (mayúsculas + dígitos sin ambigüedad). */
export function randomToken(length: number): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += SYMBOLS[bytes[i] & 31];
  }
  return out;
}

/** Token agrupado en bloques de `group` caracteres separados por guion (p. ej. 7K3Q-9XM2). */
function groupedToken(length: number, group: number): string {
  const raw = randomToken(length);
  const parts: string[] = [];
  for (let i = 0; i < raw.length; i += group) parts.push(raw.slice(i, i + group));
  return parts.join('-');
}

const currentYear = () => new Date().getFullYear();

/** `KRM-2026-7K3Q-9XM2` (40 bits de entropía). */
export function generateOrderId(isTaken?: (id: string) => boolean): string {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = `KRM-${currentYear()}-${groupedToken(8, 4)}`;
    if (!isTaken || !isTaken(id)) return id;
  }
  return `KRM-${currentYear()}-${groupedToken(12, 4)}`;
}

/** `SN-440C-7K3Q-9XM2` (40 bits de entropía). */
export function generateSerialNumber(isTaken?: (serial: string) => boolean): string {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const serial = `SN-440C-${groupedToken(8, 4)}`;
    if (!isTaken || !isTaken(serial)) return serial;
  }
  return `SN-440C-${groupedToken(12, 4)}`;
}

/** `CERT-KRM-2026-7K3Q9-XM2PT` (50 bits de entropía). */
export function generateCertificateId(): string {
  return `CERT-KRM-${currentYear()}-${groupedToken(10, 5)}`;
}

/** Hash de transacción cripto simulado (`0x...`), solo para el flujo de pago simulado. */
export function generateTxHash(): string {
  const bytes = randomBytes(16);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `0x${hex.slice(0, 12)}...${hex.slice(-6)}`;
}

// ─── Seriales por unidad ──────────────────────────────────────────────────────
/** Clave del serial de la unidad `unit` (1-based) de una línea de carrito. */
export function serialKey(lineId: string, unit: number): string {
  return `${lineId}#${unit}`;
}

/** Seriales (uno por unidad) de una línea dentro de `Order.serialNumbers`. */
export function getLineSerials(
  serialNumbers: Record<string, string> | undefined,
  lineId: string,
  quantity: number
): string[] {
  const serials: string[] = [];
  for (let unit = 1; unit <= Math.max(1, quantity); unit += 1) {
    const serial = serialNumbers?.[serialKey(lineId, unit)];
    if (serial) serials.push(serial);
  }
  return serials;
}
