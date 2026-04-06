

# Extended Build Audit: 500 Additional Bugs (311-810)

All existing bugs 1-310 are preserved. This plan adds 500 new findings organized into categories.

---

## Category AC — Remaining Module-Level Caches Not Migrated (Bugs 311-325)

**Bug 311** — `useResearchFeed` still uses module-level `let cachedData: any[]` and `let lastFetchedAt` (not migrated in Phase 3)
**Bug 312** — `useT1DNews` still uses module-level `let newsCache` object
**Bug 313** — `useFoundConnections` still uses module-level `let cachedConnections: any[]` and `let lastFetchedAt`
**Bug 314** — `useDeviceAnalytics` still uses module-level `let cachedAnalytics` and `let lastFetchedAt`
**Bug 315** — `useClinicalTrialsDetailed` still uses module-level `const cache: Record<string, ...>`
**Bug 316** — `useT1DCompanies` still uses module-level `let _companiesCache`
**Bug 317** — `useResearchFunding` still uses module-level `let cachedData` and `let lastFetchedAt`
**Bug 318** — `useMedicalResearchPapers` still uses module-level `const cache: Record<string, ...>`
**Bug 319** — `useDrugPricing` still uses module-level cache (if not migrated)
**Bug 320** — `useMarketData` still uses module-level cache (if not migrated)
**Bug 321** — `usePatentData` still uses module-level cache (if not migrated)
**Bug 322** — All module-level caches in 311-321 leak previous user's data on sign-out
**Bug 323** — Module-level caches typed as `any[]` bypass TypeScript safety
**Bug 324** — Module-level caches not cleared on HMR, causing stale data during development
**Bug 325** — Module-level `STALE_TIME_MS` values differ per hook (5-15 min) with no centralized config

*Fix:* Migrate all remaining hooks to React Query with proper `staleTime`. Create a shared `CACHE_CONFIG` constant.

---

## Category AD — `useEffect` Missing Dependencies (Bugs 326-340)

**Bug 326** — `useDeviceAnalytics.fetchDeviceData` not in useEffect deps (empty `[]`)
**Bug 327** — `useResearchFunding.fetchData` not in useEffect deps (empty `[]`)
**Bug 328** — `useT1DCompanies.fetchCompanies` not in useEffect deps; deps are individual filter fields instead of the callback
**Bug 329** — `useFDAData.fetchFromDB` recreates on `eventType` change but `load()` re-runs only because `fetchFromDB` is in deps — fragile chain
**Bug 330** — `useClinicalTrialsDetailed.fetchFromDB` used in useEffect but `cacheKey` not in deps (only `fetchFromDB`)
**Bug 331** — `useCompanyComparison` first useEffect (fetch all companies) has empty deps — never refetches if data changes
**Bug 332** — `useDeviceComparison` first useEffect (fetch all devices) has empty deps
**Bug 333** — `useSurveys.fetchSurveys` not in useEffect deps (empty `[]`)
**Bug 334** — `useBookmarks.fetchBookmarks` is a `useCallback` but `addBookmark`, `removeBookmark`, `removeAllBookmarks`, `removeBookmarkByUrl` are not — they capture stale `fetchBookmarks` via closure
**Bug 335** — `useMedicationComparison` URL init useEffect has empty deps `[]` — URL changes after mount are ignored
**Bug 336** — `usePushNotifications` second useEffect depends on `state.isSupported` which changes during the first useEffect — potential race
**Bug 337** — `useCompanyById` useEffect depends on `id` but doesn't clear `error` when id changes to a new value
**Bug 338** — `useRelatedCompanies` useEffect depends on `focusAreas` (array reference) — triggers on every parent re-render even if contents are the same
**Bug 339** — `useBurnoutAwareness` useEffect deps need audit for completeness
**Bug 340** — `useCitationNetwork` useEffect deps need audit

*Fix:* Migrate to React Query (eliminates manual deps), or fix dependency arrays with `useCallback` wrapping.

---

## Category AE — Remaining `as any` Type Safety Violations (Bugs 341-365)

**Bug 341** — `useGlobalSearch` uses `(supabase as any)` for 8 parallel queries (still not fixed)
**Bug 342** — `useChatSessions.createSession` uses `(supabase as any)` on line 121
**Bug 343** — `useChatSessions.createSession` uses `(data as any)` on line 130
**Bug 344** — `usePushNotifications` uses `(registration as any)` twice (lines 49, 126)
**Bug 345** — `useDiabeticProfiles` uses `payload as any` for insert
**Bug 346** — `useGlucoseComparison` uses `data[0].detailed_analysis as any`
**Bug 347** — `useSurveys` uses `questions: any` in interface (line 9)
**Bug 348** — `useSavedIssues` uses `solutions_found: any[]` in interface (line 13)
**Bug 349** — `useSavedIssues.UpdateIssueData` uses `solutions_found?: any[]` (line 31)
**Bug 350** — `useFDAData` uses `raw_data?: any` in interface (line 16)
**Bug 351** — `useClinicalTrialsDetailed` uses `raw_data?: any` in interface (line 36)
**Bug 352** — `useMedicalResearchPapers` uses `raw_data?: any` in interface (line 31)
**Bug 353** — `useFoundConnections` cached as `any[]` at module level (line 6)
**Bug 354** — `useResearchFeed` cached as `any[]` at module level (line 6)
**Bug 355** — `useMedicalResearchPapers` cached as `any[]` at module level (line 5)
**Bug 356** — `useDirectMessages.useSendMessage` onError uses `err: any` (line 84)
**Bug 357** — `useDeviceAnalytics` module cache typed as `DeviceAnalyticsData | null` but inner arrays are `any`
**Bug 358** — `useT1DCompanies._companiesCache.data` is typed as `any[]` (line 5)
**Bug 359** — `useT1DNews.newsCache.data` is typed as `any[]` (line 5)
**Bug 360** — `useResearchFunding.cachedData` typed but module-level mutable
**Bug 361** — `useCompanyComparison` casts `company.products as Array<...>` unsafely (line 70)
**Bug 362** — `useDeviceAnalytics` casts `device.device_metrics?.[0]` without checking array length
**Bug 363** — `useT1DCompanies` casts `(data || []) as unknown as T1DCompany[]` — double cast (line 114)
**Bug 364** — `Dashboard.tsx` uses `supabase as any` for nightscout check (line 77)
**Bug 365** — Multiple hooks use `as unknown as` chains to bypass type checking

*Fix:* Remove all `as any` casts. Use proper generics, type guards, or Zod runtime validation.

---

## Category AF — Hooks Still Using useState/useEffect Pattern (Bugs 366-385)

**Bug 366** — `useBookmarks` uses manual useState/useEffect (not migrated)
**Bug 367** — `useSurveys` uses manual useState/useEffect (not migrated)
**Bug 368** — `useFDAData` uses manual useState/useEffect (not migrated)
**Bug 369** — `useResearchFeed` uses manual useState/useEffect (not migrated)
**Bug 370** — `useT1DNews` uses manual useState/useEffect (not migrated)
**Bug 371** — `useFoundConnections` uses manual useState/useEffect (not migrated)
**Bug 372** — `useDeviceAnalytics` uses manual useState/useEffect (not migrated)
**Bug 373** — `useClinicalTrialsDetailed` uses manual useState/useEffect (not migrated)
**Bug 374** — `useT1DCompanies` uses manual useState/useEffect (not migrated)
**Bug 375** — `useResearchFunding` uses manual useState/useEffect (not migrated)
**Bug 376** — `useMedicalResearchPapers` uses manual useState/useEffect (not migrated)
**Bug 377** — `useCompanyComparison` uses manual useState/useEffect (not migrated)
**Bug 378** — `useDeviceComparison` uses manual useState/useEffect (not migrated)
**Bug 379** — `usePushNotifications` uses manual useState/useEffect for subscription state
**Bug 380** — `useCompanyById` uses manual useState/useEffect (not migrated)
**Bug 381** — `useRelatedCompanies` uses manual useState/useEffect (not migrated)
**Bug 382** — `useCitationNetwork` uses manual useState/useEffect (not migrated)
**Bug 383** — `useCureMonitoring` uses manual useState/useEffect (not migrated)
**Bug 384** — `useBurnoutAwareness` uses manual useState/useEffect (not migrated)
**Bug 385** — `useBurnoutPosts` fetch pattern should be audited for React Query compatibility

*Fix:* Migrate all remaining hooks to React Query with appropriate `staleTime`, `queryKey`, and `enabled` flags.

---

## Category AG — Edge Functions Invoking External APIs Without Auth (Bugs 386-420)

**Bug 386** — `research-feed` invokable without auth, calls external APIs
**Bug 387** — `financial-market-feed` invokable without auth
**Bug 388** — `patent-innovation-feed` invokable without auth
**Bug 389** — `funding-research-feed` invokable without auth
**Bug 390** — `medicare-data-feed` invokable without auth
**Bug 391** — `clinical-trials-enhanced` invokable without auth
**Bug 392** — `fetch-citation-network` invokable without auth
**Bug 393** — `preprint-research-feed` invokable without auth
**Bug 394** — `openalex-research-feed` invokable without auth
**Bug 395** — `semantic-scholar-feed` invokable without auth
**Bug 396** — `medical-research-aggregator` invokable without auth, triggers scraping
**Bug 397** — `fetch-reddit-reviews` invokable without auth
**Bug 398** — `data-orchestrator` invokable without auth
**Bug 399** — `snapshot-generator` invokable without auth
**Bug 400** — `nightscout-sync` invokable without auth
**Bug 401** — `ai-center-predictions` invokable without auth, uses AI credits
**Bug 402** — `discovery-synthesizer` invokable without auth, uses AI credits
**Bug 403** — `notification-triggers` invokable without auth
**Bug 404** — `scheduled-maintenance` invokable without auth
**Bug 405** — `watch-data` invokable without auth

**Bug 406-420** — All 40+ `seed-*` functions invokable without admin auth:
`seed-adult-content-expanded`, `seed-adult-content-posts`, `seed-app-community-buzz`, `seed-app-reviews`, `seed-articles`, `seed-bounties`, `seed-burnout-posts`, `seed-citation-network`, `seed-clinical-trials`, `seed-community-comments`, `seed-community-posts`, `seed-company-logos`, `seed-cure-therapies`, `seed-device-fixes`, `seed-device-images`

*Fix:* Add `requireAuth` or `requireAdmin` to all non-webhook edge functions. Use the shared `_shared/auth.ts` helpers.

---

## Category AH — Client-Side Seeding / Edge Function Invocations (Bugs 421-435)

**Bug 421** — `Diabeto18Plus.tsx` invokes `seed-adult-content-expanded` from client (line 96)
**Bug 422** — `CommunitySolutions.tsx` may trigger seeding functions from client
**Bug 423** — `PrepareForVisit.tsx` invokes `snapshot-generator` without auth check (line 33)
**Bug 424** — `DataUpload.tsx` invokes `analyze-glucose` with file content — no client-side file size limit
**Bug 425** — `Shop.tsx` invokes `create-shop-checkout` but checkout is disabled in UI
**Bug 426** — `SystemHealth.tsx` invokes `health-check` — function may not exist
**Bug 427** — `AdminUsers.tsx` invokes `admin-users` 5 times with different actions — no debounce on rapid clicks
**Bug 428** — `ContentModeration.tsx` invokes `verify-external-links` with `mode: 'fix'` — no confirmation
**Bug 429** — `DonationModal.tsx` has idempotency key but `Donate.tsx` page does not
**Bug 430** — `useResearchFeed` always invokes `research-feed` edge function after DB fetch (line 62)
**Bug 431** — `useResearchFunding` always invokes `funding-research-feed` after DB fetch (line 56)
**Bug 432** — `useMedicalResearchPapers` always invokes `medical-research-aggregator` after DB fetch (line 104)
**Bug 433** — `useDeviceAnalytics.refreshCommunityFeed` invokes `community-feed` without rate limit
**Bug 434** — `useFoundConnections.triggerAnalysis` invokes `ai-connection-analyzer` without rate limit
**Bug 435** — `useClinicalTrialsDetailed.refreshData` invokes `clinical-trials-enhanced` without rate limit

*Fix:* Remove client-side seed calls, add rate limiting to all user-triggered edge function invocations, add file size validation.

---

## Category AI — Over-Fetching: `.select('*')` Without Column Projection (Bugs 436-470)

Every `.select('*')` fetches all columns including potentially large text fields like `raw_data`, `abstract`, `content`, `detailed_description`, wasting bandwidth.

**Bug 436** — `useBookmarks` selects `*` from `user_bookmarks`
**Bug 437** — `useSavedPosts` selects `*` from `user_saved_posts`
**Bug 438** — `useSavedIssues` selects `*` from `user_saved_issues`
**Bug 439** — `useStreaks` selects `*` from `user_streaks`
**Bug 440** — `useAchievements` selects `*` from `user_achievements`
**Bug 441** — `useNotifications` selects `*` from `notifications`
**Bug 442** — `useChatSessions` selects `*` from `chat_sessions` (includes full `messages` JSON)
**Bug 443** — `useResearchFeed` selects `*` from `research_items`
**Bug 444** — `useT1DNews` selects `*` from `t1d_news_articles` (includes `content`)
**Bug 445** — `useFoundConnections` selects `*` from `ai_found_connections` (includes JSON arrays)
**Bug 446** — `useClinicalTrialsDetailed` selects `*` including `raw_data`, `eligibility_criteria`
**Bug 447** — `useMedicalResearchPapers` selects `*` including `raw_data`
**Bug 448** — `useFDAData` selects `*` including `raw_data`
**Bug 449** — `useResearchFunding` selects `*` including `abstract`
**Bug 450** — `useT1DCompanies` selects `*` including JSON arrays `investors`, `key_people`, `products`
**Bug 451** — `useSurveys` selects `*` including `questions` (full JSON)
**Bug 452** — `useSurveyDemographics` selects `*` from `survey_demographics`
**Bug 453** — `useSurveySubmission` selects `*` from `survey_responses`
**Bug 454** — `useDeviceComparison` selects `*` from `devices` (could use specific columns)
**Bug 455** — `useMedicationComparison` selects `*` from `medications` twice
**Bug 456** — `useCompanyComparison` selects `*` from `t1d_companies`
**Bug 457** — `useCommunitySearch` selects `*` from `community_posts` (includes `content`)
**Bug 458** — `useProjects` selects `*` from `diabetic_health_projects`
**Bug 459** — `useDiabeticProfiles` selects `*` from `diabetic_profiles`
**Bug 460** — `useClaimedProjects` selects `*` from `claimed_projects`
**Bug 461** — `useDashboardLayout` selects `*` from `user_dashboard_layouts`
**Bug 462** — `useOnboarding` selects `*` from `user_preferences`
**Bug 463** — `useUserPreferences` selects `*` from `user_preferences`
**Bug 464** — `useDeviceReviews` selects `*` from `device_reviews`
**Bug 465** — `useExternalReviews` selects `*` from `external_device_reviews`
**Bug 466** — `useMedicationDetails` selects `*` from `medications`
**Bug 467** — `useMedicationReviews` selects `*` from `medication_reviews`
**Bug 468** — `useDeviceFixes` selects `*` from `device_user_fixes`
**Bug 469** — `useQualityOfLifeExperiences` selects `*` from `quality_of_life_experiences`
**Bug 470** — `useQualityOfLifeCategories` selects `category` only — this is correct, but could use `.select('category', { count: 'exact', head: true })` grouped approach

*Fix:* Replace `.select('*')` with explicit column lists in list queries. Keep `*` only for single-row detail queries.

---

## Category AJ — Missing Query Limits (Bugs 471-495)

**Bug 471** — `useBookmarks` has no `.limit()` on main query
**Bug 472** — `useSavedPosts` has no `.limit()` on main query
**Bug 473** — `useSavedIssues` has no `.limit()` on main query
**Bug 474** — `useStreaks` has no `.limit()` on main query (low risk — few rows per user)
**Bug 475** — `useAchievements` has no `.limit()` on main query (low risk)
**Bug 476** — `useFoundConnections` has no `.limit()` on main query
**Bug 477** — `useCompanyComparison` all-companies selector has no `.limit()`
**Bug 478** — `useDeviceComparison` all-devices selector has no `.limit()`
**Bug 479** — `useMedicationComparison` all-medications query has no `.limit()`
**Bug 480** — `useDeviceComparison.fetchComparisonData` fetches `device_reviews` for selected devices with no `.limit()`
**Bug 481** — `useDeviceComparison.fetchComparisonData` fetches `device_issues` for selected devices with no `.limit()`
**Bug 482** — `useDeviceAnalytics` fetches ALL devices with nested joins and no `.limit()`
**Bug 483** — `useT1DCompanies` main query has no `.limit()`
**Bug 484** — `useResearchFunding` re-fetch after edge function has no `.limit()`
**Bug 485** — `useCommunityDirectory` has no `.limit()`
**Bug 486** — `useCommunitySearch` "trending" query has `.limit()` but main search could exceed 1000
**Bug 487** — `useProjects` list query has no `.limit()`
**Bug 488** — `useProjects.featuredProjects` has no `.limit()`
**Bug 489** — `useDiabeticProfiles` connections query has no `.limit()`
**Bug 490** — `useClaimedProjects` has no `.limit()`
**Bug 491** — `useDeviceReviews` needs audit for `.limit()`
**Bug 492** — `useExternalReviews` needs audit for `.limit()`
**Bug 493** — `useMedicationReviews` needs audit for `.limit()`
**Bug 494** — `useMedicationInteractions` needs audit for `.limit()`
**Bug 495** — `useTrialMatching` has `.limit(50)` — good, but should be higher for comprehensive matching

*Fix:* Add `.limit(200-500)` to all unbounded list queries. Implement pagination for user-facing lists.

---

## Category AK — Toast Library Inconsistency (Bugs 496-510)

The codebase uses both `toast` from `sonner` and `useToast` from `@/hooks/use-toast`. This causes visual inconsistency.

**Bug 496** — `useBookmarks` uses `toast` from `sonner`
**Bug 497** — `useSavedPosts` uses `toast` from `sonner`
**Bug 498** — `usePushNotifications` uses `toast` from `sonner`
**Bug 499** — `useSavedIssues` uses `useToast` from custom hook
**Bug 500** — `useChatSessions` uses `useToast` from custom hook
**Bug 501** — `useNotifications` uses neither (mutations fail silently)
**Bug 502** — `useAchievements` uses `useToast` from custom hook
**Bug 503** — `useStreaks` uses neither (mutations fail silently)
**Bug 504** — `useEmailSubscription` uses `toast` from `sonner`
**Bug 505** — `useDirectMessages.useSendMessage` uses `useToast` from custom hook
**Bug 506** — `useClaimedProjects` needs audit
**Bug 507** — `useExperienceSubmissions` uses `toast` from `sonner`
**Bug 508** — Error handling inconsistent — some hooks show toasts, some fail silently, some throw
**Bug 509** — No central error handling middleware for mutations
**Bug 510** — Success toasts shown for every minor action (bookmark, save) can be noisy

*Fix:* Standardize on one toast library. Create mutation wrapper with consistent error/success handling.

---

## Category AL — Security: Defense-in-Depth Missing `user_id` Filters (Bugs 511-530)

**Bug 511** — `useChatSessions.getSession` fetches by `id` without `.eq('user_id', user.id)`
**Bug 512** — `useChatSessions.updateSession` updates by `id` without `.eq('user_id', user.id)` (line 168)
**Bug 513** — `useChatSessions.deleteSession` deletes by `id` without `.eq('user_id', user.id)` (line 186)
**Bug 514** — `useActiveChat.sendMessage` creates/updates sessions using IDs from local state — if tampered, could write to other sessions
**Bug 515** — `useSavedIssues.updateIssueSummary` uses `updateIssue.mutateAsync` which correctly has user_id — OK
**Bug 516** — `useNotifications.markAsRead` correctly has `.eq('user_id', user.id)` — OK
**Bug 517** — `useAchievements.updateProgress` upserts by `user_id,achievement_id` — OK but no guard against changing other users' achievements
**Bug 518** — `useStreaks.updateStreak` upserts by `user_id,streak_type` — OK
**Bug 519** — `usePushNotifications.subscribe/unsubscribe` upserts by `user_id` — OK
**Bug 520** — `useBookmarks.removeBookmark` has `.eq('user_id', user.id)` — OK
**Bug 521** — `useOnboarding` update queries need audit for user_id scoping
**Bug 522** — `useDashboardLayout` save function needs audit for user_id scoping
**Bug 523** — `useClaimedProjects` mutations need audit for user_id scoping
**Bug 524** — `useSurveySubmission` submit function needs audit for user_id scoping
**Bug 525** — `useUserPreferences.updatePreferences` upserts by `user_id` — OK
**Bug 526** — Chat session `suggested_questions` saved from stale closure (line 447) — data integrity issue
**Bug 527** — `useActiveChat.sendMessage` error rollback uses closure `messages` which may be stale
**Bug 528** — `useActiveChat` doesn't auto-load most recent session for context
**Bug 529** — No server-side validation that `context_id` in chat sessions belongs to the user
**Bug 530** — Direct messages `useMarkAsRead` marks messages as read without verifying they were actually sent to the current user (relies on `.eq('receiver_id', user.id)` — correct)

*Fix:* Add `.eq('user_id', user.id)` to all single-row operations in `useChatSessions` (getSession, updateSession, deleteSession).

---

## Category AM — Realtime Subscription Issues (Bugs 531-545)

**Bug 531** — `useConversation` realtime listens to ALL `direct_messages` with no filter (line 45)
**Bug 532** — `useConversation` client-side filters payload — wasteful for multi-user deployments
**Bug 533** — `useUnreadCounts` fetches ALL unread messages to count client-side (line 145-155)
**Bug 534** — No realtime subscription for `community_posts` — new posts require manual refresh
**Bug 535** — No realtime subscription for `user_achievements` — unlocked achievements don't update in other tabs
**Bug 536** — No realtime subscription for `user_streaks` — streak changes don't sync across tabs
**Bug 537** — `useNotifications` realtime correctly filters by `user_id` — good
**Bug 538** — `useUnreadCounts` realtime correctly filters by `receiver_id` — good
**Bug 539** — No reconnection logic if Supabase Realtime WebSocket drops
**Bug 540** — Multiple components create separate channels for the same table
**Bug 541** — Channel naming can collide if two components use same `otherUserId` pattern
**Bug 542** — No `presence` tracking for online/offline status of connections
**Bug 543** — Realtime channels not cleaned up when auth changes (user logs out/in)
**Bug 544** — `useConversation` channel creation/destruction on rapid `otherUserId` changes can cause race conditions
**Bug 545** — Realtime `INSERT` events on `notifications` don't include the full row — relying on query invalidation instead of direct cache update

*Fix:* Add server-side filters to all realtime subscriptions. Implement reconnection handling. Use RPC for unread counts.

---

## Category AN — Route & Navigation Bugs (Bugs 546-560)

**Bug 546** — `useGlobalSearch` maps trials to `/trials` but the page is `/trial-matching`
**Bug 547** — `useGlobalSearch` maps medications to `/medicines` — clicking doesn't open the detail modal
**Bug 548** — `useGlobalSearch` maps research to `/research-hub` — no way to deep-link to specific paper
**Bug 549** — `useGlobalSearch` maps community posts to `/community-solutions/${id}` — route may not exist
**Bug 550** — `ErrorBoundary` "Home" button uses `window.location.href = '/'` — full page reload, not SPA navigation
**Bug 551** — `ProtectedRoute` shows infinite spinner if `initialized` never becomes true
**Bug 552** — `ProtectedRoute` doesn't show any error state for auth failures
**Bug 553** — No 404 handling for invalid device IDs (e.g., `/devices/not-a-uuid`)
**Bug 554** — No 404 handling for invalid company IDs (e.g., `/companies/not-a-uuid`)
**Bug 555** — No 404 handling for invalid article slugs
**Bug 556** — `ScrollToTop` component may not work with all route transitions
**Bug 557** — Browser back button may not work correctly with modal-based routes (medication/device details)
**Bug 558** — `QAChecklist.tsx` page accessible without admin guard in routing
**Bug 559** — `SystemHealth.tsx` page accessible without admin guard
**Bug 560** — Deep links with query params (comparison pages) may not restore state on page load

*Fix:* Fix route mappings in global search. Add UUID validation to detail pages. Add admin guards to internal pages.

---

## Category AO — Component-Level Performance Issues (Bugs 561-580)

**Bug 561** — `SolutionCard` creates `useSavedPosts` per card — N queries for N cards
**Bug 562** — `useBookmarks.isBookmarked` iterates full array on every call — no Set-based lookup
**Bug 563** — `useT1DCompanies` computes `stats` synchronously on every fetch — should use `useMemo`
**Bug 564** — `useFoundConnections` sorting runs on every render via `useMemo` — but `allConnections` reference changes every fetch
**Bug 565** — `useT1DNews.filteredArticles` computed outside `useMemo` — re-runs every render
**Bug 566** — `useT1DNews.getCategoryCounts` wrapped in `useCallback` but returns new object every call
**Bug 567** — `useDeviceComparison` fires 4 separate Supabase queries sequentially — should use `.select()` with joins
**Bug 568** — `useCompanyComparison` fetches full company data with `select('*')` when only comparison fields are needed
**Bug 569** — `useAchievements.awardAchievement` in `useCallback` deps includes `getProgress` and `updateProgress` — recreates chain on every query refetch
**Bug 570** — `useEngagementTracking` calls both `recordVisit()` and `checkTrigger()` — two mutations on every daily mount
**Bug 571** — `useActionTracking` creates new async functions on every render — no `useCallback` wrapping
**Bug 572** — `useGlobalSearch` fires 8 parallel queries — could batch or use full-text search RPC
**Bug 573** — `useDeviceAnalytics` processes all devices client-side for stats — should compute server-side
**Bug 574** — `useQualityOfLifeExperiences` deduplicates 100 rows client-side — should fix at DB level
**Bug 575** — `useFundingTimeline` aggregates all data client-side instead of DB-level GROUP BY
**Bug 576** — `useCureMonitoring` computes stats client-side from all therapies
**Bug 577** — `useSourceCategories` fetches all posts to count by source — should use RPC
**Bug 578** — `useProductCategories` fetches all products to derive categories — should use DISTINCT
**Bug 579** — `useQualityOfLifeCategories` fetches all experiences to derive categories — should use DISTINCT
**Bug 580** — `useT1DHistory` categories derived from full dataset client-side

*Fix:* Use DB-level aggregation for counts/categories. Add joins to batch queries. Lift shared hooks to parent components.

---

## Category AP — Error Handling Gaps (Bugs 581-600)

**Bug 581** — `useResearchFeed` catch block sets error but doesn't clear stale data
**Bug 582** — `useT1DNews.refreshNews` sets edge function response directly without validation (line 99)
**Bug 583** — `useFoundConnections.triggerAnalysis` error only sets state — no toast
**Bug 584** — `useClinicalTrialsDetailed.refreshData` error only sets state — no toast
**Bug 585** — `useFDAData.refreshData` error only sets state — no toast
**Bug 586** — `useResearchFunding` silently swallows edge function errors if DB data exists (line 59)
**Bug 587** — `useMedicalResearchPapers` silently swallows edge function errors if DB data exists (line 107)
**Bug 588** — `useDeviceAnalytics.fetchDeviceData` silently swallows errors in catch
**Bug 589** — `useCompanyComparison.fetchAllCompanies` silently returns on error with no user feedback (line 41)
**Bug 590** — `useDeviceComparison.fetchAllDevices` silently returns on error (line 59)
**Bug 591** — `useRelatedCompanies` silently swallows errors (line 231)
**Bug 592** — `useBookmarks` catch blocks are empty `catch {}` (lines 46, 90, 111, 136, 157)
**Bug 593** — `ErrorBoundary` only catches synchronous render errors — not async/promise rejections
**Bug 594** — No global `window.addEventListener('unhandledrejection')` handler
**Bug 595** — No global `window.addEventListener('error')` handler for runtime errors
**Bug 596** — `useStreaks.recordVisit` silently fails — acceptable but should log
**Bug 597** — `useEngagementTracking` silently fails — acceptable but should log
**Bug 598** — `useNotifications.updatePreferences` mutation has no `onError` handler
**Bug 599** — `useNotifications.markAsRead` mutation has no `onError` handler
**Bug 600** — `useChatSessions.updateSession` `onError` is empty (line 176-177)

*Fix:* Add toast notifications for user-triggered actions. Add logging for background failures. Add global error handlers.

---

## Category AQ — Data Integrity & Race Conditions (Bugs 601-620)

**Bug 601** — `useActiveChat.sendMessage` depends on `messages` in closure — stale during streaming
**Bug 602** — `useActiveChat` saves `suggestedQuestions` from previous render, not current extraction (line 447)
**Bug 603** — `useActiveChat` error rollback `setMessages(messages)` uses stale closure value (line 460)
**Bug 604** — `useDeviceAnalytics.refreshCommunityFeed` nullifies cache then immediately fetches — race if another component reads cache between
**Bug 605** — `useT1DNews.refreshNews` sets `allArticles` from edge function response (line 99) without validating shape
**Bug 606** — `useBookmarks.toggleBookmark` checks `isBookmarked` synchronously but the add/remove is async — double-click causes double operation
**Bug 607** — `useSavedPosts.savePost` uses `saveMutation.mutate` (fire-and-forget) — no return value for callers to await
**Bug 608** — `useClaimedProjects.completeTask` reads from potentially stale state (line 158)
**Bug 609** — `useAchievements.updateProgress` reads from `getProgress` which uses `achievements` query data — could be stale
**Bug 610** — `useAchievements.awardAchievement` checks `isCompleted` from potentially stale `getProgress`
**Bug 611** — `useStreaks.updateStreak` correctly fetches fresh data inside mutation — good pattern not applied elsewhere
**Bug 612** — No optimistic updates on any mutation — all wait for refetch
**Bug 613** — `useBookmarks.addBookmark` calls `fetchBookmarks()` after insert — full list refetch
**Bug 614** — `useBookmarks.removeBookmark` calls `fetchBookmarks()` after delete — full list refetch
**Bug 615** — `useBookmarks.removeAllBookmarks` calls `fetchBookmarks()` after delete — unnecessary (list is empty)
**Bug 616** — `useSavedPosts` uses `queryClient.invalidateQueries` instead of `setQueryData` for optimistic updates
**Bug 617** — `useNotifications.markAsRead` invalidates `['notifications']` but query key is `['notifications', user.id]`
**Bug 618** — `useNotifications.markAllAsRead` same incorrect invalidation key
**Bug 619** — `useNotifications.updatePreferences` invalidates `['notification-preferences']` but key is `['notification-preferences', user.id]`
**Bug 620** — Partial query key invalidation (`['notifications']`) will still work (prefix match) but is broader than necessary

*Fix:* Fix stale closures with refs. Use precise query key invalidation. Add optimistic updates for common mutations.

---

## Category AR — Accessibility Issues (Bugs 621-640)

**Bug 621** — Toast notifications not announced to screen readers
**Bug 622** — Modal focus trap may not work correctly with nested modals
**Bug 623** — Keyboard shortcuts (`?` etc.) may conflict with browser defaults
**Bug 624** — No skip-to-content link on pages with long navigation (SkipToContent exists but may not cover all pages)
**Bug 625** — Color contrast not verified for all chart/graph components
**Bug 626** — Loading spinners have no `aria-label` text
**Bug 627** — `ErrorBoundary` error details in `<pre>` tag may not be readable by screen readers
**Bug 628** — Dynamic content updates (realtime messages) not announced via `aria-live`
**Bug 629** — Tab order may be incorrect in complex forms (medication review, device comparison)
**Bug 630** — No `role="alert"` on error messages in forms
**Bug 631** — Emoji badges (🔥, 🎯) used as meaningful content without `aria-label`
**Bug 632** — External links don't consistently indicate they open in new window
**Bug 633** — Chart components may not have text alternatives
**Bug 634** — Comparison tables may not have proper `<th>` scope attributes
**Bug 635** — Search results not announced when they update
**Bug 636** — No focus management after navigation (focus stays on clicked link)
**Bug 637** — `useReducedMotion` hook exists but may not be applied to all animations
**Bug 638** — `useRetinopathyMode` high-contrast mode may not cover all UI elements
**Bug 639** — Form validation errors may not be programmatically associated with inputs
**Bug 640** — Progress bars (achievements, streaks) may lack `aria-valuenow/min/max`

*Fix:* Audit all interactive elements for ARIA attributes. Add live regions for dynamic content. Verify color contrast.

---

## Category AS — SEO & Meta Issues (Bugs 641-655)

**Bug 641** — `usePageMeta` OG tags not cleaned up on unmount (partially fixed — audit completeness)
**Bug 642** — No dynamic `og:image` for article pages
**Bug 643** — No dynamic `og:image` for device detail pages
**Bug 644** — `useStructuredData` injects JSON-LD but only for organization — no per-page schemas
**Bug 645** — Article pages should have `Article` schema
**Bug 646** — FAQ pages should have `FAQPage` schema
**Bug 647** — Medical pages should have `MedicalWebPage` schema with `audience` property
**Bug 648** — No breadcrumb structured data on nested pages
**Bug 649** — Canonical URLs on paginated pages all point to the same base URL
**Bug 650** — No `robots` meta tag for internal-only pages (QA checklist, system health)
**Bug 651** — `sitemap.xml` likely doesn't exist or is not generated dynamically
**Bug 652** — No `hreflang` tags for potential internationalization
**Bug 653** — Page titles not unique across similar pages
**Bug 654** — Meta descriptions may be too long or too short
**Bug 655** — Social sharing (Twitter/OG) cards not tested or validated

*Fix:* Add per-page structured data. Generate dynamic OG images. Add robots meta to internal pages.

---

## Category AT — Security: Input Validation (Bugs 656-675)

**Bug 656** — `useTrialMatching` passes `phase` raw into `.ilike()` (line 53) — unsanitized
**Bug 657** — `useCommunityDirectory` passes `stateFilter` raw into `.or()` (line 27) — unsanitized
**Bug 658** — `useDirectMessages.useConversation` passes UUIDs raw into `.or()` string (line 28) — format validated by UUID but pattern unsafe
**Bug 659** — `useGlobalSearch` sanitizes search but constructs `searchTerm` with `%` wrapping — if sanitization misses edge case, injection possible
**Bug 660** — `useDeviceComparison` passes `selectedDeviceIds` into `.in()` — safe but no UUID format validation
**Bug 661** — `useMedicationComparison` passes IDs from URL params into `.in()` — URL can be tampered
**Bug 662** — `useCompanyComparison` passes IDs into `.in()` without validation
**Bug 663** — `ChatExport.handlePrint` HTML-escapes content but doesn't escape CSS injection in the style block
**Bug 664** — `ArticleDetail.tsx` uses `dangerouslySetInnerHTML` with `createSafeHTML` — need to verify sanitization is comprehensive
**Bug 665** — `useSavedIssues.updateIssueSummary` truncates chat content to 500 chars — no sanitization of the content
**Bug 666** — `useAchievements.updateProgress` inserts `definition.description` directly — if definitions are user-editable, XSS risk
**Bug 667** — `useNotifications` insert in `useAchievements` line 103 uses unsanitized `definition.name`
**Bug 668** — Community post `content` rendered in search results via `.slice(0, 100)` — no HTML sanitization
**Bug 669** — External review `content` may contain HTML from scraped sources
**Bug 670** — No Content-Security-Policy header configured
**Bug 671** — No rate limiting on auth endpoints (sign up, sign in)
**Bug 672** — Password requirements not enforced beyond Supabase defaults
**Bug 673** — No CAPTCHA on public forms (contact, feedback)
**Bug 674** — `DonationModal` amount input has no upper bound validation
**Bug 675** — `Shop.tsx` quantity input has no upper bound — could create huge Stripe line items

*Fix:* Sanitize all user inputs before query construction. Add CSP headers. Add rate limiting. Validate amounts.

---

## Category AU — Dead Code & Unused Features (Bugs 676-700)

**Bug 676** — `increment_story_upvotes` RPC still exists — now handled by trigger
**Bug 677** — `increment_review_helpful` RPC still exists — now handled by trigger
**Bug 678** — `increment_device_review_helpful` RPC still exists — now handled by trigger
**Bug 679** — `useGlobalSearch.sanitizeSearchTerm` duplicates `sanitizeForIlike` from `searchSanitizer.ts`
**Bug 680** — `ai-discovery-analyzer` edge function has no invocation path
**Bug 681** — `watch-data` edge function purpose is undocumented
**Bug 682** — `nightscout-sync` has no UI trigger
**Bug 683** — `scheduled-maintenance` has no scheduler
**Bug 684** — `data-orchestrator` invocation path unclear
**Bug 685** — `send-weekly-digest` exists but no scheduling mechanism
**Bug 686** — `send-trending-alerts` exists but alert preferences UI may not be wired
**Bug 687** — `charity-accrue` exists but charity feature is flagged off with no UI
**Bug 688** — `stripe-shop-webhook` exists but no webhook configured in Stripe
**Bug 689** — `mentor-notify` exists but mentor matching notifications not wired
**Bug 690** — `ShoppingCart` checkout permanently disabled (line 126)
**Bug 691** — `MedicationReviewForm` component exists but is never imported
**Bug 692** — `useAutoRefresh` `pauseOnHidden` behavior may have been partially fixed — verify
**Bug 693** — `usePerformanceMonitoring` comment mentions CWV but only tracks long tasks
**Bug 694** — Multiple `seed-*` functions exist for features that may not have UI
**Bug 695** — `dsar-export` exists but no "Download My Data" button in Settings
**Bug 696** — `verify-external-links` only triggered from admin — no automated schedule
**Bug 697** — `notification-triggers` function purpose overlaps with DB triggers
**Bug 698** — `analyze-glucose-ai` vs `analyze-glucose` — potentially duplicate
**Bug 699** — `useLocalAI` hook exists but WebLLM may not be practical for production
**Bug 700** — `useDynamicViewportHeight` orientation listener may leak (Bug 163 from original audit)

*Fix:* Drop orphaned RPCs. Document or remove unused edge functions. Consolidate duplicate code.

---

## Category AV — Missing Pagination (Bugs 701-720)

**Bug 701** — Community posts lists render all results at once
**Bug 702** — Device reviews render all at once in tabs
**Bug 703** — Medication reviews render all at once
**Bug 704** — External reviews render all at once
**Bug 705** — Bookmarks list has no pagination
**Bug 706** — Saved posts list has no pagination
**Bug 707** — Saved issues list has no pagination
**Bug 708** — Notifications list limited to 50 but no "load more"
**Bug 709** — Research papers list has no pagination
**Bug 710** — Clinical trials list has no pagination
**Bug 711** — FDA events list has no pagination
**Bug 712** — Companies list has no pagination
**Bug 713** — News articles limited to 100 but no pagination UI
**Bug 714** — Community search results have no infinite scroll or pagination
**Bug 715** — Device issues list has no pagination
**Bug 716** — Device fixes list has no pagination
**Bug 717** — Burnout posts have no pagination
**Bug 718** — Quality of life experiences limited to 100 but no "load more"
**Bug 719** — State forms have no pagination
**Bug 720** — Resources list has no pagination

*Fix:* Implement cursor-based or offset pagination for all list queries. Add "load more" or infinite scroll UI.

---

## Category AW — Missing Loading/Error/Empty States (Bugs 721-740)

**Bug 721** — `useFoundConnections` has no empty state UI when analysis returns 0 connections
**Bug 722** — `useResearchFeed` error state only sets string — no retry button in UI
**Bug 723** — `useT1DNews` error state only sets string — no retry button
**Bug 724** — `useDeviceAnalytics` error state only sets string — no retry button
**Bug 725** — `useClinicalTrialsDetailed` error state only sets string — no retry button
**Bug 726** — `useFDAData` error state only sets string — no retry button
**Bug 727** — `useResearchFunding` error state only sets string — no retry button
**Bug 728** — `useMedicalResearchPapers` error state only sets string — no retry button
**Bug 729** — Comparison pages show no guidance when 0 items selected
**Bug 730** — Search components show no "no results" state when search returns empty
**Bug 731** — Chat sessions list may show blank when loading
**Bug 732** — Device comparison shows no data when device ID is invalid UUID
**Bug 733** — `UserReviewsList` shows "No Reviews Yet" only for zero total reviews, not zero filtered
**Bug 734** — Skeleton loaders not consistent across pages
**Bug 735** — Error boundaries only at top level — no granular error boundaries for widgets
**Bug 736** — Loading states flash briefly on cached data (no `keepPreviousData` option used)
**Bug 737** — Community search shows no loading indicator during debounce period
**Bug 738** — Achievement unlock modal has no fallback if image fails to load
**Bug 739** — Donation success page shows no helpful info if redirected without session
**Bug 740** — Profile page shows no meaningful empty state for new users

*Fix:* Add consistent empty/error/loading states across all data-fetching pages. Use `keepPreviousData` in React Query.

---

## Category AX — Browser Compatibility & PWA Issues (Bugs 741-755)

**Bug 741** — `useSpeechToText` uses `webkitSpeechRecognition` — not available in Firefox
**Bug 742** — `useGlucoseForecast` Web Worker assumes `Worker` API — not available in all contexts
**Bug 743** — `BroadcastChannel` in auth store not available in all browsers
**Bug 744** — `navigator.serviceWorker` checks exist but no SW file verified at `/sw.js`
**Bug 745** — `indexedDB.databases()` in signOut may not be available in all browsers
**Bug 746** — `crypto.randomUUID()` used for idempotency — not available in older browsers
**Bug 747** — No PWA offline fallback page configured
**Bug 748** — No PWA install prompt handling
**Bug 749** — `useOfflineStatus` shows "reconnected" toast but doesn't refetch stale data
**Bug 750** — CSS `dvh` units used in viewport hook — not supported in all browsers
**Bug 751** — `IntersectionObserver` used without polyfill checks
**Bug 752** — `PerformanceObserver` for long tasks may not be supported in Safari
**Bug 753** — `ResizeObserver` used without polyfill in some components
**Bug 754** — No `<noscript>` fallback for JavaScript-disabled browsers
**Bug 755** — Print stylesheet may not exist for printable pages

*Fix:* Add feature detection before using Web APIs. Provide graceful fallbacks.

---

## Category AY — Testing Gaps (Bugs 756-775)

**Bug 756** — No integration tests for auth flow
**Bug 757** — No tests for React Query hooks
**Bug 758** — No tests for edge function invocations
**Bug 759** — No tests for realtime subscriptions
**Bug 760** — No tests for `useIdleLogout` throttling behavior
**Bug 761** — No tests for `useAutoRefresh` guard logic
**Bug 762** — No tests for `useGlucoseForecast` worker lifecycle
**Bug 763** — No tests for `useSpeechToText` recognition lifecycle
**Bug 764** — No tests for `useOfflineStatus` event handling
**Bug 765** — No tests for `searchSanitizer` edge cases
**Bug 766** — No tests for `urlValidator` edge cases
**Bug 767** — No tests for `useBookmarks` toggle behavior
**Bug 768** — No tests for vote tracking toggle (upvote/downvote)
**Bug 769** — No E2E tests for critical user flows
**Bug 770** — No visual regression tests
**Bug 771** — No load testing for concurrent user scenarios
**Bug 772** — No tests for `ErrorBoundary` error capture
**Bug 773** — No tests for `ProtectedRoute` redirect behavior
**Bug 774** — No tests for `AdminRoute` role checking
**Bug 775** — No tests for stale closure fixes

*Fix:* Expand test suite to cover critical paths. Add integration tests for auth and data flows.

---

## Category AZ — Miscellaneous Issues (Bugs 776-810)

**Bug 776** — React Router v6 deprecation warnings in console (visible in logs)
**Bug 777** — `v7_startTransition` future flag not set
**Bug 778** — `v7_relativeSplatPath` future flag not set
**Bug 779** — Console log spam from `usePerformanceMonitoring` long task detection (12+ warnings visible in logs)
**Bug 780** — `[GF] AppContent rendering` logged on every render — should be removed or gated
**Bug 781** — Initial page load shows 729ms long task — likely large bundle or expensive init
**Bug 782** — No code splitting/lazy loading for route-level components
**Bug 783** — All pages loaded eagerly — should use `React.lazy()` with `Suspense`
**Bug 784** — No bundle size analysis or optimization
**Bug 785** — Images not lazy-loaded
**Bug 786** — No `loading="lazy"` on off-screen images
**Bug 787** — No WebP/AVIF image optimization
**Bug 788** — No CDN configured for static assets
**Bug 789** — Cookie consent stored in localStorage — no actual cookie management
**Bug 790** — GDPR compliance: no cookie policy page
**Bug 791** — GDPR compliance: no data processing records
**Bug 792** — HIPAA note: medical data handling disclaimers may need legal review
**Bug 793** — Terms of Service page exists but may not cover all features
**Bug 794** — Privacy Policy page exists but may not cover all data processing
**Bug 795** — No rate limiting on contact form submissions (client or server)
**Bug 796** — No CSRF protection on form submissions
**Bug 797** — Session timeout (30 min) may be too long for medical data
**Bug 798** — No audit logging for admin actions
**Bug 799** — No audit logging for data deletions
**Bug 800** — No data retention policy or automated cleanup
**Bug 801** — `useIdleLogout` countdown state not displayed in UI until warning period
**Bug 802** — No "session expiring" warning before forced logout
**Bug 803** — Auth token refresh errors silently clear session — user sees unexpected logout
**Bug 804** — No "remember me" option on login
**Bug 805** — Password reset flow may not validate token expiry
**Bug 806** — No account lockout after failed login attempts
**Bug 807** — Display name stored as "User" fallback — no profile completion prompt
**Bug 808** — `useOnboarding.completeOnboarding` stores role in `bio` field as string (Bug 306 unfixed)
**Bug 809** — No data export feature for users (GDPR right to portability)
**Bug 810** — No account deletion flow for users (GDPR right to erasure)

---

## Implementation Priority

**Phase A — Remaining React Query Migration (Bugs 311-325, 366-385)**
Migrate ~20 remaining hooks from manual useState/useEffect to React Query. Remove all module-level caches.

**Phase B — Edge Function Auth Hardening (Bugs 386-435)**
Add `requireAuth`/`requireAdmin` to ~50 edge functions. Remove client-side seed invocations. Add rate limits.

**Phase C — Type Safety Cleanup (Bugs 341-365)**
Remove all `as any` casts. Use proper TypeScript generics and type guards.

**Phase D — Query Optimization (Bugs 436-495)**
Replace `.select('*')` with column projections. Add `.limit()` to all unbounded queries. Implement pagination.

**Phase E — Data Integrity (Bugs 601-620)**
Fix stale closures with refs. Add optimistic updates. Fix query key invalidation.

**Phase F — Security Hardening (Bugs 511-530, 656-675)**
Add `user_id` filters. Sanitize inputs. Add CSP headers.

**Phase G — Toast & Error Standardization (Bugs 496-510, 581-600)**
Pick one toast library. Add consistent error handling. Add global error handlers.

**Phase H — Realtime Optimization (Bugs 531-545)**
Add server-side filters. Implement reconnection. Use RPC for counts.

**Phase I — Performance (Bugs 561-580, 776-788)**
Code splitting. Lazy loading. DB-level aggregation. Bundle optimization.

**Phase J — Accessibility & SEO (Bugs 621-655)**
ARIA attributes. Structured data. Focus management.

**Phase K — Pagination & UI Polish (Bugs 701-740)**
Implement pagination for all list queries. Add empty/error/loading states.

**Phase L — Dead Code Removal (Bugs 676-700)**
Drop orphaned RPCs. Remove unused edge functions. Consolidate duplicates.

**Phase M — Testing & Compliance (Bugs 756-810)**
Expand test suite. Address GDPR/compliance gaps. Add audit logging.

---

## Technical Summary

**Total scope (new bugs 311-810):**
- ~20 hooks migrated to React Query
- ~50 edge functions hardened with auth
- ~35 hooks patched for column projection
- ~25 hooks patched for query limits
- ~15 hooks fixed for type safety
- ~20 components fixed for accessibility
- ~20 list views need pagination
- ~15 files for dead code removal
- ~10 global infrastructure additions (CSP, code splitting, error handlers)
- ~20 test files to create

