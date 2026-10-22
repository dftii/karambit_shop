import { memo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { Product } from '../../data/karambits';
import type { Condition } from '../../lib/pricing';
import { KarambitVFXImage } from '../KarambitVFXImage';
import { NameTagPreview, StatTrakPreview } from '../EngravingPreview';

type InspectMode = 'full' | 'blade' | 'handle';

// En coordenadas de la imagen (hoja a la izquierda, anilla a la derecha): se aplica antes del giro/volteo,
// así el zoom sigue a la pieza aunque se voltee o rote.
const ZOOM: Record<InspectMode, string> = {
  full: 'scale(1) translate(0, 0)',
  blade: 'scale(1.6) translate(18%, 6%)',
  handle: 'scale(1.7) translate(-22%, -6%)',
};

const miniButton =
  'border border-ink px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-paper';

interface InspectorProps {
  product: Product;
  condition: Condition;
  /** Contador StatTrak™ a previsualizar, o `null` si no hay StatTrak. */
  statTrak: string | null;
  /** Texto de la placa a previsualizar, o `null` si no hay NameTag. */
  nameTag: string | null;
}

/**
 * Escenario de la ficha: imagen con zoom hoja/mango, giro de 45°, volteo y vista previa del grabado.
 * El estado de inspección es local: girar o hacer zoom no re-renderiza el resto de la ficha.
 */
export const Inspector = memo(function Inspector({ product, condition, statTrak, nameTag }: InspectorProps) {
  const [inspectMode, setInspectMode] = useState<InspectMode>('full');
  const [rotation, setRotation] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const viewButton = (mode: InspectMode, label: string) => (
    <button
      key={mode}
      type="button"
      onClick={() => setInspectMode(mode)}
      aria-pressed={inspectMode === mode}
      className={`px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors [&:not(:first-child)]:border-l [&:not(:first-child)]:border-ink ${
        inspectMode === mode ? 'bg-ink text-paper' : 'text-ink hover:bg-tile'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-w-0 lg:col-span-7 lg:self-start lg:sticky lg:top-24">
      <div className="relative aspect-square overflow-hidden bg-tile">
        <p className="eyebrow absolute left-3 top-3 z-20 sm:left-4 sm:top-4">
          Fig. 01 — {condition}
          <span className="text-ink-3"> · Float {condition === 'Battle-Scarred' ? '0.65' : '0.01'}</span>
        </p>
        {(statTrak !== null || nameTag !== null) && (
          <p className="eyebrow absolute bottom-3 left-3 z-20 !text-ink sm:bottom-4 sm:left-4">Vista previa del grabado</p>
        )}

        <div className="absolute inset-0">
          {/* Rotación / volteo + zoom de inspección + patina de Battle-Scarred */}
          <div
            className={`relative h-full w-full p-8 sm:p-14 ${
              condition === 'Battle-Scarred' ? 'contrast-125 saturate-75 brightness-90' : ''
            }`}
            style={{
              transform: `rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1}) ${ZOOM[inspectMode]}`,
              transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <KarambitVFXImage priority image={product.image} name={product.name} interactiveHover={false} />
            {statTrak !== null && <StatTrakPreview value={statTrak} />}
            {nameTag !== null && <NameTagPreview text={nameTag} />}
          </div>
        </div>
      </div>

      {/* Controles de inspección */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Zona de inspección" className="inline-flex border border-ink">
          {viewButton('full', 'General')}
          {viewButton('blade', 'Hoja')}
          {viewButton('handle', 'Mango')}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRotation((prev) => (prev - 45) % 360)}
            aria-label="Rotar a la izquierda"
            title="Rotar a la izquierda"
            className="flex h-[34px] w-[34px] items-center justify-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setRotation(0)}
            title="Restablecer ángulo"
            aria-label={`Restablecer ángulo (${rotation} grados)`}
            className={`${miniButton} min-w-[3.5rem] tabular-nums`}
          >
            {rotation}°
          </button>
          <button type="button" onClick={() => setIsFlipped((flipped) => !flipped)} aria-pressed={isFlipped} className={miniButton}>
            Voltear
          </button>
        </div>
      </div>

      {/* Datos de calidad */}
      <dl className="mt-8 grid grid-cols-3 border-t border-line">
        {[
          ['Acero', '440C'],
          ['Escala', '1:1 CS2'],
          ['Peso', product.specs.weight],
        ].map(([term, value], i) => (
          <div key={term} className={`py-4 ${i > 0 ? 'border-l border-line pl-4' : ''}`}>
            <dt className="eyebrow">{term}</dt>
            <dd className="mt-1 font-display text-base font-medium tracking-[-0.02em] sm:text-lg">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
});

export default Inspector;
