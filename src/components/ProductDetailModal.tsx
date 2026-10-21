import React, { useCallback, useEffect, useState } from 'react';
import {
  X,
  Heart,
  ShoppingCart,
  Zap,
  Tag,
  RotateCw,
  Check,
  ExternalLink,
  AlertTriangle,
  Crown,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useStore, useIsInWishlist, useIsOwned } from '../store/useStore';
import { buildKnifeCartItem, notifyCartResult } from '../lib/cart';
import {
  ADDON_PRICES,
  computeConfiguredPrice,
  getRestrictions,
  normalizeOptions,
} from '../lib/pricing';
import { rarityColors, type Product } from '../data/karambits';
import { KarambitVFXImage } from './KarambitVFXImage';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { buttonClasses } from './ui/buttonStyles';
import { Badge } from './ui/Badge';
import { Price } from './ui/Price';

/**
 * "Vista rápida" global: se abre con `setSelectedProductForModal(product)` (botón de las tarjetas de
 * producto). Siempre montado en App para que el Modal pueda animar la salida.
 */
export const ProductDetailModal: React.FC = () => {
  const location = useLocation();
  const { selectedProductForModal, setSelectedProductForModal } = useStore(
    useShallow((s) => ({
      selectedProductForModal: s.selectedProductForModal,
      setSelectedProductForModal: s.setSelectedProductForModal,
    }))
  );

  // Conserva el último producto mostrado mientras dura la animación de salida.
  const [shown, setShown] = useState<Product | null>(selectedProductForModal);
  if (selectedProductForModal && selectedProductForModal !== shown) setShown(selectedProductForModal);

  const close = useCallback(() => setSelectedProductForModal(null), [setSelectedProductForModal]);

  // Cualquier navegación (enlaces, atrás del navegador) cierra la vista rápida.
  useEffect(() => {
    setSelectedProductForModal(null);
  }, [location.key, setSelectedProductForModal]);

  return (
    <Modal
      open={selectedProductForModal !== null}
      onClose={close}
      size="lg"
      ariaLabel={shown ? `Vista rápida: ${shown.name}` : 'Vista rápida'}
      zIndex={100}
      panelClassName="rounded-3xl overflow-hidden border border-krm-border flex flex-col max-h-[92vh]"
      panelStyle={{
        background: 'linear-gradient(180deg, #12141d 0%, #090a0f 100%)',
        boxShadow: shown ? `0 20px 60px -15px ${shown.accentColor}25` : undefined,
      }}
    >
      {shown && <QuickViewContent key={shown.id} product={shown} onClose={close} />}
    </Modal>
  );
};

const QuickViewContent: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, setCartOpen } = useStore(
    useShallow((s) => ({
      addToCart: s.addToCart,
      toggleWishlist: s.toggleWishlist,
      setCartOpen: s.setCartOpen,
    }))
  );
  const wishlisted = useIsInWishlist(product.id);
  const owned = useIsOwned(product.id);

  // Customization State
  const [conditionChoice, setCondition] = useState<'Factory New' | 'Battle-Scarred'>('Factory New');
  const [bladeChoice, setBladeType] = useState<'Sin Filo (Unsharpened)' | 'Afilada (Sharpened)'>(
    'Sin Filo (Unsharpened)'
  );
  const [hasStatTrak, setHasStatTrak] = useState(false);
  const [statTrakNumber, setStatTrakNumber] = useState('007');
  const [hasNameTag, setHasNameTag] = useState(false);
  const [nameTagText, setNameTagText] = useState('HEADSHOT');
  const [includeStand, setIncludeStand] = useState(false);
  const [kydexChoice, setIncludeKydex] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);

  const rarityColor = rarityColors[product.rarity] || '#ef4444';
  const skinOnly = product.name.replace(/^Karambit\s*\|\s*/i, '');

  // Restricciones de piezas 1-of-1 (solo Factory New, sin filo, sin Kydex) y precio: única fuente en lib/pricing.
  const rules = getRestrictions(product);
  const nameTagActive = hasNameTag && nameTagText.trim().length > 0;
  const config = normalizeOptions(product, {
    condition: conditionChoice,
    bladeType: bladeChoice,
    statTrak: hasStatTrak,
    nameTag: nameTagActive,
    stand: includeStand,
    kydex: kydexChoice,
  });
  const { condition, bladeType, kydex: includeKydex } = config;
  const calculatedPrice = computeConfiguredPrice(product, config);
  const battleScarredDiscount = Math.round((1 - product.battleScarredPrice / product.basePrice) * 100);

  const addConfiguredToCart = (): boolean => {
    const result = addToCart(
      buildKnifeCartItem(product, {
        ...config,
        statTrakCount: statTrakNumber || '000',
        nameTagText,
      })
    );
    return notifyCartResult(result);
  };

  const handleAddToCart = () => {
    if (!addConfiguredToCart()) return;
    onClose();
    setCartOpen(true);
  };

  const handleInstantBuy = () => {
    if (!addConfiguredToCart()) return;
    onClose();
    navigate('/checkout');
  };

  const choiceClass = (active: boolean) =>
    active ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-krm-card-alt border-krm-border text-gray-400';

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-krm-border bg-[#0c0d14]/70">
        <div className="flex items-center gap-3 min-w-0">
          <Badge color={rarityColor}>★ {product.rarity}</Badge>
          <span className="text-xs text-gray-400 font-body truncate">
            Colección: <strong className="text-gray-200">{product.category}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/product/${product.slug}`}
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-krm-border hover:bg-amber-500 hover:text-black text-gray-300 font-bold font-display text-xs transition-colors flex items-center gap-1.5 uppercase"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver ficha completa
          </Link>

          <button
            type="button"
            onClick={() =>
              toggleWishlist({
                id: product.id,
                name: product.name,
                price: product.basePrice,
                gradient: product.gradient,
              })
            }
            className="p-2 rounded-xl bg-krm-border hover:bg-krm-hover transition-colors"
            aria-label={wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            aria-pressed={wishlisted}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-krm-border transition-colors"
            aria-label="Cerrar vista rápida"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Visualizer Column (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-krm-bg-deep border border-krm-border relative group">
          <div
            className="absolute inset-0 opacity-25 rounded-2xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${product.accentColor}40, transparent 70%)`,
            }}
          />

          <button
            type="button"
            onClick={() => setRotationAngle((prev) => (prev + 45) % 360)}
            className="absolute top-3 right-3 p-2 rounded-lg bg-krm-card-alt hover:bg-krm-border text-gray-400 hover:text-amber-400 transition-colors text-xs flex items-center gap-1 font-display z-10"
            title="Girar modelo"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Rotar
          </button>

          <div
            className={`transition-all duration-500 ease-out py-6 relative flex items-center justify-center w-full ${
              condition === 'Battle-Scarred' ? 'contrast-125 saturate-75 brightness-90' : ''
            }`}
            style={{ transform: `rotate(${rotationAngle}deg)` }}
          >
            <div className="w-full max-w-[280px] aspect-square flex items-center justify-center">
              <KarambitVFXImage
                image={product.image}
                name={product.name}
                slug={product.slug}
                rarity={product.rarity}
                category={product.category}
                accentColor={product.accentColor}
                visualFilter={product.visualFilter}
                condition={condition}
                interactiveHover={true}
                showSparkles={product.rarity === 'Mythic Bespoke'}
                showShimmer={product.rarity === 'Mythic Bespoke'}
              />
            </div>

            {hasStatTrak && (
              <div
                className="absolute z-20 px-2 py-0.5 rounded shadow-lg text-[10px] font-mono font-black text-amber-400 border border-amber-500/60 bg-black/90"
                style={{
                  top: '55%',
                  left: '42%',
                  transform: 'translate(-50%, -50%) rotate(-35deg)',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)',
                }}
              >
                ST™ #{String(statTrakNumber || '000').padStart(3, '0')}
              </div>
            )}

            {hasNameTag && nameTagText && (
              <div
                className="absolute z-20 px-2 py-0.5 rounded-sm bg-gradient-to-r from-zinc-300 to-zinc-400 text-zinc-900 border border-white text-[9px] font-mono font-black tracking-wider uppercase shadow-md"
                style={{
                  top: '38%',
                  left: '44%',
                  transform: 'translate(-50%, -50%) rotate(22deg)',
                }}
              >
                "{nameTagText}"
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap justify-center mt-2 z-10">
            <Badge tone="gray" className="rounded-full">145g Equilibrado</Badge>
            <Badge tone="amber" className="rounded-full">Acero 440C</Badge>
            {rules.singleUnit && (
              <Badge tone="purple" className="rounded-full" icon={<Crown className="w-3 h-3" />}>
                1-of-1
              </Badge>
            )}
          </div>
        </div>

        {/* Customization & Details Column (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <h2 className="text-2xl font-black text-white font-display uppercase tracking-tight">
              Karambit | <span className="text-amber-400">{skinOnly}</span>
            </h2>
            <p className="text-xs text-gray-400 font-body mt-1 leading-relaxed">{product.description}</p>
          </div>

          {rules.singleUnit && (
            <p className="text-[11px] text-purple-300 bg-purple-500/10 border border-purple-500/30 rounded-xl px-3 py-2 font-body leading-relaxed">
              Pieza 1-of-1: solo existe una unidad, únicamente en Factory New, sin filo real y sin funda Kydex.
            </p>
          )}

          {/* Condition / Float Selector */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-300 font-display mb-1.5 flex justify-between">
              <span>1. Estado del Acabado (Float)</span>
              <span className="text-[11px] text-amber-400 font-mono">
                {condition === 'Battle-Scarred' ? `-${battleScarredDiscount}% DESCUENTO` : 'Float 0.01'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition('Factory New')}
                aria-pressed={condition === 'Factory New'}
                className={`p-2.5 rounded-xl border text-left transition-all ${choiceClass(condition === 'Factory New')}`}
              >
                <p className="text-xs font-bold font-display uppercase text-white flex justify-between">
                  Factory New
                  {condition === 'Factory New' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Recién Fabricado</p>
              </button>

              <button
                type="button"
                onClick={() => setCondition('Battle-Scarred')}
                disabled={!rules.conditions.includes('Battle-Scarred')}
                aria-pressed={condition === 'Battle-Scarred'}
                className={`disabled:opacity-40 disabled:cursor-not-allowed p-2.5 rounded-xl border text-left transition-all ${choiceClass(condition === 'Battle-Scarred')}`}
              >
                <p className="text-xs font-bold font-display uppercase text-white flex justify-between">
                  Battle-Scarred
                  {condition === 'Battle-Scarred' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </p>
                <p className="text-[10px] text-emerald-400 mt-0.5">-{battleScarredDiscount}% Descuento</p>
              </button>
            </div>
          </div>

          {/* Blade Type Selector */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-300 font-display mb-1.5">
              2. Tipo de Hoja
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBladeType('Sin Filo (Unsharpened)')}
                aria-pressed={bladeType.includes('Sin Filo')}
                className={`p-2.5 rounded-xl border text-left transition-all ${choiceClass(bladeType.includes('Sin Filo'))}`}
              >
                <p className="text-xs font-bold font-display uppercase flex items-center justify-between">
                  Sin Filo (Tricks)
                  {bladeType.includes('Sin Filo') && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </p>
                <p className="text-[10px] text-gray-500 font-body mt-0.5">Seguro para exhibición</p>
              </button>

              <button
                type="button"
                onClick={() => setBladeType('Afilada (Sharpened)')}
                disabled={!rules.allowSharpened}
                aria-pressed={bladeType.includes('Afilada')}
                className={`disabled:opacity-40 disabled:cursor-not-allowed p-2.5 rounded-xl border text-left transition-all ${choiceClass(bladeType.includes('Afilada'))}`}
              >
                <p className="text-xs font-bold font-display uppercase flex items-center justify-between">
                  Hoja Afilada
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                </p>
                <p className="text-[10px] text-gray-500 font-body mt-0.5">Filo real cortante</p>
              </button>
            </div>
          </div>

          {/* Custom Addons: StatTrak & NameTag */}
          <div className="space-y-2.5 bg-krm-bg-deep p-3.5 rounded-xl border border-krm-border">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasStatTrak}
                  onChange={(e) => setHasStatTrak(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span className="text-xs font-bold text-white font-display flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Grabado StatTrak™ (+{ADDON_PRICES.statTrak.toFixed(2)}€)
                </span>
              </label>

              {hasStatTrak && (
                <div className="pl-6 flex items-center gap-2">
                  <label htmlFor="qv-stattrak" className="text-[10px] text-gray-400 font-body">
                    Bajas (máx 4 dígitos):
                  </label>
                  <input
                    id="qv-stattrak"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={statTrakNumber}
                    onChange={(e) => setStatTrakNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="bg-krm-card-alt border border-[#2b3550] rounded px-2 py-0.5 text-xs text-amber-400 font-mono font-bold w-20 text-center outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-1.5 border-t border-[#1a1f2e]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNameTag}
                  onChange={(e) => setHasNameTag(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span className="text-xs font-bold text-white font-display flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-gray-300" />
                  Placa NameTag Metálica (+{ADDON_PRICES.nameTag.toFixed(2)}€)
                </span>
              </label>

              {hasNameTag && (
                <div className="pl-6 flex items-center gap-2">
                  <label htmlFor="qv-nametag" className="text-[10px] text-gray-400 font-body">
                    Texto (máx 12):
                  </label>
                  <input
                    id="qv-nametag"
                    type="text"
                    maxLength={12}
                    value={nameTagText}
                    onChange={(e) => setNameTagText(e.target.value.toUpperCase().slice(0, 12))}
                    className="bg-krm-card-alt border border-[#2b3550] rounded px-2 py-0.5 text-xs text-white font-mono font-bold w-32 text-center outline-none uppercase focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Cross-Sell Accessories */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 p-2 rounded-lg bg-krm-card-alt border border-krm-border cursor-pointer">
              <input
                type="checkbox"
                checked={includeStand}
                onChange={(e) => setIncludeStand(e.target.checked)}
                className="accent-amber-500"
              />
              <span className="text-xs text-gray-300 font-display font-bold uppercase">
                Soporte Acrílico Oficial (+{ADDON_PRICES.stand.toFixed(2)}€)
              </span>
            </label>

            <label
              className={`flex items-center gap-2 p-2 rounded-lg bg-krm-card-alt border border-krm-border ${
                rules.allowKydex ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <input
                type="checkbox"
                checked={includeKydex}
                onChange={(e) => setIncludeKydex(e.target.checked)}
                disabled={!rules.allowKydex}
                className="accent-amber-500"
              />
              <span className="text-xs text-gray-300 font-display font-bold uppercase">
                Funda Protectora Kydex (+{ADDON_PRICES.kydex.toFixed(2)}€)
              </span>
            </label>
          </div>

          {/* Price & Action Buttons */}
          <div className="pt-2 border-t border-krm-border flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-gray-500 block font-body">Precio final:</span>
              <Price value={calculatedPrice} size="lg" tone="accent" />
            </div>

            {owned ? (
              <div className="flex items-center gap-3">
                <Badge tone="emerald" icon={<Check className="w-3 h-3" />}>En tu colección</Badge>
                <Link to="/orders" onClick={onClose} className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
                  Ver mi arsenal
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" icon={<ShoppingCart className="w-3.5 h-3.5" />} onClick={handleAddToCart}>
                  Al Arsenal
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
                  onClick={handleInstantBuy}
                >
                  Comprar ya
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailModal;
