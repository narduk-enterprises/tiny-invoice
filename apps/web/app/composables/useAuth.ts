export interface AuthUser {
  id: string
  email: string
  name: string
  businessName: string | null
  businessAddress: string | null
}

export function useAuth() {
  const { $csrfFetch } = useNuxtApp()
  const headers = useRequestHeaders(['cookie'])
  const { data: meData, refresh } = useFetch<{ user: AuthUser | null }>('/api/auth/me', {
    key: 'auth-me',
    headers,
    default: () => ({ user: null }),
    watch: false,
  })

  const user = computed(() => meData.value?.user ?? null)

  async function fetchUser() {
    await refresh()
    return user.value
  }

  async function login(email: string, password: string) {
    const data = await $csrfFetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    await refresh()
    return data.user
  }

  async function register(params: {
    email: string
    name: string
    password: string
    businessName?: string
    businessAddress?: string
  }) {
    const data = await $csrfFetch<{ user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: params,
    })
    await refresh()
    return data.user
  }

  async function logout() {
    await $csrfFetch('/api/auth/logout', { method: 'POST' })
    await refresh()
  }

  return {
    user,
    fetchUser,
    login,
    register,
    logout,
  }
}
