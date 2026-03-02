/**
 * Composable that exposes shared formatting utilities.
 * Use in components via: const { formatCents, formatDate, ... } = useFormat()
 */

import * as formatters from '~/utils/format'

export default function useFormat() {
  return { ...formatters }
}
