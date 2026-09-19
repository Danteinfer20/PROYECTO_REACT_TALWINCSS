---
tags: [seguridad, incidente]
actualizado: 2026-09-19
---

# Seguridad

## 🚨 `public/` es la raíz web

Todo archivo `.php` que quede en `public/` **se ejecuta si alguien pide su URL**. No hace falta
que esté enlazado desde ningún lado: basta con adivinar el nombre.

Esto no es una advertencia teórica. Es lo que pasó.

## El incidente del 19-sep-2026

Al entrar por SSH aparecieron **diez scripts sueltos** en `public/`, ninguno de ellos en el
repositorio. Todos ejecutables desde internet:

| URL pública | Qué hacía |
|---|---|
| `/test-env.php` | imprimía la clave de OpenAI en pantalla |
| `/test-exec.php` | `phpinfo()` — toda la configuración del servidor |
| `/list-gemini-models.php` | **clave de Google Gemini escrita en el código fuente** |
| `/composer-install.php` | `exec()` instalando paquetes |
| `/migrar-moderation.php` | `migrate --force` |
| `/publicar-openai.php` | `vendor:publish --force` |
| `/test-worker.php` | `shell_exec()` |
| `/limpiar.php` | `config:clear` + `cache:clear` |
| `/despachar.php` | despachaba trabajos de la cola |
| `/test-moderate.php` | moderaba una publicación |

Más `ejecutar.php` en la raíz del proyecto, que corre **`migrate:fresh --force`**: borra todas
las tablas. Ese no era alcanzable por la regla de Apache (ver [[Despliegue]]) — por casualidad,
no por diseño. Un cambio en el `.htaccess` lo habría vuelto accesible.

**Qué se hizo:** siete se movieron a `~/cuarentena-scripts/`, fuera de la carpeta pública. **No
se borraron.** Verificado después: `/test-env.php`, `/test-exec.php` y `/list-gemini-models.php`
devuelven el SPA en vez de ejecutarse.

**Los cuatro que quedan** (`test-worker.php`, `despachar.php`, `limpiar.php`,
`test-moderate.php`) siguen expuestos, a la espera de saber qué comando corre el cron del
hosting: `test-worker.php` es exactamente lo que un cron llamaría para procesar la cola, y
moverlo a ciegas rompería el procesamiento de trabajos.

> **Regla:** un script de depuración nunca va en `public/`. Si hace falta uno, va fuera del
> alcance web y se corre por SSH, o se escribe como comando de artisan.

## 🚨 `APP_DEBUG=true` y `APP_ENV=local` en producción

Sigue así al 19-sep-2026. Es lo más expuesto que queda.

Con el modo de depuración encendido, **cualquier excepción no controlada muestra la página de
error de Laravel**: rutas del servidor, fragmentos de código y las variables de entorno — lo
que incluye la contraseña de la base de datos y las claves de los servicios.

Hay que ponerlo en `production` / `false` y correr `php artisan config:clear`.

## Claves a rotar

- **Gemini** — estuvo publicada en texto plano en una URL pública. Darla por comprometida.
- **Cloudinary** — el API secret quedó expuesto en una sesión de trabajo. Ver [[Servicios externos]].

## Lo que sí se arregló en el código

El 18-sep-2026 se cerraron **20 fugas de excepción** en 11 controladores: devolvían
`$e->getMessage()` al navegador, o sea el error de SQL, los nombres de las tablas y las rutas
del servidor. `VisitorDashboardController` agregaba hasta el número de línea.

Ahora cada fallo se registra con `Log::error` y el usuario recibe un mensaje genérico. Los siete
mensajes que **sí** eran para el usuario (aforo lleno, stock insuficiente) se separaron en
`ReglaNegocioException` — ver [[Backend]].

⚠️ **Ese arreglo todavía no está desplegado.** Hasta que se publique, la API en vivo sigue
filtrando.

## Enlaces

- Por qué `public/` funciona así: [[Despliegue]]
- Los errores del lado servidor: [[Backend]]
- Qué falta hacer: [[Pendientes]]
