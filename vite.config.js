import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
  },
  // base: '/reyes-magos/', // Only needed for GitHub Pages, not for Vercel
})
