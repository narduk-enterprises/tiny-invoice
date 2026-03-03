# Route Map Normalization

Canonical maps so routes match the mental model (see [mental-model.md](./mental-model.md)).

---

## Logged out route map

| Route | Purpose |
|-------|---------|
| `/` | Marketing/landing: value prop, Get started, Log in, Try demo. |
| `/login` | Sign in. Optional `?demo=1` for demo credentials; optional `?redirect=/path` for post-login redirect. |
| `/register` | Create account. |

**Not used in current app:** `/pricing`, `/support`. Add only if product requires them.

**Rules:** Logged-out users see only these plus any public marketing routes. No “Home” in nav unless it clearly means “landing” (and when logged in we do not show it).

---

## Logged in route map

| Route | Purpose |
|-------|---------|
| `/dashboard` | Single entry point: overview (revenue, outstanding, recent invoices). |
| `/invoices` | Invoice list; filter by status. |
| `/invoices/new` | Create invoice. |
| `/clients` | Client list and CRUD. |
| `/settings` | Business name and address (invoice branding). |

**Detail routes (no nav):**

| Route | Purpose |
|-------|---------|
| `/invoices/[id]` | View invoice; actions: Mark sent / paid / overdue, Edit. |
| `/invoices/[id]/edit` | Edit invoice. |

**Payments:** There is no `/payments` route. Payment is tracked by invoice status (paid) and summarized on Dashboard (Total revenue, Outstanding). Do not add a separate Payments nav unless the product gains a distinct payment/transaction model.

**Rules:**

- Logged in **must not** use “Home” in the main nav linking to `/`. Dashboard is home base.
- Default redirect after login or register: `/dashboard`.
- Deep link to protected route while logged out: redirect to `/login?redirect=/intended-path`, then after login send to intended path or `/dashboard` if invalid.
