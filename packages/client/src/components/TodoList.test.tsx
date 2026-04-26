import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TodoList } from './TodoList'
import type { Todo } from '../types/todo'

describe('TodoList', () => {
  it('renders LoadingIndicator when loading is true', () => {
    render(<TodoList todos={[]} loading={true} />)
    expect(screen.getByText('Loading todos...')).toBeInTheDocument()
  })

  it('renders EmptyState when loading is false and todos is empty', () => {
    render(<TodoList todos={[]} loading={false} />)
    expect(screen.getByText('All caught up! Add a task to get started.')).toBeInTheDocument()
  })

  it('renders todo items when loading is false and todos exist', () => {
    const todos: Todo[] = [
      { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
      { id: '2', text: 'Walk the dog', completed: true, createdAt: '2026-04-26T00:00:01.000Z', updatedAt: '2026-04-26T00:00:01.000Z' },
    ]
    render(<TodoList todos={todos} loading={false} />)
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByText('Walk the dog')).toBeInTheDocument()
    expect(screen.getByLabelText('Todo list')).toBeInTheDocument()
  })

  it('does not render todo list when loading', () => {
    const todos: Todo[] = [
      { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
    ]
    render(<TodoList todos={todos} loading={true} />)
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument()
  })
})
