import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render "Todos" heading', async () => {
    const root = createRoot(container)
    await act(async () => {
      root.render(<AppShell><p>child</p></AppShell>)
    })
    const heading = container.querySelector('h1')
    expect(heading).not.toBeNull()
    expect(heading!.textContent).toBe('Todos')
    await act(async () => {
      root.unmount()
    })
  })

  it('should apply the app shell layout classes', async () => {
    const root = createRoot(container)
    await act(async () => {
      root.render(
        <AppShell>
          <p data-testid="shell-child">Child content</p>
        </AppShell>
      )
    })

    const heading = container.querySelector('h1')
    const outerShell = heading?.parentElement?.parentElement
    const innerShell = heading?.parentElement
    const contentWrapper = container.querySelector('[data-testid="shell-child"]')?.parentElement

    expect(outerShell?.className).toContain('min-h-screen')
    expect(outerShell?.className).toContain('bg-white')
    expect(innerShell?.className).toContain('max-w-[640px]')
    expect(innerShell?.className).toContain('mx-auto')
    expect(innerShell?.className).toContain('px-4')
    expect(innerShell?.className).toContain('md:px-6')
    expect(innerShell?.className).toContain('py-8')
    expect(contentWrapper?.className).toContain('mt-6')

    await act(async () => {
      root.unmount()
    })
  })

  it('should render heading as an h1 element', async () => {
    const root = createRoot(container)
    await act(async () => {
      root.render(<AppShell><p>child</p></AppShell>)
    })
    const h1Elements = container.querySelectorAll('h1')
    expect(h1Elements).toHaveLength(1)
    await act(async () => {
      root.unmount()
    })
  })

  it('should render children content', async () => {
    const root = createRoot(container)
    await act(async () => {
      root.render(
        <AppShell>
          <p data-testid="test-child">Hello World</p>
        </AppShell>
      )
    })
    const child = container.querySelector('[data-testid="test-child"]')
    expect(child).not.toBeNull()
    expect(child!.textContent).toBe('Hello World')
    await act(async () => {
      root.unmount()
    })
  })
})
