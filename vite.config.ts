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
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'GROW',
        short_name: 'GROW',
        description: 'Programas de entrenamiento periodizados para entrenadores y clientes',
        theme_color: '#0D0D0F',
        background_color: '#0D0D0F',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'es',
        categories: ['fitness', 'health', 'lifestyle'],
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
