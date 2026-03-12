import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: process.env.VITE_ADMIN_SUBPATH === 'true' ? '/admin/' : '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  }
})
