# Sprint 1: Dashboard (Auth → Dashboard journey)

**Goal:** Improve perceived speed, consistency, and CLS on the dashboard.

---

## Fixes implemented (3)

### 1. Remove redundant `refreshList()` in `onMounted`
- **Cause:** Dashboard called both `useInvoices()` (which runs `useFetch`) and `refreshList()` in `onMounted`, causing a duplicate request for the invoice list on every load.
- **Change:** Removed `onMounted` and the `refreshList` call. Data comes only from `useFetch` (SSR + single client fetch when needed).
- **Impact:** Fewer network requests; faster dashboard load.

### 2. Unified loading state + skeleton
- **Cause:** Two separate loading states (`pending` for stats, `listPending` for invoices) and a spinner only for stats, then “Loading…” for the table, causing a two-step reveal and potential layout shift.
- **Change:** Introduced `loading = pending || listPending`. When `loading` is true, the whole dashboard shows a single skeleton: 4 stat card placeholders (same grid) + a “Recent invoices” card with 5 row placeholders (animate-pulse). When `loading` is false, real stats and table render.
- **Impact:** One coherent loading experience; reserved space reduces CLS.

### 3. Reserved space for stats and table (CLS)
- **Cause:** Switching from spinner/text to real content could shift layout.
- **Change:** Skeleton uses the same grid (4 stat cards, one table card) and similar row count (5 lines), so when content replaces skeleton, layout is stable.
- **Impact:** CLS kept low; aligns with &lt; 0.10 budget.

---

## Empty / loading / error states

- **Loading:** Skeleton as above (stats + recent invoices table placeholders).
- **Empty (no invoices):** Existing copy: “No invoices yet. Create one” with link; unchanged.
- **Error:** No change in this sprint (API errors still surface via existing patterns; can be improved in a later sprint).

---

## Tests and lint

- Lint: `apps/web/app/pages/dashboard.vue` — no new errors.
- Manual: Load `/dashboard`; confirm one request for dashboard and one for invoices; confirm skeleton then content with no duplicate invoice fetch.

---

## Hydration

- No change to hydration in this sprint. Auth/nav and invoice list key behavior unchanged.
