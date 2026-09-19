---
tags: [infraestructura, despliegue]
actualizado: 2026-09-19
---

# Despliegue

Hosting compartido de **Hostinger**. Verificado por SSH el 19-sep-2026.

| Dato | Valor |
|---|---|
| Servidor | `br-asc-web1897.main-hosting.eu` |
| IP / puerto SSH | `82.25.72.226` : `65002` |
| Usuario | `u181234358` |
| Ruta del proyecto | `~/domains/vivelarte.com/public_html/` |
| PHP | 8.3.33 |
| Disponible | `composer`, `git` |
| **NO disponible** | **`node`, `npm`** |

## 🚨 El servidor no tiene Node

De ahí sale casi todo lo demás. **El SPA se compila en tu máquina y se sube ya compilado.**
No hay forma de correr `vite build` allá.

Por eso el resultado del build (`public/assets/`) **está versionado en git**: es lo que se
despliega. Se regenera entero con `npm run build`, que corre `scripts/publicar.mjs`.

## 🚨 En el servidor NO hay repositorio git

`public_html/` no tiene `.git`. Los archivos llegaron subidos a mano, por el Administrador de
archivos o por FTP. Consecuencia: **no se puede hacer `git pull` allá**. Desplegar es copiar
archivos.

Eso explica el desfase que se encontró el 18-sep-2026: producción servía un bundle
(`index-CNH8XbCN.js`) que **nunca se commiteó**. Alguien compiló y subió sin pasar por el
repositorio. El build que estaba en git era más viejo que el que estaba vivo.

> **Regla que evita que vuelva a pasar:** compilar siempre con `npm run build`, commitear el
> resultado, y recién entonces subir. Nunca subir un build que no esté en git.

## El `.htaccess` del servidor NO es el del repositorio

En el repo hay uno de 4 líneas. En el servidor hay otro, de 429 bytes, que es el que de verdad
hace funcionar el sitio:

```apache
DirectoryIndex index.html index.php          # React gana sobre Laravel
RewriteRule ^assets/(.*)$ public/assets/$1   # puente directo a los assets
RewriteCond %{REQUEST_URI} !^/public/        # corta la recursión
RewriteRule ^(.*)$ public/$1 [L]             # todo lo demás entra por public/
```

🚨 **Si se sube el `.htaccess` del repositorio encima de ese, el sitio se rompe.** Es el archivo
más importante del despliegue y vive solo en el servidor. Habría que traerlo al repositorio.

Efecto lateral útil: como todo se reescribe hacia `public/`, un archivo que exista ahí se sirve,
y uno que no, cae en el SPA. Eso fue lo que salvó a `ejecutar.php` de ser ejecutable — ver
[[Seguridad]].

## Cómo publicar, hoy

1. `npm run build` en tu máquina. Compila y deja el resultado en `public/`.
2. Commitear ese `public/` y empujar a GitHub.
3. Subir al servidor lo que cambió:
   - `public/` completo (obligatorio: los nombres llevan hash, los viejos se borran)
   - `app/`, `config/`, `routes/`, `resources/views/` si tocaste backend
4. Si cambió `composer.json`: `composer install --no-dev` por SSH.
5. Si cambiaste `config/` o `.env`: `php artisan config:clear` por SSH.

⚠️ **No correr `php artisan migrate` sin leer antes [[Base de datos]].** Hay una migración que
revienta contra MySQL.

## Alternativa que conviene activar

hPanel → **Avanzado → Git** permite conectar el repositorio y desplegar con un botón. Eliminaría
el paso de subir a mano, que es de donde salió el desfase de arriba. Sigue sin resolver el build
(no hay Node), así que `public/` tendría que seguir viajando commiteado.

## Enlaces

- Qué NO subir nunca a `public/`: [[Seguridad]]
- La trampa de las migraciones: [[Base de datos]]
- Qué hace `scripts/publicar.mjs`: [[Frontend]]
