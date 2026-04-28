import { renderHook, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useTodos } from './useTodos'
import * as todoApi from '../api/todoApi'

jest.mock('../api/todoApi')

const mockedTodoApi = todoApi as jest.Mocked<typeof todoApi>

describe('useTodos', () => {
  afterEach(() => {
    jest.resetAllMocks()
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

  it('calls onError with correct message when fetchTodos fails', async () => {
    mockedTodoApi.fetchTodos.mockRejectedValue(new Error('Network error'))
    const onError = jest.fn()

    renderHook(() => useTodos(onError))

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Couldn't load your tasks — check your connection")
    })
  })

  it('calls onError with correct message when addTodo fails', async () => {
    mockedTodoApi.fetchTodos.mockResolvedValue([])
    mockedTodoApi.createTodo.mockRejectedValue(new Error('Create failed'))
    const onError = jest.fn()

    const { result } = renderHook(() => useTodos(onError))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await expect(
      act(async () => {
        await result.current.addTodo('Test')
      }),
    ).rejects.toThrow('Create failed')

    expect(onError).toHaveBeenCalledWith("Couldn't save your task — check your connection and try again")
  })

  it('calls onError with correct message when toggleTodo fails', async () => {
    const mockTodo = {
      id: '1',
      text: 'Test',
      completed: false,
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    }
    mockedTodoApi.fetchTodos.mockResolvedValue([mockTodo])
    mockedTodoApi.updateTodo.mockRejectedValue(new Error('Update failed'))
    const onError = jest.fn()

    const { result } = renderHook(() => useTodos(onError))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.toggleTodo('1')
    })

    expect(onError).toHaveBeenCalledWith("Couldn't update — check your connection")
  })

  it('calls onError with correct message when deleteTodo fails', async () => {
    const mockTodo = {
      id: '1',
      text: 'Test',
      completed: false,
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    }
    mockedTodoApi.fetchTodos.mockResolvedValue([mockTodo])
    mockedTodoApi.deleteTodo.mockRejectedValue(new Error('Delete failed'))
    const onError = jest.fn()

    const { result } = renderHook(() => useTodos(onError))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deleteTodo('1')
    })

    expect(onError).toHaveBeenCalledWith("Couldn't delete — check your connection")
  })

  it('does not call onError on successful operations', async () => {
    const mockTodo = {
      id: '1',
      text: 'Test',
      completed: false,
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    }
    mockedTodoApi.fetchTodos.mockResolvedValue([mockTodo])
    mockedTodoApi.createTodo.mockResolvedValue({ ...mockTodo, id: '2', text: 'New' })
    mockedTodoApi.updateTodo.mockResolvedValue({ ...mockTodo, completed: true })
    mockedTodoApi.deleteTodo.mockResolvedValue({ id: '1' })
    const onError = jest.fn()

    const { result } = renderHook(() => useTodos(onError))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.addTodo('New')
    })
    await act(async () => {
      await result.current.toggleTodo('1')
    })
    await act(async () => {
      await result.current.deleteTodo('1')
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('addTodo still throws on failure for caller rollback', async () => {
    mockedTodoApi.fetchTodos.mockResolvedValue([])
    mockedTodoApi.createTodo.mockRejectedValue(new Error('API error'))
    const onError = jest.fn()

    const { result } = renderHook(() => useTodos(onError))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await expect(
      act(async () => {
        await result.current.addTodo('Test')
      }),
    ).rejects.toThrow('API error')

    // Both onError called AND error thrown
    expect(onError).toHaveBeenCalledTimes(1)
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

  it('toggleTodo flips completed state and updates todo in state', async () => {
    const mockTodo = {
      id: '1',
      text: 'Buy groceries',
      completed: false,
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    }
    const updatedTodo = { ...mockTodo, completed: true, updatedAt: '2026-04-26T00:00:01.000Z' }

    mockedTodoApi.fetchTodos.mockResolvedValue([mockTodo])
    mockedTodoApi.updateTodo.mockResolvedValue(updatedTodo)

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.toggleTodo('1')
    })

    expect(mockedTodoApi.updateTodo).toHaveBeenCalledWith('1', true)
    // After API resolves, state reflects server response (with correct updatedAt)
    expect(result.current.todos).toEqual([updatedTodo])
  })

  it('toggleTodo applies optimistic update immediately before API resolves', async () => {
    const mockTodo = {
      id: '1',
      text: 'Buy groceries',
      completed: false,
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    }
    const updatedTodo = { ...mockTodo, completed: true, updatedAt: '2026-04-26T00:00:01.000Z' }

    let resolveUpdate: ((todo: typeof updatedTodo) => void) | undefined
    mockedTodoApi.fetchTodos.mockResolvedValue([mockTodo])
    mockedTodoApi.updateTodo.mockImplementation(
      () => new Promise((resolve) => {
        resolveUpdate = resolve
      }),
    )

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Start toggle but don't resolve the API yet
    let togglePromise: Promise<void>
    act(() => {
      togglePromise = result.current.toggleTodo('1')
    })

    // State should be optimistically updated before API resolves
    expect(result.current.todos[0].completed).toBe(true)

    // Now resolve the API
    await act(async () => {
      resolveUpdate?.(updatedTodo)
      await togglePromise!
    })

    // After API resolves, state reflects server response
    expect(result.current.todos).toEqual([updatedTodo])
  })

  it('toggleTodo flips completed todo back to uncompleted', async () => {
    const mockTodo = {
      id: '1',
      text: 'Buy groceries',
      completed: true,
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    }
    const updatedTodo = { ...mockTodo, completed: false, updatedAt: '2026-04-26T00:00:01.000Z' }

    mockedTodoApi.fetchTodos.mockResolvedValue([mockTodo])
    mockedTodoApi.updateTodo.mockResolvedValue(updatedTodo)

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.toggleTodo('1')
    })

    expect(mockedTodoApi.updateTodo).toHaveBeenCalledWith('1', false)
    expect(result.current.todos).toEqual([updatedTodo])
  })

  it('toggleTodo does nothing for non-existent todo id', async () => {
    mockedTodoApi.fetchTodos.mockResolvedValue([])

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.toggleTodo('nonexistent')
    })

    expect(mockedTodoApi.updateTodo).not.toHaveBeenCalled()
  })

  it('toggleTodo preserves state when update fails', async () => {
    const mockTodo = {
      id: '1',
      text: 'Buy groceries',
      completed: false,
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    }

    let rejectUpdate: ((error: Error) => void) | undefined
    mockedTodoApi.fetchTodos.mockResolvedValue([mockTodo])
    mockedTodoApi.updateTodo.mockImplementation(
      () => new Promise((_resolve, reject) => {
        rejectUpdate = reject
      }),
    )

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Start toggle — state changes optimistically
    let togglePromise: Promise<void>
    act(() => {
      togglePromise = result.current.toggleTodo('1')
    })

    // State should be optimistically updated
    expect(result.current.todos[0].completed).toBe(true)

    // API fails — state should revert
    await act(async () => {
      rejectUpdate?.(new Error('Failed to update todo: 500'))
      await togglePromise!
    })

    expect(result.current.todos).toEqual([mockTodo])
  })

  it('toggleTodo ignores repeated clicks while a request is in flight', async () => {
    const mockTodo = {
      id: '1',
      text: 'Buy groceries',
      completed: false,
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    }
    const updatedTodo = { ...mockTodo, completed: true, updatedAt: '2026-04-26T00:00:01.000Z' }
    let resolveUpdate: ((todo: typeof updatedTodo) => void) | undefined

    mockedTodoApi.fetchTodos.mockResolvedValue([mockTodo])
    mockedTodoApi.updateTodo.mockImplementation(
      () => new Promise((resolve) => {
        resolveUpdate = resolve
      }),
    )

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      const firstToggle = result.current.toggleTodo('1')
      const secondToggle = result.current.toggleTodo('1')
      resolveUpdate?.(updatedTodo)
      await Promise.all([firstToggle, secondToggle])
    })

    expect(mockedTodoApi.updateTodo).toHaveBeenCalledTimes(1)
    // After API resolves, state reflects server response
    expect(result.current.todos).toEqual([updatedTodo])
  })

  it('deleteTodo removes todo from state after successful API call', async () => {
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

    mockedTodoApi.fetchTodos.mockResolvedValue([mockTodo1, mockTodo2])
    mockedTodoApi.deleteTodo.mockResolvedValue({ id: '1' })

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deleteTodo('1')
    })

    expect(mockedTodoApi.deleteTodo).toHaveBeenCalledWith('1')
    // Todo removed optimistically and stays removed after API success
    expect(result.current.todos).toEqual([mockTodo2])
  })

  it('deleteTodo applies optimistic removal immediately before API resolves', async () => {
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

    let resolveDelete: ((value: { id: string }) => void) | undefined
    mockedTodoApi.fetchTodos.mockResolvedValue([mockTodo1, mockTodo2])
    mockedTodoApi.deleteTodo.mockImplementation(
      () => new Promise((resolve) => {
        resolveDelete = resolve
      }),
    )

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Start delete but don't resolve the API yet
    let deletePromise: Promise<void>
    act(() => {
      deletePromise = result.current.deleteTodo('1')
    })

    // State should be optimistically updated — todo removed immediately
    expect(result.current.todos).toEqual([mockTodo2])

    // Now resolve the API
    await act(async () => {
      resolveDelete?.({ id: '1' })
      await deletePromise!
    })

    // After API resolves, todo still removed
    expect(result.current.todos).toEqual([mockTodo2])
  })

  it('deleteTodo preserves remaining todos', async () => {
    const mockTodos = [
      { id: '1', text: 'First', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
      { id: '2', text: 'Second', completed: true, createdAt: '2026-04-26T00:00:01.000Z', updatedAt: '2026-04-26T00:00:01.000Z' },
      { id: '3', text: 'Third', completed: false, createdAt: '2026-04-26T00:00:02.000Z', updatedAt: '2026-04-26T00:00:02.000Z' },
    ]

    mockedTodoApi.fetchTodos.mockResolvedValue(mockTodos)
    mockedTodoApi.deleteTodo.mockResolvedValue({ id: '2' })

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deleteTodo('2')
    })

    expect(result.current.todos).toEqual([mockTodos[0], mockTodos[2]])
  })

  it('deleteTodo leaves state unchanged when the API call fails', async () => {
    const mockTodos = [
      { id: '1', text: 'First', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
      { id: '2', text: 'Second', completed: true, createdAt: '2026-04-26T00:00:01.000Z', updatedAt: '2026-04-26T00:00:01.000Z' },
    ]

    let rejectDelete: ((error: Error) => void) | undefined
    mockedTodoApi.fetchTodos.mockResolvedValue(mockTodos)
    mockedTodoApi.deleteTodo.mockImplementation(
      () => new Promise((_resolve, reject) => {
        rejectDelete = reject
      }),
    )

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Start delete — state changes optimistically
    let deletePromise: Promise<void>
    act(() => {
      deletePromise = result.current.deleteTodo('1')
    })

    // State should be optimistically updated — todo removed
    expect(result.current.todos).toEqual([mockTodos[1]])

    // API fails — state should revert, todo restored to original position
    await act(async () => {
      rejectDelete?.(new Error('Failed to delete todo: 500'))
      await deletePromise!
    })

    expect(result.current.todos).toEqual(mockTodos)
  })

  it('deleteTodo restores todo to correct position on failure', async () => {
    const mockTodos = [
      { id: '1', text: 'A', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
      { id: '2', text: 'B', completed: false, createdAt: '2026-04-26T00:00:01.000Z', updatedAt: '2026-04-26T00:00:01.000Z' },
      { id: '3', text: 'C', completed: false, createdAt: '2026-04-26T00:00:02.000Z', updatedAt: '2026-04-26T00:00:02.000Z' },
    ]

    mockedTodoApi.fetchTodos.mockResolvedValue(mockTodos)
    mockedTodoApi.deleteTodo.mockRejectedValue(new Error('Delete failed'))

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Delete middle todo B — API fails — B is restored between A and C
    await act(async () => {
      await result.current.deleteTodo('2')
    })

    expect(result.current.todos).toEqual(mockTodos)
    expect(result.current.todos[0].text).toBe('A')
    expect(result.current.todos[1].text).toBe('B')
    expect(result.current.todos[2].text).toBe('C')
  })

  it('deleteTodo restores relative order when another optimistic delete succeeds first', async () => {
    const mockTodos = [
      { id: '1', text: 'A', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
      { id: '2', text: 'B', completed: false, createdAt: '2026-04-26T00:00:01.000Z', updatedAt: '2026-04-26T00:00:01.000Z' },
      { id: '3', text: 'C', completed: false, createdAt: '2026-04-26T00:00:02.000Z', updatedAt: '2026-04-26T00:00:02.000Z' },
      { id: '4', text: 'D', completed: false, createdAt: '2026-04-26T00:00:03.000Z', updatedAt: '2026-04-26T00:00:03.000Z' },
    ]

    let resolveDeleteA: ((value: { id: string }) => void) | undefined
    let rejectDeleteB: ((error: Error) => void) | undefined

    mockedTodoApi.fetchTodos.mockResolvedValue(mockTodos)
    mockedTodoApi.deleteTodo.mockImplementation((id: string) => {
      if (id === '2') {
        return new Promise((_resolve, reject) => {
          rejectDeleteB = reject
        })
      }

      if (id === '1') {
        return new Promise((resolve) => {
          resolveDeleteA = resolve
        })
      }

      return Promise.resolve({ id })
    })

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let deleteBPromise: Promise<void>
    act(() => {
      deleteBPromise = result.current.deleteTodo('2')
    })

    expect(result.current.todos.map((todo) => todo.id)).toEqual(['1', '3', '4'])

    let deleteAPromise: Promise<void>
    act(() => {
      deleteAPromise = result.current.deleteTodo('1')
    })

    expect(result.current.todos.map((todo) => todo.id)).toEqual(['3', '4'])

    await act(async () => {
      resolveDeleteA?.({ id: '1' })
      await deleteAPromise!
    })

    await act(async () => {
      rejectDeleteB?.(new Error('Delete failed'))
      await deleteBPromise!
    })

    expect(result.current.todos.map((todo) => todo.id)).toEqual(['2', '3', '4'])
  })
})
