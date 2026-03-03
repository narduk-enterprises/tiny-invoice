# Sprint 4 — Empty state & error recovery

## Goal

- Every empty state has a clear next action (primary button or link).
- Invoice not found (and other error surfaces) have a recovery action (e.g. “Back to invoices”).
- No dead ends.

## Scope

1. **Invoice detail — Not found:** Currently shows “Not found” / “Invoice not found.” with no link. Add “Back to invoices” link to `/invoices`.
2. **Invoices list empty:** Already has “Create your first invoice” → keep.
3. **Dashboard recent invoices empty:** Already has “No invoices yet. Create one” link → keep.
4. **Clients list empty:** Already has “Add your first client” → keep.
5. **Optional:** If any load error (e.g. fetch failed) is shown without a retry or back link, add “Try again” or “Back to …” per [edge-cases.md](../edge-cases.md).

## Implementation

- **invoices/[id].vue:** In the `v-else` branch (when `!data?.invoice`), add a primary action: `<UButton to="/invoices">Back to invoices</UButton>` (or equivalent) below the “Invoice not found.” description.
- **Other pages:** Confirm empty and error copy and actions match edge-cases.md; add recovery links/buttons where missing.

## QA checklist (Sprint 4)

- [ ] Invoice not found: message + “Back to invoices” visible; click goes to `/invoices`.
- [ ] Invoices list empty: “Create your first invoice” works.
- [ ] Dashboard recent empty: “Create one” link works.
- [ ] Clients empty: “Add your first client” opens form.
- [ ] Login/register errors: user can retry or navigate away.
- [ ] Delete modals: Cancel and retry available; no blank screen on error.

## Document changes

- **Done:** Invoice not found has recovery action; all empty states have next action; errors have recovery where specified. Implemented: `invoices/[id].vue` not-found block now has `UPageHeader` with links slot containing “Back to invoices” → `/invoices`.
