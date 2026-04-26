import Fastify, { type FastifyError } from 'fastify'
import helmetPlugin from './plugins/helmet.js'
import corsPlugin from './plugins/cors.js'
import prismaPlugin from './plugins/prisma.js'
import swaggerPlugin from './plugins/swagger.js'
import todosRoutes from './routes/todos.js'

try {
  process.loadEnvFile?.()
} catch (error) {
  const message = typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : ''

  if (!message.includes("ENOENT: no such file or directory, open '.env'")) {
    throw error
  }
}

export function createApp() {
  const app = Fastify({
    logger: true,
  })

  // Register plugins in correct order
  app.register(helmetPlugin)
  app.register(corsPlugin)
  app.register(prismaPlugin)
  app.register(swaggerPlugin)

  // Routes
  app.get('/health', async () => {
    return { status: 'ok' }
  })

  app.register(todosRoutes, { prefix: '/api/todos' })

  // Global error handler
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation) {
      return reply.send(error)
    }

    request.log.error(error)

    reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    })
  })

  return app
}
