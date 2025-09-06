import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    host: '0.0.0.0',
    hmr: {
      port: 5174,
      host: 'localhost',
    },
    watch: {
      usePolling: true,
    },
  },
  optimizeDeps: {
    include: ['@tabler/icons-react'],
    force: true,
  },
});
