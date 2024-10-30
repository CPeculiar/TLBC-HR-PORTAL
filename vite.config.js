import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['jsvectormap']
  },
  build: {
    rollupOptions: {
      external: ['/jsvectormap/dist/css/jsvectormap.css'],
    },
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})