import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: ['@tensorflow/tfjs']
  },
  resolve: {
    alias: {
      // Polyfill for Node.js modules in browser
      'worker_threads': 'worker_threads/browser',
    }
  },
  define: {
    // Define global for browser compatibility
    'global': 'globalThis',
    'process.env': {}
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
