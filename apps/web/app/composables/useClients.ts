export interface Client {
  id: string
  userId: string
  name: string
  email: string
  address: string | null
  phone: string | null
  createdAt: number
}

export function useClients() {
  const { data: clients, pending, refresh } = useFetch<{ clients: Client[] }>('/api/clients', {
    default: () => ({ clients: [] }),
    watch: false,
  })
  const { $csrfFetch } = useNuxtApp()

  const clientList = computed(() => clients.value?.clients ?? [])

  async function createClient(body: { name: string; email: string; address?: string; phone?: string }) {
    await $csrfFetch<Client>('/api/clients', {
      method: 'POST',
      body,
    })
    await refresh()
  }

  async function updateClient(
    id: string,
    body: { name: string; email: string; address?: string; phone?: string },
  ) {
    await $csrfFetch<Client>(`/api/clients/${id}`, {
      method: 'PUT',
      body,
    })
    await refresh()
  }

  async function deleteClient(id: string) {
    await $csrfFetch(`/api/clients/${id}`, { method: 'DELETE' })
    await refresh()
  }

  return {
    clients: clientList,
    pending,
    refresh,
    createClient,
    updateClient,
    deleteClient,
  }
}
