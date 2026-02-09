

# Enhance Community Posts: Links, Comments, and Data Quality

## Current State

After full analysis, here is what is working and what needs improvement:

### What Works
- Comment retrieval pipeline: UUID resolution, querying both tables, deduplication, pagination -- all functional
- Load More Comments button exists and works
- All 223 posts have 5-15 seeded comments (1,559 total in `community_comments`)

### What Needs Fixing

#### 1. ALL "View Original" links open Reddit Search, not actual posts
Every single one of the 223 posts uses a URL like:
```
https://www.reddit.com/r/diabetes/search/?q=Getting%20affordable%20insulin%20in%20the%20US&restrict_sr=1&sort=relevance
```
This opens Reddit's search results page (often showing 0 results), NOT an actual post. Users expect to land on the original discussion thread.

**Fix**: Since these are curated posts (not scraped from real Reddit threads), there are no real Reddit permalinks to link to. The best approach is to improve the search URL to maximize the chance of finding relevant content:
- Use Google search as the link target: `https://www.google.com/search?q=site:reddit.com+{title keywords}` -- this is much more reliable at finding relevant Reddit discussions than Reddit's own search
- Update the button label to "Find Original Discussion" to set accurate expectations
- Update all 223 existing URLs in the database via the seed function

#### 2. Seeded comments are generic and low quality
Comments like "I tried this approach and noticed a difference within a week" and "Posts like this give me so much hope" are not topically relevant. They don't reference the actual post content (insulin costs, CGM tips, etc.).

**Fix**: Update the `seed-community-comments` edge function to generate topic-specific comments. For example, for a post about "Getting affordable insulin in the US", comments should mention Walmart ReliOn, Mark Cuban's Cost Plus Drugs, manufacturer assistance programs, etc. This requires:
- Grouping comment templates by topic tag and device type
- Creating 15-20 comment template pools per topic category
- Re-seeding all comments with the improved templates

#### 3. Comment count mismatch
Posts show `num_comments: 234` in metadata but only have 5-15 actual comments. The UI shows "Showing 5 of 5" which looks odd when the post card says "234 comments".

**Fix**: Update `num_comments` on each post to match the actual seeded comment count, so the numbers are consistent.

---

## Implementation Plan

### Step 1: Update seed-community-comments with topic-specific comments
**File**: `supabase/functions/seed-community-comments/index.ts`

- Create topic-specific comment pools (keyed by topic tags like `insurance`, `exercise`, `diet`, `cgm_tips`, `mental_health`, etc.)
- Each pool has 20-30 unique, substantive comments referencing real strategies, product names, and experiences
- Comments for "Getting affordable insulin" would mention Walmart ReliOn, GoodRx, manufacturer coupons, etc.
- Comments for "CGM accuracy tips" would mention calibration, hydration, compression lows, etc.
- Delete existing generic comments and re-seed with high-quality ones
- Generate 8-20 comments per post (scaled by original `num_comments` metadata)

### Step 2: Fix all post URLs to use Google-powered Reddit search
**File**: `supabase/functions/seed-community-posts/index.ts`

- Update URL generation to use `https://www.google.com/search?q=site:reddit.com+{shortened title keywords}`
- This reliably surfaces real Reddit discussions on the same topic
- Run a database update to fix all 223 existing URLs

### Step 3: Update num_comments to match actual data
After re-seeding comments, update each post's `num_comments` to equal the actual count of comments in `community_comments` for that post. This keeps the UI numbers consistent.

### Step 4: Update UI labels for link clarity
**Files**: `src/pages/CommunityPostDetail.tsx`, `src/components/community/SolutionCard.tsx`

- Change "View Original" button text to "Find Similar Discussion" to accurately represent what the link does
- Add a small note: "Opens a search for similar community discussions"

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/seed-community-comments/index.ts` | Topic-specific comment pools, re-seed all comments |
| `supabase/functions/seed-community-posts/index.ts` | Fix URL generation to use Google site:reddit.com search |
| `src/pages/CommunityPostDetail.tsx` | Update link label and add context note |
| `src/components/community/SolutionCard.tsx` | Update link label |

## What Stays Unchanged
- All other pages, components, hooks, and functionality
- Post listing, filtering, categories, search
- Save/bookmark, Ask AI, Copy features
- Comment retrieval pipeline (already working correctly)
- Load More Comments pagination (already working)

