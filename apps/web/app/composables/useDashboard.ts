export interface DashboardStats {
  totalRevenue: number
  outstanding: number
  invoiceCountByStatus: {
    draft: number
    sent: number
    paid: number
    overdue: number
  }
}

export function useDashboard() {
  const { data, pending, refresh } = useAsyncData<DashboardStats>(
    'dashboard',
    () => $fetch<DashboardStats>('/api/dashboard'),
    { default: () => ({ totalRevenue: 0, outstanding: 0, invoiceCountByStatus: { draft: 0, sent: 0, paid: 0, overdue: 0 } }) },
  )

  return {
    stats: data,
    pending,
    refresh,
  }
}
