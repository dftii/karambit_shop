import { hideBrokenImage } from '../lib/imageFallback';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  ShieldCheck,
  CreditCard,
  Wallet,
  Coins,
  Flame,
  Copy,
  Check,
  Eye,
  Smartphone,
  Layers,
  X,
} from 'lucide-react';
import { useStore, type CartItem } from '../store/useStore';
import { rarityColors, type Product } from '../data/karambits';
import { findCartItemProduct, getCartItemFilter, getCartItemImage } from '../lib/cart';
import { getLineSerials } from '../lib/ids';
import { toast } from '../lib/toast';
import { useTimedValue } from '../lib/useTimedValue';
import { describePayment } from '../lib/payment';
import { formatEUR } from '../lib/format';
import { Price } from '../components/ui/Price';
import { LineBadges } from '../components/checkout/LineBadges';
import { PageMeta } from '../components/PageMeta';

interface ArsenalKnifeItem {
  knife: CartItem;
  orderId: string;
  orderDate: string;
  serialNumber: string;
  baseProduct?: Product;
}

export const OrdersPage: React.FC = () => {
  const orders = useStore((s) => s.orders);
  const [activeTab, setActiveTab] = useState<'arsenal' | 'history'>('arsenal');
  const [copiedId, flashCopied] = useTimedValue<string | null>(null, 2000);
  const [inspectedKnife, setInspectedKnife] = useState<ArsenalKnifeItem | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => flashCopied(text))
      .catch(() => toast.error('No se pudo copiar al portapapeles.'));
  };

  const getBaseProduct = (item: CartItem): Product | undefined => findCartItemProduct(item);

  // Seriales de una línea (uno por unidad); respaldo visual si faltara alguno.
  const serialsFor = (order: { serialNumbers: Record<string, string> }, item: CartItem): string[] => {
    const serials = getLineSerials(order.serialNumbers, item.lineId, item.quantity);
    return serials.length > 0 ? serials : ['SN-440C-N/D'];
  };

  // Flatten all items across all orders for the Arsenal IRL inventory view (una entrada por unidad)
  const arsenalItems: ArsenalKnifeItem[] = [];
  orders.forEach((order) => {
    order.items.forEach((item) => {
      serialsFor(order, item).forEach((serialNumber) => {
        arsenalItems.push({
          knife: item,
          orderId: order.id,
          orderDate: order.date,
          serialNumber,
          baseProduct: getBaseProduct(item),
        });
      });
    });
  });

  const paymentIcons: Record<string, React.ReactNode> = {
    credit_card: <CreditCard className="w-3.5 h-3.5" />,
    bizum_apple_pay: <Smartphone className="w-3.5 h-3.5" />,
    crypto: <Coins className="w-3.5 h-3.5" />,
    steam_skins: <Flame className="w-3.5 h-3.5" />,
    balance: <Wallet className="w-3.5 h-3.5" />,
  };

  return (
    <main id="main" tabIndex={-1} className="min-h-screen pt-28 pb-24 w-full bg-krm-bg text-gray-200">
      <PageMeta title="Mis Pedidos" description="Historial de pedidos, facturas y arsenal desbloqueado en KRM.GG." noindex />
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* ══════════ PAGE HEADER ══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black font-display text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/25">
              PANEL DE CONTROL DE COLECCIONISTA
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            Mis Pedidos & <span className="text-krm-accent">Arsenal IRL</span>
          </h1>
          <p className="mt-1 text-gray-400 font-body text-sm">
            Gestiona tu colección de réplicas 1:1 desbloqueadas, números de serie de taller y certificados oficiales.
          </p>
        </motion.div>

        {/* ══════════ NAVIGATION TABS ══════════ */}
        <div className="flex border-b border-krm-border mb-8 gap-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('arsenal')}
            className={`pb-3.5 px-4 font-black font-display uppercase tracking-wider text-sm flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
              activeTab === 'arsenal'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Mi Arsenal Desbloqueado (Inventario IRL)
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-krm-card-hi border border-[#232a3d] text-gray-300 font-mono">
              {arsenalItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3.5 px-4 font-black font-display uppercase tracking-wider text-sm flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Historial de Pedidos y Facturas
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-krm-card-hi border border-[#232a3d] text-gray-300 font-mono">
              {orders.length}
            </span>
          </button>
        </div>

        {/* ══════════ EMPTY STATE IF NO ORDERS ══════════ */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-krm-surface rounded-3xl border border-krm-border p-8 max-w-xl mx-auto shadow-2xl"
          >
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black font-display uppercase text-white mb-2">
              Aún no tienes réplicas en tu inventario
            </h3>
            <p className="text-gray-400 text-xs font-body mb-6 max-w-md mx-auto">
              Visita el catálogo, personaliza tu cuchillo en el StatTrak™ Lab o abre cajas en el simulador de Mystery Boxes para desbloquear réplicas reales 1:1.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/shop"
                className="px-6 py-3 rounded-xl font-black font-display uppercase tracking-wider text-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
              >
                Explorar Catálogo
              </Link>
              <Link
                to="/mystery-boxes"
                className="px-6 py-3 rounded-xl font-bold font-display uppercase tracking-wider text-gray-300 bg-[#141824] border border-krm-border-strong hover:text-white text-sm"
              >
                Abrir Mystery Boxes
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* ══════════ TAB 1: ARSENAL IRL INVENTORY ══════════ */}
            {activeTab === 'arsenal' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center text-xs text-gray-400 font-body">
                  <span>
                    Mostrando <strong>{arsenalItems.length}</strong> cuchillos forjados en acero inoxidable 440C
                  </span>
                  <span className="text-amber-400 font-mono font-bold">
                    Balance de peso real ~115g
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {arsenalItems.map((item, idx) => {
                    const knifeImage = getCartItemImage(item.knife);
                    const rarityColor = item.baseProduct
                      ? rarityColors[item.baseProduct.rarity] || '#f59e0b'
                      : '#f59e0b';

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="rounded-3xl p-5 border border-[#1f2538] bg-krm-surface shadow-xl hover:border-amber-500/50 transition-all flex flex-col justify-between group relative overflow-hidden"
                      >
                        {/* Top Rarity Accent Bar */}
                        <div
                          className="h-1 rounded-full w-full mb-3"
                          style={{ backgroundColor: rarityColor }}
                        />

                        {/* Knife PNG Image */}
                        <div className="w-full aspect-square flex items-center justify-center p-3 relative my-2">
                          <div
                            className="absolute inset-0 rounded-full blur-xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
                            style={{
                              background: `radial-gradient(circle, ${rarityColor} 0%, transparent 70%)`,
                            }}
                          />
                          <img loading="lazy" decoding="async" onError={hideBrokenImage}
                            src={knifeImage}
                            alt={item.knife.name}
                            style={{ filter: getCartItemFilter(item.knife) }}
                            className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(245,158,11,0.2)] group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300"
                          />
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {item.serialNumber}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {item.orderId}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-white font-display uppercase truncate">
                            {item.knife.name}
                          </h3>

                          <LineBadges item={item.knife} />

                          {/* Inspect button */}
                          <button
                            type="button"
                            onClick={() => setInspectedKnife(item)}
                            className="w-full mt-3 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider text-gray-300 bg-[#141824] hover:bg-krm-border-soft hover:text-white border border-[#232c40] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            Inspeccionar en Grande
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══════════ TAB 2: ORDER HISTORY & INVOICES ══════════ */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                {orders.map((order, i) => {
                  const payInfo = describePayment(order);

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-3xl overflow-hidden border border-krm-border bg-krm-surface shadow-xl hover:border-gray-700 transition-all"
                    >
                      {/* Order top bar */}
                      <div className="p-5 border-b border-krm-border bg-[#12141f] flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-bold font-mono text-base">
                              {order.id}
                            </span>
                            <span className="flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold font-display uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {order.status || 'Verificado & Grabado'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-body">
                            Fecha:{' '}
                            {new Date(order.date).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            · Titular: <strong className="text-gray-300">{order.collectorAlias || 'GhostCS2'}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold font-display uppercase bg-[#181d2c] border border-[#242e48] text-gray-300">
                            {paymentIcons[order.paymentMethod] ?? <CreditCard className="w-3.5 h-3.5" />}
                            {payInfo.label}
                          </span>

                          <Link
                            to={`/order-success/${order.id}`}
                            className="px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Ver Certificado Oficial
                          </Link>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="p-5 space-y-3">
                        {order.items.map((item, idx) => {
                          const knifeImage = getCartItemImage(item);
                          const serialNumber = serialsFor(order, item).join(' · ');

                          return (
                            <div
                              key={idx}
                              className="p-3.5 rounded-2xl bg-[#141724] border border-[#1b2234] flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-[#090b10] border border-[#1d2538] p-1 flex items-center justify-center shrink-0">
                                  <img loading="lazy" decoding="async" onError={hideBrokenImage}
                                    src={knifeImage}
                                    alt={item.name}
                                    style={{ filter: getCartItemFilter(item) }}
                                    className="w-full h-full object-contain drop-shadow"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-white text-sm font-bold font-display truncate">
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400 font-body mt-0.5">
                                    <span className="text-amber-400 font-mono text-[11px] font-bold">
                                      {serialNumber}
                                    </span>
                                    {item.condition && (
                                      <span className="text-[10px] text-gray-400">· {item.condition}</span>
                                    )}
                                    {item.statTrak && (
                                      <span className="text-[10px] text-amber-400 font-mono">
                                        · ST™ #{String(item.statTrakCount ?? '000').padStart(3, '0')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <Price value={item.price * item.quantity} size="sm" tone="white" />
                                {item.quantity > 1 && (
                                  <span className="block font-mono text-[10px] text-gray-500">
                                    {item.quantity} × {formatEUR(item.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {payInfo.lines.length > 0 && (
                        <div className="px-5 pb-4">
                          <dl className="flex flex-wrap gap-x-6 gap-y-1.5 rounded-xl border border-krm-border-soft bg-krm-bg-deep px-4 py-3 text-xs">
                            <div className="min-w-0">
                              <dt className="font-body text-[10px] uppercase tracking-wider text-gray-500">Pago</dt>
                              <dd className="font-display font-bold text-gray-200">{payInfo.label}</dd>
                            </div>
                            {payInfo.lines.map((line) => (
                              <div key={line.label} className="min-w-0">
                                <dt className="font-body text-[10px] uppercase tracking-wider text-gray-500">{line.label}</dt>
                                <dd className="font-mono text-gray-300 [overflow-wrap:anywhere]">{line.value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="p-5 border-t border-krm-border bg-[#0b0d14] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div className="flex items-center gap-2 text-gray-400 font-body">
                          <span>Certificado Digital:</span>
                          <code className="text-amber-400 font-mono font-bold bg-[#141724] px-2 py-0.5 rounded border border-krm-border">
                            {order.digitalCertificateId || `CERT-${order.id}`}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.digitalCertificateId || `CERT-${order.id}`)}
                            className="p-1 text-gray-400 hover:text-white"
                            title="Copiar Certificado"
                          >
                            {copiedId === (order.digitalCertificateId || `CERT-${order.id}`) ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          {order.couponApplied && (
                            <span className="text-emerald-400 font-mono font-bold">
                              Cupón: {order.couponApplied} (-{formatEUR(order.discount)})
                            </span>
                          )}
                          <div>
                            <span className="text-gray-500 mr-2 font-body">Total Pagado:</span>
                            <Price value={order.total} size="lg" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════ INSPECT MODAL ══════════ */}
      <AnimatePresence>
        {inspectedKnife && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setInspectedKnife(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl p-8 rounded-3xl bg-krm-surface border border-[#232a3d] shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setInspectedKnife(null)}
                aria-label="Cerrar detalle"
                className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1f30] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/25">
                  NUMERO DE SERIE: {inspectedKnife.serialNumber}
                </span>
                <span className="text-xs text-gray-400 font-body">
                  Pedido {inspectedKnife.orderId}
                </span>
              </div>

              {/* Knife Display */}
              <div className="w-full h-64 flex items-center justify-center relative my-4">
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-30"
                  style={{
                    background: `radial-gradient(circle, #f59e0b 0%, transparent 70%)`,
                  }}
                />
                <img loading="lazy" decoding="async" onError={hideBrokenImage}
                  src={getCartItemImage(inspectedKnife.knife)}
                  alt={inspectedKnife.knife.name}
                  style={{ filter: getCartItemFilter(inspectedKnife.knife) }}
                  className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(245,158,11,0.35)]"
                />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-white font-display uppercase">
                  {inspectedKnife.knife.name}
                </h3>
                <p className="text-xs text-gray-400 font-body">
                  Acero Inoxidable 440C · Réplica Oficial 1:1 CS2 · Balance Artesanal 115g
                </p>

                <div className="flex flex-wrap justify-center gap-2 pt-3">
                  {inspectedKnife.knife.condition && (
                    <span className="text-xs px-3 py-1 rounded-lg font-mono bg-white/10 text-white">
                      Condición: {inspectedKnife.knife.condition}
                    </span>
                  )}
                  {inspectedKnife.knife.bladeType && (
                    <span className="text-xs px-3 py-1 rounded-lg font-body bg-[#1a2133] text-gray-300">
                      Filo: {inspectedKnife.knife.bladeType}
                    </span>
                  )}
                  {inspectedKnife.knife.statTrak && (
                    <span className="text-xs px-3 py-1 rounded-lg font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      StatTrak™ #{String(inspectedKnife.knife.statTrakCount ?? '000').padStart(3, '0')}
                    </span>
                  )}
                  {inspectedKnife.knife.nameTag && (
                    <span className="text-xs px-3 py-1 rounded-lg font-mono bg-zinc-800 text-zinc-200 border border-zinc-700">
                      Placa NameTag: "{inspectedKnife.knife.nameTag}"
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-krm-border flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleCopy(inspectedKnife.serialNumber)}
                  className="px-4 py-2 rounded-xl bg-[#141724] border border-krm-border-strong text-xs font-display uppercase text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Serial
                </button>

                <Link
                  to={`/order-success/${inspectedKnife.orderId}`}
                  className="px-5 py-2 rounded-xl text-xs font-black font-display uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 flex items-center gap-1.5 shadow-md shadow-amber-500/25"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Ver Certificado Oficial
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default OrdersPage;
