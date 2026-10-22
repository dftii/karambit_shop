import React, { useCallback, useEffect, useState } from 'react';
import { X, Heart, ShoppingBag, RotateCw } from 'lucide-react';
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
import { CheckRow, Choice, ChoiceGroup } from './CheckRow';
import { NameTagPreview, StatTrakPreview } from './EngravingPreview';
import { formatStatTrak, skinName } from '../lib/productDisplay';
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
      panelClassName="flex max-h-[92vh] flex-col overflow-hidden"
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

  const displayName = skinName(product.name).split(' — ')[0];

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
  const sharpened = bladeType.includes('Afilada');

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

  const rowHead = 'eyebrow mb-2 flex items-baseline justify-between gap-3';
  const inlineInput =
    'border border-line bg-paper-2 px-2.5 py-1.5 font-mono text-sm font-medium text-ink focus:border-ink';

  return (
    <>
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-x-3">
          <Badge color={rarityColors[product.rarity]} className="shrink-0">
            {product.rarity}
          </Badge>
          <span className="eyebrow hidden truncate sm:inline">{product.category}</span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            to={`/product/${product.slug}`}
            onClick={onClose}
            className={buttonClasses({ variant: 'link', size: 'sm' })}
          >
            Ver ficha completa →
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
            className="flex h-8 w-8 items-center justify-center border border-line text-ink transition-colors hover:border-ink hover:text-pink"
            aria-label={wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            aria-pressed={wishlisted}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-pink text-pink' : ''}`} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
            aria-label="Cerrar vista rápida"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="grid flex-1 grid-cols-1 overflow-y-auto md:grid-cols-12">
        {/* Escenario */}
        <div className="p-4 sm:p-6 md:col-span-5 md:border-r md:border-line">
          <div className="relative aspect-square overflow-hidden bg-tile">
            <button
              type="button"
              onClick={() => setRotationAngle((prev) => (prev + 45) % 360)}
              className="absolute right-2 top-2 z-40 flex items-center gap-1.5 bg-paper px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:text-pink-ink"
              title="Girar modelo"
            >
              <RotateCw className="h-3 w-3" aria-hidden="true" />
              Rotar
            </button>

            <div
              className={`relative h-full w-full p-6 transition-transform duration-500 ease-out ${
                condition === 'Battle-Scarred' ? 'contrast-125 saturate-75 brightness-90' : ''
              }`}
              style={{ transform: `rotate(${rotationAngle}deg)` }}
            >
              <KarambitVFXImage
                plain
                image={product.image}
                name={product.name}
                slug={product.slug}
                gradient={product.gradient}
                accentColor={product.accentColor}
                interactiveHover={false}
              />
              {hasStatTrak && <StatTrakPreview value={statTrakNumber} compact />}
              {nameTagActive && <NameTagPreview text={nameTagText} compact />}
            </div>
          </div>
          <p className="eyebrow mt-3">
            {condition}
            {rules.singleUnit ? ' · Pieza 1 de 1' : ''}
          </p>
        </div>

        {/* Configurador */}
        <div className="space-y-5 p-4 sm:p-6 md:col-span-7">
          <div>
            <h2 className="display-md">{displayName}</h2>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
              <Price value={product.basePrice} size="md" />
              {product.originalPrice && product.originalPrice > product.basePrice && (
                <Price value={product.originalPrice} size="xs" tone="muted" strike />
              )}
            </div>
            <p className="mt-2 line-clamp-3 font-body text-sm leading-relaxed text-ink-2">{product.description}</p>
          </div>

          {rules.singleUnit && (
            <p className="border-l-2 border-pink pl-3 font-body text-xs leading-relaxed text-ink-2">
              Pieza 1 de 1 · DuFiTuFi Design (CEO). Solo existe una unidad: únicamente Factory New, sin filo real y sin
              funda Kydex.
            </p>
          )}

          <div>
            <p className={rowHead}>
              <span className="text-ink">01 — Estado</span>
              <span>{condition === 'Battle-Scarred' ? `-${battleScarredDiscount}%` : 'Float 0.01'}</span>
            </p>
            <ChoiceGroup label="Estado del acabado">
              <Choice
                compact
                active={condition === 'Factory New'}
                onClick={() => setCondition('Factory New')}
                title="Factory New"
                sub="Recién fabricado"
              />
              <Choice
                compact
                active={condition === 'Battle-Scarred'}
                onClick={() => setCondition('Battle-Scarred')}
                disabled={!rules.conditions.includes('Battle-Scarred')}
                title="Battle-Scarred"
                sub={`-${battleScarredDiscount}% de descuento`}
              />
            </ChoiceGroup>
          </div>

          <div>
            <p className={rowHead}>
              <span className="text-ink">02 — Hoja</span>
              <span>{sharpened ? 'Corte real' : 'Apta para tricks'}</span>
            </p>
            <ChoiceGroup label="Tipo de hoja">
              <Choice
                compact
                active={!sharpened}
                onClick={() => setBladeType('Sin Filo (Unsharpened)')}
                title="Sin filo"
                sub="Segura para exhibición"
              />
              <Choice
                compact
                active={sharpened}
                onClick={() => setBladeType('Afilada (Sharpened)')}
                disabled={!rules.allowSharpened}
                title="Afilada"
                sub="Filo real · +18 años"
              />
            </ChoiceGroup>
          </div>

          <div>
            <p className={rowHead}>
              <span className="text-ink">03 — Grabados y extras</span>
            </p>
            <div className="border-t border-line">
              <CheckRow
                checked={hasStatTrak}
                onChange={setHasStatTrak}
                aside={<Price value={ADDON_PRICES.statTrak} size="xs" prefix="+" />}
              >
                StatTrak™
              </CheckRow>
              {hasStatTrak && (
                <div className="flex items-center gap-3 border-b border-line pb-3 pl-7">
                  <label htmlFor="qv-stattrak" className="eyebrow">
                    Bajas
                  </label>
                  <input
                    id="qv-stattrak"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={statTrakNumber}
                    onChange={(e) => setStatTrakNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className={`${inlineInput} w-24 tracking-[0.12em]`}
                  />
                  <span className="font-mono text-xs tabular-nums text-ink-2">ST™ {formatStatTrak(statTrakNumber)}</span>
                </div>
              )}

              <CheckRow
                checked={hasNameTag}
                onChange={setHasNameTag}
                aside={<Price value={ADDON_PRICES.nameTag} size="xs" prefix="+" />}
              >
                NameTag
              </CheckRow>
              {hasNameTag && (
                <div className="flex items-center gap-3 border-b border-line pb-3 pl-7">
                  <label htmlFor="qv-nametag" className="eyebrow">
                    Texto
                  </label>
                  <input
                    id="qv-nametag"
                    type="text"
                    maxLength={12}
                    value={nameTagText}
                    onChange={(e) => setNameTagText(e.target.value.toUpperCase().slice(0, 12))}
                    className={`${inlineInput} min-w-0 flex-1 uppercase tracking-[0.1em] sm:max-w-[11rem]`}
                  />
                </div>
              )}

              <CheckRow
                checked={includeStand}
                onChange={setIncludeStand}
                aside={<Price value={ADDON_PRICES.stand} size="xs" prefix="+" />}
              >
                Soporte de exhibición
              </CheckRow>
              <CheckRow
                checked={includeKydex}
                onChange={setIncludeKydex}
                disabled={!rules.allowKydex}
                hint={rules.allowKydex ? undefined : 'No disponible en piezas 1 de 1'}
                aside={<Price value={ADDON_PRICES.kydex} size="xs" prefix="+" />}
              >
                Funda Kydex
              </CheckRow>
            </div>
          </div>

          {/* Total y acciones */}
          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink pt-4">
            <div>
              <p className="eyebrow !text-ink">Total</p>
              <Price value={calculatedPrice} size="lg" className="mt-1 block" />
            </div>

            {owned ? (
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="success">En tu colección</Badge>
                <Link to="/orders" onClick={onClose} className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
                  Ver mis pedidos
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button size="md" icon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />} onClick={handleAddToCart}>
                  Añadir al carrito
                </Button>
                <Button variant="secondary" size="md" onClick={handleInstantBuy}>
                  Comprar ahora
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
