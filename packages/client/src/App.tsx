import './App.css'
import { useTodos } from './hooks/useTodos'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'

function App() {
  const { todos, addTodo, loading } = useTodos()

  return (
    <div className="min-h-screen bg-warm-gray flex items-center justify-center">
      <div className="w-full max-w-lg px-4">
        <h1 className="text-3xl font-semibold text-near-black text-center">Todo App</h1>
        <p className="mt-2 text-medium-gray text-center">Your task management companion</p>
        <div className="mt-6">
          <TodoInput onSubmit={addTodo} />
          <TodoList todos={todos} loading={loading} />
        </div>
      </div>
    </div>
  )
}

export default App
