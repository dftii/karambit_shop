import React, { useId, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { computeCartTotals, useCartTotals, useStore } from '../store/useStore';
import { generateTxHash } from '../lib/ids';
import { toast } from '../lib/toast';
import {
  DEMO_SKINS,
  buildCardPaymentDetails,
  buildTestCard,
  cryptoAmount,
  onlyDigits,
  validateAlias,
  validateBizumPhone,
  validateCard,
  validateEmail,
  skinsValue,
  type CardFields,
  type CheckoutMethod,
  type CryptoCurrency,
  type ExtendedPaymentDetails,
  type WalletKind,
} from '../lib/payment';
import { formatEUR } from '../lib/format';
import { buttonClasses } from '../components/ui/buttonStyles';
import { Button } from '../components/ui/Button';
import { Price } from '../components/ui/Price';
import { Field } from '../components/checkout/Field';
import { inputClasses } from '../components/checkout/fieldStyles';
import { MethodPicker } from '../components/checkout/MethodPicker';
import { CardPanel } from '../components/checkout/CardPanel';
import { WalletPanel } from '../components/checkout/WalletPanel';
import { CryptoPanel } from '../components/checkout/CryptoPanel';
import { SteamPanel } from '../components/checkout/SteamPanel';
import { BalancePanel } from '../components/checkout/BalancePanel';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { ProcessingModal } from '../components/checkout/ProcessingModal';
import { useCheckoutRunner } from '../components/checkout/useCheckoutRunner';
import { PageMeta } from '../components/PageMeta';

type SimulationMode = 'success' | 'failure';

const SIM_OPTIONS: { value: SimulationMode; label: string; active: string }[] = [
  { value: 'success', label: 'Pago aprobado', active: 'bg-ink text-paper' },
  { value: 'failure', label: 'Pago rechazado', active: 'bg-danger text-paper' },
];

const VERIFY_LABELS: Record<CheckoutMethod, string> = {
  credit_card: 'Autenticación 3D-Secure y comprobación de fondos',
  bizum_apple_pay: 'Autorizando el pago en tu app móvil',
  crypto: 'Esperando confirmaciones en la red (simulado)',
  steam_skins: 'Esperando la aceptación de la oferta de intercambio',
  balance: 'Debitando saldo KRM',
};

const DECLINE_MESSAGES: Record<CheckoutMethod, string> = {
  credit_card:
    'La entidad emisora ha rechazado la operación (fondos insuficientes). Código simulado: REF-501-DECLINED. No se ha realizado ningún cargo.',
  bizum_apple_pay: 'La operación ha sido denegada por tu app móvil. Código simulado: WAL-402-DENIED. No se ha realizado ningún cargo.',
  crypto: 'La transacción no ha recibido confirmaciones a tiempo. Código simulado: NET-408-TIMEOUT. No se ha movido ningún fondo.',
  steam_skins: 'El intercambio ha sido rechazado en Steam. Código simulado: TRD-403-REJECTED. No se ha entregado ninguna skin.',
  balance: 'No se ha podido debitar el saldo KRM. Código simulado: BAL-409-REJECTED. Tu saldo no ha cambiado.',
};

const EMPTY_CARD: CardFields = { number: '', holder: '', expiry: '', cvv: '' };

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const uid = useId();
  const { cart, balance, orders, placeOrder, addBalance, setCartOpen } = useStore(
    useShallow((s) => ({
      cart: s.cart,
      balance: s.balance,
      orders: s.orders,
      placeOrder: s.placeOrder,
      addBalance: s.addBalance,
      setCartOpen: s.setCartOpen,
    }))
  );
  const { total } = useCartTotals();
  const runner = useCheckoutRunner();
  const methodSectionRef = useRef<HTMLElement>(null);

  // ── Identificación (se reutiliza la del último pedido, si existe) ──
  const [alias, setAlias] = useState(() => orders[0]?.collectorAlias ?? '');
  const [email, setEmail] = useState(() => orders[0]?.email ?? '');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) => setTouched((t) => (t[field] ? t : { ...t, [field]: true }));

  // ── Método y simulación ──
  const [method, setMethod] = useState<CheckoutMethod>('credit_card');
  const [simulation, setSimulation] = useState<SimulationMode>('success');

  // ── Estado por método (nada de esto se persiste; el número completo nunca sale del componente) ──
  const [card, setCard] = useState<CardFields>(EMPTY_CARD);
  const [wallet, setWallet] = useState<WalletKind>('bizum');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState<CryptoCurrency>('USDT');
  const [skins, setSkins] = useState<string[]>([]);

  // ── Validación ──
  const aliasError = validateAlias(alias);
  const emailError = validateEmail(email);
  const cardErrors = useMemo(() => validateCard(card), [card]);
  const phoneError = validateBizumPhone(phone);
  const free = total <= 0;

  const issues: string[] = [];
  if (aliasError) issues.push('alias');
  if (emailError) issues.push('email');
  if (!free) {
    if (method === 'credit_card' && Object.keys(cardErrors).length > 0) issues.push('datos de la tarjeta');
    if (method === 'bizum_apple_pay' && wallet === 'bizum' && phoneError) issues.push('móvil de Bizum');
    if (method === 'steam_skins' && skinsValue(skins) + 0.001 < total) issues.push('skins por valor del total');
    if (method === 'balance' && balance + 0.001 < total) issues.push('saldo suficiente');
  }
  const valid = issues.length === 0 && cart.length > 0;
  const canPay = valid && runner.state.phase === 'idle';

  // ── Pago ──
  const buildDetails = (amount: number): ExtendedPaymentDetails => {
    switch (method) {
      case 'credit_card':
        return buildCardPaymentDetails(card);
      case 'bizum_apple_pay':
        return {
          wallet,
          // Solo se conservan los 3 últimos dígitos del móvil.
          bizumPhone: wallet === 'bizum' ? `••• ••• ${onlyDigits(phone).slice(-3)}` : undefined,
        };
      case 'crypto':
        return { cryptoCurrency: currency, cryptoTx: generateTxHash(), cryptoAmount: cryptoAmount(amount, currency) };
      case 'steam_skins':
        return {
          skinsTraded: DEMO_SKINS.filter((s) => skins.includes(s.id)).map((s) => s.name),
          skinsValue: skinsValue(skins),
        };
      case 'balance':
        return { balancePaid: amount };
    }
  };

  const handlePay = (forceApproved = false) => {
    if (!valid) return;
    void runner.start({
      decline: simulation === 'failure' && !forceApproved,
      declineMessage: DECLINE_MESSAGES[method],
      commit: () => {
        const { cart: liveCart, activeCoupon } = useStore.getState();
        const amount = computeCartTotals(liveCart, activeCoupon).total;
        return placeOrder({
          collectorAlias: alias.trim(),
          email: email.trim(),
          // Con total 0 € no hay cobro: se registra como saldo (0 €).
          paymentMethod: amount <= 0 ? 'balance' : method,
          paymentDetails: amount <= 0 ? { balancePaid: 0 } : buildDetails(amount),
        });
      },
      onSuccess: (order) => navigate(`/order-success/${order.id}`),
    });
  };

  const handleRetryApproved = () => {
    setSimulation('success');
    handlePay(true);
  };

  const handleChangeMethod = () => {
    runner.dismiss();
    window.setTimeout(() => methodSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleRecharge = (amount: number) => {
    addBalance(amount);
    toast.success(`Saldo simulado recargado: +${formatEUR(amount)}`);
  };

  // ── Carrito vacío ──
  if (cart.length === 0 && runner.state.phase === 'idle') {
    return (
      <main id="main" tabIndex={-1} className="wrap py-12 outline-none sm:py-20">
        <PageMeta title="Finalizar compra" description="Revisa y confirma tu pedido de réplicas de karambit en KRM.GG." />
        <p className="eyebrow">Checkout</p>
        <h1 className="display-xl mt-5 max-w-3xl">
          Tu carrito está <span className="serif-accent text-pink-ink">vacío</span>.
        </h1>
        <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-ink-2">
          Añade al menos un karambit réplica 1:1 o un pack coleccionista antes de tramitar el pedido.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/shop" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
            Explorar catálogo
          </Link>
          <Link to="/orders" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
            Ver mis pedidos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main" tabIndex={-1} className="wrap py-12 outline-none sm:py-20">
      <PageMeta title="Finalizar compra" description="Revisa y confirma tu pedido de réplicas de karambit en KRM.GG." />

      {/* ══════════ CABECERA ══════════ */}
      <header className="border-b border-line pb-8 sm:pb-12">
        <p className="eyebrow flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-pink" />
          Pasarela simulada — no se realiza ningún cargo real
        </p>
        <h1 className="display-xl mt-5">
          Tramitar el <span className="serif-accent text-pink-ink">pedido</span>.
        </h1>
        <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-ink-2 sm:text-lg">
          Personalización en taller, certificado de autenticidad digital y número de serie único.
        </p>
      </header>

      {/* ══════════ MODO SIMULACIÓN ══════════ */}
      <section
        aria-label="Modo simulación"
        className="flex flex-col gap-3 border-b border-line py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="eyebrow text-ink">Modo simulación</p>
          <p className="mt-1 font-body text-xs text-ink-3">
            Elige cómo responderá la pasarela de demostración a este pago.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Resultado del pago simulado"
          className="flex w-full divide-x divide-ink border border-ink sm:w-auto"
        >
          {SIM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={simulation === opt.value}
              onClick={() => setSimulation(opt.value)}
              className={`flex-1 cursor-pointer px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors sm:flex-none ${
                simulation === opt.value ? opt.active : 'bg-transparent text-ink hover:bg-tile'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-16">
        {/* ─── Izquierda: pasos ─── */}
        <div className="min-w-0 space-y-12 lg:col-span-7">
          <section aria-labelledby={`${uid}-id`}>
            <StepHead index="01" label="Coleccionista" id={`${uid}-id`}>
              Tus <span className="serif-accent text-pink-ink">datos</span>
            </StepHead>
            <div className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2">
              <Field id={`${uid}-alias`} label="Alias de coleccionista" error={touched.alias ? aliasError : null}>
                <input
                  id={`${uid}-alias`}
                  type="text"
                  value={alias}
                  maxLength={24}
                  onChange={(e) => setAlias(e.target.value)}
                  onBlur={() => touch('alias')}
                  placeholder="Ej: GhostCS2"
                  autoComplete="nickname"
                  aria-invalid={Boolean(touched.alias && aliasError)}
                  aria-describedby={touched.alias && aliasError ? `${uid}-alias-msg` : undefined}
                  className={inputClasses(Boolean(touched.alias && aliasError))}
                />
              </Field>
              <Field id={`${uid}-email`} label="Email del certificado" error={touched.email ? emailError : null}>
                <input
                  id={`${uid}-email`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => touch('email')}
                  placeholder="nombre@dominio.com"
                  autoComplete="email"
                  aria-invalid={Boolean(touched.email && emailError)}
                  aria-describedby={touched.email && emailError ? `${uid}-email-msg` : undefined}
                  className={inputClasses(Boolean(touched.email && emailError))}
                />
              </Field>
            </div>
          </section>

          <section ref={methodSectionRef} aria-labelledby={`${uid}-pay`} className="scroll-mt-24">
            <StepHead index="02" label="Método de pago" id={`${uid}-pay`}>
              Cómo <span className="serif-accent text-pink-ink">pagar</span>
            </StepHead>
            <div className="space-y-6 pt-6">
              <MethodPicker value={method} onChange={setMethod} balance={balance} total={total} />

              {free && (
                <p className="border-l-2 border-success pl-4 font-body text-xs leading-relaxed text-ink-2">
                  El total es 0,00 €: no hace falta método de pago. Pulsa «Pagar» para confirmar el pedido.
                </p>
              )}

              <div>
                {method === 'credit_card' && (
                  <CardPanel
                    value={card}
                    onChange={setCard}
                    errors={cardErrors}
                    touched={{ number: touched.cNumber, holder: touched.cHolder, expiry: touched.cExpiry, cvv: touched.cCvv }}
                    onTouch={(field) =>
                      touch({ number: 'cNumber', holder: 'cHolder', expiry: 'cExpiry', cvv: 'cCvv' }[field])
                    }
                    onAutofill={() => {
                      setCard(buildTestCard());
                      setTouched((t) => ({ ...t, cNumber: true, cHolder: true, cExpiry: true, cCvv: true }));
                    }}
                  />
                )}
                {method === 'bizum_apple_pay' && (
                  <WalletPanel
                    wallet={wallet}
                    onWalletChange={setWallet}
                    phone={phone}
                    onPhoneChange={setPhone}
                    phoneError={touched.phone ? phoneError : null}
                    onPhoneBlur={() => touch('phone')}
                  />
                )}
                {method === 'crypto' && <CryptoPanel currency={currency} onCurrencyChange={setCurrency} total={total} />}
                {method === 'steam_skins' && <SteamPanel selected={skins} onSelectedChange={setSkins} total={total} />}
                {method === 'balance' && <BalancePanel balance={balance} total={total} onRecharge={handleRecharge} />}
              </div>
            </div>
          </section>

          <section aria-labelledby={`${uid}-review`}>
            <StepHead index="03" label="Revisión" id={`${uid}-review`}>
              Confirmar el <span className="serif-accent text-pink-ink">pedido</span>
            </StepHead>
            <div className="space-y-4 pt-6">
              {simulation === 'failure' && (
                <p className="border-l-2 border-danger pl-4 font-body text-xs leading-relaxed text-danger">
                  Modo simulación: el pago será rechazado a propósito.
                </p>
              )}

              <Button
                fullWidth
                size="lg"
                onClick={() => handlePay()}
                disabled={!canPay}
                aria-describedby={`${uid}-pay-hint`}
              >
                Pagar <Price value={total} size="md" className="text-inherit!" />
              </Button>

              <p id={`${uid}-pay-hint`} className="min-h-4 font-body text-xs text-ink-3" aria-live="polite">
                {issues.length > 0 ? `Para continuar completa: ${issues.join(', ')}.` : ''}
              </p>

              <p className="border-l-2 border-pink pl-4 font-body text-xs leading-relaxed text-ink-2">
                Pasarela simulada — no se realiza ningún cargo real ni se envían datos a terceros.
              </p>
              <p className="eyebrow">Certificado digital y número de serie único incluidos</p>
            </div>
          </section>
        </div>

        {/* ─── Derecha: resumen (primero y plegable en móvil, fijo en escritorio) ─── */}
        <aside className="order-first min-w-0 lg:order-none lg:sticky lg:top-24 lg:col-span-5">
          <OrderSummary />
        </aside>
      </div>

      <ProcessingModal
        state={runner.state}
        verifyLabel={VERIFY_LABELS[method]}
        canCancel={runner.canCancel}
        onCancel={runner.cancel}
        onRetry={() => handlePay()}
        onRetryApproved={handleRetryApproved}
        onChangeMethod={handleChangeMethod}
        onReviewCart={() => {
          runner.dismiss();
          setCartOpen(true);
        }}
      />
    </main>
  );
};

/** Cabecera de paso numerada: "01 — Coleccionista" + titular. */
const StepHead: React.FC<{ index: string; label: string; id: string; children: React.ReactNode }> = ({
  index,
  label,
  id,
  children,
}) => (
  <div className="border-b border-line pb-5">
    <p className="eyebrow">
      {index} — {label}
    </p>
    <h2 id={id} className="display-md mt-3">
      {children}
    </h2>
  </div>
);

export default CheckoutPage;
