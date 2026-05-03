import federation from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * - `vite` dev server (`command === 'serve'` in dev): skip federation so React Router / React
 *   are bundled normally — otherwise `generate: false` shared deps expect the shell host and RR crashes.
 * - `vite build`: emit `remoteEntry.js` with shared libs included (`generate: true`) so preview / shell both work.
 */
export default defineConfig(({ mode, command }) => {
  const useFederation = command === 'build';

  return {
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  plugins: [
    react(),
    ...(useFederation
      ? [
          federation({
            name: 'blogAdmin',
            filename: 'remoteEntry.js',
            exposes: {
              './BlogAdmin': './src/BlogAdminApp.tsx',
            },
            shared: {
              react: { singleton: true, requiredVersion: '^18.3.1', generate: true },
              'react-dom': { singleton: true, requiredVersion: '^18.3.1', generate: true },
              'react-router-dom': {
                singleton: true,
                requiredVersion: '^6.28.0',
                generate: true,
              },
            },
          }),
        ]
      : []),
  ],
  server: {
    host: true,
    port: 5001,
    strictPort: true,
    origin: 'http://localhost:5001',
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
    host: true,
    port: 5001,
    strictPort: true,
    cors: true,
  },
  base: process.env.VITE_BASE ?? '/',
  build: {
    target: 'esnext',
    minify: mode === 'production' ? 'esbuild' : false,
    cssCodeSplit: false,
    modulePreload: false,
  },
};
});
