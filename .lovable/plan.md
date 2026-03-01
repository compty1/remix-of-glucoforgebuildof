

# Comprehensive Fix Plan: Devices & Medicines Reviews System (150+ Issues)

This plan addresses all identified gaps across ratings, source logos, data quality, UI/UX, data retrieval, accessibility, and code quality. Issues are numbered for tracking.

---

## CRITICAL ISSUES (50)

### Rating & Score Calculation (C1-C12)
- **C1**: DeviceHero line 72-74 calculates rating from `(reliability_score + social_setting_score) / 20` instead of `device.avg_rating` (shows ~0.0-5.0 from wrong formula vs actual 3.06-3.35)
- **C2**: DeviceAnalytics line 221 uses same wrong formula `(reliability + social) / 20`
- **C3**: `device_metrics.total_reviews` is stale seeded data (e.g. Medtronic 780G shows 2,090 but only has 11 real reviews)
- **C4**: MedicationDetailModal line 220 shows stale `rating_avg` (seed data like 4.1) instead of computed `avg_rating` (e.g. Admelog: rating_avg=4.1 but avg_rating=1.50)
- **C5**: MedicationCard line 113 uses `medication.rating_avg` instead of `avg_rating`
- **C6**: "Reference Data" badge hardcoded on line 230 even after real ratings are computed
- **C7**: 6 medications have NULL avg_rating (Humulin N, Humulin R U-500, Novolin N, Precose, Retatrutide, Zynquista) -- 0 external reviews
- **C8**: `review_count` mismatch -- fragile since user reviews can change but recalculation only runs weekly
- **C9**: Two competing rating systems: `rating_avg` (seed) vs `avg_rating` (computed) -- causes confusion
- **C10**: DeviceHero `totalReviews` counts community_posts, not actual device/external reviews
- **C11**: Device review tab header uses `reviewStats.total` (community posts count), not reviews
- **C12**: `update_device_avg_rating` trigger overwrites combined score when user submits review (conflicts with `recalculate_device_ratings`)

### Source Logo & Display (C13-C20)
- **C13**: No actual source logos anywhere -- only colored text badges (no Reddit icon, no Drugs.com logo, etc.)
- **C14**: 161 device reviews have source "web" with no meaningful attribution
- **C15**: Source name inconsistency in DB: "beyond type 1" vs "beyondtype1", "the diabetes link" vs "thediabeteslink", "integrated diabetes" -- creates duplicates in filters
- **C16**: MedicationDetailModal hardcodes only 4 official sources (`drugs.com, webmd, healthline, google`) while devices check a different list
- **C17**: Device Community Buzz social filter (`reddit, forum, facebook, youtube, medium, twitter`) misses non-social sources like "pmc", "podcasts", "news" which leak into social tab
- **C18**: `getSourceDisplayName` duplicated in 3 files (ExternalReviewCard, DeviceReviewsTab, MedicationDetailModal) with different mappings
- **C19**: ExternalReviewCard's known sources map differs from DeviceReviewsTab's map -- same source displays differently
- **C20**: Source badge colors inconsistent across components (different color schemes for same source)

### Data Quality & Filtering (C21-C30)
- **C21**: useMedicationDetails has ~17 JUNK_MARKERS vs useExternalReviews has 35+ -- medication reviews poorly filtered
- **C22**: External medication reviews capped at `.limit(50)` (line 82 useMedicationDetails) -- truncates data for meds with 100+ reviews
- **C23**: Buzz posts merged into `externalReviews` array making it impossible to reliably separate consumer from social
- **C24**: Content sanitization regex duplicated 3 times (ExternalReviewCard lines 32-43, MedicationDetailModal lines 400-406 and 477-483) with slight differences
- **C25**: ExternalReviewCard has no `line-clamp` on content -- creates extremely long cards
- **C26**: No pagination for official external reviews in Consumer Reviews tab (renders all at once)
- **C27**: `isValidReviewContent` minimum length at 50 chars too low -- short junk passes through
- **C28**: Community posts search too broad -- `.or()` matches brand name across all posts, returning unrelated content
- **C29**: No deduplication of external reviews scraped from different URLs
- **C30**: Medication community buzz excludes only 4 official sources -- academic sources like "pmc" end up in buzz tab

### UI/UX Issues (C31-C40)
- **C31**: UserReviewsList line 81-85 always shows "Demo Reviews" banner for ALL reviews including real user submissions
- **C32**: UserReviewsList line 94 hardcodes "Demo Data" badge on stats regardless of review authenticity
- **C33**: MedicationDetailModal nested ScrollArea (line 148 outer + line 301 inner) causes scroll-in-scroll UX problem
- **C34**: No loading state for Consumer Reviews in DeviceReviewsTab when external reviews loading
- **C35**: Device `refresh()` function (useDeviceDetails line 242-247) sets loading=true but never triggers re-fetch
- **C36**: Review form accessible to unauthenticated users but submit throws "You must be logged in"
- **C37**: Medication "Write a Review" checks `user && !userExistingReview` but doesn't verify email confirmation
- **C38**: MedicationDetailModal line 412 still has `aria-label="Platform review"` -- should be "Consumer review"
- **C39**: Device comparison page not linked from device detail page
- **C40**: FDA event filter buttons overflow on mobile (no flex-wrap)

### Data Retrieval & Performance (C41-C50)
- **C41**: useDeviceDetails makes 7 sequential queries instead of using Promise.all
- **C42**: useDeviceDetails uses manual module-level cache instead of React Query (inconsistent with rest of app)
- **C43**: useDeviceReviews uses useEffect+useState instead of React Query -- missing query invalidation
- **C44**: Medication external reviews capped at 50 via `.limit(50)` -- incomplete data
- **C45**: Community posts limited to 100 -- some devices may have more
- **C46**: No error boundary on device detail tabs -- any tab crash kills entire page
- **C47**: Device details cache (module-level object) never invalidated, persists across navigations
- **C48**: MedicationCard redefines Medication interface (lines 9-26) instead of importing from useMedications
- **C49**: `toggleHelpful` for medications always increments via RPC with no duplicate vote prevention
- **C50**: Device review toggleHelpful calls `fetchReviews()` which re-fetches everything after each vote

---

## NON-CRITICAL ISSUES (100)

### UI Polish & Consistency (N1-N25)
- **N1**: Tab label "Community" in MedicationDetailModal should be "Community Buzz" to match devices
- **N2**: MedicationDetailModal TabsList uses `sm:grid-cols-6` -- fragile if tab count changes
- **N3**: ExternalReviewCard shows "helpful" count but external reviews have no voting mechanism
- **N4**: Device review form doesn't show character count for content field
- **N5**: MedicationDetailModal review form uses native `<input type="checkbox">` instead of Radix Checkbox
- **N6**: Star rating in MedicationDetailModal uses plain buttons instead of StarRating component (which exists for devices)
- **N7**: DeviceAnalytics "Small Fixes, Massive Relief" section white text may be unreadable on light themes
- **N8**: No skeleton loading state for MedicationDetailModal external reviews section
- **N9**: Source filter buttons in DeviceReviewsTab Community tab overflow horizontally without wrapping
- **N10**: "View Original" link text in ExternalReviewCard not descriptive for accessibility
- **N11**: DeviceHero shows both EntityLogo for device image and EntityLogo for company logo -- redundant
- **N12**: Badge `text-[10px]` in MedicationCard is non-standard Tailwind
- **N13**: MedicationCard truncates name with `truncate` class -- hides important info
- **N14**: DeviceOverviewTab shows "No description available" when null -- unhelpful
- **N15**: No currency formatting for prices (just `$X` string concatenation)
- **N16**: DeviceReviewsTab `combinedStats` double-counts by adding community posts + external reviews but not user reviews
- **N17**: MedicationDetailModal "Real Usage" tab derives stats only from user reviews, not external
- **N18**: No visual distinction between verified and unverified reviews
- **N19**: Device tabs use icon+text while medication modal uses text-only -- inconsistent
- **N20**: Reddit fallback URL encodes full content slice creating very long URLs
- **N21**: No "back to top" button on long device detail pages
- **N22**: RelatedDevicesSection limited to 4 devices with no "see more"
- **N23**: FDA event cards in DeviceAnalytics don't have consistent height
- **N24**: Community Buzz sentiment stats in DeviceReviewsTab include ALL external reviews, not just social ones
- **N25**: ExternalReviewCard helpful count display is misleading since users can't vote on external reviews

### Data Integrity & Logic (N26-N50)
- **N26**: `rating_avg` column is stale seed data that should be deprecated
- **N27**: Device `review_count` updated by both trigger and RPC -- race condition
- **N28**: `recalculate_device_ratings` sentiment mapping (pos=4.5, neu=3.0, neg=1.5) undocumented
- **N29**: `isVerifiedSource` in ExternalReviewCard just checks for valid URL -- "Source Linked" misleading
- **N30**: MedicationDetailModal buzz post title artificially truncated to 80 chars from content
- **N31**: `helpful_count` for buzz capped at 100 (`MAX_HELPFUL_COUNT`) -- arbitrary cap
- **N32**: Source categories in `sourceCategories.ts` only handle Reddit subreddits, not other sources
- **N33**: `getSourceCategory` strips "r/" prefix inconsistently
- **N34**: No verified index on `external_device_reviews.device_id`
- **N35**: No verified index on `external_medication_reviews.medication_id`
- **N36**: MedicationDetailModal doesn't display `avg_rating` at all (uses `rating_avg`)
- **N37**: Community posts search uses `.or()` with string concatenation -- potential injection vector
- **N38**: Unclear if `review_helpful_votes` table has RLS policies
- **N39**: Medication review `toggleHelpful` uses RPC, device uses direct table insert -- inconsistent
- **N40**: `increment_review_helpful` and `increment_device_review_helpful` are separate functions doing same thing
- **N41**: No cleanup of orphaned external reviews when device/medication deleted
- **N42**: Community post sentiment calculation only counts exact matches
- **N43**: Medication `would_recommend` % only from user reviews, not external
- **N44**: Device `ownership_duration` has no validation or enumerated values
- **N45**: No mechanism to report/flag inappropriate external reviews
- **N46**: `author_anonymous` field often null -- always shows "Anonymous"
- **N47**: `fetched_at` timestamp not used for staleness detection
- **N48**: Device `verified_owner` field exists but never set to true
- **N49**: No rate limiting on review submission endpoints
- **N50**: Medication community buzz tab content not truncated with `line-clamp` (line 502)

### Missing Features & Gaps (N51-N75)
- **N51**: No source logo images (favicon/icon) displayed alongside source badges
- **N52**: No aggregated sentiment chart in device Consumer Reviews tab
- **N53**: No "most mentioned" topics extraction from external reviews
- **N54**: No way to search/filter external reviews by keyword
- **N55**: No review count trend visualization
- **N56**: No "review quality" scoring to surface informative reviews
- **N57**: No mechanism for users to flag inaccurate external reviews
- **N58**: No "similar medications" recommendation based on review sentiment
- **N59**: No export functionality for review data
- **N60**: No sharing functionality for individual reviews
- **N61**: No deep-link to specific review
- **N62**: No review response/reply mechanism
- **N63**: No review photo/image upload for user reviews
- **N64**: No side-by-side review comparison between devices
- **N65**: No "verified purchase" badge system
- **N66**: No notification when someone marks your review helpful
- **N67**: No review draft auto-save
- **N68**: No "review of the week" or featured highlight
- **N69**: No aggregate sentiment score on hub page cards
- **N70**: No timeline view of sentiment change over time
- **N71**: MedicationHub cards don't show review count from computed data
- **N72**: No breadcrumb navigation on device detail page
- **N73**: No print-friendly view for device specs
- **N74**: No review guidelines or community standards displayed
- **N75**: No automated spam detection for user reviews

### Accessibility & Standards (N76-N90)
- **N76**: Star rating in MedicationDetailModal review form lacks `role="radiogroup"` ARIA attribute
- **N77**: Source filter buttons in DeviceReviewsTab lack consistent `aria-pressed` attribute
- **N78**: ExternalReviewCard "helpful" count looks clickable but isn't interactive
- **N79**: MedicationDetailModal sort buttons lack `aria-pressed`
- **N80**: No skip-to-content link on device detail page
- **N81**: Color-only sentiment indicators need text labels for colorblind users -- inconsistent
- **N82**: Star rating in MedicationCard doesn't have aria-label for screen readers
- **N83**: DeviceAnalytics score color relies on color alone
- **N84**: No `aria-live` region for dynamically loaded review content
- **N85**: Tab panels lack `aria-label` or `aria-labelledby`
- **N86**: "Load More" buttons don't announce new content to screen readers
- **N87**: External review cards lack unique `id` attributes for deep linking
- **N88**: MedicationDetailModal dialog doesn't trap focus properly with nested ScrollArea
- **N89**: Device review form validation errors not announced to screen readers
- **N90**: No keyboard shortcut to navigate between reviews

### Performance & Code Quality (N91-N100)
- **N91**: DeviceReviewsTab re-creates `socialSources` array on every render inside IIFE (lines 187, 289)
- **N92**: MedicationDetailModal has duplicated sanitize function (lines 400, 477)
- **N93**: `getSourceDisplayName` in 3+ files instead of shared utility
- **N94**: `getSourceBadge` color mapping duplicated across components
- **N95**: DeviceAnalytics renders all device cards without virtualization
- **N96**: No memoization on ExternalReviewCard despite being rendered in lists
- **N97**: useDeviceReviews re-fetches all reviews on every helpful vote
- **N98**: Module-level cache in useDeviceDetails not garbage collected
- **N99**: Community posts query constructs complex `.or()` filter string on every render
- **N100**: Large inline IIFE render functions in DeviceReviewsTab and MedicationDetailModal hurt readability

---

## IMPLEMENTATION PLAN (6 Phases)

### Phase 1: Fix Critical Rating Display (C1-C12)
**Files:** `DeviceHero.tsx`, `DeviceAnalytics.tsx`, `MedicationCard.tsx`, `MedicationDetailModal.tsx`, `DeviceDetail.tsx`
**Database:** Drop or modify `update_device_avg_rating` trigger to not conflict with RPC

1. Update `DeviceHero.tsx` line 72-74: Replace `(reliability_score + social_setting_score) / 20` with `device.avg_rating || 0`
2. Update `DeviceAnalytics.tsx` line 221: Same fix -- use `device.avg_rating`
3. Update `MedicationCard.tsx` line 113: Use `medication.avg_rating ?? medication.rating_avg` (graceful fallback)
4. Update `MedicationDetailModal.tsx` line 220-230: Use `avg_rating`, remove "Reference Data" badge when computed rating exists
5. Fix `DeviceDetail.tsx`: Pass combined review count (external + user + community) to DeviceHero instead of community-only `reviewStats.total`
6. Database migration: Modify `update_device_avg_rating` trigger to call `recalculate_device_ratings()` instead of computing only from user reviews
7. Run `recalculate_medication_ratings()` after fixing 6 NULL-rating medications

### Phase 2: Create Shared Source Utilities & Add Logos (C13-C20, N51, N91-N94)
**New file:** `src/utils/sourceConfig.ts`
**Modified:** `ExternalReviewCard.tsx`, `DeviceReviewsTab.tsx`, `MedicationDetailModal.tsx`

1. Create `src/utils/sourceConfig.ts` with:
   - Unified `SOURCE_CONFIG` map: source key -> `{ displayName, domain, isOfficial, badgeColor }`
   - `getSourceLogo(source)` returning `https://icons.duckduckgo.com/ip3/{domain}.ico`
   - `getSourceDisplayName(source, url?)` single implementation
   - `getSourceBadgeColor(source)` single implementation
   - `OFFICIAL_SOURCES` constant array (drugs.com, webmd, healthline, google, pubmed, fda, consumerguide, etc.)
   - `SOCIAL_SOURCES` constant array (reddit, forum, facebook, youtube, medium, twitter, podcasts)
   - `isOfficialSource(source)` and `isSocialSource(source)` helper functions
2. Add source favicon `<img>` element next to text badge in ExternalReviewCard
3. Replace all 3 duplicated `getSourceDisplayName` and `getSourceBadge` with imports from shared utility
4. Normalize "web" source reviews to extract domain from URL for display
5. Update MedicationDetailModal to use shared `OFFICIAL_SOURCES` list (currently hardcodes 4)
6. Fix Community Buzz filter to use `isSocialSource()` instead of hardcoded array

### Phase 3: Fix Data Quality & Filtering (C21-C30, N50)
**Files:** `useMedicationDetails.ts`, `useExternalReviews.ts`, `DeviceReviewsTab.tsx`, `MedicationDetailModal.tsx`
**New file:** `src/utils/reviewSanitizer.ts`

1. Create `src/utils/reviewSanitizer.ts` with unified `sanitizeContent()` and `JUNK_MARKERS` (35+ markers)
2. Sync JUNK_MARKERS in `useMedicationDetails.ts` to match `useExternalReviews.ts`
3. Remove `.limit(50)` cap on medication external reviews (increase to 500)
4. Separate buzz posts from external reviews in `useMedicationDetails` return type -- add `buzzPosts` as distinct field
5. Add `line-clamp-6` to ExternalReviewCard content (line 190-192)
6. Add `line-clamp-4` to medication community buzz content (line 502)
7. Add "Load More" pagination (show 10, load 10 more) to Consumer Reviews tab in `DeviceReviewsTab.tsx`
8. Increase `isValidReviewContent` minimum from 50 to 80 chars
9. Tighten community post search: require full device name match, not just brand

### Phase 4: Fix UI/UX Issues (C31-C40, N1, N5, N6)
**Files:** `UserReviewsList.tsx`, `MedicationDetailModal.tsx`, `useDeviceDetails.ts`, `DeviceReviewsTab.tsx`

1. Remove hardcoded "Demo Reviews" and "Demo Data" UI elements from UserReviewsList (lines 79-86, 94)
2. Instead, detect seed reviews by checking if user_id matches known seed UUIDs starting with `00000000-`; only show "Sample data" label on those specific reviews
3. Fix MedicationDetailModal nested ScrollArea: remove inner ScrollArea on line 301
4. Add loading state for Consumer Reviews tab (check `externalLoading` in user tab too)
5. Fix `refresh()` in useDeviceDetails: delete cache entry and toggle a state variable to re-trigger useEffect
6. Add auth guard on review form: hide form when not logged in, show "Sign in to review" button instead
7. Rename "Community" tab to "Community Buzz" in MedicationDetailModal (line 141)
8. Replace native checkbox with Radix Checkbox in medication review form (line 284)
9. Fix aria-label "Platform review" -> "Consumer review" (line 412)
10. Add `flex-wrap` to FDA filter buttons in DeviceAnalytics

### Phase 5: Fix Data Retrieval & Performance (C41-C50, N96-N97)
**Files:** `useDeviceDetails.ts`, `useDeviceReviews.ts`, `useMedicationDetails.ts`

1. Refactor `useDeviceDetails.ts` to use `Promise.all` for all 7 queries after device fetch
2. Migrate `useDeviceDetails` to React Query (`useQuery`) -- remove manual cache and useState
3. Increase medication external review limit from 50 to 500
4. Add React error boundaries around each TabsContent in DeviceDetail
5. Fix medication `toggleHelpful` to check for existing vote before incrementing (match device pattern with `review_helpful_votes` table)
6. Optimize device review `toggleHelpful` to update local state optimistically instead of full re-fetch
7. Wrap `ExternalReviewCard` in `React.memo`

### Phase 6: Non-Critical Polish (N2-N100 remaining)
**Files:** Various component files

1. Consolidate source utilities (done in Phase 2)
2. Add source favicons everywhere (done in Phase 2)
3. Fix accessibility: add `aria-pressed` to all filter/sort toggle buttons, `role="radiogroup"` to star rating, `aria-live` regions for dynamic content
4. Memoize list components
5. Extract inline IIFEs in DeviceReviewsTab and MedicationDetailModal into named sub-components
6. Remove duplicate Medication interface from MedicationCard -- import from useMedications
7. Database migration: Normalize duplicate source names (merge "beyond type 1" and "beyondtype1" etc.)
8. Add indexes on `external_device_reviews.device_id` and `external_medication_reviews.medication_id` if missing

### Execution Order
1. Phase 2 first (shared utilities -- needed by other phases)
2. Phase 3 (data quality fixes)
3. Phase 1 (rating display -- depends on clean data)
4. Phase 4 (UI/UX fixes)
5. Phase 5 (performance)
6. Phase 6 (polish)
7. Database migrations for trigger fix, source normalization, indexes
8. Run recalculation RPCs
9. End-to-end verification

