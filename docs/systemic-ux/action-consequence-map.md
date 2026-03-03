# Phase 3 — Action → Consequence Map

**Goal:** Map every action to its outcome: what changes, where it's visible, how the user knows it worked, and how they can undo.

---

## Landing

| Action | What changes | Where visible | How user knows it worked | Undo |
|--------|--------------|---------------|---------------------------|------|
| Get started | Navigate to /register | New page | URL + form | Back |
| Log in | Navigate to /login | New page | URL + form | Back |
| Try demo | Navigate to /login?demo=1 | New page, demo prefilled | URL + filled fields | Back |

No state change; navigation only. **Result is not spatially disconnected** — user is on new page.

---

## Login

| Action | What changes | Where visible | How user knows it worked | Undo |
|--------|--------------|---------------|---------------------------|------|
| Log in (success) | Session, user state, redirect | Dashboard (or redirect URL) | **Implicit only** (new page). No "Logged in." | Logout |
| Log in (failure) | — | Same page, UAlert | Error message | Retry |
| Fill demo credentials | Form fields | Same card | Fields populated | Clear/change |
| Register link | Navigate | /register | New page | Back |

**Feedback off-screen:** Success = redirect; user infers from new page. **No hunt for confirmation** — they're on dashboard.

---

## Register

| Action | What changes | Where visible | How user knows it worked | Undo |
|--------|--------------|---------------|---------------------------|------|
| Register (success) | Account + session, redirect | Dashboard | **Implicit only** | Logout (no account delete in app) |
| Register (failure) | — | Same page, UAlert | Error message | Retry |
| Log in link | Navigate | /login | New page | Back |

Same as login: **success is implicit** (landing on dashboard).

---

## Dashboard

| Action | What changes | Where visible | How user knows it worked | Undo |
|--------|--------------|---------------|---------------------------|------|
| View all | Navigate | /invoices | New page | Back |
| Create your first invoice | Navigate | /invoices/new | New page | Back |
| (Table row click) | — | No link on row; user must use View in invoices list | N/A | — |

Dashboard is read-only; no mutations. **Change visibility:** N/A.

---

## Clients

| Action | What changes | Where visible | How user knows it worked | Undo |
|--------|--------------|---------------|---------------------------|------|
| Add client | Open slideover | Slideover | Panel opens | Close |
| Save (create) | New row in list, slideover closes | **Table on same page** | **List update only.** No toast. | Delete client |
| Save (update) | Row content updates, slideover closes | **Table** | **Row content change.** No toast. | Edit again / delete |
| Cancel (slideover) | Slideover closes | — | Panel closes | — |
| Edit (row) | Open slideover with data | Slideover | Panel opens with values | Cancel |
| Delete (row) | Open modal | Modal | Modal with client name | Cancel |
| Confirm delete | Row removed, modal closes | **Table** | **Row disappears.** No toast. | **Cannot undo** (no restore) |

**Spatially connected:** Table is on same page; list update is visible. **But:** No explicit "Saved" or "Deleted" — user must infer from list. **Destructive:** Delete has modal but no undo.

---

## Invoices list

| Action | What changes | Where visible | How user knows it worked | Undo |
|--------|--------------|---------------|---------------------------|------|
| New invoice | Navigate | /invoices/new | New page | Back |
| Status filter | Query param, filtered list | Same table | List filters | Change filter |
| View (row) | Navigate | /invoices/:id | Detail page | Back |
| Edit (row) | Navigate | /invoices/:id/edit | Edit page | Cancel / Back |
| Delete (row) | Open modal | Modal | Modal | Cancel |
| Confirm delete | Invoice removed, modal closes, list refetches | **Table** | **Row disappears.** No toast. | **Cannot undo** |

Filter change is **immediate and visible** (same page). Delete consequence is list update only; **no explicit confirmation**.

---

## New invoice

| Action | What changes | Where visible | How user knows it worked | Undo |
|--------|--------------|---------------|---------------------------|------|
| Create invoice (success) | Invoice created, navigate | /invoices/:id | **New page (detail).** No "Created." | Delete invoice |
| Create invoice (failure) | — | Same page, UAlert | Error message | Retry |
| Cancel | Navigate | /invoices | List | — |
| Add line | New row in form | Same form | New line row | Remove line |
| Remove line | Row removed | Same form | Row gone | Add line |

**Result spatially connected:** User lands on detail (the created invoice). **Success feedback:** Implicit (new page). **Undo:** Would require going to list and deleting.

---

## Invoice detail ([id])

| Action | What changes | Where visible | How user knows it worked | Undo |
|--------|--------------|---------------|---------------------------|------|
| Back | Navigate | /invoices | List | — |
| Edit | Navigate | /invoices/:id/edit | Edit form | Cancel |
| Mark sent | Status → sent, list + detail refetch | **Badge + buttons on same page** | Badge text/color; "Mark sent" hides; "Mark paid" / "Mark overdue" show. **No loading, no toast.** | Mark overdue (or edit?) |
| Mark paid | Status → paid | Same | Badge; status buttons hide. **No loading, no toast.** | **No undo in UI** |
| Mark overdue | Status → overdue | Same | Badge; "Mark overdue" hides; "Mark paid" stays. **No loading, no toast.** | Mark paid |

**Spatially connected:** All feedback is on same page (badge + button visibility). **But:** No loading state on buttons; no success message; **errors not shown** (no catch/error UI). **User may hunt:** If refetch is slow, nothing changes for a moment — user might click again.

---

## Invoice edit ([id]/edit)

| Action | What changes | Where visible | How user knows it worked | Undo |
|--------|--------------|---------------|---------------------------|------|
| Save changes (success) | Invoice updated, navigate | /invoices/:id | **Detail page.** No "Saved." | Edit again |
| Save changes (failure) | — | Same page, UAlert | Error | Retry |
| Cancel | Navigate | /invoices/:id | Detail | — |
| Add/remove line | Local form state | Same form | Rows | — |

Same pattern: **success = navigation**, no explicit confirmation.

---

## Settings

| Action | What changes | Where visible | How user knows it worked | Undo |
|--------|--------------|---------------|---------------------------|------|
| Save (success) | User record, auth state | Same page | **UAlert "Settings saved."** | Change and save again |
| Save (failure) | — | Same page, UAlert | Error | Retry |

**Only place with explicit success feedback.** Result is on same page; no navigation.

---

## App shell

| Action | What changes | Where visible | How user knows it worked | Undo |
|--------|--------------|---------------|---------------------------|------|
| Logout | Session cleared, redirect | / (home), nav updates | **Implicit:** home page, nav no longer shows Dashboard/Clients/Invoices | Log in again |
| Color mode | Preference | Entire UI | Theme switches | Click again to cycle |
| Mobile menu | Menu open/close | Header | Panel toggles | Click to close |
| Nav link | Navigate | New page | New page | Back |

Logout: **implicit** (URL + nav). No "You're logged out."

---

## Summary

| Question | Finding |
|----------|--------|
| **Result spatially disconnected from action?** | Create/Update invoice: action on form, result is new page (detail). Connected by navigation. Client save: result in same-page table — connected. |
| **Feedback off-screen?** | Most success feedback is either (1) navigation to new page or (2) list/UI update on same page. No global toast; only Settings shows inline success. |
| **User must hunt for confirmation?** | Yes for: Login, Register, Client save/delete, Invoice create/update/delete, Invoice status change. User infers from URL change or list/content change. |
| **How user can undo** | Destructive: Delete client/invoice have no undo. Status: Mark paid has no undo. Edit/Save can be re-edited. |

**Recommendations:**
- Add consistent success feedback (toast or inline) for all mutations so user doesn't rely on "did the list change?" or "did I land on the right page?"
- For invoice detail status buttons: show loading state and success/error message so result isn't only "badge changed after a moment."
- Document or add undo where possible (e.g. "Mark as draft" or revert status) for non-destructive status flows.
