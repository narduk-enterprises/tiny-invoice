# UI Sprints

Each sprint picks one UI surface and applies the locked systems (spacing, typography, forms, components, interactions).

## Process (per sprint)

1. Pick one surface (e.g. dashboard, settings, auth, invoices list, invoice detail, invoice new/edit).
2. Fix spacing (spacing-system.md).
3. Align typography (typography-system.md).
4. Refactor forms to standard (form-standards.md).
5. Replace inconsistent components (component-matrix.md).
6. Add missing states (loading, error, disabled, focus).
7. Validate keyboard behavior (tab order, focus trap in modals).
8. Document before/after in this folder (`sprint-N.md`).

## Regression checklist (after each sprint)

- Any hardcoded colors?
- Any inconsistent padding?
- Any missing focus states?
- Any unlabeled inputs?
- Any missing loading states?
- Any placeholder-only labels?
- Any mismatched button variants?
- Any inconsistent error messaging?

If yes → fix before merge.

## Sprints

- **sprint-1.md** — Auth (Login + Register)
- **sprint-2.md** — Dashboard (optional; create when starting dashboard)
- **sprint-3.md** — Settings (optional)
- **sprint-4.md** — Clients (list + slideover + delete modal)
- **sprint-5.md** — Invoices (list + delete modal)
- **sprint-6.md** — Invoice detail + new + edit

Complete in any order; prefer auth first so form patterns are set.
