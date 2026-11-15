import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Own port so Novaris can run next to other Vite projects (they default to 5173).
    port: 5190,
    open: false,
    // /api is served by server/dev-api.mjs (same handlers Vercel runs in production).
    proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: false } },
  },
  build: {
    rollupOptions: {
      output: {
        // Vite 8 (Rolldown) only accepts manualChunks as a function.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          const groups = {
            react: ['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'],
            motion: ['framer-motion'],
            charts: ['recharts'],
          };
          for (const [name, pkgs] of Object.entries(groups)) {
            if (pkgs.some((p) => id.includes('/node_modules/' + p + '/'))) return name;
          }
        },
      },
    },
  },
});
