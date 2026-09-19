/**
 * Único lugar que lee y escribe la sesión en el navegador.
 *
 * Antes cada componente hacía su propio `localStorage.getItem('user')` con su
 * propio try/catch — 23 archivos repitiendo la misma lógica, incluido el
 * chequeo de la cadena "undefined", que aparece cuando alguna vez se guardó
 * un objeto que no existía. Con una sola implementación, ese detalle se
 * arregla en un lugar y vale para todos.
 *
 * Este módulo no sabe nada de React a propósito: lo usan tanto el AuthProvider
 * como el interceptor de axios, y ese último corre fuera del árbol de
 * componentes.
 */

const CLAVE_TOKEN = 'token';
const CLAVE_USUARIO = 'user';

/**
 * Se avisa con un evento 'storage' porque es el que ya escuchaban el
 * ThemeProvider y varias vistas. Mantenerlo permite migrar los consumidores de
 * a uno: el que todavía no usa el contexto sigue funcionando igual.
 *
 * (El evento nativo 'storage' solo lo dispara el navegador para OTRAS pestañas;
 * este despacho manual es el que cubre la pestaña actual.)
 */
function avisar() {
  window.dispatchEvent(new Event('storage'));
}

export function leerToken() {
  try {
    const token = localStorage.getItem(CLAVE_TOKEN);
    return token && token !== 'undefined' ? token : null;
  } catch {
    return null;
  }
}

export function leerUsuario() {
  try {
    const crudo = localStorage.getItem(CLAVE_USUARIO);
    if (!crudo || crudo === 'undefined' || crudo === 'null') return null;
    return JSON.parse(crudo);
  } catch {
    // Un JSON corrupto no puede dejar el sitio en blanco: vale como "sin sesión".
    return null;
  }
}

export function guardarSesion(token, usuario) {
  try {
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  } catch {
    // Almacenamiento lleno o bloqueado: la sesión vive solo en memoria.
  }
  avisar();
}

export function guardarUsuario(usuario) {
  try {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  } catch {
    // Ídem.
  }
  avisar();
}

export function borrarSesion() {
  try {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
  } catch {
    // Ídem.
  }
  avisar();
}

/** Se suscribe a los cambios de sesión. Devuelve la función para desuscribirse. */
export function alCambiarSesion(callback) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}
