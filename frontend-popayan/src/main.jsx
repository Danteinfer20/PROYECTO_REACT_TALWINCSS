import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18n, { cargarIdioma, idiomaGuardado } from './i18n';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeProvider.jsx';

const idioma = idiomaGuardado();
document.documentElement.setAttribute('lang', idioma);

// Se monta React recién cuando los textos del idioma están cargados. Si se
// montara antes, la primera pintada mostraría las claves crudas ("navbar.home")
// durante el instante que tarda la descarga del paquete.
cargarIdioma(idioma).finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </I18nextProvider>
    </StrictMode>
  );
});
