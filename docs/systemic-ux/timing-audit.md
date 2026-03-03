# Phase 6 — Timing & Latency Perception Audit

**Goal:** Fix perceived slowness and timing confusion. Check delays without spinner, spinner duration, blocking UI, layout stability during load, and flicker.

---

## Delays without spinner

| Screen | Action | Delay? | Spinner / loading? |
|--------|--------|--------|--------------------|
| Login | Submit | Network | `:loading="pending"` on button |
| Register | Submit | Network | `:loading="pending"` on button |
| Clients | Initial load | useFetch | Full-page "Loading…" + spinner icon |
| Clients | Save (create/update) | Network | `:loading="saving"` on Save |
| Clients | Delete | Network | `:loading="deletePending"` on Delete |
| Invoices list | Initial load | useFetch | "Loading…" text |
| Invoices list | Delete | Network | `:loading="deletePending"` on Delete |
| New invoice | Initial (clients) | useFetch | "Loading clients…" |
| New invoice | Submit | Network | `:loading="saving"` on Create |
| Invoice detail | Initial load | useAsyncData | Spinner (loader icon) |
| Invoice detail | **Mark sent / Mark paid / Mark overdue** | **Network** | **None.** Buttons have no loading state. |
| Invoice edit | Initial load | useInvoiceDetail | "Loading…" text |
| Invoice edit | Save | Network | `:loading="saving"` on Save |
| Settings | Save | Network | `:loading="saving"` on Save |
| Dashboard | Initial load | useFetch (stats + list) | Skeleton cards + skeleton table |

**Flag:** Invoice detail status buttons (Mark sent, Mark paid, Mark overdue) trigger async `updateStatus` + `refresh` with **no loading state**. User doesn't know request is in progress; may double-click or think it failed.

---

## Spinner too short (flashing)

- No spinners that resolve in under ~200ms in a way that would flash. Fast responses show button loading briefly then success. **OK.**

---

## Spinner too long (no progress)

- All loading is either (1) button-level (submit/delete) or (2) full-page/section (list, detail, dashboard). No indeterminate spinner that runs for minutes without feedback.
- Dashboard/Client/Invoice list loading: no timeout or retry surfaced in UI; if API hangs, user sees "Loading…" indefinitely. **Consider:** timeout + error message or retry.
- **Verdict:** No progress indicator for long ops (e.g. no "Loading… 30s"); acceptable for current scope. Flag only if real slow endpoints exist.

---

## UI blocking unnecessarily

- Login/Register: Form stays visible; only submit button shows loading. User can't submit again (pending) but can change fields. **Appropriate.**
- Modals (delete client, delete invoice): Cancel and Delete disabled when `deletePending`; modal blocks other actions. **Appropriate** for destructive confirm.
- Slideover (client form): Save shows loading; Cancel is disabled when saving. **Appropriate.**
- **Verdict:** No unnecessary blocking.

---

## Loading state replacing stable layout

- **Dashboard:** Skeleton replaces content area; same grid/card structure. **Stable.**
- **Clients:** Spinner replaces entire content; then table appears. **Layout change** (centered spinner → full-width table). Could use table skeleton to reduce shift.
- **Invoices list:** "Loading…" in card; then table. **Layout change** but within same card.
- **Invoice detail:** Spinner in content area; then card. **Stable.**
- **New invoice:** "Loading clients…" then form. **Layout change** (text block → form).
- **Verdict:** Some screens transition from spinner/text to content; not severe. Optional improvement: skeleton for list/detail where possible.

---

## Flicker on data refresh

- **Invoice detail:** After "Mark sent" / "Mark paid" / "Mark overdue", `refresh()` is called. Data refetches; badge and buttons update. If refetch is fast, minimal flicker. If slow, **no loading state** so UI is stale then jumps. **Flag:** Add loading state so user sees "Updating…" and then updated state.
- **Clients:** After save, slideover closes and list is from same useFetch; refetch updates list. No modal overlay on list; list may show old data briefly then update. **Mild flicker** possible.
- **Invoices list:** After delete, modal closes and list refetches; list may show deleted row briefly. **Mild flicker** possible.
- **Verdict:** Status change on invoice detail is the main gap (no loading). List refetches after mutation are acceptable; optional optimistic remove for delete.

---

## "Does user know system is working?"

- **Most actions:** Yes — button loading or page/section loading text.
- **Invoice detail status buttons:** **No** — no spinner or disabled state. **Fix required.**

---

## "Is layout stable during load?"

- **Dashboard:** Yes (skeleton).
- **Others:** Spinner or text then content; some layout shift. **Acceptable.**

---

## "Is the app ever 'frozen' feeling?"

- Only if (1) status button is clicked and nothing happens for 1–2s with no feedback, or (2) API hangs and "Loading…" never resolves. **Status buttons are the main fix;** consider timeout/retry for initial loads if needed.

---

## Summary

| Issue | Where | Recommendation |
|-------|--------|----------------|
| Delay without spinner | Invoice detail: Mark sent/paid/overdue | Add loading state (e.g. disable buttons + "Updating…" or button loading) |
| Spinner too short | — | None |
| Spinner too long | All full-page loads | Optional: timeout + error/retry if endpoints can be slow |
| Unnecessary blocking | — | None |
| Loading replaces stable layout | Clients, Invoices list, New invoice | Optional: skeleton for lists |
| Flicker on refresh | Invoice detail status; list after delete | Loading state for status; optional optimistic delete |

**Must-fix:** Invoice detail status buttons must show loading and handle errors so the app never feels frozen or silent after a click.
