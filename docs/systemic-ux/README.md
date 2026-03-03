# Systemic UX — Audit & Sprints

This folder contains the **Systemic UX** audit outputs and implementation sprint plans for TinyInvoice.

## Audit documents (Phases 1–8)

| Phase | Document | Focus |
|-------|----------|--------|
| 1 | [cognitive-load-audit.md](./cognitive-load-audit.md) | Primary/secondary actions, competing elements, density, repeated blocks |
| 2 | [feedback-audit.md](./feedback-audit.md) | Action feedback, silent success/failure, loading states |
| 3 | [action-consequence-map.md](./action-consequence-map.md) | Action → outcome, where visible, how to undo |
| 4 | [noise-audit.md](./noise-audit.md) | Decorative/redundant UI, duplicate controls, jargon |
| 5 | [trust-audit.md](./trust-audit.md) | Formatting, layout stability, errors, technical language |
| 6 | [timing-audit.md](./timing-audit.md) | Delays, spinners, layout stability, flicker |
| 7 | [control-exposure.md](./control-exposure.md) | Right controls at right time, destructive ease, progressive disclosure |
| 8 | [friction-map.md](./friction-map.md) | Scrolling, confirmations, focus, resets, click count |

## Master systemic checklist

Standalone copy: [checklist.md](./checklist.md). Before merge, ask:

- [ ] Does this screen feel **calm**?
- [ ] Is there **one clear primary action**?
- [ ] Does **every action confirm clearly** (success or failure)?
- [ ] Is anything **unnecessary** (no clarity, action, or meaning)?
- [ ] Does **layout stay stable** during load?
- [ ] Is **feedback immediate** (or loading shown)?
- [ ] Is there any **moment of doubt** (e.g. "did it work?")?
- [ ] Does anything feel **sloppy** or **unfinished**?
- [ ] Would I **trust this with real money**?

If any answer creates hesitation → fix required.

## Prohibited

- Adding UI to justify complexity
- Keeping controls "just in case"
- Multiple competing primary CTAs
- Silent failures
- Hidden state changes
- Technical jargon in user messaging
- Flicker during updates
- Excessive modal stacking

## Completion criteria

Workflow complete when:

- UI feels calm and intentional
- No silent feedback gaps
- No unnecessary UI clutter
- Actions produce visible consequence
- Tasks require minimal friction
- App feels stable and trustworthy
- Nothing feels "off" or sloppy

## Implementation sprints

Sprints live in [sprints/](./sprints/). Each sprint focuses on one category; implement minimal targeted fixes, re-test workflow, verify no regression, document before/after.

- [sprints/README.md](./sprints/README.md) — Sprint process
- [sprints/sprint-1.md](./sprints/sprint-1.md) — Cognitive overload
- [sprints/sprint-2.md](./sprints/sprint-2.md) — Feedback clarity
- [sprints/sprint-3.md](./sprints/sprint-3.md) — Trust leaks
- [sprints/sprint-4.md](./sprints/sprint-4.md) — Control exposure & destructive
- [sprints/sprint-5.md](./sprints/sprint-5.md) — Timing & loading
- [sprints/sprint-6.md](./sprints/sprint-6.md) — UI noise & clutter
- [sprints/sprint-7.md](./sprints/sprint-7.md) — Friction
