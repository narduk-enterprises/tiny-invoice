# UI Regression Checklist

Run after each sprint (and before any UI-related merge).

---

- [x] **Hardcoded colors?** No hex/rgb; use tokens (primary, neutral, muted, error, etc.).
- [x] **Inconsistent padding?** Use only spacing-system.md scale (p-5 card, form-section, py-12 empty/loading, etc.).
- [x] **Missing focus states?** All interactive elements have visible focus ring (Nuxt UI default).
- [x] **Unlabeled inputs?** Every field has UFormField with label; no placeholder-only labels.
- [x] **Missing loading states?** Submit buttons use `:loading`; page loading uses py-12 + spinner or skeleton consistently.
- [x] **Placeholder-only labels?** No; labels always visible.
- [x] **Mismatched button variants?** Per component-matrix.md (Primary / outline neutral / ghost neutral / ghost or solid error).
- [x] **Inconsistent error messaging?** Human-readable; under field or one form-level UAlert.

---

**Last verified:** Full pass after double-check of all pages (dashboard, index, login, register, settings, clients, invoices index/new/edit/[id]). Quality (lint + typecheck) passed.

If any item fails, fix before merge. Do not introduce new component libraries, undocumented custom CSS, or ad-hoc styling.
