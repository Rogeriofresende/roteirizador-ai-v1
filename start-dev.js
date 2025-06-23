#!/usr/bin/env node

import { createServer } from 'vite'
import react from '@vitejs/plugin-react'

async function startServer() {
  try {
    const server = await createServer({
      plugins: [react()],
      server: {
        port: 5173,
        host: true,
        open: false
      },
      resolve: {
        alias: {
          '@': '/src'
        }
      }
    })

    await server.listen()
    console.log('\n🚀 Servidor rodando em: http://localhost:5173')
    console.log('✅ Vite funcionando corretamente!')

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message)
    process.exit(1)
  }
}

startServer() 