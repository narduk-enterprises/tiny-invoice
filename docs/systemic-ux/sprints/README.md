# Systemic UX — Implementation Sprints

Each sprint focuses on **one category** from the audits. Follow the same process every time.

## Sprint process

1. **Select issue cluster** — Pick one sprint (e.g. Sprint 2: Feedback). Work only on that cluster.
2. **Implement minimal targeted fixes** — Do the smallest change set that addresses the audit items. No scope creep.
3. **Re-test full workflow** — Run through the affected flows (e.g. login, create invoice, delete client) and confirm behavior.
4. **Verify no regression** — Check that existing behavior (navigation, validation, errors) still works.
5. **Document before/after impact** — In the sprint file, note what was done and the UX impact (e.g. "Success toast on client save; user no longer infers from list only").

## Sprint list

| Sprint | Focus | Source audit |
|--------|--------|---------------|
| [sprint-1.md](./sprint-1.md) | Reduce cognitive overload | Cognitive load |
| [sprint-2.md](./sprint-2.md) | Improve feedback clarity | Feedback, Action–consequence |
| [sprint-3.md](./sprint-3.md) | Fix trust leaks | Trust |
| [sprint-4.md](./sprint-4.md) | Simplify controls & destructive exposure | Control exposure, Noise |
| [sprint-5.md](./sprint-5.md) | Improve timing perception | Timing |
| [sprint-6.md](./sprint-6.md) | Remove UI noise | Noise, Cognitive |
| [sprint-7.md](./sprint-7.md) | Reduce friction | Friction |

## Order suggestion

- **First:** Sprint 2 (feedback) and Sprint 5 (timing) — fix silent success and status-button loading so every action has clear outcome.
- **Second:** Sprint 3 (trust) and Sprint 6 (noise) — footer, dates, unit label; consolidate CTAs and duplicate controls.
- **Third:** Sprint 1 (cognitive), Sprint 4 (controls), Sprint 7 (friction) — primary CTAs, Mark overdue placement, autofocus, Back/Cancel.

You can run sprints in any order; dependencies are minimal.
