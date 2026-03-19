import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      // Vite dev server proxies these paths to the respective backends
      '/api/dotnet': {
        target: 'http://dotnet-api:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/dotnet/, ''),
      },
      '/api/django': {
        target: 'http://django-api:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/django/, ''),
      },
    },
  },
})
