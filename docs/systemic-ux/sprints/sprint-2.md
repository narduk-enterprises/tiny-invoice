# Sprint 2 — Improve Feedback Clarity

**Source:** [../feedback-audit.md](../feedback-audit.md), [../action-consequence-map.md](../action-consequence-map.md)

## Goals

- Every mutation has visible success or failure feedback.
- No silent success (user never has to infer from URL or list change only).
- Destructive actions keep confirmation; add explicit outcome message where helpful.

## Issue cluster

1. **Silent success everywhere** — Login, Register, Logout; Client create/update/delete; Invoice create, update, delete; Invoice status (Mark sent/paid/overdue). Only Settings shows "Settings saved."
2. **Invoice detail status buttons** — No loading state; no error handling; success = badge/button change only.
3. **No global toast** — All feedback is inline (UAlert) or implicit (navigation/list update).

## Implementation (minimal)

### 1. Add toast (or inline) success for mutations

- **Option A:** Use Nuxt UI / app toast (if available) after: login, register, client save, client delete, invoice create, invoice update, invoice delete, invoice status change. Examples: "Logged in", "Client saved", "Invoice created", "Status updated", "Deleted".
- **Option B:** Keep inline only: after each mutation show a short-lived success message in the same context (e.g. above table "Client saved" that auto-clears, or on detail page "Status updated").
- **Files:** Add a shared feedback helper (e.g. `useToast` or `useSuccessMessage`) and call it from: `login.vue`, `register.vue`, `clients.vue`, `invoices/new.vue`, `invoices/[id]/edit.vue`, `invoices/[id].vue`, `invoices/index.vue`, `app.vue` (logout). Settings already has UAlert success.

### 2. Invoice detail: status buttons

- **Loading:** Disable the clicked button and show loading state (or single "Updating…") while `updateStatus` + `refresh` run.
- **Success:** Toast or inline: "Marked as sent" / "Marked as paid" / "Marked as overdue".
- **Error:** `try/catch` around `updateStatus`; show UAlert or toast with `err.data?.message ?? err.message ?? 'Failed to update status'`.
- **Files:** `apps/web/app/pages/invoices/[id].vue` — add `pending` ref, set true before call and false in finally; add error ref and display; optionally call toast on success.

### 3. Logout (optional)

- **Before:** Redirect to `/`; nav updates.
- **After:** Optional short toast: "You're logged out." Not critical if nav change is considered enough.

## Test

- Login → redirect + success message (toast or inline).
- Register → redirect + success message.
- Client save → slideover closes + success message; list updated.
- Client delete → modal closes + success message; row gone.
- Invoice create → navigate to detail + success message.
- Invoice edit save → navigate to detail + success message.
- Invoice delete → modal closes + success message.
- Mark sent/paid/overdue → loading on button, then success message; on failure, error shown.

## Before/after impact

- User always sees confirmation that the action worked (or failed), without inferring from URL or list.
- Status buttons no longer feel "frozen" or ambiguous; errors are visible.
