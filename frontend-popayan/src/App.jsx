import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// El ThemeProvider y la inicialización de i18n viven en main.jsx, que envuelve
// a este componente. Montarlos también acá creaba un segundo provider con su
// propio estado, y los dos se peleaban las clases de <html> y <body>.

import { AuthProvider } from './context/AuthProvider.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// La portada se importa de forma normal: es lo primero que ve casi todo el
// mundo, y cargarla aparte agregaría una espera extra justo en la primera
// pintada. El resto viaja en su propio chunk y se descarga al entrar.
import Home from './pages/Home.jsx';

// --- CATÁLOGOS PÚBLICOS ---
const Tienda = lazy(() => import('./pages/Tienda.jsx'));
const DetalleProducto = lazy(() => import('./pages/DetalleProducto.jsx'));
const Obras = lazy(() => import('./pages/Obras.jsx'));
const ObraDetalle = lazy(() => import('./pages/ObraDetalle.jsx'));
const Eventos = lazy(() => import('./pages/Eventos.jsx'));
const EventoDetalle = lazy(() => import('./pages/EventoDetalle.jsx'));
const Artesanos = lazy(() => import('./pages/Artesanos.jsx'));
const PerfilArtista = lazy(() => import('./pages/PerfilArtista.jsx'));

// --- ACADEMIA ---
const Aprende = lazy(() => import('./pages/Aprende.jsx'));
const Leccion = lazy(() => import('./pages/Leccion.jsx'));

// --- AUTENTICACIÓN ---
const Auth = lazy(() => import('./pages/Auth.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));

// --- PANEL PRIVADO ---
// El más pesado de todos: se lleva el escáner de QR, el recortador de imágenes
// y el generador de PDFs. Un visitante que nunca inicia sesión no lo descarga.
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));

/** Lo que se ve el instante que tarda en llegar el chunk de una página. */
function Cargando() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-bg-primary"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Cargando…</span>
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border-color border-t-accent" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* El AuthProvider va dentro del router: necesita poder navegar cuando
          la sesión se cierra o la API responde 401. */}
      <AuthProvider>
        <Suspense fallback={<Cargando />}>
          <Routes>

          {/* =========================================
              🌍 RUTAS PÚBLICAS (Visitantes)
             ========================================= */}
          <Route path="/" element={<Home />} />

          {/* 🛍️ E-COMMERCE: TIENDA */}
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/tienda/:id" element={<DetalleProducto />} />

          {/* 🖼️ PATRIMONIO: GALERÍA Y OBRAS */}
          <Route path="/obras" element={<Obras />} />
          <Route path="/obra/:id" element={<ObraDetalle />} />

          {/* 📅 AGENDA: EVENTOS CULTURALES */}
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/evento/:id" element={<EventoDetalle />} />

          {/* 👤 COMUNIDAD: ARTESANOS Y APRENDIZAJE */}
          <Route path="/artesanos" element={<Artesanos />} />
          <Route path="/artesanos/:username" element={<PerfilArtista />} />

          {/* 📚 ACADEMIA Y LECCIONES */}
          <Route path="/aprende" element={<Aprende />} />
          <Route path="/aprende/:id" element={<Leccion />} />

          {/* =========================================
              🔐 AUTENTICACIÓN
             ========================================= */}
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* =========================================
              🛡️ RUTAS PRIVADAS (Dashboard Centralizado)
             ========================================= */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* 🔄 FALLBACK: REDIRECCIÓN GLOBAL SEGURA */}
          <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
