# Sprint 1 — Auth nav separation & remove Home when logged in

## Goal

- Logged-out nav: only auth + branding (no Dashboard, Invoices, Clients).
- Logged-in nav: no “Home” link to `/`; Dashboard is the single home base.
- Eliminate Home vs Dashboard duplication.

## Scope

1. **app.vue** — `navItems` computed:
   - When **logged out:** nav items = empty or only optional “Home” to `/` (or remove entirely; logo already goes to `/`). Current: `[{ label: 'Home', to: '/', icon: 'i-lucide-home' }]`. **Change:** when logged out, keep a single “Home” to `/` if desired for landing, or remove so only logo is the way to landing.
   - When **logged in:** nav items = Dashboard, Clients, Invoices, Settings only. **Remove** “Home” from the array so logged-in users do not see Home in nav.
2. **Mobile nav** uses same `navItems`; no separate change needed once `navItems` is fixed.

## Implementation

- In `navItems` computed: when `user.value` is set, return only `[Dashboard, Clients, Invoices, Settings]`. Do not include `{ label: 'Home', to: '/', ... }` when logged in.
- When `user.value` is null, return either `[]` (logo only) or `[{ label: 'Home', to: '/', icon: 'i-lucide-home' }]` per product preference (landing as “Home” for logged-out is acceptable).

## QA checklist (Sprint 1)

- [ ] Logged out: no Dashboard, Invoices, Clients, Settings in nav.
- [ ] Logged out: Login and Register visible.
- [ ] Logged in: no “Home” in nav.
- [ ] Logged in: Dashboard, Clients, Invoices, Settings visible.
- [ ] Logo always goes to `/`; from dashboard, clicking logo goes to landing (logged in user can still reach landing; optional product decision to restrict later).
- [ ] Mobile nav matches (no Home when logged in).

## Document changes

- **Done:** Nav when logged in = Dashboard, Clients, Invoices, Settings. Home removed for logged-in state. Logged-out nav: single “Home” to `/` retained. Implemented in `app.vue` (navItems computed).
