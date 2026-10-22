/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Clave publicable de Stripe en modo prueba (`pk_test_...`). Opcional: sin ella no aparece el método Stripe. */
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
