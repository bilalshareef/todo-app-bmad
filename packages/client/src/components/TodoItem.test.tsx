import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TodoItem } from './TodoItem'

describe('TodoItem', () => {
  const mockOnToggle = jest.fn()

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders active todo with text-near-black and no line-through', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} />)
    const item = screen.getByText('Buy groceries')
    expect(item).toBeInTheDocument()
    expect(item.className).toContain('text-near-black')
    expect(item.className).not.toContain('line-through')
  })

  it('renders completed todo with text-completed-gray and line-through', () => {
    const todo = { id: '2', text: 'Walk the dog', completed: true, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} />)
    const item = screen.getByText('Walk the dog')
    expect(item).toBeInTheDocument()
    expect(item.className).toContain('text-completed-gray')
    expect(item.className).toContain('line-through')
  })

  it('renders circle checkbox for unchecked todo', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    const { container } = render(<TodoItem todo={todo} onToggle={mockOnToggle} />)
    const checkbox = container.querySelector('span.rounded-full')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox?.className).toContain('border-[#D1D5DB]')
    expect(checkbox?.className).not.toContain('bg-accent-blue')
  })

  it('renders filled blue checkbox with checkmark for completed todo', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: true, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    const { container } = render(<TodoItem todo={todo} onToggle={mockOnToggle} />)
    const checkbox = container.querySelector('span.rounded-full')
    expect(checkbox?.className).toContain('bg-accent-blue')
    expect(checkbox?.className).toContain('border-accent-blue')
    const svg = checkbox?.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('calls onToggle with todo id when row is clicked', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Buy groceries' }))
    expect(mockOnToggle).toHaveBeenCalledWith('1')
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('supports keyboard toggling via the row control', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} />)

    fireEvent.keyDown(screen.getByRole('checkbox', { name: 'Buy groceries' }), { key: ' ', code: 'Space' })

    expect(mockOnToggle).toHaveBeenCalledWith('1')
  })

  it('exposes checkbox state and text transition classes', () => {
    const todo = { id: '2', text: 'Walk the dog', completed: true, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} />)

    expect(screen.getByRole('checkbox', { name: 'Walk the dog' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('Walk the dog').className).toContain('transition-colors')
    expect(screen.getByText('Walk the dog').className).toContain('duration-150')
  })

  it('does not render checkmark svg for unchecked todo', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    const { container } = render(<TodoItem todo={todo} onToggle={mockOnToggle} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })
})
