import { useRef } from 'react'
import type { Todo } from '../types/todo'
import { TodoItem } from './TodoItem'
import { LoadingIndicator } from './LoadingIndicator'
import { EmptyState } from './EmptyState'

interface TodoListProps {
  todos: Todo[]
  loading: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void | Promise<void>
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function TodoList({ todos, loading, onToggle, onDelete, inputRef }: TodoListProps) {
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  function registerRef(id: string, el: HTMLButtonElement | null) {
    if (el) {
      itemRefs.current.set(id, el)
    } else {
      itemRefs.current.delete(id)
    }
  }

  function focusDeleteTarget(nextId?: string, prevId?: string) {
    if (nextId) {
      const nextItem = itemRefs.current.get(nextId)
      if (nextItem) {
        nextItem.focus()
        return
      }
    }

    if (prevId) {
      const previousItem = itemRefs.current.get(prevId)
      if (previousItem) {
        previousItem.focus()
        return
      }
    }

    inputRef?.current?.focus()
  }

  async function handleDelete(id: string) {
    const currentIndex = todos.findIndex(t => t.id === id)
    if (currentIndex === -1) {
      return
    }

    const nextId = currentIndex < todos.length - 1 ? todos[currentIndex + 1].id : undefined
    const prevId = currentIndex > 0 ? todos[currentIndex - 1].id : undefined

    requestAnimationFrame(() => {
      focusDeleteTarget(nextId, prevId)
    })

    await Promise.resolve(onDelete(id))
    requestAnimationFrame(() => {
      itemRefs.current.get(id)?.focus()
    })
  }

  if (loading) {
    return <LoadingIndicator />
  }

  if (todos.length === 0) {
    return <EmptyState />
  }

  return (
    <ul aria-label="Todo list" className="divide-y divide-[#F3F4F6]">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={handleDelete} registerRef={registerRef} />
      ))}
    </ul>
  )
}
