import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store/useStore';
import { buildKnifeCartItem, getProductFullName, notifyCartResult } from '../lib/cart';
import { BUNDLES, splitBundlePrice, type BundleDefinition } from '../lib/bundles';
import { formatEUR } from '../lib/format';
import { isOneOfOne, roundMoney } from '../lib/pricing';
import { Badge, Price, buttonClasses, toast } from '../components/ui';
import { KarambitVFXImage } from '../components/KarambitVFXImage';
import { PageMeta } from '../components/PageMeta';

// PACKS - COLLECTOR BUNDLES (/bundles y /packs)
// El precio del pack se reparte entre sus piezas en céntimos (la suma de líneas == precio del pack).
// Todo o nada: si una pieza 1-of-1 ya está en el arsenal/colección, el pack no se añade a medias.
// ═══════════════════════════════════════════════════════

type BladeChoice = 'Sin Filo' | 'Afilada';

/** Motivo por el que un pack no se puede añadir (pieza 1-of-1 ya adquirida o ya en el carrito). */
function bundleConflict(
  bundle: BundleDefinition,
  orders: ReadonlyArray<{ items: ReadonlyArray<{ productId?: string }> }>,
  cart: ReadonlyArray<{ productId?: string }>
): string | null {
  for (const knife of bundle.knives) {
    if (!isOneOfOne(knife)) continue;
    if (orders.some((order) => order.items.some((item) => item.productId === knife.id))) {
      return `Ya tienes «${knife.name.replace(/^★\s*Karambit \|\s*/, '')}» en tu colección: es una pieza 1-of-1 y no se puede repetir.`;
    }
    if (cart.some((line) => line.productId === knife.id)) {
      return `«${knife.name.replace(/^★\s*Karambit \|\s*/, '')}» ya está en tu arsenal (pieza 1-of-1): quítala del carrito para añadir el pack.`;
    }
  }
  return null;
}

/** Nombre de la skin sin el prefijo «Karambit |» ni la firma de colección. */
const shortKnifeName = (name: string) => name.replace(/^★?\s*Karambit \|\s*/, '').split(' — ')[0];

const PacksPage: React.FC = () => {
  const { addToCart, canAddToCart, updateQuantity, setCartOpen } = useStore(
    useShallow((s) => ({
      addToCart: s.addToCart,
      canAddToCart: s.canAddToCart,
      updateQuantity: s.updateQuantity,
      setCartOpen: s.setCartOpen,
    }))
  );
  // Reactivo a pedidos y carrito: deshabilita los packs 1-of-1 que ya no son posibles.
  const conflicts = useStore(
    useShallow((s) => BUNDLES.map((bundle) => bundleConflict(bundle, s.orders, s.cart)))
  );
  const [selectedBlade, setSelectedBlade] = useState<Record<string, BladeChoice>>({});

  const maxDiscount = Math.max(0, ...BUNDLES.map((b) => b.discountPercent));

  const handleAddBundleToCart = (bundle: BundleDefinition) => {
    // Las piezas 1-of-1 solo admiten hoja sin filo (también lo fuerza buildKnifeCartItem).
    const bladeChoice: BladeChoice = bundle.hasOneOfOne ? 'Sin Filo' : (selectedBlade[bundle.id] ?? 'Sin Filo');
    const prices = splitBundlePrice(
      bundle.bundlePrice,
      bundle.knives.map((knife) => knife.basePrice)
    );

    const lines = bundle.knives.map((knife, index) =>
      buildKnifeCartItem(knife, {
        name: `[${bundle.tag}] ${getProductFullName(knife)}`,
        price: prices[index],
        type: 'bundle',
        variant: `pack:${bundle.id}`,
        bladeType: bladeChoice === 'Sin Filo' ? 'Sin Filo (Unsharpened)' : 'Afilada (Sharpened)',
        stand: bundle.extras.stand,
        kydex: bundle.extras.kydex,
        statTrak: bundle.extras.statTrak,
        nameTag: Boolean(bundle.extras.nameTag),
        nameTagText: bundle.extras.nameTag,
      })
    );

    // Invariante: las líneas suman EXACTAMENTE el precio del pack.
    const lineSum = roundMoney(lines.reduce((sum, line) => sum + line.price * (line.quantity ?? 1), 0));
    if (lineSum !== bundle.bundlePrice) {
      console.error(`[Packs] ${bundle.id}: las líneas suman ${lineSum} y el pack cuesta ${bundle.bundlePrice}`);
      toast.error('No se pudo añadir el pack: precios inconsistentes.');
      return;
    }

    // Todo o nada: se valida cada línea ANTES de tocar el carrito.
    const blocked = lines.map((line) => canAddToCart(line)).find((result) => !result.ok);
    if (blocked) {
      notifyCartResult(blocked);
      return;
    }

    const before = new Map(useStore.getState().cart.map((line) => [line.lineId, line.quantity]));
    const added: string[] = [];
    for (const line of lines) {
      const result = addToCart(line);
      if (!result.ok) {
        // Imposible tras la validación previa; por seguridad se deshace lo añadido.
        added.forEach((lineId) => updateQuantity(lineId, before.get(lineId) ?? 0));
        notifyCartResult(result);
        return;
      }
      added.push(result.lineId);
    }

    toast.success(`${bundle.tag}: ${lines.length} ${lines.length === 1 ? 'pieza añadida' : 'piezas añadidas'} por ${formatEUR(bundle.bundlePrice)}.`, {
      title: 'Pack añadido al arsenal',
    });
    setCartOpen(true);
  };


  return (
    <main id="main" tabIndex={-1} className="wrap pb-20 pt-12 outline-none sm:pb-28 sm:pt-20">
      <PageMeta title="Packs Coleccionista" description="Packs coleccionista de karambits con precio conjunto: elige el acabado y ahorra frente a comprarlos por separado." />

      {/* Cabecera */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="border-b border-line pb-10 sm:pb-14"
      >
        <p className="eyebrow">Ahorro para coleccionistas</p>
        <h1 className="display-xl mt-4">
          Packs <span className="serif-accent text-pink-ink">coleccionista</span>
        </h1>
        <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink-2 sm:text-lg">
          Combina réplicas icónicas 1:1 con soportes acrílicos y fundas tácticas incluidas, con descuentos de hasta el{' '}
          <span className="font-mono text-ink">{maxDiscount} %</span>.
        </p>
      </motion.header>

      {/* Packs */}
      <div>
        {BUNDLES.map((bundle, idx) => {
          const sharpBlocked = bundle.hasOneOfOne;
          const currentBlade: BladeChoice = sharpBlocked ? 'Sin Filo' : (selectedBlade[bundle.id] ?? 'Sin Filo');
          const conflict = conflicts[idx];
          const extras = bundle.itemsIncluded.filter((item) => !/Karambit \|/.test(item));
          return (
            <motion.article
              key={bundle.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="border-b border-line py-10 sm:py-14"
              aria-labelledby={`${bundle.id}-title`}
              data-testid={`pack-${bundle.id}`}
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
                {/* Izquierda: índice, nombre, piezas */}
                <div className="min-w-0 lg:col-span-6">
                  <p className="eyebrow">
                    {String(idx + 1).padStart(2, '0')} — {bundle.badge}
                  </p>
                  <h2 id={`${bundle.id}-title`} className="display-lg mt-4">
                    {bundle.name}
                  </h2>
                  <p className="mt-4 max-w-lg font-body text-[15px] leading-relaxed text-ink-2">{bundle.tagline}</p>

                  <p className="eyebrow mt-8">Piezas incluidas · {String(bundle.knives.length).padStart(2, '0')}</p>
                  <ul className="mt-3 border-t border-line">
                    {bundle.knives.map((knife) => (
                      <li key={knife.id} className="flex items-center gap-4 border-b border-line py-2.5">
                        <span className="h-14 w-14 shrink-0 bg-tile p-1.5">
                          <KarambitVFXImage
                            plain
                            image={knife.image}
                            name={knife.name}
                            slug={knife.slug}
                            gradient={knife.gradient}
                            interactiveHover={false}
                          />
                        </span>
                        <span className="min-w-0 flex-1 font-body text-[15px] leading-snug text-ink">
                          {shortKnifeName(knife.name)}
                        </span>
                        <Price value={knife.basePrice} size="sm" tone="muted" className="shrink-0" />
                      </li>
                    ))}
                  </ul>

                  {extras.length > 0 && (
                    <>
                      <p className="eyebrow mt-6">Extras incluidos</p>
                      <ul className="mt-3 space-y-1.5">
                        {extras.map((item) => (
                          <li key={item} className="flex gap-3 font-mono text-xs leading-relaxed text-ink-2">
                            <span aria-hidden="true" className="text-pink-ink">
                              +
                            </span>
                            <span className="min-w-0 break-words">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Derecha: hoja, precio, acción */}
                <div className="min-w-0 lg:col-span-6 lg:border-l lg:border-line lg:pl-14">
                  {bundle.hasOneOfOne && (
                    <Badge tone="pink" className="mb-6">
                      Piezas 1 de 1
                    </Badge>
                  )}

                  <fieldset className="min-w-0">
                    <legend className="eyebrow">Tipo de hoja</legend>
                    <div className="mt-3 grid grid-cols-1 border border-ink sm:grid-cols-2" role="radiogroup" aria-label="Tipo de hoja">
                      {(
                        [
                          ['Sin Filo', 'Sin filo', 'Exhibición y maniobras seguras'],
                          ['Afilada', 'Afilada', sharpBlocked ? 'No disponible en piezas 1-of-1' : 'Corte funcional real'],
                        ] as const
                      ).map(([value, title, hint], i) => {
                        const disabled = value === 'Afilada' && sharpBlocked;
                        const active = currentBlade === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            disabled={disabled}
                            onClick={() => setSelectedBlade((prev) => ({ ...prev, [bundle.id]: value }))}
                            className={`px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                              i > 0 ? 'border-t border-ink sm:border-l sm:border-t-0' : ''
                            } ${active ? 'bg-ink text-paper' : 'bg-transparent text-ink hover:bg-tile'}`}
                          >
                            <span className="block font-body text-sm font-medium">{title}</span>
                            <span className={`mt-0.5 block font-mono text-[11px] ${active ? 'text-paper/70' : 'text-ink-3'}`}>
                              {hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {conflict && (
                    <p role="status" className="mt-6 border border-danger p-3 font-body text-sm leading-relaxed text-danger">
                      {conflict}
                    </p>
                  )}

                  <div className="mt-8 border-t border-ink pt-6">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <Price value={bundle.bundlePrice} size="xl" />
                      <Price value={bundle.originalPrice} size="md" tone="muted" strike />
                    </div>
                    <p className="mt-2 font-mono text-xs font-medium text-pink-ink">
                      Ahorras {formatEUR(bundle.savings)} (−{bundle.discountPercent} %)
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAddBundleToCart(bundle)}
                      disabled={conflict !== null}
                      className={buttonClasses({ variant: 'primary', size: 'lg', className: 'mt-6 w-full sm:w-auto' })}
                    >
                      Añadir pack
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </main>
  );
};

export default PacksPage;
