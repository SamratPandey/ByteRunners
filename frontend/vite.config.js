import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': {},
    'process.platform': JSON.stringify(process.platform),
    'process.version': JSON.stringify(process.version),
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