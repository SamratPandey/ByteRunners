import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // eslint-disable-line no-undef
    },
  },
  define: {
    'process.env': {},
    'process.platform': JSON.stringify(process.platform), // eslint-disable-line no-undef
    'process.version': JSON.stringify(process.version), // eslint-disable-line no-undef
  },
  build: {
    rollupOptions: {
      external: ['path', 'fs', 'url', 'source-map-js'],
      output: {
        globals: {
          path: 'path',
          fs: 'fs',
          url: 'url',
          'source-map-js': 'sourceMapJs'
        }
      }
    },
    commonjsOptions: {
      esmExternals: true,
      requireReturnsDefault: 'auto'
    }
  },
  optimizeDeps: {
    exclude: ['path', 'fs', 'url', 'source-map-js']
  }
})