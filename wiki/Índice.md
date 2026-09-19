---
tags: [indice]
actualizado: 2026-09-19
---

# Vive el Arte · wiki técnica

Punto de entrada. Cada nota cubre una capa del proyecto y enlaza a las demás.

> **Cómo abrir esto.** En Obsidian: *Abrir carpeta como almacén* → elegir `wiki/`.
> Los enlaces con doble corchete se vuelven navegables y el grafo muestra cómo se conecta todo.

> **Regla de esta wiki.** No se copian listas que ya están en el código. Si `grep` lo
> responde en una búsqueda, no va acá. Acá va lo que la búsqueda **no** puede recuperar:
> decisiones, acoplamientos, y trampas ya pisadas.

## Por dónde empezar

| Si querés… | Leé |
|---|---|
| entender cómo está armado | [[Arquitectura]] |
| publicar cambios | [[Despliegue]] |
| tocar la base de datos | [[Base de datos]] |
| saber qué se rompió y por qué | [[Trampas]] |
| ver qué falta | [[Pendientes]] |

## Todas las notas

- [[Arquitectura]] — dos aplicaciones en un repositorio, y por qué
- [[Despliegue]] — Hostinger, cómo llega el código al servidor
- [[Base de datos]] — MySQL, y la migración que no puede correr
- [[Seguridad]] — el incidente del 19-sep-2026 y lo que quedó pendiente
- [[Servicios externos]] — Cloudinary, OpenAI, Gemini, Google Translate
- [[Frontend]] — el SPA: bundle, idiomas, sesión, responsive
- [[Backend]] — la API: errores, consultas, permisos
- [[Trampas]] — lo que no se ve leyendo el código
- [[Pendientes]] — decisiones abiertas y trabajo por hacer

## Lo mínimo que hay que saber

1. **Son dos aplicaciones**, no una. Laravel en la raíz, React en `frontend-popayan/`. Ver [[Arquitectura]].
2. **El servidor no tiene Node.** El SPA se compila en tu máquina y se sube compilado. Ver [[Despliegue]].
3. **La base es MySQL**, aunque haya una migración escrita para PostgreSQL. Ver [[Base de datos]].
4. **`public/` es la raíz web.** Todo archivo `.php` que quede ahí se ejecuta si alguien pide la URL. Ver [[Seguridad]].
