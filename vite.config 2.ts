/// <reference types="vitest" />
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: null
      },
      manifest: {
        name: 'RoteiroPro - Gerador de Roteiros IA',
        short_name: 'RoteiroPro',
        description: 'Gerador profissional de roteiros com Inteligência Artificial',
        theme_color: '#3B82F6',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/desktop-1.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Desktop Screenshot'
          },
          {
            src: 'screenshots/mobile-1.png',
            sizes: '375x812',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Mobile Screenshot'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    fs: { strict: false },
    watch: { 
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/node_modules_old*/**',
        '**/.archive/**',
        '**/coverage/**',
        '**/playwright-report/**',
        '**/test-results/**',
        '**/*.log',
        '**/dist/**',
        '**/build/**'
      ]
    },
    hmr: {
      overlay: true
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'react-hot-toast'],
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
})
