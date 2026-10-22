import React, { useId, useState } from 'react';
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

const CARD_LABEL = 'font-mono text-[10px] uppercase tracking-[0.08em] text-paper/60';

/** Tarjeta plana (muestra el reverso con el CVV al enfocarlo) + formulario con validación en línea. */
export const CardPanel: React.FC<CardPanelProps> = ({ value, onChange, errors, touched, onTouch, onAutofill }) => {
  const uid = useId();
  const [showBack, setShowBack] = useState(false);
  const brand = detectCardBrand(value.number);
  const err = (field: keyof CardFields) => (touched[field] ? errors[field] : undefined);
  const cvvMax = cvvLength(brand);

  return (
    <div className="space-y-6">
      {/* ── Tarjeta ilustrativa (plana, sin brillos) ── */}
      <div
        className="relative mx-auto flex aspect-[1.586/1] w-full max-w-sm select-none flex-col justify-between overflow-hidden bg-ink p-5 text-paper sm:p-6"
        aria-hidden="true"
      >
        {showBack ? (
          <>
            <div className="-mx-5 mt-1 h-9 bg-paper/15 sm:-mx-6" />
            <div className="space-y-1.5">
              <span className={`block ${CARD_LABEL}`}>Código de seguridad (CVV)</span>
              <div className="flex items-center justify-end border border-paper/30 px-3 py-2">
                <span className="font-mono text-sm tracking-[0.3em]">
                  {value.cvv ? value.cvv.replace(/\d/g, '•') : '•••'}
                </span>
              </div>
            </div>
            <div className={`flex items-center justify-between ${CARD_LABEL}`}>
              <span>Firma autorizada</span>
              <span className="text-pink">KRM-SIM-3D</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-semibold leading-none tracking-[-0.05em]">
                  KRM<span className="text-pink">—</span>GG
                </span>
                <span className={CARD_LABEL}>Demo</span>
              </div>
              {brand !== 'unknown' ? <CardBrandMark brand={brand} /> : <span className={CARD_LABEL}>Tarjeta</span>}
            </div>
            <p className="truncate font-mono text-base tracking-[0.14em] sm:text-xl">
              {value.number || '•••• •••• •••• ••••'}
            </p>
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <span className={`block ${CARD_LABEL}`}>Titular</span>
                <p className="truncate font-mono text-xs uppercase">{value.holder || 'Nombre titular'}</p>
              </div>
              <div className="shrink-0">
                <span className={`block ${CARD_LABEL}`}>Caducidad</span>
                <p className="font-mono text-xs">{value.expiry || 'MM/AA'}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Tarjeta de prueba</p>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            onAutofill();
            setShowBack(false);
          }}
        >
          Autocompletar tarjeta de prueba
        </Button>
      </div>

      {/* ── Formulario ── */}
      <div className="space-y-4 border-t border-line pt-5">
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
              <CardBrandMark
                brand={brand}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2"
              />
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

        <div className="grid grid-cols-2 gap-4">
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
              onFocus={() => setShowBack(true)}
              onBlur={() => {
                setShowBack(false);
                onTouch('cvv');
              }}
              onChange={(e) => onChange({ ...value, cvv: onlyDigits(e.target.value).slice(0, cvvMax) })}
              placeholder={'•'.repeat(cvvMax)}
              aria-invalid={Boolean(err('cvv'))}
              aria-describedby={err('cvv') ? `${uid}-cvv-msg` : undefined}
              className={inputClasses(Boolean(err('cvv')), 'text-center font-mono')}
            />
          </Field>
        </div>
      </div>

      <p className="border-l-2 border-pink pl-4 font-body text-xs leading-relaxed text-ink-2">
        Demostración: no introduzcas una tarjeta real. Usa la de prueba{' '}
        <strong className="font-mono font-medium text-ink">4242 4242 4242 4242</strong>, cualquier fecha futura y CVV 123.
        En el pedido solo se guardan la marca y los 4 últimos dígitos.
      </p>
    </div>
  );
};

export default CardPanel;
