import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // In development the browser calls /api on this origin and Vite forwards it to Flask,
    // so no CORS setup is needed. In production set VITE_API_URL instead.
    proxy: { '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true } },
    // In WSL, files on a Windows drive (/mnt/...) saved from Windows send no change events, so
    // scripts/wsl/dev.sh sets VITE_POLL=1 and Vite checks the files for changes instead.
    watch: process.env.VITE_POLL ? { usePolling: true, interval: 300 } : undefined,
  },
})
