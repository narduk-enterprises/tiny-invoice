# Sprint 2 — Route redirects (deep link → login → intended page)

## Goal

- When an unauthenticated user hits a protected route, redirect to `/login?redirect=/intended-path`.
- After successful login (and register), redirect to `redirect` if present and valid; otherwise `/dashboard`.

## Scope

1. **Auth middleware** (`app/middleware/auth.ts`) — When redirecting to login, append current path (and query) as `redirect` query param.
2. **Login page** (`app/pages/login.vue`) — After `login()`, read `route.query.redirect`; if present and valid (same-origin path, no open redirect), `router.push(redirect)` else `router.push('/dashboard')`.
3. **Register page** (`app/pages/register.vue`) — Same: after `register()`, use `redirect` if valid else `/dashboard`.

## Implementation

- **Middleware:** `return navigateTo('/login?redirect=' + encodeURIComponent(route.fullPath))` (or use Nuxt’s `navigateTo` with query object).
- **Login/Register:** After auth success, `const redirect = route.query.redirect as string`; validate (e.g. string, starts with `/`, no `//` to avoid open redirect); then `router.push(redirect || '/dashboard')`.
- **Validation:** Allow only paths starting with `/` and not containing `//` (or use a allowlist of path prefixes like `/dashboard`, `/invoices`, `/clients`, `/settings`).

## QA checklist (Sprint 2)

- [ ] Visit `/invoices/123` while logged out → redirect to `/login?redirect=/invoices/123`.
- [ ] Log in → land on `/invoices/123` (or dashboard if invoice doesn’t exist).
- [ ] Visit `/dashboard` while logged out → redirect to `/login?redirect=/dashboard`; after login land on `/dashboard`.
- [ ] Visit `/login` with no query → after login land on `/dashboard`.
- [ ] Register with no redirect → land on `/dashboard`.
- [ ] Register with `?redirect=/clients` → land on `/clients` after signup.
- [ ] Invalid redirect (e.g. `//evil.com`) → fallback to `/dashboard`.

## Document changes

- **Done:** Deep link to protected route sends user to login with `redirect`; post-login/post-register redirect to intended path or dashboard. Implemented: auth middleware appends `?redirect=fullPath`; login and register use `isValidRedirect(route.query.redirect)` and push to redirect or `/dashboard`.
