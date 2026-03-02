import { eq, desc } from 'drizzle-orm'
import { clients } from '../../database/schema'
import { requireAuth } from '../../utils/requireAuth'
import { useAppDatabase } from '../../utils/database'

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
