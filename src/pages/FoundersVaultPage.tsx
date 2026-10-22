import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Product } from '../data/karambits';
import { useStore } from '../store/useStore';
import { Modal, Price } from '../components/ui';
import { KarambitVFXImage } from '../components/KarambitVFXImage';
import { AuthenticityCertificate } from '../components/founder/AuthenticityCertificate';
import { PieceShowcase } from '../components/founder/PieceShowcase';
import { SignatureMark } from '../components/founder/SignatureMark';
import { getPieceMeta, getVaultPieces } from '../components/founder/pieceMeta';
import { usePieceOwnership } from '../components/founder/useOwnership';
import { PageMeta } from '../components/PageMeta';

const BTN =
  'inline-flex items-center justify-center gap-2 border px-7 py-3.5 font-body text-[15px] font-medium transition-colors duration-200';
const BTN_PRIMARY = `${BTN} border-paper bg-paper text-ink hover:border-pink hover:bg-pink`;
const LINK =
  'font-body text-[15px] text-paper underline decoration-paper/40 decoration-1 underline-offset-4 transition-colors hover:text-pink hover:decoration-pink';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

// Importe sin decimales, con separador de miles también en 4 cifras.
const EUR0 = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0, useGrouping: 'always' });

/** Contenido del modal del certificado (necesita el pedido de la pieza). */
const CertificateBody: React.FC<{ product: Product }> = ({ product }) => {
  const { order, serial, certificateId } = usePieceOwnership(product);
  if (!order || !serial || !certificateId) {
    return (
      <p className="border border-line bg-paper-2 p-6 text-center font-body text-sm text-ink-2">
        Aún no hay un certificado asociado a esta pieza.
      </p>
    );
  }
  return (
    <AuthenticityCertificate
      product={product}
      serial={serial}
      certificateId={certificateId}
      date={order.date}
      collectorAlias={order.collectorAlias}
      orderId={order.id}
    />
  );
};

const STEPS = [
  { title: 'Elige tu pieza', text: 'Cuatro obras 1 de 1. Cuando una se adquiere, deja de estar disponible para siempre.' },
  { title: 'Confirma el pedido', text: 'Pago simulado: ningún cargo real. Se graba tu serial único en la pieza.' },
  { title: 'Recibe tu certificado', text: 'Certificado de autenticidad digital con tu alias, serial y sello, listo para imprimir.' },
];

const FoundersVaultPage: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const pieces = useMemo(() => getVaultPieces(), []);
  const orders = useStore((s) => s.orders);

  const [certProduct, setCertProduct] = useState<Product | null>(null);
  const [certOpen, setCertOpen] = useState(false);

  const isOwned = (p: Product) => orders.some((o) => o.items.some((i) => i.productId === p.id));
  const ownedCount = pieces.filter(isOwned).length;
  const totalValue = pieces.reduce((sum, p) => sum + p.basePrice, 0);

  const openCertificate = (product: Product) => {
    setCertProduct(product);
    setCertOpen(true);
  };

  const goTo = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  // Revelado tipográfico breve: opacidad + 12px, escalonado (MotionConfig respeta reduced-motion).
  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' as const, delay },
  });

  return (
    <main id="main" tabIndex={-1} className="w-full bg-ink text-paper outline-none">
      <PageMeta
        title="Founder's Vault"
        description="Colección Founder Bespoke — DuFiTuFi Design (CEO): piezas 1-of-1 exclusivas con certificado de autenticidad."
      />

      {/* ═══ HERO ═══ */}
      <section className="wrap pb-14 pt-14 sm:pb-20 sm:pt-20" aria-labelledby="vault-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-7">
            <motion.p {...reveal(0)} className="eyebrow !text-paper/60">
              Colección Founder Bespoke
            </motion.p>
            <motion.h1 {...reveal(0.08)} id="vault-title" className="display-hero mt-5">
              The Founder&apos;s <span className="serif-accent text-pink">Vault</span>
            </motion.h1>
            <motion.p
              {...reveal(0.16)}
              className="mt-6 font-mono text-xs font-medium uppercase tracking-[0.08em] text-paper/70"
            >
              DuFiTuFi Design (CEO)
            </motion.p>
            <motion.p {...reveal(0.22)} className="mt-6 max-w-lg font-body text-base leading-relaxed text-paper/75 sm:text-lg">
              Cuatro karambits forjados en metales nobles e incrustaciones gemológicas, diseñados y firmados por el
              fundador. Cada pieza existe una sola vez y viene con su certificado de autenticidad digital.
            </motion.p>
            <motion.div {...reveal(0.28)} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a href="#piezas" onClick={goTo('piezas')} className={BTN_PRIMARY}>
                Explorar las piezas
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link to="/shop" className={LINK}>
                Volver a la tienda
              </Link>
            </motion.div>
          </div>

          {/* Índice de piezas */}
          <motion.nav {...reveal(0.3)} aria-label="Índice de piezas" className="min-w-0 lg:col-span-5 lg:pt-3">
            <p className="eyebrow !text-paper/50">Índice</p>
            <ul className="mt-4 border-t border-paper/20">
              {pieces.map((piece, i) => {
                const meta = getPieceMeta(piece);
                return (
                  <li key={piece.id} className="border-b border-paper/20">
                    <a
                      href={`#pieza-${piece.slug}`}
                      onClick={goTo(`pieza-${piece.slug}`)}
                      className="group flex items-center gap-4 py-3 outline-offset-0"
                    >
                      <span className="w-6 shrink-0 font-mono text-[11px] tabular-nums text-paper/50">
                        {ROMAN[i + 1] ?? i + 1}
                      </span>
                      <span className="h-12 w-12 shrink-0 border border-paper/20 bg-[#1a1918] p-1">
                        <KarambitVFXImage
                          image={piece.image}
                          name={piece.name}
                          interactiveHover={false}
                          priority
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-body text-[15px] text-paper underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-pink">
                        {meta.shortName}
                      </span>
                      {isOwned(piece) ? (
                        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper">
                          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-pink" />
                          Tuya
                        </span>
                      ) : (
                        <span className="shrink-0 font-mono text-sm tabular-nums text-paper">
                          {EUR0.format(piece.basePrice)} €
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        </div>

        {/* Franja de cifras */}
        <motion.dl
          {...reveal(0.36)}
          className="mt-14 grid grid-cols-1 border-y border-paper/20 sm:mt-20 sm:grid-cols-3"
        >
          {[
            { label: 'Piezas 1 de 1', value: <span className="font-mono">{String(pieces.length).padStart(2, '0')}</span> },
            { label: 'Valor total', value: <Price value={totalValue} size="xl" className="!text-paper" /> },
            {
              label: 'Tu colección',
              value: (
                <span className="font-mono tabular-nums">
                  {ownedCount}
                  <span className="text-paper/40"> / {pieces.length}</span>
                </span>
              ),
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`min-w-0 py-6 sm:py-8 ${i > 0 ? 'border-t border-paper/20 sm:border-l sm:border-t-0 sm:pl-8' : ''}`}
            >
              <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/50">{stat.label}</dt>
              <dd className="mt-2 break-words text-3xl font-medium tracking-tight sm:text-4xl">{stat.value}</dd>
            </div>
          ))}
        </motion.dl>
      </section>

      {/* ═══ 01 — PIEZAS ═══ */}
      <section id="piezas" className="wrap scroll-mt-16 pb-6" aria-labelledby="piezas-title">
        <div className="pb-10 sm:pb-14">
          <p className="eyebrow !text-paper/60">01 — Las piezas</p>
          <h2 id="piezas-title" className="display-lg mt-4">
            Cuatro obras. <span className="serif-accent text-pink">Una sola vez.</span>
          </h2>
        </div>
        {pieces.map((piece, i) => (
          <PieceShowcase key={piece.id} product={piece} index={i} total={pieces.length} onOpenCertificate={openCertificate} />
        ))}
      </section>

      {/* ═══ 02 — CERTIFICACIÓN ═══ */}
      <section className="wrap pb-6 pt-14 sm:pt-20" aria-labelledby="cert-title">
        <div className="border-t border-paper/20 pt-10 sm:pt-14">
          <p className="eyebrow !text-paper/60">02 — Certificación</p>
          <h2 id="cert-title" className="display-lg mt-4">
            Cada pieza, <span className="serif-accent text-pink">documentada</span>
          </h2>
        </div>
        <ol className="mt-10 grid grid-cols-1 border-y border-paper/20 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className={`py-8 md:py-10 ${i > 0 ? 'border-t border-paper/20 md:border-l md:border-t-0 md:pl-8' : ''} ${i < 2 ? 'md:pr-8' : ''}`}
            >
              <span className="font-mono text-sm font-medium tabular-nums text-pink">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="display-md mt-5">{step.title}</h3>
              <p className="mt-3 max-w-xs font-body text-[15px] leading-relaxed text-paper/75">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ═══ CIERRE ═══ */}
      <section className="wrap py-20 sm:py-28" aria-labelledby="cierre-title">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 id="cierre-title" className="display-xl">
              Cuando una se va, <span className="serif-accent text-pink">no vuelve.</span>
            </h2>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link to="/shop" className={BTN_PRIMARY}>
                Ver el resto del catálogo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#piezas" onClick={goTo('piezas')} className={LINK}>
                Volver a las piezas
              </a>
            </div>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <SignatureMark tone="paper" />
          </div>
        </div>
      </section>

      {/* ═══ MODAL DEL CERTIFICADO ═══ */}
      <Modal open={certOpen} onClose={() => setCertOpen(false)} ariaLabel="Certificado de autenticidad" size="lg" panelClassName="!border-0 !bg-transparent">
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setCertOpen(false)}
            aria-label="Cerrar certificado"
            className="border border-paper bg-ink px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper transition-colors hover:border-pink hover:bg-pink hover:text-ink"
          >
            Cerrar
          </button>
        </div>
        {certProduct && <CertificateBody product={certProduct} />}
      </Modal>
    </main>
  );
};

export default FoundersVaultPage;
