<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeo({
  title: 'Clients — TinyInvoice',
  description: 'Manage your clients.',
})
useWebPageSchema({ name: 'Clients — TinyInvoice', description: 'Client list and management.' })

const { clients, pending, createClient, updateClient, deleteClient } = useClients()
type Client = { id: string; name: string; email: string; address: string | null; phone: string | null }
const slideoverOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const error = ref('')

const formState = ref({
  name: '',
  email: '',
  address: '',
  phone: '',
})

function openCreate() {
  editingId.value = null
  formState.value = { name: '', email: '', address: '', phone: '' }
  slideoverOpen.value = true
}

function openEdit(client: { id: string; name: string; email: string; address: string | null; phone: string | null }) {
  editingId.value = client.id
  formState.value = {
    name: client.name,
    email: client.email,
    address: client.address ?? '',
    phone: client.phone ?? '',
  }
  slideoverOpen.value = true
}

async function submitClient() {
  error.value = ''
  saving.value = true
  try {
    if (editingId.value) {
      await updateClient(editingId.value, {
        name: formState.value.name,
        email: formState.value.email,
        address: formState.value.address || undefined,
        phone: formState.value.phone || undefined,
      })
    } else {
      await createClient({
        name: formState.value.name,
        email: formState.value.email,
        address: formState.value.address || undefined,
        phone: formState.value.phone || undefined,
      })
    }
    slideoverOpen.value = false
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err.data?.message ?? err.message ?? 'Failed to save'
  } finally {
    saving.value = false
  }
}

async function confirmDelete(client: { id: string; name: string }) {
  if (!import.meta.client) return
  if (!confirm(`Delete client "${client.name}"? This will fail if they have invoices.`)) return
  try {
    await deleteClient(client.id)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    alert(err.data?.message ?? err.message ?? 'Delete failed')
  }
}
</script>

<template>
  <UPage>
    <UPageHeader title="Clients" description="Manage your clients.">
      <template #links>
        <UButton icon="i-lucide-plus" @click="openCreate">Add client</UButton>
      </template>
    </UPageHeader>
    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
    </div>
    <UCard v-else class="card-base">
      <UTable
        v-if="clients.length"
        :rows="clients"
        :columns="[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'address', label: 'Address' },
        ] as any"
      >
        <template #actions-data="{ row }">
          <UButton variant="ghost" color="neutral" size="xs" icon="i-lucide-pencil" @click="openEdit((row as unknown) as Client)" />
          <UButton variant="ghost" color="error" size="xs" icon="i-lucide-trash-2" @click="confirmDelete((row as unknown) as Client)" />
        </template>
      </UTable>
      <div v-else class="py-12 text-center text-muted">
        <p>No clients yet.</p>
        <UButton class="mt-2" @click="openCreate">Add your first client</UButton>
      </div>
    </UCard>

    <USlideover v-model:open="slideoverOpen" title="Client">
      <div class="p-4 space-y-4">
        <UForm :state="formState" @submit="submitClient">
          <UFormField label="Name" name="name" required>
            <UInput v-model="formState.name" placeholder="Acme Corp" />
          </UFormField>
          <UFormField label="Email" name="email" required>
            <UInput v-model="formState.email" type="email" placeholder="billing@acme.com" />
          </UFormField>
          <UFormField label="Address" name="address">
            <UTextarea v-model="formState.address" placeholder="123 Main St" :rows="2" />
          </UFormField>
          <UFormField label="Phone" name="phone">
            <UInput v-model="formState.phone" placeholder="+1 555-0100" />
          </UFormField>
          <UAlert v-if="error" color="error" :title="error" class="text-sm" />
          <div class="flex gap-2 pt-2">
            <UButton type="submit" :loading="saving">Save</UButton>
            <UButton variant="ghost" color="neutral" @click="slideoverOpen = false">Cancel</UButton>
          </div>
        </UForm>
      </div>
    </USlideover>
  </UPage>
</template>
