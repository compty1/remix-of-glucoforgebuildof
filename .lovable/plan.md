

# Comprehensive Fix Plan: Community Posts Data Integrity

## Current State Assessment

After thorough database analysis, here is what has been implemented and what still needs fixing:

### Already Working
- Database schema columns (canonical_url, raw_payload_hash, link_status, confidence_score, quarantined) all exist
- post_quarantine table exists with 52 quarantined records
- backfill_audit table exists (empty)
- Topic-specific comment pools (insurance, school_504, newly_diagnosed, burnout) are in the seed function
- UI graceful fallbacks for missing URLs in SolutionCard and CommunityPostDetail
- Content Moderation admin page at /admin/content-moderation
- All 223 posts use Reddit search URLs (no more Google URLs)

### Still Broken

| Issue | Details |
|-------|---------|
| All 221 verified links marked "dead" | Reddit returns HTTP 403 to server-side HEAD requests, so the link verifier marks every URL as dead -- the opposite of useful |
| 31 posts missing provenance data | confidence_score and raw_payload_hash are NULL for 31 posts that were not re-seeded |
| 79 posts have wrong comment counts | num_comments does not match actual comment count in community_comments table |
| Link verifier is counterproductive | It cannot verify Reddit search URLs from the server side; needs to be redesigned |
| backfill_audit never populated | No audit trail of any data changes |

---

## Step 1: Fix the Link Verification Strategy

The current verify-external-links function uses HEAD requests to check Reddit URLs. Reddit blocks all server-side requests with HTTP 403. This means every link gets marked "dead" even though they work fine in browsers.

**Fix**: Update the function to skip verification for known-good URL patterns (Reddit search URLs are constructed by us and always structurally valid). Instead of HTTP verification, use structural validation:
- Reddit search URLs matching our pattern are automatically marked "ok" (we generate them, they are always valid)
- Only attempt HTTP verification for non-Reddit URLs (PubMed, DOI, ClinicalTrials, etc.)
- Reset all 221 currently-dead Reddit links to status "ok"

**File**: `supabase/functions/verify-external-links/index.ts`

## Step 2: Backfill Missing Provenance Data

31 posts are missing confidence_score and raw_payload_hash. These need to be computed and filled in.

**Action**: Update the seed-community-posts function to also backfill existing posts where these fields are NULL. On the next run, for any post where raw_payload_hash IS NULL, compute the hash and confidence score and update the record. Log each backfill action to backfill_audit.

**File**: `supabase/functions/seed-community-posts/index.ts`

## Step 3: Fix Comment Count Sync

79 posts have num_comments values that don't match the actual number of comments in community_comments. The sync logic in seed-community-posts has a type mismatch issue (comparing varchar to uuid).

**Fix**: Update the comment count sync SQL in the seed function to use proper type casting. Then re-run to fix all 79 mismatched counts.

**File**: `supabase/functions/seed-community-posts/index.ts`

## Step 4: Reset Dead Link Statuses in Database

All 221 posts with link_status currently show "dead" due to the flawed verification. This needs a data fix:
- Update all Reddit search URL posts to have link_status = "ok" with a note that structural validation was used
- Clear the incorrect source_link_verified = false flags

**Action**: Run via the updated seed function or a direct database update through the edge function.

## Step 5: Update Content Moderation Dashboard

The moderation dashboard currently shows 221 "dead" links and 0 "ok" links, which is misleading. After fixing the link verification logic, the dashboard will show accurate numbers. Also add a note explaining that Reddit search links are structurally validated (not HTTP-verified).

**File**: `src/pages/admin/ContentModeration.tsx`

---

## Technical Details

### Link Verifier Changes (verify-external-links)
```text
Before: HEAD request to every URL including Reddit search
After: 
  - Reddit search URLs -> automatically "ok" (structural validation)
  - Other URLs (pubmed, doi, etc.) -> HTTP verification as before
  - Reset existing dead Reddit URLs to "ok"
```

### Provenance Backfill Logic (seed-community-posts)
```text
For each post where raw_payload_hash IS NULL:
  1. Compute SHA-256 of title + content
  2. Compute confidence_score
  3. UPDATE the record
  4. INSERT into backfill_audit with field_name, old_value, new_value
```

### Comment Count Fix
```text
Fix the SQL type casting in the sync query:
  WHERE cc.post_id::text = cp.id::text
  (both sides must be cast to the same type)
```

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/verify-external-links/index.ts` | Skip HTTP verification for Reddit URLs, use structural validation |
| `supabase/functions/seed-community-posts/index.ts` | Backfill missing provenance data, fix comment count sync SQL |
| `src/pages/admin/ContentModeration.tsx` | Add note about structural validation for Reddit links |

## What Stays Unchanged
- All 223 posts and their content
- All comments in community_comments
- All UI components, pages, and features unrelated to community posts
- post_quarantine and backfill_audit table schemas
- SolutionCard and CommunityPostDetail UI (already have correct fallbacks)

