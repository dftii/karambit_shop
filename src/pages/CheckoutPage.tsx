import React, { useId, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, Lock, ShieldCheck, ShoppingCart, Zap } from 'lucide-react';
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
      <main id="main" tabIndex={-1} className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-20 pt-28 text-gray-200 sm:px-6">
        <PageMeta title="Finalizar compra" description="Revisa y confirma tu pedido de réplicas de karambit en KRM.GG." />
        <div className="mx-auto max-w-2xl rounded-3xl border border-krm-border bg-krm-surface p-6 py-16 text-center shadow-2xl sm:p-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-krm-accent/20 bg-krm-accent/10 text-krm-accent">
            <ShoppingCart className="h-10 w-10" />
          </div>
          <h1 className="mb-2 font-display text-2xl font-black uppercase text-white sm:text-3xl">
            Tu arsenal digital está vacío
          </h1>
          <p className="mx-auto mb-6 max-w-md font-body text-sm text-gray-400">
            Añade al menos un Karambit réplica 1:1, Mystery Box o Pack coleccionista antes de tramitar el pedido.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/shop" className={buttonClasses({ variant: 'primary' })}>
              Explorar catálogo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/orders" className={buttonClasses({ variant: 'secondary' })}>
              Ver mis pedidos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" tabIndex={-1} className="mx-auto min-h-screen w-full max-w-7xl overflow-x-hidden px-4 pb-20 pt-28 text-gray-200 sm:px-6">
      <PageMeta title="Finalizar compra" description="Revisa y confirma tu pedido de réplicas de karambit en KRM.GG." />
      {/* ══════════ CABECERA ══════════ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-left">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-krm-accent/25 bg-krm-accent/10 px-3 py-1 font-display text-[11px] font-black uppercase tracking-widest text-krm-accent sm:text-xs">
            Pasarela simulada — no se realiza ningún cargo real
          </span>
          <span className="flex items-center gap-1 font-body text-xs text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Entrega 100% digital
          </span>
        </div>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
          Tramitar <span className="text-krm-accent">pedido & arsenal</span>
        </h1>
        <p className="mt-1 font-body text-sm text-gray-400">
          Personalización en taller, certificado de autenticidad digital y número de serie único.
        </p>
      </motion.div>

      {/* ══════════ MODO SIMULACIÓN ══════════ */}
      <section
        aria-label="Modo simulación"
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-krm-border-strong bg-krm-card p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <span className="relative mt-1 flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-krm-accent opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-krm-accent" />
          </span>
          <div>
            <span className="block font-display text-xs font-black uppercase tracking-wider text-white">
              Modo simulación
            </span>
            <span className="font-body text-[11px] text-gray-400">
              Elige cómo responderá la pasarela de demostración a este pago.
            </span>
          </div>
        </div>
        <div
          role="radiogroup"
          aria-label="Resultado del pago simulado"
          className="flex w-full rounded-xl border border-krm-border-soft bg-krm-bg-deep p-1 sm:w-auto"
        >
          <button
            type="button"
            role="radio"
            aria-checked={simulation === 'success'}
            onClick={() => setSimulation('success')}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all sm:flex-none ${
              simulation === 'success' ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Pago aprobado
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={simulation === 'failure'}
            onClick={() => setSimulation('failure')}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all sm:flex-none ${
              simulation === 'failure' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5" /> Pago rechazado
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        {/* ─── Izquierda: identificación + método ─── */}
        <div className="min-w-0 space-y-6 lg:col-span-7">
          <section
            aria-labelledby={`${uid}-id`}
            className="space-y-4 rounded-3xl border border-krm-border bg-krm-surface p-4 shadow-xl sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-krm-border pb-3">
              <h2 id={`${uid}-id`} className="flex items-center gap-2 font-display text-lg font-black uppercase text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-krm-accent/20 text-xs text-krm-accent">1</span>
                Identificación
              </h2>
              <span className="font-body text-[11px] text-gray-500">Sin datos de envío: entrega digital</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  className={inputClasses(Boolean(touched.alias && aliasError), 'font-display font-bold')}
                />
              </Field>
              <Field id={`${uid}-email`} label="Email del certificado digital" error={touched.email ? emailError : null}>
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
                  className={inputClasses(Boolean(touched.email && emailError), 'font-body')}
                />
              </Field>
            </div>
          </section>

          <section
            ref={methodSectionRef}
            aria-labelledby={`${uid}-pay`}
            className="scroll-mt-28 space-y-5 rounded-3xl border border-krm-border bg-krm-surface p-4 shadow-xl sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-krm-border pb-3">
              <h2 id={`${uid}-pay`} className="flex items-center gap-2 font-display text-lg font-black uppercase text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-krm-accent/20 text-xs text-krm-accent">2</span>
                Método de pago
              </h2>
              <span className="font-mono text-xs font-bold text-krm-accent">Demo · sin coste real</span>
            </div>

            <MethodPicker value={method} onChange={setMethod} balance={balance} total={total} />

            {free && (
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 font-body text-xs text-emerald-300">
                El total es 0,00 €: no hace falta método de pago. Pulsa «Pagar» para confirmar el pedido.
              </p>
            )}

            <div className="pt-1">
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
          </section>
        </div>

        {/* ─── Derecha: resumen + pagar ─── */}
        <div className="min-w-0 lg:sticky lg:top-28 lg:col-span-5">
          <OrderSummary>
            <div className="space-y-3 border-t border-krm-border pt-4">
              {simulation === 'failure' && (
                <p className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 font-body text-[11px] text-red-300">
                  <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
                  Modo simulación: el pago será rechazado a propósito.
                </p>
              )}

              <Button
                fullWidth
                size="lg"
                onClick={() => handlePay()}
                disabled={!canPay}
                icon={<Lock className="h-5 w-5" />}
                aria-describedby={`${uid}-pay-hint`}
              >
                Pagar <Price value={total} size="md" tone="white" className="text-black!" />
              </Button>

              <p id={`${uid}-pay-hint`} className="min-h-4 text-center font-body text-[11px] text-gray-500" aria-live="polite">
                {issues.length > 0 ? `Para continuar completa: ${issues.join(', ')}.` : ''}
              </p>

              <div className="flex items-start justify-center gap-2 rounded-xl border border-krm-border-soft bg-krm-card p-2.5 font-body text-[11px] text-gray-400">
                <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>Pasarela simulada — no se realiza ningún cargo real ni se envían datos a terceros.</span>
              </div>
              <div className="flex items-center justify-center gap-1 font-body text-[11px] text-gray-500">
                <Zap className="h-3.5 w-3.5 text-krm-accent" /> Entrega digital instantánea
              </div>
            </div>
          </OrderSummary>
        </div>
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

export default CheckoutPage;
