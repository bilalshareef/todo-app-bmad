import type { Todo } from '../types/todo'
import { TodoItem } from './TodoItem'
import { LoadingIndicator } from './LoadingIndicator'
import { EmptyState } from './EmptyState'

interface TodoListProps {
  todos: Todo[]
  loading: boolean
}

export function TodoList({ todos, loading }: TodoListProps) {
  if (loading) {
    return <LoadingIndicator />
  }

  if (todos.length === 0) {
    return <EmptyState />
  }

  return (
    <ul aria-label="Todo list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}
