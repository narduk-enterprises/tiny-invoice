# UI Audit — TinyInvoice

Read-only audit of current UI. Every inconsistency is documented for remediation in later phases.

---

## 1. Button styles

| Location | Issue |
|----------|--------|
| **Variants** | Mix of default (solid), `outline`, `ghost`, `soft` without a consistent rule (e.g. primary CTA vs secondary vs danger). |
| **Sizes** | `size="sm"` (dashboard View all, invoice [id] actions), `size="xs"` (table actions, badges), default — no single scale. |
| **Layout** | Submit: sometimes `block` (login, register), sometimes inline (settings, clients slideover, invoice new/edit). |
| **Icon + label** | Index hero: icon + label; Clients: "Add client" with icon; Invoices: "New invoice" with icon; some buttons icon-only (table edit/delete) — acceptable for tables but not standardized. |
| **Destructive** | Delete uses `color="error"` consistently; Cancel uses `variant="ghost" color="neutral"` — good. |

**Summary:** Button variant/size/layout choices are ad-hoc. Need a single matrix: Primary / Secondary / Ghost / Destructive and when to use each.

---

## 2. Input layouts

| Location | Pattern | Inconsistency |
|----------|---------|----------------|
| Login, Register | `<div class="space-y-4">` wrapping fields | Vertical gap 1rem; no use of layer `form-section` (1.25rem). |
| Settings | `space-y-4` | Same. |
| Clients slideover | `<div class="p-4 space-y-4">` | Extra `p-4` on wrapper; slideover content padding duplicated. |
| Invoice new/edit | `space-y-6` for form, `grid gap-4 sm:grid-cols-2` for date row, `grid gap-2` for line items | Different rhythm (1.5rem) from rest of app (1rem). |
| Line items | `grid grid-cols-12 gap-2` | Tight gap-2; other forms use gap-4 or space-y-4/6. |

**Summary:** No single spacing scale. Layer defines `form-section` (gap 1.25rem), `form-row` (gap 1.25rem), but app uses raw `space-y-4` / `space-y-6` / `gap-2` / `gap-4`. Inputs not wrapped in a shared field wrapper (label + input + helper + error) except via UFormField.

---

## 3. Label placement

| Location | Observation |
|----------|-------------|
| All forms | `UFormField` with `label` prop — labels are visible and above/associated. Good. |
| Optional fields | Register: "Business name (optional)", "Business address (optional)"; Clients: "Address", "Phone" without "(optional)". Inconsistent. |
| Required | `required` prop used on UFormField; asterisk/indicator from Nuxt UI — consistent. |

**Summary:** Labels are present and not placeholder-only. Optional vs required labeling is inconsistent; standardize "(optional)" or helper text.

---

## 4. Card spacing

| Location | Pattern | Inconsistency |
|----------|---------|----------------|
| Dashboard | `UCard` + direct content (no inner wrapper) | Relies on UCard default padding. |
| Login, Register | `UCard` with form as direct child | No explicit content padding class. |
| Settings | `UCard` with form | Same. |
| Clients | `UCard` for table; `USlideover` with `<div class="p-4 space-y-4">` | Slideover uses custom p-4. |
| Invoices list | `UCard` with `mb-4` filter row + table / empty state | Card inner spacing mixed (mb-4 vs py-12). |
| Invoice [id], edit, new | `UCard` with mixed `mb-6`, `mt-6`, `gap-6` | Card content uses mb-6/mt-6; no single card content padding. |
| Modals | `max-w-sm p-4 space-y-4` inside #content | Modal content padding p-4. |

**Summary:** Card/slideover/modal content padding is ad-hoc (p-4, or UCard default, or mb-6/mt-6). No single "card padding" or "modal content padding" token.

---

## 5. Modal structure

| Pattern | Used in |
|---------|--------|
| `UModal` #content → `div.max-w-sm p-4 space-y-4` → copy, UAlert (conditional), `div.flex gap-2 justify-end` with Cancel + Delete | Clients delete, Invoices delete |

**Summary:** Delete modals are consistent (max-w-sm, p-4, space-y-4, flex justify-end). Good. Slideover uses `p-4 space-y-4` — same padding idea but different component.

---

## 6. Page padding

| Location | Pattern |
|----------|--------|
| app.vue | Main: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`. Header/footer: same horizontal, no vertical on header; footer `py-6`. |
| Pages | No extra page-level padding; UPage wraps content. |

**Summary:** Page padding is centralized in app.vue. Consistent. No drift.

---

## 7. Heading hierarchy

| Location | Usage |
|----------|--------|
| All pages | `UPageHeader` with `title` and optional `description`. No explicit H1 in templates (component likely emits it). |
| Index | `UPageHero` title + description. |
| Dashboard cards | No card title as heading; stat label is "Total revenue (paid)" etc. (paragraph). |
| Dashboard "Recent invoices" | `#header` slot: `<span class="font-semibold">` — not a heading level. |
| Index feature cards | `#header`: icon + `<span class="font-semibold">` — not semantic heading. |
| Invoice [id] | "From" / "To" as `<p class="text-sm text-muted">` then `<p class="font-medium">`. |

**Summary:** Page titles come from UPageHeader/UPageHero. Card/section titles are `font-semibold` spans, not H2/H3 — hierarchy and accessibility (outline) not enforced. Risk of skipping levels if H1 is inside UPageHeader.

---

## 8. Colors

- **Token usage:** `text-muted`, `text-primary`, `bg-primary`, `bg-success/10`, `bg-info/10`, `bg-elevated`, `border-default`, etc. No hex/rgb in app. Good.
- **Badges:** `invoiceStatusColor()` maps status to Nuxt UI color; UBadge `variant="subtle"` and sometimes `size="xs"`. Consistent.

**Summary:** No inconsistent or hardcoded colors found.

---

## 9. Border radius and shadow

- Cards: `card-base` used on all UCard (layer: `--radius-card`, `--shadow-card`). Consistent.
- No arbitrary `rounded-*` or `shadow-*` in app beyond card-base.

**Summary:** No drift.

---

## 10. Misaligned grids

| Location | Grid | Issue |
|----------|------|--------|
| Dashboard | `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` | gap-4. |
| Index | `grid gap-8 sm:grid-cols-2 lg:grid-cols-3` | gap-8 and 3 columns — different from dashboard. |
| Invoice [id] | `grid gap-6 sm:grid-cols-2` | gap-6. |
| Invoice forms | `grid gap-4 sm:grid-cols-2` for dates; `grid grid-cols-12 gap-2` for line items | Two different gap values. |
| Invoices list | `mb-4 flex flex-wrap items-center gap-2` for filter | Not a grid; flex with gap-2. |

**Summary:** Grid gap scale is mixed: gap-2, gap-4, gap-6, gap-8. Column counts (2, 3, 4, 12) are context-dependent but gap should come from a single scale.

---

## 11. Form-specific

- **Schema validation:** Login, Register, Clients use Zod + `UForm :schema`; Settings and Invoice new/edit use `UForm :state` only (no schema) — validation messages and error placement differ (field-level vs top-of-form UAlert).
- **Error placement:** Form-level error: UAlert above or between fields and submit. Not always directly under the offending field (Zod can show per-field errors via UFormField; custom validation in invoice forms only shows one global error).
- **Helper text:** Rare. No consistent "helper text under field" pattern.
- **Loading:** Submit buttons use `:loading="pending"` or `:loading="saving"` — good. No spinner placement inconsistency.
- **Double submit:** Buttons disabled or loading; no obvious double-submit risk.

**Summary:** Form validation approach is split (Zod vs manual); error and helper UX not fully standardized.

---

## 12. Empty and loading states

| State | Pattern | Inconsistency |
|-------|---------|----------------|
| Loading | Dashboard: skeleton cards. Clients, Invoices list, Invoice [id], Invoice edit: `py-12` + spinner or "Loading…". Invoice new: `py-8` + "Loading clients…". | Mix of skeleton vs spinner vs text; py-8 vs py-12. |
| Empty | Clients: `py-12 text-center text-muted` + "No clients yet." + button `mt-2`. Invoices list: same. Dashboard: `py-8 text-center text-muted text-sm` for "No invoices yet." | py-8 vs py-12; dashboard uses text-sm. |

**Summary:** Empty and loading states use different vertical spacing (py-8 vs py-12) and different treatments (skeleton vs spinner vs text). Should be one "empty state" and one "loading state" pattern.

---

## 13. Summary checklist (regression)

- **Hardcoded colors:** None.
- **Inconsistent padding:** Yes — p-4, py-8, py-12, mb-4, mb-6, mt-8, space-y-4, space-y-6, gap-2, gap-4, gap-6, gap-8.
- **Missing focus states:** Delegated to Nuxt UI; not audited in DOM.
- **Unlabeled inputs:** No; UFormField used.
- **Missing loading states:** Submit buttons have loading; page-level loading present but pattern inconsistent.
- **Placeholder-only labels:** No.
- **Mismatched button variants:** Yes — variant/size/layout not from a single matrix.
- **Inconsistent error messaging:** Form-level UAlert consistent; per-field and "optional" labeling inconsistent.

---

**Next:** Phase 2 (spacing system), Phase 3 (typography), Phase 4 (form standards), Phase 5 (component matrix), Phase 6 (interaction rules), Phase 7 (sprint execution).
