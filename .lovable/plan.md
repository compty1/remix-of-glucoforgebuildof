
# Fix: Community Post Comments Not Showing

## Root Cause

The `usePostComments` hook receives the `post_id` string (e.g., `curated_international_travel_1`) and queries both tables with it. However:

1. **`community_posts` table**: Only ~20 posts have child comment rows (via `parent_post_id`). Most posts (including `curated_international_travel_1`) have zero comment rows despite showing `num_comments: 167`.
2. **`community_comments` table**: Stores `post_id` as the **UUID** (`id` column from `community_posts`), not the string `post_id`. So the query `.eq('post_id', postId)` with a string like `curated_international_travel_1` never matches anything in this table.

**Result**: Comments show as 0 for most posts.

## Fix

### Step 1: Fix `usePostComments` to resolve UUID before querying `community_comments`

**File:** `src/hooks/useCommunitySearch.ts`

The hook needs to:
1. First fetch the post's UUID (`id`) from `community_posts` using the string `post_id`
2. Query `community_comments` using that UUID
3. Query `community_posts` children using the string `post_id` (this part already works)
4. Combine results, limit display to 50, sort by score

```typescript
export const usePostComments = (postId: string | null) => {
  return useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      if (!postId) return [];

      // Get the UUID for this post_id
      const { data: postData } = await supabase
        .from('community_posts')
        .select('id')
        .eq('post_id', postId)
        .maybeSingle();

      // Query community_posts children (parent_post_id = string post_id)
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('parent_post_id', postId)
        .order('score', { ascending: false, nullsFirst: false })
        .limit(50);

      if (postsError) throw postsError;

      // Query community_comments using UUID
      let commentsData: any[] = [];
      if (postData?.id) {
        const { data } = await supabase
          .from('community_comments')
          .select('*')
          .eq('post_id', postData.id)
          .order('score', { ascending: false, nullsFirst: false })
          .limit(50);
        commentsData = data || [];
      }

      // Combine, deduplicate, sort by score, limit to 50
      // ... (existing mapping logic stays the same)
    },
  });
};
```

### Step 2: Limit displayed comments to 50 with "View Original" prompt

**File:** `src/pages/CommunityPostDetail.tsx`

After the comments list, if there are more comments than shown (based on `num_comments`), display a message like "Showing 50 of 167 comments" with a link to view the original post for the rest. The "View Original" button already exists -- just add a note near the comments section.

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useCommunitySearch.ts` | Fix `usePostComments` to resolve UUID before querying `community_comments`, limit to 50 |
| `src/pages/CommunityPostDetail.tsx` | Add "Showing X of Y comments" message with prompt to view original for the rest |

## What Stays Unchanged
- All other components, pages, and hooks
- Post listing, filtering, categories
- Save/bookmark functionality
- The `PostComments` component (used in cards) -- it calls the same hook, so it benefits automatically
