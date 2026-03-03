<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeo({
  title: 'Invoices — TinyInvoice',
  description: 'View and manage your invoices.',
})
useWebPageSchema({ name: 'Invoices — TinyInvoice', description: 'Invoice list.' })

const route = useRoute()
const router = useRouter()
const { invoices, listPending, deleteInvoice } = useInvoices()
const { formatCents } = useFormat()
const { invoiceStatusColor } = useInvoiceStatus()
const toast = useToast()

const ALL_STATUS_VALUE = '__all__' as const
const statusOptions = [
  { label: 'All statuses', value: ALL_STATUS_VALUE },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
] as const

const statusFilterValue = computed({
  get: () => (route.query.status as string) || ALL_STATUS_VALUE,
  set: (v: string) => {
    const q = { ...route.query }
    if (v && v !== ALL_STATUS_VALUE) q.status = v
    else delete q.status
    router.replace({ query: q })
  },
})

const statusFilter = computed({
  get: () => statusOptions.find((o) => o.value === statusFilterValue.value) ?? statusOptions[0],
  set: (opt: (typeof statusOptions)[number]) => {
    statusFilterValue.value = opt?.value ?? ALL_STATUS_VALUE
  },
})

const filteredInvoices = computed(() => {
  const list = invoices.value
  const v = statusFilterValue.value
  if (!v || v === ALL_STATUS_VALUE) return list
  return list.filter((inv) => inv.status === v)
})

const deleteModalOpen = ref(false)
const invoiceToDelete = ref<{ id: string; invoiceNumber: string } | null>(null)
const deleteError = ref('')
const deletePending = ref(false)

function openDeleteModal(inv: { id: string; invoiceNumber: string }) {
  deleteError.value = ''
  invoiceToDelete.value = inv
  deleteModalOpen.value = true
}

function closeDeleteModal() {
  deleteModalOpen.value = false
  invoiceToDelete.value = null
  deleteError.value = ''
}

async function confirmDelete() {
  if (!invoiceToDelete.value) return
  deleteError.value = ''
  deletePending.value = true
  try {
    await deleteInvoice(invoiceToDelete.value.id)
    toast.add({ title: 'Invoice deleted', color: 'neutral' })
    closeDeleteModal()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    deleteError.value = err.data?.message ?? err.message ?? 'Delete failed'
  } finally {
    deletePending.value = false
  }
}

const invoiceListColumns = [
  { accessorKey: 'invoiceNumber', header: 'Number' },
  { accessorKey: 'clientName', header: 'Client' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'total', header: 'Total' },
  { id: 'actions', header: '' },
] as const
</script>

<template>
  <UPage>
    <UPageHeader title="Invoices" description="View and manage invoices.">
      <template #links>
        <UButton to="/invoices/new" icon="i-lucide-plus">New invoice</UButton>
      </template>
    </UPageHeader>
    <UCard class="card-base">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <USelectMenu
          v-model="statusFilter"
          :items="(statusOptions as unknown) as { label: string; value: string }[]"
          value-attribute="value"
        />
      </div>
      <div v-if="listPending" class="py-12 text-center text-muted">Loading…</div>
      <UTable
        v-else-if="filteredInvoices.length"
        :data="filteredInvoices"
        :columns="[...invoiceListColumns]"
      >
        <template #status-cell="{ row }">
          <UBadge :color="invoiceStatusColor((row.original as { status: string }).status)" variant="subtle" size="xs">
            {{ (row.original as { status: string }).status }}
          </UBadge>
        </template>
        <template #total-cell="{ row }">
          {{ formatCents((row.original as { total: number }).total) }}
        </template>
        <template #actions-cell="{ row }">
          <UButton :to="`/invoices/${(row.original as { id: string }).id}`" variant="ghost" color="neutral" size="xs" aria-label="View invoice">View</UButton>
          <UButton :to="`/invoices/${(row.original as { id: string }).id}/edit`" variant="ghost" color="neutral" size="xs" icon="i-lucide-pencil" aria-label="Edit invoice" />
          <UButton variant="ghost" color="error" size="xs" icon="i-lucide-trash-2" aria-label="Delete invoice" @click="openDeleteModal((row.original as unknown) as { id: string; invoiceNumber: string })" />
        </template>
      </UTable>
      <AppEmptyState
        v-else
        title="No invoices yet"
        description="Create your first invoice to get started."
        icon="i-lucide-file-text"
      >
        <UButton color="primary" icon="i-lucide-plus" to="/invoices/new">Create your first invoice</UButton>
      </AppEmptyState>
    </UCard>

    <UModal v-model:open="deleteModalOpen">
      <template #content>
        <div class="max-w-sm p-5 space-y-5">
          <p class="text-default">
            Delete invoice <strong>{{ invoiceToDelete?.invoiceNumber }}</strong>? This cannot be undone.
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
