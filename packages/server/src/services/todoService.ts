import type { PrismaClient } from '../../generated/prisma/client.js'

export async function createTodo(prisma: PrismaClient, text: string) {
  const trimmedText = text.trim()
  return prisma.todo.create({ data: { text: trimmedText } })
}
