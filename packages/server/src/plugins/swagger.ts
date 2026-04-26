import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

export default fp(async (fastify) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Todo API',
        version: '1.0.0',
      },
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
  })
})
