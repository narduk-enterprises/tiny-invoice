# Sprint 6 — Remove UI Noise

**Source:** [../noise-audit.md](../noise-audit.md), [../cognitive-load-audit.md](../cognitive-load-audit.md)

## Goals

- One primary CTA on landing; demo and login secondary.
- Footer is user-facing (no tech stack).
- No duplicate or redundant controls in forms.

## Issue cluster

1. **Landing: 3 CTAs** — Get started, Log in, Try demo; two primary-weight. See Sprint 1; here we only remove or demote "Try demo" and ensure one primary.
2. **Footer: Nuxt UI 4 · Cloudflare Workers** — Technical; remove. See Sprint 3 (trust); same change.
3. **New/Edit invoice: Back vs Cancel** — Duplicate; remove one. See Sprint 4.
4. **Login: Demo block** — UAlert + "Fill demo credentials" button; could be one compact line to reduce height (optional).

## Implementation (minimal)

### 1. Landing: single primary CTA

- **Before:** Get started (primary), Log in (outline), Try demo (soft primary).
- **After:** Primary: "Get started". Secondary: "Log in". Demo: text link "Try the demo" (to /login?demo=1) below or next to Log in, or small tertiary button. Ensure only one button reads as "main" action.
- **Files:** `apps/web/app/pages/index.vue` — adjust UPageHero links slot: one UButton primary, one outline, one ULink or smaller button for demo.

### 2. Footer (duplicate of Sprint 3)

- Remove "Nuxt UI 4 · Cloudflare Workers" from footer; keep app name and year/copyright.
- **Files:** `apps/web/app/app.vue`.

### 3. New invoice: one exit control

- Remove either header "Back" or form "Cancel"; keep one. **Files:** `apps/web/app/pages/invoices/new.vue`.

### 4. Login: compact demo (optional)

- **Before:** Full UAlert + "Fill demo credentials" button.
- **After:** Single line under form or in description: "Demo: demo@tinyinvoice.com / demo1234" with optional "Fill" link. Reduces card height.
- **Files:** `apps/web/app/pages/login.vue`.

## Test

- Landing: One obvious primary button; demo still discoverable.
- Footer: No tech stack.
- New invoice: Single back/cancel.
- Login (optional): Demo info compact.

## Before/after impact

- Less visual competition; clearer hierarchy.
- Footer and forms feel cleaner and more product-focused.
