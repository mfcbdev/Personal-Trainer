import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'GROW',
        short_name: 'GROW',
        description: 'Periodized training programs for personal trainers and clients',
        theme_color: '#0D0D0F',
        background_color: '#0D0D0F',
        display: 'standalone',
        icons: [],
      },
    }),
  ],
})
