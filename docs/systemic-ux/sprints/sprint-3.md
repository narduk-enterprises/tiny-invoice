# Sprint 3 — Fix Trust Leaks

**Source:** [../trust-audit.md](../trust-audit.md)

## Goals

- Consistent date formatting across the app.
- No technical jargon in user-facing copy (footer, labels).
- Currency and numbers remain consistent (already using formatCents).

## Issue cluster

1. **Invoice detail dates** — Issue and Due use `toLocaleDateString()` without going through app formatter; may differ from rest of app.
2. **Footer** — "Nuxt UI 4 · Cloudflare Workers" is implementation detail; reduces trust for business users.
3. **Unit price label** — Placeholder or label "Unit price (¢)" exposes implementation (cents); use "Unit price" or clarify in a user-friendly way.

## Implementation (minimal)

### 1. Invoice detail: use formatDate

- **Before:** `new Date(ts * 1000).toLocaleDateString()` for issue and due.
- **After:** Use `formatDate()` from `useFormat()` (layer provides it). If app overrides useFormat, ensure formatDate uses same locale/options everywhere.
- **Files:** `apps/web/app/pages/invoices/[id].vue` — replace `issueDateStr` and `dueDateStr` computed to use `formatDate(ts * 1000)` or equivalent (check layer `formatDate` signature: date vs timestamp).

### 2. Footer copy

- **Before:** `{{ appName }} · Nuxt UI 4 · Cloudflare Workers · <NuxtTime …>`.
- **After:** `{{ appName }} · © <year>` or `{{ appName }} · All rights reserved` (and optional link to terms/privacy). Remove "Nuxt UI 4" and "Cloudflare Workers".
- **Files:** `apps/web/app/app.vue` — update footer template.

### 3. Unit price label (New/Edit invoice)

- **Before:** Placeholder "Unit price (¢)" or label implying cents.
- **After:** Label "Unit price" (no "(¢)"); placeholder e.g. "0.00" or "Amount". If backend expects cents, keep conversion in code; don’t expose "cents" to user. Optional: add helper text "Amount per item" if needed.
- **Files:** `apps/web/app/pages/invoices/new.vue`, `apps/web/app/pages/invoices/[id]/edit.vue` — update label/placeholder for unit price.

## Test

- Invoice detail: Issue and Due dates match style (e.g. same as elsewhere if formatDate is used in lists later).
- Footer: No tech stack; reads like a product footer.
- New/Edit invoice: No "(¢)" in UI.

## Before/after impact

- Consistent, professional date display; single source of truth for formatting.
- Footer feels product-focused, not dev-focused.
- Users aren’t confronted with implementation details (cents).
