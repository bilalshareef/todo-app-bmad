import { useState } from 'react'
import type { Todo } from '../types/todo'
import { createTodo as apiCreateTodo } from '../api/todoApi'

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])

  async function addTodo(text: string): Promise<void> {
    const newTodo = await apiCreateTodo(text)
    setTodos((prev) => [...prev, newTodo])
  }

  return { todos, addTodo }
}
