import { useAuth } from '../context/AuthProvider';
import { acentoDeRol } from './marca';

/**
 * El color de acento de quien está mirando, como tripleta "R G B".
 *
 * Reemplaza a `getRoleAccentRGB()`, que estaba copiada íntegra en 19 archivos.
 * Se usa así:
 *
 *   const acento = useAcento();
 *   <div style={{ '--role-accent': acento }}>
 *
 * Va en su propio archivo, y no dentro de marca.js, porque aquel no importa
 * React: se puede usar desde código que no es un componente.
 */
export function useAcento() {
  const { usuario } = useAuth();
  return acentoDeRol(usuario?.user_type);
}
