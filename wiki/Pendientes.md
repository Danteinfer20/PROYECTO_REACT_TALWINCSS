---
tags: [plan]
actualizado: 2026-09-19
---

# Pendientes

## Urgente — seguridad

- [ ] **Rotar la clave de Gemini.** Estuvo publicada en texto plano en una URL pública.
- [ ] **Rotar el API secret de Cloudinary.** Quedó expuesto en una sesión de trabajo.
- [ ] **`APP_ENV=production` y `APP_DEBUG=false`** en el `.env` del servidor, más
      `php artisan config:clear`. Es lo más expuesto que queda. Ver [[Seguridad]].
- [ ] **Averiguar qué comando corre el cron** (hPanel → Avanzado → Cron Jobs) para poder mover
      los 4 scripts que siguen en `public/`.
- [ ] **Desplegar el arreglo de las fugas de excepción.** Está commiteado, no publicado: la API
      en vivo sigue devolviendo errores de SQL al navegador.

## Decisiones abiertas

- [ ] **Qué hacer con la migración `convert_core_text_to_jsonb`.** Adaptarla a MySQL o marcarla
      como no aplicable. Bloquea cualquier despliegue que migre. Ver [[Base de datos]].
- [ ] **De quién es la cuenta de Cloudinary `dnmyy7v0g`.** Si el correo no es del dueño del
      proyecto, migrar las 40 imágenes. Ver [[Servicios externos]].
- [ ] **Traer el `.htaccess` real al repositorio**, para que el despliegue no dependa de un
      archivo que solo existe en el servidor.
- [ ] **OpenAI: configurar o retirar.** No hay clave en producción, así que la moderación
      automática no está funcionando.

## Fases del plan de optimización

- [x] **Fase 0 — Higiene y seguridad.** Clave de OpenAI fuera, 20 fugas cerradas,
      `ReglaNegocioException`, Vite muerto de la raíz eliminado, `scripts/publicar.mjs`,
      `.env.example` y README reales, fallback del SPA en `routes/web.php`.
- [x] **Fase 1 — Cimientos del frontend.** Bundle de 1.675 KB → ~425 KB, `React.lazy` en las
      15 rutas, idiomas bajo demanda, `AuthProvider`, interceptor 401.
- [ ] **Fase 1 bis.** Migrar los 19 archivos que todavía leen `localStorage` directo.
- [ ] **Fase 2 — Cookies.** Sanctum en modo SPA con cookie `httpOnly` (el `config/cors.php` ya
      tiene `supports_credentials: true`), y banner de consentimiento — Ley 1581, los usuarios
      son colombianos.
- [ ] **Fase 3 — Rediseño y responsive.** Empezando por `ArtCard` y `ProductCard`, que son las
      tarjetas de la galería y la tienda y no tienen ni un breakpoint. Ver [[Frontend]].
- [ ] **Fase 4 — Backend fino.** `with()`/`withCount` donde toca, paginación real, sacar el
      `take(12)` de `ArtistController`, usar los Resources ya escritos. Ver [[Backend]].

## Sin empezar

- [ ] **Pruebas.** Hay 3 archivos en `tests/`, los que trae Laravel de fábrica.
- [ ] **ESLint en verde.** ~75 errores, casi todos variables de `catch` sin usar.

## Enlaces

- [[Índice]] · [[Trampas]]
