import type { Todo } from '../types/todo'

const API_BASE = '/api/todos'

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(API_BASE)
  if (!response.ok) {
    throw new Error(`Failed to fetch todos: ${response.status}`)
  }
  const { data } = await response.json()
  return data
}

export async function createTodo(text: string): Promise<Todo> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create todo: ${response.status}`)
  }

  const { data } = await response.json()
  return data
}

export async function updateTodo(id: string, completed: boolean): Promise<Todo> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update todo: ${response.status}`)
  }
  const { data } = await response.json()
  return data
}
