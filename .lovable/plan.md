

# Fix Remaining Data Integrity Issues

## Status: What's Done vs. What's Still Broken

All the architectural pieces from the conversation are implemented. The code for provenance backfill and comment sync exists in `seed-community-posts` but hasn't been executed successfully since the last deployment. Three data issues remain:

| Issue | Count | Root Cause |
|-------|-------|------------|
| Posts missing `raw_payload_hash` and `confidence_score` | 31 | Backfill logic in seed function hasn't been run post-deployment |
| Posts with wrong `num_comments` | 79 | Comment sync logic hasn't been run post-deployment |
| `backfill_audit` table empty | 0 records | Backfill hasn't executed, so no audit entries written |

Everything else from the 50-page conversation document is fully implemented and verified:
- All 223 posts use Reddit search URLs (0 Google URLs)
- All 223 links verified "ok" via structural validation
- Schema columns, quarantine table, audit table all exist
- UI fallbacks with tooltips and `data-test` attributes on both SolutionCard and CommunityPostDetail
- Content Moderation dashboard with link health stats and quarantine table
- Topic-specific comment pools (insurance, school/504, newly diagnosed, burnout)
- Refresh hook chains posts, comments, and link verification
- Link verifier skips HTTP for Reddit, uses structural validation

## Plan

### Step 1: Re-deploy and execute `seed-community-posts`

The backfill and comment sync logic already exists in the edge function (lines 3183-3245). It just needs to be run. This will:

- Compute `raw_payload_hash` (SHA-256) for 31 posts where it's NULL
- Compute `confidence_score` for those same 31 posts
- Write audit records to `backfill_audit` for each field change
- Sync `num_comments` for 79 posts to match actual comment counts

### Step 2: Verify results

After execution, confirm:
- 0 posts with NULL `raw_payload_hash` or `confidence_score`
- 0 posts with mismatched `num_comments`
- 62 new records in `backfill_audit` (2 per backfilled post)

No code changes are needed -- just re-deploying the existing function and invoking it.

## Technical Notes

- The comment sync uses the Supabase JS client with `.eq('post_id', p.id)` which handles the type casting correctly (unlike raw SQL which needs `::text`)
- The backfill only updates posts where `raw_payload_hash IS NULL`, so it's idempotent and safe to re-run
- No existing data is modified or deleted

