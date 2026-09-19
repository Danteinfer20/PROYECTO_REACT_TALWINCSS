import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/**
 * Los textos viven en src/locales/<idioma>.json y se cargan bajo demanda.
 *
 * Antes estaban los dos idiomas escritos dentro de este archivo — 1.136 líneas
 * que entraban enteras al bundle inicial, así que todo visitante descargaba
 * también el idioma que no iba a usar. Ahora cada JSON es su propio chunk y
 * solo baja el que hace falta.
 */

export const IDIOMAS = ['es', 'en'];
export const IDIOMA_POR_DEFECTO = 'es';

/** El idioma guardado, validado contra la lista: lo que hay en localStorage lo escribe cualquiera. */
export function idiomaGuardado() {
  try {
    const guardado = localStorage.getItem('app_lang');
    return IDIOMAS.includes(guardado) ? guardado : IDIOMA_POR_DEFECTO;
  } catch {
    // Modo privado o almacenamiento bloqueado: no es motivo para no mostrar el sitio.
    return IDIOMA_POR_DEFECTO;
  }
}

/** Descarga el paquete de textos de un idioma, una sola vez. */
export async function cargarIdioma(idioma) {
  const lang = IDIOMAS.includes(idioma) ? idioma : IDIOMA_POR_DEFECTO;

  if (i18n.hasResourceBundle(lang, 'translation')) return lang;

  const modulo = await import(`./locales/${lang}.json`);
  i18n.addResourceBundle(lang, 'translation', modulo.default, true, true);

  return lang;
}

/**
 * Cambia el idioma de la interfaz, trayendo antes sus textos.
 *
 * Es asíncrono a propósito: `i18n.changeLanguage` a secas cambiaría el idioma
 * activo antes de que su paquete exista, y la pantalla mostraría las claves
 * crudas ("navbar.home") hasta que llegara la descarga.
 */
export async function cambiarIdioma(idioma) {
  const lang = await cargarIdioma(idioma);

  try {
    localStorage.setItem('app_lang', lang);
  } catch {
    // Que no se pueda recordar la preferencia no impide aplicarla ahora.
  }

  await i18n.changeLanguage(lang);
  document.documentElement.setAttribute('lang', lang);

  return lang;
}

i18n.use(initReactI18next).init({
  resources: {},
  lng: idiomaGuardado(),
  fallbackLng: IDIOMA_POR_DEFECTO,
  interpolation: { escapeValue: false },
  // El paquete del idioma se carga antes de montar React (ver main.jsx), así
  // que no hace falta que react-i18next suspenda esperándolo.
  react: { useSuspense: false },
});

export default i18n;
