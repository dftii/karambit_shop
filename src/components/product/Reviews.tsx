import React, { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Star } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useIsOwned } from '../../store/useStore';
import { addReview, useReviews } from './reviewsStore';

const inputClass = 'w-full border border-line bg-paper-2 px-3 py-2.5 text-ink placeholder:text-ink-3 focus:border-ink';

// ─── Formulario: React 19 <form action> + useActionState ─────────────────────────────────
interface ReviewFormState {
  status: 'idle' | 'success' | 'error';
  /** Se incrementa con cada reseña publicada (identifica el aviso de éxito). */
  sentAt: number;
  errors: { author?: string; comment?: string };
  /** Valores a conservar en el formulario tras un error (el éxito lo vacía). */
  values: { author: string; comment: string };
}

const INITIAL_FORM_STATE: ReviewFormState = {
  status: 'idle',
  sentAt: 0,
  errors: {},
  values: { author: '', comment: '' },
};

function submitReview(slug: string, owned: boolean, prev: ReviewFormState, formData: FormData): ReviewFormState {
  const rawAuthor = String(formData.get('author') ?? '');
  const rawComment = String(formData.get('comment') ?? '');
  const author = rawAuthor.trim();
  const comment = rawComment.trim();
  const rating = Math.min(5, Math.max(1, Number(formData.get('rating')) || 5));

  // El atributo `required` ya frena los campos vacíos; esto cubre los que solo tienen espacios.
  const errors: ReviewFormState['errors'] = {};
  if (!author) errors.author = 'Escribe tu nombre o nickname.';
  if (!comment) errors.comment = 'Cuéntanos tu experiencia con el karambit.';
  if (errors.author || errors.comment) {
    return { ...prev, status: 'error', errors, values: { author: rawAuthor, comment: rawComment } };
  }

  addReview(slug, {
    id: `rev-${Date.now()}`,
    author,
    rating,
    date: 'Justo ahora',
    comment,
    // Solo es «compra verificada» si el usuario tiene este producto en sus pedidos.
    verified: owned,
  });
  return { status: 'success', sentAt: prev.sentAt + 1, errors: {}, values: { author: '', comment: '' } };
}

/** Botón de envío: `useFormStatus` lo desactiva mientras la acción está pendiente. */
const SubmitButton: React.FC = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      Enviar reseña
    </Button>
  );
};

/** Selector de estrellas: el estado es local y viaja al formulario en un input oculto. */
const StarPicker: React.FC = () => {
  const [rating, setRating] = useState(5);
  return (
    <div>
      <p className="eyebrow" id="review-rating-label">
        Valoración
      </p>
      <div role="group" aria-labelledby="review-rating-label" className="mt-2 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
            aria-pressed={star === rating}
            className="p-1"
          >
            <Star
              aria-hidden="true"
              className={`h-5 w-5 transition-colors ${star <= rating ? 'fill-ink text-ink' : 'text-line hover:text-ink-3'}`}
            />
          </button>
        ))}
        <span className="ml-2 font-mono text-xs tabular-nums text-ink-2">{rating} / 5</span>
      </div>
      <input type="hidden" name="rating" value={rating} />
    </div>
  );
};

const ReviewForm: React.FC<{ slug: string; productId: string }> = ({ slug, productId }) => {
  const owned = useIsOwned(productId);
  const [state, formAction] = useActionState(
    (prev: ReviewFormState, formData: FormData) => submitReview(slug, owned, prev, formData),
    INITIAL_FORM_STATE
  );
  const authorRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // Aviso "reseña enviada": se oculta solo a los 4 s (temporizador limpiado al desmontar).
  const [hiddenAt, setHiddenAt] = useState(0);
  useEffect(() => {
    if (state.status !== 'success') return;
    const timer = window.setTimeout(() => setHiddenAt(state.sentAt), 4000);
    return () => window.clearTimeout(timer);
  }, [state.status, state.sentAt]);
  const showSuccess = state.status === 'success' && hiddenAt !== state.sentAt;

  // Tras un error, el foco va al primer campo inválido.
  useEffect(() => {
    if (state.status !== 'error') return;
    (state.errors.author ? authorRef : commentRef).current?.focus();
  }, [state]);

  return (
    <form action={formAction} className="border border-line bg-paper-2 p-5 sm:p-6">
      <h3 className="display-md">Publicar tu reseña</h3>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="review-author" className="eyebrow block">
            Nombre o nickname de CS2
          </label>
          <input
            ref={authorRef}
            id="review-author"
            name="author"
            type="text"
            required
            defaultValue={state.values.author}
            aria-invalid={state.errors.author ? true : undefined}
            aria-describedby={state.errors.author ? 'review-author-error' : undefined}
            placeholder="Ej: NiKo, ZywOo, Karrigan"
            className={`${inputClass} mt-2 font-body text-[15px] aria-invalid:border-danger`}
          />
          {state.errors.author && (
            <p id="review-author-error" className="mt-2 font-body text-xs text-danger">
              {state.errors.author}
            </p>
          )}
        </div>

        <StarPicker />

        <div>
          <label htmlFor="review-comment" className="eyebrow block">
            Tu experiencia con el karambit
          </label>
          <textarea
            ref={commentRef}
            id="review-comment"
            name="comment"
            required
            rows={4}
            defaultValue={state.values.comment}
            aria-invalid={state.errors.comment ? true : undefined}
            aria-describedby={state.errors.comment ? 'review-comment-error' : undefined}
            placeholder="Cuéntanos sobre el acabado, el peso, el filo o los grabados..."
            className={`${inputClass} mt-2 resize-none font-body text-[15px] aria-invalid:border-danger`}
          />
          {state.errors.comment && (
            <p id="review-comment-error" className="mt-2 font-body text-xs text-danger">
              {state.errors.comment}
            </p>
          )}
        </div>

        <SubmitButton />
      </div>

      {/* Región en vivo siempre montada: el aviso se anuncia al aparecer */}
      <div role="status" aria-live="polite">
        {showSuccess && (
          <p className="mt-5 border-l-2 border-success pl-3 font-body text-sm text-success">
            Tu reseña se ha publicado en la ficha.
          </p>
        )}
      </div>
    </form>
  );
};

/** Panel de reseñas: lista + formulario. Escribir en el formulario no re-renderiza nada fuera de él. */
export const Reviews: React.FC<{ slug: string; productId: string }> = ({ slug, productId }) => {
  const reviews = useReviews(slug);

  return (
    <>
      <div className="lg:col-span-7">
        <div className="flex items-end gap-4 border-b border-ink pb-4">
          <span className="font-mono text-4xl font-medium leading-none tabular-nums tracking-tight">4.9</span>
          <p className="eyebrow pb-0.5">Basado en {reviews.length} opiniones verificadas</p>
        </div>

        <ul>
          {reviews.map((rev) => (
            <li key={rev.id} className="border-b border-line py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-body text-[15px] font-medium text-ink">{rev.author}</span>
                  {rev.verified && <Badge tone="success">Compra verificada</Badge>}
                </div>
                <span className="eyebrow">{rev.date}</span>
              </div>
              <div className="mt-2 flex items-center gap-0.5" role="img" aria-label={`${rev.rating} de 5 estrellas`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 ${n <= rev.rating ? 'fill-ink text-ink' : 'text-line'}`}
                  />
                ))}
              </div>
              <p className="mt-3 max-w-xl font-body text-[15px] leading-relaxed text-ink-2">{rev.comment}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-5">
        <ReviewForm slug={slug} productId={productId} />
      </div>
    </>
  );
};

export default Reviews;
