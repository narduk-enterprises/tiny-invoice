# Sprint 2: Invoices journey

**Goal:** Fix hydration on new invoice, replace native confirm/alert with modal, persist status filter in URL.

---

## Fixes implemented (3)

### 1. Hydration-safe line items (new + edit)
- **Cause:** `/invoices/new` initialized `lineItems` with `crypto.randomUUID()` at module scope; SSR and client produced different IDs → hydration mismatch. Edit page used `crypto.randomUUID()` when adding a row or when API returned 0 line items.
- **Change:**
  - **New:** Initial row uses deterministic id `'row-0'`. Additional rows use `nextRowId()` (client: `crypto.randomUUID()`, SSR fallback: `row-${Date.now()}`).
  - **Edit:** When API returns 0 line items, initial row uses `'row-0'`. `addLine()` uses `nextRowId()`.
- **Impact:** No server/client ID mismatch; hydration safe.

### 2. Delete confirmation via UModal (no confirm/alert)
- **Cause:** Invoice delete used `confirm()` and `alert()` for errors — blocks main thread, poor a11y.
- **Change:** Added `deleteModalOpen`, `invoiceToDelete`, `deleteError`, `deletePending`. Click delete opens `UModal` with title “Delete invoice X? This cannot be undone.”, Cancel and Delete (error color) buttons. On confirm: call `deleteInvoice`, close modal on success; on error show `UAlert` in modal. Delete button has `:loading="deletePending"`. Icon button has `aria-label="Delete invoice"`.
- **Impact:** Accessible, non-blocking; consistent with design system.

### 3. Status filter synced to URL
- **Cause:** Filter was ref-only; refreshing the page lost the selection.
- **Change:** Filter driven by `route.query.status`. `statusFilterValue` is a computed with get from `route.query.status` and set that calls `router.replace({ query })` (add or remove `status`). `USelectMenu` v-model bound to a computed that maps between option object and query value. Filter options in a constant `statusOptions`.
- **Impact:** Filter survives refresh; shareable URLs (e.g. `/invoices?status=sent`).

---

## Empty / loading / error states

- **Loading:** Unchanged (“Loading…” for table).
- **Empty:** Unchanged (“No invoices yet” + CTA).
- **Error (delete):** Shown inside modal via `UAlert`; no `alert()`.

---

## Tests and lint

- Lint: `invoices/index.vue`, `invoices/new.vue`, `invoices/[id]/edit.vue` — no new errors.
- Manual: New invoice → one row with id row-0; add row → new UUID. Invoices list → delete opens modal, confirm/cancel; filter change updates URL and survives refresh.
