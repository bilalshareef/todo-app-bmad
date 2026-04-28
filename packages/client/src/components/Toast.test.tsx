import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Toast } from './Toast'

describe('Toast', () => {
  it('renders aria-live region when visible is false (persistent container)', () => {
    const { container } = render(
      <Toast message="Error" visible={false} exiting={false} />,
    )
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeInTheDocument()
    expect(liveRegion).toBeEmptyDOMElement()
  })

  it('renders aria-live region when visible is false and message is null', () => {
    const { container } = render(
      <Toast message={null} visible={false} exiting={false} />,
    )
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeInTheDocument()
    expect(liveRegion).toBeEmptyDOMElement()
  })

  it('renders toast content inside aria-live region when visible is true', () => {
    render(<Toast message="Something went wrong" visible={true} exiting={false} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('⚠️')).toBeInTheDocument()
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
    const visualDiv = alert.firstElementChild!
    expect(visualDiv.className).toContain('animate-toast-slide-in')
    expect(visualDiv.className).not.toContain('animate-toast-fade-out')
  })

  it('applies animate-toast-fade-out class when exiting is true', () => {
    render(<Toast message="Error" visible={true} exiting={true} />)
    const alert = screen.getByRole('alert')
    const visualDiv = alert.firstElementChild!
    expect(visualDiv.className).toContain('animate-toast-fade-out')
    expect(visualDiv.className).not.toContain('animate-toast-slide-in')
  })

  it('has correct positioning classes', () => {
    render(<Toast message="Error" visible={true} exiting={false} />)
    const alert = screen.getByRole('alert')
    const visualDiv = alert.firstElementChild!
    expect(visualDiv.className).toContain('fixed')
    expect(visualDiv.className).toContain('bottom-4')
    expect(visualDiv.className).toContain('right-4')
  })

  it('has z-50 for stacking context', () => {
    render(<Toast message="Error" visible={true} exiting={false} />)
    const alert = screen.getByRole('alert')
    const visualDiv = alert.firstElementChild!
    expect(visualDiv.className).toContain('z-50')
  })
})
