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
const { invoiceStatusColor } = useInvoiceStatus()

const loading = computed(() => pending.value || listPending.value)
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
function rowTotal(row: { total?: number }) {
  return formatCents(row.total ?? 0)
}

function getRowBadgeColor(row: unknown) {
  return invoiceStatusColor((row as { status?: string }).status ?? '')
}

function getRowBadgeLabel(row: unknown) {
  return (row as { status?: string }).status ?? ''
}

const dashboardInvoiceColumns = [
  { accessorKey: 'invoiceNumber', header: 'Number' },
  { accessorKey: 'clientName', header: 'Client' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'total', header: 'Total' },
] as const
</script>

<template>
  <UPage>
    <UPageHeader title="Dashboard" description="Your invoicing overview." />
    <template v-if="loading">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard v-for="i in 4" :key="i" class="card-base">
          <div class="p-5 flex items-center gap-3">
            <div class="rounded-lg bg-elevated size-12 animate-pulse" />
            <div class="flex-1 space-y-2">
              <div class="h-4 w-24 rounded bg-elevated animate-pulse" />
              <div class="h-6 w-20 rounded bg-elevated animate-pulse" />
            </div>
          </div>
        </UCard>
      </div>
      <UCard class="mt-8 card-base">
        <template #header>
          <span class="font-semibold">Recent invoices</span>
        </template>
        <div class="p-5 space-y-3">
          <div v-for="i in 5" :key="i" class="flex gap-4">
            <div class="h-5 w-24 rounded bg-elevated animate-pulse" />
            <div class="h-5 flex-1 rounded bg-elevated animate-pulse" />
            <div class="h-5 w-16 rounded bg-elevated animate-pulse" />
            <div class="h-5 w-20 rounded bg-elevated animate-pulse" />
          </div>
        </div>
      </UCard>
    </template>
    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard class="card-base">
          <div class="p-5 flex items-center gap-3">
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
          <div class="p-5 flex items-center gap-3">
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
          <div class="p-5 flex items-center gap-3">
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
          <div class="p-5 flex items-center gap-3">
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
        <UTable
          v-if="recentInvoices.length"
          :data="recentInvoices"
          :columns="[...dashboardInvoiceColumns]"
        >
          <template #status-cell="{ row }">
            <UBadge
              :color="getRowBadgeColor(row.original)"
              variant="subtle"
              size="xs"
            >
              {{ getRowBadgeLabel(row.original) }}
            </UBadge>
          </template>
          <template #total-cell="{ row }">
            {{ rowTotal(row.original as { total?: number }) }}
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
    </template>
  </UPage>
</template>
