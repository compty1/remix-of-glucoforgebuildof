
# Clinical Trial Finder Fixes

## Issues Identified

### Issue 1: 404 Error on Trial Matching Page
Links throughout the app point to `/trial-matching`, but the actual route in `App.tsx` is `/trials`.

**Affected files:**
- `src/components/discover/TrialSpotlight.tsx` - Line 112
- `src/hooks/useGlobalSearch.ts` - Line 153

### Issue 2: Incorrect Trial Status Filtering
The "recruiting" filter shows completed trials because:
1. The query filters on `status` column which doesn't exist (should be `overall_status`)
2. The `%Recruiting%` pattern also matches "Active, not recruiting"

**Affected file:**
- `src/hooks/useTrialMatching.ts` - Lines 57-64

---

## Implementation Plan

### Step 1: Fix Route Links
Update all references from `/trial-matching` to `/trials`:

**TrialSpotlight.tsx:**
```tsx
// Change line 112
<Link to="/trials">  // was: /trial-matching
```

**useGlobalSearch.ts:**
```tsx
// Change line 153
url: `/trials`,  // was: /trial-matching
```

### Step 2: Fix Status Filtering Logic
Update `useTrialMatching.ts` to use correct column name and exact matching:

**Current problematic code:**
```typescript
if (status === "recruiting") {
  queryBuilder = queryBuilder.or("status.ilike.%Recruiting%,recruiting_status.ilike.%Recruiting%");
}
```

**Fixed code:**
```typescript
if (status === "recruiting") {
  // Use exact match on overall_status to avoid matching "Active, not recruiting"
  queryBuilder = queryBuilder.eq("overall_status", "Recruiting");
} else if (status === "enrolling") {
  queryBuilder = queryBuilder.eq("overall_status", "Enrolling by Invitation");
} else if (status === "active") {
  queryBuilder = queryBuilder.eq("overall_status", "Active, not recruiting");
}
```

This uses exact matching on the correct `overall_status` column instead of pattern matching.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/discover/TrialSpotlight.tsx` | Update Link from `/trial-matching` to `/trials` |
| `src/hooks/useGlobalSearch.ts` | Update URL from `/trial-matching` to `/trials` |
| `src/hooks/useTrialMatching.ts` | Fix status filter to use `overall_status` with exact matching |

---

## Expected Outcome

After these changes:
- Clicking "Find Trials Near You" will navigate to `/trials` correctly
- Global search results for trials will link to the correct page
- The "Recruiting" filter will only show trials with `overall_status = "Recruiting"` (currently 5 trials in database)
- Completed trials will no longer appear in recruiting results
