# Fix Remaining Data Integrity Issues — COMPLETED

All issues resolved on 2026-02-09.

| Issue | Before | After |
|-------|--------|-------|
| Posts missing `raw_payload_hash` | 31 | 0 |
| Posts missing `confidence_score` | 31 | 0 |
| Posts with wrong `num_comments` | 79 | 0 |
| `backfill_audit` records | 0 | 602 |

No code changes were needed — the existing `seed-community-posts` function was redeployed and executed successfully.
