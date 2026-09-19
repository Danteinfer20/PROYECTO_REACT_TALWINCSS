import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  leerToken,
  leerUsuario,
  guardarSesion,
  guardarUsuario,
  borrarSesion,
  alCambiarSesion,
} from '../services/sesion';

const AuthContext = createContext(null);

/**
 * Dueño único de la sesión en la interfaz.
 *
 * Va dentro del BrowserRouter porque necesita navegar: cuando la sesión se
 * cierra —sea por el botón de salir o porque la API respondió 401— hay que
 * sacar a la persona de una pantalla privada sin recargar el sitio entero.
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(leerUsuario);
  const [token, setToken] = useState(leerToken);

  // Mantiene el estado al día ante cambios hechos desde otra pestaña, o desde
  // un componente que todavía escribe el almacenamiento directamente.
  useEffect(() => alCambiarSesion(() => {
    setUsuario(leerUsuario());
    setToken(leerToken());
  }), []);

  const iniciarSesion = useCallback((nuevoToken, nuevoUsuario) => {
    guardarSesion(nuevoToken, nuevoUsuario);
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  }, []);

  const cerrarSesion = useCallback((destino = '/') => {
    borrarSesion();
    setToken(null);
    setUsuario(null);
    navigate(destino, { replace: true });
  }, [navigate]);

  /** Refresca los datos del usuario sin tocar el token (perfil, ajustes, foto). */
  const actualizarUsuario = useCallback((nuevoUsuario) => {
    guardarUsuario(nuevoUsuario);
    setUsuario(nuevoUsuario);
  }, []);

  // El token es la fuente de verdad de "hay sesión": es lo que la API exige.
  // Un usuario guardado sin token es basura de una sesión anterior.
  const valor = useMemo(() => ({
    usuario,
    token,
    estaAutenticado: Boolean(token),
    iniciarSesion,
    cerrarSesion,
    actualizarUsuario,
  }), [usuario, token, iniciarSesion, cerrarSesion, actualizarUsuario]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth() se usó fuera de <AuthProvider>.');
  }

  return contexto;
}
