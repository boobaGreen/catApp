import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'custom-sw.js',
      manifestFilename: 'felis.webmanifest',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'icon.png'],
      manifest: {
        name: 'FELIS: Apex Hunter',
        short_name: 'FELIS',
        description: 'The first mobile game designed for Apex Predators. Ethological training tool for cats.',
        id: '/',
        start_url: '/play',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'fullscreen',
        display_override: ['window-controls-overlay', 'minimal-ui'],
        orientation: 'portrait',
        dir: 'ltr',
        lang: 'en',
        categories: ['games', 'entertainment', 'simulation'],
        prefer_related_applications: false,
        icons: [
          {
            src: 'icon192x192.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'icon512x512.jpeg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: 'icon512x512.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          { src: 'screenshot1.jpeg', sizes: '716x1600', type: 'image/jpeg', form_factor: 'narrow', label: 'Main Menu' },
          { src: 'screenshot2.jpeg', sizes: '716x1600', type: 'image/jpeg', form_factor: 'narrow', label: 'Gameplay Action' },
          { src: 'screenshot3.jpeg', sizes: '716x1600', type: 'image/jpeg', form_factor: 'narrow', label: 'Settings' },
          { src: 'screenshot4.jpeg', sizes: '716x1600', type: 'image/jpeg', form_factor: 'narrow', label: 'Pro Mode' },
          { src: 'screenshot5.jpeg', sizes: '716x1600', type: 'image/jpeg', form_factor: 'narrow', label: 'Screenshot 5' },
          { src: 'screenshot6.jpeg', sizes: '716x1600', type: 'image/jpeg', form_factor: 'narrow', label: 'Screenshot 6' },
          { src: 'screenshot7.jpeg', sizes: '716x1600', type: 'image/jpeg', form_factor: 'narrow', label: 'Screenshot 7' },
          { src: 'screenshot8.jpeg', sizes: '716x1600', type: 'image/jpeg', form_factor: 'narrow', label: 'Screenshot 8' },
          { src: 'screenshot9.jpeg', sizes: '716x1600', type: 'image/jpeg', form_factor: 'narrow', label: 'Screenshot 9' },
          { src: 'screenshot10.jpeg', sizes: '716x1600', type: 'image/jpeg', form_factor: 'narrow', label: 'Screenshot 10' },
          { src: 'screenshot11.jpeg', sizes: '716x1600', type: 'image/jpeg', form_factor: 'narrow', label: 'Screenshot 11' },
          { src: 'screenshot12.jpeg', sizes: '716x1600', type: 'image/jpeg', form_factor: 'narrow', label: 'Screenshot 12' }
        ],
        shortcuts: [
          {
            name: "Play Now",
            short_name: "Play",
            description: "Jump straight into the hunt!",
            url: "/play",
            icons: [{ src: "icon192x192.jpeg", sizes: "192x192", type: "image/jpeg" }]
          }
        ]
      }
    })
  ],
})
