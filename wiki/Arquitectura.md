---
tags: [arquitectura]
actualizado: 2026-09-19
---

# Arquitectura

Son **dos aplicaciones distintas conviviendo en un repositorio**. Confundirlas es el primer
error que comete todo el que llega.

| | Dónde | Qué es |
|---|---|---|
| **API** | raíz del repo | Laravel 11 · PHP 8.2 · Sanctum. Todo cuelga de `/api/v1`. |
| **SPA** | `frontend-popayan/` | React 19 · Vite 7 · Tailwind 4 · React Router 7 |

Cada una tiene su `package.json`. **El de la raíz no tiene dependencias**: solo delega en el
del frontend. `frontend-popayan/` es la única carpeta que instala paquetes de npm.

## Qué hace el producto

Plataforma cultural de Popayán, con cuatro tipos de usuario:

- **Visitante** — explora, guarda favoritos, compra, reserva entradas.
- **Artesano** — publica obras y las vende en la tienda.
- **Gestor cultural** — crea eventos, vende entradas, controla el acceso con QR.
- **Educador** — publica contenido educativo y rutas de aprendizaje.
- **Admin** — aprueba creadores, modera contenido, audita.

Los tres del medio necesitan **verificación**: se postulan (`creator_applications`) y un admin
aprueba. Mientras no estén verificados, el sistema los trata como visitantes — eso lo resuelve
`getRolEfectivo()` en `pages/Dashboard.jsx`.

## Las cuatro capas de acceso de la API

`routes/api.php` está agrupado por nivel, y ese orden es la autorización real:

1. **Públicas** — catálogos, login, registro, recuperar contraseña.
2. **Autenticadas** — `auth:sanctum` + `checkStatus` (el que frena a los suspendidos).
3. **Creadores verificados** — `verified_creator`.
4. **Administración** — `admin`.

## Cómo hablan entre sí

El SPA usa una sola instancia de axios (`frontend-popayan/src/services/api.js`) que:

- decide el destino por el nombre de host: en `localhost` apunta a `http://localhost:8000/api/v1`, en producción a `/api/v1` relativo;
- adjunta el token de sesión (ver [[Frontend]]);
- manda la cabecera `X-Localization` con el idioma, que el middleware `SetLanguage` aplica del lado servidor.

## Enlaces

- Cómo llega esto al servidor: [[Despliegue]]
- Qué guarda y dónde: [[Base de datos]]
- Detalle del SPA: [[Frontend]]
- Detalle de la API: [[Backend]]
