/**
 * Identidad visual del sitio, en un solo lugar.
 *
 * 🎯 Cuando llegue la identidad nueva —los 3 colores, la tipografía con licencia
 * comercial y la gráfica complementaria— este es el archivo que se cambia.
 * UNO. Antes el color de acento estaba escrito a mano en 19 archivos distintos,
 * con la misma función copiada en cada uno: aplicar una paleta nueva significaba
 * 38 ediciones manuales y ninguna garantía de no olvidarse una.
 *
 * Los colores van como tripletas "R G B" sin coma, que es el formato que espera
 * la sintaxis `rgb(var(--algo) / <alpha>)` de Tailwind 4. Ver index.css.
 */

/** El acento cuando no hay sesión, o cuando el rol no tiene uno propio. */
export const ACENTO_POR_DEFECTO = '168 85 247'; // púrpura

/**
 * Un acento por rol. Es lo que hoy pinta bordes, resaltados y botones según
 * quién está mirando.
 *
 * ⚠️ El criterio de identidad nuevo pide **3 colores**, así que este esquema de
 * cinco probablemente se reduzca. Centralizarlo acá es justamente lo que permite
 * hacer ese cambio sin recorrer el sitio entero.
 */
export const ACENTOS_POR_ROL = {
  admin: '59 130 246',           // azul
  cultural_manager: '16 185 129', // verde
  educator: '245 158 11',         // ámbar
  artist: '244 63 94',            // rosa
  visitor: ACENTO_POR_DEFECTO,
};

/**
 * Devuelve el acento de un tipo de usuario.
 * Sin usuario, o con un rol desconocido, cae en el color por defecto.
 */
export function acentoDeRol(tipoUsuario) {
  return ACENTOS_POR_ROL[tipoUsuario] ?? ACENTO_POR_DEFECTO;
}
