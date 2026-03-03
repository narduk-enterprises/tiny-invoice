# Label Dictionary

Canonical terms to stop synonym chaos. Use these everywhere; avoid forbidden alternates unless a distinct concept.

---

## Navigation and app shell

| Label | Meaning | Where it appears | Forbidden alternates |
|-------|---------|-------------------|----------------------|
| **Dashboard** | Logged-in overview (revenue, outstanding, recent invoices). | Nav (logged in), page title. | Home, Overview, Main. |
| **Invoices** | List and management of invoices. | Nav, page title, breadcrumbs. | Bills, Statements (unless a distinct feature). |
| **Clients** | People/companies you invoice. | Nav, page title. | Customers, Contacts (unless distinct). |
| **Settings** | Business details and account. | Nav, page title. | Profile, Account, Preferences (use only if distinct sections exist). |
| **Log in** | Sign in (verb). | Nav when logged out, login page title. | Login (noun), Sign in (prefer “Log in” for consistency). |
| **Register** | Create account. | Nav when logged out. | Sign up, Create account (use “Register” in nav; “Create account” acceptable as page title). |
| **Logout** | Sign out. | Header button when logged in. | Sign out, Log out (use “Logout” for button). |

---

## Invoices

| Label | Meaning | Where it appears | Forbidden alternates |
|-------|---------|-------------------|----------------------|
| **New invoice** | Create a new invoice. | Invoices page header CTA. | Add invoice, Create invoice (prefer “New invoice” for button). |
| **Create your first invoice** | Empty-state CTA. | Invoices list empty state. | — |
| **Invoice** (singular) | One bill. | Detail page title “Invoice {number}”. | Bill, Statement. |
| **Draft** | Not yet sent. | Status badge, filter. | — |
| **Sent** | Sent to client. | Status badge, filter. | — |
| **Paid** | Marked as paid. | Status badge, filter, dashboard. | — |
| **Overdue** | Past due. | Status badge, filter. | — |
| **Mark sent** | Change status to sent. | Invoice detail actions. | Send, Mark as sent. |
| **Mark paid** | Change status to paid. | Invoice detail actions. | — |
| **Edit** | Edit this invoice. | Invoice detail, list row. | — |
| **Back** | Return to invoice list. | Invoice detail. | — |
| **View** | Open invoice detail. | Invoice list row. | — |

---

## Clients

| Label | Meaning | Where it appears | Forbidden alternates |
|-------|---------|-------------------|----------------------|
| **Add client** | Open form to create client. | Clients page header. | New client, Create client (use “Add client”). |
| **Add your first client** | Empty-state CTA. | Clients list empty state. | — |
| **Edit client** | Edit existing client. | Slideover title. | — |
| **Save** | Submit form. | Form actions. | Submit (use “Save”). |

---

## Dashboard

| Label | Meaning | Where it appears | Forbidden alternates |
|-------|---------|-------------------|----------------------|
| **Total revenue (paid)** | Sum of paid invoice totals. | Dashboard card. | Revenue, Income (use full label or “Total revenue”). |
| **Outstanding** | Sum of unpaid (sent/overdue) totals. | Dashboard card. | — |
| **Recent invoices** | Last N invoices. | Dashboard section. | — |
| **View all** | Go to full invoice list. | Dashboard “Recent invoices”. | — |
| **No invoices yet. Create one** | Empty state + link. | Dashboard recent section. | — |

---

## Settings

| Label | Meaning | Where it appears | Forbidden alternates |
|-------|---------|-------------------|----------------------|
| **Business name** | Name on invoices. | Settings form. | Company name (use “Business name”). |
| **Business address** | Address on invoices. | Settings form. | — |
| **Save** | Persist settings. | Form submit. | Submit. |

---

## Auth and errors

| Label | Meaning | Where it appears | Forbidden alternates |
|-------|---------|-------------------|----------------------|
| **Get started** | Primary CTA to register. | Landing. | — |
| **Try demo** | Log in with demo credentials. | Landing, login page. | — |
| **Fill demo credentials** | Pre-fill demo email/password. | Login page. | — |
| **Don't have an account? Register** | Link to register. | Login page. | — |
| **Not found** | Resource missing. | Invoice detail when ID invalid. | 404, Missing. |
| **Invoice not found.** | Invoice ID not found. | Invoice detail. | — |

---

## Rules

- **Buttons:** Use verb or verb phrase that matches the outcome (“Create your first invoice”, “Add client”, “Save”, “Log in”).
- **Page titles:** Match nav label where applicable (Dashboard, Invoices, Clients, Settings).
- **Empty states:** One short line + one primary action; label the action clearly.
- **Errors:** One line human-readable; recovery action when possible.
