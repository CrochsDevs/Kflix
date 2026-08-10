import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force a single React instance across the entire app (including lazy chunks)
    dedupe: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react-router-dom'],
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react-dom/')) return 'react-dom';
            if (id.includes('react-router')) return 'react-router';
            if (id.includes('axios')) return 'axios';
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});