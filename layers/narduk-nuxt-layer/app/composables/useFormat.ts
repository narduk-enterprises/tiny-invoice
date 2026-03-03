/**
 * Composable that returns shared formatting utilities (currency, dates, numbers).
 * Implementations live in utils/format.ts to avoid duplicate auto-imports.
 */
import {
  formatCents,
  formatCompact,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatInteger,
  formatNumber,
  formatPercent,
  formatRelative,
} from '../utils/format'

export default function useFormat() {
  return {
    formatCents,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatRelative,
    formatNumber,
    formatInteger,
    formatPercent,
    formatCompact,
  }
}
