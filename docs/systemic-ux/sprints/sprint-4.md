# Sprint 4 — Simplify Controls & Destructive Exposure

**Source:** [../control-exposure.md](../control-exposure.md), [../noise-audit.md](../noise-audit.md)

## Goals

- Destructive or rare actions are not as prominent as primary actions.
- No duplicate exit controls (e.g. Back and Cancel doing the same thing).
- Disabled controls have a clear reason (aria-label or tooltip).

## Issue cluster

1. **Invoice detail: Mark overdue** — Same row as Mark paid; easy to misclick; should be secondary (e.g. in "More" menu).
2. **New invoice: Back + Cancel** — Header "Back" and form "Cancel" both go to /invoices; duplicate.
3. **Remove line (disabled)** — When only one line item, trash is disabled with no explanation.
4. **Landing: two primary CTAs** — Handled in Sprint 1; optional cross-check here.

## Implementation (minimal)

### 1. Invoice detail: Mark overdue secondary

- **Before:** When status = sent, two buttons: "Mark paid", "Mark overdue".
- **After:** "Mark paid" only in main row. "Mark overdue" in a dropdown or "More" (e.g. UDropdownMenu with "Mark overdue" item). User still can change to overdue, but it’s not one click next to Mark paid.
- **Files:** `apps/web/app/pages/invoices/[id].vue` — refactor status actions: primary button "Mark paid"; secondary dropdown "More" with "Mark overdue".

### 2. New invoice: single exit control

- **Before:** Header "Back" (to /invoices), form "Cancel" (to /invoices).
- **After:** Keep one: e.g. header "Back" to /invoices and remove form "Cancel", or keep "Cancel" and remove header "Back". Prefer header "Back" for consistency with other pages.
- **Files:** `apps/web/app/pages/invoices/new.vue` — remove duplicate; ensure one clear way to leave without submitting.

### 3. Remove line: aria-label when disabled

- **Before:** `UButton` trash disabled when `lineItems.length <= 1`; no explanation.
- **After:** Add `aria-label="Remove line (at least one line required)"` when disabled, or use `UTooltip` / title. Prefer aria-label for accessibility.
- **Files:** `apps/web/app/pages/invoices/new.vue`, `apps/web/app/pages/invoices/[id]/edit.vue` — same pattern on remove-line button.

## Test

- Invoice detail (sent): Mark paid is the only prominent action; Mark overdue in More.
- New invoice: One way to go back (Back or Cancel, not both).
- New/Edit invoice: Disabled remove-line has accessible explanation.

## Before/after impact

- Fewer accidental "Mark overdue" clicks; primary action obvious.
- Less UI noise; no redundant Back/Cancel.
- Screen reader and tooltip users understand why remove is disabled.
