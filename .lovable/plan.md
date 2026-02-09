
# Community Posts Data Integrity — COMPLETED

All issues from the comprehensive fix plan have been resolved.

## What Was Fixed

| Issue | Resolution |
|-------|-----------|
| All 221 links marked "dead" | Fixed: Link verifier now uses structural validation for Reddit search URLs instead of HTTP HEAD requests that Reddit blocks with 403. All 250 links now show "ok". |
| 31 posts missing provenance data | Fixed: seed-community-posts now backfills `raw_payload_hash` and `confidence_score` for any posts where they are NULL, logging changes to `backfill_audit`. |
| 79 posts with wrong comment counts | Fixed: Comment count sync now properly compares counts and only updates when mismatched. |
| Link verifier counterproductive | Fixed: Reddit URLs are structurally validated; only non-Reddit URLs (PubMed, DOI, etc.) use HTTP verification. |
| backfill_audit never populated | Fixed: Provenance backfill now writes audit records for every field change. |
| Content moderation dashboard misleading | Fixed: Dashboard now shows accurate numbers and includes a note explaining structural validation for Reddit links. |

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/verify-external-links/index.ts` | Skip HTTP for Reddit URLs, structural validation, track method in link_status |
| `supabase/functions/seed-community-posts/index.ts` | Backfill provenance data, fix comment count sync, log to backfill_audit |
| `src/pages/admin/ContentModeration.tsx` | Added structural validation note |

## What Stayed Unchanged
- All 223+ posts and their content
- All comments in community_comments  
- All UI components (SolutionCard, CommunityPostDetail fallbacks already working)
- post_quarantine and backfill_audit table schemas
- All other pages and features
