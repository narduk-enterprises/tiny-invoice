# Reasonable UX — Workflow Summary

This folder contains the **mental model**, **nav/route audit**, **route map**, **label dictionary**, **auth-state rules**, **journey flows**, **edge cases**, and **implementation sprints** for TinyInvoice.

## Phase outputs

| Phase | Output | Purpose |
|-------|--------|---------|
| 1 | [mental-model.md](./mental-model.md) | App purpose, roles, objects, goals, logged out vs in expectations |
| 2 | [nav-matrix.md](./nav-matrix.md) | Nav and route audit; KEEP/RENAME/MOVE/REMOVE decisions |
| 3 | [route-map.md](./route-map.md) | Canonical logged-out and logged-in route maps |
| 4 | [label-dictionary.md](./label-dictionary.md) | Canonical terms; forbidden alternates |
| 5 | [auth-state-rules.md](./auth-state-rules.md) | What UI appears in each auth state |
| 6 | [journey-flows.md](./journey-flows.md) | Create invoice, Send invoice, Mark paid, Add client flows |
| 7 | [edge-cases.md](./edge-cases.md) | Empty/error/edge case copy and recovery actions |
| 8 | [sprints/](./sprints/) | Implementation sprints + QA per sprint |

## QA checklist (run after each sprint)

### Navigation reasonableness

- No duplicate concepts in nav (no Home + Dashboard when logged in).
- Every nav item maps to a unique user goal.
- No “Home” while logged in (unless explicitly justified).
- Logged out nav contains no product surfaces.

### Terminology

- All labels match [label-dictionary.md](./label-dictionary.md).
- No synonyms used for the same concept.
- Buttons match page intent (“Create invoice”, “Add client”, not “Submit” where we say “Save”).

### Auth behavior

- Logged out deep links redirect to login, then to intended page or dashboard (via `redirect` param).
- Logged in always has a single entry (Dashboard).
- Logout returns to logged-out surfaces only.

### Page clarity

- Each page has a primary action (or clearly explains why it doesn’t).
- Each empty state has a next step.
- No dead ends.

## Completion criteria

The workflow is complete when:

- Logged out IA is clean: only auth + marketing (landing).
- Logged in IA is clean: dashboard + task surfaces only.
- “Home vs Dashboard” duplication is eliminated.
- Labels are consistent across the product.
- Every empty/error state points to a sensible next step.
- A new user can predict where things are without training.

## Prohibited during this workflow

- Adding new features to justify messy nav.
- Keeping “Home” because “users might want it” (when logged in).
- Multiple dashboard-like pages.
- Routes that exist without a user-facing purpose.
- UI that changes meaning by state without clear labeling.
