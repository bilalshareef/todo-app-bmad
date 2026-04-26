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
})
