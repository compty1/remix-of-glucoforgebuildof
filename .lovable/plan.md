# Comprehensive Audit, Remediation Plan & 800-Item CSV

## Goal

Produce a single source-of-truth CSV (`/mnt/documents/comprehensive_audit_v1.csv`) containing up to 800 outstanding bugs, gaps, half-finished items from prior conversations, and recommended enhancements — then execute the remediation in prioritized waves. Includes the 5 user-requested features (profile page, password reset + email verification, account settings for OAuth methods, protected routes, logout).

## Deliverable 1 — The CSV

**Path:** `/mnt/documents/comprehensive_audit_v1.csv`

**Columns:**
`id, category, area, severity, status, title, description, root_cause, fix_approach, files_touched, acceptance_criteria, wave`

**Severity:** `critical | high | medium | low`
**Status:** `open | partial | regression-risk | enhancement`
**Wave:** `1-Security | 2-Auth/Profile | 3-Data-Integrity | 4-Performance | 5-UX/A11y | 6-Enhancements`

**Category breakdown (~800 rows target):**

| Category | Count | Examples |
|---|---|---|
| Auth & session | 60 | Password reset, email verify, OAuth account linking, logout edge cases, session revocation, account deletion confirmation |
| User profile & settings | 40 | Profile page, avatar upload, display name validation, identity management (Google/Apple unlink), notification prefs |
| Protected routes & RBAC | 30 | Missing `<ProtectedRoute>` wraps, admin route gaps, role escalation checks, redirect-after-login persistence |
| Edge function security | 80 | Functions still missing `requireAuth`, missing rate limiting, missing input validation (zod), CORS hardening, body-size checks |
| RLS & data integrity | 70 | Tables missing RLS, overly permissive policies, missing `user_id` on writes, cascade-delete gaps |
| React Query migration tail | 50 | Remaining hooks with manual useEffect/cache, missing `staleTime`, missing invalidation on mutation |
| Query optimization | 60 | `.select('*')` remnants, unbounded queries, N+1 fetches, missing indexes |
| Forms & validation | 50 | Zod schemas missing, client+server validation gaps, error display, double-submit guards |
| Error handling & boundaries | 30 | Missing ErrorBoundary, silent catch blocks, toast spam, retry logic |
| Loading & empty states | 35 | Skeletons missing, empty-state copy, error states |
| Accessibility (WCAG AA) | 50 | aria-labels, keyboard nav, focus traps in modals, contrast, screen reader hidden text |
| SEO & meta | 25 | Missing titles, OG tags, JSON-LD, canonical, sitemap freshness |
| Performance | 40 | Code splitting, image lazy-load, bundle audit, memoization, virtualization for long lists |
| Mobile & responsive | 30 | Bottom nav overlap, touch targets <44px, viewport bugs, safe-area insets |
| PWA & offline | 20 | SW cache strategy, offline fallback page, install prompt |
| Realtime | 15 | Subscriptions not cleaned up, missing publication, reconnect logic |
| Notifications | 20 | Push permission flow, in-app cleanup, mark-all-read |
| Payments & donations | 15 | Stripe webhook idempotency, success/cancel routing, refund handling |
| Email infrastructure | 15 | Auth email templates, transactional templates branded, unsubscribe links |
| Analytics & monitoring | 15 | Event coverage gaps, long-task threshold, error reporting |
| Testing coverage | 30 | Critical paths untested, edge function tests, integration tests |
| Dead code & tech debt | 25 | Unused files, stale TODOs, duplicate utils |
| Documentation | 15 | README staleness, env var docs, contributor guide |
| Enhancements (proactive) | 35 | Dark mode polish, keyboard shortcut help, command palette, export improvements, audit log UI |

**Generation method:** A `scripts/build_audit_csv.ts` script will:
1. Grep the codebase for known anti-patterns (`select('*')`, `useEffect` + `supabase.`, missing `requireAuth`, `console.log`, `as any`, missing `aria-label`, etc.)
2. Cross-reference against prior conversation themes (bugs 1–810 already tracked plus new sweeps)
3. Enumerate every edge function & every hook to verify auth/limits/projection
4. Emit rows with deterministic IDs (`AUD-0001` … `AUD-0800`)

## Deliverable 2 — User-Requested Features

These get rows in the CSV and are built in Wave 2:

1. **Profile page** (`/profile`) — view/edit display_name, avatar, bio, timezone, units (mg/dL vs mmol/L); persists to `profiles` table.
2. **Password reset flow** — `/forgot-password` page + `/reset-password` handler page; uses `supabase.auth.resetPasswordForEmail` with branded Lovable auth email template.
3. **Email verification** — turn off auto-confirm, scaffold branded confirmation email template, add "Resend verification" UI on Auth page, gate sensitive actions on `email_confirmed_at`.
4. **Account settings** (`/settings/account`) — list connected identities (Google/Apple/Email), allow linking additional providers via `lovable.auth.signInWithOAuth`, unlink with confirmation, change password, delete account.
5. **Protected routes audit** — verify `<ProtectedRoute>` wraps every authenticated page in `App.tsx`; add missing ones; preserve `state.from` redirect.
6. **Logout** — already exists in `Layout.tsx` header; add explicit button on mobile bottom nav + account settings page; ensure cross-tab broadcast + cache purge already in `authStore` fires correctly.

## Execution Waves

```text
Wave 1 — Security (edge fn auth, RLS gaps, rate limits)        ~120 items
Wave 2 — Auth + Profile features (5 user requests)              ~40 items
Wave 3 — Data integrity (projection, limits, validation)        ~150 items
Wave 4 — Performance (code split, query, bundle)                ~100 items
Wave 5 — UX/A11y/SEO/Mobile                                     ~180 items
Wave 6 — Enhancements & polish                                  ~210 items
```

Each wave ends with `tsc --noEmit` clean + targeted vitest run + manual smoke test of touched routes.

## Technical Section

**CSV generation script** (`scripts/build_audit_csv.ts`, run with `bun`):
- Walks `src/hooks/`, `src/pages/`, `src/components/`, `supabase/functions/`
- Uses `ts-morph` style AST or just `rg` JSON output for pattern detection
- Merges static "known gap" rows from prior conversation memory
- Writes CSV with proper escaping (commas, newlines, quotes)
- Also writes `/mnt/documents/audit_summary.md` with totals per category/severity

**New DB migration (Wave 2):**
- `profiles` table: `user_id` (FK auth.users, unique), `display_name`, `avatar_url`, `bio`, `timezone`, `glucose_units`, `email_verified_at`
- RLS: select public, update own
- Trigger: auto-insert profile row on `auth.users` insert
- Storage bucket `avatars` (public read, owner write)

**Auth config changes (Wave 2):**
- `configure_auth`: `auto_confirm_email: false`, `password_hibp_enabled: true`
- Scaffold branded auth email templates (signup, recovery, magic-link, email-change)

**Routing changes:**
- Add routes: `/profile`, `/settings/account`, `/forgot-password`, `/reset-password`
- Wrap all `/dashboard`, `/journal`, `/settings/*`, `/profile` in `<ProtectedRoute>`
- `/reset-password` stays public (recovery token flow)

## Out of Scope (this plan)

- Visual redesign — no design directions generated
- New third-party integrations beyond what's already connected
- Mobile native apps

## Definition of Done

- CSV exists at `/mnt/documents/comprehensive_audit_v1.csv` with ≥600 rows (target 800)
- Summary md generated
- All 5 user-requested features shipped and verified
- Each subsequent wave delivered as a separate user message with its own scoped diff + verification

After approval, I'll start by generating the CSV (read-only sweep, no source edits) so you can review the full backlog before any Wave 1 code changes land.
