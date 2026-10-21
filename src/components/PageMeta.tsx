import React from 'react';

interface PageMetaProps {
  /** Nombre de la página; el título final es `${title} | KRM.GG`. */
  title: string;
  description: string;
  /** Página privada o sin valor de búsqueda (p. ej. 404, pedidos). */
  noindex?: boolean;
}

/**
 * Título y meta description por ruta. React 19 eleva <title> y <meta> al <head>,
 * así que puede renderizarse dentro de la página.
 */
export const PageMeta: React.FC<PageMetaProps> = ({ title, description, noindex = false }) => (
  <>
    <title>{`${title} | KRM.GG`}</title>
    <meta name="description" content={description} />
    {noindex && <meta name="robots" content="noindex, nofollow" />}
  </>
);

export default PageMeta;
