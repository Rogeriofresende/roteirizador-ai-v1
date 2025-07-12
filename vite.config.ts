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
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        // 🚀 WEEK 7 PERFORMANCE OPTIMIZATION - AGGRESSIVE CODE SPLITTING
        manualChunks(id) {
          // Core vendor libraries (critical path)
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core';
          }
          
          // Router and navigation (loaded early)
          if (id.includes('node_modules/react-router') || id.includes('node_modules/history')) {
            return 'react-router';
          }
          
          // UI Library chunks (loaded on demand)
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-icons';
          }
          
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'charts';
          }
          
          // AI and Firebase (heavy dependencies)
          if (id.includes('node_modules/@google/generative-ai')) {
            return 'google-ai';
          }
          
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase';
          }
          
          // Admin Dashboard chunk (lazy loaded)
          if (id.includes('src/pages/AdminDashboard') || 
              id.includes('src/components/admin/') ||
              id.includes('src/services/adminService')) {
            return 'admin-dashboard';
          }
          
          // Generator Page chunk (lazy loaded - biggest optimization target)
          if (id.includes('src/pages/GeneratorPage') ||
              id.includes('src/components/form/ScriptForm') ||
              id.includes('src/components/editor/') ||
              id.includes('src/services/geminiService') ||
              id.includes('src/services/multiAIService')) {
            return 'script-generator';
          }
          
          // Analytics and monitoring chunk (non-critical)
          if (id.includes('src/services/analytics') ||
              id.includes('src/services/clarity') ||
              id.includes('src/services/tally') ||
              id.includes('src/services/performance')) {
            return 'analytics';
          }
          
          // Voice synthesis chunk (advanced feature)
          if (id.includes('src/services/voiceSynthesis') ||
              id.includes('src/components/editor/VoiceSynthesis') ||
              id.includes('elevenlabs') ||
              id.includes('azure-speech')) {
            return 'voice-synthesis';
          }
          
          // Collaboration features chunk (enterprise feature)
          if (id.includes('src/services/collaboration') ||
              id.includes('src/services/realtime') ||
              id.includes('websocket')) {
            return 'collaboration';
          }
          
          // Template system chunk (content management)
          if (id.includes('src/services/template') ||
              id.includes('src/services/project') ||
              id.includes('src/components/dashboard/')) {
            return 'templates';
          }
          
          // Other vendor libraries (shared utilities)
          if (id.includes('node_modules/') && !id.includes('node_modules/.vite')) {
            return 'vendor-utils';
          }
        }
      }
    },
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // 🚀 WEEK 7: Enhanced compression
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
        // 🚀 WEEK 7: Enhanced mangling
        properties: {
          regex: /^_/
        }
      },
    },
    
    // 🚀 WEEK 7: Reduced chunk size warning (more aggressive splitting)
    chunkSizeWarningLimit: 600, // Down from 1000
  },
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
})
