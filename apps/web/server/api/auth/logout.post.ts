import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import { destroySession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'auth', 20, 60_000)
  await destroySession(event)
  return { ok: true }
})
