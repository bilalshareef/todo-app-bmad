import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { TodoInput } from './TodoInput'

describe('TodoInput', () => {
  it('renders input with correct placeholder', () => {
    render(<TodoInput onSubmit={jest.fn()} />)
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument()
  })

  it('has correct aria-label', () => {
    render(<TodoInput onSubmit={jest.fn()} />)
    expect(screen.getByLabelText('Add a new task')).toBeInTheDocument()
  })

  it('calls onSubmit with trimmed text on Enter key', async () => {
    const onSubmit = jest.fn()
    const user = userEvent.setup()
    render(<TodoInput onSubmit={onSubmit} />)

    const input = screen.getByLabelText('Add a new task')
    await user.type(input, '  Buy groceries  {Enter}')

    expect(onSubmit).toHaveBeenCalledWith('Buy groceries')
  })

  it('clears input after submission', async () => {
    const onSubmit = jest.fn()
    const user = userEvent.setup()
    render(<TodoInput onSubmit={onSubmit} />)

    const input = screen.getByLabelText('Add a new task') as HTMLInputElement
    await user.type(input, 'Buy groceries{Enter}')

    expect(input.value).toBe('')
  })

  it('does not call onSubmit on Enter with empty input', async () => {
    const onSubmit = jest.fn()
    const user = userEvent.setup()
    render(<TodoInput onSubmit={onSubmit} />)

    const input = screen.getByLabelText('Add a new task')
    await user.type(input, '{Enter}')

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not call onSubmit on Enter with whitespace-only input', async () => {
    const onSubmit = jest.fn()
    const user = userEvent.setup()
    render(<TodoInput onSubmit={onSubmit} />)

    const input = screen.getByLabelText('Add a new task')
    await user.type(input, '   {Enter}')

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('has autoFocus', () => {
    render(<TodoInput onSubmit={jest.fn()} />)
    const input = screen.getByLabelText('Add a new task')
    expect(input).toHaveFocus()
  })
})
