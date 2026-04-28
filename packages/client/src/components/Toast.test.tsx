import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Toast } from './Toast'

describe('Toast', () => {
  it('renders nothing when visible is false', () => {
    const { container } = render(
      <Toast message="Error" visible={false} exiting={false} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when visible is false and message is null', () => {
    const { container } = render(
      <Toast message={null} visible={false} exiting={false} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders toast with message text when visible is true', () => {
    render(<Toast message="Something went wrong" visible={true} exiting={false} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('has role="alert" attribute', () => {
    render(<Toast message="Error" visible={true} exiting={false} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('has aria-live="polite" attribute', () => {
    render(<Toast message="Error" visible={true} exiting={false} />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'polite')
  })

  it('renders ⚠️ icon', () => {
    render(<Toast message="Error" visible={true} exiting={false} />)
    expect(screen.getByText('⚠️')).toBeInTheDocument()
  })

  it('applies animate-toast-slide-in class when exiting is false', () => {
    render(<Toast message="Error" visible={true} exiting={false} />)
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('animate-toast-slide-in')
    expect(alert.className).not.toContain('animate-toast-fade-out')
  })

  it('applies animate-toast-fade-out class when exiting is true', () => {
    render(<Toast message="Error" visible={true} exiting={true} />)
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('animate-toast-fade-out')
    expect(alert.className).not.toContain('animate-toast-slide-in')
  })

  it('has correct positioning classes', () => {
    render(<Toast message="Error" visible={true} exiting={false} />)
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('fixed')
    expect(alert.className).toContain('bottom-4')
    expect(alert.className).toContain('right-4')
  })

  it('has z-50 for stacking context', () => {
    render(<Toast message="Error" visible={true} exiting={false} />)
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('z-50')
  })
})
