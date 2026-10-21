import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BadgeCheck, ChevronDown, FileBadge2, Gem, ShieldCheck, Sparkles, X } from 'lucide-react';
import type { Product } from '../data/karambits';
import { useStore } from '../store/useStore';
import { formatEUR } from '../lib/format';
import { Badge, Modal, Price, buttonClasses } from '../components/ui';
import { KarambitVFXImage } from '../components/KarambitVFXImage';
import { AuthenticityCertificate } from '../components/founder/AuthenticityCertificate';
import { PieceShowcase } from '../components/founder/PieceShowcase';
import { SignatureMark } from '../components/founder/SignatureMark';
import { TiltStage } from '../components/founder/TiltStage';
import { VaultDoorIntro } from '../components/founder/VaultDoorIntro';
import { getPieceMeta, getVaultPieces } from '../components/founder/pieceMeta';
import { usePieceOwnership } from '../components/founder/useOwnership';
import { PageMeta } from '../components/PageMeta';

const INTRO_KEY = 'krm-vault-intro-seen';

/** La puerta se muestra una vez por sesión y nunca con prefers-reduced-motion. */
function shouldShowIntro(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return window.sessionStorage.getItem(INTRO_KEY) !== '1';
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    window.sessionStorage.setItem(INTRO_KEY, '1');
  } catch {
    /* sin almacenamiento: la puerta puede repetirse, no pasa nada */
  }
}

// Motas de polvo dorado (posiciones deterministas; solo transform/opacity).
const MOTES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37 + 8) % 96}%`,
  bottom: `${(i * 23) % 40}%`,
  delay: `${(i * 0.9) % 7}s`,
  dx: `${((i % 5) - 2) * 14}px`,
  size: 2 + (i % 3),
}));

/** Contenido del modal del certificado (necesita el pedido de la pieza). */
const CertificateBody: React.FC<{ product: Product }> = ({ product }) => {
  const { order, serial, certificateId } = usePieceOwnership(product);
  if (!order || !serial || !certificateId) {
    return (
      <p className="rounded-2xl border border-krm-border bg-krm-panel p-6 text-center font-body text-sm text-gray-400">
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
  { icon: <Gem className="h-5 w-5" />, title: 'Elige tu pieza', text: 'Cuatro obras 1-of-1. Cuando una se adquiere, deja de estar disponible para siempre.' },
  { icon: <ShieldCheck className="h-5 w-5" />, title: 'Confirma el pedido', text: 'Pago simulado: ningún cargo real. Se graba tu serial único en la pieza.' },
  { icon: <FileBadge2 className="h-5 w-5" />, title: 'Recibe tu certificado', text: 'Certificado de autenticidad digital con tu alias, serial y sello holográfico, listo para imprimir.' },
];

const FoundersVaultPage: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const pieces = useMemo(() => getVaultPieces(), []);
  const flagship = pieces[0];
  const orders = useStore((s) => s.orders);

  const [intro, setIntro] = useState(shouldShowIntro);
  const [certProduct, setCertProduct] = useState<Product | null>(null);
  const [certOpen, setCertOpen] = useState(false);

  const finishIntro = useCallback(() => {
    markIntroSeen();
    setIntro(false);
  }, []);

  // Bloquea el scroll mientras la puerta está cerrada.
  React.useEffect(() => {
    if (!intro) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [intro]);

  const ownedCount = pieces.filter((p) => orders.some((o) => o.items.some((i) => i.productId === p.id))).length;
  const totalValue = pieces.reduce((sum, p) => sum + p.basePrice, 0);
  const flagshipMeta = getPieceMeta(flagship);

  const openCertificate = (product: Product) => {
    setCertProduct(product);
    setCertOpen(true);
  };

  const scrollToPieces = () => {
    document.getElementById('piezas')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <main id="main" tabIndex={-1} className="relative min-h-screen w-full overflow-x-clip bg-[#06070b]">
      <PageMeta title="Founder's Vault" description="Colección Founder Bespoke — DuFiTuFi Design (CEO): piezas 1-of-1 exclusivas con certificado de autenticidad." />
      <AnimatePresence>{intro && <VaultDoorIntro key="vault-door" onDone={finishIntro} />}</AnimatePresence>

      {/* ═══ HERO ═══ */}
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(80% 60% at 50% 0%, rgba(245,158,11,0.16), transparent 70%), radial-gradient(50% 50% at 85% 55%, rgba(244,114,182,0.10), transparent 70%), radial-gradient(50% 50% at 10% 70%, rgba(56,189,248,0.08), transparent 70%), #06070b',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.045]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(70% 70% at 50% 40%, #000 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(70% 70% at 50% 40%, #000 30%, transparent 100%)',
          }}
        />
        {/* Barrido de luz dorada */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="animate-vault-sweep absolute inset-y-0 left-0 w-1/3"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(253,224,71,0.07) 30%, rgba(255,255,255,0.16) 50%, rgba(253,224,71,0.07) 70%, transparent)',
            }}
          />
        </div>
        {/* Motas de polvo */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {MOTES.map((m, i) => (
            <span
              key={i}
              className="animate-vault-mote absolute rounded-full bg-amber-200"
              style={{
                left: m.left,
                bottom: m.bottom,
                width: m.size,
                height: m.size,
                animationDelay: m.delay,
                '--mote-dx': m.dx,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="mx-auto grid min-h-[min(88vh,820px)] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="min-w-0">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: intro ? 2.4 : 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/10 px-4 py-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span className="font-tech text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200 sm:text-xs">
                1-of-1 · Alta joyería
              </span>
            </motion.div>

            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: intro ? 2.5 : 0.2 }}
              className="mt-5 font-display text-5xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-7xl"
            >
              The Founder&apos;s
              <br />
              <span className="text-vault-gold">Vault</span>
            </motion.h1>

            <motion.p
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: intro ? 2.7 : 0.4 }}
              className="mt-4 font-display text-xl font-bold uppercase tracking-[0.12em] text-gray-300 sm:text-2xl"
            >
              DuFiTuFi Design <span className="text-amber-300">(CEO)</span>
            </motion.p>

            <motion.p
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: intro ? 2.8 : 0.5 }}
              className="mt-4 max-w-xl font-body text-base leading-relaxed text-gray-400"
            >
              Cuatro karambits forjados en metales nobles e incrustaciones gemológicas, diseñados y firmados por el
              fundador. Cada pieza existe una sola vez y viene con su certificado de autenticidad digital.
            </motion.p>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {[
                { value: String(pieces.length), label: 'Piezas 1-of-1' },
                { value: formatEUR(totalValue).replace(',00', ''), label: 'Valor del Vault' },
                { value: `${ownedCount}/${pieces.length}`, label: 'Tu colección' },
              ].map((stat) => (
                <div key={stat.label} className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                  <p className="truncate font-display text-xl font-black text-white sm:text-2xl">{stat.value}</p>
                  <p className="font-tech text-[8px] font-bold uppercase tracking-[0.16em] text-gray-500 sm:text-[9px]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={scrollToPieces} className={buttonClasses({ variant: 'primary', size: 'lg' })}>
                Explorar las piezas
                <ChevronDown className="h-5 w-5" />
              </button>
              <Link to="/shop" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
                Volver a la tienda
              </Link>
            </div>
            <SignatureMark className="mt-8" />
          </div>

          {/* Pieza insignia */}
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: intro ? 2.6 : 0.3 }}
            className="relative mx-auto w-full max-w-[520px]"
          >
            <div
              aria-hidden="true"
              className="animate-vault-glow pointer-events-none absolute inset-6 rounded-full"
              style={{ background: `radial-gradient(closest-side, ${flagshipMeta.tint}40, ${flagshipMeta.tint2}18 55%, transparent 75%)` }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full border border-amber-300/20"
              style={{ boxShadow: 'inset 0 0 60px rgba(245,158,11,0.08)' }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-8 rounded-full border border-dashed border-amber-300/15"
            />
            <TiltStage className="relative aspect-square w-full p-3" maxTilt={12}>
              <KarambitVFXImage
                image={flagship.image}
                name={flagship.name}
                slug={flagship.slug}
                accentColor={flagship.accentColor}
                gradient={flagship.gradient}
                collection={flagship.collection}
                isOneOfOne={flagship.isOneOfOne}
                interactiveHover={false}
                showGlow={false}
                priority
              />
            </TiltStage>
            <p className="absolute inset-x-0 bottom-0 text-center font-tech text-[10px] font-bold uppercase tracking-[0.3em] text-amber-200/80">
              {flagshipMeta.shortName}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ ÍNDICE DE PIEZAS ═══ */}
      <section aria-label="Índice de piezas" className="border-y border-white/5 bg-[#080a10]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 py-4 sm:px-6 lg:grid-cols-4 lg:gap-3">
          {pieces.map((piece) => {
            const meta = getPieceMeta(piece);
            const owned = orders.some((o) => o.items.some((i) => i.productId === piece.id));
            return (
              <a
                key={piece.id}
                href={`#pieza-${piece.slug}`}
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(`pieza-${piece.slug}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
                }}
                className="group flex min-w-0 items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-krm-accent"
              >
                <span
                  className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border"
                  style={{ borderColor: `${meta.tint}55`, background: `radial-gradient(circle, ${meta.tint}22, transparent 70%)` }}
                >
                  <KarambitVFXImage
                    image={piece.image}
                    name={piece.name}
                    slug={piece.slug}
                    gradient={piece.gradient}
                    accentColor={piece.accentColor}
                    showSparkles={false}
                    showShimmer={false}
                    animateLevitate={false}
                    interactiveHover={false}
                    className="p-1"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-sm font-black uppercase tracking-wide text-white group-hover:text-amber-300">
                    {meta.numeral}. {meta.shortName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {owned ? (
                      <span className="flex items-center gap-1 font-tech text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                        <BadgeCheck className="h-3 w-3" /> Tuya
                      </span>
                    ) : (
                      <Price value={piece.basePrice} size="xs" tone="muted" className="font-body" />
                    )}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* ═══ PIEZAS ═══ */}
      <section id="piezas" className="mx-auto max-w-7xl scroll-mt-20 space-y-20 px-4 py-20 sm:px-6 lg:space-y-28 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="amber" icon={<Gem className="h-3.5 w-3.5" />}>
            Colección Founder Bespoke
          </Badge>
          <h2 className="mt-4 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Cuatro obras. <span className="text-vault-gold">Una sola vez.</span>
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-gray-400 sm:text-base">
            Mueve el cursor sobre cada pieza para verla bajo la luz del Vault.
          </p>
        </div>

        {pieces.map((piece, i) => (
          <PieceShowcase key={piece.id} product={piece} index={i} total={pieces.length} onOpenCertificate={openCertificate} />
        ))}
      </section>

      {/* ═══ CERTIFICACIÓN ═══ */}
      <section className="border-t border-white/5 bg-[#080a10]">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <p className="font-tech text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">Certificación</p>
            <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Cada pieza, <span className="text-vault-gold">documentada</span>
            </h2>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                initial={reduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <span className="absolute right-4 top-3 font-tech text-3xl font-black text-white/5">0{i + 1}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-400/10 text-amber-300">
                  {step.icon}
                </span>
                <h3 className="mt-3 font-display text-lg font-black uppercase tracking-wide text-white">{step.title}</h3>
                <p className="mt-1 font-body text-sm leading-relaxed text-gray-400">{step.text}</p>
              </motion.li>
            ))}
          </ol>

          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <SignatureMark />
            <Link to="/shop" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
              Ver el resto del catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ MODAL DEL CERTIFICADO ═══ */}
      <Modal
        open={certOpen}
        onClose={() => setCertOpen(false)}
        ariaLabel="Certificado de autenticidad"
        size="lg"
      >
        <button
          type="button"
          onClick={() => setCertOpen(false)}
          aria-label="Cerrar certificado"
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-gray-300 transition-colors hover:border-amber-300 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-krm-accent"
        >
          <X className="h-4 w-4" />
        </button>
        {certProduct && <CertificateBody product={certProduct} />}
      </Modal>
    </main>
  );
};

export default FoundersVaultPage;
