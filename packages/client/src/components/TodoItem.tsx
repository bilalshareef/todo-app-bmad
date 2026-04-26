import type { Todo } from '../types/todo'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <li className={`py-3 px-4 font-sans ${todo.completed ? 'text-completed-gray line-through' : 'text-near-black'}`}>
      {todo.text}
    </li>
  )
}
