# Interaction Rules

Micro-interactions and motion. No abrupt UI changes; no inconsistent animation speeds.

---

## Hover feedback

- **Buttons:** Use Nuxt UI default hover (background/opacity change). Do not remove or override without documentation.
- **Links:** Use default or `hover:text-default hover:bg-elevated` (e.g. nav). Consistent across nav and in-page links.
- **Table rows:** Use Nuxt UI table hover if enabled; do not add custom row hover that conflicts.
- **Cards:** `card-base` has hover shadow elevation (layer); keep it. Do not add extra hover scale or color unless in design token.

---

## Focus rings

- **All interactive elements** (buttons, inputs, links, select) must have a visible focus ring. Use Nuxt UI focus styles; do not set `outline: none` or `ring: 0` without a documented replacement (e.g. custom ring color/size).
- **Skip link:** Already in app.vue; ensure focus is visible (e.g. `focus:ring` or high-contrast background).
- **Modal/slideover:** Focus trap and return handled by Nuxt UI; ensure first focusable element receives focus on open.

---

## Disabled states

- **Buttons:** Use `disabled` or `:loading`; Nuxt UI disables and styles. Do not hide disabled buttons unless UX requires it.
- **Inputs:** Use Nuxt UI disabled styling; do not custom style.
- **Visual:** Disabled must be clearly distinguishable (opacity/cursor); do not rely on color alone.

---

## Press (active) states

- **Buttons:** Use Nuxt UI active state. No custom active override unless token.
- **Links:** Optional active (e.g. nav: `text-primary bg-primary/10` for current route). Consistent.

---

## Transition timing

Use layer tokens only:

- **--transition-fast:** 150ms — small feedback (hover, focus).
- **--transition-base:** 200ms — default (e.g. card shadow on hover).
- **--transition-slow:** 300ms — page transition, panel open.
- **--transition-spring:** 500ms — optional emphasis.

Do not use arbitrary durations (e.g. `0.15s`, `250ms`) unless added to layer and this doc.

---

## Animation easing

Layer uses `cubic-bezier(0.4, 0, 0.2, 1)` for fast/base/slow. Use same or Nuxt UI default. For spring: `cubic-bezier(0.34, 1.56, 0.64, 1)`. No ad-hoc easing.

---

## Modal open/close motion

- Use Nuxt UI UModal/USlideover default motion. Do not disable or replace without documenting.
- If customizing: open/close should use same duration (e.g. transition-slow) and no layout jump (e.g. opacity + scale or translate, not height collapse).

---

## Toast behavior

- If toasts are used (e.g. "Settings saved" instead of inline UAlert): consistent position (e.g. top-right or bottom), duration, and one at a time. Document in component matrix.
- Current app: success/error via UAlert inline; no toasts. If toasts are added, define behavior here.

---

## Page transitions

- Layer defines `.page-enter-active` / `.page-leave-active` with transition-slow and translateY. Keep as-is. Do not mix different page transition timings.

---

## Loading indicators

- **Button loading:** Spinner inside button (Nuxt UI `:loading`). No separate overlay on the button.
- **Page/block loading:** Skeleton or spinner + text. Use one pattern per context: e.g. dashboard = skeleton cards; list pages = spinner + "Loading…" with `py-12`. Do not mix skeleton and spinner for the same type of content without reason.

---

## No abrupt changes

- **State changes:** Error message appear/disappear: use short transition (e.g. transition-fast) if desired; avoid instant show/hide that causes layout jump.
- **Layout:** Preserve space for error/alert (e.g. min-height or reserve slot) so submit button does not jump when error appears.

---

## Summary

- Hover: Nuxt UI default; card hover from card-base.
- Focus: visible ring on all interactive elements; no outline removal without replacement.
- Disabled: Nuxt UI; clearly distinguishable.
- Transitions: use --transition-fast / base / slow / spring only.
- Modal/slideover: use default motion; no inconsistent speeds.
- Page transitions: layer default (transition-slow).
- No abrupt UI changes; reserve space for dynamic content where needed.
