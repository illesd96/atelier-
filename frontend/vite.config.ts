import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Image optimization plugin - only run in production builds
    mode === 'production' && ViteImageOptimizer({
      jpg: {
        quality: 90,
      },
      jpeg: {
        quality: 90,
      },
      png: {
        quality: 90,
      },
      webp: {
        quality: 90,
      },
    }),
  ].filter(Boolean),
  server: {
    port: 3000,
  },
  // Remove console.log in production builds
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'primereact-vendor': ['primereact/button', 'primereact/inputtext', 'primereact/calendar'],
          'i18n-vendor': ['react-i18next', 'i18next'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Use esbuild for minification (faster and no extra dependency needed)
    minify: 'esbuild',
  },
}));
