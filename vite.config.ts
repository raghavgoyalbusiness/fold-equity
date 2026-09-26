import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5227,
    host: '127.0.0.1',
    proxy: {
      '/api': { target: 'http://127.0.0.1:5327', changeOrigin: true },
    },
  },
  build: { chunkSizeWarningLimit: 1400 },
})
