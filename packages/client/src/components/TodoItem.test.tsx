import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TodoItem } from './TodoItem'

describe('TodoItem', () => {
  const mockOnToggle = jest.fn()
  const mockOnDelete = jest.fn()

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders active todo with text-near-black and no line-through', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const item = screen.getByText('Buy groceries')
    expect(item).toBeInTheDocument()
    expect(item.className).toContain('text-near-black')
    expect(item.className).not.toContain('line-through')
  })

  it('renders completed todo with text-completed-gray and line-through', () => {
    const todo = { id: '2', text: 'Walk the dog', completed: true, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const item = screen.getByText('Walk the dog')
    expect(item).toBeInTheDocument()
    expect(item.className).toContain('text-completed-gray')
    expect(item.className).toContain('line-through')
  })

  it('renders circle checkbox for unchecked todo', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    const { container } = render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const checkbox = container.querySelector('span.rounded-full')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox?.className).toContain('border-[#D1D5DB]')
    expect(checkbox?.className).not.toContain('bg-accent-blue')
  })

  it('renders filled blue checkbox with checkmark for completed todo', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: true, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    const { container } = render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const checkbox = container.querySelector('span.rounded-full')
    expect(checkbox?.className).toContain('bg-accent-blue')
    expect(checkbox?.className).toContain('border-accent-blue')
    const svg = checkbox?.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('calls onToggle with todo id when row is clicked', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Buy groceries' }))
    expect(mockOnToggle).toHaveBeenCalledWith('1')
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('supports keyboard toggling via the row control', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    fireEvent.keyDown(screen.getByRole('checkbox', { name: 'Buy groceries' }), { key: ' ', code: 'Space' })

    expect(mockOnToggle).toHaveBeenCalledWith('1')
  })

  it('exposes checkbox state and text transition classes', () => {
    const todo = { id: '2', text: 'Walk the dog', completed: true, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    expect(screen.getByRole('checkbox', { name: 'Walk the dog' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('Walk the dog').className).toContain('transition-colors')
    expect(screen.getByText('Walk the dog').className).toContain('duration-150')
  })

  it('does not render checkmark svg for unchecked todo', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    const { container } = render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('renders delete button with × text', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const deleteButton = screen.getByLabelText('Delete task: Buy groceries')
    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton.textContent).toBe('×')
  })

  it('calls onDelete with todo id when delete button is clicked', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    fireEvent.click(screen.getByLabelText('Delete task: Buy groceries'))
    expect(mockOnDelete).toHaveBeenCalledWith('1')
    expect(mockOnDelete).toHaveBeenCalledTimes(1)
  })

  it('clicking delete button does NOT call onToggle', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    fireEvent.click(screen.getByLabelText('Delete task: Buy groceries'))
    expect(mockOnToggle).not.toHaveBeenCalled()
  })

  it('delete button has correct aria-label', () => {
    const todo = { id: '1', text: 'Walk the dog', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    expect(screen.getByLabelText('Delete task: Walk the dog')).toBeInTheDocument()
  })

  it('delete button has 44px touch target styling classes', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const deleteButton = screen.getByLabelText('Delete task: Buy groceries')
    expect(deleteButton.className).toContain('w-11')
    expect(deleteButton.className).toContain('h-11')
  })

  it('delete button includes the required hover styling classes', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const deleteButton = screen.getByLabelText('Delete task: Buy groceries')
    expect(deleteButton.className).toContain('transition-all')
    expect(deleteButton.className).toContain('duration-150')
    expect(deleteButton.className).toContain('[@media(hover:hover)]:hover:text-[#EF4444]')
    expect(deleteButton.className).toContain('[@media(hover:hover)]:hover:bg-[#FEE2E2]')
  })

  it('li element has min-h-12 class for touch target minimum height', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    const { container } = render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const li = container.querySelector('li')
    expect(li?.className).toContain('min-h-12')
  })

  it('li element has group class for hover-reveal support', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    const { container } = render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const li = container.querySelector('li')
    expect(li?.className).toContain('group')
  })

  it('delete button has opacity classes for hover-reveal on desktop', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const deleteButton = screen.getByLabelText('Delete task: Buy groceries')
    expect(deleteButton.className).toContain('[@media(hover:hover)]:pointer-events-none')
    expect(deleteButton.className).toContain('[@media(hover:hover)]:opacity-0')
    expect(deleteButton.className).toContain('[@media(hover:hover)]:group-hover:pointer-events-auto')
    expect(deleteButton.className).toContain('[@media(hover:hover)]:group-hover:opacity-100')
  })

  it('delete button has focus-visible:opacity-100 for keyboard accessibility', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const deleteButton = screen.getByLabelText('Delete task: Buy groceries')
    expect(deleteButton.className).toContain('focus-visible:pointer-events-auto')
    expect(deleteButton.className).toContain('focus-visible:opacity-100')
  })

  it('toggle button has focus-visible ring classes for keyboard accessibility', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const toggleButton = screen.getByRole('checkbox', { name: 'Buy groceries' })
    expect(toggleButton.className).toContain('focus-visible:ring-2')
    expect(toggleButton.className).toContain('focus-visible:ring-blue-500')
    expect(toggleButton.className).toContain('focus-visible:ring-offset-2')
    expect(toggleButton.className).toContain('focus:outline-none')
  })

  it('delete button has focus-visible ring classes for keyboard accessibility', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)
    const deleteButton = screen.getByLabelText('Delete task: Buy groceries')
    expect(deleteButton.className).toContain('focus-visible:ring-2')
    expect(deleteButton.className).toContain('focus-visible:ring-blue-500')
    expect(deleteButton.className).toContain('focus-visible:ring-offset-2')
    expect(deleteButton.className).toContain('focus:outline-none')
  })

  it('calls registerRef with todo.id and the toggle button element on mount', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    const mockRegisterRef = jest.fn()
    render(<TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} registerRef={mockRegisterRef} />)
    const toggleButton = screen.getByRole('checkbox', { name: 'Buy groceries' })
    expect(mockRegisterRef).toHaveBeenCalledWith('1', toggleButton)
  })
})
