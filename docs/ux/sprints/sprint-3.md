# Sprint 3: Clients + shared status composable

**Goal:** Replace client delete confirm/alert with modal, add Zod validation to client form, centralize invoice status badge color.

---

## Fixes implemented (3)

### 1. Client delete confirmation via UModal
- **Cause:** Same as invoices — `confirm()` and `alert()` for client delete.
- **Change:** Added `deleteModalOpen`, `clientToDelete`, `deleteError`, `deletePending`. Delete button opens `UModal` with message “Delete client X? This will fail if they have invoices.”, Cancel and Delete (error) buttons. Errors shown in `UAlert` inside modal. Icon button has `aria-label="Delete client"`.
- **Impact:** Consistent with invoices; a11y-friendly; no native dialogs.

### 2. Zod schema for client slideover form
- **Cause:** Client form had no validation; inconsistent with login/register.
- **Change:** Added `clientSchema` (z.object: name min 1, email email(), address and phone optional). `UForm` now has `:schema="clientSchema"` in addition to `:state="formState"`.
- **Impact:** Validation before submit; consistent form pattern across app.

### 3. Shared invoice status color composable
- **Cause:** Status → badge color logic duplicated in dashboard, invoices list, and invoice detail.
- **Change:** Added `app/composables/useInvoiceStatus.ts` with `invoiceStatusColor(status: string)` returning `'success' | 'error' | 'info' | 'neutral'` for paid/overdue/sent/draft. Replaced inline `statusBadgeColor` / `statusColor` in dashboard, invoices index, and invoices/[id] with `useInvoiceStatus()` and `invoiceStatusColor(...)`.
- **Impact:** Single source of truth; easier to change mapping or add statuses later.

---

## Empty / loading / error states

- **Loading:** Unchanged (spinner for clients list).
- **Empty:** Unchanged (“No clients yet” + CTA).
- **Error (delete):** Shown in modal via `UAlert`. Form errors from Zod shown in existing `UAlert` in slideover.

---

## Tests and lint

- Lint: `clients.vue`, `useInvoiceStatus.ts`, `dashboard.vue`, `invoices/index.vue`, `invoices/[id].vue` — no new errors.
- Manual: Client delete opens modal; validation on client form (empty name/email); status badges unchanged visually, now from composable.
