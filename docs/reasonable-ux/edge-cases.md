# Empty / Error / Edge Case Reasonableness

Specifications so each surface has clear empty and error handling and no dead ends.

---

## Empty states (by surface)

| Surface | Empty state message (1 line) | Why it's empty | Primary action | Secondary (optional) |
|---------|------------------------------|----------------|-----------------|----------------------|
| **Invoices list** | No invoices yet. | User hasn’t created any. | Button: “Create your first invoice” → `/invoices/new` | — |
| **Dashboard recent invoices** | No invoices yet. Create one. | Same. | Link “Create one” → `/invoices/new` | — |
| **Clients list** | No clients yet. | User hasn’t added any. | Button: “Add your first client” (opens Add client) | — |
| **Settings** | (N/A — form always has fields) | — | — | — |

---

## Error states (by surface)

| Surface | Error scenario | Copy (human readable) | Recovery action |
|---------|----------------|----------------------|------------------|
| **Login** | Wrong credentials / server error | Use API message or “Log in failed. Check your email and password.” | Retry; link to Register. |
| **Register** | Duplicate email / server error | Use API message or “Registration failed. Try again or log in.” | Retry; link to Log in. |
| **Invoices list** | Load failed | “Couldn’t load invoices. Please try again.” | Retry (e.g. refresh or retry button). |
| **Invoice detail** | Load failed or not found | “Invoice not found.” (or “Couldn’t load invoice.” for network) | Link/button: “Back to invoices” → `/invoices`. |
| **Invoice delete** | Delete failed | Use API message or “Delete failed. Try again.” | Close modal; retry or cancel. |
| **Client form** | Save failed | Use API message or “Failed to save client.” | Fix and Save; Cancel to close. |
| **Client delete** | Delete failed (e.g. has invoices) | Use API message or “Delete failed. Client may have invoices.” | Close modal; retry or cancel. |
| **Settings** | Save failed | Use API message or “Failed to save settings.” | Retry Save. |

---

## Edge cases

### Logged in but no invoices

- **Dashboard:** Shows zeros and “No invoices yet. Create one.” with link to `/invoices/new`. No dead end.
- **Invoices list:** Empty state with “Create your first invoice.” Same.

### Logged out deep-link to protected route

- **Behavior:** Auth middleware redirects to `/login`. Currently no `redirect` param.
- **Target:** Redirect to `/login?redirect=/intended-path`. After login, navigate to `redirect` if same-origin and allowed path; else `/dashboard`.
- **Copy:** No extra message required; URL and post-login redirect suffice.

### Expired session mid-flow

- **Behavior:** Next request to API returns 401; `fetchUser()` may clear user; middleware on next nav sends to `/login`.
- **Target:** Redirect to `/login?redirect=/intended-path` so user can sign in and return.
- **Copy:** Optional toast: “Your session expired. Please log in again.” after redirect.

### Invoice not found (invalid ID or deleted)

- **Current:** Invoice detail shows “Not found” / “Invoice not found.”
- **Target:** Keep; add “Back to invoices” link → `/invoices` so user isn’t stuck.

### No permission / role mismatch

- **Current:** Single role (account owner). No permission UI.
- **Target:** If roles are added later, 403 should show one-line message and link to Dashboard or Settings; no raw error dump.

---

## Summary

- Every empty state: one line + one primary action (and optional secondary).
- Every error: one line copy + recovery (retry, back, or cancel).
- Deep link and expired session: use `redirect` query and post-login redirect to intended page or dashboard.
- Invoice not found: keep current copy; ensure “Back to invoices” is present.
