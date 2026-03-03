# Phase 8 — Micro-Friction Detection

**Goal:** Eliminate small annoyances that compound. Audit required scrolling, extra confirmations, focus, form/filter resets, click count for common actions, and unnecessary modals.

---

## Required scrolling for simple tasks

| Task | Screen | Scroll needed? |
|------|--------|----------------|
| Log in | Login | No; form fits in viewport on desktop. |
| Register | Register | Possible on small screens (5 fields). **Minor.** |
| Add client | Clients | No; slideover. |
| New invoice | New invoice | **Yes.** Long form: client, dates, notes, tax, N line items, totals, buttons. User must scroll to "Create invoice." |
| Edit invoice | Edit invoice | Same as new; scroll to "Save changes." |
| Mark paid | Invoice detail | Buttons at top; no scroll. |
| Save settings | Settings | No; short form. |

**Verdict:** New/Edit invoice require scrolling to reach primary submit. **Recommendation:** Keep primary button visible (e.g. sticky footer or floating action) or ensure one line item is above the fold so user sees "Add line" and submit area sooner. Optional: collapse "Notes" and "Tax" by default.

---

## Extra confirmation steps

| Action | Steps | Necessary? |
|--------|--------|------------|
| Delete client | Click trash → modal → Confirm | **Yes** — destructive. |
| Delete invoice | Click trash → modal → Confirm | **Yes** — destructive. |
| Log in | Fill form → Submit | No extra. |
| Create invoice | Fill form → Submit → (navigate to detail) | No confirmation modal; **good.** |
| Mark sent / paid / overdue | One click | No confirmation. **Good** (reversible except semantic change). |

**Verdict:** No unnecessary confirmation steps. Optional: confirm "Mark overdue" if you want to prevent misclicks (adds friction; use only if data shows accidents).

---

## Auto-focus

| Screen | Expected focus | Implemented? |
|--------|----------------|--------------|
| Login | Email field | Not audited in code (no explicit autofocus). **Recommendation:** `autofocus` or `focus()` on email when no query.demo. |
| Register | Email or name | Not audited. |
| Client slideover | Name | Not audited. |
| New invoice | Client select or first field | Not audited. |

**Verdict:** No explicit auto-focus found. **Recommendation:** Add autofocus to first field on login, register, and slideover open for keyboard users.

---

## Form resets unexpectedly

| Form | When does it reset? | Expected? |
|------|----------------------|-----------|
| Login | On failed submit: fields kept; error shown. On success: redirect. **Good.** | Yes. |
| Register | Same. | Yes. |
| Client slideover | Open create: empty. Open edit: prefilled. After save: close. **Good.** | Yes. |
| New invoice | After submit success: navigate away. On validation error (client/line): state kept. **Good.** | Yes. |
| Invoice edit | Loaded from useInvoiceDetail; watch fills form. If invoice id changes (e.g. nav), form updates. **Good.** | Yes. |
| Settings | Populated from user; no unexpected reset. | Yes. |

**Verdict:** No unexpected form resets.

---

## Filters reset unexpectedly

| Screen | Filter | Persistence |
|--------|--------|-------------|
| Invoices list | Status (USelectMenu) | Bound to `route.query.status`. **Persists** in URL. Refresh or back preserves. **Good.** |

**Verdict:** Filter is URL-backed; no unexpected reset.

---

## Excessive clicking for common action

| Common action | Clicks | Notes |
|---------------|--------|--------|
| Log in | 1 (submit after fill) | OK. |
| Go to dashboard | 1 (nav or redirect) | OK. |
| Add client | 1 (Add client) → fill → 1 (Save) | OK. |
| New invoice | 1 (New invoice) → fill → 1 (Create invoice) | OK. |
| View invoice | 1 (View) from list | OK. **Alternative:** row click = view (0 extra). |
| Edit invoice | From list: 1 (Edit). From detail: 1 (Edit). | OK. |
| Mark paid | 1 click on detail | OK. |
| Delete invoice | 2 (trash + Confirm) | Appropriate. |

**Verdict:** No excessive clicking. Optional: invoice row click → detail to save one click for "View."

---

## Unnecessary modal interruptions

| Modal | When | Necessary? |
|-------|------|-------------|
| Delete client | After trash click | **Yes** — destructive. |
| Delete invoice | After trash click | **Yes** — destructive. |
| Client add/edit | Slideover, not modal | **Good** — less intrusive. |

**Verdict:** No unnecessary modals. Only destructive deletes use modals.

---

## Other friction

| Issue | Where | Suggestion |
|-------|--------|------------|
| New invoice: "Cancel" vs "Back" | Header has "Back" to /invoices; form has "Cancel" to /invoices. | **Duplicate.** One control (e.g. "Back" or "Cancel") is enough. |
| Invoice edit: only "Cancel" in header | Links to detail. Form has no Cancel button. | **OK** — one exit path. |
| Invoice detail: no loading on status buttons | User may click again. | Add loading/disabled to prevent double submit and clarify state. |
| Empty state CTAs | Dashboard, Clients, Invoices: "Create your first…" / "Add your first…" | **Good** — single clear action. |

---

## Summary

| Question | Answer |
|----------|--------|
| Can this task be done in fewer clicks? | View invoice could be row click (optional). Otherwise no obvious reduction. |
| Is user forced to repeat steps? | No. |
| Avoidable friction? | (1) New/Edit invoice: long scroll to submit; (2) No autofocus on login/register/slideover; (3) Duplicate Back/Cancel on new invoice; (4) Status buttons without loading. |

**Recommendations:**
1. **Scroll:** Consider sticky or always-visible primary button for new/edit invoice, or shorter above-the-fold section.
2. **Auto-focus:** Set focus to first field on login (and register, client slideover) when opened.
3. **Duplicate exit:** Use single "Back" or "Cancel" on new invoice header/form.
4. **Status buttons:** Add loading state and error handling on invoice detail (see feedback and timing audits).
