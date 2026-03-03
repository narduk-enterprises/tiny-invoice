<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = computed(() => route.params.id as string)
const { data, pending, refresh } = useInvoiceDetail(id)

useSeo({
  title: 'Invoice — TinyInvoice',
  description: 'View invoice details.',
})
useWebPageSchema({ name: 'Invoice', description: 'Invoice detail.' })

const { user } = useAuth()
const { updateStatus } = useInvoices()
const { formatCents, formatDate } = useFormat()
const { invoiceStatusColor } = useInvoiceStatus()
const toast = useToast()

const statusPending = ref(false)
const statusError = ref('')

async function markSent() {
  statusError.value = ''
  statusPending.value = true
  try {
    await updateStatus(id.value, 'sent')
    await refresh()
    toast.add({ title: 'Marked as sent', color: 'success' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    statusError.value = err.data?.message ?? err.message ?? 'Failed to update status'
  } finally {
    statusPending.value = false
  }
}

async function markPaid() {
  statusError.value = ''
  statusPending.value = true
  try {
    await updateStatus(id.value, 'paid')
    await refresh()
    toast.add({ title: 'Marked as paid', color: 'success' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    statusError.value = err.data?.message ?? err.message ?? 'Failed to update status'
  } finally {
    statusPending.value = false
  }
}

async function markOverdue() {
  statusError.value = ''
  statusPending.value = true
  try {
    await updateStatus(id.value, 'overdue')
    await refresh()
    toast.add({ title: 'Marked as overdue', color: 'neutral' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    statusError.value = err.data?.message ?? err.message ?? 'Failed to update status'
  } finally {
    statusPending.value = false
  }
}

const invoice = computed(() => data.value?.invoice)
const invoiceNumber = computed(() => (invoice.value as { invoiceNumber?: string } | undefined)?.invoiceNumber ?? '')
const invoiceStatus = computed(() => (invoice.value as { status?: string } | undefined)?.status ?? '')
const issueDateStr = computed(() =>
  formatDate(((invoice.value as { issueDate?: number })?.issueDate ?? 0) * 1000),
)
const dueDateStr = computed(() =>
  formatDate(((invoice.value as { dueDate?: number })?.dueDate ?? 0) * 1000),
)
const client = computed(() => data.value?.client)
const clientName = computed(() => (client.value as { name?: string } | undefined)?.name ?? '')
const clientEmail = computed(() => (client.value as { email?: string } | undefined)?.email ?? '')
const subtotal = computed(() => (invoice.value as { subtotal?: number } | undefined)?.subtotal ?? 0)
const taxAmount = computed(() => (invoice.value as { taxAmount?: number } | undefined)?.taxAmount ?? 0)
const total = computed(() => (invoice.value as { total?: number } | undefined)?.total ?? 0)
const notes = computed(() => (invoice.value as { notes?: string } | undefined)?.notes ?? null)

function rowUnitPrice(row: { unitPrice?: number }) {
  return formatCents(row.unitPrice ?? 0)
}
function rowAmount(row: { amount?: number }) {
  return formatCents(row.amount ?? 0)
}

const invoiceDetailColumns = [
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'quantity', header: 'Qty' },
  { accessorKey: 'unitPrice', header: 'Unit price' },
  { accessorKey: 'amount', header: 'Amount' },
] as const
</script>

<template>
  <UPage>
    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
    </div>
    <template v-else-if="data?.invoice">
      <UPageHeader :title="`Invoice ${invoiceNumber}`">
        <template #links>
          <UButton to="/invoices" variant="ghost" color="neutral">Back</UButton>
          <UButton :to="`/invoices/${id}/edit`" variant="outline" color="neutral" icon="i-lucide-pencil">Edit</UButton>
        </template>
      </UPageHeader>
      <UCard class="card-base max-w-3xl">
        <div class="p-5">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <UBadge :color="invoiceStatusColor(invoiceStatus)" variant="subtle">
            {{ invoiceStatus }}
          </UBadge>
          <div v-if="invoiceStatus !== 'paid'" class="flex flex-wrap items-center gap-2">
            <UButton
              v-if="invoiceStatus === 'draft'"
              size="sm"
              variant="outline"
              :loading="statusPending"
              :disabled="statusPending"
              @click="markSent"
            >
              Mark sent
            </UButton>
            <UButton
              v-if="invoiceStatus === 'sent' || invoiceStatus === 'overdue'"
              size="sm"
              color="success"
              :loading="statusPending"
              :disabled="statusPending"
              @click="markPaid"
            >
              Mark paid
            </UButton>
            <UDropdownMenu
              v-if="invoiceStatus === 'sent'"
              :items="[[{ label: 'Mark overdue', icon: 'i-lucide-clock', onSelect: markOverdue }]]"
            >
              <UButton size="sm" variant="outline" color="neutral" icon="i-lucide-more-horizontal" aria-label="More actions" />
            </UDropdownMenu>
          </div>
        </div>
        <UAlert v-if="statusError" color="error" :title="statusError" class="mb-4 text-sm" />
        <div class="grid gap-6 sm:grid-cols-2 mb-6">
          <div>
            <p class="text-sm text-muted">From</p>
            <p class="font-medium">{{ user?.businessName || user?.name }}</p>
            <p v-if="user?.businessAddress" class="text-sm text-muted whitespace-pre-line">{{ user.businessAddress }}</p>
          </div>
          <div v-if="data.client">
            <p class="text-sm text-muted">To</p>
            <p class="font-medium">{{ clientName }}</p>
            <p class="text-sm text-muted">{{ clientEmail }}</p>
          </div>
        </div>
        <p class="text-sm text-muted mb-2">
          Issue: {{ issueDateStr }}
          &middot;
          Due: {{ dueDateStr }}
        </p>
        <UTable
          :data="data.lineItems"
          :columns="[...invoiceDetailColumns]"
        >
        <template #unitPrice-cell="{ row }">
          {{ rowUnitPrice(row.original as { unitPrice?: number }) }}
        </template>
        <template #amount-cell="{ row }">
          {{ rowAmount(row.original as { amount?: number }) }}
        </template>
        </UTable>
        <div class="mt-6 flex flex-col items-end gap-1 text-sm">
          <div class="flex gap-8">
            <span class="text-muted">Subtotal</span>
            <span>{{ formatCents(subtotal) }}</span>
          </div>
          <div class="flex gap-8">
            <span class="text-muted">Tax</span>
            <span>{{ formatCents(taxAmount) }}</span>
          </div>
          <div class="flex gap-8 font-semibold text-base">
            <span>Total</span>
            <span>{{ formatCents(total) }}</span>
          </div>
        </div>
        <p v-if="notes" class="mt-6 pt-4 border-t border-default text-sm text-muted">
          {{ notes }}
        </p>
        </div>
      </UCard>
    </template>
    <UPage v-else>
      <UPageHeader title="Invoice not found" description="This invoice may have been deleted or you don't have access.">
        <template #links>
          <UButton to="/invoices" variant="outline" color="neutral">Back to invoices</UButton>
        </template>
      </UPageHeader>
      <p class="text-center text-muted text-sm mt-4">
        <UButton to="/dashboard" variant="ghost" color="neutral" size="sm">Go to dashboard</UButton>
      </p>
    </UPage>
  </UPage>
</template>
