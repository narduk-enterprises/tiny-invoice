<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data, pending } = useAsyncData(
  `invoice-${id.value}`,
  () => $fetch<{ invoice: Record<string, unknown>; client: Record<string, unknown> | null; lineItems: Array<Record<string, unknown>> }>(`/api/invoices/${id.value}`),
  { watch: [id] },
)

useSeo({
  title: 'Invoice — TinyInvoice',
  description: 'View invoice details.',
})
useWebPageSchema({ name: 'Invoice', description: 'Invoice detail.' })

const { user } = useAuth()
const { updateStatus } = useInvoices()
const { formatCents } = useFormat()

async function markSent() {
  await updateStatus(id.value, 'sent')
  await refreshNuxtData(`invoice-${id.value}`)
}

async function markPaid() {
  await updateStatus(id.value, 'paid')
  await refreshNuxtData(`invoice-${id.value}`)
}

async function markOverdue() {
  await updateStatus(id.value, 'overdue')
  await refreshNuxtData(`invoice-${id.value}`)
}

function statusColor(s: string) {
  if (s === 'paid') return 'success'
  if (s === 'overdue') return 'error'
  if (s === 'sent') return 'info'
  return 'neutral'
}
</script>

<template>
  <UPage>
    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
    </div>
    <template v-else-if="data?.invoice">
      <UPageHeader :title="`Invoice ${(data.invoice as { invoiceNumber?: string }).invoiceNumber}`">
        <template #links>
          <UButton to="/invoices" variant="ghost" color="neutral">Back</UButton>
          <UButton :to="`/invoices/${id}/edit`" variant="outline" color="neutral" icon="i-lucide-pencil">Edit</UButton>
        </template>
      </UPageHeader>
      <UCard class="card-base max-w-3xl">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <UBadge :color="statusColor((data.invoice as { status?: string }).status ?? '')" variant="subtle">
            {{ (data.invoice as { status?: string }).status }}
          </UBadge>
          <div v-if="(data.invoice as { status?: string }).status !== 'paid'" class="flex gap-2">
            <UButton
              v-if="(data.invoice as { status?: string }).status === 'draft'"
              size="sm"
              variant="outline"
              @click="markSent"
            >
              Mark sent
            </UButton>
            <UButton
              v-if="(data.invoice as { status?: string }).status === 'sent' || (data.invoice as { status?: string }).status === 'overdue'"
              size="sm"
              color="success"
              @click="markPaid"
            >
              Mark paid
            </UButton>
            <UButton
              v-if="(data.invoice as { status?: string }).status === 'sent'"
              size="sm"
              variant="outline"
              color="error"
              @click="markOverdue"
            >
              Mark overdue
            </UButton>
          </div>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 mb-6">
          <div>
            <p class="text-sm text-muted">From</p>
            <p class="font-medium">{{ user?.businessName || user?.name }}</p>
            <p v-if="user?.businessAddress" class="text-sm text-muted whitespace-pre-line">{{ user.businessAddress }}</p>
          </div>
          <div v-if="data.client">
            <p class="text-sm text-muted">To</p>
            <p class="font-medium">{{ (data.client as { name?: string }).name }}</p>
            <p class="text-sm text-muted">{{ (data.client as { email?: string }).email }}</p>
          </div>
        </div>
        <p class="text-sm text-muted mb-2">
          Issue: {{ new Date(((data.invoice as { issueDate?: number }).issueDate ?? 0) * 1000).toLocaleDateString() }}
          &middot;
          Due: {{ new Date(((data.invoice as { dueDate?: number }).dueDate ?? 0) * 1000).toLocaleDateString() }}
        </p>
        <UTable
          :rows="data.lineItems"
          :columns="[
            { key: 'description', label: 'Description' },
            { key: 'quantity', label: 'Qty' },
            { key: 'unitPrice', label: 'Unit price' },
            { key: 'amount', label: 'Amount' },
          ] as any"
        >
          <template #unitPrice-data="{ row }">
            {{ formatCents((row as { unitPrice?: number }).unitPrice ?? 0) }}
          </template>
          <template #amount-data="{ row }">
            {{ formatCents((row as { amount?: number }).amount ?? 0) }}
          </template>
        </UTable>
        <div class="mt-6 flex flex-col items-end gap-1 text-sm">
          <div class="flex gap-8">
            <span class="text-muted">Subtotal</span>
            <span>{{ formatCents((data.invoice as { subtotal?: number }).subtotal ?? 0) }}</span>
          </div>
          <div class="flex gap-8">
            <span class="text-muted">Tax</span>
            <span>{{ formatCents((data.invoice as { taxAmount?: number }).taxAmount ?? 0) }}</span>
          </div>
          <div class="flex gap-8 font-semibold text-base">
            <span>Total</span>
            <span>{{ formatCents((data.invoice as { total?: number }).total ?? 0) }}</span>
          </div>
        </div>
        <p v-if="(data.invoice as { notes?: string }).notes" class="mt-6 pt-4 border-t border-default text-sm text-muted">
          {{ (data.invoice as { notes?: string }).notes }}
        </p>
      </UCard>
    </template>
    <UPage v-else>
      <UPageHeader title="Not found" description="Invoice not found." />
    </UPage>
  </UPage>
</template>
