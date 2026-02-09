

# Fix Community Post External Links

## Root Cause

The current links use Google search URLs (`https://www.google.com/search?q=site:reddit.com+...`). Google actively blocks navigation from embedded iframes and unfamiliar origins, causing the links to fail silently or show a CAPTCHA/block page.

## Solution

Switch to **Reddit's own search** but with better parameters that actually return results. The previous Reddit search attempt failed because it was restricted to a single subreddit (`restrict_sr=1`). Searching across ALL of Reddit with the right parameters works much better:

```
https://www.reddit.com/search/?q={title keywords}&type=link&sort=relevance&t=all
```

Key differences from the previous broken Reddit search:
- **No subreddit restriction** (`restrict_sr` removed) -- searches all of Reddit
- **`type=link`** -- only shows posts, not comments
- **`t=all`** -- searches all time, not just recent
- **Shorter keyword extraction** -- uses 5-6 key words instead of the full title for better matching

## Changes

### 1. Update seed-community-posts URL generation
**File**: `supabase/functions/seed-community-posts/index.ts`

Change URL generation from Google to improved Reddit search:
```typescript
const titleWords = (post.title || '')
  .replace(/[^a-zA-Z0-9\s]/g, '')
  .split(/\s+/)
  .filter(w => w.length > 3) // skip short words like "the", "and"
  .slice(0, 6)
  .join('+');
const url = `https://www.reddit.com/search/?q=${titleWords}&type=link&sort=relevance&t=all`;
```

### 2. Update all 223 existing URLs in the database
Run the seed function to update all existing post URLs with the new format.

### 3. No UI changes needed
The button labels ("Find Similar Discussion" / "Find Discussion") already accurately describe the behavior. The `<a target="_blank">` markup is correct.

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/seed-community-posts/index.ts` | Update URL generation to use Reddit-wide search |

## What Stays Unchanged
- All UI components, labels, and layout
- Comment system, pagination, hooks
- All other pages and features
