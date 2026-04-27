import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
})
