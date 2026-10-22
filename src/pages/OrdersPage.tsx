import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useStore, type CartItem } from '../store/useStore';
import { rarityColors, type Product } from '../data/karambits';
import { findCartItemProduct, getCartItemImage } from '../lib/cart';
import { getLineSerials } from '../lib/ids';
import { toast } from '../lib/toast';
import { useTimedValue } from '../lib/useTimedValue';
import { describePayment } from '../lib/payment';
import { formatEUR } from '../lib/format';
import { Price } from '../components/ui/Price';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { buttonClasses } from '../components/ui/buttonStyles';
import { KarambitVFXImage } from '../components/KarambitVFXImage';
import { LineBadges } from '../components/checkout/LineBadges';
import { LineThumb } from '../components/checkout/LineThumb';
import { PageMeta } from '../components/PageMeta';

interface ArsenalKnifeItem {
  knife: CartItem;
  orderId: string;
  orderDate: string;
  serialNumber: string;
  baseProduct?: Product;
}

type Tab = 'arsenal' | 'history';

const LINK_BTN =
  'cursor-pointer font-body text-xs font-medium text-ink underline decoration-1 underline-offset-4 transition-colors hover:text-pink-ink hover:decoration-pink';

const pad2 = (n: number) => String(n).padStart(2, '0');

export const OrdersPage: React.FC = () => {
  const orders = useStore((s) => s.orders);
  const [activeTab, setActiveTab] = useState<Tab>('arsenal');
  const [copiedId, flashCopied] = useTimedValue<string | null>(null, 2000);
  // `inspected` se conserva al cerrar para que el contenido no desaparezca durante la animación de salida.
  const [inspected, setInspected] = useState<ArsenalKnifeItem | null>(null);
  const [inspectOpen, setInspectOpen] = useState(false);

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

  // Todas las líneas de todos los pedidos para la vista de arsenal (una entrada por unidad)
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

  const openInspector = (item: ArsenalKnifeItem) => {
    setInspected(item);
    setInspectOpen(true);
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'arsenal', label: 'Mi arsenal', count: arsenalItems.length },
    { id: 'history', label: 'Historial de pedidos', count: orders.length },
  ];

  return (
    <main id="main" tabIndex={-1} className="wrap py-12 outline-none sm:py-20">
      <PageMeta title="Mis Pedidos" description="Historial de pedidos, facturas y arsenal desbloqueado en KRM.GG." noindex />

      {/* ══════════ CABECERA ══════════ */}
      <header className="pb-8 sm:pb-12">
        <p className="eyebrow">Cuenta de coleccionista</p>
        <h1 className="display-xl mt-5">
          Mis <span className="serif-accent text-pink-ink">pedidos</span>.
        </h1>
        <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-ink-2 sm:text-lg">
          Tu colección de réplicas 1:1, números de serie de taller y certificados oficiales.
        </p>
      </header>

      {/* ══════════ PESTAÑAS ══════════ */}
      <div role="tablist" aria-label="Secciones" className="flex gap-6 overflow-x-auto border-b border-line sm:gap-8">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`orders-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`orders-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 cursor-pointer items-baseline gap-2 border-b-2 pb-3 font-body text-sm font-medium transition-colors ${
                active ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink'
              }`}
            >
              {tab.label}
              <span className="font-mono text-[11px] tabular-nums text-ink-3">{pad2(tab.count)}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════ SIN PEDIDOS ══════════ */}
      {orders.length === 0 ? (
        <div className="border-b border-line py-16 sm:py-24">
          <p className="eyebrow">00 — Sin piezas</p>
          <h2 className="display-lg mt-4 max-w-2xl">
            Tu arsenal está <span className="serif-accent text-pink-ink">vacío</span>.
          </h2>
          <p className="mt-5 max-w-md font-body text-base leading-relaxed text-ink-2">
            Visita el catálogo y elige tu karambit para desbloquear réplicas reales 1:1.
          </p>
          <Link to="/shop" className={`${buttonClasses({ variant: 'primary', size: 'lg' })} mt-8`}>
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <>
          {/* ══════════ ARSENAL ══════════ */}
          {activeTab === 'arsenal' && (
            <div id="orders-panel-arsenal" role="tabpanel" aria-labelledby="orders-tab-arsenal">
              <div className="flex flex-wrap items-baseline justify-between gap-2 py-5">
                <p className="font-body text-sm text-ink-2">
                  <span className="font-mono text-ink">{pad2(arsenalItems.length)}</span> piezas forjadas en acero
                  inoxidable 440C
                </p>
                <p className="eyebrow">Balance de peso real ~115 g</p>
              </div>

              <ul className="grid grid-cols-1 border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
                {arsenalItems.map((item) => (
                  <li key={`${item.orderId}-${item.serialNumber}`} className="group flex flex-col border-b border-r border-line">
                    <div className="relative aspect-square overflow-hidden bg-tile">
                      <div className="h-full w-full p-7 sm:p-9">
                        <KarambitVFXImage
                          plain
                          image={getCartItemImage(item.knife)}
                          name={item.knife.name}
                          gradient={item.knife.gradient}
                        />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex items-baseline justify-between gap-2">
                        {item.baseProduct ? (
                          <Badge color={rarityColors[item.baseProduct.rarity]}>{item.baseProduct.rarity}</Badge>
                        ) : (
                          <span className="eyebrow">Pieza</span>
                        )}
                        <span className="truncate font-mono text-[11px] text-ink-3">{item.orderId}</span>
                      </div>

                      <h3 className="line-clamp-2 font-body text-[15px] font-medium leading-snug tracking-normal text-ink">
                        {item.knife.name}
                      </h3>

                      <LineBadges item={item.knife} />

                      <p className="break-all font-mono text-xs font-medium tracking-wider text-ink">{item.serialNumber}</p>

                      <div className="mt-auto pt-1">
                        <button type="button" onClick={() => openInspector(item)} className={LINK_BTN}>
                          Inspeccionar en grande
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ══════════ HISTORIAL ══════════ */}
          {activeTab === 'history' && (
            <div id="orders-panel-history" role="tabpanel" aria-labelledby="orders-tab-history">
              {/* Cabecera de tabla (solo escritorio) */}
              <div className="hidden grid-cols-12 gap-6 border-b border-ink py-3 md:grid">
                <span className="eyebrow col-span-3">Pedido</span>
                <span className="eyebrow col-span-3">Pago</span>
                <span className="eyebrow col-span-3">Certificado</span>
                <span className="eyebrow col-span-3 text-right">Total</span>
              </div>

              <div className="divide-y divide-line border-b border-line">
                {orders.map((order) => {
                  const payInfo = describePayment(order);
                  const certId = order.digitalCertificateId || `CERT-${order.id}`;

                  return (
                    <article key={order.id} className="py-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
                        <div className="min-w-0 md:col-span-3">
                          <p className="eyebrow mb-1.5 md:hidden">Pedido</p>
                          <p className="font-mono text-sm font-medium text-ink [overflow-wrap:anywhere]">{order.id}</p>
                          <div className="mt-2">
                            <Badge tone="success">{order.status || 'Verificado & Grabado'}</Badge>
                          </div>
                          <p className="mt-2 font-body text-xs text-ink-3">
                            {new Date(order.date).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            · {order.collectorAlias || 'GhostCS2'}
                          </p>
                        </div>

                        <div className="min-w-0 md:col-span-3">
                          <p className="eyebrow mb-1.5 md:hidden">Pago</p>
                          <p className="font-body text-sm font-medium text-ink">{payInfo.label}</p>
                          {payInfo.lines.length > 0 && (
                            <dl className="mt-1.5 space-y-1">
                              {payInfo.lines.map((line) => (
                                <div key={line.label} className="min-w-0">
                                  <dt className="eyebrow inline">{line.label}: </dt>
                                  <dd className="inline font-mono text-xs text-ink-2 [overflow-wrap:anywhere]">
                                    {line.value}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          )}
                        </div>

                        <div className="min-w-0 md:col-span-3">
                          <p className="eyebrow mb-1.5 md:hidden">Certificado</p>
                          <p className="font-mono text-xs text-ink [overflow-wrap:anywhere]">{certId}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <button type="button" onClick={() => handleCopy(certId)} className={LINK_BTN}>
                              {copiedId === certId ? 'Copiado' : 'Copiar'}
                            </button>
                            <Link to={`/order-success/${order.id}`} className={LINK_BTN}>
                              Ver certificado oficial
                            </Link>
                          </div>
                        </div>

                        <div className="flex items-baseline justify-between gap-3 md:col-span-3 md:block md:text-right">
                          <p className="eyebrow md:hidden">Total</p>
                          <div>
                            <Price value={order.total} size="lg" />
                            {order.couponApplied && (
                              <p className="mt-1 font-mono text-[11px] text-ink-3">
                                {order.couponApplied} (-{formatEUR(order.discount)})
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Piezas del pedido */}
                      <ul className="mt-5 divide-y divide-line border-t border-line">
                        {order.items.map((item) => (
                          <li key={item.lineId} className="flex items-center justify-between gap-4 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <LineThumb item={item} className="h-12 w-12 p-1" />
                              <div className="min-w-0">
                                <h4 className="font-body text-sm font-medium leading-snug tracking-normal text-ink [overflow-wrap:anywhere]">
                                  {item.name}
                                </h4>
                                <p className="break-all font-mono text-[11px] text-ink-2">
                                  {serialsFor(order, item).join(' · ')}
                                </p>
                                <LineBadges item={item} />
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <Price value={item.price * item.quantity} size="sm" />
                              {item.quantity > 1 && (
                                <span className="block font-mono text-[11px] text-ink-3">
                                  {item.quantity} × {formatEUR(item.price)}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════ INSPECTOR ══════════ */}
      <Modal
        open={inspectOpen}
        onClose={() => setInspectOpen(false)}
        ariaLabel="Inspección de pieza"
        size="md"
        zIndex={150}
        panelClassName="p-6 sm:p-8"
      >
        {inspected && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow">Número de serie</p>
                <p className="mt-1 break-all font-mono text-sm font-medium tracking-wider text-ink">
                  {inspected.serialNumber}
                </p>
                <p className="mt-1 font-mono text-[11px] text-ink-3">Pedido {inspected.orderId}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectOpen(false)}
                aria-label="Cerrar detalle"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border border-line text-ink transition-colors hover:border-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 aspect-[4/3] w-full bg-tile p-6 sm:p-10">
              <KarambitVFXImage
                plain
                interactiveHover={false}
                image={getCartItemImage(inspected.knife)}
                name={inspected.knife.name}
                gradient={inspected.knife.gradient}
              />
            </div>

            <h2 className="display-md mt-6">{inspected.knife.name}</h2>
            <p className="mt-2 font-body text-sm text-ink-2">
              Acero inoxidable 440C · Réplica oficial 1:1 CS2 · Balance artesanal 115 g
            </p>

            <dl className="mt-5 divide-y divide-line border-y border-line">
              {inspected.knife.condition && (
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="eyebrow">Condición</dt>
                  <dd className="font-mono text-xs text-ink">{inspected.knife.condition}</dd>
                </div>
              )}
              {inspected.knife.bladeType && (
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="eyebrow">Filo</dt>
                  <dd className="text-right font-mono text-xs text-ink">{inspected.knife.bladeType}</dd>
                </div>
              )}
              {inspected.knife.statTrak && (
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="eyebrow">StatTrak™</dt>
                  <dd className="font-mono text-xs text-ink">
                    #{String(inspected.knife.statTrakCount ?? '000').padStart(3, '0')}
                  </dd>
                </div>
              )}
              {inspected.knife.nameTag && (
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="eyebrow">Placa NameTag</dt>
                  <dd className="font-mono text-xs text-ink">&quot;{inspected.knife.nameTag}&quot;</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => handleCopy(inspected.serialNumber)}>
                {copiedId === inspected.serialNumber ? 'Copiado' : 'Copiar serial'}
              </Button>
              <Link to={`/order-success/${inspected.orderId}`} className={buttonClasses({ variant: 'primary' })}>
                Ver certificado oficial
              </Link>
            </div>
          </>
        )}
      </Modal>
    </main>
  );
};

export default OrdersPage;
