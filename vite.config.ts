import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Guardian RSS through Vite dev server to avoid CORS
      '/guardian-rss': {
        target: 'https://www.theguardian.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/guardian-rss/, ''),
        secure: true,
        followRedirects: true,
      },
    },
  },
})
