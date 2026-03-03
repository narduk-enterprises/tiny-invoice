# Journey Flows & Next Action

Each screen supports a user journey with a clear next step. Documented flows: Create invoice, Send invoice, Mark paid, Add client.

---

## 1. Create invoice

| Step | Screen | Action | Next |
|------|--------|--------|------|
| Start | Dashboard or Invoices list | Click “New invoice” or “Create your first invoice” / “Create one” | `/invoices/new` |
| Step 1 | New invoice form | Select client, add line items, dates, notes; save | Save as draft → Invoice detail or list |
| Decision | — | User can save draft or (if we add it) “Save and mark sent” | Draft → detail; Sent → detail |
| Success | Invoice detail or list | Invoice appears with status Draft (or Sent) | Next: Edit, or Mark sent from detail |
| Failure | Form | Validation or API error shown inline | Fix and resubmit; no dead end |
| **Next best action** | Invoice detail | “Edit” or “Mark sent” | List and Dashboard show the new invoice |

---

## 2. Send invoice

| Step | Screen | Action | Next |
|------|--------|--------|------|
| Start | Invoice detail (draft) or Invoices list | Open draft invoice | Detail page |
| Step 1 | Invoice detail | Click “Mark sent” | Status → Sent |
| Success | Same page | Badge and state update to Sent | Next: Mark paid when client pays, or track from list |
| Failure | Same page | API error (e.g. toast or inline) | Retry or Edit |
| **Next best action** | Detail or list | “Mark paid” when paid; or “Edit” to fix | Dashboard “Outstanding” reflects sent/overdue |

---

## 3. Mark paid

| Step | Screen | Action | Next |
|------|--------|--------|------|
| Start | Invoice detail (sent/overdue) or list | Open invoice | Detail page |
| Step 1 | Invoice detail | Click “Mark paid” | Status → Paid |
| Success | Same page | Badge → Paid; Dashboard revenue/outstanding update | Back to list or Dashboard |
| Failure | Same page | API error | Retry |
| **Next best action** | Detail | “Back” to list or navigate to Dashboard | Revenue and “Paid” count update |

---

## 4. Add client

| Step | Screen | Action | Next |
|------|--------|--------|------|
| Start | Clients list or (when creating invoice) client selector | Click “Add client” or “Add your first client” | Slideover (Clients) or modal (if from invoice) |
| Step 1 | Client form | Name, email, optional address/phone; Save | Slideover closes, list refreshes |
| Success | Clients list | New client in table | Next: Edit or use client on invoice |
| Failure | Form | Validation or API error inline | Fix and Save |
| **Next best action** | Clients list | “Add client” for another; or go to Invoices → New invoice to use client | No dead end |

---

## Cross-cutting

- **Dashboard** is the default landing after login; “Recent invoices” and stats give next actions (View all, Create one, open an invoice).
- **Empty states** always offer one primary action (Create your first invoice, Add your first client, Create one).
- **Error states** show one line of copy + retry or cancel; no blank screens.
- **Back / View all** from detail views return to list or Dashboard so the user always has a way forward.
