import { FastifyPluginAsync } from 'fastify'

const todosRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    return { data: [] }
  })
}

export default todosRoutes
