<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeo({
  title: 'Dashboard — TinyInvoice',
  description: 'Overview of your revenue, outstanding invoices, and activity.',
})
useWebPageSchema({ name: 'Dashboard — TinyInvoice', description: 'Invoice and revenue overview.' })

const { stats, pending } = useDashboard()
const { invoices, listPending } = useInvoices()
const { formatCents } = useFormat()

const recentInvoices = computed(() => invoices.value.slice(0, 5))
const totalInvoiceCount = computed(
  () =>
    (stats.value?.invoiceCountByStatus?.draft ?? 0) +
    (stats.value?.invoiceCountByStatus?.sent ?? 0) +
    (stats.value?.invoiceCountByStatus?.paid ?? 0) +
    (stats.value?.invoiceCountByStatus?.overdue ?? 0),
)
const displayRevenue = computed(() => formatCents(stats.value?.totalRevenue ?? 0))
const displayOutstanding = computed(() => formatCents(stats.value?.outstanding ?? 0))
const displayPaidCount = computed(() => stats.value?.invoiceCountByStatus?.paid ?? 0)
function rowStatusColor(status: string) {
  if (status === 'paid') return 'success'
  if (status === 'overdue') return 'error'
  if (status === 'sent') return 'info'
  return 'neutral'
}
function rowTotal(row: { total?: number }) {
  return formatCents(row.total ?? 0)
}

function getRowBadgeColor(row: unknown) {
  return rowStatusColor((row as { status?: string }).status ?? '')
}

function getRowBadgeLabel(row: unknown) {
  return (row as { status?: string }).status ?? ''
}
</script>

<template>
  <UPage>
    <UPageHeader title="Dashboard" description="Your invoicing overview." />
    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
    </div>
    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard class="card-base">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-success/10 p-2">
              <UIcon name="i-lucide-banknote" class="size-5 text-success" />
            </div>
            <div>
              <p class="text-sm text-muted">Total revenue (paid)</p>
              <p class="text-xl font-semibold">{{ displayRevenue }}</p>
            </div>
          </div>
        </UCard>
        <UCard class="card-base">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-info/10 p-2">
              <UIcon name="i-lucide-clock" class="size-5 text-info" />
            </div>
            <div>
              <p class="text-sm text-muted">Outstanding</p>
              <p class="text-xl font-semibold">{{ displayOutstanding }}</p>
            </div>
          </div>
        </UCard>
        <UCard class="card-base">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-primary/10 p-2">
              <UIcon name="i-lucide-file-text" class="size-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted">Invoices</p>
              <p class="text-xl font-semibold">{{ totalInvoiceCount }}</p>
            </div>
          </div>
        </UCard>
        <UCard class="card-base">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-success/10 p-2">
              <UIcon name="i-lucide-check-circle" class="size-5 text-success" />
            </div>
            <div>
              <p class="text-sm text-muted">Paid</p>
              <p class="text-xl font-semibold">{{ displayPaidCount }}</p>
            </div>
          </div>
        </UCard>
      </div>
      <UCard class="mt-8 card-base">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Recent invoices</span>
            <UButton to="/invoices" variant="ghost" color="neutral" size="sm">View all</UButton>
          </div>
        </template>
        <div v-if="listPending" class="py-8 text-center text-muted text-sm">Loading…</div>
        <UTable
          v-else-if="recentInvoices.length"
          :rows="recentInvoices"
          :columns="[
            { key: 'invoiceNumber', label: 'Number' },
            { key: 'clientName', label: 'Client' },
            { key: 'status', label: 'Status' },
            { key: 'total', label: 'Total' },
          ] as any"
        >
          <template #status-data="{ row }">
            <UBadge
              :color="getRowBadgeColor(row)"
              variant="subtle"
              size="xs"
            >
              {{ getRowBadgeLabel(row) }}
            </UBadge>
          </template>
          <template #total-data="{ row }">
            {{ rowTotal(row as { total?: number }) }}
          </template>
        </UTable>
        <p v-else class="py-8 text-center text-muted text-sm">No invoices yet. <ULink to="/invoices/new">Create one</ULink>.</p>
      </UCard>
    </template>
  </UPage>
</template>
