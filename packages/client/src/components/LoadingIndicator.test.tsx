import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoadingIndicator } from './LoadingIndicator'

describe('LoadingIndicator', () => {
  it('renders accessible loading text and a 24px spinner', () => {
    render(<LoadingIndicator />)

    expect(screen.getByText('Loading todos...')).toBeInTheDocument()
    const spinner = screen.getByText('Loading todos...').previousElementSibling

    expect(spinner).toHaveClass('h-6', 'w-6', 'animate-spin')
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
  })
})