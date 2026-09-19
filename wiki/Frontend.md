---
tags: [frontend, spa]
actualizado: 2026-09-19
---

# Frontend

React 19 + Vite 7 + Tailwind 4 + React Router 7, en `frontend-popayan/`. 63 archivos,
~15.000 líneas.

```
src/pages/                    una por ruta (15)
src/components/               Navbar, Footer, tarjetas, modales
src/components/dashboard/     paneles por rol
src/context/                  AuthProvider, ThemeProvider
src/services/                 api.js (axios), sesion.js (almacenamiento)
src/locales/                  es.json, en.json
```

`main.jsx` monta los providers globales; `App.jsx` **solo declara rutas**.

## El bundle se parte a propósito

Antes: **un solo chunk de 1.675 KB** (480 KB comprimido). Después del 18-sep-2026: **~425 KB**
(~140 KB comprimido) en la carga inicial.

Tres decisiones lo sostienen, y romper cualquiera devuelve el problema:

1. **Las 15 rutas van con `React.lazy` + `<Suspense>`.** La portada (`Home`) queda estática a
   propósito: es lo primero que ve casi todo el mundo y cargarla aparte agregaría una espera en
   la primera pintada.
2. **El panel privado es su propio chunk de 658 KB.** Se lleva el escáner de QR, el recortador
   de imágenes y el generador de PDFs. Un visitante que nunca inicia sesión no los descarga.
   🚨 Importar cualquiera de esas librerías desde un componente compartido las devuelve al
   bundle de todos.
3. **`manualChunks` separa React e i18next.** Cambian pocas veces al año, así que el navegador
   se los queda cacheados entre despliegues. Lo demás **no** se agrupa a mano: Rollup ya arma
   un chunk por página y mete ahí lo que solo esa página usa.

## Idiomas

`src/i18n.js` ya no tiene los textos adentro: están en `src/locales/es.json` y `en.json`,
518 textos cada uno, simétricos. **Se carga solo el idioma activo**, como chunk aparte.

🚨 **Para cambiar de idioma va `cambiarIdioma()`, no `i18n.changeLanguage()` a secas.** La
función trae primero el paquete de textos; sin eso, el idioma cambia antes de que su paquete
exista y la pantalla muestra las claves crudas (`navbar.home`) hasta que llega la descarga.

`main.jsx` espera a que el idioma cargue **antes** de montar React, por lo mismo.

## Sesión

**Dueño único: `context/AuthProvider.jsx`.** Va dentro del `BrowserRouter` porque necesita
navegar cuando la sesión cae.

`services/sesion.js` es el único que lee y escribe el almacenamiento del navegador. Maneja el
caso de la cadena `"undefined"`, que aparece cuando alguna vez se guardó un objeto inexistente.

🚨 **El interceptor de 401 excluye `/login` y `/register`.** Ahí un 401 significa "contraseña
incorrecta", no "tu sesión venció": borrar la sesión sería echar a alguien por escribir mal.

Cuando el token vence de verdad, el interceptor borra la sesión, el contexto se entera y
`ProtectedRoute` saca a esa persona sola. Antes había que recargar la página para enterarse.

⚠️ **Quedan 19 archivos leyendo `localStorage` directo.** Funcionan: `sesion.js` sigue
disparando el aviso de compatibilidad que esos archivos ya escuchaban. Es una migración a
medias, hecha a propósito para poder avanzar de a uno.

## Tema

`ThemeProvider` aplica clases sobre `<html>` y `<body>` (modo claro/oscuro y color de acento).

⚠️ **Ningún componente consume `useTheme()`.** El provider existe solo por sus efectos sobre el
DOM. Su valor de contexto está sin usar.

🚨 **Va montado una sola vez, en `main.jsx`.** Estuvo montado dos veces (también en `App.jsx`),
y eran dos providers con estados separados peleándose las mismas clases.

## Responsive: el estado real

Los paneles del dashboard están bien cubiertos (`ManagerDashboard` tiene 160 clases de
breakpoint). El problema está en otro lado.

**Archivos que pintan interfaz y no tienen ni un breakpoint:**

| Archivo | Líneas |
|---|---|
| `components/dashboard/creator/EventFields.jsx` | 218 |
| `components/dashboard/ComprasView.jsx` | 204 |
| `pages/ResetPassword.jsx` | 113 |
| `components/dashboard/creator/VisualMatrix.jsx` | 83 |
| `components/cards/ArtCard.jsx` | 75 |
| `components/cards/ProductCard.jsx` | 62 |

Las dos últimas son las que más pesan: **son las tarjetas de obra y de producto**, o sea lo que
se ve en la galería y en la tienda — justo lo que alguien mira desde el teléfono.

Además, **33 archivos usan anchos fijos en píxeles** (`w-[NNNpx]`, `min-w-[NNNpx]`), que es la
otra causa típica de desborde horizontal en pantallas angostas.

## Enlaces

- Cómo se compila y publica: [[Despliegue]]
- Con qué habla: [[Backend]]
- Lo que falta: [[Pendientes]]
