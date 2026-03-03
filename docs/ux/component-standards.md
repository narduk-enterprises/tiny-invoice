# Component Standards

**Stack:** Nuxt UI v4 (@nuxt/ui). Token + variant first; no one-off CSS unless justified.

---

## 1. Buttons

| Context | Variant | Color | Size | Notes |
|---------|---------|--------|------|--------|
| Primary CTA | default | `primary` | default or `sm` | “Get started”, “Save”, “Create invoice” |
| Secondary / cancel | `ghost` or `outline` | `neutral` | same as context | “Back”, “Cancel”, “View all” |
| Danger | default or `outline` | `error` | `xs` in tables | Delete, “Mark overdue” |
| In-table actions | `ghost` | `neutral` or `error` | `xs` | View, Edit, Delete |
| Link-style | `link` or `ghost` | `primary` | — | “Log in”, “Register” |

Use `UButton` with `to` for navigation; `icon="i-lucide-*"` for icon. No custom hex or arbitrary classes for color.

---

## 2. Forms

- **Form container:** `UForm` with `:schema` (Zod) when validation needed; `:state` for v-model bindings.
- **Fields:** `UFormField` + `label`, `name`, `required`; content: `UInput`, `UTextarea`, `USelectMenu`, etc.
- **Layout:** Prefer `.form-section` (or `space-y-4`) between groups; `.form-row` for two-column on sm+; `.form-actions` for submit row.
- **Errors:** `UAlert color="error"` for form-level errors; no `alert()`.
- **Submit:** Single primary `UButton type="submit"` with `:loading="pending"`; secondary actions (Cancel, “Fill demo”) as separate buttons.

Cards: wrap form in `UCard class="card-base"`; use `max-w-md` / `max-w-lg` for narrow forms (login, register, settings).

---

## 3. Cards

- **Standard content card:** `UCard class="card-base"`. Use slot `#header` for title + optional actions.
- **Dashboard stat cards:** `UCard class="card-base"` with icon (e.g. `bg-success/10` + `UIcon`), label (`text-muted`), value (`text-xl font-semibold`).
- **Lists inside cards:** Table or list in default slot; header with “View all” or primary action in `#header`.

Avoid inline `box-shadow` or `border-radius`; use `card-base` or Nuxt UI props.

---

## 4. Tables

- **Component:** `UTable` with `:data` and `:columns`. Columns: `accessorKey` + `header`; optional `id` for custom cells.
- **Custom cells:** Use `#<accessorKey>-cell="{ row }"` (e.g. `#status-cell`, `#total-cell`, `#actions-cell`).
- **Status:** Shared semantic: `success` (paid), `error` (overdue), `info` (sent), `neutral` (draft). Use `UBadge variant="subtle" size="xs"`.
- **Money:** Use composable `formatCents()` in cell template; no inline formatting.
- **Actions column:** `id: 'actions', header: ''`; cell with ghost/outline buttons (View, Edit, Delete). Prefer modal confirm over `confirm()`.

Define column arrays with proper typing; avoid `as any` where possible (use shared column configs or typed helpers).

---

## 5. Alerts and feedback

- **Inline error:** `UAlert color="error" :title="error"` (e.g. form errors).
- **Success:** `UAlert color="success" title="…"` (e.g. “Settings saved”).
- **Info / hint:** `UAlert color="primary" variant="soft"` (e.g. “Try the demo”).
- **Destructive confirm:** Use `UModal` + confirm/cancel buttons instead of `confirm()`; errors in `UAlert` or toast, not `alert()`.

---

## 6. Loading and empty states

- **Loading:** Prefer skeleton (same layout as content) over spinner-only. If spinner: `UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted"` in a centered container; or “Loading…” text for tables.
- **Empty list:** Single message (e.g. “No invoices yet.”) + primary CTA (e.g. “Create your first invoice”). Reuse pattern across invoices, clients, dashboard recent list.
- **Not found:** Dedicated message + “Back” or “Go home”; set 404 status when appropriate.

---

## 7. Navigation and layout

- **Page shell:** `UPage`, `UPageHeader` (title + description + optional `#links`), then content.
- **Links in header:** `UButton to="..."` for “Back”, “New invoice”, “Edit”.
- **Lists:** Prefer consistent “New X” in header links slot; filters (e.g. status) above table, optionally synced to URL.

---

## 8. Icons

- **Library:** Lucide via `i-` prefix: `i-lucide-file-text`, `i-lucide-users`, `i-lucide-loader-2`, etc.
- **Usage:** `UIcon name="i-lucide-*"` or `UButton icon="i-lucide-*"`. Size: `size-4`, `size-5`, `size-8` as needed.

No inline SVG or other icon sets unless required.

---

## 9. Accessibility

- **Labels:** Every form field via `UFormField` with `label` and `name`; required fields `required`.
- **Buttons:** Icon-only buttons get `aria-label` (e.g. “Toggle color mode”, “Toggle menu”, “Delete”).
- **Skip link:** Preserved in app shell: “Skip to content” for main content.
- **Focus:** Rely on Nuxt UI focus styles; avoid removing outline without replacement.
- **Dialogs:** Use `UModal` / `USlideover` so focus is trapped and keyboard-accessible; no `confirm()`/`alert()` for critical flows.

---

## 10. Status badge helper (shared)

Centralize status → color mapping for invoices (and similar):

- `draft` → `neutral`
- `sent` → `info`
- `paid` → `success`
- `overdue` → `error`

Use in dashboard, invoice list, invoice detail (and any future status lists). Prefer composable or shared util so column configs and templates stay DRY.
