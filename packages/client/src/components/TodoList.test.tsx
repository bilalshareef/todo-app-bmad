import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TodoList } from './TodoList'
import type { Todo } from '../types/todo'

describe('TodoList', () => {
  const mockOnToggle = jest.fn()
  const mockOnDelete = jest.fn()

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders LoadingIndicator when loading is true', () => {
    render(<TodoList todos={[]} loading={true} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    expect(screen.getByText('Loading todos...')).toBeInTheDocument()
  })

  it('renders EmptyState when loading is false and todos is empty', () => {
    render(<TodoList todos={[]} loading={false} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    expect(screen.getByText('All caught up! Add a task to get started.')).toBeInTheDocument()
  })

  it('renders todo items when loading is false and todos exist', () => {
    const todos: Todo[] = [
      { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
      { id: '2', text: 'Walk the dog', completed: true, createdAt: '2026-04-26T00:00:01.000Z', updatedAt: '2026-04-26T00:00:01.000Z' },
    ]
    render(<TodoList todos={todos} loading={false} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByText('Walk the dog')).toBeInTheDocument()
    expect(screen.getByLabelText('Todo list')).toHaveClass('divide-y', 'divide-[#F3F4F6]')
  })

  it('does not render todo list when loading', () => {
    const todos: Todo[] = [
      { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
    ]
    render(<TodoList todos={todos} loading={true} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument()
  })

  it('forwards onToggle to TodoItem components', () => {
    const todos: Todo[] = [
      { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
    ]
    render(<TodoList todos={todos} loading={false} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Buy groceries' }))
    expect(mockOnToggle).toHaveBeenCalledWith('1')
  })

  it('forwards onDelete to TodoItem components', () => {
    const todos: Todo[] = [
      { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
    ]
    render(<TodoList todos={todos} loading={false} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    fireEvent.click(screen.getByLabelText('Delete task: Buy groceries'))
    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('renders a persistent aria-live region regardless of loading state', () => {
    const { container } = render(<TodoList todos={[]} loading={false} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeInTheDocument()
  })

  it('shows "Loading todos..." in aria-live region when loading is true', () => {
    const { container } = render(<TodoList todos={[]} loading={true} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toHaveTextContent('Loading todos...')
  })

  it('has empty aria-live region when loading is false and todos exist', () => {
    const todos: Todo[] = [
      { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' },
    ]
    const { container } = render(<TodoList todos={todos} loading={false} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeEmptyDOMElement()
  })
})
