# KRM—GG · Sistema de diseño

Editorial claro con un único acento rosa. Papel cálido, tinta negra, rejilla con filas de 1px.
Referencia viva: `src/pages/HomePage.tsx`. Tokens y utilidades: `src/index.css`.

## Principios

- Una sola idea de color: **tinta sobre papel, rosa solo para acento** (hover, índice, palabra serif, punto de estado).
- Estructura visible: bordes de 1px (`border-line`) entre celdas, secciones numeradas (`01 — Catálogo`).
- Aire generoso, tipografía grande, cero decoración.
- **No**: degradados, glow, `backdrop-blur`, sombras (salvo overlays), emoji, pulsos/animaciones infinitas
  (excepto el ticker), neón, esquinas redondeadas, titulares en MAYÚSCULAS, badges grandes de color.

## Tokens (Tailwind `@theme`)

| Token | Valor | Uso |
|---|---|---|
| `paper` | `#F3EFEA` | Fondo de página |
| `paper-2` | `#FBF9F6` | Superficies elevadas (modal, drawer, cards sobre papel) |
| `tile` | `#E9E3DB` | Fondo de imagen de producto |
| `ink` | `#111111` | Texto principal, bordes fuertes, botón primario, banda vault |
| `ink-2` | `#57524C` | Texto secundario |
| `ink-3` | `#8C857D` | Texto atenuado, placeholders, etiquetas |
| `line` | `#D9D2C9` | Bordes de 1px |
| `line-strong` | `#111111` | Bordes marcados (= ink) |
| `pink` | `#FF2E7E` | Acento (fondos, filetes, puntos, hover) |
| `pink-ink` | `#E0186A` | Acento como **texto** sobre papel (mejor contraste) |
| `pink-soft` | `#FFE3EE` | Fondo suave de acento, selección |
| `success` / `danger` | `#1E7F4F` / `#C8102E` | Estados |

Utilidades: `bg-paper`, `text-ink-2`, `border-line`, `bg-pink`, `text-pink-ink`, `bg-tile`…
Banda invertida "vault": `bg-ink text-paper`, bordes `border-paper/20`, acento `text-pink`.

### Alias legacy (solo para páginas sin migrar; no usar en código nuevo)

`krm-bg`/`krm-bg-deep`→paper · `krm-surface`/`krm-panel`/`krm-card*`→paper-2 · `krm-border`/`krm-border-soft`→line ·
`krm-border-strong`→ink · `krm-hover`→tile · `krm-accent`→pink · `krm-accent-dark`/`krm-accent-hot`→pink-ink ·
`font-tech`→mono. Los radios (`rounded-*`), sombras (`shadow-*`) y blur (`blur-*`, `backdrop-blur-*`) de Tailwind
están neutralizados a 0 en `@theme`, así que el código antiguo sale cuadrado y plano automáticamente.
Clases CSS legacy restantes (solo para `KarambitVFXImage` sin `plain`): `animate-sparkle-twinkle`, `animate-shimmer-sweep`, `animate-bespoke-levitate`. En código nuevo usar siempre `<KarambitVFXImage plain>`.

## Tipografía (Google Fonts en `index.html`)

| Token | Fuente | Uso |
|---|---|---|
| `font-display` | Bricolage Grotesque | Titulares, frase normal, tracking −0.02…−0.045em |
| `font-body` | Geist | Texto corrido, UI, botones |
| `font-mono` | Geist Mono | Etiquetas mini en mayúsculas, precios, SKU/serial, índices 01/02 |
| `font-serif` | Instrument Serif (cursiva) | 1–2 palabras de un titular, con `.serif-accent` |

Escala (utilidades definidas en `index.css`):

| Clase | Tamaño | Uso |
|---|---|---|
| `display-hero` | clamp 3rem → 7.75rem | Solo H1 de portada |
| `display-xl` | clamp 2.5rem → 5.25rem | H1 de página / titular de banda |
| `display-lg` | clamp 1.9rem → 3.25rem | H2 de sección |
| `display-md` | clamp 1.4rem → 1.875rem | H3, pasos |
| `eyebrow` | 11px mono, mayúsculas, +0.08em, `ink-3` | Índices de sección, metadatos |
| `serif-accent` | serif cursiva 1.08em | `Karambits de <span className="serif-accent text-pink-ink">colección</span>.` |
| `wrap` | max 1320px, gutter 16/24/32 | Contenedor de página |

Texto corrido: `font-body text-[15px]–text-lg leading-relaxed text-ink-2`. Los `h1–h4` ya heredan display/600.

## Componentes

- **Button** (`ui/Button`, `buttonClasses()` para `<Link>`): `primary` tinta sólida → hover rosa (texto ink, por contraste);
  `secondary` borde ink transparente → hover relleno ink; `ghost`; `danger` borde rojo; `link` subrayado → rosa.
  Tamaños `sm|md|lg|icon`. Cuadrados, sentence case, sin sombra. Foco global: outline 2px rosa, offset 2px.
- **Badge**: punto de color (6px) + etiqueta mono en mayúsculas. `tone` (`pink|success|danger|ink|neutral`) o `color` libre (rareza:
  `rarityColors[product.rarity]`). Sin fondo ni borde.
- **Price**: mono, tabular. `tone` `ink|pink|success|muted`; `strike` para precio original.
- **Modal / Drawer**: panel `bg-paper-2` + `border-line` + `shadow-overlay`, telón `bg-ink/30` sin blur; entrada opacidad + 12px.
  Drawer entra con translate lineal 280ms. Cabeceras propias: título display, cierre como texto/icono con borde.
- **Toaster**: fondo ink, texto paper, filete izquierdo 3px rosa (error: rojo), etiqueta mono arriba.
- **Tarjeta de producto**: celda de rejilla (`border-r border-b border-line`), imagen sobre `bg-tile` cuadrado
  (`<KarambitVFXImage plain …/>`), etiquetas de estado como chips cuadrados `bg-paper` mono, rareza con Badge, nombre en
  `font-body 15px medium` (hover: subrayado rosa), precio en mono. Hover: imagen `scale-[1.03]`; la tarjeta no se mueve.
  El contenedor de la tarjeta lleva `group`; `QuickViewButton` (barra ink inferior) va dentro del tile `relative overflow-hidden`.
- **Cabecera de sección**: `<p className="eyebrow">01 — Catálogo</p>` + `<h2 className="display-lg">` + regla `border-b border-line`.
- **Banda vault**: sección `bg-ink text-paper`, titular `display-xl` con una palabra `serif-accent text-pink`, filas con `border-paper/20`.
- **Navbar/Footer**: `components/Navbar.tsx`, `components/Footer.tsx`, marca `components/Wordmark.tsx` ("KRM—GG", la raya es rosa).
- **Formularios** (guía para páginas): input `border border-line bg-paper-2 px-3 py-2.5 text-ink placeholder:text-ink-3
  focus:border-ink`, label en `eyebrow`, error en `text-danger` con borde `danger`.

## Movimiento

Opacidad + 8–12px de desplazamiento, 200–300ms, `ease-out`. `MotionConfig reducedMotion="user"` ya está en App; el CSS global
reduce animaciones con `prefers-reduced-motion`. Único bucle permitido: el ticker (`.krm-marquee` + `.krm-marquee-track`),
que se detiene con reduced-motion y al pasar el ratón.

## Checklist para migrar una página

1. Sustituir fondos/bordes: `bg-krm-*`→`bg-paper|paper-2|tile`, `border-krm-border`→`border-line`, `text-white|gray-*`→`text-ink|ink-2|ink-3`,
   `text-krm-accent|amber-*`→`text-pink-ink` (texto) o `bg-pink` (relleno); eliminar `style={{background:'#…'}}` y degradados.
2. Quitar `uppercase` y `font-black` de titulares; usar `display-*` + `serif-accent` (1–2 palabras). Etiquetas mini: `eyebrow`.
3. Precios con `<Price>` (mono); números/serial/SKU en `font-mono`; quitar `font-tech`.
4. Eliminar `rounded-*`, `shadow-*`, `blur`, `backdrop-blur`, glows, `animate-pulse/ping/bounce/spin`, emoji e iconos decorativos de relleno.
5. Cabeceras numeradas (`SectionHead`) y rejilla con reglas de 1px en vez de cards flotantes; contenedor `wrap`.
6. Botones con `buttonClasses()`/`<Button>`; rareza/estado con `<Badge>`; imágenes de producto con `<KarambitVFXImage plain>` sobre `bg-tile`.
7. Cada `<main id="main" tabIndex={-1}>` sin `min-h-screen`/fondo propio (el fondo lo pone App); padding vertical `py-12 sm:py-20`.
8. En grids usa `grid-cols-1` explícito antes de `lg:grid-cols-12` (evita desbordes en móvil). Verifica 375px sin scroll horizontal.
9. No cambiar lógica (store, precios, carrito, checkout). Pasarela siempre simulada; sin formularios de envío.
