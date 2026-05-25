import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project sites are served from /<repo>/, so the production build
// needs that base path for assets to resolve. Dev stays at root.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Witch-Hat-Battle/' : '/',
}))
