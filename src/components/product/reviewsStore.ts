import { useSyncExternalStore } from 'react';

// ─── Reseñas por producto: almacén mínimo con persistencia en localStorage ──────────────────
// Lo comparten la cabecera ("n reseñas"), las pestañas y el formulario; así ninguno tiene que
// vivir en el estado de la página. Clave de almacenamiento: `krm-reviews-<slug>`.

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Alejandro "S1mple_Fan" M.',
    rating: 5,
    date: 'Hace 3 días',
    comment:
      'La réplica es idéntica al modelo in-game de CS2. El acabado y el brillo tienen una profundidad brutal. El peso de 210 g se siente muy equilibrado para hacer trucos.',
    verified: true,
  },
  {
    id: 'rev-2',
    author: 'Carlos G. (Global Elite)',
    rating: 5,
    date: 'Hace 1 semana',
    comment:
      'El grabado de StatTrak en la hoja quedó perfecto con mis 3 dígitos. La pedí sin filo y la calidad del acero 440C es de 10. Muy recomendada.',
    verified: true,
  },
  {
    id: 'rev-3',
    author: 'Víctor "KennyS" R.',
    rating: 5,
    date: 'Hace 2 semanas',
    comment:
      'La placa NameTag metálica atornillada en el mango le da un toque de coleccionista único. El certificado digital y el número de serie quedaron registrados al instante.',
    verified: true,
  },
];

const storageKey = (slug: string) => `krm-reviews-${slug}`;

function loadReviews(slug: string): Review[] {
  try {
    const stored = localStorage.getItem(storageKey(slug));
    if (stored) return JSON.parse(stored) as Review[];
  } catch {
    // almacenamiento no disponible o JSON corrupto: se usan las reseñas por defecto
  }
  return DEFAULT_REVIEWS;
}

// La caché mantiene estable la referencia del array (requisito de useSyncExternalStore).
const cache = new Map<string, Review[]>();
const listeners = new Set<() => void>();

export function getReviews(slug: string): Review[] {
  let reviews = cache.get(slug);
  if (!reviews) {
    reviews = loadReviews(slug);
    cache.set(slug, reviews);
  }
  return reviews;
}

/** Añade una reseña al principio, la persiste y avisa a los suscriptores. */
export function addReview(slug: string, review: Review): void {
  const updated = [review, ...getReviews(slug)];
  cache.set(slug, updated);
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(updated));
  } catch {
    // sin almacenamiento: la reseña vive solo en memoria durante la sesión
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Reseñas del producto, reactivas a `addReview`. */
export function useReviews(slug: string): Review[] {
  return useSyncExternalStore(
    subscribe,
    () => getReviews(slug),
    () => getReviews(slug)
  );
}
