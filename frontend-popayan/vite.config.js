import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // <--- Esto es clave

export default defineConfig({
  plugins: [react()],
});