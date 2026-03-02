<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = computed(() => route.params.id as string)
const router = useRouter()

const { data: invoiceData, pending: loadPending } = useInvoiceDetail(id)

useSeo({
  title: 'Edit invoice — TinyInvoice',
  description: 'Edit invoice.',
})
useWebPageSchema({ name: 'Edit invoice — TinyInvoice', description: 'Edit invoice.' })

const { clients } = useClients()
const { updateInvoice } = useInvoices()
const { formatCents } = useFormat()

const clientId = ref('')
const clientSelect = computed({
  get: () => clients.value.find((c) => c.id === clientId.value) ?? undefined,
  set: (v: { id: string } | null | undefined) => { clientId.value = v?.id ?? '' },
})
const issueDate = ref('')
const dueDate = ref('')
const notes = ref('')
const taxRate = ref(0)

interface LineRow {
  id: string
  description: string
  quantity: number
  unitPrice: number
}
const lineItems = ref<LineRow[]>([])

watch(invoiceData, (d) => {
  if (!d?.invoice) return
  const inv = d.invoice as { clientId?: string; issueDate?: number; dueDate?: number; notes?: string | null; taxRate?: number | null }
  clientId.value = inv.clientId ?? ''
  issueDate.value = inv.issueDate ? new Date(inv.issueDate * 1000).toISOString().slice(0, 10) : ''
  dueDate.value = inv.dueDate ? new Date(inv.dueDate * 1000).toISOString().slice(0, 10) : ''
  notes.value = inv.notes ?? ''
  taxRate.value = inv.taxRate != null ? inv.taxRate / 100 : 0
  lineItems.value = (d.lineItems ?? []).map((r) => ({
    id: r.id,
    description: r.description,
    quantity: r.quantity,
    unitPrice: r.unitPrice,
  }))
  if (lineItems.value.length === 0) {
    lineItems.value = [{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }]
  }
}, { immediate: true })

function addLine() {
  lineItems.value.push({ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 })
}

function removeLine(rowId: string) {
  if (lineItems.value.length <= 1) return
  lineItems.value = lineItems.value.filter((r) => r.id !== rowId)
}

const subtotal = computed(() => lineItems.value.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0))
const taxAmount = computed(() => Math.round((subtotal.value * taxRate.value) / 100))
const total = computed(() => subtotal.value + taxAmount.value)

const saving = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  const valid = lineItems.value.filter((r) => r.description.trim() && r.quantity > 0 && r.unitPrice >= 0)
  if (!clientId.value || valid.length === 0) {
    error.value = 'Select a client and add at least one line item'
    return
  }
  saving.value = true
  try {
    await updateInvoice(id.value, {
      clientId: clientId.value,
      issueDate: Math.floor(new Date(issueDate.value).getTime() / 1000),
      dueDate: Math.floor(new Date(dueDate.value).getTime() / 1000),
      notes: notes.value.trim() || undefined,
      taxRate: taxRate.value ? Math.round(taxRate.value * 100) : undefined,
      lineItems: valid.map((r) => ({ description: r.description.trim(), quantity: r.quantity, unitPrice: r.unitPrice })),
    })
    await router.push(`/invoices/${id.value}`)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err.data?.message ?? err.message ?? 'Failed to update'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UPage>
    <UPageHeader title="Edit invoice" description="Update invoice details.">
      <template #links>
        <UButton :to="`/invoices/${id}`" variant="ghost" color="neutral">Cancel</UButton>
      </template>
    </UPageHeader>
    <div v-if="loadPending" class="py-12 text-center text-muted">Loading…</div>
    <UCard v-else-if="invoiceData?.invoice" class="card-base max-w-3xl">
      <UForm :state="{}" @submit="submit">
        <div class="space-y-6">
          <UFormField label="Client" required>
            <USelectMenu
              v-model="clientSelect"
              :items="clients"
              value-attribute="id"
              placeholder="Select client"
            >
              <template #leading>
                {{ clients.find(c => c.id === clientId)?.name ?? 'Select client' }}
              </template>
            </USelectMenu>
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Issue date" required>
              <UInput v-model="issueDate" type="date" />
            </UFormField>
            <UFormField label="Due date" required>
              <UInput v-model="dueDate" type="date" />
            </UFormField>
          </div>
          <UFormField label="Notes">
            <UTextarea v-model="notes" :rows="2" />
          </UFormField>
          <UFormField label="Tax rate (%)">
            <UInput v-model.number="taxRate" type="number" min="0" max="100" step="0.01" />
          </UFormField>
          <div>
            <div class="mb-2 flex items-center justify-between">
              <span class="font-medium">Line items</span>
              <UButton type="button" variant="ghost" size="sm" icon="i-lucide-plus" @click="addLine">Add line</UButton>
            </div>
            <div class="space-y-3">
              <div v-for="row in lineItems" :key="row.id" class="grid grid-cols-12 gap-2 items-end">
                <div class="col-span-12 sm:col-span-5">
                  <UInput v-model="row.description" placeholder="Description" />
                </div>
                <div class="col-span-4 sm:col-span-2">
                  <UInput v-model.number="row.quantity" type="number" min="1" placeholder="Qty" />
                </div>
                <div class="col-span-4 sm:col-span-2">
                  <UInput v-model.number="row.unitPrice" type="number" min="0" placeholder="Unit price (¢)" />
                </div>
                <div class="col-span-2 sm:col-span-2 text-sm text-muted">
                  {{ formatCents(row.quantity * row.unitPrice) }}
                </div>
                <div class="col-span-2">
                  <UButton
                    type="button"
                    variant="ghost"
                    color="error"
                    size="xs"
                    icon="i-lucide-trash-2"
                    :disabled="lineItems.length <= 1"
                    @click="removeLine(row.id)"
                  />
                </div>
              </div>
            </div>
          </div>
          <USeparator />
          <div class="flex justify-end gap-4 font-semibold">
            <span>Total:</span>
            <span>{{ formatCents(total) }}</span>
          </div>
          <UAlert v-if="error" color="error" :title="error" class="text-sm" />
          <UButton type="submit" :loading="saving">Save changes</UButton>
        </div>
      </UForm>
    </UCard>
  </UPage>
</template>
