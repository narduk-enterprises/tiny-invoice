# Typography System

Heading and body scale. All pages must follow this hierarchy. No skipping heading levels (e.g. H1 → H3).

---

## Scale

| Role | Element / Class | Use |
|------|------------------|-----|
| **H1** | Page title (UPageHeader `title` / UPageHero `title`) | One per page. |
| **H2** | Section title inside page | Card section titles (e.g. "Recent invoices", "Line items"). Use `text-lg font-semibold` or a semantic H2 with same style. |
| **H3** | Subsection | Optional; e.g. "From" / "To" blocks can stay as labeled paragraphs. |
| **H4** | Minor subsection | Optional. |
| **Body** | Default text | No class; inherited. |
| **Small** | `text-sm` | Secondary info, table secondary, captions. |
| **Muted** | `text-muted` (with or without `text-sm`) | Labels, hints, "From"/"To" labels. |
| **Error text** | `text-error` + `text-sm` | Field error and form-level error message. |
| **Helper text** | `text-sm text-muted` | Under field, before error. |

---

## Hierarchy rules

1. **One H1 per page.** Provided by UPageHeader or UPageHero. Do not add another H1 in the template.
2. **Do not skip levels.** After H1 use H2, then H3, then H4. Do not go H1 → H3.
3. **Card/section titles:** Use H2 for the main title of a card (e.g. "Recent invoices"). If the component does not render a semantic heading, use `<h2 class="text-lg font-semibold">` or the Nuxt UI equivalent so the outline is correct.
4. **Stat labels (dashboard):** "Total revenue (paid)", "Outstanding" — can remain `<p class="text-sm text-muted">`; the value is `<p class="text-xl font-semibold">`. Not headings.

---

## Font families

- **Body / UI:** `--font-sans` (Inter from layer).
- **Headings / display:** `--font-display` (Outfit from layer). Applied to h1–h4 and `.font-display` in layer main.css.

No custom font overrides in app.

---

## Sizes (Tailwind / Nuxt UI)

- **Page title:** Handled by UPageHeader (typically large). Do not override unless design token.
- **Card/section title:** `text-lg font-semibold` or H2 with same.
- **Body:** default.
- **Small:** `text-sm`.
- **Large value (stats):** `text-xl font-semibold`.

---

## Error and helper text

- **Error:** Always use UFormField error slot or UAlert for form-level. Text must be human-readable (no generic "Invalid input"). Use `text-error` / Nuxt UI error color.
- **Helper:** Optional line under label, above error. Class: `text-sm text-muted`. Do not rely on color alone for errors (icon or text prefix if needed).

All pages must follow this hierarchy. Audit with an outline checker after changes.
