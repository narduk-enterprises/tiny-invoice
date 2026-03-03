/** Nuxt UI badge color for invoice status. Use for UBadge color prop. */
function invoiceStatusColor(status: string): 'success' | 'error' | 'info' | 'neutral' {
  if (status === 'paid') return 'success'
  if (status === 'overdue') return 'error'
  if (status === 'sent') return 'info'
  return 'neutral'
}

export function useInvoiceStatus() {
  return { invoiceStatusColor }
}
