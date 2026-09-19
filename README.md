# Vive el Arte — plataforma cultural de Popayán

Artesanos y artistas publican sus obras y productos, los gestores culturales arman eventos con
venta de entradas y control de acceso por QR, y hay una sección de contenido educativo. El sitio
es bilingüe (español / inglés).

En producción: [vivelarte.com](https://vivelarte.com), sobre hosting compartido de Hostinger.

---

## Cómo está armado

Son **dos aplicaciones en un mismo repositorio**, y conviene tenerlo claro antes de tocar nada:

| | Dónde | Qué es |
|---|---|---|
| **API** | raíz del repo | Laravel 11 · PHP 8.2 · autenticación con Sanctum. Todas las rutas cuelgan de `/api/v1`. |
| **SPA** | `frontend-popayan/` | React 19 · Vite 7 · Tailwind 4 · React Router 7. Tiene su propio `package.json`. |

El `package.json` de la raíz **no tiene dependencias**: solo delega en el del frontend. La carpeta
`frontend-popayan/` es la única que instala paquetes de npm.

### Cómo se sirve en producción

No hay servidor de Node en el hosting. El SPA se compila y sus archivos se copian dentro de
`public/`, que es de donde Apache los sirve; Laravel queda atendiendo únicamente `/api/v1`.
El `.htaccess` de la raíz redirige todo hacia `public/`.

Por eso **el contenido compilado está versionado en git** (`public/assets/`): es lo que se
despliega. Se regenera entero con `npm run build`.

---

## Levantarlo en local

Hacen falta PHP 8.2, Composer, Node y PostgreSQL.

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Completá el `.env` —al menos la base de datos y `CLOUDINARY_URL`— y después:

```bash
php artisan migrate
php artisan serve
```

En otra terminal, el frontend:

```bash
npm run dev
```

La API queda en `http://localhost:8000` y el SPA en `http://localhost:5173`. El cliente de axios
(`frontend-popayan/src/services/api.js`) detecta que está en localhost y apunta solo a la API del
puerto 8000; en producción usa rutas relativas.

### Sobre la base de datos

**Es PostgreSQL, no MySQL.** La migración `2026_05_20_135529_convert_core_text_to_jsonb` convierte
los textos de productos, publicaciones y categorías a columnas `jsonb` con una clave por idioma,
usando sintaxis que solo existe en Postgres. Sobre MySQL esa migración falla y el sitio se queda
sin su estructura bilingüe.

---

## Comandos

```bash
npm run dev      # servidor de desarrollo del SPA (Vite)
npm run build    # compila el SPA y lo publica en public/ — ver scripts/publicar.mjs
npm run lint     # ESLint sobre el frontend
php artisan test # pruebas de PHPUnit
```

`npm run build` corre `scripts/publicar.mjs`, que instala, compila, **borra `public/assets`**
(los nombres llevan hash de contenido, así que sin ese borrado se acumulan los bundles viejos),
copia el resultado a `public/` y actualiza `resources/views/welcome.blade.php`. Está escrito en
Node y no en shell justamente para que corra igual en Windows y en el hosting.

---

## Mapa del código

### API

```
app/Http/Controllers/Api/   30 controladores, uno por recurso
app/Http/Requests/          validación de entrada
app/Http/Resources/         forma de la respuesta JSON
app/Http/Middleware/        admin · verified_creator · checkStatus · set_lang
app/Models/                 modelos de Eloquent
app/Services/               TranslationService (traducción con caché)
app/Exceptions/             ReglaNegocioException — ver abajo
routes/api.php              todas las rutas, agrupadas por nivel de acceso
```

Las rutas están organizadas en cuatro niveles: públicas, autenticadas
(`auth:sanctum` + `checkStatus`), de creadores verificados (`verified_creator`) y de
administración (`admin`).

### Errores: los dos tipos no se tratan igual

`App\Exceptions\ReglaNegocioException` marca los errores **cuyo mensaje sí está escrito para que
lo lea el usuario**: "El evento ha alcanzado su aforo máximo", "Stock insuficiente". El
controlador la atrapa aparte y devuelve ese texto tal cual, con un 409.

Cualquier otra excepción se registra en el log y el usuario recibe un mensaje genérico. **Nunca
se le devuelve `$e->getMessage()` al cliente**: eso le entrega al navegador el error de SQL,
nombres de tablas y rutas del servidor.

Si agregás una validación de negocio, lanzá `ReglaNegocioException`. Si el texto no está pensado
para leerse en pantalla, no va ahí.

### Idiomas

Conviven tres mecanismos y hacen cosas distintas:

1. **`frontend-popayan/src/i18n.js`** — los textos de la interfaz, en el cliente.
2. **Columnas `jsonb`** — el contenido que cargan los usuarios, con una clave por idioma. Los
   accessors que eligen el idioma están en `app/Models/Post.php`.
3. **`app/Services/TranslationService`** — traduce al vuelo con Google Translate y cachea un día.

El idioma viaja en la cabecera `X-Localization` que pone el cliente de axios, y lo aplica el
middleware `SetLanguage`.

### SPA

```
frontend-popayan/src/pages/         una por ruta
frontend-popayan/src/components/    Navbar, Footer, tarjetas, modales
frontend-popayan/src/components/dashboard/   paneles por rol
frontend-popayan/src/context/       ThemeProvider (tema, modo claro/oscuro, idioma)
frontend-popayan/src/services/api.js  instancia de axios con los interceptores
```

`main.jsx` monta los providers globales; `App.jsx` solo declara rutas. **El `ThemeProvider` va
una sola vez**, en `main.jsx`: montarlo también en `App.jsx` crea un segundo provider con su
propio estado y los dos se pelean las clases de `<html>` y `<body>`.
