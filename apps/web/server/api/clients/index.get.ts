import { eq, desc } from 'drizzle-orm'
import { clients } from '#server/database/schema'
import { requireAuth } from '#server/utils/requireAuth'
import { useAppDatabase } from '#server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useAppDatabase(event)
  const list = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, user.id))
    .orderBy(desc(clients.createdAt))
  return { clients: list }
})
