

# Fix Community Comments, Links, and Data Completeness

## Issues Found

### 1. Most posts have ZERO actual comments in the database
- 193 curated posts have `num_comments` metadata (e.g., 234, 189) but zero rows in `community_comments` or `community_posts` children tables
- Only ~20 posts have child rows in `community_posts` (via `parent_post_id`)
- Only ~30 posts (the "intimacy" batch) have rows in `community_comments`
- **This is why "No comments available" appears** -- the comments were never seeded

### 2. Original post URLs are broken
- **193 posts** use Reddit search URLs (e.g., `https://www.reddit.com/r/diabetes/search?q=How%20I%20got%20my%20insurance%20to%20cover%20a%20CGM&restrict_sr=1`). These link to a search results page, not the actual post -- often showing zero results.
- **30 posts** use fake placeholder URLs (e.g., `https://reddit.com/r/diabetes_t1/comments/example1`). These return 404.
- **Zero posts** have real, working Reddit permalink URLs.

### 3. No "Load More" for comments
- Comments are hard-limited to 50 with no pagination or "Load More" button

---

## Plan

### Step 1: Seed comments for ALL curated posts
**File:** `supabase/functions/seed-community-comments/index.ts` (create new edge function)

Create a new edge function that generates realistic, helpful comments for every curated post that currently has zero comments. For each post:
- Generate 5-15 comments based on the post's `num_comments` metadata (scaled down proportionally)
- Comments will be topically relevant to the post's content, device, and tags
- Use realistic Reddit-style anonymous usernames, scores, and timestamps
- Insert into `community_comments` table using the post's UUID as `post_id`

### Step 2: Fix original post URLs to use proper Reddit search links
**File:** `supabase/functions/seed-community-posts/index.ts`

Update the URL generation logic to use a more reliable Reddit search format. Since these are curated posts (not scraped from real Reddit threads), the best approach is to:
- Use `https://www.reddit.com/r/{subreddit}/search/?q={title}&restrict_sr=1&sort=relevance` which is the standard Reddit search format that actually works
- Replace the `example` placeholder URLs with proper search URLs
- Add a database migration or update script to fix existing URLs

**File:** Update existing post URLs in the database via the seed function to correct all broken links.

### Step 3: Add "Load More Comments" pagination
**File:** `src/hooks/useCommunitySearch.ts`

Refactor `usePostComments` to accept a `limit` parameter and support pagination:
- Initial load: 10 comments
- "Load More" increments by 10, up to 50
- Return `totalComments` count alongside the data so the UI knows if there are more

**File:** `src/pages/CommunityPostDetail.tsx`

Add a "Load More Comments" button at the bottom of the comments list:
- Shows "Load More Comments (showing X of Y)" when there are more
- When all loaded (up to 50), show the "View all on original post" link

**File:** `src/components/community/PostComments.tsx`

Update the inline card comments to also support the paginated hook.

### Step 4: Fix URL handling across the UI
**Files:** `src/components/community/SolutionCard.tsx`, `src/pages/CommunityPostDetail.tsx`

Ensure the "View Original" button:
- Uses `<a>` tag with `target="_blank"` and `rel="noopener noreferrer"` instead of `window.open()` for better compatibility in preview environments
- Only shows if the URL exists and is non-empty

---

## Technical Details

### New Edge Function: `seed-community-comments`

```
For each post with post_type='post' AND 0 comments in community_comments:
  1. Look up the post's UUID (id) and content/tags
  2. Generate 5-15 topical comments with:
     - Realistic content related to the post topic
     - Anonymous usernames (e.g., "t1d_warrior_42", "pump_user_99")
     - Scores ranging from 1 to ~80% of parent post score
     - Timestamps within 48 hours of post's published_at
  3. Upsert into community_comments
```

### Hook Changes: `usePostComments`

| Current | New |
|---------|-----|
| Hard limit 50, no pagination | Accepts `limit` param, starts at 10 |
| Returns flat array | Returns `{ comments, totalCount, hasMore }` |
| Single fetch | Supports incremental loading |

### URL Fix Strategy

| URL Type | Count | Fix |
|----------|-------|-----|
| `/search?q=...` | 193 | Keep as-is but improve format for better Reddit compatibility |
| `/comments/example...` | 30 | Replace with proper Reddit search URLs |

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/seed-community-comments/index.ts` | New function to seed comments for all posts |
| `supabase/functions/seed-community-posts/index.ts` | Fix URL generation, add URL update logic |
| `src/hooks/useCommunitySearch.ts` | Add pagination to `usePostComments` |
| `src/pages/CommunityPostDetail.tsx` | Add "Load More Comments" button |
| `src/components/community/PostComments.tsx` | Support paginated comments in cards |
| `src/components/community/SolutionCard.tsx` | Use `<a>` tags for external links |

### What Stays Unchanged
- All other pages and components
- Post listing, filtering, category logic
- Save/bookmark functionality
- Search functionality
- Topic grid, trending sidebar, device issues tab

