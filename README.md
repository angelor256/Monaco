# Monaco Studio — reservas online

Web app (PWA) de reservas para Monaco Studio. HTML/CSS/JS sin build: se publica tal cual en GitHub Pages.

- `index.html` — web pública + asistente de reserva (servicio → día/hora → confirmar)
- `cuenta.html` — clientes: reservas, perfil/preferencias, avisos, ayuda
- `admin.html` — dueño: agenda (confirmar/cancelar/completar/ausente), clientes, servicios, avisos, horarios y ajustes

## Modo demo
Hoy los datos viven en `localStorage` (`js/data.js`). Toda la app usa solo `window.MonacoDB`, así que pasar a un backend real
(Supabase/Firebase) es reemplazar ese archivo manteniendo las mismas funciones async.
Accesos demo: dueño `admin@monaco.demo` / `monaco123` · cliente `matias@demo.com` / `demo1234`.
Las contraseñas del demo son texto plano en el navegador; no usar en producción.

## Pendiente para producción
Backend + Auth real con reglas por usuario, Web Push (el `sw.js` ya tiene los handlers), logo en imagen (hoy es wordmark en texto), fotos reales.
