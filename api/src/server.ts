/**
 * Ponto de entrada do servidor.
 * Sobe a aplicação Express na porta configurada e
 * garante que conexões do Prisma são encerradas corretamente
 * quando o processo é interrompido.
 */

import { app } from './app.js'
import { prisma } from './lib/prisma.js'
import { env } from './config/env.js'

const server = app.listen(env.port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${env.port}`)
  console.log(`   Ambiente: ${env.nodeEnv}`)
})

// Encerra conexões do Prisma ao parar o servidor (Ctrl+C ou SIGTERM no deploy)
async function shutdown() {
  console.log('\nEncerrando servidor...')
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
