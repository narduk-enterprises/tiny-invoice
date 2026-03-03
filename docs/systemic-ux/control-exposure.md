# Phase 7 — Control Exposure Audit

**Goal:** Ensure the right controls appear at the right time. Audit visible-but-unusable, hidden-but-needed, advanced options always visible, destructive too easy, rare features prominent, important features buried.

---

## Controls visible but unusable

| Control | Where | Unusable when? | Reason |
|---------|--------|-----------------|--------|
| Remove line (trash) | New/Edit invoice | When only 1 line item | `:disabled="lineItems.length <= 1"` — **good.** No tooltip explaining why disabled. |
| Delete (client) | Clients table | When client has invoices | Backend fails; modal says "This will fail if they have invoices." Delete is always visible. **Acceptable** — user learns on attempt. |
| Mark sent / Mark paid / Mark overdue | Invoice detail | Shown/hidden by status | Draft: Mark sent. Sent: Mark paid + Mark overdue. Paid: none. Overdue: Mark paid. **Correct.** |

**Disabled button with no reason:** Remove-line is disabled with no aria-label or tooltip. **Recommendation:** Add `aria-label="Remove line (at least one required)"` or tooltip.

---

## Controls hidden but needed

| Need | Where | Available? |
|------|--------|------------|
| Add client | Clients | Header "Add client" + empty state CTA. **Yes.** |
| New invoice | Invoices | Header "New invoice" + empty state. **Yes.** |
| Edit client | Clients | Row pencil. **Yes.** |
| Delete client | Clients | Row trash. **Yes.** |
| View invoice | Invoices list | Row "View" button. **Yes.** (Row not clickable.) |
| Edit invoice | Invoices list + detail | Row pencil; detail "Edit" button. **Yes.** |
| Delete invoice | Invoices list | Row trash. **Yes.** |
| Mark sent/paid/overdue | Invoice detail | Buttons when status allows. **Yes.** |
| Save / Cancel | All forms | Visible. **Yes.** |

**Verdict:** No critical "hidden but needed" controls. Optional: make invoice row click open detail (View) so View isn't only via small button.

---

## Advanced options always visible

| Control | Where | Advanced? | Visible |
|---------|--------|-----------|---------|
| Business name / address | Register, Settings | Optional | Always. **Acceptable** — not many fields. |
| Notes, Tax rate (%) | New/Edit invoice | Optional | Always. **Acceptable** — common. |
| Status filter | Invoices list | Power-user | Always. **Acceptable** — single dropdown. |
| Mark overdue | Invoice detail (when sent) | Rare | Same row as Mark paid. **Could be** in "More" to reduce prominence. |

**Verdict:** Optional fields are fine. "Mark overdue" could be progressive disclosure (e.g. "More" → Mark overdue) so primary is "Mark paid."

---

## Destructive options too easy

| Action | Where | Friction |
|--------|--------|----------|
| Delete client | Row trash → modal "Delete client X? This will fail if they have invoices." → Confirm | **Two steps.** Good. |
| Delete invoice | Row trash → modal "Delete invoice X? This cannot be undone." → Confirm | **Two steps.** Good. |
| Mark overdue | Invoice detail: one click (no modal) | **One click.** Changes status to overdue. Reversible by "Mark paid." **Moderate risk** — wrong click is recoverable but prominent. |

**Verdict:** Deletes are well protected. Mark overdue is not destructive in the "data loss" sense but is negative; making it secondary (e.g. in menu) would reduce accidental use.

---

## Rare features prominent

| Feature | Where | How prominent | Rare? |
|---------|--------|----------------|-------|
| Try demo | Landing | Primary-style button | For first-time visitors; not rare. |
| Fill demo credentials | Login | Button in form | Demo-only. **Rare** for normal users. Could be link. |
| Mark overdue | Invoice detail | Same row as Mark paid | **Rare.** Should be secondary. |
| Status filter | Invoices list | Dropdown at top | Used when many invoices. **Moderate.** Keep. |

**Verdict:** "Mark overdue" and "Fill demo credentials" are rare; demote or move to secondary.

---

## Important features buried

| Feature | Where | Exposure |
|---------|--------|----------|
| Create first invoice | Dashboard empty state | Single CTA in table area. **Clear.** |
| Add first client | Clients empty state | Single CTA. **Clear.** |
| New invoice | Invoices list | Header + empty state. **Clear.** |
| Edit invoice | Detail page | "Edit" in header. List row has pencil. **Clear.** |
| Settings | App shell | User icon (and nav when logged in). **Clear.** |

**Verdict:** Primary actions are not buried.

---

## Summary

| Question | Finding |
|----------|--------|
| Should this control be contextual? | Status buttons on invoice detail are already contextual (by status). Mark overdue could be in a secondary menu. |
| Should this be progressive disclosure? | Mark overdue: yes. Optional fields (business, notes, tax): fine as-is. |
| Is destructive action too easy? | Delete client/invoice: no (modal). Mark overdue: one click, recoverable but prominent — consider demoting. |

**Recommendations:**
1. Add aria-label or tooltip for disabled "Remove line" (e.g. "At least one line required").
2. Consider "Mark overdue" in a dropdown or "More" on invoice detail so "Mark paid" is the single prominent action when status is sent.
3. Consider "Fill demo credentials" as a text link to reduce visual weight for non-demo users.
4. Optional: make invoice table row click navigate to detail (View) so primary action is easier.
