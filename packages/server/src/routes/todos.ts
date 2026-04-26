import { FastifyPluginAsync } from 'fastify'
import { createTodo } from '../services/todoService.js'

const createTodoSchema = {
  body: {
    type: 'object' as const,
    required: ['text'],
    properties: {
      text: { type: 'string', minLength: 1, pattern: '.*\\S.*' },
    },
    additionalProperties: false,
  },
  response: {
    201: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            text: { type: 'string' },
            completed: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
      },
    },
  },
}

const todosRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    return { data: [] }
  })

  fastify.post('/', { schema: createTodoSchema }, async (request, reply) => {
    const { text } = request.body as { text: string }
    const todo = await createTodo(fastify.prisma, text)
    return reply.status(201).send({ data: todo })
  })
}

export default todosRoutes
