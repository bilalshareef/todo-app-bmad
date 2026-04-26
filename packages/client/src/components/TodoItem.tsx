import type { Todo } from '../types/todo'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <li className="py-3 px-4 text-near-black font-sans">
      {todo.text}
    </li>
  )
}
