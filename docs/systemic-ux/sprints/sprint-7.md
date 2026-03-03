# Sprint 7 — Reduce Friction

**Source:** [../friction-map.md](../friction-map.md)

## Goals

- First field focused on key forms (login, register, client slideover) for keyboard users.
- No redundant exit controls; minimal scroll-to-submit where reasonable.
- Optional: invoice row click → view (one fewer click for View).

## Issue cluster

1. **No autofocus** — Login, register, client slideover don’t set focus to first field.
2. **New invoice: scroll to submit** — Long form; submit at bottom. Optional: sticky footer with "Create invoice" or ensure one line item + primary button are reachable without excessive scroll.
3. **New invoice: Back + Cancel** — Addressed in Sprint 4/6.
4. **View invoice** — Currently requires clicking "View" on row; optional to make row click navigate to detail.

## Implementation (minimal)

### 1. Autofocus first field

- **Login:** Focus email input when page is ready. Use `ref` on UInput and `onMounted` (or `nextTick` after mount) with `inputRef?.$el?.querySelector('input')?.focus()`, or native `autofocus` on the input if SSR-safe (e.g. only set in onMounted). If using Nuxt UI, check how to focus UInput (possibly expose ref to inner input).
- **Register:** Focus email or name (first field).
- **Client slideover:** When slideover opens, focus name field. Use `watch(slideoverOpen)` and when true, nextTick focus. May need to get focusable element from USlideover content.
- **Files:** `apps/web/app/pages/login.vue`, `apps/web/app/pages/register.vue`, `apps/web/app/pages/clients.vue` (slideover content).

### 2. Optional: sticky submit (New/Edit invoice)

- **Before:** User scrolls to bottom to click "Create invoice" or "Save changes".
- **After:** Consider sticky footer or floating action with primary button so it’s always visible. Alternatively leave as-is and only add autofocus/sections (Sprint 1) to reduce perceived friction. Document as "optional" in sprint if not doing.
- **Files:** `apps/web/app/pages/invoices/new.vue`, `apps/web/app/pages/invoices/[id]/edit.vue` — add sticky bar or leave unchanged.

### 3. Optional: invoice row click → view

- **Before:** User clicks "View" button on row.
- **After:** Make table row clickable (e.g. cursor pointer, @click on row to navigate to `/invoices/${row.id}`). Ensure Edit/Delete buttons don’t trigger row click (stopPropagation). Keep "View" button for accessibility or remove if row click is sufficient.
- **Files:** `apps/web/app/pages/invoices/index.vue` — row click handler; stopPropagation on action buttons.

## Test

- Login: Tab or load → email focused (or first focusable).
- Register: First field focused.
- Client slideover: On open, name field focused.
- Invoice list (optional): Click row → detail; Edit/Delete still work without navigating.

## Before/after impact

- Keyboard users can start typing immediately on login/register and client form.
- Optional: fewer clicks to view invoice; less scrolling for submit (if sticky added).
