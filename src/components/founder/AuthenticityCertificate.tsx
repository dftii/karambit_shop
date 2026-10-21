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
  <div className="min-w-0">
    <dt className="font-tech text-[9px] font-bold uppercase tracking-[0.18em] text-amber-200/60">{label}</dt>
    <dd className={`mt-0.5 break-words font-bold text-white ${mono ? 'font-mono text-sm tracking-wider' : 'font-display text-base'}`}>
      {value}
    </dd>
  </div>
);

const Corner: React.FC<{ className: string }> = ({ className }) => (
  <span aria-hidden="true" className={`absolute h-3 w-3 rotate-45 border border-amber-300/70 bg-[#0b0e18] ${className}`} />
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
  <div
    className="krm-cert relative overflow-hidden rounded-2xl p-5 sm:p-8"
    style={{
      background:
        'radial-gradient(120% 90% at 15% 0%, rgba(251,191,36,0.14), transparent 55%), radial-gradient(90% 80% at 100% 100%, rgba(56,189,248,0.12), transparent 60%), repeating-radial-gradient(circle at 50% 120%, rgba(251,191,36,0.05) 0 2px, transparent 2px 9px), linear-gradient(160deg, #10131f 0%, #0a0c14 100%)',
      border: '1px solid rgba(252,211,77,0.35)',
      boxShadow: '0 30px 80px -20px rgba(0,0,0,0.9), 0 0 60px -10px rgba(245,158,11,0.25)',
    }}
  >
    {/* Marco ornamental doble */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-2.5 rounded-xl border border-amber-300/40" />
    <div aria-hidden="true" className="pointer-events-none absolute inset-4 rounded-lg border border-amber-300/15" />
    <Corner className="left-[7px] top-[7px]" />
    <Corner className="right-[7px] top-[7px]" />
    <Corner className="bottom-[7px] left-[7px]" />
    <Corner className="bottom-[7px] right-[7px]" />

    <div className="relative grid gap-6 px-1 py-2 sm:px-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] md:gap-8">
      {/* Izquierda: pieza + sello holográfico */}
      <div className="flex flex-col items-center justify-between gap-4">
        <div className="relative aspect-square w-full max-w-[260px]">
          <KarambitVFXImage
            image={product.image}
            name={product.name}
            slug={product.slug}
            rarity={product.rarity}
            category={product.category}
            accentColor={product.accentColor}
            gradient={product.gradient}
            showSparkles={false}
            showShimmer={false}
            animateLevitate={false}
            interactiveHover={false}
          />
        </div>
        <div className="flex items-center gap-3">
          <div
            className="krm-holo relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-amber-200/60"
            aria-label="Sello holográfico KRM.GG"
            role="img"
          >
            <span className="relative z-10 text-center font-tech text-[10px] font-black leading-tight tracking-wider text-white drop-shadow">
              KRM
              <br />
              <span className="text-base">1/1</span>
            </span>
          </div>
          <p className="max-w-[9rem] font-body text-[10px] leading-snug text-gray-400">
            Sello de autenticidad digital. Una única unidad registrada a nombre del titular.
          </p>
        </div>
      </div>

      {/* Derecha: datos */}
      <div className="flex min-w-0 flex-col justify-between gap-5">
        <div>
          <p className="font-tech text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300/80">
            KRM.GG · The Founder&apos;s Vault
          </p>
          <h3
            className="mt-1 font-display text-3xl font-black uppercase leading-none tracking-tight text-transparent sm:text-4xl"
            style={{
              backgroundImage: 'linear-gradient(135deg,#fde68a,#f59e0b 55%,#fde68a)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
          >
            Certificado de Autenticidad
          </h3>
          <p className="mt-3 font-display text-lg font-bold leading-snug text-white">{product.name.split(" — ")[0]}</p>
          <p className="mt-1 font-body text-xs text-gray-400">
            {collectionLabels[product.collection ?? 'founder-bespoke']}
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <Field label="Serial de la pieza" value={serial} mono />
          <Field label="Certificado nº" value={certificateId} mono />
          <Field label="Titular (coleccionista)" value={collectorAlias || 'Coleccionista'} />
          <Field label="Fecha de emisión" value={formatDate(date)} />
          <Field label="Edición" value="1 de 1 · Pieza única" />
          {orderId && <Field label="Pedido" value={orderId} mono />}
        </dl>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-amber-300/20 pt-4">
          <SignatureMark animate={false} />
          <p className="max-w-[13rem] font-body text-[10px] leading-snug text-gray-500 sm:text-right">
            Documento digital emitido por KRM.GG a efectos de colección. Transacción simulada.
          </p>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Certificado de autenticidad digital de una pieza (holograma CSS, imprimible).
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
