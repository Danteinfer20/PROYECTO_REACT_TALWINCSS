---
tags: [trampas]
actualizado: 2026-09-19
---

# Trampas

Lo que no se ve leyendo el código, ordenado por lo caro que sale pisarlo.

## 1. 🚨 Un `.php` en `public/` se ejecuta desde internet

No hace falta que esté enlazado. Diez scripts de prueba vivían ahí, uno imprimía una clave de
API y otro corría `phpinfo()`. Historia completa en [[Seguridad]].

## 2. 🚨 La migración `jsonb` revienta contra MySQL

Está en el repositorio, nunca corrió en producción, y `php artisan migrate` la ejecutaría.
Ver [[Base de datos]].

## 3. 🚨 El `.htaccess` que funciona vive solo en el servidor

El del repositorio tiene 4 líneas; el del servidor, 429 bytes, y es el que hace que React gane
sobre Laravel. Subir el del repo encima rompe el sitio. Ver [[Despliegue]].

## 4. 🚨 El servidor no tiene Node

El build se hace en tu máquina y viaja commiteado. Ya pasó que producción corriera un bundle
que nunca se commiteó. Ver [[Despliegue]].

## 5. 🚨 Cambiar el idioma sin cargar sus textos muestra las claves crudas

Va `cambiarIdioma()`, no `i18n.changeLanguage()`. Ver [[Frontend]].

## 6. 🚨 Un 401 en `/login` no es una sesión vencida

Es una contraseña mal escrita. El interceptor de axios los excluye a propósito; sin eso, el
segundo intento fallido te cerraba la sesión. Ver [[Frontend]].

## 7. 🚨 Recharts no — pero las librerías pesadas del panel, tampoco

El escáner de QR, el recortador de imágenes y el generador de PDFs viven dentro del chunk del
dashboard. Importarlos desde un componente compartido los devuelve al bundle que descarga todo
el mundo, incluidos los visitantes. Ver [[Frontend]].

## 8. ⚠️ `ejecutar.php` existía y borraba la base

`migrate:fresh --force` sin autenticación. No era alcanzable **por casualidad** —la regla de
Apache lo mandaba a una ruta que no existía—, no por diseño. Está en cuarentena.

## 9. ⚠️ El `ThemeProvider` no lo consume nadie

`useTheme()` no se usa en ningún componente. El provider existe solo por sus efectos sobre el
DOM. Estuvo montado dos veces, con dos estados peleándose las mismas clases.

## 10. ⚠️ `ArtistController` muestra 12 artesanos y nunca más

`->take(12)` fijo, sin paginación. Ver [[Backend]].

## 11. ⚠️ Las imágenes no tienen respaldo local

Las 40 viven en una sola cuenta de Cloudinary. No hay copia en el servidor.
Ver [[Servicios externos]].

## 12. ⚠️ `localStorage` puede tener la cadena `"undefined"`

Literalmente el texto `undefined`, de cuando se guardó un objeto que no existía. Por eso
`sesion.js` lo chequea. Cualquier lectura nueva tiene que pasar por ahí.

## Enlaces

- [[Índice]] · [[Pendientes]]
