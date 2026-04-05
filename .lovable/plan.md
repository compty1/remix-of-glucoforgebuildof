

# Full Review System Audit: Findings, Bugs, and Enhancement Plan

## Current Architecture Overview

The review system spans 6 database tables, 4 edge functions, 5 client-side hooks, and multiple UI components across devices and medications.

```text
┌─────────────────────────────────────────────────────────────┐
│                    REVIEW DATA FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Edge Functions (Firecrawl scraping)                        │
│    fetch-device-reviews ──► external_device_reviews (1,377) │
│    fetch-medication-reviews ──► external_medication_reviews  │
│                                  (11,226)                   │
│                              ──► medication_community_buzz   │
│                                  (1,301)                    │
│  refresh-reviews (orchestrator) ── calls both above         │
│                                                             │
│  User-generated reviews                                     │
│    device_reviews (0 rows)                                  │
│    medication_reviews (0 rows)                              │
│    review_helpful_votes (0 rows)                            │
│                                                             │
│  Client Hooks                                               │
│    useDeviceReviews ── manual useState/useEffect pattern    │
│    useExternalReviews ── React Query                        │
│    useMedicationDetails ── React Query (combines all)       │
│    useMedicationReviews ── React Query mutations            │
│    useDeviceDetails ── React Query (community_posts)        │
│                                                             │
│  UI Components                                              │
│    DeviceReviewsTab (Consumer + Community Buzz tabs)        │
│    UserReviewsList / UserReviewCard / UserReviewForm        │
│    ExternalReviewCard                                       │
│    MedicationDetailModal                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Bugs Found

### BUG 1: Medication `toggleHelpful` is one-way only (cannot un-vote)
`useMedicationReviews.toggleHelpful` calls `increment_review_helpful` RPC which only ever **adds** +1. There is no toggle/un-vote logic. The device reviews hook correctly checks `user_has_voted` and deletes/inserts from `review_helpful_votes`, but the medication version has no equivalent vote-tracking table or logic. Clicking "helpful" on a medication review increments the count every time with no limit.

### BUG 2: Device external reviews have 326 URL-based duplicates in database
The `fetch-device-reviews` edge function uses `Math.random()` for `external_id`, so the same URL can be inserted multiple times under different random IDs. The unique constraint is on `(source, external_id)` but since `external_id` is random, duplicates by URL slip through. Same issue exists for medication reviews (473 URL duplicates).

### BUG 3: `useDeviceReviews` does not use React Query
Unlike every other data hook in the project, `useDeviceReviews` uses manual `useState`/`useEffect`. This causes: inconsistent caching, no automatic deduplication, `sortBy` changes in the dependency array trigger re-fetches with full loading states, and no integration with the global React Query cache invalidation strategy.

### BUG 4: Device sentiment analysis is heavily skewed neutral (90%)
Device reviews have 1,239 neutral / 125 positive / 13 negative. The sentiment analyzer requires `pos > neg + 1` which means a review with 1 positive word and 0 negative words is still "neutral." The medication analyzer uses a better `1.5x` ratio and `total < 2` guard, but the device one does not.

### BUG 5: Junk content filter not applied in edge functions consistently
`fetch-device-reviews` has its own `JUNK_MARKERS` list (64 items) and `fetch-medication-reviews` has a separate `REDDIT_JUNK` list (7 items). The shared `reviewSanitizer.ts` (52 markers) is only used client-side. There are 139 junk rows in `external_medication_reviews` that passed the weaker server-side filter but are being filtered client-side, wasting storage and bandwidth.

### BUG 6: `published_at` defaults to `new Date().toISOString()` for scraped reviews
Both edge functions set `published_at` to the current fetch time when no date is found. This makes it impossible to distinguish when reviews were actually written vs. when they were scraped. Sorting by "recent" becomes meaningless for scraped content.

---

## Data Quality Issues

| Issue | Device Reviews | Medication Reviews |
|-------|---------------|-------------------|
| Short content (<80 chars) | 1 row | 137 rows |
| URL duplicates | 326 pairs | 473 pairs |
| Junk content in DB | 2 rows | 139 rows |
| User reviews | 0 rows | 0 rows |
| Random external_id | All rows | All rows |

---

## Enhancement Plan

### Step 1: Fix medication helpful voting (BUG 1)
- Create a `medication_review_helpful_votes` table mirroring `review_helpful_votes`
- Add RLS policies (select public, insert/delete for authenticated own rows)
- Add a trigger to update `medication_reviews.helpful_count` on insert/delete
- Refactor `useMedicationReviews.toggleHelpful` to check existing vote and insert/delete accordingly with optimistic updates

### Step 2: Migrate `useDeviceReviews` to React Query (BUG 3)
- Rewrite using `useQuery` for fetching and `useMutation` for submit/update/delete/toggleHelpful
- Align with the pattern used by `useExternalReviews` and `useMedicationReviews`
- Removes manual `useState`/`useEffect` and gains automatic caching, deduplication, and stale-while-revalidate

### Step 3: Fix external_id generation to prevent duplicates (BUG 2)
- In both `fetch-device-reviews` and `fetch-medication-reviews`, generate deterministic `external_id` from a hash of `source_url` (or `source + title_prefix + content_prefix` when no URL)
- Use `upsert` with `onConflict: 'source,external_id'` instead of plain `insert` to update existing rows rather than silently failing
- Add a one-time migration to deduplicate existing rows by `source_url`

### Step 4: Unify sentiment analysis (BUG 4)
- Create a shared `analyzeSentiment` function in `supabase/functions/_shared/sentiment.ts`
- Use the better medication-side algorithm (`1.5x` ratio, `total < 2` guard) for both device and medication reviews
- Add more domain-specific positive/negative word lists

### Step 5: Move junk filtering server-side (BUG 5)
- Create `supabase/functions/_shared/junkFilter.ts` with the canonical JUNK_MARKERS list
- Apply filtering in edge functions before database insertion
- Run a one-time cleanup migration to delete rows matching junk patterns
- Keep the client-side `isValidReviewContent` as a defense-in-depth layer

### Step 6: Fix `published_at` handling (BUG 6)
- Set `published_at` to `NULL` when no date is found instead of `new Date()`
- Update UI components to show "Date unknown" instead of misleading recent dates
- Prevents false "recent" sorting

### Step 7: Data cleanup migration
- Deduplicate `external_device_reviews` by `source_url` (keep highest `helpful_count`)
- Deduplicate `external_medication_reviews` by `source_url`
- Delete rows with `LENGTH(content) < 80`
- Delete rows matching junk markers
- Expected cleanup: ~500+ device dupes, ~600+ medication dupes, ~140 junk rows

---

## Technical Details

**Database changes required:**
- New table: `medication_review_helpful_votes` (id, review_id FK, user_id, created_at, unique on review_id+user_id)
- New trigger: `update_medication_review_helpful_count` on the new votes table
- Cleanup migration: dedup + junk removal

**Files to modify:**
- `src/hooks/useDeviceReviews.ts` — full rewrite to React Query
- `src/hooks/useMedicationReviews.ts` — fix toggleHelpful
- `supabase/functions/fetch-device-reviews/index.ts` — deterministic IDs, shared sentiment/junk
- `supabase/functions/fetch-medication-reviews/index.ts` — deterministic IDs, shared sentiment/junk
- `supabase/functions/_shared/sentiment.ts` — new shared module
- `supabase/functions/_shared/junkFilter.ts` — new shared module

**New files:**
- `supabase/functions/_shared/sentiment.ts`
- `supabase/functions/_shared/junkFilter.ts`

