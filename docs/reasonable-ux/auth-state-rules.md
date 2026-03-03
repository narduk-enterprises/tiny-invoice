# Auth-State IA Rules

Codified rules for what UI appears in each auth state.

---

## Logged out

- **Top nav contains:** Logo (→ `/`), **Login**, **Register**. No product nav items (Dashboard, Invoices, Clients, Settings).
- **Landing (`/`)** focuses on “why” and “start”: value prop, Get started, Log in, Try demo.
- **Primary CTA:** Get started (→ Register). Secondary: Log in, Try demo.
- **Footer:** Branding only; no nav links required.
- **Deep link to protected route:** Redirect to `/login`. Pass intended path as query (e.g. `?redirect=/invoices/123`) so after login the user is sent to that path or `/dashboard` if invalid/missing.
- **No “Home” in nav** for logged-out is acceptable (logo serves as home); if a “Home” link exists it must go to `/` (landing) and must not appear when logged in.

---

## Logged in

- **No marketing links in primary nav.** No “Pricing”, “Support”, “Home” (to landing) unless explicitly added as secondary and clearly separated.
- **Single “home base”:** **Dashboard** (`/dashboard`). No “Home” link to `/` in main nav.
- **Nav shows only task surfaces:** Dashboard, Clients, Invoices, Settings.
- **Account:** User icon or label can link to Settings; **Logout** button in header. No separate “Profile” unless the product adds a distinct profile section.
- **Default redirect after login or register:** `/dashboard`. If `?redirect=` is present and valid (same-origin, path exists), redirect there after auth.
- **Logout:** POST logout then redirect to `/` (landing). No product nav after logout.

---

## Implementation checklist

| Rule | Current | Target |
|------|---------|--------|
| Logged out: no Dashboard/Invoices/Clients in nav | ✅ | Keep |
| Logged out: Login + Register in nav | ✅ | Keep |
| Logged in: no “Home” to `/` in nav | ❌ (Home appears) | Remove Home when logged in |
| Logged in: Dashboard as single entry | ✅ (but Home duplicates) | Remove Home so only Dashboard |
| Post-login/register → `/dashboard` | ✅ | Keep |
| Deep link → login then intended page | ❌ (no redirect param) | Add `redirect` query; use after login |
| Logout → `/` | ✅ | Keep |
