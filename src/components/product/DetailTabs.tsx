import React, { memo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Product } from '../../data/karambits';
import { Reviews } from './Reviews';
import { useReviews } from './reviewsStore';

export type TabId = 'specs' | 'guarantee' | 'reviews';

const panelMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: 'easeOut' },
} as const;

interface DetailTabsProps {
  product: Product;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

/**
 * Especificaciones · Garantía · Reseñas. Memoizado: no se re-renderiza al teclear en el configurador.
 * El panel de reseñas queda montado (oculto) para no perder el borrador del formulario al cambiar de pestaña.
 */
export const DetailTabs = memo(function DetailTabs({ product, activeTab, onTabChange }: DetailTabsProps) {
  const reviewCount = useReviews(product.slug).length;
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  const specRows: [string, string][] = [
    ['Acero de la hoja', product.specs.steel],
    ['Longitud total', product.specs.totalLength],
    ['Longitud de hoja', product.specs.bladeLength],
    ['Grosor de hoja', '4,0 mm'],
    ['Diámetro de anillo', '2,5 cm (ergonómico)'],
    ['Peso total', product.specs.weight],
    ['Dureza Rockwell', '58 – 60 HRC'],
    ['Material del mango', product.specs.handleMaterial],
    ['Tratamiento', 'Curado térmico al vacío'],
    ['Protección', 'Anti-rayones UV'],
    ['Escala', product.specs.scale],
    ['Inspección in-game', 'Fiel al original'],
  ];

  const tabs: { id: TabId; label: string }[] = [
    { id: 'specs', label: 'Especificaciones' },
    { id: 'guarantee', label: 'Garantía' },
    { id: 'reviews', label: `Reseñas (${reviewCount})` },
  ];

  // Teclado del patrón tablist: flechas, Inicio y Fin mueven selección y foco.
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    onTabChange(tabs[next].id);
    tabRefs.current[tabs[next].id]?.focus();
  };

  return (
    <section id="detalles" className="mt-20 scroll-mt-24 sm:mt-28" aria-label="Detalles del producto">
      <div
        role="tablist"
        aria-label="Detalles del producto"
        className="-mx-4 flex gap-x-8 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0"
      >
        {tabs.map((tab, index) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[tab.id] = node;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={active}
              aria-controls={`panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`-mb-px whitespace-nowrap border-b py-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                active ? 'border-pink text-ink' : 'border-transparent text-ink-3 hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Especificaciones */}
      {activeTab === 'specs' && (
        <motion.div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs" {...panelMotion} className="pt-2">
          <dl className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16">
            {specRows.map(([term, value]) => (
              <div key={term} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                <dt className="eyebrow shrink-0">{term}</dt>
                <dd className="text-right font-body text-[15px] text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      )}

      {/* Garantía */}
      {activeTab === 'guarantee' && (
        <motion.div
          role="tabpanel"
          id="panel-guarantee"
          aria-labelledby="tab-guarantee"
          {...panelMotion}
          className="grid grid-cols-1 border-b border-line md:grid-cols-2"
        >
          <div className="py-8 md:pr-10">
            <span className="font-mono text-sm font-medium tabular-nums text-pink-ink">01</span>
            <h3 className="display-md mt-5">Garantía de por vida en acero 440C</h3>
            <p className="mt-3 max-w-md font-body text-[15px] leading-relaxed text-ink-2">
              Cada pieza de KRM—GG cuenta con garantía ilimitada contra fracturas, holguras mecánicas o defectos
              estructurales. Si tu réplica sufre algún defecto de aleación, la reemplazamos.
            </p>
          </div>
          <div className="border-t border-line py-8 md:border-l md:border-t-0 md:pl-10">
            <span className="font-mono text-sm font-medium tabular-nums text-pink-ink">02</span>
            <h3 className="display-md mt-5">Certificado de autenticidad</h3>
            <p className="mt-3 max-w-md font-body text-[15px] leading-relaxed text-ink-2">
              Tu karambit incluye un identificador digital único emitido al realizar el pedido. Podrás consultar el
              certificado y su número de serie en cualquier momento desde Mis pedidos.
            </p>
          </div>
        </motion.div>
      )}

      {/* Reseñas: siempre montado; solo la entrada se anima al activarse */}
      <motion.div
        role="tabpanel"
        id="panel-reviews"
        aria-labelledby="tab-reviews"
        hidden={activeTab !== 'reviews'}
        initial={false}
        animate={activeTab === 'reviews' ? panelMotion.animate : panelMotion.initial}
        transition={panelMotion.transition}
        className="grid grid-cols-1 gap-x-12 gap-y-10 pt-8 lg:grid-cols-12"
      >
        <Reviews slug={product.slug} productId={product.id} />
      </motion.div>
    </section>
  );
});

export default DetailTabs;
