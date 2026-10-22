import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { buttonClasses } from '../components/ui/buttonStyles';
import { PageMeta } from '../components/PageMeta';

interface NotFoundPageProps {
  /** Etiqueta mono sobre el título (por defecto "Error 404"). */
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Texto grande del fondo (por defecto "404"). */
  code?: string;
}

/**
 * 404 editorial. Se usa como `path="*"` y desde páginas con parámetro inválido
 * (p. ej. /product/slug-inexistente, /order-success/id-inexistente).
 */
export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  eyebrow = 'Error 404',
  title = 'Esta página no existe',
  description = 'La ruta que buscas no existe o la pieza ya no está en el catálogo. Vuelve al catálogo y sigue explorando.',
  code = '404',
}) => {
  const reduced = useReducedMotion() ?? false;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageMeta title="Página no encontrada" description="La página que buscas no existe o se ha movido. Vuelve al catálogo de karambits de KRM—GG." noindex />
      <div className="wrap">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.3, ease: 'easeOut' }}
          className="border-b border-line py-16 sm:py-24"
        >
          <p className="eyebrow">{eyebrow}</p>
          <p aria-hidden="true" className="display-hero mt-4 break-words text-ink">
            {code}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12">
            <h1 className="display-lg md:col-span-7">{title}</h1>
            <div className="md:col-span-5">
              <p className="max-w-md font-body text-base leading-relaxed text-ink-2">{description}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link to="/shop" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
                  Ver catálogo
                </Link>
                <Link to="/" className={buttonClasses({ variant: 'link', size: 'md' })}>
                  Ir al inicio
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default NotFoundPage;
