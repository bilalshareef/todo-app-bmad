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
    const mainElement = heading?.closest('main')
    const outerShell = mainElement?.parentElement
    const contentWrapper = container.querySelector('[data-testid="shell-child"]')?.parentElement

    expect(outerShell?.className).toContain('min-h-screen')
    expect(outerShell?.className).toContain('bg-white')
    expect(mainElement?.className).toContain('max-w-[640px]')
    expect(mainElement?.className).toContain('mx-auto')
    expect(mainElement?.className).toContain('px-4')
    expect(mainElement?.className).toContain('md:px-6')
    expect(mainElement?.className).toContain('py-8')
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

  it('should render a <main> landmark element', async () => {
    const root = createRoot(container)
    await act(async () => {
      root.render(<AppShell><p>child</p></AppShell>)
    })
    const mainElement = container.querySelector('main')
    expect(mainElement).not.toBeNull()
    await act(async () => {
      root.unmount()
    })
  })

  it('should render the h1 heading inside the <main> element', async () => {
    const root = createRoot(container)
    await act(async () => {
      root.render(<AppShell><p>child</p></AppShell>)
    })
    const mainElement = container.querySelector('main')
    const heading = mainElement?.querySelector('h1')
    expect(heading).not.toBeNull()
    expect(heading!.textContent).toBe('Todos')
    await act(async () => {
      root.unmount()
    })
  })
})
