import React, { useMemo } from 'react';
import { rarityColors } from '../../data/karambits';
import {
  BUYBACK_RATE,
  TOTAL_BP,
  buybackValue,
  computeCaseStats,
  shortKnifeName,
  sortPoolByRarity,
  type MysteryCase,
} from '../../lib/mysteryCases';
import { Badge, Price } from '../ui';
import { KarambitVFXImage } from '../KarambitVFXImage';

const fmtPct = (value: number, digits = 2): string =>
  `${value.toLocaleString('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits })} %`;

const fmtEur = (value: number): string =>
  `${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const Stat: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-xl border border-krm-border bg-krm-card p-3">
    <p className="font-display text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
    <div className="mt-0.5">{value}</div>
    {hint && <p className="mt-0.5 font-body text-[10px] leading-snug text-gray-500">{hint}</p>}
  </div>
);

/** Contenido de la caja: premios ordenados por rareza con % de drop, valor y recompra, más la economía de la caja. */
export const PoolTable: React.FC<{ mysteryCase: MysteryCase }> = ({ mysteryCase }) => {
  const sorted = useMemo(() => sortPoolByRarity(mysteryCase.pool), [mysteryCase]);
  const stats = useMemo(() => computeCaseStats(mysteryCase), [mysteryCase]);
  const totalBp = mysteryCase.pool.reduce((sum, e) => sum + e.chanceBp, 0);
  const maxChance = Math.max(...sorted.map((e) => e.chance));

  return (
    <section aria-labelledby="pool-title" className="mb-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-widest text-krm-accent">
            Transparencia de probabilidades
          </p>
          <h2 id="pool-title" className="font-display text-2xl font-black uppercase text-white">
            Contenido · {mysteryCase.name}
          </h2>
        </div>
        <span className="font-mono text-xs text-gray-500">Σ probabilidades = {fmtPct((totalBp / TOTAL_BP) * 100)}</span>
      </div>

      {/* Economía de la caja */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Precio de la caja" value={<Price value={mysteryCase.price} size="md" />} />
        <Stat
          label="Valor esperado (catálogo)"
          value={<Price value={stats.evCatalog} size="md" tone="white" />}
          hint="Si reclamas todos los premios"
        />
        <Stat
          label={`Valor esperado (recompra ${Math.round(BUYBACK_RATE * 100)}%)`}
          value={<Price value={stats.evBuyback} size="md" tone="emerald" />}
          hint="Si vendes todos los premios"
        />
        <Stat
          label="Retorno vendiendo (RTP)"
          value={<span className="font-display text-lg font-black text-white">{fmtPct(stats.rtp * 100, 1)}</span>}
        />
        <Stat
          label="Ventaja de la casa"
          value={<span className="font-display text-lg font-black text-red-400">{fmtPct(stats.houseEdge * 100, 1)}</span>}
          hint="1 − RTP: vender nunca da beneficio esperado"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((entry) => {
          const color = rarityColors[entry.product.rarity];
          const founder = entry.product.collection === 'founder-bespoke';
          return (
            <div
              key={entry.product.id}
              className="flex items-center gap-3 rounded-2xl border border-krm-border bg-krm-card p-3 transition-colors hover:border-krm-accent/40"
              style={founder ? { borderColor: '#f472b655' } : undefined}
            >
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                <KarambitVFXImage
                  image={entry.product.image}
                  name={entry.product.name}
                  slug={entry.product.slug}
                  rarity={entry.product.rarity}
                  category={entry.product.category}
                  accentColor={entry.product.accentColor}
                  visualFilter={entry.product.visualFilter}
                  interactiveHover={false}
                  showSparkles={false}
                  showShimmer={false}
                />
              </div>
              <div className="min-w-0 flex-1">
                <Badge color={color}>{entry.product.rarity}</Badge>
                <p className="mt-1 truncate font-display text-sm font-bold text-white" title={entry.product.name}>
                  {shortKnifeName(entry.product)}
                </p>
                <p className="font-mono text-[11px] text-gray-400">
                  Valor {fmtEur(entry.product.basePrice)} · recompra {fmtEur(buybackValue(entry.product))}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-krm-border">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(3, (entry.chance / maxChance) * 100)}%`, background: color }}
                    />
                  </div>
                  <span className="font-mono text-xs font-black text-krm-accent">{fmtPct(entry.chance)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
