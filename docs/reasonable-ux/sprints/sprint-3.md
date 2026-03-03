# Sprint 3 — Label dictionary audit & enforcement

## Goal

- All user-facing labels match [label-dictionary.md](../label-dictionary.md).
- No synonyms for the same concept (e.g. no “Home” when we mean Dashboard; no “Submit” where we say “Save”).
- Buttons match page intent (e.g. “New invoice”, “Add client”, “Create your first invoice”).

## Scope

- Audit: Nav, page headers, buttons, empty states, form labels, error messages across all pages.
- Fix any mismatches (rename or copy only; no new features).

## Implementation

- **Audit list:** Walk through each page and compare to dictionary:
  - app.vue: Login, Register, Logout, Dashboard, Clients, Invoices, Settings.
  - index.vue: Get started, Log in, Try demo.
  - login.vue: Log in, Fill demo credentials, Register link.
  - register.vue: Create account, Register.
  - dashboard.vue: Dashboard, Total revenue (paid), Outstanding, Recent invoices, View all, No invoices yet. Create one.
  - invoices/index.vue: Invoices, New invoice, Create your first invoice.
  - invoices/[id].vue: Back, Edit, Mark sent, Mark paid, Not found, Invoice not found.
  - clients.vue: Clients, Add client, Add your first client, Edit client, Save.
  - settings.vue: Settings, Business name, Business address, Save.
- **Changes:** Replace any forbidden alternate with the canonical term; ensure CTAs use the exact phrases from the dictionary where specified.

## QA checklist (Sprint 3)

- [ ] No “Home” in logged-in nav (already Sprint 1).
- [ ] No “Submit” on forms; use “Save” or “Log in” as appropriate.
- [ ] No “Bills” or “Statements” for invoices.
- [ ] Empty state buttons: “Create your first invoice”, “Add your first client”, “Create one” (link) as per dictionary.
- [ ] Page titles match nav: Dashboard, Invoices, Clients, Settings.
- [ ] Error messages are one line and human-readable; no raw API dumps in UI.

## Document changes

- **Done:** All labels aligned with label dictionary; synonyms removed. Implemented: header “Login” → “Log in” in `app.vue`. Rest of app already matched dictionary (Save, New invoice, Add client, etc.).
