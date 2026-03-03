# Design Tokens

**Source of truth:** Layer `app/app.config.ts` + Layer `app/assets/css/main.css`.  
App (`apps/web`) inherits; override only in app if needed.

---

## 1. App config (Nuxt UI)

**File:** `layers/narduk-nuxt-layer/app/app.config.ts`

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'slate',
    }
  }
})
```

- **Primary:** emerald — CTAs, links, active nav, success-like actions.
- **Neutral:** slate — secondary UI, borders, muted text, ghost buttons.

Use token names in templates: `color="primary"`, `color="neutral"`, `color="success"`, `color="error"`, `color="info"`. No raw hex in components.

---

## 2. Typography (@theme in main.css)

| Token | Value | Usage |
|-------|--------|--------|
| `--font-sans` | 'Inter', system-ui, … | Body, inputs, tables. |
| `--font-display` | 'Outfit', system-ui, … | Headings; use class `font-display`. |

Body uses `font-family: var(--font-sans)`. Headings and `.font-display` use `--font-display`.

---

## 3. Shadows (elevation)

| Token | Usage |
|-------|--------|
| `--shadow-card` | Default cards (`.card-base`, `.shadow-card`) |
| `--shadow-elevated` | Hover cards, dropdowns |
| `--shadow-overlay` | Modals, slideovers |

Utilities: `.shadow-card`, `.shadow-elevated`, `.shadow-overlay`. Dark mode overrides in layer.

---

## 4. Border radius

| Token | Usage |
|-------|--------|
| `--radius-card` | Cards, panels (1rem) |
| `--radius-button` | Buttons (0.5rem) |
| `--radius-badge` | Badges (pill) |
| `--radius-input` | Inputs, selects (0.5rem) |

Use via Nuxt UI components (they consume theme) or utility classes where needed.

---

## 5. Transitions

| Token | Duration | Use |
|-------|----------|-----|
| `--transition-fast` | 150ms | Micro feedback, toggles |
| `--transition-base` | 200ms | Cards, default |
| `--transition-slow` | 300ms | Page transitions |
| `--transition-spring` | 500ms | Bouncy emphasis |

Classes: `.transition-fast`, `.transition-base`, `.transition-slow`.

---

## 6. Semantic colors (Nuxt UI)

Use in templates; no hex.

| Intent | Token | Example |
|--------|--------|---------|
| Primary action | `primary` | Buttons, links, active nav |
| Neutral / secondary | `neutral` | Ghost buttons, borders |
| Success | `success` | Paid, completed, revenue |
| Error | `error` | Overdue, delete, errors |
| Info | `info` | Sent, pending |
| Muted text | `text-muted` | Labels, secondary copy |

Backgrounds: `bg-primary`, `bg-success/10`, `bg-default`, `bg-elevated`.

---

## 7. Spacing scale

Use Tailwind scale (4px base): `gap-2`, `gap-4`, `space-y-4`, `p-4`, etc. Layer form utilities:

- `.form-section` — vertical gap between field groups (1.25rem).
- `.form-row` — two-column grid on sm+.
- `.form-actions` — end-aligned button row with gap.

Prefer `gap-4`, `space-y-4`, `py-8` for consistency; avoid one-off values unless justified.

---

## 8. App overrides (optional)

If `apps/web` needs different primary/neutral, add `apps/web/app/app.config.ts` and override:

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',  // or 'violet', etc.
      neutral: 'slate',
    }
  }
})
```

Do not duplicate full theme; only override what changes. CSS variables (shadows, radius, transitions) remain in layer `main.css`.
