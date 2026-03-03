# Phase 1 — Cognitive Load Audit

**Goal:** Reduce mental strain. Document primary/secondary actions, competing elements, density, and irrelevant or repeated UI.

---

## Landing (index)

| Metric | Count / Notes |
|--------|----------------|
| Primary actions | **3** — Get started, Log in, Try demo (competing) |
| Secondary actions | 0 in hero; 3 feature cards are read-only |
| Competing visual elements | Hero + 3 cards with icons; three equal-weight CTAs |
| Density | Low; hero dominates |
| Irrelevant information | Feature cards repeat value prop already in hero description |
| Repeated UI blocks | 3 identical card structures (icon + title + short text) |
| Unnecessary options | "Try demo" vs "Log in" — both lead to login; demo is convenience, not a separate task |

**Can user identify primary task in 3s?** Partially. Hero says "Invoicing made simple" but three buttons compete: Get started (primary), Log in (outline), Try demo (soft primary).

**Visually competing with primary?** Yes. "Get started" and "Try demo" are both primary-style; "Log in" is outline. Two primary-weight CTAs.

**Controls rarely used?** Feature cards are non-actionable; they inform only.

**Flags:**
- **More than 1 primary CTA:** Get started + Try demo both draw attention.
- **Repeated UI blocks:** Three identical card patterns add scanning load without distinct choices.

**Recommendations:**
- Single primary CTA: "Get started" (register). Secondary: "Log in". Demo as link or small text: "Or try the demo" linking to login with demo param.
- Consider collapsing or shortening feature cards, or making them visually subordinate (e.g. simple list or single line).

---

## Login

| Metric | Count / Notes |
|--------|----------------|
| Primary actions | 1 — Log in (submit) |
| Secondary actions | Fill demo credentials, Register link |
| Competing visual elements | UAlert "Try the demo" + form; both prominent |
| Density | Low–medium; one card |
| Irrelevant information | Demo alert is helpful but takes space; could be one line |
| Repeated UI blocks | — |
| Unnecessary options | "Fill demo credentials" duplicates info in alert |

**Can user identify primary task in 3s?** Yes. "Log in" title and single submit button.

**Visually competing?** Demo alert is same card as form; secondary but visible. Fill demo button competes slightly with submit.

**Rarely used?** "Fill demo credentials" is for demo flow only; most users won't use it.

**Flags:**
- None critical. Consider de-emphasizing demo (e.g. single line under form) for non-demo users.

---

## Register

| Metric | Count / Notes |
|--------|----------------|
| Primary actions | 1 — Register (submit) |
| Secondary actions | Log in link |
| Competing visual elements | None significant |
| Density | Medium; 5 fields (2 optional) |
| Irrelevant information | — |
| Repeated UI blocks | — |
| Unnecessary options | — |

**Can user identify primary task in 3s?** Yes. "Create account" and one submit.

**Flags:** None.

---

## Dashboard

| Metric | Count / Notes |
|--------|----------------|
| Primary actions | 1 — "Create your first invoice" when empty; "View all" when list exists (secondary) |
| Secondary actions | View all (invoices), row navigation implicit in table |
| Competing visual elements | 4 stat cards + 1 table/card; all visible at once |
| Density | Medium–high; 4 numbers + table with 5 rows |
| Irrelevant information | — |
| Repeated UI blocks | 4 stat cards (icon + label + value) |
| Unnecessary options | — |

**Can user identify primary task in 3s?** Yes when empty (one CTA). With data, "overview" is clear; "View all" is secondary.

**Visually competing?** Four stat cards have equal weight; no single "do this next" unless empty state.

**Rarely used?** "View all" is used when user wants full list; appropriate.

**Flags:** None. Card repetition is scannable (same pattern = quick parse).

---

## Clients

| Metric | Count / Notes |
|--------|----------------|
| Primary actions | 1 — Add client (header) or "Add your first client" (empty) |
| Secondary actions | Edit, Delete per row |
| Competing visual elements | Table + slideover + delete modal when opened |
| Density | Medium; table columns: Name, Email, Address, actions |
| Irrelevant information | — |
| Repeated UI blocks | Table rows; Edit/Delete on every row |
| Unnecessary options | — |

**Can user identify primary task in 3s?** Yes. "Clients" + "Add client" or empty-state CTA.

**Visually competing?** Edit/Delete are secondary (ghost, small); primary is "Add client".

**Rarely used?** Delete is destructive and used rarely; appropriately secondary.

**Flags:** None.

---

## Invoices list

| Metric | Count / Notes |
|--------|----------------|
| Primary actions | 1 — New invoice |
| Secondary actions | Status filter, View, Edit, Delete per row |
| Competing visual elements | USelectMenu filter + table + 3 actions per row |
| Density | Medium–high; filter + many columns + 3 buttons per row |
| Irrelevant information | — |
| Repeated UI blocks | View / Edit / Delete on every row |
| Unnecessary options | Filter is useful; all row actions are contextual |

**Can user identify primary task in 3s?** Yes. "Invoices" + "New invoice".

**Visually competing?** Filter and row actions are secondary; primary is "New invoice".

**Rarely used?** Delete is less frequent; appropriately last in row.

**Flags:** None.

---

## New invoice

| Metric | Count / Notes |
|--------|----------------|
| Primary actions | 1 — Create invoice |
| Secondary actions | Back, Cancel, Add line, remove line per row |
| Competing visual elements | Many fields + dynamic line items + totals + two bottom buttons |
| Density | High; client, dates, notes, tax, N line rows, subtotal/tax/total, actions |
| Irrelevant information | Placeholder "Unit price (¢)" exposes cents to user |
| Repeated UI blocks | Each line: description, qty, unit price, line total, remove |
| Unnecessary options | Cancel vs Back — both exit; "Cancel" goes to /invoices |

**Can user identify primary task in 3s?** Yes. "New invoice" + "Create invoice" at bottom.

**Visually competing?** "Cancel" and "Create invoice" side by side; Create is primary (solid). Add line competes with form fields.

**Rarely used?** Remove line (when only one row) is disabled; good.

**Flags:**
- **Long form without structure:** Sections could use headings (Client & dates, Line items, Totals).
- **Technical jargon:** "Unit price (¢)" — users think in dollars; label should be "Unit price" and input in dollars or clearly "Amount" with currency.

---

## Invoice detail ([id])

| Metric | Count / Notes |
|--------|----------------|
| Primary actions | Context-dependent: Mark sent (draft), Mark paid (sent/overdue), Mark overdue (sent) |
| Secondary actions | Back, Edit |
| Competing visual elements | Badge + up to 3 status buttons (Mark sent, Mark paid, Mark overdue) |
| Density | Medium; header, from/to, dates, table, totals, notes |
| Irrelevant information | — |
| Repeated UI blocks | — |
| Unnecessary options | Mark overdue is destructive (status change); same row as Mark paid |

**Can user identify primary task in 3s?** Depends on status. For draft: "Mark sent" is primary. For sent: "Mark paid" and "Mark overdue" compete.

**Visually competing?** Yes. When status is "sent", two buttons: "Mark paid" (success) and "Mark overdue" (outline error). Equal weight in same row.

**Rarely used?** "Mark overdue" is occasional; "Mark paid" is common. Both visible always when sent.

**Flags:**
- **More than 1 primary CTA when sent:** Mark paid vs Mark overdue — both actionable; one positive, one negative. Consider making "Mark overdue" secondary (dropdown or "More").
- **Destructive option prominent:** Mark overdue is one click next to Mark paid; easy to misclick.

---

## Invoice edit ([id]/edit)

| Metric | Count / Notes |
|--------|----------------|
| Primary actions | 1 — Save changes |
| Secondary actions | Cancel (link to detail) |
| Competing visual elements | Same as new invoice: form + line items + totals |
| Density | High |
| Irrelevant information | — |
| Repeated UI blocks | Line item rows |
| Unnecessary options | — |

**Can user identify primary task in 3s?** Yes. "Edit invoice" + "Save changes".

**Flags:** Same structure recommendations as New invoice (sections, unit price label).

---

## Settings

| Metric | Count / Notes |
|--------|----------------|
| Primary actions | 1 — Save |
| Secondary actions | None |
| Competing visual elements | Two optional fields + error/success alert + Save |
| Density | Low |
| Irrelevant information | — |
| Repeated UI blocks | — |
| Unnecessary options | — |

**Can user identify primary task in 3s?** Yes. "Settings" + "Save".

**Flags:** None.

---

## Summary

| Screen | Primary CTAs | Flags |
|--------|----------------|-------|
| Index | 3 (Get started, Log in, Try demo) | Multiple primary CTAs; repeated cards |
| Login | 1 | — |
| Register | 1 | — |
| Dashboard | 1 (or View all when data) | — |
| Clients | 1 | — |
| Invoices list | 1 | — |
| New invoice | 1 | Long form; jargon "(¢)" |
| Invoice detail | 1–3 (status-dependent) | Mark paid vs Mark overdue compete; destructive easy |
| Invoice edit | 1 | — |
| Settings | 1 | — |

**Cross-cutting:** Landing and Invoice detail (sent) have competing primary-weight actions. New invoice form is dense and uses technical "(¢)" label.
