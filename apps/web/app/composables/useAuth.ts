import type { Ref } from 'vue'

export interface AuthUser {
  id: string
  email: string
  name: string
  businessName: string | null
  businessAddress: string | null
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)

  async function fetchUser() {
    try {
      const data = await $fetch<{ user: AuthUser }>('/api/auth/me')
      user.value = data.user
      return data.user
    } catch {
      user.value = null
      return null
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = data.user
    return data.user
  }

  async function register(params: {
    email: string
    name: string
    password: string
    businessName?: string
    businessAddress?: string
  }) {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: params,
    })
    user.value = data.user
    return data.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return {
    user: user as Ref<AuthUser | null>,
    fetchUser,
    login,
    register,
    logout,
  }
}
