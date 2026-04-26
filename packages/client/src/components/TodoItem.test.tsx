import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TodoItem } from './TodoItem'

describe('TodoItem', () => {
  it('renders active todo with text-near-black and no line-through', () => {
    const todo = { id: '1', text: 'Buy groceries', completed: false, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} />)
    const item = screen.getByText('Buy groceries')
    expect(item).toBeInTheDocument()
    expect(item.className).toContain('text-near-black')
    expect(item.className).not.toContain('line-through')
  })

  it('renders completed todo with text-completed-gray and line-through', () => {
    const todo = { id: '2', text: 'Walk the dog', completed: true, createdAt: '2026-04-26T00:00:00.000Z', updatedAt: '2026-04-26T00:00:00.000Z' }
    render(<TodoItem todo={todo} />)
    const item = screen.getByText('Walk the dog')
    expect(item).toBeInTheDocument()
    expect(item.className).toContain('text-completed-gray')
    expect(item.className).toContain('line-through')
  })
})
