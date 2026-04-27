import type { Todo } from '../types/todo'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete(todo.id)
  }

  return (
    <li className="flex items-center">
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={todo.text}
        onClick={() => onToggle(todo.id)}
        onKeyDown={(event) => {
          if (event.key === ' ') {
            event.preventDefault()
            onToggle(todo.id)
          }
        }}
        className="flex-1 flex items-center gap-3 py-3 px-4 text-left font-sans cursor-pointer transition-colors duration-150 [@media(hover:hover)]:hover:bg-warm-gray"
      >
        <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150
          ${todo.completed ? 'bg-accent-blue border-accent-blue' : 'border-[#D1D5DB]'}`}>
          {todo.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className={`transition-colors duration-150 ${todo.completed ? 'text-completed-gray line-through' : 'text-near-black'}`}>
          {todo.text}
        </span>
      </button>
      <button
        type="button"
        onClick={handleDelete}
        aria-label={`Delete task: ${todo.text}`}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#D1D5DB] rounded transition-colors duration-150 [@media(hover:hover)]:hover:text-[#EF4444] [@media(hover:hover)]:hover:bg-[#FEE2E2]"
      >
        ×
      </button>
    </li>
  )
}
