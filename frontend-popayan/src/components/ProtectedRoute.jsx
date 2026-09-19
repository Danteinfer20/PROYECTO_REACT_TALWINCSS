import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

/**
 * Deja pasar solo si hay sesión.
 *
 * Lee del AuthProvider y no de localStorage, y eso es lo que hace que la
 * expulsión sea automática: cuando la API responde 401, el interceptor de
 * axios borra la sesión, el contexto se entera y esta ruta reacciona sola.
 * Antes el token vencido se descubría recién al recargar la página.
 *
 * Ojo: esto es visibilidad de la interfaz, no seguridad. Quien protege de
 * verdad es la API — acá solo se evita mostrar una pantalla que igual vendría
 * vacía.
 */
const ProtectedRoute = ({ children }) => {
  const { estaAutenticado } = useAuth();
  const ubicacion = useLocation();

  if (!estaAutenticado) {
    // Se recuerda a dónde quería entrar, para poder volver después del login.
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
