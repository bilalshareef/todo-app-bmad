import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoadingIndicator } from './LoadingIndicator'

describe('LoadingIndicator', () => {
  it('renders a decorative 24px spinner without its own live announcement', () => {
    const { container } = render(<LoadingIndicator />)
    const spinner = container.querySelector('[aria-hidden="true"]')

    expect(spinner).toHaveClass('h-6', 'w-6', 'animate-spin')
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByText('Loading todos...')).not.toBeInTheDocument()
  })
})