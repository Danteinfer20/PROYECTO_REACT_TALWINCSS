import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- 1. PÁGINAS PRINCIPALES ---
import Home from './pages/Home'; 
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard'; 

// --- 2. NUEVAS PÁGINAS PÚBLICAS ---
import Tienda from './pages/Tienda';      // Catálogo de productos
import Obras from './pages/Obras';        // ✅ NUEVA: Galería oficial del museo
import Eventos from './pages/Eventos';    // Agenda cultural
import Artesanos from './pages/Artesanos'; // Directorio de maestros
import Aprende from './pages/Aprende';    // Sección educativa

// --- 3. SEGURIDAD ---
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* =========================================
            🌍 RUTAS PÚBLICAS (Cualquiera puede verlas)
           ========================================= */}
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<Tienda />} />
        
        {/* ✅ RUTA CORREGIDA: Ahora "/obras" lleva al componente Obras real */}
        <Route path="/obras" element={<Obras />} /> 
        
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/artesanos" element={<Artesanos />} />
        <Route path="/aprende" element={<Aprende />} />

        {/* =========================================
            🔐 RUTAS DE ACCESO (Login/Registro)
           ========================================= */}
        <Route path="/login" element={<Auth />} />
        
        {/* =========================================
            🛡️ RUTAS PROTEGIDAS (Solo usuarios logueados)
           ========================================= */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* 🔄 REDIRECCIÓN (Si escriben cualquier locura en la URL) */}
        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;