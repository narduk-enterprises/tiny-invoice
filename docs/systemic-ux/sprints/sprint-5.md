# Sprint 5 — Improve Timing Perception

**Source:** [../timing-audit.md](../timing-audit.md)

## Goals

- User always knows when the system is working (loading state for async actions).
- No "frozen" feeling (every click that triggers a request shows progress or result).

## Issue cluster

1. **Invoice detail: Mark sent / Mark paid / Mark overdue** — No loading state; no error UI. User may double-click or think it failed.
2. **Optional: list loading** — Clients and Invoices list use spinner/text; could use skeleton for stability (lower priority).

## Implementation (minimal)

### 1. Invoice detail: loading and error for status buttons

- **Before:** `markSent()`, `markPaid()`, `markOverdue()` call `updateStatus` then `refresh()`; no pending state, no try/catch.
- **After:**
  - Add `statusPending` ref (or single `pending` for any status action). Set true before `updateStatus`, false in `finally`.
  - Disable all three status buttons when `statusPending` is true (or only the clicked one if you track which).
  - Wrap in try/catch; set `statusError` on failure; show UAlert with `statusError` near buttons.
  - On success, optional toast (see Sprint 2).
- **Files:** `apps/web/app/pages/invoices/[id].vue` — add refs, update markSent/markPaid/markOverdue, template: disable buttons when pending, show error alert.

### 2. Optional: skeleton for lists

- If time allows: replace "Loading…" + spinner on Clients and Invoices list with a table skeleton (e.g. rows of placeholder cells) so layout doesn’t jump from centered spinner to full-width table. Same for New invoice "Loading clients…" if desired.
- **Files:** `apps/web/app/pages/clients.vue`, `apps/web/app/pages/invoices/index.vue` (and optionally `invoices/new.vue`).

## Test

- Click "Mark sent" or "Mark paid" or "Mark overdue": button(s) show loading/disabled until request completes; then badge/buttons update. On network error, error message appears.
- No double-submit; no "frozen" feeling.

## Before/after impact

- User sees that the app is working; no ambiguity after clicking status.
- Errors are visible instead of silent failure.
