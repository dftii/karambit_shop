import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, Tag, Check, ShoppingCart, Zap, AlertTriangle, Eye, Layers } from 'lucide-react';
import { karambits, type Product } from '../data/karambits';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store/useStore';
import { buildKnifeCartItem, notifyCartResult } from '../lib/cart';
import {
  ADDON_PRICES,
  computeConfiguredPrice,
  getRestrictions,
  normalizeOptions,
} from '../lib/pricing';
import { KarambitVFXImage } from '../components/KarambitVFXImage';
import { PageMeta } from '../components/PageMeta';

// 3. STATTRAK LAB - INTERACTIVE WORKBENCH (/stattrak)
// ═══════════════════════════════════════════════════════

const StatTrakPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, setCartOpen } = useStore(
    useShallow((s) => ({ addToCart: s.addToCart, setCartOpen: s.setCartOpen }))
  );

  const [selectedKnife, setSelectedKnife] = useState<Product>(karambits[0]);
  const [statTrakNumber, setStatTrakNumber] = useState<string>('0420');
  const [nameTagText, setNameTagText] = useState<string>('ACE CLUTCH');
  const [conditionChoice, setCondition] = useState<'Factory New' | 'Battle-Scarred'>('Factory New');
  const [bladeChoice, setBladeType] = useState<'Sin Filo (Unsharpened)' | 'Afilada (Sharpened)'>(
    'Sin Filo (Unsharpened)'
  );
  const [includeStand, setIncludeStand] = useState<boolean>(true);
  const [kydexChoice, setIncludeKydex] = useState<boolean>(false);
  const [inspectMode, setInspectMode] = useState<'full' | 'blade' | 'handle'>('full');

  // Calculations (StatTrak™ siempre incluido en el taller; restricciones 1-of-1 aplicadas)
  const rules = getRestrictions(selectedKnife);
  const nameTagActive = nameTagText.trim().length > 0;
  const config = normalizeOptions(selectedKnife, {
    condition: conditionChoice,
    bladeType: bladeChoice,
    statTrak: true,
    nameTag: nameTagActive,
    stand: includeStand,
    kydex: kydexChoice,
  });
  const { condition, bladeType, kydex: includeKydex } = config;
  const totalConfigPrice = computeConfiguredPrice(selectedKnife, config);
  const battleScarredDiscount = Math.round(
    (1 - selectedKnife.battleScarredPrice / selectedKnife.basePrice) * 100
  );

  const handleOrderCustomKnife = (directBuy = false) => {
    const result = addToCart(
      buildKnifeCartItem(selectedKnife, {
        ...config,
        statTrakCount: statTrakNumber || '000',
        nameTagText,
        nameSuffix: ' (StatTrak™ Lab)',
      })
    );
    if (!notifyCartResult(result)) return;

    if (directBuy) {
      navigate('/checkout');
    } else {
      setCartOpen(true);
    }
  };

  return (
    <main id="main" tabIndex={-1} className="min-h-screen pt-28 pb-24 w-full bg-krm-bg text-gray-200">
      <PageMeta title="StatTrak™ Lab" description="Personaliza tu karambit con contador StatTrak™ y placa NameTag en el laboratorio de KRM.GG." />
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-black tracking-widest text-amber-400 uppercase font-display bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/30 shadow-md">
            TALLER ARTESANAL DE PERSONALIZACIÓN
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white font-display uppercase tracking-tight mt-3">
            StatTrak™ <span className="text-krm-accent">& NameTag Lab</span>
          </h1>
          <p className="mt-2 text-gray-400 font-body text-sm max-w-xl mx-auto">
            Elige cualquier Karambit del arsenal y personaliza en vivo el grabado digital StatTrak™ en la hoja y la placa NameTag atornillada en el mango.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ══════════ WORKBENCH PREVIEW (6 cols) ══════════ */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-krm-surface border border-krm-border flex flex-col items-center justify-center relative sticky top-28 shadow-2xl overflow-hidden min-h-[500px]">
            {/* Ambient Skin Glow */}
            <div
              className="absolute inset-0 opacity-25 rounded-3xl pointer-events-none transition-all duration-700"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${selectedKnife.accentColor}35 0%, transparent 70%)`,
              }}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <span className="text-[11px] font-bold text-amber-400 font-display uppercase bg-amber-500/15 px-3 py-1 rounded-lg border border-amber-500/30">
                StatTrak™ ACTIVO
              </span>
              <span className="text-[11px] font-bold text-gray-300 font-display uppercase bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                NameTag ACTIVO
              </span>
            </div>

            {/* Stage */}
            <div
              className="relative w-full aspect-square max-w-[420px] flex items-center justify-center transition-all duration-700 py-6"
              style={{
                transform:
                  inspectMode === 'blade'
                    ? 'scale(1.55) translate(-15%, 15%)'
                    : inspectMode === 'handle'
                    ? 'scale(1.7) translate(25%, -20%)'
                    : 'scale(1)',
              }}
            >
              <div
                className={`relative w-full h-full flex items-center justify-center transition-all duration-300 ${
                  condition === 'Battle-Scarred' ? 'contrast-125 saturate-75 brightness-90' : ''
                }`}
              >
                {/* Karambit VFX Image */}
                <KarambitVFXImage
                  image={selectedKnife.image}
                  name={selectedKnife.name}
                  slug={selectedKnife.slug}
                  rarity={selectedKnife.rarity}
                  category={selectedKnife.category}
                  accentColor={selectedKnife.accentColor}
                  visualFilter={selectedKnife.visualFilter}
                  condition={condition}
                  interactiveHover={false}
                  animateLevitate={selectedKnife.rarity === 'Mythic Bespoke'}
                  showSparkles={selectedKnife.rarity === 'Mythic Bespoke'}
                  showShimmer={selectedKnife.rarity === 'Mythic Bespoke'}
                />

                {/* Live StatTrak Digital LED on Blade */}
                <div
                  className="absolute z-20 px-2 py-0.5 rounded shadow-lg flex items-center gap-1 select-none pointer-events-none"
                  style={{
                    top: '55%',
                    left: '42%',
                    transform: 'translate(-50%, -50%) rotate(-35deg)',
                    background: 'linear-gradient(180deg, #18191d 0%, #0d0e12 100%)',
                    border: '1px solid #d97706',
                    boxShadow: '0 0 12px rgba(245, 158, 11, 0.45)',
                  }}
                >
                  <span className="text-[9px] font-black text-amber-500 font-mono">ST™</span>
                  <span
                    className="text-xs font-black tracking-widest font-mono text-krm-accent"
                    style={{
                      textShadow: '0 0 8px #f59e0b, 0 0 16px rgba(245, 158, 11, 0.6)',
                    }}
                  >
                    {String(statTrakNumber || '000').padStart(3, '0')}
                  </span>
                </div>

                {/* Live NameTag Plate on Handle */}
                <div
                  className="absolute z-20 px-2.5 py-0.5 rounded-sm flex items-center justify-between gap-1.5 shadow-2xl select-none pointer-events-none"
                  style={{
                    top: '38%',
                    left: '44%',
                    transform: 'translate(-50%, -50%) rotate(22deg)',
                    background:
                      'linear-gradient(180deg, #d4d4d8 0%, #a1a1aa 45%, #71717a 100%)',
                    border: '1px solid #e4e4e7',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.8), inset 0 1px 1px #ffffff',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-inner block" />
                  <span
                    className="text-[10px] font-black tracking-wider text-zinc-900 font-mono uppercase px-1"
                    style={{ textShadow: '0 1px 0 rgba(255,255,255,0.6)' }}
                  >
                    "{nameTagText || 'TU_ALIAS'}"
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-inner block" />
                </div>
              </div>
            </div>

            {/* Inspection Zoom Buttons */}
            <div className="flex gap-2 z-20 mb-3 bg-[#080a10]/80 p-1.5 rounded-xl border border-[#1b2133] backdrop-blur-sm">
              <button
                onClick={() => setInspectMode('full')}
                className={`px-3 py-1 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                  inspectMode === 'full' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                General
              </button>
              <button
                onClick={() => setInspectMode('blade')}
                className={`px-3 py-1 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                  inspectMode === 'blade' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 inline mr-1" />
                Hoja (StatTrak)
              </button>
              <button
                onClick={() => setInspectMode('handle')}
                className={`px-3 py-1 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                  inspectMode === 'handle' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1" />
                Mango (NameTag)
              </button>
            </div>

            {/* Bottom info */}
            <div className="w-full pt-4 border-t border-krm-border text-center">
              <h3 className="text-2xl font-black text-white font-display uppercase">
                {selectedKnife.name}
              </h3>
              <p className="text-xs text-gray-400 font-body mt-1">
                Acero Inoxidable 440C · Réplica 1:1 · Módulo LED Orange StatTrak™ (+{ADDON_PRICES.statTrak.toFixed(2)}€) · Placa NameTag (+{ADDON_PRICES.nameTag.toFixed(2)}€)
              </p>
            </div>
          </div>

          {/* ══════════ CONFIGURATION FORM (6 cols) ══════════ */}
          <div className="lg:col-span-6 space-y-5">
            {/* 1. Base Knife Selector (All 18+ Karambits) */}
            <div className="bg-krm-surface p-5 rounded-2xl border border-krm-border space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-gray-300 font-display block flex justify-between">
                <span>1. Elige tu Skin Base (34+ Modelos CS2 & Joyería)</span>
                <span className="text-amber-400 font-mono">{selectedKnife.name.replace('Karambit | ', '')}</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 pr-1.5">
                {karambits.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => setSelectedKnife(k)}
                    aria-pressed={selectedKnife.id === k.id}
                    className={`p-2 rounded-xl border flex flex-col items-center text-center gap-1 transition-all ${
                      selectedKnife.id === k.id
                        ? 'border-amber-500 bg-krm-card-hi shadow-md shadow-amber-500/20 scale-105'
                        : 'border-krm-border bg-krm-card hover:border-gray-600'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center p-0.5 relative">
                      <KarambitVFXImage
                        image={k.image}
                        name={k.name}
                        slug={k.slug}
                        rarity={k.rarity}
                        category={k.category}
                        accentColor={k.accentColor}
                        visualFilter={k.visualFilter}
                        interactiveHover={false}
                        showSparkles={false}
                        showShimmer={false}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-200 truncate w-full font-display">
                      {k.name.replace('Karambit | ', '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. StatTrak Configuration */}
            <div className="bg-krm-surface p-5 rounded-2xl border border-krm-border space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-wider text-gray-300 font-display flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  2. Grabado Digital StatTrak™ (+{ADDON_PRICES.statTrak.toFixed(2)}€)
                </label>
                <span className="text-xs font-mono text-amber-400 font-bold">LED CS2 Orange</span>
              </div>
              <p className="text-xs text-gray-400 font-body">
                Introduce el número de bajas que se grabará sobre la hoja (hasta 4 dígitos):
              </p>
              <div className="flex flex-wrap gap-2">
                {['007', '420', '777', '1337'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setStatTrakNumber(val)}
                    className="px-2.5 py-1 rounded-lg bg-[#141724] border border-krm-border text-xs font-mono text-gray-300 hover:text-amber-400"
                  >
                    #{val}
                  </button>
                ))}
                <input aria-label="Número StatTrak"
                  type="text"
                  maxLength={4}
                  value={statTrakNumber}
                  onChange={(e) => setStatTrakNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="000"
                  className="flex-1 min-w-[80px] bg-krm-card border border-[#2b3550] focus:border-amber-500 rounded-lg px-3 py-1.5 text-sm font-mono text-amber-400 text-center font-bold outline-none"
                />
              </div>
            </div>

            {/* 3. NameTag Laser Text */}
            <div className="bg-krm-surface p-5 rounded-2xl border border-krm-border space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-wider text-gray-300 font-display flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-gray-300" />
                  3. Placa NameTag con Remaches (+{ADDON_PRICES.nameTag.toFixed(2)}€)
                </label>
                <span className="text-xs text-gray-500 font-mono">Máx 12 Letras</span>
              </div>
              <input aria-label="Texto de la placa NameTag"
                type="text"
                maxLength={12}
                value={nameTagText}
                onChange={(e) => setNameTagText(e.target.value.toUpperCase().slice(0, 12))}
                placeholder="EJ: S1MPLE, CLUTCH, ACE..."
                className="w-full bg-krm-card border border-[#2b3550] focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm font-mono uppercase text-white tracking-widest outline-none"
              />
            </div>

            {/* 4. Condition & Blade Type */}
            <div className="bg-krm-surface p-5 rounded-2xl border border-krm-border space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-gray-300 font-display block flex justify-between">
                <span>4. Estado y Filo</span>
                <span className="text-amber-400 font-mono">
                  {condition === 'Battle-Scarred' ? `-${battleScarredDiscount}% DESCUENTO` : 'Float 0.01'}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCondition('Factory New')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    condition === 'Factory New'
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-krm-card border-krm-border text-gray-400'
                  }`}
                >
                  <p className="text-xs font-bold font-display uppercase flex justify-between">
                    Factory New
                    {condition === 'Factory New' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </p>
                  <p className="text-[10px] text-gray-500">Recién Fabricado · Impecable</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCondition('Battle-Scarred')}
                  disabled={!rules.conditions.includes('Battle-Scarred')}
                  className={`disabled:opacity-40 disabled:cursor-not-allowed p-2.5 rounded-xl border text-left transition-all ${
                    condition === 'Battle-Scarred'
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-krm-card border-krm-border text-gray-400'
                  }`}
                >
                  <p className="text-xs font-bold font-display uppercase flex justify-between">
                    Battle-Scarred
                    {condition === 'Battle-Scarred' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </p>
                  <p className="text-[10px] text-emerald-400">-25% Descuento</p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBladeType('Sin Filo (Unsharpened)')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    bladeType.includes('Sin Filo')
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-krm-card border-krm-border text-gray-400'
                  }`}
                >
                  <p className="text-xs font-bold font-display uppercase flex justify-between">
                    Sin Filo (Tricks)
                    {bladeType.includes('Sin Filo') && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </p>
                  <p className="text-[10px] text-gray-500">Seguro para spinning</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBladeType('Afilada (Sharpened)')}
                  disabled={!rules.allowSharpened}
                  className={`disabled:opacity-40 disabled:cursor-not-allowed p-2.5 rounded-xl border text-left transition-all ${
                    bladeType.includes('Afilada')
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-krm-card border-krm-border text-gray-400'
                  }`}
                >
                  <p className="text-xs font-bold font-display uppercase flex justify-between">
                    Hoja Afilada
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                  </p>
                  <p className="text-[10px] text-gray-500">Corte real funcional</p>
                </button>
              </div>
            </div>

            {/* 5. Accessories Cross-Sell */}
            <div className="bg-krm-surface p-5 rounded-2xl border border-krm-border space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-gray-300 font-display block">
                5. Accesorios Opcionales
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#141724] border border-krm-border cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={includeStand}
                    onChange={(e) => setIncludeStand(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white font-display uppercase block">
                      Soporte Acrílico Oficial (+{ADDON_PRICES.stand.toFixed(2)}€)
                    </span>
                    <span className="text-[10px] text-gray-400 font-body">
                      Cristal de 8mm con grabado láser KRM
                    </span>
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#141724] border border-krm-border cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={includeKydex}
                    onChange={(e) => setIncludeKydex(e.target.checked)}
                    disabled={!rules.allowKydex}
                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <div>
                    <span className="text-xs font-bold text-white font-display uppercase block">
                      Funda Protectora Kydex (+{ADDON_PRICES.kydex.toFixed(2)}€)
                    </span>
                    <span className="text-[10px] text-gray-400 font-body">
                      Clip de cintura y retención táctica
                    </span>
                  </div>
                </div>
              </label>
            </div>

            {/* Price & Action */}
            <div className="p-6 rounded-3xl bg-[#090b10] border border-[#232c44] shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase text-gray-500 block font-body">
                  Total Personalizado en Taller
                </span>
                <span className="text-3xl font-black text-krm-accent font-display">
                  {totalConfigPrice.toFixed(2)}€
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOrderCustomKnife(false)}
                  className="px-5 py-3 rounded-xl font-bold font-display uppercase text-white bg-krm-border hover:bg-[#2c3347] transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Al Carrito
                </button>
                <button
                  type="button"
                  onClick={() => handleOrderCustomKnife(true)}
                  className="px-6 py-3 rounded-xl font-black font-display uppercase text-black transition-all hover:scale-105 flex items-center gap-1.5 shadow-lg shadow-amber-500/25 cursor-pointer text-xs"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  <Zap className="w-4 h-4" />
                  Comprar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StatTrakPage;
