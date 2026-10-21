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
import { karambits, rarityColors, type Product } from '../data/karambits';

interface ArsenalKnifeItem {
  knife: CartItem;
  orderId: string;
  orderDate: string;
  serialNumber: string;
  baseProduct?: Product;
}

export const OrdersPage: React.FC = () => {
  const { orders } = useStore();
  const [activeTab, setActiveTab] = useState<'arsenal' | 'history'>('arsenal');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectedKnife, setInspectedKnife] = useState<ArsenalKnifeItem | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper for real PNG image lookup
  const getItemImage = (item: CartItem) => {
    const baseId = item.productId || item.id.split('-')[0];
    const found = karambits.find(
      (k) =>
        k.id === baseId ||
        item.id.includes(k.id) ||
        (item.name &&
          item.name.toLowerCase().includes(k.name.replace('Karambit | ', '').toLowerCase()))
    );
    if (found?.image) return found.image;
    if (item.image && item.image.startsWith('http')) return item.image;
    return karambits[0].image;
  };

  const getItemFilter = (item: CartItem) => {
    if (item.visualFilter) return item.visualFilter;
    const baseId = item.productId || item.id.split('-')[0];
    const found = karambits.find((k) => k.id === baseId || item.id.startsWith(k.id));
    return found?.visualFilter || undefined;
  };

  const getBaseProduct = (item: CartItem): Product | undefined => {
    const baseId = item.productId || item.id.split('-')[0];
    return karambits.find((k) => k.id === baseId || item.id.startsWith(k.id));
  };

  // Flatten all items across all orders for the Arsenal IRL inventory view
  const arsenalItems: ArsenalKnifeItem[] = [];
  orders.forEach((order) => {
    order.items.forEach((item, idx) => {
      const key = item.id || `item-${idx}`;
      const serialNumber =
        (order.serialNumbers && order.serialNumbers[key]) ||
        `SN-440C-${7000 + idx * 37}`;

      arsenalItems.push({
        knife: item,
        orderId: order.id,
        orderDate: order.date,
        serialNumber,
        baseProduct: getBaseProduct(item),
      });
    });
  });

  const paymentLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    credit_card: { label: 'Tarjeta Pro 3D', icon: <CreditCard className="w-3.5 h-3.5" /> },
    bizum_apple_pay: { label: 'Bizum / Pay', icon: <Smartphone className="w-3.5 h-3.5" /> },
    crypto: { label: 'Crypto Web3', icon: <Coins className="w-3.5 h-3.5" /> },
    steam_skins: { label: 'Trade Skins CS2', icon: <Flame className="w-3.5 h-3.5" /> },
    balance: { label: 'Saldo KRM', icon: <Wallet className="w-3.5 h-3.5" /> },
  };

  return (
    <main className="min-h-screen pt-28 pb-24 w-full bg-[#090a0f] text-gray-200">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* ══════════ PAGE HEADER ══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black font-['Rajdhani'] text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/25">
              PANEL DE CONTROL DE COLECCIONISTA
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white font-['Rajdhani'] uppercase tracking-tight">
            Mis Pedidos & <span className="text-[#f59e0b]">Arsenal IRL</span>
          </h1>
          <p className="mt-1 text-gray-400 font-['Inter'] text-sm">
            Gestiona tu colección de réplicas 1:1 desbloqueadas, números de serie de taller y certificados oficiales.
          </p>
        </motion.div>

        {/* ══════════ NAVIGATION TABS ══════════ */}
        <div className="flex border-b border-[#1f2433] mb-8 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('arsenal')}
            className={`pb-3.5 px-4 font-black font-['Rajdhani'] uppercase tracking-wider text-sm flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
              activeTab === 'arsenal'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Mi Arsenal Desbloqueado (Inventario IRL)
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-[#161a29] border border-[#232a3d] text-gray-300 font-mono">
              {arsenalItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3.5 px-4 font-black font-['Rajdhani'] uppercase tracking-wider text-sm flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Historial de Pedidos y Facturas
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-[#161a29] border border-[#232a3d] text-gray-300 font-mono">
              {orders.length}
            </span>
          </button>
        </div>

        {/* ══════════ EMPTY STATE IF NO ORDERS ══════════ */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-[#0e1017] rounded-3xl border border-[#1f2433] p-8 max-w-xl mx-auto shadow-2xl"
          >
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black font-['Rajdhani'] uppercase text-white mb-2">
              Aún no tienes réplicas en tu inventario
            </h3>
            <p className="text-gray-400 text-xs font-['Inter'] mb-6 max-w-md mx-auto">
              Visita el catálogo, personaliza tu cuchillo en el StatTrak™ Lab o abre cajas en el simulador de Mystery Boxes para desbloquear réplicas reales 1:1.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/shop"
                className="px-6 py-3 rounded-xl font-black font-['Rajdhani'] uppercase tracking-wider text-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
              >
                Explorar Catálogo
              </Link>
              <Link
                to="/mystery-boxes"
                className="px-6 py-3 rounded-xl font-bold font-['Rajdhani'] uppercase tracking-wider text-gray-300 bg-[#141824] border border-[#232b40] hover:text-white text-sm"
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
                <div className="flex justify-between items-center text-xs text-gray-400 font-['Inter']">
                  <span>
                    Mostrando <strong>{arsenalItems.length}</strong> cuchillos forjados en acero inoxidable 440C
                  </span>
                  <span className="text-amber-400 font-mono font-bold">
                    Balance de peso real ~115g
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {arsenalItems.map((item, idx) => {
                    const knifeImage = getItemImage(item.knife);
                    const rarityColor = item.baseProduct
                      ? rarityColors[item.baseProduct.rarity] || '#f59e0b'
                      : '#f59e0b';

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="rounded-3xl p-5 border border-[#1f2538] bg-[#0e1017] shadow-xl hover:border-amber-500/50 transition-all flex flex-col justify-between group relative overflow-hidden"
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
                          <img
                            src={knifeImage}
                            alt={item.knife.name}
                            style={{ filter: getItemFilter(item.knife) }}
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

                          <h3 className="text-base font-black text-white font-['Rajdhani'] uppercase truncate">
                            {item.knife.name}
                          </h3>

                          {/* Customization Badges */}
                          <div className="flex flex-wrap gap-1">
                            {item.knife.condition && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-white/5 text-gray-300 border border-white/10">
                                {item.knife.condition}
                              </span>
                            )}
                            {item.knife.bladeType && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-['Inter'] bg-[#1a2133] text-gray-300">
                                {item.knife.bladeType.includes('Afilada') ? 'Afilada' : 'Sin Filo'}
                              </span>
                            )}
                            {item.knife.statTrak && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5" /> ST™ #
                                {String(item.knife.statTrakCount ?? '000').padStart(3, '0')}
                              </span>
                            )}
                            {item.knife.nameTag && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-zinc-200">
                                "{item.knife.nameTag}"
                              </span>
                            )}
                          </div>

                          {/* Inspect button */}
                          <button
                            type="button"
                            onClick={() => setInspectedKnife(item)}
                            className="w-full mt-3 py-2 rounded-xl text-xs font-bold font-['Rajdhani'] uppercase tracking-wider text-gray-300 bg-[#141824] hover:bg-[#1f2638] hover:text-white border border-[#232c40] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                  const payInfo = paymentLabels[order.paymentMethod] || paymentLabels.credit_card;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-3xl overflow-hidden border border-[#1f2433] bg-[#0e1017] shadow-xl hover:border-gray-700 transition-all"
                    >
                      {/* Order top bar */}
                      <div className="p-5 border-b border-[#1f2433] bg-[#12141f] flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-bold font-mono text-base">
                              {order.id}
                            </span>
                            <span className="flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold font-['Rajdhani'] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {order.status || 'Verificado & Grabado'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-['Inter']">
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
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold font-['Rajdhani'] uppercase bg-[#181d2c] border border-[#242e48] text-gray-300">
                            {payInfo.icon}
                            {payInfo.label}
                          </span>

                          <Link
                            to={`/order-success/${order.id}`}
                            className="px-4 py-2 rounded-xl text-xs font-bold font-['Rajdhani'] uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Ver Certificado Oficial
                          </Link>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="p-5 space-y-3">
                        {order.items.map((item, idx) => {
                          const knifeImage = getItemImage(item);
                          const key = item.id || `item-${idx}`;
                          const serialNumber =
                            (order.serialNumbers && order.serialNumbers[key]) ||
                            `SN-440C-${7000 + idx * 37}`;

                          return (
                            <div
                              key={idx}
                              className="p-3.5 rounded-2xl bg-[#141724] border border-[#1b2234] flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-[#090b10] border border-[#1d2538] p-1 flex items-center justify-center shrink-0">
                                  <img
                                    src={knifeImage}
                                    alt={item.name}
                                    style={{ filter: getItemFilter(item) }}
                                    className="w-full h-full object-contain drop-shadow"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-white text-sm font-bold font-['Rajdhani'] truncate">
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400 font-['Inter'] mt-0.5">
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
                                <span className="text-white font-mono font-bold text-sm">
                                  {(item.price * item.quantity).toFixed(2)}€
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="p-5 border-t border-[#1f2433] bg-[#0b0d14] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div className="flex items-center gap-2 text-gray-400 font-['Inter']">
                          <span>Certificado Digital:</span>
                          <code className="text-amber-400 font-mono font-bold bg-[#141724] px-2 py-0.5 rounded border border-[#1f2433]">
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
                              Cupón: {order.couponApplied} (-{order.discount.toFixed(2)}€)
                            </span>
                          )}
                          <div>
                            <span className="text-gray-500 mr-2 font-['Inter']">Total Pagado:</span>
                            <span className="text-2xl font-black text-[#f59e0b] font-['Rajdhani']">
                              {order.total.toFixed(2)}€
                            </span>
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
              className="w-full max-w-2xl p-8 rounded-3xl bg-[#0e1017] border border-[#232a3d] shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setInspectedKnife(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1f30] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/25">
                  NUMERO DE SERIE: {inspectedKnife.serialNumber}
                </span>
                <span className="text-xs text-gray-400 font-['Inter']">
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
                <img
                  src={getItemImage(inspectedKnife.knife)}
                  alt={inspectedKnife.knife.name}
                  style={{ filter: getItemFilter(inspectedKnife.knife) }}
                  className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(245,158,11,0.35)]"
                />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-white font-['Rajdhani'] uppercase">
                  {inspectedKnife.knife.name}
                </h3>
                <p className="text-xs text-gray-400 font-['Inter']">
                  Acero Inoxidable 440C · Réplica Oficial 1:1 CS2 · Balance Artesanal 115g
                </p>

                <div className="flex flex-wrap justify-center gap-2 pt-3">
                  {inspectedKnife.knife.condition && (
                    <span className="text-xs px-3 py-1 rounded-lg font-mono bg-white/10 text-white">
                      Condición: {inspectedKnife.knife.condition}
                    </span>
                  )}
                  {inspectedKnife.knife.bladeType && (
                    <span className="text-xs px-3 py-1 rounded-lg font-['Inter'] bg-[#1a2133] text-gray-300">
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

              <div className="mt-6 pt-6 border-t border-[#1f2433] flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleCopy(inspectedKnife.serialNumber)}
                  className="px-4 py-2 rounded-xl bg-[#141724] border border-[#232b40] text-xs font-['Rajdhani'] uppercase text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Serial
                </button>

                <Link
                  to={`/order-success/${inspectedKnife.orderId}`}
                  className="px-5 py-2 rounded-xl text-xs font-black font-['Rajdhani'] uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 flex items-center gap-1.5 shadow-md shadow-amber-500/25"
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
