/**
 * Resuelve la dirección de una imagen guardada por la aplicación.
 *
 * 🚨 Estaba escrito a mano en cuatro lugares como
 * `http://localhost:8000/storage/${path}` — con el dominio fijo. Esa cadena
 * viaja en los chunks que sirve producción, así que cualquier imagen que no
 * viniera de Cloudinary apuntaba a la computadora del propio visitante y salía
 * rota. Se ve solo en producción y solo con contenido viejo, que es la peor
 * combinación para darse cuenta.
 *
 * La mayoría de las imágenes llegan como URL completa de Cloudinary y se
 * devuelven tal cual. Esto cubre el resto: lo que quedó en el almacenamiento
 * local de Laravel.
 */

const enDesarrollo =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// En producción el SPA y Laravel comparten origen, así que alcanza con una ruta
// relativa. En desarrollo hay que nombrar el puerto de `php artisan serve`.
const ORIGEN_ARCHIVOS = enDesarrollo ? 'http://localhost:8000' : '';

/**
 * @param {string|null|undefined} ruta  Lo que devolvió la API.
 * @param {string|null} respaldo        Qué usar si no hay nada.
 */
export function urlDeMedio(ruta, respaldo = null) {
  if (!ruta) return respaldo;

  // Cloudinary, ui-avatars, YouTube: ya vienen completas.
  if (/^https?:\/\//i.test(ruta)) return ruta;

  // Evita el doble `/storage/storage/` cuando la API ya lo incluyó, y las
  // barras de más al principio.
  const limpia = String(ruta).replace(/^\/+/, '').replace(/^storage\//, '');

  return `${ORIGEN_ARCHIVOS}/storage/${limpia}`;
}

/** Un avatar generado a partir del nombre, para cuando no hay foto. */
export function avatarPorNombre(nombre, tamano = 128) {
  const texto = encodeURIComponent(nombre || 'U');

  return `https://ui-avatars.com/api/?name=${texto}&background=16130F&color=F6F2EA&bold=true&size=${tamano}`;
}
