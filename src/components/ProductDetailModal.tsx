import React, { useCallback, useEffect, useState } from 'react';
import { X, Heart, ShoppingBag, RotateCw } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useStore, useIsInWishlist, useIsOwned } from '../store/useStore';
import { ADDON_PRICES, isOneOfOne } from '../lib/pricing';
import { rarityColors, type Product } from '../data/karambits';
import { KarambitVFXImage } from './KarambitVFXImage';
import { CheckRow, Choice, ChoiceGroup } from './CheckRow';
import { NameTagPreview, StatTrakPreview } from './EngravingPreview';
import { CharCount } from './product/CharCount';
import { NAMETAG_MAX_CHARS, STATTRAK_MAX_DIGITS, useConfigurator } from './product/useConfigurator';
import { isFounderPiece, skinName } from '../lib/productDisplay';
import { useIsVault, useVaultPick, useVaultTone, VAULT_STAGE_STYLE, VaultToneContext } from './ui/vaultTone';
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
      dark={shown ? isFounderPiece(shown) : false}
    >
      {shown && (
        <VaultToneContext value={isFounderPiece(shown) ? 'dark' : 'light'}>
          <QuickViewContent key={shown.id} product={shown} onClose={close} />
        </VaultToneContext>
      )}
    </Modal>
  );
};

const QuickViewContent: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const navigate = useNavigate();
  const { toggleWishlist, setCartOpen } = useStore(
    useShallow((s) => ({
      toggleWishlist: s.toggleWishlist,
      setCartOpen: s.setCartOpen,
    }))
  );
  const wishlisted = useIsInWishlist(product.id);
  // Solo las piezas 1-of-1 se agotan al comprarlas; el resto se puede volver a pedir.
  const owned = useIsOwned(product.id) && isOneOfOne(product);

  // Opciones, restricciones 1-of-1, precio y línea de carrito: hook compartido con la ficha completa.
  const cfg = useConfigurator(product);
  const { state, actions, rules, condition, sharpened, nameTagActive, statTrakLabel, battleScarredDiscount } = cfg;
  const [rotationAngle, setRotationAngle] = useState(0);

  const displayName = skinName(product.name).split(' — ')[0];

  const handleAddToCart = () => {
    if (!cfg.addConfiguredToCart()) return;
    onClose();
    setCartOpen(true);
  };

  const handleInstantBuy = () => {
    if (!cfg.prepareForCheckout()) return;
    onClose();
    navigate('/checkout');
  };

  const t = useVaultPick();
  const vault = useIsVault();
  const tone = useVaultTone();
  const ruleClass = t('border-line', 'border-paper/20');
  const labelClass = `eyebrow ${t('', '!text-paper/60')}`;
  const rowHead = `eyebrow mb-2 flex items-baseline justify-between gap-3 ${t('', '!text-paper/60')}`;
  const rowTitle = t('text-ink', 'text-paper');
  const inlineInput = `border px-2.5 py-1.5 font-mono text-sm font-medium ${t(
    'border-line bg-paper-2 text-ink focus:border-ink',
    'border-paper/30 bg-transparent text-paper focus:border-paper'
  )}`;

  return (
    <>
      {/* Cabecera */}
      <div className={`flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 ${ruleClass}`}>
        <div className="flex min-w-0 items-center gap-x-3">
          <Badge color={rarityColors[product.rarity]} className="shrink-0">
            {product.rarity}
          </Badge>
          <span className={`${labelClass} hidden truncate sm:inline`}>{product.category}</span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            to={`/product/${product.slug}`}
            onClick={onClose}
            className={buttonClasses({ variant: 'link', size: 'sm', tone })}
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
            className={`flex h-8 w-8 items-center justify-center border transition-colors hover:text-pink ${t(
              'border-line text-ink hover:border-ink',
              'border-paper/30 text-paper hover:border-paper'
            )}`}
            aria-label={wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            aria-pressed={wishlisted}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-pink text-pink' : ''}`} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center border transition-colors ${t(
              'border-ink text-ink hover:bg-ink hover:text-paper',
              'border-paper/40 text-paper hover:border-paper hover:bg-paper hover:text-ink'
            )}`}
            aria-label="Cerrar vista rápida"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="grid flex-1 grid-cols-1 overflow-y-auto md:grid-cols-12">
        {/* Escenario */}
        <div className={`p-4 sm:p-6 md:col-span-5 md:border-r ${ruleClass}`}>
          <div
            className={`relative aspect-square overflow-hidden ${t('bg-tile', 'border border-paper/20 bg-ink')}`}
            style={vault ? VAULT_STAGE_STYLE : undefined}
          >
            <button
              type="button"
              onClick={() => setRotationAngle((prev) => (prev + 45) % 360)}
              className={`absolute right-2 top-2 z-40 flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] transition-colors ${t(
                'bg-paper text-ink hover:text-pink-ink',
                'border border-paper/40 bg-ink text-paper hover:border-paper hover:bg-paper hover:text-ink'
              )}`}
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
                image={product.image}
                name={product.name}
                interactiveHover={false}
                gleam={vault}
                slug={product.slug}
              />
              {state.statTrak && <StatTrakPreview value={state.statTrakNumber} compact />}
              {nameTagActive && <NameTagPreview text={state.nameTagText} compact />}
            </div>
          </div>
          <p className={`${labelClass} mt-3`}>
            {condition}
            {rules.singleUnit ? ' · Pieza 1 de 1' : ''}
          </p>
        </div>

        {/* Configurador */}
        <div className="space-y-5 p-4 sm:p-6 md:col-span-7">
          <div>
            <h2 className="display-md">{displayName}</h2>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
              <Price value={product.basePrice} size="md" tone={vault ? 'pink' : 'ink'} />
              {product.originalPrice && product.originalPrice > product.basePrice && (
                <Price value={product.originalPrice} size="xs" tone="muted" strike />
              )}
            </div>
            <p className={`mt-2 line-clamp-3 font-body text-sm leading-relaxed ${t('text-ink-2', 'text-paper/75')}`}>
              {product.description}
            </p>
          </div>

          {rules.singleUnit && (
            <p className={`border-l-2 border-pink pl-3 font-body text-xs leading-relaxed ${t('text-ink-2', 'text-paper/75')}`}>
              Pieza 1 de 1 · DuFiTuFi Design (CEO). Solo existe una unidad: únicamente Factory New, sin filo real y sin
              funda Kydex.
            </p>
          )}

          <div>
            <p className={rowHead}>
              <span className={rowTitle}>01 — Estado</span>
              <span>{condition === 'Battle-Scarred' ? `-${battleScarredDiscount}%` : 'Float 0.01'}</span>
            </p>
            <ChoiceGroup label="Estado del acabado">
              <Choice
                compact
                active={condition === 'Factory New'}
                onClick={() => actions.setCondition('Factory New')}
                title="Factory New"
                sub="Recién fabricado"
              />
              <Choice
                compact
                active={condition === 'Battle-Scarred'}
                onClick={() => actions.setCondition('Battle-Scarred')}
                disabled={!rules.conditions.includes('Battle-Scarred')}
                title="Battle-Scarred"
                sub={`-${battleScarredDiscount}% de descuento`}
              />
            </ChoiceGroup>
          </div>

          <div>
            <p className={rowHead}>
              <span className={rowTitle}>02 — Hoja</span>
              <span>{sharpened ? 'Corte real' : 'Apta para tricks'}</span>
            </p>
            <ChoiceGroup label="Tipo de hoja">
              <Choice
                compact
                active={!sharpened}
                onClick={() => actions.setBlade('Sin Filo (Unsharpened)')}
                title="Sin filo"
                sub="Segura para exhibición"
              />
              <Choice
                compact
                active={sharpened}
                onClick={() => actions.setBlade('Afilada (Sharpened)')}
                disabled={!rules.allowSharpened}
                title="Afilada"
                sub="Filo real · +18 años"
              />
            </ChoiceGroup>
          </div>

          <div>
            <p className={rowHead}>
              <span className={rowTitle}>03 — Grabados y extras</span>
            </p>
            <div className={`border-t ${ruleClass}`}>
              <CheckRow
                checked={state.statTrak}
                onChange={actions.setStatTrak}
                aside={<Price value={ADDON_PRICES.statTrak} size="xs" prefix="+" />}
              >
                StatTrak™
              </CheckRow>
              {state.statTrak && (
                <div className={`flex items-center gap-3 border-b pb-3 pl-7 ${ruleClass}`}>
                  <label htmlFor="qv-stattrak" className={labelClass}>
                    Bajas
                  </label>
                  <input
                    id="qv-stattrak"
                    type="text"
                    inputMode="numeric"
                    maxLength={STATTRAK_MAX_DIGITS}
                    value={state.statTrakNumber}
                    onChange={(e) => actions.setStatTrakNumber(e.target.value)}
                    className={`${inlineInput} w-24 tracking-[0.12em]`}
                  />
                  <span className={`font-mono text-xs tabular-nums ${t('text-ink-2', 'text-paper/70')}`}>
                    ST™ {statTrakLabel}
                  </span>
                </div>
              )}

              <CheckRow
                checked={state.nameTag}
                onChange={actions.setNameTag}
                aside={<Price value={ADDON_PRICES.nameTag} size="xs" prefix="+" />}
              >
                NameTag
              </CheckRow>
              {state.nameTag && (
                <div className={`flex items-center gap-3 border-b pb-3 pl-7 ${ruleClass}`}>
                  <label htmlFor="qv-nametag" className={labelClass}>
                    Texto
                  </label>
                  <input
                    id="qv-nametag"
                    type="text"
                    maxLength={NAMETAG_MAX_CHARS}
                    value={state.nameTagText}
                    onChange={(e) => actions.setNameTagText(e.target.value)}
                    aria-describedby="qv-nametag-count"
                    className={`${inlineInput} min-w-0 flex-1 uppercase tracking-[0.1em] sm:max-w-[11rem]`}
                  />
                  <CharCount id="qv-nametag-count" length={state.nameTagText.length} max={NAMETAG_MAX_CHARS} />
                </div>
              )}

              <CheckRow
                checked={state.stand}
                onChange={actions.setStand}
                aside={<Price value={ADDON_PRICES.stand} size="xs" prefix="+" />}
              >
                Soporte de exhibición
              </CheckRow>
              <CheckRow
                checked={cfg.config.kydex}
                onChange={actions.setKydex}
                disabled={!rules.allowKydex}
                hint={rules.allowKydex ? undefined : 'No disponible en piezas 1 de 1'}
                aside={<Price value={ADDON_PRICES.kydex} size="xs" prefix="+" />}
              >
                Funda Kydex
              </CheckRow>
            </div>
          </div>

          {/* Total y acciones */}
          <div
            className={`flex flex-wrap items-end justify-between gap-4 border-t pt-4 ${t('border-ink', 'border-paper/20')}`}
          >
            <div>
              <p className={`eyebrow ${t('!text-ink', '!text-paper')}`}>Total</p>
              <Price value={cfg.price} size="lg" tone={vault ? 'pink' : 'ink'} className="mt-1 block" />
            </div>

            {owned ? (
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="success">En tu colección</Badge>
                <Link to="/orders" onClick={onClose} className={buttonClasses({ variant: 'secondary', size: 'sm', tone })}>
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
