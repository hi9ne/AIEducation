import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    hmr: {
      port: 5173,
      host: 'localhost',
    },
  },
  optimizeDeps: {
    include: ['@tabler/icons-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
