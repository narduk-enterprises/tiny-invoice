import type { MaybeRef, Ref } from 'vue'
import { computed, isRef, ref } from 'vue'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface InvoiceListItem {
  id: string
  clientId: string
  clientName?: string
  invoiceNumber: string
  status: InvoiceStatus
  issueDate: number
  dueDate: number
  total: number
  createdAt: number
}

export interface LineItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  sortOrder: number
}

export interface InvoiceDetail {
  invoice: InvoiceListItem & {
    notes: string | null
    subtotal: number
    taxRate: number | null
    taxAmount: number
    paidAt: number | null
    updatedAt: number
  }
  client: { id: string; name: string; email: string; address: string | null; phone: string | null } | null
  lineItems: LineItem[]
}

export function useInvoices() {
  const { data: listData, pending: listPending, refresh: refreshList } = useFetch<{ invoices: InvoiceListItem[] }>(
    '/api/invoices',
    { default: () => ({ invoices: [] }), watch: false },
  )
  const { $csrfFetch } = useNuxtApp()

  const invoices = computed(() => listData.value?.invoices ?? [])

  async function createInvoice(body: {
    clientId: string
    issueDate: number
    dueDate: number
    notes?: string
    taxRate?: number
    lineItems: { description: string; quantity: number; unitPrice: number }[]
  }) {
    const res = await $csrfFetch<InvoiceDetail>('/api/invoices', {
      method: 'POST',
      body,
    })
    await refreshList()
    return res
  }

  async function updateInvoice(
    id: string,
    body: {
      clientId: string
      issueDate: number
      dueDate: number
      notes?: string
      taxRate?: number
      lineItems: { description: string; quantity: number; unitPrice: number }[]
    },
  ) {
    const res = await $csrfFetch<InvoiceDetail>(`/api/invoices/${id}`, {
      method: 'PUT',
      body,
    })
    await refreshList()
    return res
  }

  async function updateStatus(id: string, status: InvoiceStatus) {
    await $csrfFetch(`/api/invoices/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
    await refreshList()
  }

  async function deleteInvoice(id: string) {
    await $csrfFetch(`/api/invoices/${id}`, { method: 'DELETE' })
    await refreshList()
  }

  return {
    invoices,
    listPending,
    refreshList,
    createInvoice,
    updateInvoice,
    updateStatus,
    deleteInvoice,
  }
}

/* Normalize MaybeRef to Ref; ref() in branch is intentional */
function toRefOrIdentity(r: MaybeRef<string>): Ref<string> {
  // eslint-disable-next-line vue-official/no-composable-conditional-hooks -- normalize ref vs value
  return isRef(r) ? r : ref(r)
}

export function useInvoiceDetail(invoiceId: MaybeRef<string>) {
  const idRef = toRefOrIdentity(invoiceId)
  const key = computed(() => `invoice-${idRef.value}`)
  const fetcher = () => $fetch<InvoiceDetail>(`/api/invoices/${idRef.value}`)
  /* eslint-disable-next-line nuxt-guardrails/valid-useAsyncData -- reactive key required for route param */
  return useAsyncData(key, fetcher, { watch: [idRef] })
}
