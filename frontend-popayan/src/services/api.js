import axios from 'axios';
import { leerToken, borrarSesion } from './sesion';
import { idiomaGuardado } from '../i18n';

const esDesarrollo =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  baseURL: esDesarrollo ? 'http://localhost:8000/api/v1' : '/api/v1',
});

api.interceptors.request.use(
  (config) => {
    config.headers['X-Localization'] = idiomaGuardado();

    const token = leerToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Rutas donde un 401 significa "credenciales incorrectas", no "tu sesión venció".
 * Borrar la sesión acá sería cerrarle la sesión a alguien por escribir mal la
 * contraseña en un segundo intento.
 */
const RUTAS_DE_ENTRADA = ['/login', '/register', '/forgot-password', '/reset-password'];

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const estado = error.response?.status;
    const url = error.config?.url ?? '';

    const esRutaDeEntrada = RUTAS_DE_ENTRADA.some((ruta) => url.startsWith(ruta));

    if (estado === 401 && !esRutaDeEntrada) {
      // El token venció o fue revocado. Se borra la sesión y listo: el aviso
      // que dispara borrarSesion() llega al AuthProvider, y la ruta protegida
      // manda a esa persona al login sola. Sin recargar el sitio entero.
      borrarSesion();
    }

    return Promise.reject(error);
  }
);

export default api;
