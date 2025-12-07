import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/igdb': {
        target: 'https://api.igdb.com/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/igdb/, ''),
      },
      '/api/twitch': {
        target: 'https://id.twitch.tv/oauth2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/twitch/, ''),
      }
    }
  }
})
