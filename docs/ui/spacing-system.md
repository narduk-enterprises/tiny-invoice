# Spacing System

One spacing rhythm. All values map to the Tailwind/Nuxt UI spacing scale (rem-based). No arbitrary spacing (e.g. no `p-[13px]`, `gap-3.5` unless it maps to a token below).

---

## Scale (Tailwind tokens)

Use only these spacing values:

| Token | Value | Use |
|-------|--------|-----|
| `1` | 0.25rem (4px) | Tight inline (icon + label gap when needed) |
| `2` | 0.5rem (8px) | Button groups, compact controls, table cell padding |
| `3` | 0.75rem (12px) | Small stack, list item gap |
| `4` | 1rem (16px) | **Default field/stack gap**, page horizontal padding (mobile) |
| `5` | 1.25rem (20px) | Form section gap (between field groups), card internal rhythm |
| `6` | 1.5rem (24px) | Section separation within a card, grid gap (medium) |
| `8` | 2rem (32px) | Section separation between page sections (e.g. dashboard blocks) |
| `12` | 3rem (48px) | Empty state / loading state vertical padding |

---

## Page padding

- **Horizontal:** `px-4 sm:px-6 lg:px-8` (already in app shell). Do not add extra horizontal padding on pages unless in a narrow column.
- **Vertical (main content):** `py-8`. Do not use `py-6` or `py-10` for main — stick to `py-8`.
- **Max width:** `max-w-7xl` for app shell; page-level narrow content (forms, single card) uses `max-w-md`, `max-w-lg`, or `max-w-3xl` as defined in component matrix.

---

## Card padding

- **Card content:** Use a single inner wrapper with `p-5` (1.25rem) for standard card body content. If the card has a header slot, the body wrapper still uses `p-5`; no mixed `p-4`/`p-6`.
- **Card with table:** Card header (if any) + table full-width; table has its own cell padding. Optional wrapper around table: `p-5` only if there is no header and content is not a full-bleed table.
- **Exception:** Modal/slideover content: use `p-5` for the content wrapper (replace current `p-4`).

---

## Vertical stack spacing

- **Between form fields (single column):** `space-y-5` or class `form-section` (layer: gap 1.25rem = 5). Replace all `space-y-4` and `space-y-6` in forms with `form-section` or `space-y-5`.
- **Between sections inside a card (e.g. two blocks):** `space-y-6` or explicit `mb-6` on first block.
- **Between page-level sections (e.g. dashboard stats + table):** `mt-8` or `space-y-8`. Use one consistently (e.g. always `mt-8` for second section).

---

## Grid gap scale

- **Default grid gap:** `gap-4`. Use for: dashboard stat cards, invoice form date row, filter row.
- **Tighter (tables, line items):** `gap-2` only for: inline controls, line item columns, modal button row.
- **Wider (landing feature cards, two-column blocks):** `gap-6` or `gap-8`. Prefer `gap-6` for within-card two-column; `gap-8` for page-level card grids (e.g. index).

Allowed: `gap-2`, `gap-4`, `gap-6`, `gap-8`. Do not use `gap-3`, `gap-5`, `gap-7`, or arbitrary values.

---

## Form field spacing

- **Between fields:** `form-section` (1.25rem) or `space-y-5`. Same as vertical stack.
- **Between label and input:** Handled by UFormField; no extra class.
- **Between form and submit row:** Use `form-actions` (layer) or `pt-2` + `flex justify-end gap-2`. Submit row gap: `gap-2`.

---

## Section separation

- **Same page, two major blocks (e.g. stats then table):** `mt-8` or `space-y-8`.
- **Within one card, two logical sections:** `space-y-6` or `mb-6` + next block.

---

## Empty and loading states

- **Vertical padding for "empty" or "loading" block:** `py-12` only. Remove `py-8` for these so all empty/loading states are consistent.

---

## Mapping to layer classes

- Use **form-section** for form field stacks (replaces ad-hoc `space-y-4`/`space-y-6`).
- Use **form-row** for two-column field rows (already gap 1.25rem; matches).
- Use **form-actions** for submit row (flex-end, gap 0.75rem, pt 0.5rem).

No arbitrary spacing allowed. If a value is needed that is not in the scale above, add it to this doc first and use the corresponding Tailwind token.
