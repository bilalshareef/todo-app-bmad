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

export function useTodos(onError?: (message: string) => void) {
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

        onError?.("Couldn't load your tasks — check your connection")
        setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  async function addTodo(text: string): Promise<void> {
    try {
      const newTodo = await apiCreateTodo(text)
      setTodos((prev) => [...prev, newTodo])
    } catch (error) {
      onError?.("Couldn't save your task — check your connection and try again")
      throw error
    }
  }

  async function toggleTodo(id: string): Promise<void> {
    if (pendingToggleIds.current.has(id)) {
      return
    }

    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    pendingToggleIds.current.add(id)

    // Optimistic update — flip immediately
    const newCompleted = !todo.completed
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: newCompleted } : t))

    try {
      const updatedTodo = await apiUpdateTodo(id, newCompleted)
      // Replace with server data (has correct updatedAt)
      setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)))
    } catch (error) {
      // Revert to original state
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: todo.completed } : t))
      onError?.("Couldn't update — check your connection")
    } finally {
      pendingToggleIds.current.delete(id)
    }
  }

  async function deleteTodo(id: string): Promise<void> {
    const todoIndex = todos.findIndex((t) => t.id === id)
    if (todoIndex === -1) return
    const deletedTodo = todos[todoIndex]
    const previousTodoId = todoIndex > 0 ? todos[todoIndex - 1].id : undefined
    const nextTodoId = todoIndex < todos.length - 1 ? todos[todoIndex + 1].id : undefined

    // Optimistic removal — remove immediately
    setTodos((prev) => prev.filter((t) => t.id !== id))

    try {
      await apiDeleteTodo(id)
    } catch (error) {
      // Restore near the original neighbors so concurrent list changes do not drift the order.
      setTodos((prev) => {
        if (prev.some((todo) => todo.id === id)) {
          return prev
        }

        const restored = [...prev]
        const previousIndex = previousTodoId ? restored.findIndex((todo) => todo.id === previousTodoId) : -1
        const nextIndex = nextTodoId ? restored.findIndex((todo) => todo.id === nextTodoId) : -1

        let insertAt = restored.length
        if (previousIndex !== -1) {
          insertAt = previousIndex + 1
        } else if (nextIndex !== -1) {
          insertAt = nextIndex
        }

        restored.splice(insertAt, 0, deletedTodo)
        return restored
      })
      onError?.("Couldn't delete — check your connection")
    }
  }

  return { todos, addTodo, toggleTodo, deleteTodo, loading }
}
