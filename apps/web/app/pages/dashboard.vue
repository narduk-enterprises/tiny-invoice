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

const { data: listData } = useFetch<{ invoices: { id: string; invoiceNumber: string; status: string; total: number; clientName?: string }[] }>('/api/invoices', {
  default: () => ({ invoices: [] }),
})
const recentInvoices = computed(() => (listData.value?.invoices ?? []).slice(0, 5))
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
              <p class="text-xl font-semibold">{{ formatCents(stats?.totalRevenue ?? 0) }}</p>
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
              <p class="text-xl font-semibold">{{ formatCents(stats?.outstanding ?? 0) }}</p>
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
              <p class="text-xl font-semibold">
                {{ (stats?.invoiceCountByStatus?.draft ?? 0) + (stats?.invoiceCountByStatus?.sent ?? 0) + (stats?.invoiceCountByStatus?.paid ?? 0) + (stats?.invoiceCountByStatus?.overdue ?? 0) }}
              </p>
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
              <p class="text-xl font-semibold">{{ stats?.invoiceCountByStatus?.paid ?? 0 }}</p>
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
              :color="(row as unknown as { status: string }).status === 'paid' ? 'success' : (row as unknown as { status: string }).status === 'overdue' ? 'error' : (row as unknown as { status: string }).status === 'sent' ? 'info' : 'neutral'"
              variant="subtle"
              size="xs"
            >
              {{ (row as unknown as { status: string }).status }}
            </UBadge>
          </template>
          <template #total-data="{ row }">
            {{ formatCents((row as unknown as { total: number }).total) }}
          </template>
        </UTable>
        <p v-else class="py-8 text-center text-muted text-sm">No invoices yet. <ULink to="/invoices/new">Create one</ULink>.</p>
      </UCard>
    </template>
  </UPage>
</template>
