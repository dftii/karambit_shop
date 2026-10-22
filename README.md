# KRM—GG · Karambit Shop

Tienda fan-made de réplicas de karambit inspirada en Counter-Strike 2 y en knify.gg. La web solo vende: catálogo, ficha de producto con personalización, packs, carrito y un checkout **100 % simulado**. Todo es digital, así que no hay formularios de dirección ni envíos.

## Qué tiene la web

### Catálogo
39 karambits (35 de catálogo + 4 piezas Founder) y accesorios (soportes y fundas), con buscador, filtros, lista de deseos y vista rápida.

- **Doppler y Gamma Doppler:** Ruby, Sapphire, Black Pearl, Emerald y fases.
- **Clásicos:** Case Hardened (Blue Gem), Fade, Marble Fade, Tiger Tooth, Lore, Crimson Web, Slaughter, Autotronic…
- **Gama táctica:** Damascus Steel, Black Laminate, Urban Masked, Boreal Forest, Safari Mesh…
- **Ediciones especiales:** NAVI Champions y FaZe Clan.

### Founder Bespoke — DuFiTuFi Design (CEO)
Colección de cuatro piezas 1-de-1 con página propia (`/founders-vault`) y certificado de autenticidad:

| Pieza | Precio |
|---|---|
| Imperial Celestial Pink Diamond & Californium | 24.990 € |
| Diamond Sovereign (18K White Gold & VVS1) | 9.990 € |
| 24K Solid Gold & Gibeon Meteorite | 4.990 € |
| Royal Blood Ruby & Platinum 950 | 2.490 € |

### Ficha de producto
- Condición *Factory New* o *Battle-Scarred*.
- Hoja con filo o sin filo (para *flipping*).
- Grabado **StatTrak™** y placa **NameTag** con vista previa sobre la imagen.
- Extras: soporte y funda.
- Inspección: zoom a hoja o mango, giro de 45° y volteo.

### Packs coleccionista (`/bundles`)
Packs con descuento (Táctico CS2, Doppler Trinity, Pro Esports Legends, Yin & Yang, Starter Collector) y el Founder's Vault Luxury Pack con las cuatro piezas Founder.

### Carrito, checkout y pedidos
- Carrito lateral con cupones de prueba (`KNIFY10`, `CS2PRO`, `STATTRAKFREE`).
- Pago simulado con tarjeta (validación Luhn), Bizum / Apple Pay, skins de Steam, cripto o saldo virtual. Opcionalmente, tarjeta de prueba de Stripe (ver más abajo).
- Confirmación con número de serie por unidad.
- "Mis pedidos" guarda el historial en el navegador (`localStorage`).

## Pagos con Stripe (modo prueba)
Es **opcional**. Por defecto no aparece y la web no contacta con Stripe. Si lo activas, el checkout añade el método «Stripe (modo prueba)»: un campo de tarjeta de Stripe donde se usa la tarjeta de prueba `4242 4242 4242 4242` con cualquier fecha futura y CVC. No hay backend ni se crea ningún cobro: Stripe solo valida la tarjeta de prueba y el pedido sigue pasando por la pasarela simulada (en el pedido se guardan marca y últimos 4 dígitos). Nunca se mueve dinero real.

1. Crea una cuenta gratuita en [stripe.com](https://stripe.com) y entra en el modo de prueba (Sandbox / Test mode).
2. Copia la clave publicable de prueba: Developers → API keys → `pk_test_...`.
3. En local: copia `.env.example` a `.env.local` y pon `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`; reinicia `npm run dev`.
4. En GitHub Pages: Settings → Secrets and variables → Actions → pestaña **Variables** → nueva variable `VITE_STRIPE_PUBLISHABLE_KEY` (el workflow `deploy.yml` ya la pasa al build). Vuelve a desplegar.

Las claves publicables son públicas por diseño (acaban en el JavaScript de la web), pero **nunca pongas claves secretas (`sk_...`)**. Solo se aceptan claves `pk_test_`: una clave `pk_live_` se rechaza y el método no aparece. Stripe.js se carga bajo demanda, solo al elegir este método.

## Tecnologías

| | |
|---|---|
| UI | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Estilos | Tailwind CSS 4 (tokens en `@theme` de `src/index.css`) |
| Rutas | React Router 7 con páginas cargadas en diferido |
| Estado | Zustand 5 con `persist` en `localStorage` (carrito, wishlist, saldo, pedidos) |
| Animación | Framer Motion (respeta `prefers-reduced-motion`) |
| Iconos | Lucide React |
| Lint | oxlint |

## Diseño
Estilo "editorial claro": papel `#ECE6DD`, tinta `#111` y un único acento rosa `#FF2E7E`. Tipografías Bricolage Grotesque, Geist, Geist Mono e Instrument Serif. Esquinas rectas, reglas de 1px y nada de degradados, sombras ni glow. La guía completa está en [`docs/DESIGN.md`](docs/DESIGN.md).

## Arrancar el proyecto

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # comprobación de tipos + build de producción
npm run lint
```

## Estructura

```
src/
  pages/        Rutas: inicio, catálogo, Founder's Vault, producto, packs, checkout, pedidos
  components/   Navbar, Footer, drawers, tarjetas; ui/ (Button, Badge, Price, Modal, Drawer),
                checkout/ (paneles de pago) y founder/ (vitrina y certificado)
  lib/          Precios, carrito, pago simulado, packs, formato
  store/        Estado global (useStore.ts)
  data/         Catálogo (karambits.ts)
docs/DESIGN.md  Sistema de diseño
```

## Nota
Proyecto fan-made sin afiliación con Valve. Las marcas, nombres de skins y diseños del karambit pertenecen a Valve Corporation. Ningún pago es real.
