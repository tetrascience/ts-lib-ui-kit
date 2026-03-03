import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { alias } from '../../vite.config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      ...alias,
      '@tetrascience-npm/tetrascience-react-ui/server': path.resolve(__dirname, '../../src/server/index.ts'),
      '@tetrascience-npm/tetrascience-react-ui/index.css': path.resolve(__dirname, '../../src/index.css'),
      '@tetrascience-npm/tetrascience-react-ui': path.resolve(__dirname, '../../src/index.ts'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
