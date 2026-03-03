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

const defaultStats = (): DashboardStats => ({
  totalRevenue: 0,
  outstanding: 0,
  invoiceCountByStatus: { draft: 0, sent: 0, paid: 0, overdue: 0 },
})

export function useDashboard() {
  const headers = useRequestHeaders(['cookie'])
  const { data: stats, pending, refresh } = useFetch<DashboardStats>('/api/dashboard', {
    key: 'dashboard',
    headers,
    default: defaultStats,
    watch: false,
  })

  return {
    stats,
    pending,
    refresh,
  }
}
