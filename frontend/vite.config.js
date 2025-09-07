import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true, // Не пытаться использовать другие порты если 3000 занят
    host: 'localhost', // Ограничиваем доступ только локальным хостом
    hmr: {
      port: 3000,
      host: 'localhost',
      protocol: 'ws',
    },
    watch: {
      usePolling: false, // Отключаем polling для лучшей производительности
    },
  },
  optimizeDeps: {
    include: ['@tabler/icons-react'],
    force: true,
  },
});
