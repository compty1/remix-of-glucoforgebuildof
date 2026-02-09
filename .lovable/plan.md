

# Comprehensive Community Posts Enhancement Plan

Based on the detailed conversation analysis, here is every actionable item organized into implementable steps. Items that don't apply to this Lovable Cloud architecture (Kubernetes, systemd, Express middleware, GitHub Actions CI) are adapted to equivalent edge functions and database-level solutions.

---

## Current State Summary

- **223 curated posts** in `community_posts` (all `post_type = 'post'`)
- **1,559 seeded comments** in `community_comments` (5-15 per post, topic-specific)
- **31 posts** still have broken Google search URLs (`google.com/search?q=site:reddit.com+...`)
- **192 posts** have Reddit search URLs (working but imperfect)
- **`num_comments` mismatch**: Some posts show metadata values (e.g., 234) but only have 5-15 actual comments
- **`verify-external-links` edge function** exists but is never called automatically
- **No provenance columns** like `canonical_url`, `raw_payload_hash`, `confidence_score`, `link_status`
- **No quarantine/moderation system** exists
- **DB indexes** are solid for search, but missing for link verification workflow

---

## Step 1: Database Schema Enhancement (Non-Destructive)

Add nullable provenance and quality columns to `community_posts`:

```sql
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS canonical_url TEXT NULL;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS raw_payload_hash TEXT NULL;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS link_status JSONB NULL;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS confidence_score DOUBLE PRECISION NULL;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS quarantined BOOLEAN DEFAULT FALSE;
```

Create quarantine and audit tables:

```sql
CREATE TABLE IF NOT EXISTS post_quarantine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NULL,
  raw_payload JSONB NOT NULL,
  validation_errors JSONB NOT NULL,
  received_at TIMESTAMP NOT NULL DEFAULT now(),
  reviewed BOOLEAN DEFAULT FALSE,
  reviewer TEXT NULL,
  review_notes TEXT NULL
);

CREATE TABLE IF NOT EXISTS backfill_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT NULL,
  new_value TEXT NULL,
  performed_by TEXT NOT NULL DEFAULT 'system',
  performed_at TIMESTAMP NOT NULL DEFAULT now(),
  reason TEXT NULL
);
```

Add indexes for new columns:

```sql
CREATE INDEX IF NOT EXISTS idx_community_posts_quarantined ON community_posts (quarantined);
CREATE INDEX IF NOT EXISTS idx_community_posts_confidence ON community_posts (confidence_score);
CREATE INDEX IF NOT EXISTS idx_post_quarantine_received ON post_quarantine (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_quarantine_reviewed ON post_quarantine (reviewed);
```

RLS policies for new tables (public read, service-role write).

---

## Step 2: Fix ALL Remaining Broken URLs

**Problem**: 31 posts still have Google URLs; 192 have Reddit search URLs. None lead to actual posts.

**Fix**: Update the `seed-community-posts` edge function to:
1. Use the already-correct Reddit-wide search format for new posts
2. Add a dedicated URL-update section that runs a SQL UPDATE to fix the 31 remaining Google URLs
3. Sync `num_comments` to match actual comment counts

**File**: `supabase/functions/seed-community-posts/index.ts`

Add after the upsert logic:
```typescript
// Fix any remaining Google search URLs
await supabase.rpc('fix_community_urls'); // or inline SQL
```

Also run a direct SQL update:
```sql
UPDATE community_posts
SET url = 'https://www.reddit.com/search/?q=' || 
  array_to_string(
    (SELECT array_agg(w) FROM unnest(
      string_to_array(regexp_replace(title, '[^a-zA-Z0-9 ]', '', 'g'), ' ')
    ) w WHERE length(w) > 3 LIMIT 6),
    '+'
  ) || '&type=link&sort=relevance&t=all'
WHERE url LIKE '%google.com%' OR url LIKE '%/comments/example%';
```

And sync comment counts:
```sql
UPDATE community_posts cp
SET num_comments = (
  SELECT count(*) FROM community_comments cc WHERE cc.post_id::text = cp.id::text
)
WHERE post_type = 'post';
```

---

## Step 3: Link Verification Edge Function Enhancement

**File**: `supabase/functions/verify-external-links/index.ts`

The function already exists but doesn't write results back to the database. Enhance it to:

1. Accept a `mode` parameter: `"verify"` (check URLs) or `"fix"` (check + update DB)
2. When mode is `"fix"`, update `link_status` JSONB column and `source_link_verified` / `source_link_verified_at` columns on each post
3. Add retry logic with exponential backoff (already partially there)
4. Process posts in batches of 50 to avoid timeouts

```typescript
// After verifying, update the post record
await supabase.from('community_posts').update({
  link_status: { status: result.valid ? 'ok' : 'dead', http_code: result.status, last_checked: new Date().toISOString() },
  source_link_verified: result.valid,
  source_link_verified_at: new Date().toISOString()
}).eq('id', postId);
```

---

## Step 4: Ingestion Validation in Seed Functions

**File**: `supabase/functions/seed-community-posts/index.ts`

Add validation before inserting posts:
- Require non-empty `title` (min 3 chars) and `content` (min 10 chars)
- Compute `raw_payload_hash` as SHA-256 of title+content for deduplication
- Set `confidence_score` based on: content length, presence of topic tags, valid URL format
- Skip records that match an existing `raw_payload_hash` (dedupe)
- Quarantine invalid records into `post_quarantine` instead of silently dropping

```typescript
// Compute hash for dedup
const hash = await crypto.subtle.digest('SHA-256', 
  new TextEncoder().encode(post.title + post.content));
const raw_payload_hash = Array.from(new Uint8Array(hash))
  .map(b => b.toString(16).padStart(2, '0')).join('');

// Confidence score
const confidence = 
  (post.title?.length > 10 ? 0.3 : 0) +
  (post.content?.length > 50 ? 0.3 : 0) +
  (post.topic_tags?.length > 0 ? 0.2 : 0) +
  (post.source ? 0.2 : 0);
```

---

## Step 5: UI Defensive States and Graceful Fallbacks

### SolutionCard.tsx
- When `url` is missing or empty, show a disabled button with tooltip: "Source link unavailable"
- Add `data-test="original-link"` attribute for testability

### CommunityPostDetail.tsx
- Same graceful fallback for missing URL
- Show link verification status if `link_status` is available (green/yellow/red dot)
- When link is verified dead, show "Link may be unavailable" warning

**File**: `src/components/community/SolutionCard.tsx`
```tsx
{post.url ? (
  <a href={post.url} target="_blank" rel="noopener noreferrer" data-test="original-link">
    <Button variant="ghost" size="sm" className="h-8 text-xs">
      <ExternalLink className="h-3.5 w-3.5 mr-1" />
      Find Discussion
    </Button>
  </a>
) : (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-xs" disabled>
          <ExternalLink className="h-3.5 w-3.5 mr-1 opacity-50" />
          Source Unavailable
        </Button>
      </TooltipTrigger>
      <TooltipContent>Original link unavailable</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)}
```

**File**: `src/pages/CommunityPostDetail.tsx`
Same pattern for the detail page's external link button.

---

## Step 6: Comment Quality Enhancement

**File**: `supabase/functions/seed-community-comments/index.ts`

The current comments are already topic-specific (from the previous plan implementation). Enhancements:
- Add more topic pools for underserved categories (insurance, school/504 plans, newly diagnosed)
- Increase comment count range to 8-20 per post (currently 5-15)
- Re-seed comments for posts where `num_comments` metadata suggests higher engagement

New topic pools to add:
- `insurance`: mentions of appeals, prior auth, Walmart ReliOn, GoodRx, Cost Plus Drugs
- `school_504`: IEP vs 504, nurse requirements, field trip protocols
- `newly_diagnosed`: honeymoon phase, carb counting basics, emotional support
- `burnout`: taking breaks, minimum management, therapy recommendations

---

## Step 7: Data Refresh and Provenance Tracking

**File**: `src/hooks/useCommunitySearch.ts`

Update the `useRefreshCommunityData` hook to:
1. After seeding, call `seed-community-comments` to ensure comments exist
2. After comments, call `verify-external-links` in fix mode to verify URLs
3. Track refresh status with timestamps

```typescript
const triggerRefresh = async () => {
  // 1. Seed/refresh posts
  await supabase.functions.invoke('seed-community-posts');
  // 2. Seed comments for any new posts
  await supabase.functions.invoke('seed-community-comments');
  // 3. Verify links (background, non-blocking)
  supabase.functions.invoke('verify-external-links', { 
    body: { mode: 'fix' } 
  }).catch(console.error);
};
```

---

## Step 8: Admin Moderation View

Create a simple admin page for reviewing quarantined posts and link health.

**New File**: `src/pages/admin/ContentModeration.tsx`

Features:
- Table view of quarantined posts with validation errors
- One-click approve (move to published) or reject (mark reviewed)
- Link health dashboard showing counts of ok/dead/unchecked links
- Button to trigger link verification batch

**New File**: `src/components/admin/QuarantineTable.tsx`
- Displays `post_quarantine` rows with raw payload preview
- Shows validation error details
- Moderator notes input

---

## Step 9: Security and Sanitization

- Ensure all community post content rendered in the UI uses proper escaping (React handles this by default with JSX)
- Add `rel="noopener noreferrer"` on all external links (already done)
- Verify RLS policies on new tables (`post_quarantine`, `backfill_audit`) restrict write access to authenticated/service roles

---

## Files to Create or Modify

| File | Action | Change |
|------|--------|--------|
| Database migration | Create | Add provenance columns, quarantine table, audit table, indexes |
| `supabase/functions/seed-community-posts/index.ts` | Modify | Add validation, dedup hash, confidence score, fix remaining Google URLs |
| `supabase/functions/seed-community-comments/index.ts` | Modify | Add insurance/school/newly_diagnosed/burnout topic pools, increase range to 8-20 |
| `supabase/functions/verify-external-links/index.ts` | Modify | Add DB write-back mode, batch processing, update link_status column |
| `src/hooks/useCommunitySearch.ts` | Modify | Chain refresh to include comments + link verification |
| `src/components/community/SolutionCard.tsx` | Modify | Add graceful fallback for missing URLs, data-test attribute |
| `src/pages/CommunityPostDetail.tsx` | Modify | Add graceful fallback, link status indicator |
| `src/pages/admin/ContentModeration.tsx` | Create | Quarantine review + link health dashboard |
| `src/components/admin/QuarantineTable.tsx` | Create | Quarantine table component |

## What Stays Unchanged
- All existing post data, comments, and content (non-destructive)
- Post listing, filtering, categories, search functionality
- Save/bookmark, Ask AI, Copy features
- All other pages and components unrelated to community posts
- Existing database indexes and RLS policies

