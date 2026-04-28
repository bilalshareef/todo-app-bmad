import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import App from './App'
import * as todoApi from './api/todoApi'

jest.mock('./api/todoApi')

const mockedTodoApi = todoApi as jest.Mocked<typeof todoApi>

describe('App', () => {
  beforeEach(() => {
    mockedTodoApi.fetchTodos.mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should render without crashing', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(<App />)
    })
    await act(async () => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('should render "Todos" heading', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(<App />)
    })
    const heading = container.querySelector('h1')
    const input = container.querySelector('input[aria-label="Add a new task"]')
    const shellContent = input?.parentElement
    const listWrapper = input?.nextElementSibling

    expect(heading).not.toBeNull()
    expect(heading!.textContent).toBe('Todos')
    expect(input).not.toBeNull()
    expect(shellContent?.className).toContain('mt-6')
    expect(listWrapper).not.toBeNull()
    expect(listWrapper?.className).toContain('mt-6')

    await act(async () => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('shows the empty state after deleting the last todo', async () => {
    mockedTodoApi.fetchTodos.mockResolvedValue([
      {
        id: '1',
        text: 'Only todo',
        completed: false,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      },
    ])
    mockedTodoApi.deleteTodo.mockResolvedValue({ id: '1' })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Only todo')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Delete task: Only todo'))

    await waitFor(() => {
      expect(mockedTodoApi.deleteTodo).toHaveBeenCalledWith('1')
      expect(screen.getByText('All caught up! Add a task to get started.')).toBeInTheDocument()
    })
  })

  it('shows toast when an error occurs', async () => {
    mockedTodoApi.fetchTodos.mockRejectedValue(new Error('Network error'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText("Couldn't load your tasks — check your connection")).toBeInTheDocument()
    })
  })

  it('shows toast when creating a todo fails and preserves the input value', async () => {
    mockedTodoApi.createTodo.mockRejectedValue(new Error('Create failed'))
    const user = userEvent.setup()

    render(<App />)

    const input = screen.getByLabelText('Add a new task') as HTMLInputElement
    await user.type(input, 'Buy groceries{Enter}')

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText("Couldn't save your task — check your connection and try again")).toBeInTheDocument()
    })

    expect(input.value).toBe('Buy groceries')
  })

  it('shows toast when toggling a todo fails', async () => {
    mockedTodoApi.fetchTodos.mockResolvedValue([
      {
        id: '1',
        text: 'Only todo',
        completed: false,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      },
    ])
    mockedTodoApi.updateTodo.mockRejectedValue(new Error('Update failed'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByLabelText('Only todo')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Only todo'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText("Couldn't update — check your connection")).toBeInTheDocument()
    })
  })

  it('shows toast when deleting a todo fails', async () => {
    mockedTodoApi.fetchTodos.mockResolvedValue([
      {
        id: '1',
        text: 'Only todo',
        completed: false,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      },
    ])
    mockedTodoApi.deleteTodo.mockRejectedValue(new Error('Delete failed'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByLabelText('Delete task: Only todo')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Delete task: Only todo'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText("Couldn't delete — check your connection")).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Only todo' })).toHaveFocus()
    })
  })

  it('moves focus to next todo toggle button after deleting a todo', async () => {
    const user = userEvent.setup()
    mockedTodoApi.fetchTodos.mockResolvedValue([
      {
        id: '1',
        text: 'First todo',
        completed: false,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      },
      {
        id: '2',
        text: 'Second todo',
        completed: false,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      },
    ])
    mockedTodoApi.deleteTodo.mockResolvedValue({ id: '1' })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument()
    })

    const deleteButton = screen.getByLabelText('Delete task: First todo')
    deleteButton.focus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.queryByText('First todo')).not.toBeInTheDocument()
    })

    // requestAnimationFrame callback needs to fire
    await waitFor(() => {
      const secondToggle = screen.getByRole('checkbox', { name: 'Second todo' })
      expect(secondToggle).toHaveFocus()
    })
  })

  it('moves focus to previous todo toggle button after deleting the last todo in list', async () => {
    const user = userEvent.setup()
    mockedTodoApi.fetchTodos.mockResolvedValue([
      {
        id: '1',
        text: 'First todo',
        completed: false,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      },
      {
        id: '2',
        text: 'Second todo',
        completed: false,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      },
    ])
    mockedTodoApi.deleteTodo.mockResolvedValue({ id: '2' })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Second todo')).toBeInTheDocument()
    })

    const deleteButton = screen.getByLabelText('Delete task: Second todo')
    deleteButton.focus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.queryByText('Second todo')).not.toBeInTheDocument()
    })

    await waitFor(() => {
      const firstToggle = screen.getByRole('checkbox', { name: 'First todo' })
      expect(firstToggle).toHaveFocus()
    })
  })

  it('moves focus to input field after deleting the only todo', async () => {
    const user = userEvent.setup()
    mockedTodoApi.fetchTodos.mockResolvedValue([
      {
        id: '1',
        text: 'Only todo',
        completed: false,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      },
    ])
    mockedTodoApi.deleteTodo.mockResolvedValue({ id: '1' })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Only todo')).toBeInTheDocument()
    })

    const deleteButton = screen.getByLabelText('Delete task: Only todo')
    deleteButton.focus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.queryByText('Only todo')).not.toBeInTheDocument()
    })

    await waitFor(() => {
      const input = screen.getByLabelText('Add a new task')
      expect(input).toHaveFocus()
    })
  })
})
