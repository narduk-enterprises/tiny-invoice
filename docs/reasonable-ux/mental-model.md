# Mental Model — TinyInvoice

## One-sentence app purpose

**TinyInvoice is a simple invoicing app for freelancers: create and send professional invoices, manage clients, and track what’s paid and what’s outstanding.**

---

## Primary user roles (max 3)

1. **Freelancer (account owner)** — Creates invoices, manages clients, updates business details, marks invoices sent/paid/overdue.
2. *(No separate “client” or “admin” role; clients receive invoices outside the app.)*

---

## Primary objects

| Object | Meaning in the app |
|--------|--------------------|
| **Invoice** | A bill with line items, issue/due dates, status (draft, sent, paid, overdue). Belongs to one client. |
| **Client** | Contact (name, email, address, phone) used as the recipient of invoices. |
| **Payment** | Not a separate entity; “payment” is represented by marking an invoice as **paid**. Revenue and outstanding are derived from invoice totals and status. |
| **Template** | Not present; invoices use a single built-in layout. |
| **Settings** | User/business profile: business name and address (shown on invoices). |

---

## Top 5 user goals

1. **Create an invoice** — Add client, line items, dates; save as draft or mark sent.
2. **See the big picture** — Dashboard: total revenue, outstanding amount, invoice counts, recent invoices.
3. **Manage clients** — Add, edit, delete clients so they can be attached to invoices.
4. **Track invoice status** — Move draft → sent → paid (or overdue) from list or detail view.
5. **Set business identity** — Settings: business name and address for invoice branding.

---

## Logged out vs logged in expectations

| State | User expects |
|-------|-------------------------------|
| **Logged out** | Landing explains the product; primary actions are **Get started** (register) and **Log in**. No access to Dashboard, Invoices, Clients, or Settings. Deep links to protected routes should send them to login, then (ideally) to the intended page or dashboard. |
| **Logged in** | One clear “home base” (Dashboard). Nav is task-focused: Dashboard, Clients, Invoices, Settings. No marketing nav in the main bar. Account/logout via header. After login or register, land on Dashboard. |
