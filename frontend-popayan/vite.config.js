import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        /**
         * Las librerías base van en su propio archivo, aparte del código del
         * sitio. Cambian pocas veces al año, así que el navegador se las queda
         * cacheadas aunque publiquemos el sitio todos los días: cada despliegue
         * solo invalida los chunks que de verdad cambiaron.
         *
         * Lo demás NO se toca a mano a propósito. Las páginas se cargan con
         * import() dinámico (ver src/App.jsx) y Rollup ya arma un chunk por
         * cada una, metiendo en él las librerías que solo esa página usa —
         * el lector de QR y el recortador de imágenes, por ejemplo, terminan
         * dentro del panel privado. Forzar grupos acá lo estropearía.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) {
            return 'react-vendor';
          }

          if (/[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/.test(id)) {
            return 'i18n-vendor';
          }
        },
      },
    },
  },
});
