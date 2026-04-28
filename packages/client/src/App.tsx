import './App.css'
import { useTodos } from './hooks/useTodos'
import { useToast } from './hooks/useToast'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { AppShell } from './components/AppShell'
import { Toast } from './components/Toast'

function App() {
  const { toast, showToast } = useToast()
  const { todos, addTodo, toggleTodo, deleteTodo, loading } = useTodos(showToast)

  return (
    <>
      <AppShell>
        <TodoInput onSubmit={addTodo} />
        <div className="mt-6">
          <TodoList todos={todos} loading={loading} onToggle={toggleTodo} onDelete={deleteTodo} />
        </div>
      </AppShell>
      <Toast message={toast.message} visible={toast.visible} exiting={toast.exiting} />
    </>
  )
}

export default App
