import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
  },
  // Remove console.log in production builds
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
