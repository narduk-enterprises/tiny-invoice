---
description: Human sense & reasonableness audit — detect UX that violates basic human expectation
---

# ANTIGRAVITY WORKFLOW — HUMAN SENSE & REASONABLENESS AUDIT

Systematically detect and eliminate UX decisions that violate basic human expectation.

**Problems this workflow catches:**
- Things that look clickable but aren’t
- Things that are clickable but don’t look it
- Duplicate concepts (e.g. Home vs Dashboard)
- Logged-out users seeing logged-in navigation
- Dead-end screens
- Inconsistent naming
- Buttons that don’t do what they imply
- UI that requires explanation
- States that don’t guide next action
- Navigation that feels redundant
- Controls that appear in the wrong context
- Surfaces that violate mental model

**Core principle:** If a normal human pauses and thinks “Why is that there?”, “Why isn’t this clickable?”, “Where am I?”, “What do I do now?”, “Why does this exist?”, or “Did that work?” — the UX failed.

**Success criteria:**

| Category         | Requirement |
|------------------|-------------|
| Predictability   | Users can guess behavior before interacting |
| Consistency      | Same concepts behave the same everywhere |
| Clarity          | Each screen has obvious purpose |
| State Awareness  | Auth, empty, loading, error states make sense |
| Context Integrity| UI reflects user state accurately |
| Redundancy       | No duplicate concepts in navigation |

---

## 1. Navigation & auth state (context integrity)

- **Logged-out users must not see app-only nav.** Nav should hide Dashboard, Clients, Invoices, Settings when `user` is falsy; only public entry points (e.g. Home, Login, Register) should show.
  // turbo
  `grep -n "user\.value\|user)" apps/web/app/app.vue apps/web/app/layouts/*.vue 2>/dev/null | head -20`
- **No duplicate concepts.** If both “Home” and “Dashboard” exist, confirm they have distinct purposes and labels; otherwise consolidate or rename so one concept = one destination.
  // turbo
  `grep -rn "Dashboard\|Home" apps/web/app/app.vue apps/web/app/pages/index.vue apps/web/app/pages/dashboard.vue 2>/dev/null | head -30`

## 2. Clickability & affordance

- **Elements that look like links/buttons must be interactive.** Search for `cursor-pointer`, `hover:`, or link-like styling on non-interactive elements (`<span>`, `<div>`) that have no `@click`, `to`, or `href`.
  // turbo
  `grep -rn "cursor-pointer\|hover:underline\|hover:bg-" apps/web/app --include="*.vue" | head -40`
- **Interactive elements must look interactive.** Buttons and links should use `UButton`, `ULink`, or `NuxtLink` (or equivalent) with clear variants; avoid raw `<div @click>` that look like static text.
  // turbo
  `grep -rn "@click\|@submit" apps/web/app --include="*.vue" | grep -v "UButton\|ULink\|NuxtLink\|UBadge\|USelect\|UForm" | head -20`

## 3. Naming & consistency

- **Same concept, same label.** e.g. “Invoices” vs “Invoice list” vs “My Invoices” — pick one and use everywhere (nav, page title, breadcrumbs).
  // turbo
  `grep -rn "Invoice\|Client\|Dashboard\|Settings" apps/web/app/pages apps/web/app/app.vue --include="*.vue" | head -50`
- **Button labels must match action.** “Save” should persist; “Cancel” should abandon; “Submit” should submit. No “OK” for destructive actions; no “Delete” that actually archives.
  // manual
  Review every primary/secondary button label in forms and modals against the actual handler.

## 4. Dead ends & next action

- **Every screen should suggest a clear next action** (or clearly state there is none). Empty states need “Create first X” or “Go to Y”; error states need “Retry” or “Go back”; success states need “View X” or “Continue”.
  // manual
  For each page, check: empty list, error, loading, and success. Ensure at least one obvious next step or message.
- **No orphan routes.** Every page should be reachable from somewhere (nav, link from another page, or redirect). Check for pages that are never linked.
  // turbo
  `grep -rln "to=\|href=\|navigateTo" apps/web/app --include="*.vue" | xargs -I {} sh -c 'echo "=== {} ===" && grep -o "to=[\"'\''][^\"'\'']*[\"'\'']\|href=[\"'\''][^\"'\'']*[\"'\'']\|navigateTo([\"'\''][^\"'\'']*[\"'\'']" {}' 2>/dev/null | head -60`

## 5. Redundant or wrong-context controls

- **Controls only where they make sense.** e.g. “Edit” on a list row is correct; “Edit” on a 404 page is wrong. No “Create invoice” in the middle of login.
  // manual
  Walk each route: confirm primary actions match the page purpose and user state.
- **Navigation matrix.** Document which nav items appear for guest vs logged-in; ensure no “Dashboard” for guests and no “Login” in main nav when already logged in (or clearly as “Switch account”).
  // manual
  Compare `navItems` (or equivalent) for `user === null` vs `user !== null`.

## 6. Mental model & clarity

- **Page purpose is obvious.** Title and first visible content should answer “What is this?” without reading docs.
  // turbo
  `for f in apps/web/app/pages/**/*.vue; do echo "=== $f ==="; grep -E "useSeo|title|heading|<h1" "$f" 2>/dev/null | head -5; done`
- **No UI that requires explanation.** If a control or section would need a tooltip or doc to be understood, simplify or relabel.

---

## FOLDER STRUCTURE

No new folders required. The audit runs over:

- `apps/web/app/app.vue` — shell, nav, auth-gated UI
- `apps/web/app/pages/**/*.vue` — every route
- `apps/web/app/layouts/*.vue` — if present
- `apps/web/app/components/**/*.vue` — shared UI that affects affordance and consistency

Run from repo root. Use `// turbo` commands in `apps/web` or with paths as shown.
