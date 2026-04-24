import { createRoot } from 'react-dom/client'
import App from './App'

describe('App', () => {
  it('should render without crashing', () => {
    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(<App />)
    root.unmount()
  })
})
