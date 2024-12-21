import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [react()],
  server: {
    host: true,
    open: true,
    port: 3000,
  },
  define: {
    global: {},
  },
  resolve: {
    alias: {
      "node-fetch" : "isomorphic-fetch",
    },
  }
})
