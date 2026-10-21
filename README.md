# ⚔️ KRM.GG — Karambit Shop

¡Buenas! Este es mi proyecto web dedicado al cuchillo más icónico de la historia de Counter-Strike: el **Karambit**. 

La idea detrás de esta página no era hacer una tienda aburrida y corriente, sino montar una **experiencia interactiva completa para fanáticos de CS2 y coleccionistas**. Una web donde puedas ver, personalizar, abrir cajas y coleccionar réplicas de Karambits a escala 1:1 como si estuvieras dentro del propio juego (o en una joyería de lujo).

---

## 🌟 ¿Qué tiene la web?

### 🗡️ 1. Un Catálogo Enorme (+25 Karambits)
Modelos con acabados fieles a las skins oficiales de Valve y CS2:
- **Serie Doppler:** Ruby, Sapphire, Black Pearl, Emerald, Phase 1, 2, 3 y 4.
- **Skins de Leyenda:** Case Hardened (Blue Gem Tier 1), Fade 100%, Tiger Tooth, Lore, Crimson Web, Slaughter...
- **Gama Táctica y Militar:** Damascus Steel, Autotronic, Black Laminate, Urban Masked, Boreal Forest...

### 💎 2. Colección Founder Bespoke (Joyería 1:1 de DuFiTuFi CEO)
Cuatro piezas extremas de alta joyería única (1-of-1) firmadas por el creador:
- **Imperial Celestial Pink Diamond & Californium (24.990€):** La joya cumbre con 680 diamantes rosas Argyle VVS1, platino y núcleo de meteorito. ¡Lleva una etiqueta exclusiva holográfica animada!
- **Diamond Sovereign (9.990€):** Oro blanco de 18K con pavé de diamantes puros.
- **24K Solid Gold & Gibeon Meteorite (4.990€):** Oro macizo con patrones Widmanstätten de meteorito prehistórico.
- **Royal Blood Ruby & Platinum 950 (2.490€):** Platino puro espejo con rubíes birmanos sangre de paloma.

### 🛠️ 3. Personalizador e Inspector 360° en Tiempo Real
En la página de detalle de cada cuchillo puedes toquetear de todo:
- **Elegir condición:** *Factory New* (impecable) o *Battle-Scarred* (con desgaste y pátina de combate).
- **Tipo de filo:** Hoja con filo real o sin filo (pensada para hacer *tricks* y *flipping* seguro sin cortarte).
- **StatTrak™ en vivo:** Escribe el número de bajas que quieras y mira cómo se graba con LEDs naranjas directamente sobre la hoja curva.
- **NameTag personalizada:** Pon tu alias, clan o frase y mírala grabada en la placa metálica del mango.
- **Modos de inspección:** Haz zoom a la hoja, al mango o dale la vuelta (*flip*) para ver la otra cara.

### 📦 4. Simulador de Mystery Boxes (Ruleta CS2)
Para picarte un rato abriendo cajas:
- Ruleta horizontal que gira con desaceleración idéntica a la animación del juego.
- Tira de cuchillos continua con diferentes rarezas (Covert, Classified, Mil-Spec, Bespoke...).
- Modal de premio con efectos de confeti y opción de añadir el cuchillo ganado directo a tu arsenal.

### 🔬 5. StatTrak™ Lab
Un laboratorio interactivo para probar cómo quedan los grabados digitales y personalizaciones sobre cualquier Karambit antes de decidirte.

### ✨ 6. Efectos Visuales (VFX) de Alta Joyería
Las imágenes de los cuchillos no son fotos estáticas:
- **Contornos y auras de luz:** Resplandores multicapa que abrazan la silueta exacta de cada cuchillo según su rareza o gema.
- **Destellos VVS1 interactivos:** Estrellas de 4 puntas centelleando sobre los diamantes y el filo.
- **Shimmer Sweep:** Un haz de luz diagonal que cruza la hoja periódicamente.
- **Levitación suave:** Los modelos fundadores flotan suavemente en pantalla.

### 💳 7. Carrito, Checkout Simulado y "Mi Arsenal"
- Carrito lateral deslizante (*drawer*).
- Proceso de pago simulado (tarjeta, PayPal, skins de Steam o cripto) **sin formularios molestos de dirección física ni envíos**, porque todo es una experiencia digital inmediata.
- Pantalla de confirmación con número de serie único para cada cuchillo.
- Sección **"Mis Pedidos / Arsenal"** donde quedan guardados todos tus cuchillos en tu navegador (`localStorage`).

---

## 💻 Tecnologías que he utilizado

- **React + TypeScript:** Para que todo funcione rápido y sin sustos de tipos.
- **Vite:** Como bundler ultrarrápido.
- **Tailwind CSS:** Para el diseño oscuro, moderno, con toques de cristal (*glassmorphism*) y tipografías gamer (*Rajdhani*, *Orbitron*, *Inter*).
- **Framer Motion:** Para todas las animaciones fluidas, transiciones de rutas y la ruleta.
- **Zustand + LocalStorage:** Para gestionar el carrito, la lista de deseos (*wishlist*) y el historial de pedidos sin necesidad de bases de datos externas.
- **Lucide React:** Iconos limpios para toda la interfaz.
- **Sharp (Node.js):** Procesamiento y recorte algorítmico de imágenes PNG con fondos transparentes y de-fringing de bordes.

---

## 📌 Nota

*Este proyecto es un tributo fan-made para la comunidad de Counter-Strike. Todas las marcas, nombres de skins y diseños del Karambit pertenecen a Valve Corporation.*
