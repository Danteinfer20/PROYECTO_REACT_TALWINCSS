import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n, { cambiarIdioma } from '../i18n';
import { leerUsuario } from '../services/sesion';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('purple'); // Control de Acento de Color
  const [mode, setMode] = useState('dark');     // Control Estructural (Light/Dark)
  const [language, setLanguage] = useState('es'); // Motor Lingüístico

  const refreshSettings = () => {
    try {
      // Por `leerUsuario()` y no por localStorage directo. Este provider NO puede
      // usar useAuth(): se monta en main.jsx, por fuera del AuthProvider —que
      // vive dentro del router porque necesita navegar—. Compartir el lector es
      // lo más cerca que puede estar de la fuente única.
      const user = leerUsuario();
      if (user) {
        if (user.settings) {
          setTheme(user.settings.theme || 'purple');
          setMode(user.settings.mode || 'dark'); // Rescate de preferencia de luz
          
          const newLang = user.settings.language || 'es';
          setLanguage(newLang);
          if (i18n.language !== newLang) {
            // Asíncrono: trae primero el paquete de textos de ese idioma.
            cambiarIdioma(newLang);
          }
        }
      }
    } catch (e) { console.error("Error cargando preferencias", e); }
  };

  useEffect(() => {
    refreshSettings();
    window.addEventListener('storage', refreshSettings);
    return () => window.removeEventListener('storage', refreshSettings);
  }, []);

  // ⚙️ Inyector Estructural (Aplica la clase en <html> para Tailwind)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
  }, [mode]);

  // ⚙️ Inyector de Acento (Aplica la clase en <body> para variables base)
  useEffect(() => {
    const body = document.body;
    body.classList.remove('theme-purple', 'theme-emerald', 'theme-amber');
    body.classList.add(`theme-${theme}`);
  }, [theme]);

  // 🔥 Mutador expuesto para la interfaz
  const toggleMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleMode, language }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);