import type { Todo } from '../types/todo'

const API_BASE = '/api/todos'

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
