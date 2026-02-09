

# Implementation Plan: Remaining Conversation Items

## Summary

All data integrity issues are resolved (0 missing hashes, 0 missing confidence scores, 0 unchecked links). The remaining work is about **UI enhancements and database views** discussed on pages 41-50 of the conversation.

## Step 1: Create Database Views

Create SQL views discussed on pages 43-45 to power the moderation dashboard:

- `vw_quarantine_recent` -- Quarantined items with title, body snippet, source, validation errors
- `vw_quarantine_error_summary` -- Top validation error counts
- `vw_posts_link_health` -- Posts with link status, http_code, last_checked, confidence_score
- `vw_quarantine_priority` -- Quarantined items ranked by computed priority score

## Step 2: Enhanced QuarantineTable

Upgrade `src/components/admin/QuarantineTable.tsx` with:

- Expandable raw payload preview (collapsible JSON viewer)
- "Approve" button alongside existing "Dismiss"
- Text input for reviewer notes before taking action
- Source URL display from raw_payload
- Confidence score display if available
- Post ID column

## Step 3: Enhanced Content Moderation Dashboard

Add new metric cards and sections to `src/pages/admin/ContentModeration.tsx`:

- Quarantine by day (last 30 days) -- bar chart using Recharts
- Top validation errors list with counts
- Confidence score distribution (bands: 0-0.3 Low, 0.3-0.6 Medium, 0.6-1.0 High)
- False positive rate (approved after quarantine)

## Step 4: Link Status Dots on Community UI

Add small colored status indicators next to external link buttons:

- Green dot: link verified OK
- Yellow dot: unchecked (no link_status)
- Red dot: dead link

Files:
- `src/components/community/SolutionCard.tsx`
- `src/pages/CommunityPostDetail.tsx`

## Step 5: Confidence Score Visibility

Show confidence score as a small badge/indicator on community posts when available, helping users gauge content reliability.

Files:
- `src/components/community/SolutionCard.tsx`
- `src/pages/CommunityPostDetail.tsx`

## Step 6: Scheduled Maintenance Edge Function

Create `supabase/functions/scheduled-maintenance/index.ts` that:

- Re-verifies links not checked in 7+ days
- Processes any new posts without link_status
- Returns metrics (checked, ok, dead, skipped)

## Step 7: Execute Link Verification on Remaining Posts

Run `verify-external-links` in fix mode to ensure all 223 posts (not just 250 links) have up-to-date link_status. Currently 250 are verified -- confirm coverage is complete.

---

## Technical Details

### Database Migration (Views)

```text
CREATE OR REPLACE VIEW vw_quarantine_recent ...
CREATE OR REPLACE VIEW vw_quarantine_error_summary ...
CREATE OR REPLACE VIEW vw_posts_link_health ...
CREATE OR REPLACE VIEW vw_quarantine_priority ...
```

### Link Status Dot Component

```text
const linkDot = post.link_status?.status === 'ok'
  ? 'bg-green-500'
  : post.link_status?.status === 'dead'
    ? 'bg-red-500'
    : 'bg-yellow-500';

<span className={`inline-block w-2 h-2 rounded-full ${linkDot}`} />
```

### Confidence Badge

```text
{post.confidence_score != null && (
  <Badge variant="outline" className="text-xs">
    {post.confidence_score >= 0.7 ? 'High' : post.confidence_score >= 0.4 ? 'Medium' : 'Low'} confidence
  </Badge>
)}
```

### Scheduled Maintenance Function

```text
supabase/functions/scheduled-maintenance/index.ts
- Fetches posts where link_status IS NULL or last_checked > 7 days ago
- Calls verifyUrl() for each (with Reddit structural bypass)
- Updates link_status in DB
- Returns summary metrics
```

## Files to Create or Modify

| File | Action | Change |
|------|--------|--------|
| Database migration | Create | 4 SQL views |
| `src/components/admin/QuarantineTable.tsx` | Modify | Raw payload preview, approve action, reviewer notes, source URL |
| `src/pages/admin/ContentModeration.tsx` | Modify | Validation error summary, confidence distribution, quarantine trend chart |
| `src/components/community/SolutionCard.tsx` | Modify | Link status dot, confidence badge |
| `src/pages/CommunityPostDetail.tsx` | Modify | Link status dot, confidence badge |
| `supabase/functions/scheduled-maintenance/index.ts` | Create | Periodic link re-verification |
| `supabase/config.toml` | Auto-update | Add scheduled-maintenance function config |

## What Stays Unchanged

- All 223 posts and their content
- All comments in community_comments
- All existing UI features (save, bookmark, copy, ask AI, comments, similar solutions)
- Public Glucose Data page and all its components
- All other pages and routes
- Existing edge functions
- Database schema columns (no new columns needed)
- post_quarantine and backfill_audit table schemas

