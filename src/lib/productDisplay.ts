import type { Product } from '../data/karambits';

/** Nombre de la skin sin el prefijo común "Karambit | ". */
export const skinName = (name: string) => name.replace(/^★? ?Karambit \| /, '');

/** Etiquetas de estado de una tarjeta (máx. 2). */
export const productTags = (product: Product): string[] => {
  const tags: string[] = [];
  if (product.isOneOfOne) tags.push('1 de 1');
  if (product.isLimitedEdition) tags.push('Edición limitada');
  if (product.isNew) tags.push('Nuevo');
  return tags.slice(0, 2);
};

/** Cifras del contador StatTrak™ tal y como se grabarán (mínimo 3 dígitos). */
export const formatStatTrak = (value: string) => String(value || '000').padStart(3, '0');
