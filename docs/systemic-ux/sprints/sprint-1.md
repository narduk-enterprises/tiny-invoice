# Sprint 1 — Reduce Cognitive Overload

**Source:** [../cognitive-load-audit.md](../cognitive-load-audit.md)

## Goals

- One clear primary CTA per screen where applicable.
- No competing primary-weight actions.
- Reduce repeated blocks and long unstructured form sections where possible.

## Issue cluster

1. **Landing: 3 CTAs (Get started, Log in, Try demo)** — Two primary-style buttons; user may hesitate.
2. **Landing: 3 feature cards** — Same structure repeated; could be one list or shorter section.
3. **Invoice detail (status = sent): Mark paid vs Mark overdue** — Both visible; destructive (overdue) competes with primary (paid).
4. **New/Edit invoice: Long form** — No section headings; "Unit price (¢)" is jargon.

## Implementation (minimal)

### 1. Landing CTAs

- **Before:** Get started (primary), Log in (outline), Try demo (soft primary).
- **After:** Single primary: "Get started". Secondary: "Log in". Demo as link or small text: "Or try the demo" → `/login?demo=1`.
- **Files:** `apps/web/app/pages/index.vue` — reduce to two buttons; make demo a text link or tertiary control.

### 2. Landing feature cards (optional)

- **Before:** Three cards (Create invoices, Manage clients, Track payments) with icon + title + paragraph.
- **After:** Either keep three with clearer visual hierarchy, or replace with one compact list (e.g. bullet list or single row of labels). Prefer minimal change: just ensure hero is the main focus and cards are visually subordinate.

### 3. Invoice detail: Mark overdue

- **Before:** When status = sent, two buttons: "Mark paid" (success), "Mark overdue" (outline error).
- **After:** "Mark paid" remains primary. "Mark overdue" moved to dropdown (e.g. "More" or "⋮") or secondary row so it doesn’t compete. See also [sprint-4.md](./sprint-4.md).

### 4. New/Edit invoice: Structure and label

- **Before:** Long form; placeholder "Unit price (¢)".
- **After:** Add brief section labels (e.g. "Client & dates", "Line items", "Totals") if not present. Change "Unit price (¢)" to "Unit price" (and document in API/layer that values are in cents if needed). See also [sprint-3.md](./sprint-3.md) (trust).

## Test

- Landing: One obvious primary CTA; demo still reachable.
- Invoice detail (sent): Mark paid is primary; Mark overdue not competing.
- New invoice: Sections/labels and unit label feel clear.

## Before/after impact

- **Landing:** User identifies primary task (sign up) in &lt;3s; less hesitation between buttons.
- **Invoice detail:** Fewer misclicks on "Mark overdue"; primary action obvious.
- **New/Edit invoice:** Clearer structure; no technical "(¢)" in label.
