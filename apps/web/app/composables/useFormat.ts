import { formatCents as formatCentsUtil } from '../utils/format'

export function useFormat() {
  return {
    formatCents: formatCentsUtil,
  }
}
