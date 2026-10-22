import React from 'react';
import { createPortal } from 'react-dom';
import { Printer } from 'lucide-react';
import { collectionLabels, type Product } from '../../data/karambits';
import { Button } from '../ui';
import { KarambitVFXImage } from '../KarambitVFXImage';
import { SignatureMark } from './SignatureMark';

export interface AuthenticityCertificateProps {
  /** Pieza certificada (cualquier producto; pensado para las 1-of-1 del Vault). */
  product: Product;
  /** Serial de la unidad (Order.serialNumbers). */
  serial: string;
  /** Id del certificado digital (Order.digitalCertificateId). */
  certificateId: string;
  /** Fecha de emisión (ISO, normalmente Order.date). */
  date: string;
  /** Alias del coleccionista (Order.collectorAlias). */
  collectorAlias: string;
  /** Id del pedido (opcional, se muestra si existe). */
  orderId?: string;
  /** Muestra el botón de imprimir (por defecto sí). */
  showActions?: boolean;
  className?: string;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || d.getTime() === 0) return '—';
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
};

const Field: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="min-w-0 border-b border-line py-2.5">
    <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3">{label}</dt>
    <dd className={`mt-1 break-words text-ink ${mono ? 'font-mono text-sm' : 'font-body text-[15px]'}`}>{value}</dd>
  </div>
);

/** Hoja del certificado (se renderiza una vez en pantalla y otra en el contenedor de impresión). */
const CertificateSheet: React.FC<Omit<AuthenticityCertificateProps, 'showActions' | 'className'>> = ({
  product,
  serial,
  certificateId,
  date,
  collectorAlias,
  orderId,
}) => (
  <div className="krm-cert relative border border-ink bg-paper-2 p-2 text-ink">
    <div className="border border-line p-5 sm:p-8">
      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 border-b border-ink pb-4">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-2">
          KRM—GG · The Founder&apos;s Vault
        </p>
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-2">
          Certificado nº {certificateId}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.3fr)] md:gap-10">
        {/* Izquierda: pieza + sello */}
        <div className="flex min-w-0 flex-col gap-5">
          <div className="aspect-square w-full max-w-[280px] border border-line bg-tile p-4">
            <KarambitVFXImage
              plain
              image={product.image}
              name={product.name}
              slug={product.slug}
              gradient={product.gradient}
              interactiveHover={false}
            />
          </div>
          <div className="flex items-center gap-4">
            <div
              role="img"
              aria-label="Sello de autenticidad KRM 1 de 1"
              className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-full border border-pink-ink font-mono text-pink-ink"
            >
              <span className="text-[10px] font-medium tracking-[0.08em]">KRM</span>
              <span className="text-base font-medium leading-none">1/1</span>
            </div>
            <p className="max-w-[11rem] font-body text-[11px] leading-snug text-ink-2">
              Sello de autenticidad digital. Una única unidad registrada a nombre del titular.
            </p>
          </div>
        </div>

        {/* Derecha: datos */}
        <div className="flex min-w-0 flex-col justify-between gap-6">
          <div>
            <h3 className="display-md !text-[clamp(1.6rem,3.4vw,2.4rem)]">
              Certificado de <span className="serif-accent text-pink-ink">autenticidad</span>
            </h3>
            <p className="mt-4 font-display text-lg font-semibold leading-snug">{product.name.split(' — ')[0]}</p>
            <p className="mt-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
              {collectionLabels[product.collection ?? 'founder-bespoke']}
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-x-6 border-t border-ink sm:grid-cols-2">
            <Field label="Serial de la pieza" value={serial} mono />
            <Field label="Certificado nº" value={certificateId} mono />
            <Field label="Titular (coleccionista)" value={collectorAlias || 'Coleccionista'} />
            <Field label="Fecha de emisión" value={formatDate(date)} />
            <Field label="Edición" value="1 de 1 · Pieza única" />
            {orderId && <Field label="Pedido" value={orderId} mono />}
          </dl>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <SignatureMark size="sm" />
            <p className="max-w-[14rem] font-body text-[10px] leading-snug text-ink-3 sm:text-right">
              Documento digital emitido por KRM—GG a efectos de colección. Transacción simulada.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Certificado de autenticidad digital de una pieza (documento plano, imprimible).
 *
 *   <AuthenticityCertificate
 *     product={product} serial={serial} certificateId={order.digitalCertificateId}
 *     date={order.date} collectorAlias={order.collectorAlias} orderId={order.id} />
 *
 * Imprimir: el botón usa window.print(); se monta un duplicado en `body > .krm-cert-printroot`
 * (oculto en pantalla) y las reglas @media print de index.css ocultan el resto de la página.
 */
export const AuthenticityCertificate: React.FC<AuthenticityCertificateProps> = ({
  showActions = true,
  className = '',
  ...sheet
}) => (
  <div className={className}>
    <CertificateSheet {...sheet} />
    {showActions && (
      <div className="mt-4 flex justify-center print:hidden">
        <Button variant="secondary" size="md" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
          Imprimir certificado
        </Button>
      </div>
    )}
    {typeof document !== 'undefined' &&
      createPortal(
        <div className="krm-cert-printroot" aria-hidden="true">
          <CertificateSheet {...sheet} />
        </div>,
        document.body
      )}
  </div>
);

export default AuthenticityCertificate;
