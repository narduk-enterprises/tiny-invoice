<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeo({
  title: 'New invoice — TinyInvoice',
  description: 'Create a new invoice.',
})
useWebPageSchema({ name: 'New invoice — TinyInvoice', description: 'Create an invoice.' })

const { clients, pending: clientsPending } = useClients()
const { createInvoice } = useInvoices()
const router = useRouter()
const { formatCents } = useFormat()

const clientId = ref('')
const clientSelect = computed({
  get: () => clients.value.find((c) => c.id === clientId.value) ?? undefined,
  set: (v: { id: string } | null | undefined) => { clientId.value = v?.id ?? '' },
})
const issueDate = ref('')
const dueDate = ref('')
const notes = ref('')
const taxRate = ref(0) // display as percentage (e.g. 8.25); API uses × 100 (825)

interface LineRow {
  id: string
  description: string
  quantity: number
  unitPrice: number
}
const lineItems = ref<LineRow[]>([
  { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
])

function addLine() {
  lineItems.value.push({
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    unitPrice: 0,
  })
}

function removeLine(id: string) {
  if (lineItems.value.length <= 1) return
  lineItems.value = lineItems.value.filter((r) => r.id !== id)
}

const subtotal = computed(() => {
  return lineItems.value.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0)
})
const taxAmount = computed(() => Math.round((subtotal.value * taxRate.value) / 100))
const total = computed(() => subtotal.value + taxAmount.value)

const saving = ref(false)
const error = ref('')

onMounted(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  issueDate.value = `${y}-${m}-${d}`
  const due = new Date(now.getTime() + 30 * 86400 * 1000)
  dueDate.value = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`
})

async function submit() {
  error.value = ''
  const valid = lineItems.value.filter((r) => r.description.trim() && r.quantity > 0 && r.unitPrice >= 0)
  if (!clientId.value) {
    error.value = 'Select a client'
    return
  }
  if (valid.length === 0) {
    error.value = 'Add at least one line item'
    return
  }
  saving.value = true
  try {
    const res = await createInvoice({
      clientId: clientId.value,
      issueDate: Math.floor(new Date(issueDate.value).getTime() / 1000),
      dueDate: Math.floor(new Date(dueDate.value).getTime() / 1000),
      notes: notes.value.trim() || undefined,
      taxRate: taxRate.value ? Math.round(taxRate.value * 100) : undefined,
      lineItems: valid.map((r) => ({
        description: r.description.trim(),
        quantity: r.quantity,
        unitPrice: r.unitPrice,
      })),
    })
    await router.push(`/invoices/${res.invoice.id}`)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err.data?.message ?? err.message ?? 'Failed to create invoice'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UPage>
    <UPageHeader title="New invoice" description="Create a new invoice.">
      <template #links>
        <UButton to="/invoices" variant="ghost" color="neutral">Back</UButton>
      </template>
    </UPageHeader>
    <UCard class="card-base max-w-3xl">
      <div v-if="clientsPending" class="py-8 text-center text-muted">Loading clients…</div>
      <UForm v-else :state="{}" @submit="submit">
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
            <UTextarea v-model="notes" placeholder="Thank you for your business." :rows="2" />
          </UFormField>
          <UFormField label="Tax rate (%)">
            <UInput v-model.number="taxRate" type="number" min="0" max="100" step="0.01" placeholder="0" />
          </UFormField>
          <div>
            <div class="mb-2 flex items-center justify-between">
              <span class="font-medium">Line items</span>
              <UButton type="button" variant="ghost" size="sm" icon="i-lucide-plus" @click="addLine">Add line</UButton>
            </div>
            <div class="space-y-3">
              <div
                v-for="row in lineItems"
                :key="row.id"
                class="grid grid-cols-12 gap-2 items-end"
              >
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
          <div class="flex justify-end gap-4 text-sm">
            <span class="text-muted">Subtotal:</span>
            <span>{{ formatCents(subtotal) }}</span>
          </div>
          <div class="flex justify-end gap-4 text-sm">
            <span class="text-muted">Tax:</span>
            <span>{{ formatCents(taxAmount) }}</span>
          </div>
          <div class="flex justify-end gap-4 font-semibold">
            <span>Total:</span>
            <span>{{ formatCents(total) }}</span>
          </div>
          <UAlert v-if="error" color="error" :title="error" class="text-sm" />
          <div class="flex gap-2">
            <UButton type="submit" :loading="saving">Create invoice</UButton>
            <UButton to="/invoices" variant="ghost" color="neutral">Cancel</UButton>
          </div>
        </div>
      </UForm>
    </UCard>
  </UPage>
</template>
