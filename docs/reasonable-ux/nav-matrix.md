# Nav & Route Reasonableness Audit

Inventory of every nav item, route, and entry point judged against human expectation.

---

## Route inventory (all pages)

| Route | Page purpose | Auth required? |
|-------|-------------------------------|----------------|
| `/` | Landing: value prop, Get started / Log in / Try demo | N |
| `/login` | Log in form | N |
| `/register` | Create account form | N |
| `/dashboard` | Overview: revenue, outstanding, recent invoices | Y |
| `/clients` | List and manage clients | Y |
| `/invoices` | List invoices, filter by status | Y |
| `/invoices/new` | Create new invoice | Y |
| `/invoices/[id]` | View invoice detail, mark sent/paid/overdue | Y |
| `/invoices/[id]/edit` | Edit invoice | Y |
| `/settings` | Business name and address | Y |

---

## Nav matrix (by surface)

Single top nav + mobile slide-down use the same `navItems`; footer has no nav links.

| Surface | Label | Route | Auth required? | Goal | Redundancy | Decision | Rationale |
|---------|--------|--------|----------------|------|------------|----------|------------|
| Logged out header | (logo) | `/` | N | Brand / landing | N | KEEP | Expected. |
| Logged out header | Login | `/login` | N | Sign in | N | KEEP | Standard. |
| Logged out header | Register | `/register` | N | Create account | N | KEEP | Standard. |
| Logged in header | Home | `/` | N | “Go home” | Y (vs Dashboard) | REMOVE | When logged in, “home” should be Dashboard; landing is for logged-out. |
| Logged in header | Dashboard | `/dashboard` | Y | Overview / home base | N | KEEP | Single entry point when logged in. |
| Logged in header | Clients | `/clients` | Y | Manage clients | N | KEEP | Task surface. |
| Logged in header | Invoices | `/invoices` | Y | List/manage invoices | N | KEEP | Task surface. |
| Logged in header | Settings | `/settings` | Y | Business details | N | KEEP | Task surface. |
| Logged in header | (user icon) | `/settings` | Y | Quick settings | Y (duplicate of Settings) | KEEP | Common pattern; acceptable as shortcut. |
| Logged in header | Logout | (action) | — | Sign out | N | KEEP | Required. |
| Mobile nav (logged out) | Home | `/` | N | Same as header | N | KEEP | Same as desktop. |
| Mobile nav (logged in) | Home, Dashboard, Clients, Invoices, Settings | (same as above) | — | Same as header | Same as above | REMOVE Home when logged in | Same rule as desktop. |
| Footer | (no nav) | — | — | — | — | — | Footer is branding only; no change. |

---

## Entry points (non-nav)

| Entry | Route | Auth? | Goal | Decision | Rationale |
|-------|--------|-------|------|----------|-----------|
| Landing CTA “Get started” | `/register` | N | Start signup | KEEP | Correct. |
| Landing CTA “Log in” | `/login` | N | Sign in | KEEP | Correct. |
| Landing CTA “Try demo” | `/login?demo=1` | N | Demo login | KEEP | Correct. |
| Login success redirect | `/dashboard` | Y | Post-login home | KEEP | Correct. |
| Register success redirect | `/dashboard` | Y | Post-signup home | KEEP | Correct. |
| Logout | `/` | N | Return to landing | KEEP | Correct. |
| Auth middleware (unauthenticated) | `/login` | N | Force login | KEEP | Add redirect param so user returns to intended page after login. |

---

## Summary

- **Remove** “Home” from nav when user is logged in so Dashboard is the single home base.
- **Keep** all other nav items and routes; no duplicate task surfaces.
- **Enhance** auth middleware to redirect to intended page after login (e.g. `?redirect=/invoices/123`).
