import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { karambits, type Product } from '../../data/karambits';
import { ProductCard } from '../ProductCard';
import { buttonClasses } from '../ui/buttonStyles';

/** 4 karambits relacionados (misma categoría primero). */
export const RelatedProducts = memo(function RelatedProducts({ product }: { product: Product }) {
  const related = useMemo(
    () =>
      karambits
        .filter((k) => k.id !== product.id)
        .sort((a, b) => (a.category === product.category ? -1 : b.category === product.category ? 1 : 0))
        .slice(0, 4),
    [product]
  );

  return (
    <section className="mt-20 sm:mt-28" aria-labelledby="relacionados">
      <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Relacionados</p>
          <h2 id="relacionados" className="display-lg mt-4">
            Otros coleccionistas <span className="serif-accent text-pink-ink">también miraron</span>
          </h2>
        </div>
        <Link to="/shop" className={`${buttonClasses({ variant: 'link', size: 'md' })} self-start sm:self-end`}>
          Ver todo el catálogo →
        </Link>
      </div>

      <div className="grid grid-cols-2 border-l border-line lg:grid-cols-4">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
});

export default RelatedProducts;
