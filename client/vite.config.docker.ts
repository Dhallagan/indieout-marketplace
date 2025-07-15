import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Docker-specific configuration
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://api:3000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://api:3000',
        changeOrigin: true,
        secure: false,
      },
      '/rails': {
        target: 'http://api:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})