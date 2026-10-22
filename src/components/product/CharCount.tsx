import React from 'react';

/**
 * Contador de caracteres solo para lectores de pantalla (no cambia el aspecto). El recuento va
 * enlazado con `aria-describedby` (se lee al enfocar el campo) y la región `status` solo anuncia
 * algo al llegar al límite, para no interrumpir cada pulsación.
 */
export const CharCount: React.FC<{ id: string; length: number; max: number }> = ({ id, length, max }) => (
  <>
    <span id={id} className="sr-only">
      {length} de {max} caracteres
    </span>
    <span role="status" className="sr-only">
      {length >= max ? `Límite de ${max} caracteres alcanzado` : ''}
    </span>
  </>
);

export default CharCount;
