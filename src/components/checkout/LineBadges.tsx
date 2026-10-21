import React from 'react';
import { Layers, Package, Tag, Zap } from 'lucide-react';
import type { CartItem } from '../../lib/cart';
import { Badge } from '../ui/Badge';
import { isSingleUnitLine } from './isSingleUnitLine';

/**
 * Opciones de una línea de carrito/pedido como etiquetas: 1 of 1, desgaste, filo, StatTrak™ (contador),
 * NameTag, soporte y funda Kydex. Compartido por carrito, checkout, certificado e historial.
 */
export const LineBadges: React.FC<{ item: CartItem; className?: string }> = ({ item, className = '' }) => (
  <div className={`flex flex-wrap gap-1 ${className}`}>
    {isSingleUnitLine(item) && (
      <Badge tone="purple" icon={<Layers className="h-3 w-3" />}>
        1 of 1
      </Badge>
    )}
    {item.condition && <Badge tone={item.condition === 'Battle-Scarred' ? 'amber' : 'emerald'}>{item.condition}</Badge>}
    {item.bladeType && <Badge tone="gray">{item.bladeType.includes('Afilada') ? 'Afilada (real)' : 'Sin filo'}</Badge>}
    {item.statTrak && (
      <Badge tone="amber" icon={<Zap className="h-3 w-3" />}>
        StatTrak™ #{String(item.statTrakCount ?? '000').padStart(3, '0')}
      </Badge>
    )}
    {item.nameTag && (
      <Badge tone="gray" icon={<Tag className="h-3 w-3" />}>
        &quot;{item.nameTag}&quot;
      </Badge>
    )}
    {item.standIncluded && (
      <Badge tone="sky" icon={<Package className="h-3 w-3" />}>
        Soporte acrílico
      </Badge>
    )}
    {item.kydexIncluded && <Badge tone="purple">Funda Kydex</Badge>}
  </div>
);

export default LineBadges;
