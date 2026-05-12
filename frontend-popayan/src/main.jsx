import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // 🔥 EL NÚCLEO DE TAILWIND ESTÁ CONECTADO AQUÍ
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeProvider.jsx' // 🔥 INYECCIÓN DEL CEREBRO GLOBAL

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* El ThemeProvider envuelve toda la app para controlar Modo Claro/Oscuro y Acentos */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)