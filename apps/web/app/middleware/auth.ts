export default defineNuxtRouteMiddleware(async () => {
  const { user, fetchUser } = useAuth()
  if (user.value) return
  await fetchUser()
  if (!user.value) {
    return navigateTo('/login')
  }
})
