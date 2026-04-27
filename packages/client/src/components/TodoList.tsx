import type { Todo } from '../types/todo'
import { TodoItem } from './TodoItem'
import { LoadingIndicator } from './LoadingIndicator'
import { EmptyState } from './EmptyState'

interface TodoListProps {
  todos: Todo[]
  loading: boolean
  onToggle: (id: string) => void
}

export function TodoList({ todos, loading, onToggle }: TodoListProps) {
  if (loading) {
    return <LoadingIndicator />
  }

  if (todos.length === 0) {
    return <EmptyState />
  }

  return (
    <ul aria-label="Todo list" className="divide-y divide-[#F3F4F6]">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
      ))}
    </ul>
  )
}
