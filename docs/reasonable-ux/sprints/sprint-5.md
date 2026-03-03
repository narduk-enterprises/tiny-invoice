# Sprint 5 — Final QA and regression pass

## Goal

- Run full [QA checklist](#qa-checklist) after Sprints 1–4.
- Confirm completion criteria for the Reasonable UX workflow.
- Document any remaining gaps or follow-ups.

## QA checklist (run after all sprints)

### Navigation reasonableness

- [ ] No duplicate concepts in nav (no Home + Dashboard when logged in).
- [ ] Every nav item maps to a unique user goal.
- [ ] No “Home” while logged in (unless explicitly justified and documented).
- [ ] Logged out nav contains no product surfaces (Dashboard, Invoices, Clients).

### Terminology

- [ ] All labels match [label-dictionary.md](../label-dictionary.md).
- [ ] No synonyms used for the same concept.
- [ ] Buttons match page intent (“Create your first invoice”, “Add client”, “Save”, “Log in”).

### Auth behavior

- [ ] Logged out deep links redirect to login with `redirect` param; after login user lands on intended page or dashboard.
- [ ] Logged in always has a single entry (Dashboard).
- [ ] Logout returns to landing; no product nav after logout.

### Page clarity

- [ ] Each page has a primary action or clearly explains why it doesn’t.
- [ ] Each empty state has a next step.
- [ ] No dead ends (invoice not found has “Back to invoices”; errors have retry/cancel).

## Completion criteria (workflow)

- [ ] Logged out IA is clean: only auth + marketing/support (landing).
- [ ] Logged in IA is clean: dashboard + task surfaces only.
- [ ] “Home vs Dashboard” duplication is eliminated.
- [ ] Labels are consistent across the product.
- [ ] Every empty/error state points to a sensible next step.
- [ ] A new user can predict where things are without training.

## Document changes

- **Done:** Full QA run; completion criteria checked. Sprints 1–4 implemented; `pnpm run quality` passes.
- **Follow-ups:** None. Optional: add optional toast “Your session expired. Please log in again.” when redirecting to login after 401 (edge-cases.md).
