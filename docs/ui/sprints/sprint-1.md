# Sprint 1 — Auth (Login + Register)

**Surface:** Login page, Register page.

**Goal:** Fix spacing, typography, and form standards for auth; align with spacing-system, typography-system, form-standards, component-matrix.

---

## Before (from audit)

- Login/Register: `space-y-4`; no use of `form-section` or `form-actions`.
- Card: no explicit content padding; form is direct child of UCard.
- Submit row: `flex flex-col gap-2 sm:flex-row sm:items-center` — not using `form-actions`.
- Empty state / error: UAlert between fields and buttons; layout OK.
- Optional labeling: Register has "(optional)" on business fields; consistent there.

---

## Tasks

1. **Spacing**
   - Replace form wrapper `space-y-4` with `form-section` (or `space-y-5`).
   - Add inner content wrapper to card with `p-5` for body.
   - Replace submit row with `form-actions` (or `flex justify-end gap-2` + primary first from right). For login: two buttons + link — use `form-actions` with appropriate flex (e.g. `form-actions form-actions-center` for centered, or keep flex-row with gap-2 and align consistently).
   - Use `py-12` for any loading/empty state if added (N/A for auth).

2. **Typography**
   - Confirm UPageHeader provides H1; no change.
   - No card H2 on login/register (single form); N/A.

3. **Forms**
   - Ensure every field has UFormField with label + required where needed.
   - Optional: Register "Business name (optional)" / "Business address (optional)" — keep as-is.
   - Error: form-level UAlert; keep. Ensure copy is human-readable (already is).
   - Submit: primary with `:loading="pending"`; secondary "Fill demo" / link "Log in" per component matrix.
   - Add `class="w-full"` to UInput/UTextarea if not already (Nuxt UI full width).

4. **Components**
   - Buttons: Login = primary block + outline "Fill demo"; Register = primary block. No variant drift.
   - Card: `card-base` + inner `p-5`.
   - Alerts: error + primary soft (demo) — keep.

5. **States**
   - Loading: button shows spinner and disabled. Layout stable.
   - Focus: no override; Nuxt UI focus ring.

6. **Keyboard**
   - Tab order: fields → primary → secondary → link. No custom tabindex unless needed for skip.

7. **Document before/after**
   - Before: current markup (space-y-4, no form-section, no card p-5).
   - After: form-section, card p-5, form-actions (or documented equivalent), w-full on inputs.

---

## Regression checklist (after sprint)

- [ ] Any hardcoded colors? No.
- [ ] Any inconsistent padding? Resolved (p-5, form-section).
- [ ] Any missing focus states? No (Nuxt UI).
- [ ] Any unlabeled inputs? No.
- [ ] Any missing loading states? No (pending on submit).
- [ ] Any placeholder-only labels? No.
- [ ] Any mismatched button variants? No (per matrix).
- [ ] Any inconsistent error messaging? No.

---

## Completion

When merged: auth surfaces follow spacing system, form standards, and component matrix. Run full UI regression checklist before merge.
