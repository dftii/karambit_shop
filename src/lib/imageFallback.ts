import type { SyntheticEvent } from 'react';

/**
 * onError para <img> sueltas: oculta la imagen rota y deja visible el fondo/degradado del contenedor
 * (en vez de mostrar el icono de imagen rota y el texto alternativo).
 */
export function hideBrokenImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.visibility = 'hidden';
}
