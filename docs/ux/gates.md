# Phase D: UX gates

**Purpose:** Before release, run these checks. Fail gate if regression on perf budgets or critical a11y.

---

## 1. A11y gate

| Check | How to verify | Status / notes |
|-------|----------------|----------------|
| **Keyboard** | Tab through all interactive elements; no trap except inside modals/slideovers. | Modals/slideovers: use UModal/USlideover (focus trap). |
| **Focus visible** | Focus ring visible on buttons, links, inputs. | Rely on Nuxt UI; do not remove outline without replacement. |
| **Labels** | Every form field has visible label and `name`; required indicated. | UFormField with label/name/required on login, register, client, settings, invoice forms. |
| **Icon-only buttons** | Every icon-only button has `aria-label`. | Added: Delete invoice/client, Edit invoice/client, View invoice, Add client, Settings, Toggle color mode, Toggle menu. |
| **Contrast** | Text and controls meet WCAG AA (e.g. 4.5:1 for normal text). | Use token colors (primary, neutral, muted); no arbitrary low-contrast hex. |
| **Dialogs** | No `confirm()` / `alert()` for critical flows. | Replaced with UModal for invoice and client delete; errors in UAlert. |
| **Skip link** | “Skip to content” present and focusable. | In app.vue: `ULink to="#main-content"` with sr-only + focus:not-sr-only. |

**Pass:** All rows verified. **Fail:** Any critical violation (e.g. missing labels on forms, use of confirm/alert for delete).

---

## 2. Perf gate (budgets)

**Budgets (p75):** LCP &lt; 2.5s, INP &lt; 200ms, CLS &lt; 0.10 on key routes.

| Metric | Target | How to check |
|--------|--------|----------------|
| **LCP** | &lt; 2.5s (p75) | Lighthouse or CrUX on `/`, `/dashboard`, `/invoices`, `/login`. |
| **INP** | &lt; 200ms (p75) | Replace blocking dialogs (done); avoid heavy sync work in click handlers. |
| **CLS** | &lt; 0.10 (p75) | Skeleton on dashboard reserves space; no layout shift from loading→content. Nav/auth state may still cause minor shift (documented in perf-audit). |

**Pass:** No regression; key routes within budget. **Fail:** Any key route exceeds budget after changes.

---

## 3. Regression checklist (post-sprints)

- [ ] Dashboard: one request for stats, one for invoices (no duplicate from refreshList).
- [ ] Dashboard: skeleton then content; no double loading state.
- [ ] Invoices list: filter in URL (`?status=...`); delete opens modal; no confirm/alert.
- [ ] Invoices new: first line item id `row-0`; no hydration error in console.
- [ ] Clients: delete opens modal; form validates name/email with Zod.
- [ ] Status badges: same colors as before (from useInvoiceStatus).
- [ ] Lint and typecheck pass: `pnpm run quality` (or equivalent).

---

## 4. Running the gates

1. **A11y:** Manual tab-through + quick contrast check; optional axe DevTools on key pages.
2. **Perf:** Run Lighthouse (or PageSpeed Insights) on key routes before/after; compare LCP/INP/CLS.
3. **Regression:** Smoke test the checklist above; run `pnpm run quality`.

If any gate fails, fix before release or document and accept as known issue with a follow-up ticket.
