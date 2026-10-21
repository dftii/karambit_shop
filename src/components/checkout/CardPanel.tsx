import React, { useId, useState } from 'react';
import { RotateCw, ShieldAlert, Zap } from 'lucide-react';
import {
  cardMaxDigits,
  cvvLength,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  onlyDigits,
  type CardErrors,
  type CardFields,
} from '../../lib/payment';
import { Button } from '../ui/Button';
import { CardBrandMark } from './CardBrandMark';
import { Field } from './Field';
import { inputClasses } from './fieldStyles';

type Touched = Partial<Record<keyof CardFields, boolean>>;

interface CardPanelProps {
  value: CardFields;
  onChange: (next: CardFields) => void;
  errors: CardErrors;
  touched: Touched;
  onTouch: (field: keyof CardFields) => void;
  onAutofill: () => void;
}

/** Tarjeta 3D (gira al enfocar el CVV) + formulario con validación en línea. */
export const CardPanel: React.FC<CardPanelProps> = ({ value, onChange, errors, touched, onTouch, onAutofill }) => {
  const uid = useId();
  const [flipped, setFlipped] = useState(false);
  const brand = detectCardBrand(value.number);
  const err = (field: keyof CardFields) => (touched[field] ? errors[field] : undefined);
  const cvvMax = cvvLength(brand);

  return (
    <div className="space-y-5">
      {/* ── Tarjeta 3D ── */}
      <div
        className="relative mx-auto h-48 w-full max-w-sm select-none sm:h-52"
        style={{ perspective: '1000px' }}
        aria-hidden="true"
      >
        <div
          className="relative h-full w-full transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Cara delantera */}
          <div
            className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-2xl sm:p-6"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #181c2b 0%, #0d0f17 50%, #1e1b12 100%)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245,158,11,0.15)',
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 [background-size:8px_8px]" />
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-black tracking-widest">
                  KRM<span className="text-krm-accent">.CARD</span>
                </span>
                <span className="rounded border border-krm-accent/30 bg-krm-accent/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-krm-accent">
                  DEMO
                </span>
              </div>
              {brand !== 'unknown' ? (
                <CardBrandMark brand={brand} />
              ) : (
                <div className="flex h-6 w-9 items-center justify-center rounded border border-krm-accent/40 bg-krm-accent/20">
                  <Zap className="h-4 w-4 text-krm-accent" />
                </div>
              )}
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-7 w-10 items-center justify-center rounded-md border border-amber-500/80 bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-200 shadow-md">
                <div className="h-4 w-6 rounded-sm border border-amber-600/50" />
              </div>
              <span className="font-mono text-xs text-gray-400">Contactless )))</span>
            </div>
            <p className="relative z-10 truncate font-mono text-base font-bold tracking-widest text-amber-300 drop-shadow sm:text-xl">
              {value.number || '•••• •••• •••• ••••'}
            </p>
            <div className="relative z-10 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <span className="block font-body text-[9px] uppercase tracking-wider text-gray-400">Titular</span>
                <p className="truncate font-mono text-xs font-bold uppercase">{value.holder || 'NOMBRE TITULAR'}</p>
              </div>
              <div className="shrink-0">
                <span className="block font-body text-[9px] uppercase tracking-wider text-gray-400">Caducidad</span>
                <p className="font-mono text-xs font-bold">{value.expiry || 'MM/AA'}</p>
              </div>
            </div>
          </div>

          {/* Cara trasera */}
          <div
            className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-2xl sm:p-6"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #0b0d14 0%, #171a26 60%, #1e1610 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <div className="-mx-5 mt-1 h-9 bg-black opacity-90 sm:-mx-6" />
            <div className="space-y-1">
              <span className="block font-body text-[9px] uppercase tracking-wider text-gray-400">
                Código de seguridad (CVV)
              </span>
              <div className="flex items-center justify-end rounded-lg border border-white/20 bg-white/10 p-2">
                <span className="font-mono text-sm font-black tracking-widest text-krm-accent">
                  {value.cvv ? value.cvv.replace(/\d/g, '•') : '•••'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between font-body text-[10px] text-gray-400">
              <span>Firma autorizada</span>
              <span className="font-mono font-bold text-krm-accent">KRM-SIM-3D</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="flex cursor-pointer items-center gap-1.5 font-display text-xs font-bold uppercase text-krm-accent transition-colors hover:text-amber-300"
        >
          <RotateCw className="h-3.5 w-3.5" />
          {flipped ? 'Ver cara delantera' : 'Girar tarjeta (ver CVV)'}
        </button>
        <Button
          size="sm"
          icon={<Zap className="h-3.5 w-3.5" />}
          onClick={() => {
            onAutofill();
            setFlipped(false);
          }}
        >
          Autocompletar tarjeta de prueba
        </Button>
      </div>

      {/* ── Formulario ── */}
      <div className="space-y-3.5 border-t border-krm-border pt-4">
        <Field id={`${uid}-number`} label="Número de tarjeta" error={err('number')}>
          <div className="relative">
            <input
              id={`${uid}-number`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={cardMaxDigits(brand) + 3}
              value={value.number}
              onChange={(e) => {
                const number = formatCardNumber(e.target.value);
                // Si cambia la marca, recorta el CVV a la longitud que le toca.
                const max = cvvLength(detectCardBrand(number));
                onChange({ ...value, number, cvv: value.cvv.slice(0, max) });
              }}
              onBlur={() => onTouch('number')}
              placeholder="4242 4242 4242 4242"
              aria-invalid={Boolean(err('number'))}
              aria-describedby={err('number') ? `${uid}-number-msg` : undefined}
              className={inputClasses(Boolean(err('number')), 'pr-20 font-mono tracking-wider')}
            />
            {brand !== 'unknown' && (
              <CardBrandMark brand={brand} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </Field>

        <Field id={`${uid}-holder`} label="Titular de la tarjeta" error={err('holder')}>
          <input
            id={`${uid}-holder`}
            type="text"
            autoComplete="off"
            maxLength={40}
            value={value.holder}
            onChange={(e) => onChange({ ...value, holder: e.target.value.toUpperCase() })}
            onBlur={() => onTouch('holder')}
            placeholder="PRO COLLECTOR"
            aria-invalid={Boolean(err('holder'))}
            aria-describedby={err('holder') ? `${uid}-holder-msg` : undefined}
            className={inputClasses(Boolean(err('holder')), 'font-mono uppercase')}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id={`${uid}-expiry`} label="Caducidad" error={err('expiry')}>
            <input
              id={`${uid}-expiry`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={5}
              value={value.expiry}
              onChange={(e) => onChange({ ...value, expiry: formatExpiry(e.target.value) })}
              onBlur={() => onTouch('expiry')}
              placeholder="MM/AA"
              aria-invalid={Boolean(err('expiry'))}
              aria-describedby={err('expiry') ? `${uid}-expiry-msg` : undefined}
              className={inputClasses(Boolean(err('expiry')), 'text-center font-mono')}
            />
          </Field>
          <Field id={`${uid}-cvv`} label={`CVV (${cvvMax} dígitos)`} error={err('cvv')}>
            <input
              id={`${uid}-cvv`}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={cvvMax}
              value={value.cvv}
              onFocus={() => setFlipped(true)}
              onBlur={() => {
                setFlipped(false);
                onTouch('cvv');
              }}
              onChange={(e) => onChange({ ...value, cvv: onlyDigits(e.target.value).slice(0, cvvMax) })}
              placeholder={'•'.repeat(cvvMax)}
              aria-invalid={Boolean(err('cvv'))}
              aria-describedby={err('cvv') ? `${uid}-cvv-msg` : undefined}
              className={inputClasses(Boolean(err('cvv')), 'text-center font-mono font-bold text-krm-accent')}
            />
          </Field>
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-krm-accent/20 bg-krm-accent/5 p-3 font-body text-[11px] leading-relaxed text-gray-400">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-krm-accent" />
        <span>
          Demostración: no introduzcas una tarjeta real. Usa la de prueba{' '}
          <strong className="font-mono text-gray-200">4242 4242 4242 4242</strong>, cualquier fecha futura y CVV 123.
          En el pedido solo se guardan la marca y los 4 últimos dígitos.
        </span>
      </p>
    </div>
  );
};

export default CardPanel;
