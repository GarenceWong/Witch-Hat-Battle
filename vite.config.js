import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE_PATH lets each host set its own subpath.
// GitHub Pages: set VITE_BASE_PATH=/Witch-Hat-Battle/ in the Actions workflow.
// Vercel / root deployments: leave unset (defaults to /).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? '/',
})
