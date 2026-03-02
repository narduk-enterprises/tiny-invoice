# TinyInvoice — Template Audit Report

This report answers the audit questions from the dual mission (build TinyInvoice + report template friction).

---

## 1. Did `pnpm run setup` complete smoothly?

**Yes.** The setup script completed without errors:

- String replacement updated 17 files and 5 markdown files.
- D1 databases were provisioned: `tiny-invoice-db` and `tiny-invoice-examples-db` (for example apps that were still present).
- `wrangler.json` was updated with correct bindings.
- Doppler project `tiny-invoice` was created and 9 hub credentials were synced.
- GitHub secret `DOPPLER_TOKEN` was set.
- Analytics setup was deferred (missing GA_ACCOUNT_ID, SITE_URL, GSC_SERVICE_ACCOUNT_JSON) with a clear message.
- Favicons were generated from the source SVG.
- Step 9 cleaned up example apps and configs.

**Minor notes:**

- npm warnings appeared during `npx tsx` and ephemeral sharp install (`Unknown env config "npm-globalconfig"`, etc.). They did not affect the outcome.
- The script still references example apps (e.g. example-auth, example-blog) in Step 2/3 for wrangler.json updates; after Step 9 cleanup those apps were removed, so those steps were partially redundant for a “production” single-app setup.

---

## 2. Did Drizzle migration and `nitro-cloudflare-dev` work out of the box?

**Mostly.**

- **Drizzle migration:** Replaced the initial migration SQL with the TinyInvoice schema (users, sessions, clients, invoices, line_items). `pnpm run db:migrate` and `pnpm run db:seed` ran successfully against the local D1 database. No issues with the migration runner.
- **nitro-cloudflare-dev:** The app already had `nitro-cloudflare-dev` in `nuxt.config.ts` with `configPath` pointing to `wrangler.json`. The layer’s `useDatabase(event)` imports schema from the **layer’s** `../database/schema`, not the app’s. So when the app defines its own schema (and does not re-export the layer’s users/sessions), the layer’s `useDatabase` would use the layer schema (users, sessions, todos), not the app’s (users, sessions, clients, invoices, lineItems). To avoid that, the app implemented **`useAppDatabase(event)`** in `apps/web/server/utils/database.ts` and used it in all app API routes. The Nitro warning “Duplicated imports useDatabase, the one from apps/web has been ignored” confirmed the conflict; renaming to `useAppDatabase` resolved it. So: D1 + migrations work; **schema ownership** is tied to whichever module provides `useDatabase`, and apps that replace the layer schema need their own DB helper (e.g. `useAppDatabase`) to avoid the layer’s schema being used.

---

## 3. Did Nuxt layer inheritance work seamlessly? Any module resolution issues?

**Mostly seamless.**

- The app extends `@loganrenz/narduk-nuxt-template-layer`. Composables (`useSeo`, `useSchemaOrg`), plugins, middleware, and design tokens from the layer were available without extra config.
- **Friction:** The only notable issue was the **duplicate `useDatabase`** and schema ownership (see §2). No other module resolution or layer merge issues were encountered.

---

## 4. Any pre-existing TypeScript errors from `pnpm typecheck`?

**None from the template itself.** After building TinyInvoice, typecheck failed until the following were fixed:

- **App-specific:** `useAppDatabase` rename; relative paths in `server/api/invoices/[id]/status.patch.ts` (need `../../../` from that nested path); missing `eq` import in `server/api/clients/index.post.ts`.
- **Frontend:** Nuxt UI 4 `UTable` column/row types are strict; `TableColumn` does not expose `key` in the public type and slot props are a union (header vs cell). Used `as any` for columns and `(row as unknown) as T` in slot templates to satisfy the type checker. `USelectMenu` v-model is typed as the full item (e.g. `Client`), not the `value-attribute`; worked around with a computed get/set that stores only the id string.
- **Password util:** Web Crypto `deriveBits` salt and `toHex` argument types (ArrayBuffer vs Uint8Array / BufferSource) required explicit casts (`salt.buffer.slice(0) as ArrayBuffer`) and `toHex(buf: ArrayBuffer | Uint8Array)` to pass typecheck in the Nuxt/workers environment.

So: no pre-existing template errors; the new app introduced type friction that was fixable with the above.

---

## 5. Did AGENTS.md and documentation accurately guide you? What was confusing or missing?

**Generally accurate and helpful.**

- **Clear:** Project structure, “where your code goes,” layer inventory, hard constraints (no Node modules, Web Crypto, Drizzle only), SEO requirement, rate limiting, CSRF, and the need for `nitro-cloudflare-dev` + local D1 were all correct and sufficient to implement the app.
- **Auth recipe:** The Auth recipe correctly points to Web Crypto PBKDF2 and session patterns. It does not spell out that the **layer’s** `server/utils/database.ts` imports the **layer’s** schema, so an app that defines its own users/sessions tables must provide its own DB accessor (e.g. `useAppDatabase`) if it does not re-export the layer schema. Adding a short “Schema ownership” or “Extending the schema” note would reduce trial-and-error.
- **Missing:** No single place that says “mutation endpoints must call `enforceRateLimit(event)`” in the API section; the rate-limiting section describes the utility but not the “use it on every mutation” rule. Similarly, “use `readValidatedBody` with Zod” was requested in the spec; the codebase uses `readBody` + Zod `safeParse` (no H3 `readValidatedBody`), which is fine but could be mentioned as the recommended pattern if the template does not provide a validated-body helper.
- **BUILD_TEST_APP.md:** Refers to `example-tasks` and `@loganrenz/tiny-invoice-layer`; after setup the repo is `tiny-invoice` and the layer name is `narduk-nuxt-template-layer`. So that doc is aimed at a different derivative and was not used directly for this build.

---

## 6. Any HMR port collisions, Tailwind issues, or Doppler token errors?

**None observed.**

- Dev server was not run to completion in this session; no HMR or port collision checks.
- Tailwind v4 and layer `@theme` tokens were used without issues.
- Doppler was configured by setup; no token errors were encountered (no deploy or CI run was performed).

---

## 7. Did the auth recipe in AGENTS.md give sufficient guidance?

**Yes, for the most part.**

- PBKDF2 with Web Crypto, session storage, and cookie handling were implementable from the recipe and the “no Node crypto” constraint.
- **Gap:** The recipe does not clarify that the **base schema** (users, sessions) lives in the layer and that an app that wants different columns (e.g. businessName, businessAddress) or different tables must either extend/re-export or own the schema and provide its own DB helper so that `useDatabase` (or the app’s equivalent) uses the app’s schema. A one-paragraph “Custom auth schema” would help.

---

## 8. Were there any issues with the ESLint plugins or quality checks?

**Not systematically run.** Lint was not executed in this session. Typecheck passed after the fixes above. No specific ESLint plugin errors were encountered during implementation; the main friction was TypeScript (UTable, USelectMenu, Web Crypto types) rather than lint rules.

---

## Summary

| Area                    | Result        | Notes                                                                 |
|-------------------------|---------------|-----------------------------------------------------------------------|
| Setup script            | ✅ Smooth     | D1, Doppler, favicons, cleanup all succeeded.                        |
| Drizzle + nitro-cloudflare-dev | ✅ Works | Schema ownership requires app-owned `useAppDatabase` when app replaces layer schema. |
| Layer inheritance       | ✅ OK         | One conflict: duplicate `useDatabase` / schema ownership.             |
| TypeScript              | ⚠️ Fixed      | UTable/USelectMenu typing and Web Crypto types needed casts.         |
| AGENTS.md / docs        | ✅ Good       | Auth/schema ownership and “use rate limit on mutations” could be clearer. |
| HMR / Tailwind / Doppler| —             | Not exercised in this audit.                                          |
| Auth recipe             | ✅ Sufficient | Add note on custom auth schema and DB helper.                         |
| ESLint / quality        | —             | Not run.                                                              |

Overall the template is in good shape. The main improvements would be: (1) document schema ownership and the pattern of an app-defined `useAppDatabase` when the app replaces the layer schema, and (2) optionally document the recommended request validation pattern (e.g. `readBody` + Zod) and “rate-limit all mutations.”
