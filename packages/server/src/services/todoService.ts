import type { PrismaClient } from '../../generated/prisma/client.js'

export async function getAllTodos(prisma: PrismaClient) {
  return prisma.todo.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] })
}

export async function createTodo(prisma: PrismaClient, text: string) {
  const trimmedText = text.trim()
  return prisma.todo.create({ data: { text: trimmedText } })
}
