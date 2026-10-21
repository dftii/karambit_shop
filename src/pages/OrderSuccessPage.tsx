import { hideBrokenImage } from '../lib/imageFallback';
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Printer,
  Package,
  CheckCircle2,
  Copy,
  Check,
  SearchX,
} from 'lucide-react';
import { useStore, type Order } from '../store/useStore';
import { getCartItemFilter, getCartItemImage } from '../lib/cart';
import { getLineSerials } from '../lib/ids';
import { toast } from '../lib/toast';
import { buttonClasses } from '../components/ui/buttonStyles';
import { useTimedValue } from '../lib/useTimedValue';
import { describePayment } from '../lib/payment';
import { Price } from '../components/ui/Price';
import { formatEUR } from '../lib/format';
import { LineBadges } from '../components/checkout/LineBadges';
import { PageMeta } from '../components/PageMeta';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orders = useStore((s) => s.orders);
  const [copiedSerial, flashCopied] = useTimedValue<string | null>(null, 2000);

  // Sin fallback a otro pedido: un id desconocido muestra el estado "pedido no encontrado".
  const order: Order | undefined = orders.find((o) => o.id === id);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySerial = (serial: string) => {
    navigator.clipboard
      ?.writeText(serial)
      .then(() => flashCopied(serial))
      .catch(() => toast.error('No se pudo copiar al portapapeles.'));
  };

  if (!order) {
    return (
      <main id="main" tabIndex={-1} className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-6 w-full text-gray-200">
        <PageMeta title="Pedido confirmado" description="Confirmación de tu pedido en KRM.GG y certificados de autenticidad." noindex />
        <div
          role="alert"
          className="text-center bg-krm-surface rounded-3xl border border-krm-border p-8 max-w-lg mx-auto shadow-2xl"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-krm-accent/30 bg-krm-accent/10 text-krm-accent">
            <SearchX className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black font-display uppercase text-white mb-2">Pedido no encontrado</h1>
          <p className="text-gray-400 text-sm font-body mb-1">
            No existe ningún certificado digital con el identificador{' '}
            <span className="font-mono text-amber-400 break-all">{id ?? '—'}</span> en este navegador.
          </p>
          <p className="text-gray-500 text-xs font-body mb-6">
            Los pedidos se guardan en el almacenamiento local: si cambiaste de navegador o lo borraste, no aparecerán.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/orders" className={buttonClasses({ variant: 'primary' })}>
              Ver Mi Arsenal
            </Link>
            <Link to="/shop" className={buttonClasses({ variant: 'secondary' })}>
              Ir al catálogo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const payment = describePayment(order);

  return (
    <main id="main" tabIndex={-1} className="min-h-screen pt-28 pb-24 max-w-5xl mx-auto px-6 w-full text-gray-200">
      <PageMeta title="Pedido confirmado" description="Confirmación de tu pedido en KRM.GG y certificados de autenticidad." noindex />
      {/* ══════════ TOP HERO NOTIFICATION ══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-display uppercase tracking-widest mb-3 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-4 h-4" />
          ¡TRANSACCIÓN DIGITAL COMPLETADA CON ÉXITO!
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white font-display uppercase tracking-tight">
          Certificado de <span className="text-krm-accent">Autenticidad</span>
        </h1>
        <p className="mt-2 text-gray-400 font-body text-sm max-w-xl mx-auto">
          Tus réplicas oficiales en acero inoxidable 440C han sido grabadas en taller e incorporadas a tu inventario IRL digital.
        </p>

        {/* Quick Actions Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-3 rounded-xl font-black font-display uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:scale-105 cursor-pointer text-sm"
          >
            <Printer className="w-4 h-4" />
            🖨️ Imprimir / Guardar Certificado PDF
          </button>

          <Link
            to="/orders"
            className="px-6 py-3 rounded-xl font-bold font-display uppercase tracking-wider text-white bg-[#141824] hover:bg-[#1e2538] border border-[#27324c] transition-all flex items-center gap-2 text-sm"
          >
            <Package className="w-4 h-4 text-amber-400" />
            Ver Mi Arsenal IRL
          </Link>
        </div>
      </motion.div>

      {/* ══════════ LUXURY CERTIFICATE OF AUTHENTICITY DOCUMENT ══════════ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="rounded-3xl p-8 sm:p-12 border-2 border-amber-500/40 relative shadow-2xl overflow-hidden print:border-black print:text-black print:bg-white"
        style={{
          background: 'linear-gradient(145deg, #0e111a 0%, #080a10 60%, #161208 100%)',
          boxShadow: '0 0 80px rgba(245, 158, 11, 0.15)',
        }}
      >
        {/* Subtle Decorative Gold Borders */}
        <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

        {/* Header Ribbon & Gold Official Stamp */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-amber-500/30 pb-6 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-display tracking-widest text-white">
                KRM<span className="text-amber-400">.GG</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                OFFICIAL SEAL
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display uppercase text-amber-300">
              Certificado Oficial de Autenticidad
            </h2>
            <p className="text-xs text-gray-400 font-body">
              Emisión oficial de forja digital para réplicas coleccionistas 1:1 en acero 440C.
            </p>
          </div>

          {/* Official Gold Seal Graphic */}
          <div className="w-24 h-24 rounded-full border-4 border-amber-400/70 p-1 flex items-center justify-center shrink-0 relative bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <div className="w-full h-full rounded-full border border-dashed border-amber-400/50 flex flex-col items-center justify-center text-center p-1">
              <ShieldCheck className="w-6 h-6 text-amber-400 mb-0.5" />
              <span className="text-[8px] font-black font-display uppercase tracking-widest text-amber-300">
                VERIFICADO
              </span>
              <span className="text-[7px] font-mono text-amber-400">CS2 IRL 1:1</span>
            </div>
          </div>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#121522] border border-[#1d2336] mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-body block">
              ID de Pedido
            </span>
            <span className="text-sm font-black font-mono text-amber-400">{order.id}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-body block">
              Fecha de Emisión
            </span>
            <span className="text-xs font-mono text-gray-200">
              {new Date(order.date).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-body block">
              Coleccionista / Titular
            </span>
            <span className="text-xs font-black font-display uppercase text-white truncate block">
              {order.collectorAlias || 'GhostCS2'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-body block">
              Método de Pago
            </span>
            <span className="text-xs font-display font-bold text-gray-300 truncate block">
              {payment.label}
            </span>
          </div>
        </div>

        {payment.lines.length > 0 && (
          <div className="-mt-4 mb-8 rounded-2xl border border-[#1d2336] bg-[#0e111a] p-4 text-xs print:border-black">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {payment.lines.map((line) => (
                <div key={line.label} className="min-w-0">
                  <dt className="font-body text-[10px] uppercase tracking-wider text-gray-500">{line.label}</dt>
                  <dd className="font-mono text-gray-200 [overflow-wrap:anywhere]">{line.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 font-body text-[11px] text-gray-500">Pago simulado: no se ha realizado ningún cargo real.</p>
          </div>
        )}

        {/* ══════════ LIST OF KNIVES WITH REAL PNG & UNIQUE SERIALS ══════════ */}
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-black font-display uppercase text-white border-b border-krm-border pb-2 flex items-center justify-between">
            <span>Arsenal Grabado & Registrado ({order.items.length})</span>
            <span className="text-xs text-amber-400 font-mono">Acero Inoxidable 440C</span>
          </h3>

          <div className="space-y-4">
            {order.items.map((item) => {
              const knifeImage = getCartItemImage(item);
              const serials = getLineSerials(order.serialNumbers, item.lineId, item.quantity);
              if (serials.length === 0) serials.push('SN-440C-N/D');

              return (
                <div
                  key={item.lineId}
                  className="p-5 rounded-2xl bg-[#111420] border border-[#1e2538] flex flex-col md:flex-row items-center justify-between gap-5 transition-all hover:border-amber-500/40"
                >
                  {/* Left: Knife image & details */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-20 h-20 rounded-2xl bg-[#090b12] border border-[#1b2234] p-1.5 flex items-center justify-center shrink-0 relative overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-20 rounded-2xl pointer-events-none"
                        style={{
                          background: `radial-gradient(circle, #f59e0b 0%, transparent 70%)`,
                        }}
                      />
                      <img loading="lazy" decoding="async" onError={hideBrokenImage}
                        src={knifeImage}
                        alt={item.name}
                        style={{ filter: getCartItemFilter(item) }}
                        className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(245,158,11,0.25)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-white font-display uppercase leading-snug">
                        {item.name}
                      </h4>

                      <LineBadges item={item} className="gap-1.5" />
                    </div>
                  </div>

                  {/* Right: Unique Serial Number Badge */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-krm-border pt-3 md:pt-0">
                    <div className="flex flex-col gap-2">
                      {serials.map((serialNumber) => (
                        <div key={serialNumber} className="text-left md:text-right">
                          <span className="text-[9px] uppercase tracking-wider text-gray-500 font-body block">
                            Número de Serie Forjado
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <code className="text-sm font-mono font-black text-amber-300 bg-[#090b10] px-3 py-1 rounded-lg border border-amber-500/30 tracking-wider">
                              {serialNumber}
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopySerial(serialNumber)}
                              aria-label="Copiar número de serie"
                              className="p-1.5 text-gray-400 hover:text-white bg-[#141824] rounded-lg border border-[#20273a] transition-colors cursor-pointer"
                              title="Copiar Número de Serie"
                            >
                              {copiedSerial === serialNumber ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-right pl-3 sm:border-l border-krm-border">
                      <span className="text-[9px] uppercase text-gray-500 font-body block">
                        Valor
                      </span>
                      <Price value={item.price * item.quantity} size="md" tone="white" />
                      {item.quantity > 1 && (
                        <span className="block font-mono text-[10px] text-gray-500">
                          {item.quantity} × {formatEUR(item.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice Summary & Authenticity Guarantee */}
        <div className="pt-6 border-t border-amber-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="space-y-1.5 text-xs text-gray-400 font-body max-w-md">
            <p className="flex items-center gap-1 text-emerald-400 font-bold font-display uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Garantía de Calidad KRM Oficial
            </p>
            <p className="leading-relaxed">
              Este documento avala la forja artesanal de cada réplica en acero inoxidable 440C con balance de peso real (~115g) y grabado en taller según la normativa europea de coleccionismo.
            </p>
            <p className="text-[11px] font-mono text-gray-500">
              HASH CERT: {order.digitalCertificateId || `CERT-${order.id}`}
            </p>
          </div>

          <div className="text-right w-full sm:w-auto p-4 rounded-2xl bg-[#090b10] border border-[#1e2538]">
            <div className="space-y-1 text-xs font-body">
              <div className="flex justify-between gap-6 text-gray-400">
                <span>Subtotal:</span>
                <Price value={order.subtotal} size="sm" tone="white" />
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between gap-6 text-emerald-400">
                  <span>Descuento ({order.couponApplied || 'Cupón'}):</span>
                  <Price value={order.discount} size="sm" tone="emerald" prefix="-" />
                </div>
              )}
              <div className="flex justify-between gap-6 items-baseline pt-2 border-t border-krm-border">
                <span className="text-sm font-bold uppercase text-white font-display">
                  Total Pagado:
                </span>
                <Price value={order.total} size="xl" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Navigation */}
      <div className="mt-8 flex justify-between items-center text-xs font-body text-gray-500 print:hidden">
        <Link to="/shop" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
          ← Volver a la Tienda
        </Link>
        <Link to="/orders" className="hover:text-white font-bold flex items-center gap-1 transition-colors">
          Explorar Mi Arsenal Completo →
        </Link>
      </div>
    </main>
  );
};

export default OrderSuccessPage;
