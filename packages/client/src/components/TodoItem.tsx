import type { Todo } from '../types/todo'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  registerRef?: (id: string, el: HTMLButtonElement | null) => void
}

export function TodoItem({ todo, onToggle, onDelete, registerRef }: TodoItemProps) {
  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete(todo.id)
  }

  return (
    <li className="group flex items-center min-h-12">
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={todo.text}
        ref={(el) => registerRef?.(todo.id, el)}
        onClick={() => onToggle(todo.id)}
        onKeyDown={(event) => {
          if (event.key === ' ') {
            event.preventDefault()
            onToggle(todo.id)
          }
        }}
        className="flex-1 min-w-0 flex items-center gap-3 py-3 px-4 text-left font-sans cursor-pointer transition-colors duration-150 [@media(hover:hover)]:hover:bg-warm-gray rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:outline-none"
      >
        <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150
          ${todo.completed ? 'bg-accent-blue border-accent-blue' : 'border-[#D1D5DB]'}`}>
          {todo.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className={`break-words min-w-0 transition-colors duration-150 ${todo.completed ? 'text-completed-gray line-through' : 'text-near-black'}`}>
          {todo.text}
        </span>
      </button>
      <button
        type="button"
        onClick={handleDelete}
        aria-label={`Delete task: ${todo.text}`}
        className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-[#D1D5DB] rounded transition-all duration-150 [@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 [@media(hover:hover)]:hover:text-[#EF4444] [@media(hover:hover)]:hover:bg-[#FEE2E2] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:outline-none"
      >
        ×
      </button>
    </li>
  )
}
