
# Fix Community Solutions: Posts Not Loading, Categories, and Comments

## Problems Found

1. **Comments/replies showing as top-level posts**: The search query fetches ALL 493 rows from `community_posts` including 243 comments and 27 replies. These appear as cards with title "Comment" and source "reddit" -- making them look broken.

2. **Clicking posts shows "not found"**: The `CommunityPulse` widget links to `/community/${post.id}` (using UUID), but the actual route is `/community-solutions/:postId` and the detail page queries by the `post_id` field (e.g., `curated_cgm_insurance_1`). This mismatch causes 404s.

3. **Category badges inaccurate**: Comments have `source: 'reddit'` (generic) instead of specific subreddit names like `r/dexcom`, so they all fall into "General" category even when they belong to a specific subreddit's thread.

4. **Trending solutions include comments**: The `useTrendingSolutions` hook doesn't filter by `post_type`, showing comment entries in the trending sidebar.

---

## Plan

### Step 1: Filter out comments/replies from main search query
**File:** `src/hooks/useCommunitySearch.ts`

Add `.eq('post_type', 'post')` to the main `fetchPosts` query so only actual posts appear in the community solutions list. This removes 270 comments/replies from showing as standalone cards.

Also add the same filter to `useTrendingSolutions` so trending sidebar only shows real posts.

### Step 2: Fix CommunityPulse link format
**File:** `src/components/discover/CommunityPulse.tsx`

Change the link from:
```
/community/${post.id}
```
to:
```
/community-solutions/${post.post_id}
```

This requires the query to also select `post_id` alongside the other fields, and filter to only show actual posts (not comments).

### Step 3: Ensure detail page handles edge cases
**File:** `src/pages/CommunityPostDetail.tsx`

The detail page already queries correctly by `post_id`. No changes needed here -- the fix in Step 2 ensures correct links are generated.

### Step 4: Verify category accuracy
The source categories in `sourceCategories.ts` already correctly map subreddit names. The issue was that comments had `source: 'reddit'` (generic). By filtering them out (Step 1), only posts with proper subreddit sources like `r/dexcom`, `r/diabetes_t1` etc. will appear, and categories will be accurate.

---

## Technical Details

### Files to modify

| File | Change |
|------|--------|
| `src/hooks/useCommunitySearch.ts` | Add `post_type = 'post'` filter to `fetchPosts` and `useTrendingSolutions` queries |
| `src/components/discover/CommunityPulse.tsx` | Fix link to use `/community-solutions/${post.post_id}`, add `post_id` to select, filter by `post_type` |

### Database impact
- No schema changes needed
- Post count will go from ~493 to ~223 visible posts (comments still exist for detail page comments section)
- Comments remain accessible via the detail page's comments section (queried by `parent_post_id`)

### What stays unchanged
- All other pages and components
- Comment display on post detail pages
- Save/bookmark functionality
- Search and filter logic (just adds one more filter condition)
- Source category mapping logic
