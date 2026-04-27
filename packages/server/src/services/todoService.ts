import type { PrismaClient } from '../../generated/prisma/client.js'

export async function getAllTodos(prisma: PrismaClient) {
  return prisma.todo.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] })
}

export async function createTodo(prisma: PrismaClient, text: string) {
  const trimmedText = text.trim()
  return prisma.todo.create({ data: { text: trimmedText } })
}

export async function updateTodo(prisma: PrismaClient, id: string, data: { completed: boolean }) {
  return prisma.todo.update({ where: { id }, data: { completed: data.completed } })
}

export async function deleteTodo(prisma: PrismaClient, id: string) {
  return prisma.todo.delete({ where: { id } })
}
