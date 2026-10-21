import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Crown, Repeat, ShoppingCart, Wallet } from 'lucide-react';
import { rarityColors, type Product } from '../../data/karambits';
import { formatEUR } from '../../lib/format';
import { shortKnifeName } from '../../lib/mysteryCases';
import { Badge, Button, Price } from '../ui';
import { KarambitVFXImage } from '../KarambitVFXImage';
import { Confetti } from './Confetti';

interface PrizeCardProps {
  product: Product;
  /** Valor que paga "Vender por saldo". */
  buyback: number;
  /** Pieza 1-of-1 que ya tienes (en pedidos o en el carrito): solo se puede convertir en saldo. */
  mustConvert: boolean;
  /** Motivo por el que no se puede reclamar (si lo hay y no es el caso de conversión automática). */
  claimBlockedReason?: string;
  /** Saldo ya abonado por una conversión automática (la tarjeta queda sin acciones). */
  convertedPayout?: number;
  /** Nueva ráfaga de confeti/animación especial (se reinicia al cambiar). */
  celebrationKey: string;
  disabled: boolean;
  onClaim: () => void;
  onSell: () => void;
}

const FOUNDER_GRADIENT = 'linear-gradient(120deg, #fbbf24, #f472b6 55%, #38bdf8)';

/** Tarjeta del premio pendiente: reclamar (carrito a 0 €) o vender por saldo. */
export const PrizeCard: React.FC<PrizeCardProps> = ({
  product,
  buyback,
  mustConvert,
  claimBlockedReason,
  convertedPayout,
  celebrationKey,
  disabled,
  onClaim,
  onSell,
}) => {
  const reduced = useReducedMotion();
  const mythic = product.rarity === 'Mythic Bespoke';
  const color = rarityColors[product.rarity];
  const glow = mythic ? '#f472b6' : color;

  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, scale: 0.94, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.35 }}
      aria-live="polite"
      className="relative mx-auto mb-12 w-full max-w-2xl overflow-hidden rounded-3xl border bg-krm-panel p-5 text-center shadow-2xl sm:p-8"
      style={{ borderColor: `${glow}80` }}
    >
      {mythic && !reduced && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          animate={{ boxShadow: ['0 0 40px #fbbf2455 inset, 0 0 40px #fbbf2455', '0 0 70px #f472b655 inset, 0 0 70px #f472b655', '0 0 40px #fbbf2455 inset, 0 0 40px #fbbf2455'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {!mythic && <div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ boxShadow: `0 0 50px ${glow}33` }} />}
      {mythic && <Confetti key={celebrationKey} />}

      <div className="relative z-10">
        {mythic ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-display text-xs font-black uppercase tracking-widest text-black"
            style={{ background: FOUNDER_GRADIENT }}
          >
            <Crown className="h-3.5 w-3.5" />
            Pieza Mythic Bespoke — DuFiTuFi Design (CEO)
          </span>
        ) : (
          <Badge color={color}>Has desbloqueado · {product.rarity}</Badge>
        )}

        <div className="mx-auto my-5 flex aspect-square w-full max-w-[240px] items-center justify-center sm:max-w-[280px]">
          <KarambitVFXImage
            image={product.image}
            name={product.name}
            slug={product.slug}
            rarity={product.rarity}
            category={product.category}
            accentColor={product.accentColor}
            visualFilter={product.visualFilter}
            interactiveHover={false}
            animateLevitate
            showSparkles
            showShimmer
          />
        </div>

        <h2 className="font-display text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
          {shortKnifeName(product)}
        </h2>
        <p className="mt-1 font-body text-sm text-gray-400">
          Valor de catálogo: <Price value={product.basePrice} size="sm" /> · Recompra:{' '}
          <Price value={buyback} size="sm" tone="emerald" />
        </p>

        {mustConvert && (
          <p className="mx-auto mt-4 max-w-md rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 font-body text-xs leading-relaxed text-purple-200">
            {convertedPayout !== undefined
              ? `Esta pieza 1-of-1 ya forma parte de tu arsenal: solo existe una unidad, así que se ha convertido automáticamente en ${formatEUR(convertedPayout)} de saldo.`
              : 'Esta pieza 1-of-1 ya forma parte de tu arsenal: solo existe una unidad, así que solo puedes convertirla en saldo.'}
          </p>
        )}
        {!mustConvert && claimBlockedReason && (
          <p className="mx-auto mt-4 max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-body text-xs text-red-300">
            {claimBlockedReason}
          </p>
        )}

        {convertedPayout === undefined && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {!mustConvert && (
            <Button size="lg" icon={<ShoppingCart className="h-4 w-4" />} disabled={disabled || Boolean(claimBlockedReason)} onClick={onClaim}>
              Reclamar al carrito (0,00 €)
            </Button>
          )}
          <Button
            size="lg"
            variant="secondary"
            className={mustConvert ? 'sm:col-span-2' : ''}
            icon={mustConvert ? <Repeat className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
            disabled={disabled}
            onClick={onSell}
          >
            {mustConvert ? 'Convertir en' : 'Vender por'} saldo (+{formatEUR(buyback)})
          </Button>
        </div>
        )}
      </div>
    </motion.section>
  );
};
