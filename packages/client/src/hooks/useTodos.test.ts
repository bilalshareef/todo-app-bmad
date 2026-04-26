import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useTodos } from './useTodos'
import * as todoApi from '../api/todoApi'

jest.mock('../api/todoApi')

const mockedTodoApi = todoApi as jest.Mocked<typeof todoApi>

describe('useTodos', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('starts with empty todos array', () => {
    const { result } = renderHook(() => useTodos())
    expect(result.current.todos).toEqual([])
  })

  it('addTodo appends new todo to state', async () => {
    const mockTodo = {
      id: '1',
      text: 'Buy groceries',
      completed: false,
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    }

    mockedTodoApi.createTodo.mockResolvedValue(mockTodo)

    const { result } = renderHook(() => useTodos())

    await act(async () => {
      await result.current.addTodo('Buy groceries')
    })

    expect(result.current.todos).toEqual([mockTodo])
    expect(mockedTodoApi.createTodo).toHaveBeenCalledWith('Buy groceries')
  })

  it('addTodo appends multiple todos in order', async () => {
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

    await act(async () => {
      await result.current.addTodo('Buy groceries')
    })
    await act(async () => {
      await result.current.addTodo('Walk the dog')
    })

    expect(result.current.todos).toEqual([mockTodo1, mockTodo2])
  })

  it('addTodo re-throws on API failure', async () => {
    mockedTodoApi.createTodo.mockRejectedValue(new Error('Failed to create todo: 500'))

    const { result } = renderHook(() => useTodos())

    await expect(
      act(async () => {
        await result.current.addTodo('Buy groceries')
      }),
    ).rejects.toThrow('Failed to create todo: 500')

    expect(result.current.todos).toEqual([])
  })
})
