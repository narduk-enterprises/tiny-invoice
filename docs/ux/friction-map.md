# UX Friction Map

**App:** TinyInvoice (Nuxt 4 + Nuxt UI v4)  
**Scope:** Top 3 user journeys — Auth → Dashboard, Invoices (list/view/create/edit), Clients (list/add/edit).

Format: **Where** | **Symptom** | **Cause** | **Fix-type**

---

## Journey 1: Auth → Dashboard

| Where | Symptom | Cause | Fix-type |
|-------|---------|--------|----------|
| `/login` | Demo credentials only fill after load | `fillDemoCredentials()` runs in `onMounted` when `?demo=1` | **Consistency** — Prefer route-driven default or same UX without flash |
| `/login`, `/register` | No loading skeleton while form is interactive | Only button shows `loading`; content area static | **Perf/UX** — Skeleton or minimal shell for LCP |
| App shell (all pages) | Nav can flash: “Login/Register” → “Dashboard/Clients/…” | `user` set in `app.vue` via `fetchUser()` in `onMounted`; SSR has `user = null` | **Hydration** — Auth state for nav should be SSR or deferred render (e.g. ClientOnly nav block) |
| `/dashboard` | Two loading states (stats spinner + “Loading…” for table) | `useDashboard()` and `useInvoices()` independent; table shows `listPending` | **Consistency** — Single loading state or skeleton for whole page |
| `/dashboard` | Extra request for invoice list on load | `onMounted` calls `refreshList()` in addition to `useFetch` | **Perf** — Remove redundant `refreshList()` in `onMounted` |

---

## Journey 2: Invoices (list / view / create / edit)

| Where | Symptom | Cause | Fix-type |
|-------|---------|--------|----------|
| `/invoices` | Delete uses native `confirm()` / `alert()` | No modal component; browser dialogs block and are not a11y-friendly | **A11y / Consistency** — Replace with UModal (confirm + error toast or inline alert) |
| `/invoices` | Filter state lost on refresh | Status filter is `ref()` only; not synced to query | **Usability** — Sync filter to `route.query` (e.g. `?status=sent`) |
| `/invoices`, `/invoices/[id]` | “Loading…” text only; no skeleton | `listPending` / `pending` show spinner or text | **Perf/UX** — Table/card skeleton to reduce CLS and perceived wait |
| `/invoices/new` | First paint shows empty date inputs, then they fill | Issue/due dates set in `onMounted` (client-only) | **Hydration** — Default dates in a way that’s SSR-safe or use placeholder and fill in onMounted without layout shift |
| `/invoices/new` | Line items row IDs differ server vs client | `lineItems` ref uses `crypto.randomUUID()` at module init; SSR vs client different IDs | **Hydration** — Initialize first line in `onMounted` or use deterministic id (e.g. `row-0`) to avoid mismatch |
| `/invoices/[id]` | Status actions (Mark sent/paid/overdue) no optimistic feedback | `updateStatus` then `refresh()`; UI waits for refetch | **Usability** — Optimistic status update or loading state on button |
| `/invoices/[id]` | “Not found” is full UPage swap | `v-else` branch renders different UPage; no 404 status | **Consistency** — Use proper 404 (e.g. `setResponseStatus(404)`) and/or shared empty state |

---

## Journey 3: Clients (list / add / edit)

| Where | Symptom | Cause | Fix-type |
|-------|---------|--------|----------|
| `/clients` | Delete uses native `confirm()` / `alert()` | Same as invoices | **A11y / Consistency** — UModal confirm + structured error display |
| `/clients` | Slideover form has no Zod validation | `UForm :state="formState"` without `:schema` | **Consistency** — Add schema (e.g. name/email required) like login/register |
| `/clients` | Single loading spinner for whole page | Card hidden until `pending` false; then table or empty | **Perf/UX** — Optional table skeleton for consistency with invoices |

---

## Cross-cutting

| Where | Symptom | Cause | Fix-type |
|-------|---------|--------|----------|
| Forms (login, register, settings, client slideover) | Inconsistent layout (space-y-4 vs form-section) | Mix of ad-hoc `space-y-4` and no shared form layout class | **Design system** — Standardize on `.form-section` / `.form-actions` from layer |
| Tables (invoices, clients, dashboard) | Column config duplicated; status badge logic repeated | Each page defines columns and `statusBadgeColor`-style helpers | **Consistency** — Shared table column configs and status badge composable/component |
| Error feedback | Some `UAlert`, some `alert()` | Delete errors use `alert()` | **Consistency** — Always use UAlert or toast; no `alert()` |
| Empty states | CTA present but style varies | “No invoices yet” vs “No clients yet” — similar but not from a shared component | **Design system** — Reusable empty state component (icon + message + primary CTA) |

---

## Fix-type legend

- **Perf** — LCP/INP/CLS or network (e.g. remove duplicate request).
- **Hydration** — SSR/client mismatch or client-only data that affects first paint (nav, dates, line item ids).
- **A11y** — Keyboard, focus, labels, contrast; replace native dialogs.
- **Consistency** — Same patterns (modals, validation, loading, empty state) across journeys.
- **Usability** — Fewer steps, clearer feedback (optimistic UI, query sync).
- **Design system** — Tokens, variants, shared components (forms, tables, empty state).
