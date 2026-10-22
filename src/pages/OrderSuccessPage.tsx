import React from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { useStore, type Order } from '../store/useStore';
import { getLineSerials } from '../lib/ids';
import { toast } from '../lib/toast';
import { buttonClasses } from '../components/ui/buttonStyles';
import { Button } from '../components/ui/Button';
import { useTimedValue } from '../lib/useTimedValue';
import { describePayment, type PaymentSummary } from '../lib/payment';
import { Price } from '../components/ui/Price';
import { formatEUR } from '../lib/format';
import { LineBadges } from '../components/checkout/LineBadges';
import { LineThumb } from '../components/checkout/LineThumb';
import { PageMeta } from '../components/PageMeta';

const LINK_BTN =
  'cursor-pointer font-body text-xs font-medium text-ink underline decoration-1 underline-offset-4 transition-colors hover:text-pink-ink hover:decoration-pink';

/** Sello pequeño del certificado: círculo rosa con marca de verificación (sin dorados ni hologramas). */
const SealMark: React.FC = () => (
  <div
    role="img"
    aria-label="Sello de verificación KRM"
    className="flex h-20 w-20 shrink-0 flex-col items-center justify-center border-2 border-pink text-pink-ink"
  >
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
    <span className="mt-0.5 font-mono text-[8px] font-medium uppercase tracking-[0.04em]">Verificado</span>
  </div>
);

interface CertificateProps {
  order: Order;
  payment: PaymentSummary;
  /** Versión interactiva (pantalla): botones de copiar serial. La del duplicado de impresión no los lleva. */
  copiedSerial?: string | null;
  onCopySerial?: (serial: string) => void;
  /** Carga inmediata de imágenes (el duplicado de impresión está oculto en pantalla). */
  eager?: boolean;
}

/** Certificado como documento: papel, filetes de tinta, seriales en mono. Imprimible (A4 apaisado). */
const CertificateDocument: React.FC<CertificateProps> = ({ order, payment, copiedSerial, onCopySerial, eager = false }) => {
  const issued = new Date(order.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const certId = order.digitalCertificateId || `CERT-${order.id}`;

  return (
    <article className="krm-cert border border-ink bg-paper-2 p-5 text-ink print:bg-white sm:p-10">
      {/* Cabecera del documento */}
      <header className="flex flex-col gap-6 border-b border-ink pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-xl font-semibold leading-none tracking-[-0.05em]">
            KRM<span className="text-pink">—</span>GG
          </p>
          <p className="eyebrow mt-6">Certificado oficial · Réplica 1:1 · Acero 440C</p>
          <h2 className="display-lg mt-3">
            Certificado de <span className="serif-accent text-pink-ink">autenticidad</span>
          </h2>
        </div>
        <SealMark />
      </header>

      {/* Metadatos */}
      <dl className="grid grid-cols-1 border-b border-line sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-line">
        {[
          { label: 'Pedido', value: order.id, mono: true },
          { label: 'Fecha de emisión', value: issued, mono: true },
          { label: 'Coleccionista', value: order.collectorAlias || 'GhostCS2', mono: false },
          { label: 'Método de pago', value: payment.label, mono: false },
        ].map((entry, i) => (
          <div key={entry.label} className={`min-w-0 py-4 lg:px-4 ${i === 0 ? 'lg:pl-0' : ''}`}>
            <dt className="eyebrow">{entry.label}</dt>
            <dd
              className={`mt-1 text-sm text-ink [overflow-wrap:anywhere] ${entry.mono ? 'font-mono' : 'font-body font-medium'}`}
            >
              {entry.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Detalles del pago */}
      {payment.lines.length > 0 && (
        <section aria-label="Detalles del pago" className="border-b border-line py-4">
          <p className="eyebrow mb-3">Detalles del pago</p>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {payment.lines.map((line) => (
              <div key={line.label} className="min-w-0 border-t border-line pt-2">
                <dt className="eyebrow">{line.label}</dt>
                <dd className="mt-0.5 font-mono text-xs text-ink [overflow-wrap:anywhere]">{line.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 font-body text-xs text-ink-3">Pago simulado: no se ha realizado ningún cargo real.</p>
        </section>
      )}

      {/* Piezas registradas */}
      <section aria-label="Piezas registradas" className="pt-6">
        <div className="flex items-baseline justify-between gap-3 border-b border-ink pb-3">
          <p className="eyebrow text-ink">Piezas registradas ({order.items.length})</p>
          <p className="eyebrow">Acero inoxidable 440C</p>
        </div>

        <ul className="divide-y divide-line">
          {order.items.map((item) => {
            const serials = getLineSerials(order.serialNumbers, item.lineId, item.quantity);
            if (serials.length === 0) serials.push('SN-440C-N/D');

            return (
              <li key={item.lineId} className="grid grid-cols-1 gap-4 py-5 md:grid-cols-12 md:items-start md:gap-6">
                <div className="flex min-w-0 items-start gap-4 md:col-span-6">
                  <LineThumb item={item} className="h-20 w-20 p-2" priority={eager} />
                  <div className="min-w-0">
                    <h3 className="font-body text-[15px] font-medium leading-snug tracking-normal [overflow-wrap:anywhere]">
                      {item.name}
                    </h3>
                    <LineBadges item={item} className="mt-1.5" />
                  </div>
                </div>

                <div className="min-w-0 md:col-span-4">
                  <p className="eyebrow mb-1.5">Número de serie{serials.length > 1 ? 's' : ''}</p>
                  <ul className="space-y-1.5">
                    {serials.map((serialNumber) => (
                      <li key={serialNumber} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <code className="break-all font-mono text-sm font-medium tracking-wider">{serialNumber}</code>
                        {onCopySerial && (
                          <button
                            type="button"
                            onClick={() => onCopySerial(serialNumber)}
                            aria-label={`Copiar número de serie ${serialNumber}`}
                            className={`${LINK_BTN} print:hidden`}
                          >
                            {copiedSerial === serialNumber ? 'Copiado' : 'Copiar'}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-2 md:text-right">
                  <p className="eyebrow mb-1.5">Valor</p>
                  <Price value={item.price * item.quantity} size="md" />
                  {item.quantity > 1 && (
                    <span className="block font-mono text-[11px] text-ink-3">
                      {item.quantity} × {formatEUR(item.price)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Garantía y totales */}
      <footer className="grid grid-cols-1 gap-8 border-t border-ink pt-6 md:grid-cols-12 md:gap-10">
        <div className="space-y-3 md:col-span-7">
          <p className="eyebrow text-ink">Garantía de calidad KRM</p>
          <p className="max-w-xl font-body text-xs leading-relaxed text-ink-2">
            Este documento avala la forja artesanal de cada réplica en acero inoxidable 440C con balance de peso real
            (~115 g) y grabado en taller según la normativa europea de coleccionismo. Documento digital emitido por
            KRM.GG a efectos de colección. Transacción simulada.
          </p>
          <p className="font-mono text-[11px] text-ink-3 [overflow-wrap:anywhere]">Hash cert · {certId}</p>
        </div>

        <dl className="space-y-2 font-body text-sm text-ink-2 md:col-span-5">
          <div className="flex justify-between gap-6">
            <dt>Subtotal</dt>
            <dd>
              <Price value={order.subtotal} size="sm" />
            </dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between gap-6">
              <dt>Descuento ({order.couponApplied || 'Cupón'})</dt>
              <dd>
                <Price value={order.discount} size="sm" tone="success" prefix="-" />
              </dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-6 border-t border-ink pt-3 text-ink">
            <dt className="font-body text-base font-medium">Total pagado</dt>
            <dd>
              <Price value={order.total} size="lg" />
            </dd>
          </div>
        </dl>
      </footer>
    </article>
  );
};

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
      <main id="main" tabIndex={-1} className="wrap py-12 outline-none sm:py-20">
        <PageMeta title="Pedido confirmado" description="Confirmación de tu pedido en KRM.GG y certificados de autenticidad." noindex />
        <div role="alert">
          <p className="eyebrow">Pedido</p>
          <h1 className="display-xl mt-5 max-w-3xl">
            Pedido <span className="serif-accent text-pink-ink">no encontrado</span>.
          </h1>
          <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-ink-2">
            No existe ningún certificado digital con el identificador{' '}
            <span className="font-mono text-base text-ink [overflow-wrap:anywhere]">{id ?? '—'}</span> en este navegador.
          </p>
          <p className="mt-3 max-w-xl font-body text-sm text-ink-3">
            Los pedidos se guardan en el almacenamiento local: si cambiaste de navegador o lo borraste, no aparecerán.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/orders" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
              Ver mi arsenal
            </Link>
            <Link to="/shop" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
              Ir al catálogo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const payment = describePayment(order);

  return (
    <main id="main" tabIndex={-1} className="wrap py-12 outline-none sm:py-20">
      <PageMeta title="Pedido confirmado" description="Confirmación de tu pedido en KRM.GG y certificados de autenticidad." noindex />

      {/* ══════════ CONFIRMACIÓN ══════════ */}
      <header className="border-b border-line pb-8 sm:pb-12 print:hidden">
        <p className="eyebrow flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-success" />
          Pago simulado completado
        </p>
        <h1 className="display-xl mt-5">
          Pedido <span className="serif-accent text-pink-ink">confirmado</span>.
        </h1>
        <p className="mt-5 font-mono text-base text-ink [overflow-wrap:anywhere] sm:text-lg">{order.id}</p>
        <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-ink-2 sm:text-lg">
          Tus réplicas en acero inoxidable 440C quedan registradas en tu arsenal, cada una con su número de serie único
          y su certificado de autenticidad digital.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={handlePrint}>
            Imprimir / guardar certificado
          </Button>
          <Link to="/orders" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
            Ver mi arsenal
          </Link>
        </div>
      </header>

      {/* ══════════ CERTIFICADO ══════════ */}
      <section aria-label="Certificado de autenticidad" className="mt-10 sm:mt-14">
        <CertificateDocument order={order} payment={payment} copiedSerial={copiedSerial} onCopySerial={handleCopySerial} />
      </section>

      {/* Navegación inferior */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 print:hidden">
        <Link to="/shop" className="link-underline font-body text-sm">
          ← Volver a la tienda
        </Link>
        <Link to="/orders" className="link-underline font-body text-sm">
          Ver mi arsenal completo →
        </Link>
      </div>

      {/* Duplicado para imprimir: las reglas @media print de index.css solo muestran `.krm-cert-printroot` */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="krm-cert-printroot" aria-hidden="true">
            <CertificateDocument order={order} payment={payment} eager />
          </div>,
          document.body
        )}
    </main>
  );
};

export default OrderSuccessPage;
