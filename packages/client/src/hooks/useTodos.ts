import { useState, useEffect, useRef } from 'react'
import type { Todo } from '../types/todo'
import { createTodo as apiCreateTodo, fetchTodos, updateTodo as apiUpdateTodo, deleteTodo as apiDeleteTodo } from '../api/todoApi'

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
  const pendingToggleIds = useRef(new Set<string>())

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

  async function toggleTodo(id: string): Promise<void> {
    if (pendingToggleIds.current.has(id)) {
      return
    }

    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    pendingToggleIds.current.add(id)

    try {
      const updatedTodo = await apiUpdateTodo(id, !todo.completed)
      setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)))
    } catch (error) {
      console.error('Failed to update todo:', error)
    } finally {
      pendingToggleIds.current.delete(id)
    }
  }

  async function deleteTodo(id: string): Promise<void> {
    try {
      await apiDeleteTodo(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  return { todos, addTodo, toggleTodo, deleteTodo, loading }
}
