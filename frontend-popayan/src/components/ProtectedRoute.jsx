import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // 🗝️ Revisamos si el usuario tiene la llave (token) en su bolsillo (navegador)
  const token = localStorage.getItem('token');

  if (!token) {
    // ✋ ¡ALTO! Si no hay token, lo redirigimos al login inmediatamente
    return <Navigate to="/" replace />;
  }

  // ✅ Si hay token, lo dejamos pasar a ver el contenido (Dashboard)
  return children;
};

export default ProtectedRoute;