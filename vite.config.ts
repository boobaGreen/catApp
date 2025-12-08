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
      filename: 'sw.js',
      manifestFilename: 'felis.webmanifest',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'FELIS: Apex Hunter',
        short_name: 'FELIS',
        description: 'The first mobile game designed for Apex Predators. Ethological training tool for cats.',
        id: '/',
        start_url: '/play',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'minimal-ui'],
        orientation: 'portrait',
        dir: 'ltr',
        lang: 'en',
        categories: ['games', 'entertainment', 'simulation'],
        prefer_related_applications: false,
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot1.png',
            sizes: '398x868',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Main Menu'
          },
          {
            src: 'screenshot2.png',
            sizes: '400x869',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Gameplay Action'
          },
          {
            src: 'screenshot3.png',
            sizes: '398x866',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Settings'
          },
          {
            src: 'screenshot4.png',
            sizes: '396x860',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Feature Showcase'
          },
          {
            src: 'screenshot5.png',
            sizes: '396x859',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Pro Mode'
          },
          {
            src: 'screenshot6.png',
            sizes: '393x861',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Action Shot'
          },
          {
            src: 'screenshot7.png',
            sizes: '392x860',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Menu Detail'
          },
          {
            src: 'screenshot8.png',
            sizes: '394x857',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Full Screen'
          }
        ]
      }
    })
  ],
})
