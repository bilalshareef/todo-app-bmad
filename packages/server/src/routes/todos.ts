import { FastifyPluginAsync } from 'fastify'
import { createTodo, getAllTodos, updateTodo, deleteTodo } from '../services/todoService.js'

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

const getAllTodosSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
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
  },
}

const updateTodoSchema = {
  params: {
    type: 'object' as const,
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
  body: {
    type: 'object' as const,
    required: ['completed'],
    properties: {
      completed: { type: 'boolean' },
    },
    additionalProperties: false,
  },
  response: {
    200: {
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
    404: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
}

const deleteTodoSchema = {
  params: {
    type: 'object' as const,
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    404: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
}

const todosRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', { schema: getAllTodosSchema }, async () => {
    const todos = await getAllTodos(fastify.prisma)
    return { data: todos }
  })

  fastify.post('/', { schema: createTodoSchema }, async (request, reply) => {
    const { text } = request.body as { text: string }
    const todo = await createTodo(fastify.prisma, text)
    return reply.status(201).send({ data: todo })
  })

  fastify.patch('/:id', { schema: updateTodoSchema }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { completed } = request.body as { completed: boolean }
    try {
      const todo = await updateTodo(fastify.prisma, id, { completed })
      return { data: todo }
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2025') {
        return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Todo not found' })
      }
      throw error
    }
  })

  fastify.delete('/:id', { schema: deleteTodoSchema }, async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const todo = await deleteTodo(fastify.prisma, id)
      return { data: { id: todo.id } }
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2025') {
        return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Todo not found' })
      }
      throw error
    }
  })
}

export default todosRoutes
