import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Crosshair, Home, Package } from 'lucide-react';
import { buttonClasses } from '../components/ui/buttonStyles';
import { PageMeta } from '../components/PageMeta';

interface NotFoundPageProps {
  /** Etiqueta pequeña sobre el título (por defecto "Error 404"). */
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Texto grande del fondo (por defecto "404"). */
  code?: string;
}

/**
 * 404 temático. Se usa como `path="*"` y desde páginas con parámetro inválido
 * (p. ej. /product/slug-inexistente, /order-success/id-inexistente).
 */
export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  eyebrow = 'Error 404',
  title = 'Objetivo no encontrado',
  description = 'La ruta que buscas no existe o la pieza ya no está en el arsenal. Vuelve al catálogo y sigue coleccionando.',
  code = '404',
}) => {
  const reduced = useReducedMotion() ?? false;

  return (
    <main id="main" tabIndex={-1} className="relative min-h-[80vh] w-full overflow-hidden bg-krm-bg px-6 pt-28 pb-24 flex items-center justify-center">
      <PageMeta title="Página no encontrada" description="La página que buscas no existe o se ha movido. Vuelve al catálogo de karambits de KRM.GG." noindex />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(245,158,11,0.10), transparent 60%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-tech text-[clamp(8rem,28vw,22rem)] font-black leading-none text-krm-border/50"
      >
        {code}
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.4 }}
        className="relative z-10 max-w-xl text-center"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-krm-accent/30 bg-krm-accent/10 text-krm-accent shadow-lg shadow-amber-500/10">
          <Crosshair className="h-8 w-8" />
        </div>
        <span className="inline-block rounded-full border border-krm-accent/30 bg-krm-accent/10 px-4 py-1.5 font-display text-xs font-black uppercase tracking-widest text-amber-400">
          {eyebrow}
        </span>
        <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-gray-400">{description}</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/shop" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
            <Package className="h-4 w-4" />
            Ver catálogo
          </Link>
          <Link to="/" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
        </div>
      </motion.div>
    </main>
  );
};

export default NotFoundPage;
