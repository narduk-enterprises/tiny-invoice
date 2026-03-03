<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ middleware: 'auth' })

useSeo({
  title: 'Clients — TinyInvoice',
  description: 'Manage your clients.',
})
useWebPageSchema({ name: 'Clients — TinyInvoice', description: 'Client list and management.' })

const { clients, pending, createClient, updateClient, deleteClient } = useClients()
const toast = useToast()
type Client = { id: string; name: string; email: string; address: string | null; phone: string | null }
const slideoverOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const error = ref('')

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  address: z.string().optional(),
  phone: z.string().optional(),
})

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
    toast.add({ title: editingId.value ? 'Client updated' : 'Client saved', color: 'success' })
    slideoverOpen.value = false
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err.data?.message ?? err.message ?? 'Failed to save'
  } finally {
    saving.value = false
  }
}

const deleteModalOpen = ref(false)
const clientToDelete = ref<{ id: string; name: string } | null>(null)
const deleteError = ref('')
const deletePending = ref(false)

const clientColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'address', header: 'Address' },
  { id: 'actions', header: '' },
] as const

function openDeleteModal(client: { id: string; name: string }) {
  deleteError.value = ''
  clientToDelete.value = client
  deleteModalOpen.value = true
}

function closeDeleteModal() {
  deleteModalOpen.value = false
  clientToDelete.value = null
  deleteError.value = ''
}

async function confirmDelete() {
  if (!clientToDelete.value) return
  deleteError.value = ''
  deletePending.value = true
  try {
    await deleteClient(clientToDelete.value.id)
    toast.add({ title: 'Client deleted', color: 'neutral' })
    closeDeleteModal()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    deleteError.value = err.data?.message ?? err.message ?? 'Delete failed'
  } finally {
    deletePending.value = false
  }
}

watch(slideoverOpen, (open) => {
  if (open && import.meta.client) {
    nextTick(() => {
      document.querySelector<HTMLInputElement>('[data-slideover-autofocus]')?.focus()
    })
  }
})
</script>

<template>
  <UPage>
    <UPageHeader title="Clients" description="Manage your clients.">
      <template #links>
        <UButton icon="i-lucide-plus" aria-label="Add client" @click="openCreate">Add client</UButton>
      </template>
    </UPageHeader>
    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
    </div>
    <UCard v-else class="card-base">
      <UTable
        v-if="clients.length"
        :data="clients"
        :columns="[...clientColumns]"
      >
        <template #actions-cell="{ row }">
          <UButton variant="ghost" color="neutral" size="xs" icon="i-lucide-pencil" aria-label="Edit client" @click="openEdit((row.original as unknown) as Client)" />
          <UButton variant="ghost" color="error" size="xs" icon="i-lucide-trash-2" aria-label="Delete client" @click="openDeleteModal((row.original as unknown) as Client)" />
        </template>
      </UTable>
      <AppEmptyState
        v-else
        title="No clients yet"
        description="Add a client to attach to invoices."
        icon="i-lucide-users"
      >
        <UButton color="primary" icon="i-lucide-plus" @click="openCreate">Add your first client</UButton>
      </AppEmptyState>
    </UCard>

    <USlideover v-model:open="slideoverOpen" :title="editingId ? 'Edit client' : 'Add client'">
      <div class="p-5">
        <UForm :schema="clientSchema" :state="formState" @submit="submitClient">
          <div class="form-section">
            <UFormField label="Name" name="name" required>
              <UInput v-model="formState.name" placeholder="Acme Corp" class="w-full" data-slideover-autofocus />
            </UFormField>
            <UFormField label="Email" name="email" required>
              <UInput v-model="formState.email" type="email" placeholder="billing@acme.com" class="w-full" />
            </UFormField>
            <UFormField label="Address (optional)" name="address">
              <UTextarea
                v-model="formState.address"
                placeholder="123 Main St, City, ST"
                :rows="3"
                class="w-full min-h-[5rem]"
              />
            </UFormField>
            <UFormField label="Phone (optional)" name="phone">
              <UInput v-model="formState.phone" placeholder="+1 555-0100" class="w-full" />
            </UFormField>
          </div>
          <UAlert v-if="error" color="error" :title="error" class="text-sm" />
          <div class="form-actions">
            <UButton variant="outline" color="neutral" :disabled="saving" @click="slideoverOpen = false">
              Cancel
            </UButton>
            <UButton type="submit" :loading="saving">
              Save
            </UButton>
          </div>
        </UForm>
      </div>
    </USlideover>

    <UModal v-model:open="deleteModalOpen">
      <template #content>
        <div class="max-w-sm p-5 space-y-5">
          <p class="text-default">
            Delete client <strong>{{ clientToDelete?.name }}</strong>? This will fail if they have invoices.
          </p>
          <UAlert v-if="deleteError" color="error" :title="deleteError" class="text-sm" />
          <div class="flex gap-2 justify-end">
            <UButton variant="outline" color="neutral" :disabled="deletePending" @click="closeDeleteModal">
              Cancel
            </UButton>
            <UButton color="error" :loading="deletePending" @click="confirmDelete">
              Delete
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UPage>
</template>
