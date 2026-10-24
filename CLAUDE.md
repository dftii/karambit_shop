# CLAUDE.md — KRM—GG / karambit_shop

Tienda fan-made de karambits (CS2, inspirada en knify.gg). Repo público: https://github.com/dftii/karambit_shop — **GitHub es la fuente de verdad**.

## Reglas del proyecto (no negociables)
1. **Pasarela de pagos 100% simulada.** Nada de formularios de envío físico, direcciones ni entregas. Todo es digital.
2. **Mantener e impulsar la colección "Founder Bespoke — DuFiTuFi Design (CEO)"** (`/founders-vault`, piezas 1-de-1) y la temática knify.gg / CS2.

## Preferencias del usuario
- Responder en español.
- Modelos: Opus para planear/auditar; subagentes Sonnet (esfuerzo alto) para tareas complejas, Haiku (esfuerzo alto) para simples.
- Flujo git: `git pull` → cambios → `git add . ; git commit -m "..." ; git push`. Subir a GitHub al terminar cuando lo pida.
- La web solo vende: **no** hay Mystery Boxes ni StatTrak Lab (eliminados a propósito). La personalización (StatTrak™, NameTag, soporte, funda) vive en la ficha de producto con vista previa del grabado.
- No quiere el look "plantilla de IA" (degradados, glow, glassmorphism, amarillo/ámbar, emojis).

## Stack
React 19 · Vite 8 · TypeScript · Tailwind 4 (tokens en `@theme` de `src/index.css`) · Zustand 5 (persist con `version`/`migrate`) · framer-motion · react-router-dom 7 (rutas lazy) · lucide-react · oxlint.

Comandos: `npm run dev` (http://localhost:5173) · `npm run build` (incluye `tsc -b`) · `npm run lint`.

## Diseño — "Editorial claro" (ver `docs/DESIGN.md`)
- Paleta: paper `#ECE6DD`, ink `#111`, acento único pink `#FF2E7E` (pink-ink `#E0186A`, pink-soft `#FFE3EE`), líneas `#D2C8BC`.
- Tipos: Bricolage Grotesque (display), Geist (texto), Geist Mono (precios/datos), Instrument Serif cursiva como acento puntual.
- Esquinas rectas, reglas de 1px, sin sombras/blur/degradados. La banda Founder va en `bg-ink text-paper` con acento rosa.
- Componentes base en `src/components/ui/*` (Button, Badge, Price, Modal, Drawer).

## Mapa rápido
- Rutas (`src/App.tsx`): `/`, `/shop`, `/founders-vault`, `/product/:slug`, `/bundles` (`/packs` redirige), `/checkout`, `/order-success/:id`, `/orders`, `*` 404.
- Estado: `src/store/useStore.ts` (carrito, wishlist, saldo virtual, pedidos; `placeOrder`). Datos: `src/data/karambits.ts`.
- Lógica: `src/lib/` (pricing, cart, payment simulado con Luhn, format, bundles, coupons). Los cupones nunca se aplican a piezas Founder ni al Founder's Vault Pack.
- Ficha de producto: `src/components/product/` (`useConfigurator` compartido con el modal de vista rápida, Inspector, Configurator, PurchaseBar, DetailTabs, Reviews).
- Modo Vault: las 4 piezas Founder (`isFounderPiece` en `src/lib/productDisplay.ts`) se muestran en oscuro en tarjetas, lista, ficha (banda superior) y vista rápida. Tono vía `VaultToneContext` (`src/components/ui/vaultTone.ts`); con tono claro, las clases son las de siempre.

## Despliegue (GitHub Pages)
- Web pública: https://dftii.github.io/karambit_shop/ — se publica sola en cada push a `main` (`.github/workflows/deploy.yml`, Settings → Pages → Source = GitHub Actions).
- `base` de Vite viene de `BASE_PATH` (solo en el workflow). Rutas de `public/` en código: siempre con `import.meta.env.BASE_URL`; el router usa `basename`. `404.html` = copia de `index.html` (deep links).
- Stripe en modo prueba es opcional: solo aparece si `VITE_STRIPE_PUBLISHABLE_KEY` empieza por `pk_test_` (`.env.local` en local, variable de Actions en Pages). Nunca claves `pk_live_`.

## Pendiente
- **Descartado por el usuario (no volver a proponer):** arrastrar para girar/mover, visor 3D, brillo/destellos superpuestos sobre las imágenes y retocar las imágenes Founder; se probaron y se volvió a esta versión. Las imágenes de Steam son 512×384 de origen (no hay más resolución).
- NAVI y FaZe son ediciones inventadas: usan imágenes reales de Lore (Battle-Scarred) y Crimson Web (Field-Tested) de Steam, que se parecen a esos productos del catálogo.
