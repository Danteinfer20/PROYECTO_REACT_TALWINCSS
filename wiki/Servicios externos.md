---
tags: [integraciones]
actualizado: 2026-09-19
---

# Servicios externos

| Servicio | Para qué | Variable |
|---|---|---|
| **Cloudinary** | todas las imágenes del sitio | `CLOUDINARY_URL` |
| **Google Translate** | traducción en vivo del catálogo | — (librería, sin clave) |
| **OpenAI** | moderación automática de publicaciones | `OPENAI_API_KEY` |
| **Gemini** | presente en el `.env`, sin uso claro en el código | `GEMINI_API_KEY` |

## Cloudinary — el punto único de fallo

**Cuenta: `dnmyy7v0g`.** Verificado el 19-sep-2026 cruzando el `.env` con las URLs guardadas en
la base: de 41 registros de imagen, **40 apuntan a esa cuenta** y el restante es un enlace de
YouTube (video de contenido educativo, normal).

🚨 **No hay copia local de esas imágenes.** `FILESYSTEM_DISK` apunta a Cloudinary y en el
servidor no quedan los originales. Quien controle esa cuenta controla todas las fotos del
sitio: perfiles, portadas, obras y productos. Si la cuenta se cierra o se rotan las
credenciales sin coordinar, **vivelarte.com se queda sin una sola imagen**.

Para saber a qué correo pertenece hay que entrar a `cloudinary.com`: el `Cloud name` figura en
el Dashboard. Si el correo no es del dueño del proyecto, conviene migrar antes de que sea
urgente — son 40 archivos: se bajan, se suben a la otra cuenta y se actualizan las URLs en la
base.

⚠️ El API secret de esta cuenta quedó expuesto en una sesión de trabajo el 19-sep-2026.
**Rotarlo.** Ver [[Seguridad]].

La subida se hace con el trait `app/Traits/UploadsToCloudinary.php`.

## Google Translate

`app/Services/TranslationService.php`. Traduce del español al idioma pedido y **cachea un día**
por texto. No usa clave: va por la librería `stichoza/google-translate-php`, que raspa el
servicio público.

Dos cosas de su diseño que conviene respetar:

- **Nunca lanza.** Atrapa `Throwable` y devuelve el texto original. Una caída del servicio de
  Google no puede tumbar la API.
- **El español no se traduce**: sale por el camino corto antes de tocar la red.

Es el mecanismo que sostiene el bilingüe de productos y categorías, porque la migración a
columnas por idioma nunca corrió — ver [[Base de datos]].

## OpenAI

Modera publicaciones desde `app/Jobs/ModeratePostJob.php`, en cola. La configuración vive en
`config/openai.php` (se movió ahí el 18-sep-2026; estaba en `app/`, donde Laravel no la busca).

⚠️ **No hay `OPENAI_API_KEY` en el `.env` de producción.** O sea que hoy la moderación
automática no puede estar funcionando. Hay que decidir si se configura o se retira.

## Gemini

`GEMINI_API_KEY` existe en el `.env` de producción, pero el código no la usa por ningún lado.
Su único consumidor era `public/list-gemini-models.php`, un script de prueba que además tenía
**la clave escrita a mano en el código** y estaba publicado. Ver [[Seguridad]].

## Enlaces

- Dónde viven estas variables: [[Despliegue]]
- Qué hay que rotar: [[Seguridad]]
