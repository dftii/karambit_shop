import React from 'react';
import type { CartItem } from '../../lib/cart';
import { isSingleUnitLine } from './isSingleUnitLine';

/** Opciones de una línea (1 de 1, desgaste, filo, StatTrak™, NameTag, soporte, Kydex) como texto. */
function lineOptions(item: CartItem): string[] {
  const out: string[] = [];
  if (isSingleUnitLine(item)) out.push('1 de 1');
  if (item.condition) out.push(item.condition);
  if (item.bladeType) out.push(item.bladeType.includes('Afilada') ? 'Afilada (real)' : 'Sin filo');
  if (item.statTrak) out.push(`StatTrak™ #${String(item.statTrakCount ?? '000').padStart(3, '0')}`);
  if (item.nameTag) out.push(`"${item.nameTag}"`);
  if (item.standIncluded) out.push('Soporte acrílico');
  if (item.kydexIncluded) out.push('Funda Kydex');
  return out;
}

/**
 * Opciones de una línea de carrito/pedido en una sola línea mono separada por « · ».
 * Compartido por carrito, checkout, certificado e historial.
 */
export const LineBadges: React.FC<{ item: CartItem; className?: string }> = ({ item, className = '' }) => {
  const options = lineOptions(item);
  if (options.length === 0) return null;
  return (
    <p className={`font-mono text-[11px] leading-relaxed text-ink-2 [overflow-wrap:anywhere] ${className}`}>
      {options.join(' · ')}
    </p>
  );
};

export default LineBadges;
