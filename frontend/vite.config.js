import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // In development the browser calls /api on this origin and Vite forwards it to Flask,
    // so no CORS setup is needed. In production set VITE_API_URL instead.
    proxy: { '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true } },
  },
})
