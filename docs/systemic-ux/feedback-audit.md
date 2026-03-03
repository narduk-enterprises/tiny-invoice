# Phase 2 — Feedback & Confirmation Audit

**Goal:** Ensure all actions confirm outcome. For each action: expected outcome, visible feedback, timing, and whether success/failure is obvious.

---

## Auth

### Login (submit)
| Item | Notes |
|------|--------|
| Action | Submit email + password |
| Expected outcome | Session created, redirect to dashboard (or redirect query) |
| Visible feedback? | **No.** Button shows `:loading="pending"` then redirect. No success message. |
| Timing | Immediate redirect on success. |
| Success obvious? | **No.** User sees new page; no explicit "You're logged in." |
| Failure obvious? | Yes. `UAlert` with `error`; button stops loading. |

**Flag: Silent success.** Login succeeds and user is redirected; no toast or inline "Logged in."

### Register (submit)
| Item | Notes |
|------|--------|
| Action | Submit registration form |
| Expected outcome | Account created, redirect to dashboard |
| Visible feedback? | **No.** Loading then redirect. |
| Success obvious? | **No.** Silent success. |
| Failure obvious? | Yes. `UAlert` with error. |

**Flag: Silent success.**

### Logout (app shell)
| Item | Notes |
|------|--------|
| Action | Click Logout |
| Expected outcome | Session cleared, redirect to home |
| Visible feedback? | **No.** Navigate to `/`. Nav updates (no Dashboard/Clients/Invoices). |
| Success obvious? | Implicit (user is on home, nav changed). No explicit "You're logged out." |
| Failure obvious? | Not explicitly handled (would stay on page or show error). |

**Flag: Silent success.** Acceptable for logout but could add brief confirmation.

---

## Clients

### Create/Update client (slideover submit)
| Item | Notes |
|------|--------|
| Action | Save in Add/Edit client slideover |
| Expected outcome | Client saved, list refreshed, slideover closes |
| Visible feedback? | **No.** Slideover closes; list updates (new/updated row). No "Client saved." |
| Timing | Immediate close + list refetch. |
| Success obvious? | **No.** User must infer from closed panel and list content. |
| Failure obvious? | Yes. `UAlert` in slideover; slideover stays open. |

**Flag: Silent success.** List change is visible but no explicit confirmation.

### Delete client (modal confirm)
| Item | Notes |
|------|--------|
| Action | Confirm Delete in modal |
| Expected outcome | Client removed, modal closes, row disappears |
| Visible feedback? | **No.** Modal closes; row removed from table. No "Client deleted." |
| Success obvious? | **No.** Row disappearance is the only signal. |
| Failure obvious? | Yes. `deleteError` in modal; modal stays open. |
| Destructive confirmation? | Yes. Modal: "Delete client X? This will fail if they have invoices." |

**Flag: Silent success.** Destructive action is confirmed but outcome is only implied by list change.

---

## Invoices

### Create invoice (new.vue submit)
| Item | Notes |
|------|--------|
| Action | Create invoice |
| Expected outcome | Invoice created, navigate to `/invoices/:id` |
| Visible feedback? | **No.** Button loading then navigation. |
| Success obvious? | **No.** User lands on detail page; no "Invoice created." |
| Failure obvious? | Yes. `UAlert` with error; button stops loading. |

**Flag: Silent success.**

### Update invoice (edit.vue submit)
| Item | Notes |
|------|--------|
| Action | Save changes |
| Expected outcome | Invoice updated, navigate to detail |
| Visible feedback? | **No.** Loading then navigation. |
| Success obvious? | **No.** Silent success. |
| Failure obvious? | Yes. `UAlert` with error. |

**Flag: Silent success.**

### Update status (detail: Mark sent / Mark paid / Mark overdue)
| Item | Notes |
|------|--------|
| Action | Click Mark sent, Mark paid, or Mark overdue |
| Expected outcome | Status updated, UI reflects new status |
| Visible feedback? | **No.** No loading state on buttons; `refresh()` runs. Badge and buttons update after refetch. |
| Timing | After async `updateStatus` + `refresh`; no spinner. |
| Success obvious? | **Partially.** Badge text/color changes; optional buttons show/hide. No "Marked as sent." |
| Failure obvious? | **No.** No try/catch or error UI; failure would be unhandled. |

**Flags:**
- **Silent success.** Status change is visible only via badge/button state.
- **No loading state.** User doesn't know request is in progress.
- **Silent failure.** Errors not displayed.

### Delete invoice (modal confirm)
| Item | Notes |
|------|--------|
| Action | Confirm Delete in modal |
| Expected outcome | Invoice deleted, modal closes, navigate or list updates |
| Visible feedback? | **No.** Modal closes; list refreshes (invoice disappears). No "Invoice deleted." |
| Success obvious? | **No.** Only list/detail change. |
| Failure obvious? | Yes. `deleteError` in modal. |
| Destructive confirmation? | Yes. "This cannot be undone." |

**Flag: Silent success.**

---

## Settings

### Save settings
| Item | Notes |
|------|--------|
| Action | Save business name/address |
| Expected outcome | Settings saved, user refetched |
| Visible feedback? | **Yes.** `UAlert` success: "Settings saved." |
| Success obvious? | Yes. |
| Failure obvious? | Yes. `UAlert` error. |

**No flags.** Only screen with explicit success feedback.

---

## Loading states

| Screen | Loading indicator | Resolution |
|--------|-------------------|------------|
| Dashboard | Skeleton cards + skeleton table | Replaced by real content |
| Clients | Full-page spinner "Loading…" | Replaced by table or empty state |
| Invoices list | "Loading…" text | Replaced by table or empty state |
| New invoice | "Loading clients…" then form | Form appears |
| Invoice detail | Spinner | Replaced by content or "not found" |
| Invoice edit | "Loading…" then form or "deleted" message | Clear |

**Spinner with no resolution:** All loading states eventually resolve to content or empty/error. No infinite spinner.

**Disabled button with no reason:** Login/Register/Clients/Invoices use `:loading="pending"` or `:disabled="pending"`; loading state is the reason. No generic disabled without explanation.

---

## Summary

| Issue | Where |
|-------|--------|
| **Silent success** | Login, Register, Logout; Client create/update/delete; Invoice create, update, status change, delete |
| **Silent failure** | Invoice detail: Mark sent / Mark paid / Mark overdue (no error UI) |
| **Spinner with no resolution** | None |
| **Disabled with no reason** | None |
| **No confirmation for destructive** | Delete client and Delete invoice both have modal confirmation. |

**Recommendations:**
- Add explicit success feedback for all mutations: toast or inline message (e.g. "Logged in", "Client saved", "Invoice created", "Status updated", "Deleted").
- Add error handling and error UI for status buttons on invoice detail.
- Add loading state (e.g. disabled/loading on the clicked button) for Mark sent / Mark paid / Mark overdue.
