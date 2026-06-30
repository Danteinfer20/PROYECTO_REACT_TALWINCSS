import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next'; // 1. Importar Provider
import i18n from './i18n'; // 2. Importar la instancia configurada
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 3. Envolver todo con I18nextProvider pasando la instancia 'i18n' */}
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </I18nextProvider>
  </StrictMode>
);