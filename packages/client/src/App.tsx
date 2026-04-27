import './App.css'
import { useTodos } from './hooks/useTodos'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { AppShell } from './components/AppShell'

function App() {
  const { todos, addTodo, toggleTodo, loading } = useTodos()

  return (
    <AppShell>
      <TodoInput onSubmit={addTodo} />
      <div className="mt-6">
        <TodoList todos={todos} loading={loading} onToggle={toggleTodo} />
      </div>
    </AppShell>
  )
}

export default App
