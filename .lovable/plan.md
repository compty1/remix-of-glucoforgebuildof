

# Part 1: Quick Fixes (AdminDashboard + AppCenter Polish)

These are small, targeted changes that can be done quickly.

## 1A. Fix AdminDashboard queries from `shifts` to `uploads`
**File:** `src/pages/admin/AdminDashboard.tsx`
- Change the "Data Uploads" count query from `.from('shifts')` to `.from('uploads')` (lines 41-43)
- Change the "Active Users" query from `.from('shifts')` to `.from('uploads')` (lines 58-61)
- Ensures the card labels match the actual data being queried

## 1B. Add tooltip for missing source URLs in app reviews
**File:** `src/pages/AppCenter.tsx`
- When `source_url` is null on an app review, add a `title` attribute to the source platform badge: "Original link unavailable -- review sourced from [platform]"
- Small accessibility and transparency improvement

## 1C. Add app review submission form for logged-in users
**File:** `src/pages/AppCenter.tsx`
- Add a review form (star rating + title + content textarea + submit button) below the existing reviews list
- Only visible to authenticated users (use `useAuthStore`)
- On submit, insert into `app_reviews` table with `source_platform = 'GlucoForge'` and the user's `user_id`
- Follow the same pattern already used in `MedicationDetailModal.tsx` for star rating input
- Show success toast on submission and refetch reviews

---

# Part 2: useQuery Migrations (AppCenter + DashboardWidgets)

These are medium-effort refactors that standardize data fetching across the platform.

## 2A. Migrate AppCenter to useQuery
**File:** `src/pages/AppCenter.tsx`
- Replace `useState` + `useEffect` pattern for `apps` with `useQuery({ queryKey: ['diabetes-apps'], staleTime: 10 * 60 * 1000 })`
- Replace `fetchAppReviews` with `useQuery({ queryKey: ['app-reviews', selectedApp?.id], enabled: !!selectedApp?.id, staleTime: 5 * 60 * 1000 })`
- Replace `fetchAppBuzz` with `useQuery({ queryKey: ['app-buzz', selectedApp?.id], enabled: !!selectedApp?.id, staleTime: 5 * 60 * 1000 })`
- Remove the `useEffect` blocks and `loading`/`setLoading` state variables
- Use `isLoading` from `useQuery` instead

## 2B. Migrate DashboardWidgets to useQuery
**File:** `src/components/dashboard/DashboardWidgets.tsx`
- Replace each widget's `useEffect` + `useState` data fetching with individual `useQuery` calls
- Each widget type gets its own query key and `staleTime: 5 * 60 * 1000`
- Remove raw `supabase` fetch patterns from `useEffect` blocks
- Use `isLoading` and `data` from `useQuery` for each widget's render logic
- Aligns with the platform-wide React Query standardization effort

