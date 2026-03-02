<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeo({
  title: 'Invoices — TinyInvoice',
  description: 'View and manage your invoices.',
})
useWebPageSchema({ name: 'Invoices — TinyInvoice', description: 'Invoice list.' })

const { invoices, listPending, deleteInvoice } = useInvoices()
const { formatCents } = useFormat()
const statusFilter = ref<{ label: string; value: string }>({ label: 'All statuses', value: '' })

const filteredInvoices = computed(() => {
  const list = invoices.value
  const v = statusFilter.value?.value ?? ''
  if (!v) return list
  return list.filter((inv) => inv.status === v)
})

async function confirmDelete(inv: { id: string; invoiceNumber: string }) {
  if (!import.meta.client) return
  if (!confirm(`Delete invoice ${inv.invoiceNumber}?`)) return
  try {
    await deleteInvoice(inv.id)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    alert(err.data?.message ?? err.message ?? 'Delete failed')
  }
}

function statusBadgeColor(status: string) {
  if (status === 'paid') return 'success'
  if (status === 'overdue') return 'error'
  if (status === 'sent') return 'info'
  return 'neutral'
}
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
          :items="[
            { label: 'All statuses', value: '' },
            { label: 'Draft', value: 'draft' },
            { label: 'Sent', value: 'sent' },
            { label: 'Paid', value: 'paid' },
            { label: 'Overdue', value: 'overdue' },
          ]"
          value-attribute="value"
        />
      </div>
      <div v-if="listPending" class="py-12 text-center text-muted">Loading…</div>
      <UTable
        v-else-if="filteredInvoices.length"
        :rows="filteredInvoices"
        :columns="[
          { key: 'invoiceNumber', label: 'Number' },
          { key: 'clientName', label: 'Client' },
          { key: 'status', label: 'Status' },
          { key: 'total', label: 'Total' },
        ] as any"
      >
        <template #status-data="{ row }">
          <UBadge :color="statusBadgeColor((row as unknown as { status: string }).status)" variant="subtle" size="xs">
            {{ (row as unknown as { status: string }).status }}
          </UBadge>
        </template>
        <template #total-data="{ row }">
          {{ formatCents((row as unknown as { total: number }).total) }}
        </template>
        <template #actions-data="{ row }">
          <UButton :to="`/invoices/${(row as unknown as { id: string }).id}`" variant="ghost" color="neutral" size="xs">View</UButton>
          <UButton :to="`/invoices/${(row as unknown as { id: string }).id}/edit`" variant="ghost" color="neutral" size="xs" icon="i-lucide-pencil" />
          <UButton variant="ghost" color="error" size="xs" icon="i-lucide-trash-2" @click="confirmDelete((row as unknown) as { id: string; invoiceNumber: string })" />
        </template>
      </UTable>
      <div v-else class="py-12 text-center text-muted">
        <p>No invoices yet.</p>
        <UButton class="mt-2" to="/invoices/new">Create your first invoice</UButton>
      </div>
    </UCard>
  </UPage>
</template>
