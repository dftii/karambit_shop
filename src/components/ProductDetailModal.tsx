import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore, type CartItem } from '../store/useStore';
import { rarityColors } from '../data/karambits';
import { KarambitVFXImage } from './KarambitVFXImage';

export const ProductDetailModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    addToCart,
    isInWishlist,
    toggleWishlist,
    setCartOpen,
    setCheckoutOpen,
  } = useStore();

  const product = selectedProductForModal;

  // Customization State
  const [condition, setCondition] = useState<'Factory New' | 'Battle-Scarred'>('Factory New');
  const [bladeType, setBladeType] = useState<'Sin Filo (Unsharpened)' | 'Afilada (Sharpened)'>(
    'Sin Filo (Unsharpened)'
  );
  const [hasStatTrak, setHasStatTrak] = useState(false);
  const [statTrakNumber, setStatTrakNumber] = useState('007');
  const [hasNameTag, setHasNameTag] = useState(false);
  const [nameTagText, setNameTagText] = useState('HEADSHOT');
  const [includeStand, setIncludeStand] = useState(false);
  const [includeKydex, setIncludeKydex] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);

  if (!product) return null;

  const wishlisted = isInWishlist(product.id);
  const rarityColor = rarityColors[product.rarity] || '#ef4444';
  const fullName = product.name.startsWith('Karambit') ? product.name : `Karambit | ${product.name}`;
  const skinOnly = product.name.replace(/^Karambit\s*\|\s*/i, '');

  // Dynamic Price calculations
  const conditionMultiplier = condition === 'Battle-Scarred' ? 0.75 : 1.0;
  const baseKnifePrice = Number((product.basePrice * conditionMultiplier).toFixed(2));
  const statTrakCost = hasStatTrak ? 6.9 : 0;
  const nameTagCost = hasNameTag ? 9.9 : 0;
  const standCost = includeStand ? 14.9 : 0;
  const kydexCost = includeKydex ? 5.9 : 0;
  const calculatedPrice = Number(
    (baseKnifePrice + statTrakCost + nameTagCost + standCost + kydexCost).toFixed(2)
  );

  const handleAddToCart = () => {
    const item: CartItem = {
      id: `${product.id}-${condition}-${Date.now().toString(36)}`,
      productId: product.id,
      name: `${fullName}${hasStatTrak ? ' (StatTrak™)' : ''}`,
      price: calculatedPrice,
      quantity: 1,
      gradient: product.gradient,
      image: product.image,
      type: 'karambit',
      condition,
      bladeType,
      statTrak: hasStatTrak,
      statTrakCount: hasStatTrak ? (statTrakNumber || '000') : undefined,
      nameTag: hasNameTag ? nameTagText : undefined,
      standIncluded: includeStand,
      kydexIncluded: includeKydex,
      visualFilter: product.visualFilter,
    };
    addToCart(item);
    setSelectedProductForModal(null);
    setCartOpen(true);
  };

  const handleInstantBuy = () => {
    const item: CartItem = {
      id: `${product.id}-${condition}-${Date.now().toString(36)}`,
      productId: product.id,
      name: `${fullName}${hasStatTrak ? ' (StatTrak™)' : ''}`,
      price: calculatedPrice,
      quantity: 1,
      gradient: product.gradient,
      image: product.image,
      type: 'karambit',
      condition,
      bladeType,
      statTrak: hasStatTrak,
      statTrakCount: hasStatTrak ? (statTrakNumber || '000') : undefined,
      nameTag: hasNameTag ? nameTagText : undefined,
      standIncluded: includeStand,
      kydexIncluded: includeKydex,
      visualFilter: product.visualFilter,
    };
    addToCart(item);
    setSelectedProductForModal(null);
    setCheckoutOpen(true);
  };

  const handleOpenFullPage = () => {
    setSelectedProductForModal(null);
    navigate(`/product/${product.slug}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          onClick={() => setSelectedProductForModal(null)}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl my-auto rounded-3xl overflow-hidden border border-[#1f2433] z-10 flex flex-col max-h-[92vh]"
          style={{
            background: 'linear-gradient(180deg, #12141d 0%, #090a0f 100%)',
            boxShadow: `0 20px 60px -15px ${product.accentColor}25`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2433] bg-[#0c0d14]/70">
            <div className="flex items-center gap-3">
              <span
                className="px-2.5 py-1 rounded-md text-[11px] font-black font-['Rajdhani'] uppercase tracking-wider"
                style={{
                  background: `${rarityColor}15`,
                  color: rarityColor,
                  border: `1px solid ${rarityColor}40`,
                }}
              >
                ★ {product.rarity}
              </span>
              <span className="text-xs text-gray-400 font-['Inter']">
                Colección: <strong className="text-gray-200">{product.category}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenFullPage}
                className="px-3 py-1.5 rounded-xl bg-[#1f2433] hover:bg-amber-500 hover:text-black text-gray-300 font-bold font-['Rajdhani'] text-xs transition-colors flex items-center gap-1.5 uppercase"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ficha Completa
              </button>

              <button
                onClick={() =>
                  toggleWishlist({
                    id: product.id,
                    name: product.name,
                    price: product.basePrice,
                    gradient: product.gradient,
                  })
                }
                className="p-2 rounded-xl bg-[#1f2433] hover:bg-[#2a3144] transition-colors"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${
                    wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'
                  }`}
                />
              </button>

              <button
                onClick={() => setSelectedProductForModal(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1f2433] transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Visualizer Column (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0a0c13] border border-[#1f2433] relative group">
              <div
                className="absolute inset-0 opacity-25 rounded-2xl pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${product.accentColor}40, transparent 70%)`,
                }}
              />

              {/* Rotate preview button */}
              <button
                onClick={() => setRotationAngle((prev) => (prev + 45) % 360)}
                className="absolute top-3 right-3 p-2 rounded-lg bg-[#151824] hover:bg-[#1f2433] text-gray-400 hover:text-amber-400 transition-colors text-xs flex items-center gap-1 font-['Rajdhani'] z-10"
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

                {/* StatTrak overlay badge */}
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

                {/* NameTag overlay badge */}
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

              {/* Badges under preview */}
              <div className="flex gap-2 flex-wrap justify-center mt-2 z-10">
                <span className="text-[10px] font-bold text-gray-300 bg-[#161a27] px-2.5 py-1 rounded-full border border-[#1f2433] font-['Rajdhani'] uppercase">
                  145g Equilibrado
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-['Rajdhani'] uppercase">
                  Acero 440C
                </span>
              </div>
            </div>

            {/* Customization & Details Column (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-tight">
                  Karambit | <span className="text-amber-400">{skinOnly}</span>
                </h2>
                <p className="text-xs text-gray-400 font-['Inter'] mt-1 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Condition / Float Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 font-['Rajdhani'] block mb-1.5 flex justify-between">
                  <span>1. Estado del Acabado (Float)</span>
                  <span className="text-[11px] text-amber-400 font-mono">
                    {condition === 'Battle-Scarred' ? '-25% DESCUENTO' : 'Float 0.01'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCondition('Factory New')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      condition === 'Factory New'
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-[#151824] border-[#1f2433] text-gray-400'
                    }`}
                  >
                    <p className="text-xs font-bold font-['Rajdhani'] uppercase text-white flex justify-between">
                      Factory New
                      {condition === 'Factory New' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Recién Fabricado</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCondition('Battle-Scarred')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      condition === 'Battle-Scarred'
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-[#151824] border-[#1f2433] text-gray-400'
                    }`}
                  >
                    <p className="text-xs font-bold font-['Rajdhani'] uppercase text-white flex justify-between">
                      Battle-Scarred
                      {condition === 'Battle-Scarred' && (
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">-25% Descuento</p>
                  </button>
                </div>
              </div>

              {/* Blade Type Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 font-['Rajdhani'] block mb-1.5">
                  2. Tipo de Hoja
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBladeType('Sin Filo (Unsharpened)')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      bladeType.includes('Sin Filo')
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-[#151824] border-[#1f2433] text-gray-400'
                    }`}
                  >
                    <p className="text-xs font-bold font-['Rajdhani'] uppercase flex items-center justify-between">
                      Sin Filo (Tricks)
                      {bladeType.includes('Sin Filo') && (
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </p>
                    <p className="text-[10px] text-gray-500 font-['Inter'] mt-0.5">
                      Seguro para exhibición
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBladeType('Afilada (Sharpened)')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      bladeType.includes('Afilada')
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-[#151824] border-[#1f2433] text-gray-400'
                    }`}
                  >
                    <p className="text-xs font-bold font-['Rajdhani'] uppercase flex items-center justify-between">
                      Hoja Afilada
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    </p>
                    <p className="text-[10px] text-gray-500 font-['Inter'] mt-0.5">Filo real cortante</p>
                  </button>
                </div>
              </div>

              {/* Custom Addons: StatTrak & NameTag */}
              <div className="space-y-2.5 bg-[#0a0c13] p-3.5 rounded-xl border border-[#1f2433]">
                {/* StatTrak Toggle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasStatTrak}
                        onChange={(e) => setHasStatTrak(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span className="text-xs font-bold text-white font-['Rajdhani'] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Grabado StatTrak™ (+6.90€)
                      </span>
                    </label>
                  </div>

                  {hasStatTrak && (
                    <div className="pl-6 flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-['Inter']">Bajas (máx 4 dígitos):</span>
                      <input
                        type="text"
                        maxLength={4}
                        value={statTrakNumber}
                        onChange={(e) => setStatTrakNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="bg-[#151824] border border-[#2b3550] rounded px-2 py-0.5 text-xs text-amber-400 font-mono font-bold w-20 text-center outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* NameTag Toggle */}
                <div className="space-y-1.5 pt-1.5 border-t border-[#1a1f2e]">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasNameTag}
                        onChange={(e) => setHasNameTag(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span className="text-xs font-bold text-white font-['Rajdhani'] flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-gray-300" />
                        Placa NameTag Metálica (+9.90€)
                      </span>
                    </label>
                  </div>

                  {hasNameTag && (
                    <div className="pl-6 flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-['Inter']">Texto (máx 12):</span>
                      <input
                        type="text"
                        maxLength={12}
                        value={nameTagText}
                        onChange={(e) => setNameTagText(e.target.value.toUpperCase().slice(0, 12))}
                        className="bg-[#151824] border border-[#2b3550] rounded px-2 py-0.5 text-xs text-white font-mono font-bold w-32 text-center outline-none uppercase focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Cross-Sell Accessories */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between p-2 rounded-lg bg-[#151824] border border-[#1f2433] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeStand}
                      onChange={(e) => setIncludeStand(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span className="text-xs text-gray-300 font-['Rajdhani'] font-bold uppercase">
                      Soporte Acrílico Oficial (+14.90€)
                    </span>
                  </div>
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-[#151824] border border-[#1f2433] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeKydex}
                      onChange={(e) => setIncludeKydex(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span className="text-xs text-gray-300 font-['Rajdhani'] font-bold uppercase">
                      Funda Protectora Kydex (+5.90€)
                    </span>
                  </div>
                </label>
              </div>

              {/* Price & Action Buttons */}
              <div className="pt-2 border-t border-[#1f2433] flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 block font-['Inter']">Precio final:</span>
                  <span className="text-2xl font-black text-amber-400 font-['Rajdhani']">
                    {calculatedPrice.toFixed(2)}€
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="px-4 py-2.5 rounded-xl font-bold font-['Rajdhani'] uppercase tracking-wider text-xs text-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Al Arsenal
                  </button>

                  <button
                    onClick={handleInstantBuy}
                    className="px-4 py-2.5 rounded-xl font-bold font-['Rajdhani'] uppercase tracking-wider text-xs text-white bg-[#1f2433] hover:bg-[#2a3144] transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Comprar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default ProductDetailModal;
