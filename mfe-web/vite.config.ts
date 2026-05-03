import federation from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  plugins: [
    react(),
    federation({
      name: 'blogWeb',
      filename: 'remoteEntry.js',
      exposes: {
        './BlogWeb': './src/BlogWebApp.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '18.3.1' },
        'react-router-dom': { singleton: true, requiredVersion: '6.28.0' },
      },
    }),
  ],
  server: {
    port: 5002,
    strictPort: true,
    origin: 'http://localhost:5002',
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5002,
    strictPort: true,
  },
  base: process.env.VITE_BASE ?? '/',
  build: {
    target: 'esnext',
    minify: mode === 'production' ? 'esbuild' : false,
    cssCodeSplit: false,
    modulePreload: false,
  },
}));
