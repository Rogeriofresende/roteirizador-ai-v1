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
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase',
      '@google/generative-ai',
      'framer-motion',
      'lucide-react',
      'date-fns',
      'axios',
      'recharts'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  server: {
    port: 5173,
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
    // Otimizações de performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks para melhor caching
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-alert-dialog', '@radix-ui/react-button'],
          // Features específicas
          'admin-features': [
            './src/components/admin/AdminDashboard',
            './src/components/admin/AdminDocumentation',
            './src/services/adminService'
          ],
          'optimization-features': [
            './src/services/optimization/BundleOptimizationService',
            './src/services/optimization/IntegratedOptimizationManager',
            './src/components/optimization/OptimizationDashboard'
          ],
          'collaboration-features': [
            './src/features/collaboration/components/CollaborationPanel',
            './src/features/collaboration/services/CollaborationService'
          ]
        }
      }
    },
    // Compressão e otimizações
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Sourcemaps para produção
    sourcemap: true,
    // Target para melhor compatibilidade
    target: 'es2020'
  },
  preview: {
    port: 4173,
    host: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
})
