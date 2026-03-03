# Form UX Standardization

Every form must feel identical and predictable.

---

## 4.1 Field structure

Every field must include:

- **Label** — visible, not placeholder-only.
- **Input** — UInput, UTextarea, USelectMenu, etc.
- **Helper text** (optional) — below label, above error.
- **Error text** (conditional) — below field or in UFormField error slot.
- **Required indicator** (if applicable) — via UFormField `required` prop.

Structure must be consistent: Label → Input → Helper (optional) → Error (conditional). Use **UFormField** with `label`, `name`, and `required` so structure is uniform.

---

## 4.2 Label rules

- **Always visible.** No placeholder-only labels.
- **Required:** Use UFormField `required` so the indicator is shown consistently.
- **Optional:** For optional fields, use either label "Label (optional)" or helper "Optional." Do not leave optionality ambiguous.
- **Spacing:** Label-to-input spacing is handled by UFormField; do not add extra margin.

---

## 4.3 Input rules

Standardize across all inputs (UInput, UTextarea, USelectMenu):

- **Height:** Use default Nuxt UI size unless a compact context (e.g. table); do not mix custom heights.
- **Border radius:** Use Nuxt UI default (layer `--radius-input`).
- **Focus ring:** Use Nuxt UI focus style; do not remove or override without documentation.
- **Error state:** Use UForm with schema or set error on UFormField so border/ring shows error state.
- **Disabled:** Use Nuxt UI disabled styling; do not custom style.
- **Success:** If used (e.g. validated field), use only when defined in component matrix; do not ad-hoc.

Add `class="w-full"` to UInput/UTextarea when they should fill the field width (layer note: Nuxt UI components need explicit w-full).

---

## 4.4 Error UX

- **Placement:** Error text directly under the field (UFormField error slot) or, for form-level errors, one UAlert above the submit row.
- **Copy:** Human-readable. No generic "Invalid input." Use message from Zod or server (e.g. "Email is required", "At least 8 characters").
- **Accessibility:** Do not rely on color alone. Nuxt UI error state includes border/ring and error text; keep that.

---

## 4.5 Button UX

Standardize:

- **Primary:** Main CTA (Submit, Save, Create invoice). Default color (primary).
- **Secondary:** Cancel, Back, "Fill demo". `variant="outline"` or `variant="ghost"` with `color="neutral"`.
- **Destructive:** Delete. `color="error"`.
- **Ghost:** Low emphasis (View all, table actions). `variant="ghost" color="neutral"`.

Every button must have:

- **Hover state** — from Nuxt UI.
- **Active state** — from Nuxt UI.
- **Focus state** — visible focus ring; do not remove.
- **Disabled state** — when `disabled` or during `loading`.

Use sizes from component matrix only (e.g. default, `sm`, `xs` for tables).

---

## 4.6 Form layout rules

- **Default:** Vertical layout. Use `form-section` (or `space-y-5`) for field stack.
- **Multi-column:** Only when necessary (e.g. Issue date + Due date). Use `form-row` or `grid gap-4 sm:grid-cols-2`.
- **Field grouping:** Group related fields with a single section title (e.g. "Line items") and consistent spacing.
- **Submit row:** Use `form-actions` or `flex justify-end gap-2`; primary action on the right, Cancel/Secondary to its left. Align consistently across all forms.

---

## 4.7 Loading behavior

Forms must:

- **Disable submit** while processing (use `:loading="pending"` on UButton so it shows spinner and disables).
- **Show spinner in button** — use Nuxt UI loading state; do not add a separate spinner overlay unless specified.
- **Preserve layout** during loading — no collapse or jump; keep button in place with loading state.
- **Prevent double submission** — loading state disables the button.

Do not disable entire form (e.g. all inputs) unless required; submit button disabled + loading is sufficient.

---

## Summary

- One field structure: Label → Input → Helper (optional) → Error (conditional).
- Labels always visible; required/optional clear.
- Inputs: default height, token radius, focus/error/disabled from Nuxt UI.
- Errors: under field or one form-level alert; human-readable copy.
- Buttons: Primary / Secondary / Destructive / Ghost with hover, focus, disabled, loading.
- Layout: vertical default; `form-section` / `form-row` / `form-actions` from layer.
- Loading: submit button shows spinner and is disabled; layout stable.
