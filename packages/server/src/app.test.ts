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

describe('GET /api/todos', () => {
  it('returns all todos when multiple exist', async () => {
    await app.prisma.todo.create({ data: { text: 'First todo' } })
    await app.prisma.todo.create({ data: { text: 'Second todo' } })
    await app.prisma.todo.create({ data: { text: 'Third todo' } })

    const response = await app.inject({
      method: 'GET',
      url: '/api/todos',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data).toHaveLength(3)
    expect(body.data[0].text).toBe('First todo')
    expect(body.data[1].text).toBe('Second todo')
    expect(body.data[2].text).toBe('Third todo')
  })

  it('returns todos with all expected fields', async () => {
    await app.prisma.todo.create({ data: { text: 'Test fields' } })

    const response = await app.inject({
      method: 'GET',
      url: '/api/todos',
    })

    expect(response.statusCode).toBe(200)
    const todo = response.json().data[0]
    expect(todo.id).toBeDefined()
    expect(todo.text).toBe('Test fields')
    expect(todo.completed).toBe(false)
    expect(todo.createdAt).toBeDefined()
    expect(todo.updatedAt).toBeDefined()
    expect(new Date(todo.createdAt).toISOString()).toBe(todo.createdAt)
    expect(new Date(todo.updatedAt).toISOString()).toBe(todo.updatedAt)
  })

  it('returns todos ordered by createdAt ascending', async () => {
    const todo1 = await app.prisma.todo.create({
      data: {
        id: 'todo-b',
        text: 'Middle',
        createdAt: new Date('2026-04-26T00:00:01.000Z'),
      },
    })
    const todo2 = await app.prisma.todo.create({
      data: {
        id: 'todo-c',
        text: 'Newest',
        createdAt: new Date('2026-04-26T00:00:02.000Z'),
      },
    })
    const todo3 = await app.prisma.todo.create({
      data: {
        id: 'todo-a',
        text: 'Oldest',
        createdAt: new Date('2026-04-26T00:00:00.000Z'),
      },
    })

    await app.prisma.todo.create({
      data: {
        id: 'todo-d',
        text: 'Same timestamp later id',
        createdAt: new Date('2026-04-26T00:00:02.000Z'),
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/todos',
    })

    const body = response.json()
    expect(body.data.map((todo: { id: string }) => todo.id)).toEqual([
      todo3.id,
      todo1.id,
      todo2.id,
      'todo-d',
    ])
  })
})

describe('POST /api/todos', () => {
  it('creates a todo with valid body and returns 201 with data envelope', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: 'Buy groceries' },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.data).toMatchObject({
      text: 'Buy groceries',
      completed: false,
    })
    expect(body.data.id).toBeDefined()
    expect(body.data.createdAt).toBeDefined()
    expect(body.data.updatedAt).toBeDefined()
    // Verify ISO date strings
    expect(new Date(body.data.createdAt).toISOString()).toBe(body.data.createdAt)
    expect(new Date(body.data.updatedAt).toISOString()).toBe(body.data.updatedAt)
  })

  it('returns 400 when body is empty object', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: {},
    })

    expect(response.statusCode).toBe(400)
    const body = response.json()
    expect(body.statusCode).toBe(400)
    expect(body.error).toBe('Bad Request')
    expect(body.code).toBe('FST_ERR_VALIDATION')
  })

  it('returns 400 when text is empty string', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: '' },
    })

    expect(response.statusCode).toBe(400)
    const body = response.json()
    expect(body.statusCode).toBe(400)
    expect(body.code).toBe('FST_ERR_VALIDATION')
  })

  it('returns 400 when text is whitespace only', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: '   ' },
    })

    expect(response.statusCode).toBe(400)
    const body = response.json()
    expect(body.statusCode).toBe(400)
    expect(body.error).toBe('Bad Request')
    expect(body.code).toBe('FST_ERR_VALIDATION')
  })

  it('trims whitespace from valid text', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: '  Buy groceries  ' },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.data.text).toBe('Buy groceries')
  })

  it('returns 400 when text field is missing', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { title: 'wrong field' },
    })

    expect(response.statusCode).toBe(400)
  })
})

describe('PATCH /api/todos/:id', () => {
  it('marks a todo as completed and returns 200 with updated todo', async () => {
    const created = await app.prisma.todo.create({ data: { text: 'Test completion' } })

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/todos/${created.id}`,
      payload: { completed: true },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data).toMatchObject({
      id: created.id,
      text: 'Test completion',
      completed: true,
    })
    expect(body.data.updatedAt).toBeDefined()
  })

  it('marks a completed todo as uncompleted and returns 200', async () => {
    const created = await app.prisma.todo.create({ data: { text: 'Test uncompletion', completed: true } })

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/todos/${created.id}`,
      payload: { completed: false },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data).toMatchObject({
      id: created.id,
      text: 'Test uncompletion',
      completed: false,
    })
  })

  it('returns 400 when completed field is missing', async () => {
    const created = await app.prisma.todo.create({ data: { text: 'Test missing field' } })

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/todos/${created.id}`,
      payload: {},
    })

    expect(response.statusCode).toBe(400)
    const body = response.json()
    expect(body.statusCode).toBe(400)
    expect(body.error).toBe('Bad Request')
  })

  it('returns 404 for non-existent todo id', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/todos/00000000-0000-0000-0000-000000000000',
      payload: { completed: true },
    })

    expect(response.statusCode).toBe(404)
    const body = response.json()
    expect(body.statusCode).toBe(404)
    expect(body.error).toBe('Not Found')
    expect(body.message).toBe('Todo not found')
  })

  it('returns 400 for malformed todo id', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/todos/not-a-uuid',
      payload: { completed: true },
    })

    expect(response.statusCode).toBe(400)
    const body = response.json()
    expect(body.statusCode).toBe(400)
    expect(body.error).toBe('Bad Request')
  })

  it('returns 400 when body has invalid type for completed', async () => {
    const created = await app.prisma.todo.create({ data: { text: 'Test invalid type' } })

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/todos/${created.id}`,
      payload: { completed: 'yes' },
    })

    expect(response.statusCode).toBe(400)
    const body = response.json()
    expect(body.statusCode).toBe(400)
    expect(body.error).toBe('Bad Request')
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
