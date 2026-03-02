/**
 * Format cents as currency string (e.g. 123456 -> "$1,234.56").
 */
export function formatCents(cents: number): string {
  const d = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(d)
}
