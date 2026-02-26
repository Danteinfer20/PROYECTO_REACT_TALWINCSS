/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados basados en tu diseño de Arte y Cultura
        'popayan-purple': '#5d5fef', // El color violeta/azul del botón principal
        'popayan-input': '#2a2a2a',  // El color gris oscuro de los campos de texto
      },
      // Añadimos una animación para el mensaje de error (opcional pero profesional)
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}