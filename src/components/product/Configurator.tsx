import React from 'react';
import { motion } from 'framer-motion';
import type { Product } from '../../data/karambits';
import { ADDON_PRICES } from '../../lib/pricing';
import { CheckRow, Choice, ChoiceGroup } from '../CheckRow';
import { Price } from '../ui/Price';
import { useVaultPick } from '../ui/vaultTone';
import { CharCount } from './CharCount';
import { NAMETAG_MAX_CHARS, STATTRAK_MAX_DIGITS, type ConfiguratorModel } from './useConfigurator';

/** Fila del configurador: índice mono + título, nota a la derecha y regla inferior. */
const ConfigRow: React.FC<{
  index: string;
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
}> = ({ index, title, note, children }) => {
  const t = useVaultPick();
  return (
    <section className={`border-b py-5 ${t('border-line', 'border-paper/20')}`}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className={`eyebrow ${t('!text-ink', '!text-paper')}`}>
          {index} — {title}
        </h2>
        {note && (
          <span className={`text-right font-mono text-[11px] tabular-nums ${t('text-ink-3', 'text-paper/50')}`}>{note}</span>
        )}
      </div>
      {children}
    </section>
  );
};

const INPUT_LIGHT = 'w-full border border-line bg-paper-2 px-3 py-2.5 text-ink placeholder:text-ink-3 focus:border-ink';
const INPUT_DARK =
  'w-full border border-paper/30 bg-transparent px-3 py-2.5 text-paper placeholder:text-paper/40 focus:border-paper';

const reveal = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: 'easeOut' },
} as const;

interface ConfiguratorProps {
  product: Product;
  cfg: ConfiguratorModel;
}

/** Opciones de la ficha: aviso 1-of-1, estado, hoja, grabados y accesorios (filas 01-04). */
export const Configurator: React.FC<ConfiguratorProps> = ({ product, cfg }) => {
  const { state, actions, rules, condition, sharpened, battleScarredDiscount, statTrakLabel } = cfg;
  const bsAvailable = rules.conditions.includes('Battle-Scarred');
  const t = useVaultPick();
  const inputClass = t(INPUT_LIGHT, INPUT_DARK);
  const hintClass = t('text-ink-3', 'text-paper/50');
  const ruleClass = t('border-line', 'border-paper/20');
  // Precio dentro de una opción activa (fondo opuesto al de la banda).
  const onActive = t('!text-paper', '!text-ink');
  const onActiveMuted = t('!text-paper/60', '!text-ink/60');

  return (
    <>
      {rules.singleUnit && (
        <p className={`border-b py-4 font-body text-sm leading-relaxed ${ruleClass} ${t('text-ink-2', 'text-paper/75')}`}>
          <span className={`eyebrow mr-2 ${t('!text-ink', '!text-paper')}`}>Pieza 1 de 1</span>
          Solo existe una unidad: se fabrica únicamente en Factory New, sin filo real y sin funda Kydex.
        </p>
      )}

      <ConfigRow
        index="01"
        title="Estado del acabado"
        note={condition === 'Battle-Scarred' ? `-${battleScarredDiscount}%` : 'Float 0.01'}
      >
        <ChoiceGroup label="Estado del acabado">
          <Choice
            active={condition === 'Factory New'}
            onClick={() => actions.setCondition('Factory New')}
            title="Factory New"
            sub="Recién fabricado · impecable"
            footer={(a) => <Price value={product.basePrice} size="sm" className={a ? onActive : ''} />}
          />
          <Choice
            active={condition === 'Battle-Scarred'}
            onClick={() => actions.setCondition('Battle-Scarred')}
            disabled={!bsAvailable}
            title="Battle-Scarred"
            sub="Defectos leves cosméticos"
            footer={(a) => (
              <span className="flex flex-wrap items-baseline gap-x-2">
                <Price value={product.battleScarredPrice} size="sm" className={a ? onActive : ''} />
                <Price value={product.basePrice} size="xs" tone="muted" strike className={a ? onActiveMuted : ''} />
              </span>
            )}
          />
        </ChoiceGroup>
        {!bsAvailable && (
          <p className={`mt-2 font-body text-xs ${hintClass}`}>Battle-Scarred no está disponible en piezas 1 de 1.</p>
        )}
      </ConfigRow>

      <ConfigRow index="02" title="Tipo de hoja" note={sharpened ? 'Corte real' : 'Apta para tricks'}>
        <ChoiceGroup label="Tipo de hoja">
          <Choice
            active={!sharpened}
            onClick={() => actions.setBlade('Sin Filo (Unsharpened)')}
            title="Sin filo"
            sub="Segura para tricks y exposición"
          />
          <Choice
            active={sharpened}
            onClick={() => actions.setBlade('Afilada (Sharpened)')}
            disabled={!rules.allowSharpened}
            title="Afilada"
            sub="Filo real cortante · +18 años"
          />
        </ChoiceGroup>
        {!rules.allowSharpened && (
          <p className={`mt-2 font-body text-xs ${hintClass}`}>Las piezas 1 de 1 se entregan siempre sin filo.</p>
        )}
      </ConfigRow>

      <ConfigRow index="03" title="Grabados">
        <div className="-mt-2.5">
          <CheckRow
            checked={state.statTrak}
            onChange={actions.setStatTrak}
            aside={<Price value={ADDON_PRICES.statTrak} size="xs" prefix="+" />}
            hint="Contador grabado a láser en la hoja"
          >
            StatTrak™
          </CheckRow>
          {state.statTrak && (
            <motion.div {...reveal} className={`border-b pb-4 pl-7 ${ruleClass}`}>
              <label htmlFor="stattrak-input" className={`eyebrow block ${t('', '!text-paper/60')}`}>
                Bajas · hasta {STATTRAK_MAX_DIGITS} dígitos
              </label>
              <div className="mt-2 flex items-stretch gap-3">
                <input
                  id="stattrak-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={STATTRAK_MAX_DIGITS}
                  value={state.statTrakNumber}
                  onChange={(e) => actions.setStatTrakNumber(e.target.value)}
                  placeholder="007"
                  aria-describedby="stattrak-hint"
                  className={`${inputClass} w-28 font-mono text-base font-medium tracking-[0.12em]`}
                />
                <p
                  className={`flex flex-1 items-center border border-dashed px-3 font-mono text-xs tabular-nums ${t(
                    'border-line text-ink-2',
                    'border-paper/30 text-paper/70'
                  )}`}
                >
                  ST™ <span className={`ml-1.5 text-sm font-medium ${t('text-ink', 'text-paper')}`}>{statTrakLabel}</span>
                </p>
              </div>
              <p id="stattrak-hint" className={`mt-2 font-body text-xs ${hintClass}`}>
                Se previsualiza sobre la hoja, en la imagen.
              </p>
            </motion.div>
          )}

          <CheckRow
            checked={state.nameTag}
            onChange={actions.setNameTag}
            aside={<Price value={ADDON_PRICES.nameTag} size="xs" prefix="+" />}
            hint="Placa de acero atornillada al mango"
          >
            NameTag
          </CheckRow>
          {state.nameTag && (
            <motion.div {...reveal} className="pb-1 pl-7">
              <label htmlFor="nametag-input" className={`eyebrow block ${t('', '!text-paper/60')}`}>
                Texto de la placa · máx. {NAMETAG_MAX_CHARS}
              </label>
              <input
                id="nametag-input"
                type="text"
                maxLength={NAMETAG_MAX_CHARS}
                value={state.nameTagText}
                onChange={(e) => actions.setNameTagText(e.target.value)}
                placeholder="HEADSHOT"
                aria-describedby="nametag-count nametag-hint"
                className={`${inputClass} mt-2 font-mono text-base font-medium uppercase tracking-[0.1em]`}
              />
              <CharCount id="nametag-count" length={state.nameTagText.length} max={NAMETAG_MAX_CHARS} />
              <p id="nametag-hint" className={`mt-2 font-body text-xs ${hintClass}`}>
                Se previsualiza sobre el mango, en la imagen.
              </p>
            </motion.div>
          )}
        </div>
      </ConfigRow>

      <ConfigRow index="04" title="Accesorios">
        <div className="-mt-2.5">
          <CheckRow
            checked={state.stand}
            onChange={actions.setStand}
            aside={<Price value={ADDON_PRICES.stand} size="xs" prefix="+" />}
            hint="Acrílico de 8 mm con grabado láser KRM—GG"
          >
            Soporte de exhibición
          </CheckRow>
          <CheckRow
            checked={cfg.config.kydex}
            onChange={actions.setKydex}
            disabled={!rules.allowKydex}
            bare
            aside={<Price value={ADDON_PRICES.kydex} size="xs" prefix="+" />}
            hint={rules.allowKydex ? 'Funda táctica con clip de cinturón y bloqueo' : 'No disponible en piezas 1 de 1'}
          >
            Funda Kydex
          </CheckRow>
        </div>
      </ConfigRow>
    </>
  );
};

export default Configurator;
