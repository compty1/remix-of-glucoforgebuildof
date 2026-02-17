

## Add Comments to Diabeto 18+ Posts

### Overview
Add a fully functional comments system to each adult content post card, with realistic seeded comments and "Show More" / "View All" functionality -- matching the Community Solutions comment pattern.

---

### 1. Create `adult_content_comments` table

New database table mirroring `community_comments` but linked to `adult_content_posts`:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| post_id | uuid (FK) | References adult_content_posts.id |
| parent_comment_id | uuid (nullable) | For threaded replies |
| author_anonymous | text | Display name (e.g. "t1d_warrior_23") |
| content | text | Comment body |
| score | integer | Upvote count |
| created_at | timestamptz | Auto-set |

RLS: public read access (no auth required, matches existing adult_content_posts policy).

---

### 2. Create `useAdultPostComments` hook

New hook in `src/hooks/useAdultContentSearch.ts` that:
- Accepts `postId` (or null to skip) and a `limit` parameter
- Queries `adult_content_comments` ordered by score descending
- Returns `{ comments, totalCount, hasMore }`
- Supports incrementing the limit for "Load More"

---

### 3. Add comments UI to `AdultPostCard`

Modify `AdultPostCard.tsx` only:
- Make the existing comment count (MessageSquare icon) clickable to toggle comments visibility
- When expanded, show comments using a pattern similar to `PostComments`:
  - Each comment: author, score, content (truncatable with More/Less)
  - "Load More" button when more comments exist (increments limit by 10)
  - Loading skeletons while fetching
- No other changes to the card layout

---

### 4. Seed realistic comments in the seed function

Update `seed-adult-content-expanded` to also seed 8-15 realistic comments per post (totaling ~400 comments). Comments will be realistic community responses like:
- "This is exactly my experience -- I run a temp basal of -20% before dates"
- "My endo literally never mentioned this. Thank you for sharing"
- Practical tips, follow-up questions, shared experiences
- Varying scores (1-150) to simulate real engagement

The seed function will:
1. Insert posts (existing behavior)
2. Fetch inserted post IDs
3. Insert comments linked to each post by matching title

---

### Technical Details

**Files to create:**
- None (all changes in existing files)

**Files to modify:**
- `src/hooks/useAdultContentSearch.ts` -- add `useAdultPostComments` hook
- `src/components/adult-content/AdultPostCard.tsx` -- add clickable comments toggle and inline comments display
- `supabase/functions/seed-adult-content-expanded/index.ts` -- add comment seeding after posts

**Database migration:**
- Create `adult_content_comments` table with RLS policy for public read

**No other files or components are changed.**

