# Phase 5 — Trust & Credibility Audit

**Goal:** Eliminate trust leaks. Check formatting consistency, layout stability, error messaging, jargon, and placeholder leakage.

---

## Formatting consistency

### Currency
- **Implementation:** `formatCents()` in `apps/web/app/utils/format.ts` — `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`. Used in dashboard, invoices list, invoice detail, new/edit invoice.
- **Consistency:** Single formatter; all currency displays go through it. **No raw numbers.**
- **Verdict:** Consistent.

### Dates
- **Dashboard:** Not showing dates in stat cards (only counts and amounts).
- **Invoices list:** Columns are Number, Client, Status, Total — no date in table. (Data has issueDate/dueDate but not displayed in list.)
- **Invoice detail ([id]):** `toLocaleDateString()` used for Issue and Due — **no locale/options passed**, so locale follows browser. Format may vary (e.g. M/D/YYYY vs DD/MM/YYYY).
- **New/Edit invoice:** `<UInput type="date">` — browser-native date picker; value is ISO YYYY-MM-DD.
- **Inconsistency:** Detail page uses `toLocaleDateString()`; forms use ISO. Display format on detail is not explicitly controlled (layer has `formatDate` in useFormat; invoice detail doesn't use it).
- **Verdict:** **Flag.** Use `formatDate()` from useFormat on invoice detail for Issue/Due so format is consistent and locale-aware in one place.

### Numbers
- Line item quantities and unit prices: numeric inputs; totals use `formatCents`. **No unformatted currency.** Unit price placeholder "(¢)" implies cents — **technical;** user may expect dollars. API/store in cents is an implementation detail.
- **Verdict:** **Flag.** Don’t expose "(¢)" in UI; use "Unit price" and document or convert in UI if needed.

---

## Layout stability

- **Dashboard:** Loading shows skeleton cards and table; then replaced by real content. **No layout jump** — same grid/card structure.
- **Clients / Invoices list:** Loading shows spinner or "Loading…"; then table or empty state. **Possible shift** from centered spinner to full-width table.
- **New invoice:** "Loading clients…" then form. **Possible shift** from centered text to form.
- **Invoice detail:** Spinner then content or "not found." **Stable** — content area doesn’t resize wildly.
- **Settings:** No loading state for initial user; form populated by `watch(user)`. If user loads slowly, form could be empty then fill — **mild flash.**
- **Verdict:** No major layout jumps. Slight flash possible on Settings if user loads late.

---

## Error messages

- **Source:** `err.data?.message ?? err.message ?? 'Login failed'` (and similar) across login, register, clients, invoices, settings.
- **Consistency:** Same pattern; fallback strings vary ("Login failed", "Registration failed", "Failed to save", "Delete failed", "Failed to create invoice", "Failed to update").
- **User-facing:** API messages may be technical. Fallbacks are human-readable.
- **Verdict:** Consistent pattern; ensure API returns user-safe messages.

---

## Ambiguous or technical language

- **Footer:** "Nuxt UI 4 · Cloudflare Workers" — **technical.** Users don’t need stack details. **Flag.**
- **New/Edit invoice:** Placeholder "Unit price (¢)" — **technical.** **Flag.**
- **Client delete modal:** "This will fail if they have invoices" — clear and honest. Good.
- **Invoice delete modal:** "This cannot be undone." — Clear. Good.
- **Invoice detail:** Labels "From", "To", "Issue", "Due", "Subtotal", "Tax", "Total" — clear.

---

## Flash of incorrect content

- **Auth:** If `user` is null then fetches, nav could show "Log in / Register" then switch to "Dashboard / Clients / …" after fetch. **Possible flash** of logged-out nav.
- **Dashboard / Lists:** Data from `useFetch`/`useAsyncData`; default empty then populated. **Possible flash** of empty state then data (or skeleton then data).
- **Settings:** `formState` synced from `user` in `watch`; if `user` is delayed, form may be empty then fill. **Flash risk.**
- **Verdict:** Minor; acceptable if loading states or defaults are clear. Ensure auth nav doesn’t flash logged-in then back to logged-out (e.g. don’t set user optimistically).

---

## Placeholder data leaking

- **Login demo:** Prefilled "demo@tinyinvoice.com" / "demo1234" when `?demo=1`. Intentional; not leakage.
- **New invoice:** Default issue date = today, due date = +30 days in `onMounted`. Intentional.
- **Empty states:** "No clients yet", "No invoices yet" with CTAs — correct.
- **Verdict:** No placeholder data leaking into real UI.

---

## "Would a serious business user trust this?"

- **Currency and totals:** Consistently formatted. **Yes.**
- **Dates:** Slight inconsistency (detail vs rest); one formatter would help. **Mostly.**
- **Errors:** Shown inline; no silent failures except status buttons. **Mostly** (fix status errors).
- **Destructive actions:** Confirmed with clear copy. **Yes.**
- **Footer tech stack:** Feels dev-oriented. **No** for serious business; remove or generalize.
- **Unit price (¢):** Feels internal. **No**; use neutral "Unit price" or dollar-based label.

---

## Summary

| Check | Status | Action |
|-------|--------|--------|
| Inconsistent formatting (dates) | Flag | Use `formatDate()` on invoice detail for Issue/Due |
| Unformatted numbers | OK | Currency uses formatCents |
| Layout jumps | OK | Skeletons/loading used |
| Inconsistent error messages | OK | Pattern consistent |
| Technical jargon | Flag | Footer; unit price "(¢)" |
| Flash of incorrect content | Minor | Auth/settings possible flash |
| Placeholder leakage | OK | None |
| "Temporary" feel | Flag | Footer and (¢) reduce trust |

**Recommendations:**
1. Use `formatDate()` (from useFormat) for invoice detail Issue and Due dates.
2. Replace "Unit price (¢)" with "Unit price" (and clarify in help text or docs if input is in dollars vs cents).
3. Change footer to product name + copyright (and optional link); remove "Nuxt UI 4 · Cloudflare Workers".
4. Ensure API error messages are safe for end users.
