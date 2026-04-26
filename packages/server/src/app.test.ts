import { createApp } from './app.js'

let app: ReturnType<typeof createApp>
const originalDatabaseUrl = process.env.DATABASE_URL
const testDatabaseUrl = new URL(originalDatabaseUrl ?? 'postgresql://user:password@localhost:5432/todoapp')

testDatabaseUrl.searchParams.set('schema', 'app_test')

beforeAll(() => {
  process.env.DATABASE_URL = testDatabaseUrl.toString()
})

beforeEach(async () => {
  app = createApp()
  await app.ready()
  await app.prisma.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS "app_test"')
  await app.prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "app_test"."Todo" (
      "id" TEXT NOT NULL,
      "text" TEXT NOT NULL,
      "completed" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
    )
  `)
  await app.prisma.todo.deleteMany()
})

afterEach(async () => {
  await app.prisma.todo.deleteMany()
  await app.close()
})

afterAll(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL
    return
  }

  process.env.DATABASE_URL = originalDatabaseUrl
})

describe('Health check', () => {
  it('GET /health returns { status: "ok" }', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
  })
})

describe('Prisma plugin', () => {
  it('connects to the database and can create/read a Todo', async () => {
    const todo = await app.prisma.todo.create({
      data: { text: 'Test todo' },
    })

    expect(todo.id).toBeDefined()
    expect(todo.text).toBe('Test todo')
    expect(todo.completed).toBe(false)
    expect(todo.createdAt).toBeInstanceOf(Date)
    expect(todo.updatedAt).toBeInstanceOf(Date)

    const found = await app.prisma.todo.findUnique({ where: { id: todo.id } })
    expect(found).not.toBeNull()
    expect(found!.text).toBe('Test todo')

    // Clean up
    await app.prisma.todo.delete({ where: { id: todo.id } })
  })
})

describe('Todo routes', () => {
  it('GET /api/todos returns { data: [] }', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/todos',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ data: [] })
  })
})

describe('Global error handler', () => {
  it('returns 500 without internal details for unhandled errors', async () => {
    // Create a separate app instance with the error route registered before ready()
    const errorApp = createApp()
    errorApp.get('/test-error', async () => {
      throw new Error('Something went wrong internally')
    })
    await errorApp.ready()

    const response = await errorApp.inject({
      method: 'GET',
      url: '/test-error',
    })

    expect(response.statusCode).toBe(500)
    const body = response.json()
    expect(body).toEqual({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    })
    expect(body.message).not.toContain('Something went wrong internally')

    await errorApp.close()
  })

  it('preserves Fastify validation error formatting for schema validation failures', async () => {
    const validationApp = createApp()
    validationApp.post(
      '/test-validation',
      {
        schema: {
          body: {
            type: 'object',
            required: ['text'],
            properties: {
              text: { type: 'string' },
            },
          },
        },
      },
      async () => ({ ok: true }),
    )
    await validationApp.ready()

    const response = await validationApp.inject({
      method: 'POST',
      url: '/test-validation',
      payload: {},
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      code: 'FST_ERR_VALIDATION',
    })

    await validationApp.close()
  })
})

describe('CORS', () => {
  it('includes CORS headers in response', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/health',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'GET',
      },
    })

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })
})

describe('Swagger', () => {
  it('Swagger UI is accessible at /docs in development', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/docs/',
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/html')
  })
})
