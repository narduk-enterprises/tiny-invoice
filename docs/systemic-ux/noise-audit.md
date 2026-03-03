# Phase 4 — Noise & UI Clutter Audit

**Goal:** Remove UI that doesn't serve purpose. Audit decorative elements, redundant badges, excessive dividers, duplicate controls, rarely used buttons.

---

## Landing (index)

| Element | Actionable? | Informative? | If removed, clarity better? |
|---------|-------------|---------------|------------------------------|
| Hero background image | No | Mood only | Slightly less visual weight; hero still clear |
| Three feature cards (Create invoices, Manage clients, Track payments) | No | Repeats hero value prop in 3 blocks | **Yes.** One short list or single line could replace three cards |
| Three CTAs (Get started, Log in, Try demo) | Yes | — | Reducing to one primary + one secondary would reduce noise |
| Card icons (file-text, users, trending-up) | No | Redundant with card title | Minor; could remove for flatter cards |

**Decorative:** Hero image. **Redundant:** Feature cards repeat hero copy. **Duplicate controls:** Two primary-weight CTAs.

**Verdict:** Consolidate CTAs; consider collapsing or simplifying feature section.

---

## Login

| Element | Actionable? | Informative? | If removed, clarity better? |
|---------|-------------|---------------|------------------------------|
| UAlert "Try the demo" | No (informational) | Yes | Could be one line under form to reduce height |
| "Fill demo credentials" button | Yes | Convenience | Useful for demo; could be link to reduce weight |
| "Don't have an account? Register" | Yes (link) | Yes | Keep |

**Verdict:** Demo could be more compact; no major clutter.

---

## Register

| Element | Actionable? | Informative? | If removed, clarity better? |
|---------|-------------|---------------|------------------------------|
| Optional fields (Business name, Business address) | Yes | Yes | Keep; clearly optional |
| "Already have an account? Log in" | Yes | Yes | Keep |

**Verdict:** No noise.

---

## Dashboard

| Element | Actionable? | Informative? | If removed, clarity better? |
|---------|-------------|---------------|------------------------------|
| 4 stat cards with icons | No | Yes (numbers) | Icons add visual; could be minimal (number + label only) |
| "View all" in table header | Yes | Yes | Keep |
| Status badges in table | No | Yes | Keep |
| Empty state CTA | Yes | Yes | Keep |

**Verdict:** Icon per card is consistent, not noisy. No redundant badges or duplicate controls.

---

## Clients

| Element | Actionable? | Informative? | If removed, clarity better? |
|---------|-------------|---------------|------------------------------|
| Edit (pencil) + Delete (trash) per row | Yes | — | Both needed; Delete is destructive and secondary |
| Address column | No | Yes | May be long; consider truncate or optional column |

**Verdict:** No unnecessary controls. Address could truncate if needed.

---

## Invoices list

| Element | Actionable? | Informative? | If removed, clarity better? |
|---------|-------------|---------------|------------------------------|
| Status filter USelectMenu | Yes | Yes | Keep |
| View + Edit + Delete per row | Yes | — | All contextual; View could be row click to reduce buttons |
| Status badges | No | Yes | Keep |

**Verdict:** Three buttons per row is dense but each has a role. Consider "View" as row click and keep Edit/Delete as icons.

---

## New invoice / Invoice edit

| Element | Actionable? | Informative? | If removed, clarity better? |
|---------|-------------|---------------|------------------------------|
| "Back" / "Cancel" in header | Yes | — | Back vs Cancel: **Duplicate** (both leave). Keep one. |
| Subtotal / Tax / Total rows | No | Yes | Keep |
| USeparator before totals | No | Visual grouping | Could remove if spacing is enough |
| "Unit price (¢)" placeholder | — | Confusing (jargon) | **Change label;** not clutter but noise in meaning |
| Add line / Remove line per row | Yes | — | Keep |

**Duplicate controls:** Back and Cancel both exit. **Unnecessary tooltips:** None. **Excessive dividers:** One separator; acceptable.

---

## Invoice detail ([id])

| Element | Actionable? | Informative? | If removed, clarity better? |
|---------|-------------|---------------|------------------------------|
| Badge (status) | No | Yes | Keep |
| Back + Edit | Yes | — | Keep |
| Mark sent / Mark paid / Mark overdue | Yes | — | All contextual; **Mark overdue** is rare — could be in dropdown |
| From/To blocks | No | Yes | Keep |
| Issue/Due dates | No | Yes | Keep |

**Rare feature prominent:** "Mark overdue" same row as "Mark paid" — could be progressive disclosure.

---

## Settings

| Element | Actionable? | Informative? | If removed, clarity better? |
|---------|-------------|---------------|------------------------------|
| Two optional fields + Save | Yes | Yes | Keep |
| Success/error UAlert | No | Yes | Keep |

**Verdict:** No clutter.

---

## App shell (header + footer)

| Element | Actionable? | Informative? | If removed, clarity better? |
|---------|-------------|---------------|------------------------------|
| Logo + app name | Yes (link) | Yes | Keep |
| Nav links | Yes | Yes | Keep |
| Settings (user icon) | Yes | Yes | Keep |
| Logout | Yes | Yes | Keep |
| Color mode toggle | Yes | Yes | Keep |
| Mobile menu button | Yes | Yes | Keep |
| Footer: "TinyInvoice · Nuxt UI 4 · Cloudflare Workers · Year" | No | **Tech stack** | **Yes.** "Nuxt UI 4" and "Cloudflare Workers" are **technical jargon**; not user-facing value. Replace with product/copyright only. |

**Verdict:** Footer exposes implementation detail; remove or replace with neutral copy.

---

## Summary

| Category | Items |
|----------|--------|
| **Decorative** | Hero image (acceptable); card icons (mild) |
| **Extra icons** | Card icons on landing; stat card icons — consistent, not excessive |
| **Redundant status badges** | None; badges used where status matters |
| **Excessive dividers** | One USeparator on invoice form; fine |
| **Unnecessary tooltips** | None audited |
| **Duplicate controls** | Landing: 2 primary CTAs. New/Edit invoice: Back + Cancel. Invoice detail: Mark paid + Mark overdue (both prominent). |
| **Rarely used buttons** | "Mark overdue"; "Fill demo credentials" (demo only) |

**Remove or change:**
- Footer: drop "Nuxt UI 4 · Cloudflare Workers" for user-facing text (e.g. product name + copyright).
- Landing: one primary CTA; demote or merge "Try demo"; consider simplifying feature cards.
- New/Edit invoice: single "Cancel" or "Back" in header, not both.
- Invoice detail: consider moving "Mark overdue" to a "More" or secondary menu so "Mark paid" is unambiguously primary.
- New invoice: replace "Unit price (¢)" with "Unit price" (and/or show currency clearly without "(¢)".
