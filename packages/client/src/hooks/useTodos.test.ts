import { renderHook, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useTodos } from './useTodos'
import * as todoApi from '../api/todoApi'

jest.mock('../api/todoApi')

const mockedTodoApi = todoApi as jest.Mocked<typeof todoApi>

describe('useTodos', () => {
  const originalConsoleError = console.error

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.resetAllMocks()
    console.error = originalConsoleError
  })

  it('starts with loading true', () => {
    mockedTodoApi.fetchTodos.mockReturnValue(new Promise(() => {})) // never resolves
    const { result } = renderHook(() => useTodos())
    expect(result.current.loading).toBe(true)
  })

  it('sets loading to false after fetch completes', async () => {
    mockedTodoApi.fetchTodos.mockResolvedValue([])
    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('populates todos from fetchTodos on mount', async () => {
    const mockTodos = [
      { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
      { id: '2', text: 'Walk dog', completed: true, createdAt: '2026-04-26T00:00:01.000Z', updatedAt: '2026-04-26T00:00:01.000Z' },
    ]
    mockedTodoApi.fetchTodos.mockResolvedValue(mockTodos)

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.todos).toEqual(mockTodos)
    })
    expect(result.current.loading).toBe(false)
  })

  it('sets loading to false even on fetch error', async () => {
    mockedTodoApi.fetchTodos.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.todos).toEqual([])
  })

  it('keeps todos added during loading when fetch resolves later', async () => {
    let resolveFetch: ((todos: Array<{ id: string, text: string, completed: boolean, createdAt: string, updatedAt: string }>) => void) | undefined
    mockedTodoApi.fetchTodos.mockImplementation(
      () => new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    const createdTodo = {
      id: '2',
      text: 'Created while loading',
      completed: false,
      createdAt: '2026-04-26T00:00:01.000Z',
      updatedAt: '2026-04-26T00:00:01.000Z',
    }

    mockedTodoApi.createTodo.mockResolvedValue(createdTodo)

    const { result } = renderHook(() => useTodos())

    await act(async () => {
      await result.current.addTodo('Created while loading')
    })

    await act(async () => {
      resolveFetch?.([
        {
          id: '1',
          text: 'Fetched todo',
          completed: false,
          createdAt: '2026-04-26T00:00:00.000Z',
          updatedAt: '2026-04-26T00:00:00.000Z',
        },
      ])
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.todos).toEqual([
      {
        id: '1',
        text: 'Fetched todo',
        completed: false,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      },
      createdTodo,
    ])
  })

  it('does not update state after unmount when fetch resolves late', async () => {
    let resolveFetch: ((todos: Array<{ id: string, text: string, completed: boolean, createdAt: string, updatedAt: string }>) => void) | undefined
    mockedTodoApi.fetchTodos.mockImplementation(
      () => new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    const { unmount } = renderHook(() => useTodos())

    unmount()

    await act(async () => {
      resolveFetch?.([
        {
          id: '1',
          text: 'Late todo',
          completed: false,
          createdAt: '2026-04-26T00:00:00.000Z',
          updatedAt: '2026-04-26T00:00:00.000Z',
        },
      ])
    })

    expect(console.error).not.toHaveBeenCalled()
  })

  it('addTodo appends new todo to state', async () => {
    mockedTodoApi.fetchTodos.mockResolvedValue([])
    const mockTodo = {
      id: '1',
      text: 'Buy groceries',
      completed: false,
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    }

    mockedTodoApi.createTodo.mockResolvedValue(mockTodo)

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.addTodo('Buy groceries')
    })

    expect(result.current.todos).toEqual([mockTodo])
    expect(mockedTodoApi.createTodo).toHaveBeenCalledWith('Buy groceries')
  })

  it('addTodo appends multiple todos in order', async () => {
    mockedTodoApi.fetchTodos.mockResolvedValue([])
    const mockTodo1 = {
      id: '1',
      text: 'Buy groceries',
      completed: false,
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    }
    const mockTodo2 = {
      id: '2',
      text: 'Walk the dog',
      completed: false,
      createdAt: '2026-04-26T00:00:01.000Z',
      updatedAt: '2026-04-26T00:00:01.000Z',
    }

    mockedTodoApi.createTodo
      .mockResolvedValueOnce(mockTodo1)
      .mockResolvedValueOnce(mockTodo2)

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.addTodo('Buy groceries')
    })
    await act(async () => {
      await result.current.addTodo('Walk the dog')
    })

    expect(result.current.todos).toEqual([mockTodo1, mockTodo2])
  })

  it('addTodo re-throws on API failure', async () => {
    mockedTodoApi.fetchTodos.mockResolvedValue([])
    mockedTodoApi.createTodo.mockRejectedValue(new Error('Failed to create todo: 500'))

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await expect(
      act(async () => {
        await result.current.addTodo('Buy groceries')
      }),
    ).rejects.toThrow('Failed to create todo: 500')

    expect(result.current.todos).toEqual([])
  })
})
