# Component Matrix

Consistent usage across the entire UI. Each component defines allowed variants and when to use / when not to use. No improvisation.

---

## Buttons (UButton)

| Variant | Color | When to use | When NOT to use |
|---------|--------|-------------|-------------------|
| **default (solid)** | primary | Primary CTA: Submit, Save, Create invoice, Get started, Register | Secondary actions, navigation |
| **default** | error | Destructive CTA: Delete (in modals) | Table delete icon (use ghost) |
| **outline** | neutral | Secondary: Cancel, Back, Logout (header) | Primary submit |
| **outline** | primary | Optional secondary emphasis | Prefer ghost for low emphasis |
| **ghost** | neutral | Low emphasis: View all, table View/Edit, Cancel in slideover, Settings icon | Primary or destructive |
| **ghost** | error | Table row delete (icon-only) | Modal Delete (use solid error) |
| **soft** | primary | Optional: "Try demo" style | Default for most CTAs |

**Sizes:** default (form submit, page CTAs), `sm` (card header "View all", invoice status actions), `xs` (table action icons). Do not use custom sizes.

**Layout:** `block` only for single full-width submit (e.g. login). Otherwise default inline.

---

## Inputs (UInput, UTextarea)

| Type | When to use | When NOT to use |
|------|-------------|------------------|
| **UInput** text/email/password/number/date | Single-line text, email, password, number, date | Multi-line (use UTextarea) |
| **UTextarea** | Address, notes, long text | Short single line |

**Rules:** Always inside UFormField with `label` and optional `name`/`required`. Add `class="w-full"` for full-width. Use placeholder for hint only; label is primary. No custom height/radius beyond tokens.

---

## Select (USelectMenu)

| Use | When | When NOT |
|-----|------|-----------|
| **USelectMenu** | Single selection from list (client picker, status filter) | Free-text input; use UInput. Multi-select; use only if defined. |

**Rules:** Wrap in UFormField when in a form. Use `value-attribute` and consistent `items` shape. Placeholder/label from UFormField.

---

## Toggles / Checkboxes / Radio

| Component | When to use | When NOT |
|-----------|-------------|----------|
| **USwitch** | Boolean setting (e.g. feature flag) | Multiple exclusive options (use radio/select) |
| **Checkbox** | Multi-select from few options | Single select (use USelectMenu) |
| **Radio group** | Few exclusive options (2–5) | Many options (use USelectMenu) |

Current app: no toggles/checkbox/radio in audited pages. When added, use Nuxt UI components only; document variant here.

---

## Cards (UCard)

| Use | When | When NOT |
|-----|------|----------|
| **UCard** + `card-base` | All card surfaces: dashboard stats, tables, forms (login, settings), invoice detail, feature cards | Raw div for layout only |
| **Content padding** | Inner wrapper `p-5` for body content (see spacing-system.md) | Mixed p-4/p-6 or no wrapper |

**Header:** Use `#header` slot for card title. Prefer semantic H2 or `font-semibold` consistent with typography system.

---

## Tables (UTable)

| Use | When | When NOT |
|-----|------|----------|
| **UTable** | Tabular data: clients, invoices, line items | Layout (use grid/flex) |
| **Columns** | Define via `columns`; use `accessorKey` and custom `#*-cell` slots for badges/formatting | Inline HTML tables |

**Actions column:** Use `id: 'actions', header: ''` and slot `#actions-cell`. Buttons: ghost neutral (View/Edit), ghost error (Delete), size `xs`.

---

## Alerts (UAlert)

| Variant | When to use | When NOT |
|---------|-------------|----------|
| **color="error"** | Form-level error message; modal error | Field-level (prefer UFormField error) |
| **color="success"** | Success feedback (e.g. "Settings saved.") | For validation success on single field (optional) |
| **color="primary"** variant="soft" | Informational (e.g. "Try the demo") | Errors, success |

**Placement:** Above submit row in form; inside modal/slideover when error/success. Use `class="text-sm"` for consistency.

---

## Badges (UBadge)

| Use | When | When NOT |
|-----|------|----------|
| **variant="subtle"** | Status (invoice status, etc.) | Strong emphasis (use button) |
| **size="xs"** | In tables, compact areas | Page-level title badge |
| **color** | From design (e.g. invoiceStatusColor) | Arbitrary colors |

---

## Modals (UModal)

| Use | When | When NOT |
|-----|------|----------|
| **UModal** | Confirmations (delete), focused single task | Long forms (use USlideover or page) |
| **#content** | One wrapper: `max-w-sm p-5 space-y-5` (or form-section), then copy, alert, actions | Multiple unrelated blocks |

**Actions:** `flex justify-end gap-2`; Cancel (ghost neutral), primary action (e.g. Delete, color="error"). Use `:disabled="deletePending"` and `:loading="deletePending"` on Delete.

---

## Drawers / Slideover (USlideover)

| Use | When | When NOT |
|-----|------|----------|
| **USlideover** | Form in side panel (e.g. Add/Edit client) | Simple confirm (use UModal) |
| **Content** | Wrapper `p-5` + form with `form-section` | Mixed padding |

---

## Tooltips

| Use | When | When NOT |
|-----|------|----------|
| **Tooltip** (Nuxt UI) | Icon-only buttons (e.g. table edit/delete): use `aria-label`; add tooltip if needed for clarity | Labeled buttons; redundant with visible text |

Current app: aria-label on icon buttons. Tooltips optional; if added, use Nuxt UI pattern only.

---

## Links (ULink)

| Use | When | When NOT |
|-----|------|----------|
| **ULink** | In-page navigation (Register, Log in, Create one) | Submit actions (use UButton) |
| **Styling** | Default or `class="text-primary font-medium"` for emphasis | Button-style links without need for button |

---

## Separator (USeparator)

| Use | When | When NOT |
|-----|------|----------|
| **USeparator** | Visual break between form sections (e.g. before total row) | Between every field |

---

## Summary

- **Buttons:** Primary / outline neutral / ghost neutral / ghost or solid error; sizes default, sm, xs only.
- **Inputs:** UFormField + UInput/UTextarea; w-full; no placeholder-only labels.
- **Select:** USelectMenu in forms with UFormField.
- **Cards:** UCard + card-base; inner p-5.
- **Tables:** UTable; actions column with xs ghost buttons.
- **Alerts:** error/success/primary soft; form-level or modal.
- **Badges:** subtle, xs in tables; color from tokens.
- **Modals:** max-w-sm, p-5, consistent actions row.
- **Slideover:** p-5, form-section.
- No component improvisation; use only these variants and patterns.
