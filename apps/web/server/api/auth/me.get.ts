import { getSessionUser } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated',
    })
  }
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      businessName: user.businessName,
      businessAddress: user.businessAddress,
    },
  }
})
