# UI Workflow — Reference

Central reference for the UI audit and lock workflow. Details live in the other docs in this folder.

---

## Phases (completed)

1. **Phase 1 — UI Audit** → `audit.md` (read-only; every inconsistency documented).
2. **Phase 2 — Spacing system** → `spacing-system.md` (page, card, stack, grid, form, section; no arbitrary spacing).
3. **Phase 3 — Typography** → `typography-system.md` (H1–H4, body, small, muted, error, helper; no skip levels).
4. **Phase 4 — Form UX** → `form-standards.md` (field structure, labels, inputs, errors, buttons, layout, loading).
5. **Phase 5 — Component matrix** → `component-matrix.md` (allowed variants; when to use / when NOT).
6. **Phase 6 — Interaction** → `interaction-rules.md` (hover, focus, disabled, transitions, modal motion).
7. **Phase 7 — Sprints** → `sprints/sprint-N.md` (one surface per sprint; before/after; regression checklist).

---

## Regression checklist

Run after each sprint. See `regression-checklist.md`.

---

## Prohibited during UI workflow

- Introducing new component libraries.
- Custom CSS overrides without documentation.
- Adding visual complexity.
- Mixing design styles.
- Skipping form validation UX.
- Inconsistent state handling.

---

## Completion criteria

UI workflow is complete when:

- Every page follows the spacing system.
- Every form follows standardized structure.
- No visual inconsistency remains.
- All states are explicit (loading, error, disabled, focus).
- Interaction feels uniform.
- Accessibility validated (focus, labels, keyboard).
- No ad-hoc styling exists.

---

## Doc index

| Doc | Purpose |
|-----|--------|
| `audit.md` | Phase 1 — all current inconsistencies |
| `spacing-system.md` | Phase 2 — spacing scale and usage |
| `typography-system.md` | Phase 3 — heading and text scale |
| `form-standards.md` | Phase 4 — form structure and UX |
| `component-matrix.md` | Phase 5 — component variants and rules |
| `interaction-rules.md` | Phase 6 — hover, focus, transitions |
| `sprints/README.md` | Phase 7 — sprint process |
| `sprints/sprint-1.md` | Auth (login + register) sprint |
| `regression-checklist.md` | Post-sprint checklist |
| `workflow.md` | This file |
