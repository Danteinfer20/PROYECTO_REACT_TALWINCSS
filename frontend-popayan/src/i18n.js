import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 📚 DICCIONARIO ESTRUCTURADO (Escalable)
const resources = {
  es: {
    translation: {
      navbar: {
        home: "Inicio",
        artisans: "Artesanos",
        artworks: "Obras",
        events: "Eventos",
        store: "Tienda",
        learn: "Aprende",
        login: "Entrar",
        join: "Unirse"
      },
      settings: {
        identity: "Identidad",
        contact: "Contacto",
        privacy: "Privacidad",
        preferences: "Preferencias",
        save: "Guardar Cambios"
      }
    }
  },
  en: {
    translation: {
      navbar: {
        home: "Home",
        artisans: "Artisans",
        artworks: "Artworks",
        events: "Events",
        store: "Store",
        learn: "Learn",
        login: "Log In",
        join: "Join"
      },
      settings: {
        identity: "Identity",
        contact: "Contact",
        privacy: "Privacy",
        preferences: "Preferences",
        save: "Save Changes"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "es", // Idioma nativo por defecto
    fallbackLng: "es", // Salvavidas si falta una traducción
    interpolation: {
      escapeValue: false // React ya sanitiza contra XSS automáticamente
    }
  });

export default i18n;