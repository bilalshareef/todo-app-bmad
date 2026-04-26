import { createTodo, fetchTodos } from './todoApi'

describe('todoApi', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  describe('fetchTodos', () => {
    it('sends GET request to /api/todos', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })

      await fetchTodos()

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/todos')
    })

    it('returns parsed Todo array on success', async () => {
      const mockTodos = [
        { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
        { id: '2', text: 'Walk dog', completed: true, createdAt: '2026-04-26T00:00:01.000Z', updatedAt: '2026-04-26T00:00:01.000Z' },
      ]

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: mockTodos }),
      })

      const result = await fetchTodos()
      expect(result).toEqual(mockTodos)
    })

    it('throws on non-OK response', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(fetchTodos()).rejects.toThrow('Failed to fetch todos: 500')
    })
  })

  describe('createTodo', () => {
    it('sends POST request with correct URL, method, headers, and body', async () => {
      const mockTodo = {
        id: '1',
        text: 'Buy groceries',
        completed: false,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      }

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: mockTodo }),
      })

      await createTodo('Buy groceries')

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Buy groceries' }),
      })
    })

    it('returns parsed Todo on success', async () => {
      const mockTodo = {
        id: '1',
        text: 'Buy groceries',
        completed: false,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      }

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: mockTodo }),
      })

      const result = await createTodo('Buy groceries')
      expect(result).toEqual(mockTodo)
    })

    it('throws on non-OK response', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
      })

      await expect(createTodo('')).rejects.toThrow('Failed to create todo: 400')
    })
  })
})
