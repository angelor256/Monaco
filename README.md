# Monaco Studio — reservas online

Web app (PWA) de reservas para Monaco Studio. HTML/CSS/JS sin build: se publica tal cual en GitHub Pages.

- `index.html` — Inicio: hero, servicios destacados, horarios, testimonios
- `servicios.html` — catálogo con precios, duración y botón de reserva por servicio
- `citas.html` — reserva en 4 pasos: servicio → barbero → fecha/hora → datos
- `equipo.html` — barberos, filosofía y galería
- `contacto.html` — mapa, contacto, redes y preguntas frecuentes
- `cuenta.html` / `admin.html` — área de clientes y panel del dueño
- `js/shared.js` — header, footer y menú móvil compartidos; `js/data.js` — datos (demo)

## Modo demo
Hoy los datos viven en `localStorage` (`js/data.js`). Toda la app usa solo `window.MonacoDB`, así que pasar a un backend real
(Supabase/Firebase) es reemplazar ese archivo manteniendo las mismas funciones async.
Accesos demo: dueño `admin@monaco.demo` / `monaco123` · cliente `matias@demo.com` / `demo1234`.
Las contraseñas del demo son texto plano en el navegador; no usar en producción.

## Pendiente para producción
Backend + Auth real con reglas por usuario, Web Push (el `sw.js` ya tiene los handlers), logo en imagen (hoy es wordmark en texto), fotos reales.

Precios en colones costarricenses (₡). Los valores del catálogo son de ejemplo; el dueño los edita en Panel → Servicios.
