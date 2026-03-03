# Performance & Rendering Audit

**App:** TinyInvoice (Nuxt 4 + Nuxt UI v4)  
**Budgets (p75):** LCP &lt; 2.5s, INP &lt; 200ms, CLS &lt; 0.10.

---

## 1. Rendering mode per route

| Route | SSR | Data source | Notes |
|-------|-----|-------------|--------|
| `/` | Yes | None (static) | UPageHero + cards; good LCP candidate. |
| `/login`, `/register` | Yes | None | Form is static; demo fill and nav auth state are client-only. |
| `/dashboard` | Yes | `useFetch` dashboard + `useFetch` invoices (key from `user`) | Auth middleware runs first; `user` set on server, so both fetches run on server. Parallel. |
| `/invoices` | Yes | `useFetch` invoices | Key `invoices-{userId}`; auth middleware sets user; single fetch. |
| `/invoices/new` | Yes | `useFetch` clients (via `useClients`) | Clients load on server (auth already set). Form state (dates, line items) is client-only; line items use `crypto.randomUUID()` at init → **hydration risk**. |
| `/invoices/[id]` | Yes | `useInvoiceDetail(id)` → `useAsyncData` + `$fetch` | Single fetch; SSR with cookie. |
| `/invoices/[id]/edit` | Yes | `useInvoiceDetail` + `useClients` | Two data deps; both useFetch/useAsyncData with headers; parallel. Form populated by `watch(invoiceData)` → no SSR for form values (OK). |
| `/clients` | Yes | `useFetch` clients | Single fetch on server. |
| `/settings` | Yes | `useAuth().user` (from state) + no API for form default | Form from `watch(user)`; user can be from client `fetchUser()` → may be empty on first server render. |

**Summary:** All key routes are SSR-capable. Data fetching uses `useFetch`/`useAsyncData` with `useRequestHeaders(['cookie'])` and auth middleware, so authenticated pages get server-rendered content when the session cookie is present.

---

## 2. Hydration hotspots

| Location | Issue | Risk | Recommendation |
|----------|--------|------|-----------------|
| **app.vue** | `navItems` from `user`; `user` set in `onMounted` via `fetchUser()` | Server: `user = null` → “Home, Login, Register”. Client: after mount, `user` may become set → “Home, Dashboard, Clients, …”. Nav structure can differ. | Run `fetchUser()` before render when possible (e.g. in middleware or layout) so server and client agree, or wrap nav in `<ClientOnly>` and show a neutral placeholder on server. |
| **invoices/new.vue** | `lineItems` initial value uses `crypto.randomUUID()` | SSR and client each run once → different UUIDs → hydration mismatch. | Initialize `lineItems` as `[]` and push first row in `onMounted`, or use deterministic id (e.g. `row-0`) for the initial row. |
| **invoices/new.vue** | Issue/due dates set in `onMounted` | Server: empty strings. Client: filled after mount. Inputs don’t change structure, but content does. | Acceptable for inputs (no layout shift). For consistency, consider defaulting in a composable with `import.meta.client` check or keep onMounted and ensure no other server/client divergence on this page. |
| **login.vue** | `fillDemoCredentials()` in `onMounted` when `?demo=1` | Server: empty form. Client: filled. No structural mismatch. | OK; optional: use `<ClientOnly>` for the pre-filled form block if we ever want to avoid any flash. |
| **Color mode / theme** | Layer uses `useColorMode()`; no ClientOnly around theme-dependent UI in app.vue | Nuxt UI often wraps color-mode–sensitive UI; header/footer may flash if theme differs. | Check for FOUC; wrap theme-dependent blocks in ClientOnly only if needed to meet CLS. |

---

## 3. Data fetching and waterfalls

| Page | Fetches | Order | Notes |
|------|---------|--------|--------|
| Dashboard | `/api/dashboard`, `/api/invoices` | Parallel (two useFetch) | Good. Redundant `refreshList()` in `onMounted` causes extra client request. |
| Invoices list | `/api/invoices` | Single | Good. |
| Invoice detail | `/api/invoices/[id]` | Single | Good. |
| Invoice new | `/api/clients` | Single | Good; form then rendered. |
| Invoice edit | `/api/invoices/[id]`, `/api/clients` | Parallel (detail + useClients) | Good. |
| Clients | `/api/clients` | Single | Good. |

**Action:** Remove `onMounted` `refreshList()` on dashboard to avoid duplicate invoices fetch.

---

## 4. LCP / INP / CLS notes

- **LCP:** Key routes are SSR; largest content is usually hero (home), dashboard cards, or first table/card. Ensure no blocking scripts; images if any use Nuxt Image. Dashboard has two sequential visuals (stats then table) — skeleton for both can help perceived LCP.
- **INP:** Replace native `confirm()`/`alert()` with modal/UI so main thread isn’t blocked by browser dialogs. Keep table and form interactions lightweight (no heavy sync work in handlers).
- **CLS:** Avoid layout shift from: (1) nav changing after `fetchUser` (defer or unify auth state); (2) loading → content swap without reserved space (skeletons); (3) empty date inputs → filled (already minimal). Reserve space for tables and cards when loading.

---

## 5. Summary table

| Route | Rendering | Hydration risk | Suggested change |
|-------|-----------|----------------|------------------|
| `/` | SSR | Low | — |
| `/login`, `/register` | SSR | Low (demo fill client-only) | Optional skeleton for LCP. |
| `/dashboard` | SSR | Low | Remove `refreshList()` in onMounted; add skeleton. |
| `/invoices` | SSR | Low | Skeleton; replace confirm/alert. |
| `/invoices/new` | SSR | **Medium** (lineItems UUID) | Init line items in onMounted or deterministic id. |
| `/invoices/[id]` | SSR | Low | — |
| `/invoices/[id]/edit` | SSR | Low | — |
| `/clients` | SSR | Low | Replace confirm/alert; optional skeleton. |
| `/settings` | SSR | Low (user from state) | — |
| **App shell** | SSR | **Medium** (nav from user) | Unify auth for nav or ClientOnly nav. |
