import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 🔥 SPRINT 3: INFRAESTRUCTURA GLOBAL
import { ThemeProvider } from './context/ThemeProvider';
import './i18n'; // Inicialización de react-i18next

// --- 1. PÁGINAS PRINCIPALES ---
import Home from './pages/Home.jsx'; 
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx'; 
import ResetPassword from './pages/ResetPassword.jsx';

// --- 2. PÁGINAS PÚBLICAS Y CATÁLOGOS ---
import Tienda from './pages/Tienda.jsx';           
import DetalleProducto from './pages/DetalleProducto.jsx'; 
import Obras from './pages/Obras.jsx';              
import ObraDetalle from './pages/ObraDetalle.jsx'; 
import Eventos from './pages/Eventos.jsx';         
import EventoDetalle from './pages/EventoDetalle.jsx'; 
import Artesanos from './pages/Artesanos.jsx';      
import Aprende from './pages/Aprende.jsx';          

// 📚 VISTA DE LECTURA INMERSIVA (Lección)
import Leccion from './pages/Leccion.jsx';

// --- 3. PERFILES Y COMUNIDAD ---
import PerfilArtista from './pages/PerfilArtista.jsx'; 

// --- 4. SEGURIDAD Y PROTECCIÓN ---
import ProtectedRoute from './components/ProtectedRoute.jsx'; 

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
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
          <Route path="/aprende/:id" element={<Leccion />} /> {/* ✅ Cambiado a Leccion */}

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
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;