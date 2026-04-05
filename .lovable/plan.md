

# Comprehensive Build Audit: 300+ Bugs, Inconsistencies, and Fixes

This extends the existing 215-bug plan. All original bugs 1-215 are preserved below unchanged. Bugs 216-310 are new findings.

---

## EXISTING BUGS (1-215) — PRESERVED AS-IS

*(Categories A through T from the previous audit remain unchanged)*

---

## NEW FINDINGS: Category U — Additional Manual Cache / useState Hooks (Bugs 216-225)

**Bug 216 — `useClaimedProjects` uses manual useState/useEffect, no React Query**
Full CRUD hook (claim, update, complete, abandon) with manual `fetchClaimedProjects()` calls after every mutation. No caching, no optimistic updates.
*Fix:* Migrate to `useQuery` + `useMutation` with cache invalidation.

**Bug 217 — `useCompanyComparison` uses manual useState/useEffect for both queries**
Two separate `useEffect` blocks: one for all companies selector, one for comparison data. No caching, no deduplication.
*Fix:* Migrate to React Query.

**Bug 218 — `useClinicBranding` uses `supabase as any` and manual useState/useEffect**
Line 8: `const sb = supabase as any` — entire hook bypasses type safety. Also no caching.
*Fix:* Remove `as any` cast, migrate to `useQuery`.

**Bug 219 — `useNutritionLookup` uses manual useState, no caching of results**
Same food lookup query will re-invoke the edge function every time. No debounce on rapid queries.
*Fix:* Add React Query or at minimum a client-side cache for recent lookups.

**Bug 220 — `useResearchInsights` uses manual useState/useEffect with 500-row fetch**
Line 62: Fetches 500 rows, computes stats and filters client-side. No React Query, no caching.
*Fix:* Migrate to `useQuery`. Compute stats in `useMemo` from query data.

**Bug 221 — `useMedicalResearchPapers` has module-level cache AND invokes edge function on every mount**
Lines 5-6: `const cache: Record<string, { data: any[]; fetchedAt: number }> = {};` — module-level mutable cache. Line 104: Always invokes `medical-research-aggregator` edge function after DB fetch, even if data is fresh.
*Fix:* Migrate to React Query, remove module-level cache, invoke edge function only on explicit refresh.

**Bug 222 — `useSurveyDemographics` uses `supabase.auth.getUser()` instead of `useAuthStore()`**
Line 39: Network round-trip per mount to check auth. Also uses manual useState/useEffect.
*Fix:* Use `useAuthStore`, migrate to React Query.

**Bug 223 — `useGlucoseAnalysisHistory` has `fetchHistory` missing from useEffect deps**
Line 44-50: `useEffect` calls `fetchHistory()` but only lists `[user]` in deps. `fetchHistory` is defined outside the effect and not wrapped in `useCallback` with stable deps.
*Fix:* Wrap in `useCallback` or migrate to React Query.

**Bug 224 — `useDashboardLayout` calls `supabase.auth.getUser()` twice (load + save)**
Lines 100 and 141: Two separate `getUser()` calls creating unnecessary network round-trips.
*Fix:* Use `useAuthStore`.

**Bug 225 — `useOnboarding` has `checkOnboardingStatus` missing from useEffect deps**
Line 21-24: `useEffect` calls `checkOnboardingStatus` but doesn't list it in deps. React lint rule violation.
*Fix:* Wrap in `useCallback` with `[user]` deps.

---

## Category V — Additional Security Issues (Bugs 226-238)

**Bug 226 — `useSimilarPosts` passes `deviceMentioned` raw into `.or()` filter**
Line 26: `device_mentioned.eq.${deviceMentioned}` — if `deviceMentioned` contains special chars, it can break the filter syntax or cause injection.
*Fix:* Sanitize input.

**Bug 227 — `useConversation` (direct messages) passes user IDs raw into `.or()` string**
Line 28: `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId})` — while UUIDs are unlikely to contain injection chars, the pattern is unsafe and inconsistent with parameterized queries.
*Fix:* Use PostgREST filter objects instead of string interpolation.

**Bug 228 — `DonationModal` opens Stripe URL without `noopener,noreferrer`**
Line 91: `window.open(data.url, '_blank')` — missing security attributes. The `Donate.tsx` page version correctly uses `noopener,noreferrer` but the modal does not.
*Fix:* Add `'noopener,noreferrer'` to `window.open`.

**Bug 229 — `ChatExport` `handlePrint` opens blank window and writes raw HTML**
Line 105-106: `window.open('', '_blank')` then `printWindow.document.write(...)` — no CSP, no sanitization of chat content before injecting into the new window's DOM.
*Fix:* Sanitize content before `document.write`, or use a safer print approach.

**Bug 230 — `useEmailSubscription.unsubscribe` updates by `subscription.id` without `user_id` filter**
Line 112: `.eq('id', subscription.id)` — relies on client-side `subscription` object integrity. If state is tampered, could affect other users.
*Fix:* Add `.eq('user_id', user.id)` filter.

**Bug 231 — `useEmailSubscription.updatePreferences` same issue**
Line 134: `.eq('id', subscription.id)` without user_id guard.

**Bug 232 — `useFeatureFlag` queries `admin_settings` without caching across instances**
Each component using `useFeatureFlag('voice_logging')` creates a separate DB query. If 5 components check flags, that's 5 queries.
*Fix:* Use React Query with shared query key, or batch flag fetching.

**Bug 233 — Edge function `dsar-export` (data subject access request) has no admin/owner verification documented**
DSAR functions export user data — must verify the requesting user is either the data subject or an admin.
*Fix:* Audit and add auth guards.

**Bug 234 — `provider-invite` edge function has no rate limiting**
A provider could send unlimited invitation emails.
*Fix:* Add rate limiting.

**Bug 235 — `charity-accrue` edge function exists but no auth or admin guard visible in config**
Could be called by any anonymous user.

**Bug 236 — `watch-data` edge function has no auth guard**
Listed in functions directory but no `requireAuth` pattern.

**Bug 237 — `mentor-notify` edge function has no auth guard**
Mentor notifications can be triggered by unauthenticated users.

**Bug 238 — `snapshot-generator` edge function has no auth guard**
Could generate expensive snapshots anonymously.

---

## Category W — Realtime & Subscription Bugs (Bugs 239-245)

**Bug 239 — `useConversation` realtime channel listens to ALL direct_messages changes**
Line 44: `{ event: '*', schema: 'public', table: 'direct_messages' }` — no filter on sender/receiver. Every DM in the system triggers the callback, which then does a client-side check. Wasteful for multi-user scenarios.
*Fix:* Add `filter: receiver_id=eq.${user.id}` to the subscription.

**Bug 240 — `useConversation` creates duplicate channels if `otherUserId` changes rapidly**
The channel name `dm-${user.id}-${otherUserId}` is unique per pair, but rapid switching between conversations creates/destroys channels, potentially causing race conditions with the cleanup.

**Bug 241 — No realtime subscription for community posts**
Community posts use polling via React Query `refetchInterval` or manual refresh. New posts don't appear without user action.
*Fix:* Add realtime subscription or document as intentional.

**Bug 242 — `useUnreadCounts` fetches ALL unread messages to count them**
Line 145-149: Selects `sender_id` from all unread messages, then counts client-side. For a user with 1000+ unread messages, this is expensive.
*Fix:* Use a `COUNT` aggregate query grouped by `sender_id`, or an RPC.

**Bug 243 — `useAutoRefresh` `doRefresh` callback is not debounced**
If the callback is slow and interval fires again before completion, two refreshes can overlap.
*Fix:* Add an `isRefreshing` guard.

**Bug 244 — `useAutoRefresh` `pauseOnHidden` doesn't resume immediately on tab focus**
The interval is cleared when hidden and restarted when visible, but the first refresh after returning waits the full `intervalMs` instead of firing immediately.

**Bug 245 — No WebSocket reconnection handling**
If the Supabase realtime connection drops (network blip), channels in `useConversation` and `useUnreadCounts` don't re-subscribe. Messages are silently missed until page reload.

---

## Category X — Page-Level Bugs (Bugs 246-265)

**Bug 246 — `Discoveries.tsx` calls `seed-discoveries` edge function from client without auth**
Line 56: `supabase.functions.invoke('seed-discoveries')` is called when no data exists, by any user. This seeds production data from an unauthenticated client action.
*Fix:* Remove client-side seeding or add admin guard.

**Bug 247 — `Discoveries.tsx` uses `window.location.reload()` after seeding**
Line 57: Full page reload instead of React Query invalidation. Loses all client state.
*Fix:* Use `queryClient.invalidateQueries()` instead.

**Bug 248 — `DiabetesBurnout.tsx` auto-seeds burnout posts on empty state**
Line 232: `supabase.functions.invoke("seed-burnout-posts")` fires automatically when posts array is empty. No auth check, no admin guard.
*Fix:* Remove auto-seeding or restrict to admin.

**Bug 249 — `Settings.tsx` uses `window.location.reload()` after cache clear**
Lines 1100, 1115: Two instances of full page reload. Loses navigation state.
*Fix:* Use targeted state resets instead.

**Bug 250 — `DeviceDetail.tsx` retry button uses `window.location.reload()`**
Line 95: Full page reload instead of `refetch()`.
*Fix:* Use the query's `refetch()` function.

**Bug 251 — `LiveCureMonitoring.tsx` retry uses `window.location.reload()`**
Line 228: Same pattern.

**Bug 252 — Multiple admin pages use manual useState/useEffect for CRUD**
`AdminLowSugarStories.tsx`, `AdminArticles.tsx`, `AdminWarriors.tsx`, `AdminUsers.tsx` all use manual `useState`/`useEffect` patterns with direct Supabase calls.
*Fix:* Migrate to React Query for consistency.

**Bug 253 — `AdminUsers.tsx` edge function call `admin-users` returns user data without pagination**
If there are thousands of users, this will time out or return truncated data.
*Fix:* Add pagination.

**Bug 254 — `SystemHealth.tsx` calls `health-check` edge function that may not exist**
Line 43: `supabase.functions.invoke('health-check')` — there is no `health-check` directory in `supabase/functions/`.
*Fix:* Either create the function or remove the health check.

**Bug 255 — `PrepareForVisit.tsx` invokes edge function without visible auth check**
Could trigger AI-powered report generation without authentication.

**Bug 256 — `DataUpload.tsx` calls `analyze-glucose` edge function with file content in body**
Large files could exceed edge function body size limits. No client-side file size validation visible.
*Fix:* Validate file size before upload.

**Bug 257 — `Shop.tsx` checkout calls `create-shop-checkout` but cart is not persisted**
If the page refreshes before checkout completes, the cart and checkout session are lost.

**Bug 258 — `Fixes.tsx` fetches all device fixes without device filter**
Line 25-30: Fetches from `device_user_fixes` with no device_id filter and no limit. Could return thousands of rows.
*Fix:* Add limit or device filter.

**Bug 259 — `Journal.tsx` shifts are stored client-side only**
Glucose shifts/patterns are loaded from `shifts` table but new manual entries are only in local state until saved. No auto-save or draft persistence.

**Bug 260 — `QAChecklist.tsx` exists but purpose is unclear**
A QA checklist page that may be development-only content exposed in production routing.
*Fix:* Remove from production routes or add admin guard.

**Bug 261 — `usePageMeta` doesn't clean up OG/Twitter meta tags on unmount**
Line 60-62: Only `document.title` is restored on cleanup. The OG tags, Twitter cards, and canonical link remain from the previous page, potentially showing stale SEO data.
*Fix:* Remove or reset all injected meta tags on cleanup.

**Bug 262 — `usePageMeta` canonical URL doesn't include query params**
Line 58: `window.location.origin + window.location.pathname` — pages that use query params for state (e.g., comparison pages) all canonicalize to the same URL.

**Bug 263 — `FinancialTools.tsx` has external link handler but no link validation**
Line 164: `window.open(url, '_blank')` — the URL could be malicious if it comes from user-generated or scraped content.
*Fix:* Validate URL protocol is `http:` or `https:`.

**Bug 264 — `CommunitySolutions.tsx` opens `improvement.source_url` without protocol validation**
Line 392: `window.open(improvement.source_url, '_blank')` — scraped URLs could contain `javascript:` protocol.
*Fix:* Validate protocol.

**Bug 265 — `SupportGlucoForge.tsx` uses `window.open` with `'_self'` for internal navigation**
Line 260: `window.open('/donate?...', '_self')` — should use React Router's `navigate()` for SPA navigation. This causes a full page reload.
*Fix:* Use `useNavigate()`.

---

## Category Y — Worker & Client-Side Computation Bugs (Bugs 266-275)

**Bug 266 — `useGlucoseForecast` creates a new Web Worker on every `runForecast` call**
Line 25-37: Each invocation creates and terminates a worker. If called rapidly, workers accumulate.
*Fix:* Reuse a single worker instance via ref.

**Bug 267 — `useGlucoseForecast` worker is not terminated on component unmount**
If the component unmounts while a forecast is running, the worker continues. `setForecast` and `setLoading` are called on unmounted component.
*Fix:* Track worker in ref and terminate on cleanup.

**Bug 268 — `useLocalAI` engine ref persists across component re-mounts**
`engineRef.current` is never cleared. If the component unmounts and remounts, `isModelLoaded` is `false` but `engineRef.current` still holds the old engine.
*Fix:* Sync `isModelLoaded` with `engineRef.current` existence.

**Bug 269 — `useSpeechToText` creates new `SpeechRecognition` on every `startListening` call**
Line 45-68: No reuse of the recognition instance. Multiple rapid starts could create overlapping recognition sessions.
*Fix:* Stop existing before starting new.

**Bug 270 — `useSpeechToText` `onresult` concatenates all results without separating interim vs final**
Line 51-56: Both interim and final results are concatenated. If `interimResults: true`, the transcript jitters as interim results are replaced.
*Fix:* Only concatenate final results, display interim separately.

**Bug 271 — `useOfflineStatus` `handleOnline` has stale `isOnline` closure**
Line 23: `if (!isOnline) setWasOffline(true)` — `isOnline` is captured from the render when `handleOnline` was created. Due to `useCallback` with `[isOnline]` dep, it recreates on every state change, but the event listener doesn't update.
*Fix:* Use functional state update or ref.

**Bug 272 — `usePerformanceMonitoring` only monitors long tasks, not CWV**
The comment says "Core Web Vitals + Long Task monitoring" but only long tasks are observed. No LCP, FID, or CLS tracking.
*Fix:* Add CWV observation or update the comment.

**Bug 273 — `useAILoadingFacts` `Math.random()` for fact rotation can repeat**
Line 33: `Math.floor(Math.random() * DIABETES_FACTS.length)` — can show the same fact consecutively.
*Fix:* Track last shown index and exclude it.

**Bug 274 — `useAILoadingFacts` interval not cleared before new interval on re-trigger**
If `isLoading` toggles rapidly, the timer and interval can stack.
*Fix:* Clear both refs at the start of each effect run.

**Bug 275 — `SurveyModal` elapsed time timer runs even after survey is submitted**
Line 74: `setInterval` for elapsed time is started when modal opens but only cleared on close. If the user submits without closing, the timer keeps running.

---

## Category Z — Data Model & Query Issues (Bugs 276-290)

**Bug 276 — `useSourceCategories` fetches ALL community posts just to count by source**
Line 24-28: `select('source')` with no limit. If there are 50,000 posts, it downloads 50,000 rows just to count unique sources.
*Fix:* Use an RPC or `GROUP BY` query.

**Bug 277 — `useProductCategories` fetches all products to derive categories**
Line 47: `select('category')` without limit or distinct. Same waste pattern.
*Fix:* Use `DISTINCT` or maintain a categories reference table.

**Bug 278 — `useQualityOfLifeCategories` fetches all experiences to derive categories**
Line 58: `select('category')` without limit or distinct.

**Bug 279 — `useT1DHistoryEras` fetches all events to derive eras**
Line 67: `select('era')` without limit. Deduplicates client-side.

**Bug 280 — `useT1DHistoryDecades` fetches all events to derive decades**
Line 84-86: `select('decade, decade_summary')` — fetches all events and deduplicates client-side.

**Bug 281 — `useT1DHistory` has no `.limit()` on main query**
Fetches all history events with no cap.

**Bug 282 — `useStateForms` has no `.limit()` on main query**
Fetches all state forms with no cap.

**Bug 283 — `useResources` has no `.limit()` on main query**
Fetches all resources. Could grow unbounded.

**Bug 284 — `useBurnoutPosts` has no `.limit()`**
Fetches all burnout posts ordered by score with no cap.

**Bug 285 — `useBurnoutComments` has no `.limit()`**
Fetches all comments for a post with no cap.

**Bug 286 — `useDeviceFixes` has no `.limit()`**
Fetches all fixes for a device with no cap.

**Bug 287 — `useQualityOfLifeExperiences` deduplicates client-side instead of at DB level**
Lines 38-44: Fetches 100 rows then deduplicates by title+category. If half are duplicates, only 50 unique results are shown.
*Fix:* Add DISTINCT or fix seed data to not create duplicates.

**Bug 288 — `useFundingTimeline` aggregates all company data client-side**
Line 32-56: Fetches all active companies and groups by `founded_year` in JavaScript. Should be a `GROUP BY` query.
*Fix:* Use an RPC or materialized view.

**Bug 289 — `useCureMonitoring` computes stats client-side from all therapies**
Line 76-94: `activeTrials`, `avgYearsToMarket`, `successRate` are all computed in the browser from the full dataset.
*Fix:* Consider an RPC for aggregate stats if the dataset grows.

**Bug 290 — `useDiscoveries` return type is ambiguously typed**
Lines 59-61: `(discoveries as any)?.totalCount` and `(discoveries as any)?.items` — the `data` from `useQuery` returns `{ items, totalCount }` but is accessed with `as any` casts, defeating type safety.
*Fix:* Type the return correctly.

---

## Category AA — Edge Function Gaps (Bugs 291-305)

**Bug 291 — `health-check` function is called by SystemHealth but doesn't exist**
`supabase/functions/health-check/` is not in the functions directory, but `SystemHealth.tsx` invokes it.
*Fix:* Create the function or remove the call.

**Bug 292 — `nightscout-sync` has no corresponding UI trigger visible**
The function exists but no page or settings UI allows users to configure or trigger Nightscout sync.

**Bug 293 — `analyze-glucose-ai` vs `analyze-glucose` — two separate functions for similar purposes**
Both exist in the functions directory. Unclear which is used when, potential code duplication.
*Fix:* Document or consolidate.

**Bug 294 — `charity-accrue` function exists but no charity/points system UI is visible**
The feature flag `charity_points` defaults to `false` and no UI references this function.

**Bug 295 — `dsar-export` exists but no UI for users to request data export**
GDPR/CCPA compliance requires users to be able to request their data. No settings page option visible.
*Fix:* Add a "Download My Data" button in Settings.

**Bug 296 — 90+ edge functions all set `verify_jwt = false` in config.toml**
Every single function bypasses JWT verification. While some (webhooks, public endpoints) need this, most user-facing functions should verify JWTs.
*Fix:* Audit each function and enable JWT verification where appropriate.

**Bug 297 — `nutrition-lookup` edge function is invoked without auth but likely costs money (external API)**
No rate limiting visible on the function, and no auth check. Users can spam nutritional lookups.
*Fix:* Add rate limiting and/or auth.

**Bug 298 — `daily-briefing` is invoked from `useOnboarding` with user ID in body**
Line 86-89: `{ userId: user?.id, dayNumber: 1 }` — sending the user ID in the body instead of deriving from auth token means anyone could impersonate another user.
*Fix:* Derive user ID from the auth token server-side.

**Bug 299 — `ai-discovery-analyzer` has no visible invocation path**
Function exists but no hook or page calls it. Dead code.

**Bug 300 — `seed-community-posts` and `seed-community-comments` are called from `useCommunitySearch`**
Lines 287-288: Client-side code calls seed functions when post count < 10. Any user can trigger seeding by searching when the community is empty.
*Fix:* Remove client-side seeding.

**Bug 301 — `ContentModeration.tsx` calls `verify-external-links` with `mode: 'fix'`**
Line 166-167: This is an admin action that modifies data. No confirmation dialog before fixing all broken links.
*Fix:* Add confirmation.

**Bug 302 — No edge function timeout configuration**
All functions rely on default Deno Deploy timeouts. AI-powered functions that call external APIs could hang.
*Fix:* Add `AbortController` with 25s timeout to all AI/external-API functions.

**Bug 303 — `send-weekly-digest` has no unsubscribe token validation**
If the function sends emails, there must be a one-click unsubscribe that validates the token without auth.

**Bug 304 — `send-push-notification` has no subscription verification**
The function sends push notifications but doesn't verify the subscription endpoint is still valid. Expired subscriptions cause silent failures.

**Bug 305 — `watch-data` function purpose is undocumented**
No README, no comments in the index.ts explaining what data is being watched.

---

## Category AB — Miscellaneous Code Quality (Bugs 306-310)

**Bug 306 — `useOnboarding.completeOnboarding` stores role in `bio` field**
Line 60: `bio: 'Role: ${role}'` — the user's role is stored as a string in the bio field instead of a proper column or the preferences table. This makes role-based logic impossible without string parsing.
*Fix:* Store role in `user_preferences.therapy_type` or add a `role` column.

**Bug 307 — `useT1DChat.sendMessage` has stale closure over `messages`**
Line 69: `[...messages, userMessage]` — `messages` is captured from the render that created the callback. If multiple messages are sent rapidly, the history is stale.
*Fix:* Use a ref for messages history or functional state updates.

**Bug 308 — `useT1DChat` sends full message history to edge function on every message**
Line 69-72: All previous messages are sent in every request. For long conversations, this can exceed the AI model's context window and edge function body limits.
*Fix:* Truncate history to last N messages or total token count.

**Bug 309 — `useIdleLogout` registers `mousemove` listener without throttle**
Line 64-65: `resetTimer` is called on every mouse movement pixel. This clears and recreates 3 timers per mouse movement.
*Fix:* Throttle the event handler to at most once per second.

**Bug 310 — `useClaimedProjects.completeTask` reads from stale `claimedProjects` state**
Line 158: `claimedProjects.find(p => p.id === claimedProjectId)` — if another mutation just completed and `fetchClaimedProjects()` hasn't resolved yet, the `completed_tasks` array is stale, potentially losing a previously completed task.
*Fix:* Fetch fresh project data inside the mutation function (same pattern as `useStreaks`).

---

## Updated Implementation Priority

**Phase 1 — Critical Security (Bugs 113-130, 226-238, 246, 248, 296-300)**
Add auth/admin guards to ~50 edge functions. Sanitize all `.or()` query inputs. Remove client-side seed function calls. Validate URL protocols.
*~55 files affected*

**Phase 2 — Vote Tracking (Bugs 1, 81-87, 195)**
Create vote-tracking tables for stories, experiences, and device fixes.
*3 new tables, 4 hook mods*

**Phase 3 — Hook Standardization (Bugs 6-23, 48, 80, 104, 108, 178, 194, 216-225, 252)**
Migrate ~30 manual useState/useEffect hooks to React Query. Remove all module-level caches.
*~30 hooks affected*

**Phase 4 — Auth Pattern Fix (Bugs 24-29, 100-103, 106-112, 222, 224)**
Replace all `getUser()` calls with `useAuthStore()`. Create `useIsAdmin` shared hook.
*~12 files*

**Phase 5 — Query Limits & Aggregation (Bugs 49-50, 91-92, 131-140, 173, 258, 276-290)**
Add `.limit()` to all unbounded queries. Move client-side aggregation to RPCs where needed.
*~25 hooks*

**Phase 6 — UI & UX (Bugs 58-65, 141-160, 193, 196-197, 246-265)**
Route fixes, empty states, pagination, toast standardization, SPA navigation, meta tag cleanup.
*~25 components*

**Phase 7 — Type Safety & Dead Code (Bugs 77, 105, 181-192, 206-215, 290-305)**
Remove `as any` casts, create shared types, audit/drop unused functions, wire disabled features.
*~20 files + DB cleanup*

**Phase 8 — Performance & Workers (Bugs 73-79, 266-275, 306-310)**
Fix worker lifecycle, throttle event handlers, optimize stale closures, reduce re-renders.
*~15 files*

---

## Technical Details

**Database migrations needed:**
1. `story_upvote_votes` table + trigger
2. `experience_upvote_votes` table + trigger
3. Drop orphaned RPCs: `increment_story_upvotes`, `increment_review_helpful`, `increment_device_review_helpful`
4. Optional: `device_fix_votes` table

**New shared utilities:**
- `src/hooks/useIsAdmin.ts` — shared admin check hook
- `src/utils/searchSanitizer.ts` — `sanitizeForIlike()` for `.or()` queries
- `src/types/shared.ts` — shared interfaces
- `src/utils/urlValidator.ts` — validate URL protocols before `window.open`

**Edge function changes:**
- Add `requireAdmin` / `requireAuth` to ~50 functions
- Add rate limiting to ~10 user-invocable functions
- Add AbortController timeout to AI-powered functions
- Create `health-check` function or remove reference
- Remove `verify_jwt = false` where inappropriate

**Estimated total scope:**
- ~30 hooks migrated to React Query
- ~50 edge functions hardened with auth
- ~25 hooks patched for query limits
- ~12 hooks patched for SQL injection
- ~25 components fixed for UI/UX bugs
- 3 new database tables
- 3 dropped RPCs
- ~15 files for performance fixes

