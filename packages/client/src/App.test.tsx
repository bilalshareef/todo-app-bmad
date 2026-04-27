import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import App from './App'
import * as todoApi from './api/todoApi'

jest.mock('./api/todoApi')

const mockedTodoApi = todoApi as jest.Mocked<typeof todoApi>

describe('App', () => {
  beforeEach(() => {
    mockedTodoApi.fetchTodos.mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should render without crashing', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(<App />)
    })
    await act(async () => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('should render "Todos" heading', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(<App />)
    })
    const heading = container.querySelector('h1')
    const input = container.querySelector('input[aria-label="Add a new task"]')
    const shellContent = input?.parentElement
    const listWrapper = input?.nextElementSibling

    expect(heading).not.toBeNull()
    expect(heading!.textContent).toBe('Todos')
    expect(input).not.toBeNull()
    expect(shellContent?.className).toContain('mt-6')
    expect(listWrapper).not.toBeNull()
    expect(listWrapper?.className).toContain('mt-6')

    await act(async () => {
      root.unmount()
    })
    document.body.removeChild(container)
  })
})
