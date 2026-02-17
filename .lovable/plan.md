

# Data Sources Audit and Enhancement Plan (Extended - Issues 46-52)

This extends the previously approved plan (Issues 1-45 + UI 1-6) with 7 newly discovered issues. Nothing unrelated will be changed or removed.

---

## Previously Identified Issues (Issues 1-45, UI 1-6)

All remain unchanged. See prior plan versions for full details.

---

## Newly Identified Issues (Issues 46-52)

### Issue 46: `fetch-reddit-reviews` and `fetch-medication-reviews` Are Orphaned Edge Functions (Never Called)
**Files**: `supabase/functions/fetch-reddit-reviews/index.ts` (382 lines), `supabase/functions/fetch-medication-reviews/index.ts` (350 lines)
**Problem**: Both functions are registered in `config.toml` and deployed, but neither is invoked from anywhere in the frontend (`src/`) or from the `data-orchestrator`. A search for `fetch-reddit-reviews` and `fetch-medication-reviews` across the entire `src/` directory returns zero matches. These functions use Firecrawl credits (scraping Drugs.com, Reddit) but are never triggered -- their data never reaches any table or UI. They represent ~730 lines of dead code consuming deployment resources.
**Fix**: Either:
1. Add them to the `data-orchestrator`'s `dataFunctions` array so they run during the daily cron and their data reaches the database, OR
2. Remove them if their functionality is already covered by `community-feed` (which also scrapes Reddit)

The recommended approach is option 1 -- add to orchestrator -- since `fetch-medication-reviews` scrapes Drugs.com reviews (unique data not available from `community-feed`) and `fetch-reddit-reviews` targets device-specific Reddit threads with structured review extraction.

### Issue 47: `useClinicalTrialsDetailed` Returns `freshData.data` Instead of Re-querying DB
**File**: `src/hooks/useClinicalTrialsDetailed.ts` (line 87)
**Problem**: After invoking the `clinical-trials-enhanced` edge function, the hook sets state to `freshData.data` -- the raw response from the edge function. But the edge function returns its own summary object, not necessarily the same shape as what the DB query returns. All the other hooks (e.g., `useMarketData`, `useMedicareData`, `usePatentData`) correctly re-query the database after the edge function completes to get the canonical data. `useClinicalTrialsDetailed` skips the re-query and uses the edge function response directly, which may have a different shape or subset of data.
**Fix**: After the edge function completes, re-query the `clinical_trials_detailed` table (same pattern as the other hooks) instead of using `freshData.data` directly.

### Issue 48: `useDeviceAnalytics` Invokes `community-feed` as a Refresh but Ignores Result
**File**: `src/hooks/useDeviceAnalytics.ts` (lines 132-148)
**Problem**: The `refreshCommunityFeed` function calls `supabase.functions.invoke('community-feed')`, which triggers fetching from 60+ subreddits (Issue 16). But the function only logs the result and returns a success/fail object -- it never re-fetches the device analytics data from the database. The user clicks "Refresh" and nothing visibly changes because the hook doesn't refetch after the community feed completes.
**Fix**: After the community-feed invoke succeeds, re-run the device analytics data fetch from the database so the UI updates with new community posts.

### Issue 49: `admin-users` Has No Admin Role Verification (Security Issue)
**File**: `supabase/functions/admin-users/index.ts` (lines 57-75)
**Problem**: The function checks for an `Authorization` header and calls `getUser()` to verify the token is valid, but it does NOT check if the user has an admin role. Any authenticated user can list all users, reset passwords, deactivate accounts, invite users, and change roles. This is a critical security vulnerability -- the function name implies admin-only access but enforces none.
**Fix**: After `getUser()`, check the user's role from the `diabetic_profiles` table (or user metadata). If the role is not `admin`, return a 403 Forbidden response. For example:
```
const { data: profile } = await supabaseClient
  .from('diabetic_profiles')
  .select('role')
  .eq('user_id', user.id)
  .maybeSingle();

if (profile?.role !== 'admin') {
  return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
}
```

### Issue 50: Issue 17 Overcounts Missing config.toml Entries -- Actual Count is 30, Not 31
**Problem**: The previous plan (Issue 17) listed functions missing from `config.toml`. After a full audit of the actual `config.toml` contents, the correct list of 30 missing functions is confirmed. However, the previous plan also included `seed-community-comments` and `seed-community-posts` which ARE missing, and listed `seed-burnout-posts` which IS missing. The count and list in Issue 17 are substantively correct. No change needed -- this is a validation note.
**Status**: No fix needed. Issue 17 is accurate.

### Issue 51: `data-orchestrator` Does NOT Log Results to `data_refresh_logs` Table
**File**: `supabase/functions/data-orchestrator/index.ts` (entire file)
**Problem**: The `data_refresh_logs` table exists in the database schema (confirmed in `types.ts`), but the orchestrator never writes to it. It constructs a detailed `summary` object with execution times, record counts, success/failure status, and freshness data -- then returns it as a JSON response and discards it. This means:
1. There is no historical record of orchestrator runs
2. The `DataSourcesBadge` cannot show real freshness status (UI Fix 3) because there's no persistent log to query
3. Debugging data pipeline failures requires checking edge function logs manually
**Fix**: After building the summary, insert a row into `data_refresh_logs`:
```typescript
await supabase.from('data_refresh_logs').insert({
  started_at: new Date(startTime).toISOString(),
  completed_at: new Date().toISOString(),
  functions_called: dataFunctions.length,
  functions_succeeded: successCount,
  functions_failed: dataFunctions.length - successCount,
  total_records: totalRecordsFetched,
  execution_time_ms: totalExecutionTime,
  results: results,
  freshness_data: freshnessData,
  status: successCount > 0 ? 'completed' : 'failed'
});
```
This enables UI Fix 3 (DataSourcesBadge live status) to query `data_refresh_logs` for real freshness data.

### Issue 52: `useDrugPricing` Invokes `medicare-data-feed` Which Produces ZERO Rows (Circular Failure)
**File**: `src/hooks/useDrugPricing.ts` (line 41)
**Problem**: The hook invokes `medicare-data-feed` to refresh drug pricing data. But as identified in Issue 9, the `drug_pricing_data` table has 0 rows. The `medicare-data-feed` function upserts fake data with `onConflict: 'ndc_code'` (line 138), which requires a unique constraint on `ndc_code`. If this constraint doesn't exist, the upsert silently fails or creates duplicates. Combined with Issue 3 (fake data), this means users see an empty drug pricing page every time -- the hook fetches 0 rows from DB, invokes the edge function (which fails silently), then re-fetches 0 rows again.
**Fix**: This is a compound issue requiring:
1. Verify/add unique constraint on `drug_pricing_data.ndc_code` (Issue 9)
2. Replace fake data with real CMS data (Issue 3)
3. Only then will the hook start working correctly

---

## Technical Details

### Complete File Changes Summary (Issues 46-52)

| Issue | File | Change |
|-------|------|--------|
| 46 | `data-orchestrator/index.ts` | Add `fetch-reddit-reviews` and `fetch-medication-reviews` to `dataFunctions` array |
| 47 | `src/hooks/useClinicalTrialsDetailed.ts` | Re-query DB after edge function instead of using `freshData.data` |
| 48 | `src/hooks/useDeviceAnalytics.ts` | Re-fetch device data after community-feed refresh completes |
| 49 | `supabase/functions/admin-users/index.ts` | Add admin role verification after `getUser()` |
| 50 | No change needed | Validation of Issue 17 |
| 51 | `data-orchestrator/index.ts` | Insert orchestrator run results into `data_refresh_logs` table |
| 52 | Covered by Issues 3 + 9 | Compound issue -- fixed by prerequisite issues |

### Grand Total

This brings the complete data sources plan to **52 issues + 6 UI fixes + 3 new data sources**, across ~58 files, covering broken payment processing, fake data, API abuse patterns, missing secrets, deprecated APIs, orphaned functions, security vulnerabilities, and performance problems.

### Unchanged
All existing pages, routes, sidebar navigation, authentication, dashboard, find diabetics, messaging, streaks, shop UI, and all other features remain completely untouched. Only data pipeline, edge function, and data presentation fixes as listed above.

