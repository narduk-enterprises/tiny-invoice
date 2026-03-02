export function useSettings() {
  const { fetchUser } = useAuth()
  const { $csrfFetch } = useNuxtApp()

  async function updateSettings(body: {
    businessName: string | null
    businessAddress: string | null
  }) {
    await $csrfFetch('/api/settings', {
      method: 'PUT',
      body,
    })
    await fetchUser()
  }

  return { updateSettings }
}
