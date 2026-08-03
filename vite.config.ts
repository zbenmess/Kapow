import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// PWA « Kapow » : 100 % hors ligne. Tous les assets sont précachés par le
// service worker ; aucune requête réseau n'est nécessaire après installation.
export default defineConfig({
  // Base relative : l'app fonctionne aussi bien à la racine d'un domaine
  // que servie sous un sous-chemin (GitHub Pages : /Kapow/).
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'icons/icon-maskable.svg'],
      manifest: {
        name: 'Kapow — La Ligue des Héros',
        short_name: 'Kapow',
        description: 'Jeux éducatifs de super-héros pour les 3 ans. Sans texte, sans échec, sans réseau.',
        lang: 'fr',
        start_url: '.',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#FFF6E9',
        theme_color: '#FFF6E9',
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
