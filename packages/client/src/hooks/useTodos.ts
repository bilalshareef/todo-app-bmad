import { useState, useEffect } from 'react'
import type { Todo } from '../types/todo'
import { createTodo as apiCreateTodo, fetchTodos } from '../api/todoApi'

function mergeTodos(fetchedTodos: Todo[], currentTodos: Todo[]): Todo[] {
  if (currentTodos.length === 0) {
    return fetchedTodos
  }

  const seenIds = new Set(fetchedTodos.map((todo) => todo.id))
  return [...fetchedTodos, ...currentTodos.filter((todo) => !seenIds.has(todo.id))]
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    fetchTodos()
      .then((data) => {
        if (!isActive) {
          return
        }

        setTodos((currentTodos) => mergeTodos(data, currentTodos))
        setLoading(false)
      })
      .catch((err) => {
        if (!isActive) {
          return
        }

        console.error('Failed to fetch todos:', err)
        setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  async function addTodo(text: string): Promise<void> {
    const newTodo = await apiCreateTodo(text)
    setTodos((prev) => [...prev, newTodo])
  }

  return { todos, addTodo, loading }
}
