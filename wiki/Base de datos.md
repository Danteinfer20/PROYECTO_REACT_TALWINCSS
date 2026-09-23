---
tags: [datos]
actualizado: 2026-09-19
---

# Base de datos

## 🚨 Desarrollo y producción usan motores DISTINTOS

| | Motor | Base |
|---|---|---|
| **Producción** | **MySQL** | `u181234358_Popayan` |
| **Local** (el `.env` del proyecto) | **PostgreSQL** | `popayan_cultural` |

Verificado el 19 y el 23-sep-2026. **Esto es la raíz de casi todos los problemas de
esta nota.** Se desarrolla contra Postgres y se despliega contra MySQL, así que una
migración puede funcionar perfecto en la máquina de quien la escribió y reventar en el
servidor — que es exactamente lo que pasó con la de `jsonb`, más abajo.

No hay forma barata de que esto no muerda otra vez. Las dos salidas honestas son
igualar los motores, o no escribir nunca SQL que dependa de uno. Mientras convivan,
toda migración nueva hay que probarla contra MySQL antes de darla por buena.

Datos vivos al 19-sep-2026: 23 usuarios, 24 publicaciones, 11 productos, 7 eventos.

## 🚨 Hay una migración que no puede correr

`database/migrations/2026_05_20_135529_convert_core_text_to_jsonb.php` convierte los textos de
productos, publicaciones y categorías a columnas `jsonb`, con una clave por idioma:

```sql
ALTER TABLE products ALTER COLUMN name TYPE jsonb USING jsonb_build_object('es', name, 'en', '')
```

**`jsonb` es sintaxis exclusiva de PostgreSQL.** Contra MySQL, eso falla.

Y en producción **nunca corrió**: el archivo ni siquiera está en el servidor — no aparece en
`php artisan migrate:status`, ni como ejecutada ni como pendiente. La base funciona con columnas
de texto normales.

> **Antes de cualquier despliegue que incluya migraciones:** decidir qué hacer con ese archivo.
> O se adapta a MySQL (columnas `JSON`, que MySQL sí tiene, con otra sintaxis), o se marca como
> no aplicable. Subir el repositorio completo y correr `php artisan migrate` la ejecuta y
> aborta a mitad.

## Consecuencia: el bilingüe está a medias

Los accessors que eligen el idioma **solo existen en `app/Models/Post.php`**. `Product` y
`Category` no los tienen — coherente con que la migración nunca corrió y sus columnas son texto
plano.

O sea que hoy el contenido de productos y categorías se traduce en vivo con
`TranslationService` (Google Translate), no por columna. Ver [[Servicios externos]].

## Las migraciones que sí corrieron

14, en 3 lotes. Las 12 del lote 1 son el esquema inicial (marzo-abril 2026); el lote 2 agregó
los campos de moderación a `posts` y el lote 3 la tabla `jobs` de la cola.

La lista viva está en `database/migrations/` — no se copia acá, se mira ahí.

## Sesiones y caché

En producción, `SESSION_DRIVER=file` y `CACHE_STORE=file`, aunque existan las migraciones de
`sessions` y `cache`. O sea que esas tablas están creadas pero no se usan.

## Enlaces

- Cómo se despliega sin romper esto: [[Despliegue]]
- Los modelos y sus consultas: [[Backend]]
- Traducción en vivo: [[Servicios externos]]
