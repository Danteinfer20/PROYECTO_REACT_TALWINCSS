---
tags: [backend, api]
actualizado: 2026-09-19
---

# Backend

Laravel 11, PHP 8.2. 30 controladores en `app/Http/Controllers/Api/`, ~6.100 líneas.

```
app/Http/Requests/     validación de entrada
app/Http/Resources/    forma de la respuesta JSON
app/Http/Middleware/   admin · verified_creator · checkStatus · set_lang
app/Services/          TranslationService
app/Exceptions/        ReglaNegocioException
app/Jobs/              ModeratePostJob
app/Traits/            UploadsToCloudinary
```

## 🚨 Los dos tipos de error no se tratan igual

`App\Exceptions\ReglaNegocioException` marca los errores **cuyo mensaje sí está escrito para que
lo lea el usuario**: «El evento ha alcanzado su aforo máximo», «Stock insuficiente», «Esta orden
ya ha sido procesada». El controlador la atrapa aparte y devuelve ese texto tal cual, con
un **409**.

Cualquier otra excepción se registra con `Log::error` y el usuario recibe un mensaje genérico.
**Nunca se devuelve `$e->getMessage()` al cliente.**

> Si agregás una validación de negocio, lanzá `ReglaNegocioException`. Si el texto no está
> pensado para leerse en pantalla, no va ahí.

Esto vino de un arreglo real: 20 bloques `catch` en 11 controladores devolvían el error crudo al
navegador. Pero **7 de esos mensajes sí eran para el usuario** y viajaban como
`throw new \Exception`. Aplastarlos a todos habría roto mensajes que la gente necesita leer —
de ahí la clase aparte. Ver [[Seguridad]].

## Deudas de consulta

Medido el 18-sep-2026, sin arreglar todavía:

- **15 de los 30 controladores no tienen un solo `with()`.** N+1 asegurado en `ArtistController`,
  `CommentController`, `NotificationController`, `VisitorDashboardController`.
- **22 `->get()` contra 3 `paginate()`.**
- 🐛 **`ArtistController::index` tiene un `->take(12)` fijo.** La página de Artesanos nunca va a
  mostrar el artesano número 13. No es lentitud: es una función rota.
- `ArtistResource` está escrito y bien, pero `index()` devuelve el modelo crudo sin usarlo. Y
  `posts_count` nunca se carga con `withCount`, así que `statistics.published_posts` daría 0.

## Idioma del lado servidor

El middleware `SetLanguage` corre en **todas** las rutas de la API. Lee la cabecera
`X-Localization` que manda el cliente de axios, valida contra `['es','en']` y aplica el locale.

De ahí lo toma `TranslationService` — ver [[Servicios externos]].

## Entrega del SPA

`routes/web.php` tiene un catch-all que devuelve `view('welcome')` para cualquier ruta que no
empiece por `api`. Es lo que hace que `/tienda` o `/artesanos/juan` funcionen al recargar o al
abrir un enlace compartido.

Se agregó el 18-sep-2026. Antes funcionaba solo por una regla de Apache que **no está en el
repositorio** — ver [[Despliegue]].

## Enlaces

- Qué consume esta API: [[Frontend]]
- Dónde guarda: [[Base de datos]]
- El historial de fugas: [[Seguridad]]
