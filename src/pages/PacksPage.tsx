import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, Crown, ShoppingCart } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store/useStore';
import { buildKnifeCartItem, getProductFullName, notifyCartResult } from '../lib/cart';
import { BUNDLES, splitBundlePrice, type BundleDefinition } from '../lib/bundles';
import { formatEUR } from '../lib/format';
import { isOneOfOne, roundMoney } from '../lib/pricing';
import { Badge, Button, Price, toast } from '../components/ui';
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
    <main id="main" tabIndex={-1} className="min-h-screen w-full bg-krm-bg pb-24 pt-28 text-gray-200">
      <PageMeta title="Packs Coleccionista" description="Packs coleccionista de karambits con precio conjunto: elige el acabado y ahorra frente a comprarlos por separado." />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <Badge tone="red" className="px-4 py-1.5 text-xs tracking-widest">
            Ahorro exclusivo coleccionistas
          </Badge>
          <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-6xl">
            Packs <span className="text-krm-accent">Coleccionista</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl font-body text-sm text-gray-400">
            Combina réplicas icónicas 1:1 con soportes acrílicos y fundas tácticas incluidas con descuentos de hasta el{' '}
            {maxDiscount}%.
          </p>
        </motion.div>

        {/* Bundles List */}
        <div className="space-y-8">
          {BUNDLES.map((bundle, idx) => {
            const sharpBlocked = bundle.hasOneOfOne;
            const currentBlade: BladeChoice = sharpBlocked ? 'Sin Filo' : (selectedBlade[bundle.id] ?? 'Sin Filo');
            const conflict = conflicts[idx];
            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(idx, 3) * 0.08 }}
                className={`flex flex-col items-center gap-8 rounded-3xl border bg-krm-surface p-5 shadow-xl transition-all hover:border-amber-500/40 sm:p-8 lg:flex-row ${
                  bundle.hasOneOfOne ? 'border-pink-400/30' : 'border-krm-border-soft'
                }`}
                data-testid={`pack-${bundle.id}`}
              >
                {/* Visualizer with Real PNG Knives */}
                <div className="relative flex w-full items-center justify-center py-4 lg:w-1/2 lg:py-6">
                  <div className="flex items-center justify-center -space-x-8 overflow-visible sm:-space-x-14">
                    {bundle.knives.map((k, i) => (
                      <div
                        key={k.id}
                        className="group relative flex aspect-square w-24 items-center justify-center transition-transform duration-500 hover:z-30 hover:scale-110 sm:w-40"
                        style={{ zIndex: 10 - i }}
                      >
                        <KarambitVFXImage
                          image={k.image}
                          name={k.name}
                          slug={k.slug}
                          rarity={k.rarity}
                          category={k.category}
                          accentColor={k.accentColor}
                          visualFilter={k.visualFilter}
                          interactiveHover
                          showSparkles={k.rarity === 'Mythic Bespoke'}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bundle Details & Options */}
                <div className="w-full space-y-4 lg:w-1/2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="amber" icon={bundle.hasOneOfOne ? <Crown className="h-3 w-3" /> : undefined}>
                      {bundle.badge}
                    </Badge>
                    <Badge tone="emerald" className="font-mono">
                      -{bundle.discountPercent}% DTO (Ahorras {formatEUR(bundle.savings)})
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-black uppercase text-white sm:text-3xl">{bundle.name}</h3>
                    <p className="mt-1 font-body text-xs leading-relaxed text-gray-400">{bundle.tagline}</p>
                  </div>

                  {/* Included Items */}
                  <div className="space-y-2 rounded-2xl border border-krm-border-soft bg-krm-card p-3.5">
                    <p className="font-display text-xs font-bold uppercase tracking-wider text-gray-400">
                      Contenido incluido en el pack:
                    </p>
                    <ul className="space-y-1.5 font-body text-xs text-gray-300">
                      {bundle.itemsIncluded.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Blade Sharpness Choice */}
                  <div>
                    <span className="mb-2 block font-display text-xs font-bold uppercase tracking-wider text-gray-400">
                      Tipo de hoja del pack:
                    </span>
                    <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Tipo de hoja">
                      {(
                        [
                          ['Sin Filo', 'Sin Filo (Tricks)', 'Exhibición y maniobras seguras'],
                          ['Afilada', 'Hoja Afilada', sharpBlocked ? 'No disponible en piezas 1-of-1' : 'Corte funcional real 100%'],
                        ] as const
                      ).map(([value, title, hint]) => {
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
                            className={`rounded-xl border p-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                              active
                                ? 'border-amber-500 bg-amber-500/15 text-white'
                                : 'border-krm-border-soft bg-krm-card-alt text-gray-400'
                            }`}
                          >
                            <p className="flex justify-between font-display text-xs font-bold uppercase">
                              {title}
                              {active && <Check className="h-3.5 w-3.5 text-amber-400" />}
                            </p>
                            <p className="text-[10px] text-gray-500">{hint}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {conflict && (
                    <p
                      role="status"
                      className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-body text-xs text-red-300"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      {conflict}
                    </p>
                  )}

                  {/* Pricing & 1-Click Buy */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-krm-border pt-4">
                    <div>
                      <Price value={bundle.originalPrice} size="xs" tone="muted" strike className="block" />
                      <Price value={bundle.bundlePrice} size="lg" />
                    </div>
                    <Button
                      size="lg"
                      onClick={() => handleAddBundleToCart(bundle)}
                      disabled={conflict !== null}
                      icon={<ShoppingCart className="h-4 w-4" />}
                    >
                      Añadir pack al arsenal
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default PacksPage;
