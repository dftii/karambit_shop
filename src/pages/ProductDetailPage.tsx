import React, { useCallback, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { karambits, type Product } from '../data/karambits';
import { skinName } from '../lib/productDisplay';
import NotFoundPage from './NotFoundPage';
import { PageMeta } from '../components/PageMeta';
import { Configurator } from '../components/product/Configurator';
import { DetailTabs, type TabId } from '../components/product/DetailTabs';
import { Inspector } from '../components/product/Inspector';
import { ProductSummary } from '../components/product/ProductSummary';
import { PurchaseBar } from '../components/product/PurchaseBar';
import { RelatedProducts } from '../components/product/RelatedProducts';
import { useConfigurator } from '../components/product/useConfigurator';

/** Ficha de producto. Slug desconocido -> 404 temático. La vista se remonta por slug (estado limpio). */
export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = karambits.find((k) => k.slug === slug);

  if (!product) {
    return (
      <NotFoundPage
        eyebrow="Réplica no encontrada"
        title="Este Karambit no existe"
        description="El enlace no corresponde a ninguna pieza del catálogo. Puede que se haya retirado o que la dirección esté mal escrita."
      />
    );
  }
  return <ProductDetailView key={product.slug} product={product} />;
};

/**
 * Composición de la ficha. Aquí solo vive lo que comparten varios bloques (configuración elegida y pestaña
 * activa); la inspección de la imagen está en <Inspector> y el formulario de reseñas en <Reviews>.
 */
const ProductDetailView: React.FC<{ product: Product }> = ({ product }) => {
  const cfg = useConfigurator(product);
  const [activeTab, setActiveTab] = useState<TabId>('specs');

  const showReviews = useCallback(() => {
    setActiveTab('reviews');
    document.getElementById('detalles')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const displayName = skinName(product.name).split(' — ')[0];
  const metaDescription =
    product.description.length > 155 ? `${product.description.slice(0, 152).trimEnd()}...` : product.description;

  return (
    <main id="main" tabIndex={-1} className="wrap py-8 outline-none sm:py-12">
      <PageMeta title={product.name} description={metaDescription} />

      {/* Migas */}
      <nav aria-label="Migas de pan" className="eyebrow flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link to="/" className="transition-colors hover:text-pink-ink">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/shop" className="transition-colors hover:text-pink-ink">
          Catálogo
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-ink">
          {displayName}
        </span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
        {/* ══════════ IZQUIERDA: ESCENARIO ══════════ */}
        <Inspector
          product={product}
          condition={cfg.condition}
          statTrak={cfg.state.statTrak ? cfg.state.statTrakNumber : null}
          nameTag={cfg.nameTagActive ? cfg.state.nameTagText : null}
        />

        {/* ══════════ DERECHA: INFORMACIÓN + CONFIGURADOR ══════════ */}
        <div className="min-w-0 lg:col-span-5">
          <ProductSummary product={product} onShowReviews={showReviews} />

          <div className="mt-8 border-t border-ink">
            <Configurator product={product} cfg={cfg} />
            <PurchaseBar product={product} cfg={cfg} />
          </div>
        </div>
      </div>

      {/* ══════════ DETALLES: ESPECIFICACIONES · GARANTÍA · RESEÑAS ══════════ */}
      <DetailTabs product={product} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ══════════ RELACIONADOS ══════════ */}
      <RelatedProducts product={product} />
    </main>
  );
};
export default ProductDetailPage;
