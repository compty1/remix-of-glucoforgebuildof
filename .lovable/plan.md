

# Comprehensive Bug Fixes and Polish Plan (Final Complete - Extended to 36)

This plan adds 6 newly discovered bugs (31-36) to the existing 30-item list. Nothing unrelated will be changed or removed.

---

## Previously Identified Issues (Bugs 1-30)

All previously identified bugs remain unchanged. See prior plan versions for full details on Bugs 1-30 covering:
- `.single()` to `.maybeSingle()` fixes (Bugs 1, 14-17, 19, 21-22, 25)
- Filter value fixes (Bugs 2-3)
- OptInBanner stale form (Bug 4)
- Connection request logic (Bugs 5, 8-9, 12)
- Double recordVisit (Bug 6)
- NotificationCenter styling (Bug 7)
- DM notification debounce (Bug 10)
- ConnectionRequestModal reset (Bug 11)
- Realtime subscriptions for unread counts and notifications (Bugs 13, 24)
- DirectMessagePanel scroll fix (Bug 18)
- Copyright year (Bug 20)
- recordVisit unstable ref (Bug 23)
- Race conditions in toggleHelpful and upvote (Bugs 26, 29)
- useSavedPosts auth pattern (Bug 27)
- useChatSessions getSession (Bug 28)
- useStreaks stale closure (Bug 30)

---

## Newly Identified Issues (Bugs 31-36)

### Bug 31: `useExperienceCounts` Makes 5 Sequential DB Queries Instead of 1
**File**: `src/hooks/useExperienceSubmissions.ts` (lines 41-68)
**Problem**: The `useExperienceCounts` hook runs a `for` loop over 5 categories, issuing 5 sequential `SELECT COUNT(*)` queries one after the other. This is slow and wasteful -- all 5 could be done in parallel with `Promise.all`, or better yet, replaced with a single query that groups by category.
**Fix**: Replace the sequential `for` loop with a single query:
```
supabase.from('experience_submissions')
  .select('category', { count: 'exact', head: false })
  .eq('is_approved', true)
```
Then group client-side. Alternatively, use `Promise.all` for the 5 parallel count queries.

### Bug 32: `useMedicationDetails` Uses `.single()` for Medication Lookup
**File**: `src/hooks/useMedicationDetails.ts` (line 60)
**Problem**: Fetches medication by ID with `.single()`. If the medication ID in the URL is invalid or has been deleted, this throws a 406 error instead of showing a "not found" state. The `useMedicationByName` (line 158) has the same issue -- `.single()` with `ilike` could match zero rows or multiple rows, both causing errors.
**Fix**: Change both to `.maybeSingle()`. For `useMedicationByName`, `.maybeSingle()` also handles the case where `ilike` matches multiple medications gracefully (returns the first or null).

### Bug 33: `ArticleDetail` View Count Has Read-Then-Write Race Condition
**File**: `src/pages/ArticleDetail.tsx` (lines 62-66)
**Problem**: After fetching an article with `.single()`, the view count is incremented using `data.views + 1`. This is the same read-then-write pattern as Bugs 26/29. Two simultaneous visitors will read the same `views` value and both write `views + 1`, losing one increment. Additionally, the `.single()` on line 56 should be `.maybeSingle()` for graceful 404 handling.
**Fix**: The view count increment is cosmetic so the race is low-impact, but change the fetch to `.maybeSingle()` and show a proper "article not found" UI instead of an error toast + redirect.

### Bug 34: `useProjects` View Count Has Same Read-Then-Write Race
**File**: `src/hooks/useProjects.ts` (lines 180-188)
**Problem**: Identical pattern to Bug 33: fetches project with `.single()`, reads `data.view_count`, writes `view_count + 1`. Also, using `.single()` means an invalid slug will throw a 406 instead of returning null.
**Fix**: Change to `.maybeSingle()` and handle null. The view count race is cosmetic but should ideally use an atomic increment.

### Bug 35: `useT1DCompanies.useCompanyById` Uses `.single()` Without 404 Handling
**File**: `src/hooks/useT1DCompanies.ts` (line 177)
**Problem**: Fetches company by ID with `.single()`. If someone navigates to `/companies/invalid-uuid`, this throws a 406 error. The `CompanyDetail` page shows an error message via the `error` state, but the browser console still logs a 406 network error.
**Fix**: Change to `.maybeSingle()`. The existing error handling in `CompanyDetail.tsx` already shows a "Company not found" message, so this just cleans up the console error.

### Bug 36: `ShopSuccess` Uses `.single()` for Order Lookup by Stripe Session ID
**File**: `src/pages/shop/ShopSuccess.tsx` (line 42)
**Problem**: Fetches order by `stripe_session_id` with `.single()`. If the Stripe webhook hasn't created the order yet (race condition on redirect), or if the session ID is invalid, this throws a 406 error. The page has no retry logic or loading state that accounts for webhook delay.
**Fix**: Change to `.maybeSingle()`. If `orderData` is null, show a "Your order is being processed..." message with a retry button or automatic polling (e.g., retry every 3 seconds for up to 30 seconds) to handle the webhook delay gracefully.

---

## Technical Details

### Database Migration (unchanged from prior plan)
```sql
-- Bug 8: Prevent self-requests
ALTER TABLE connection_requests
  ADD CONSTRAINT chk_no_self_request CHECK (from_user_id <> to_user_id);

-- Bug 9: Prevent duplicate pending requests
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_request
  ON connection_requests(from_user_id, to_user_id) WHERE status = 'pending';

-- Bug 10: Debounce DM notifications
CREATE OR REPLACE FUNCTION public.notify_direct_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  sender_name TEXT;
  recent_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.notifications
    WHERE user_id = NEW.receiver_id
      AND type = 'direct_message'
      AND is_read = false
      AND created_at > NOW() - INTERVAL '5 minutes'
  ) INTO recent_exists;

  IF NOT recent_exists THEN
    SELECT display_name INTO sender_name
    FROM public.diabetic_profiles
    WHERE user_id = NEW.sender_id LIMIT 1;

    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      NEW.receiver_id, 'direct_message',
      'New message from ' || COALESCE(sender_name, 'a connection'),
      LEFT(NEW.content, 100),
      '/find-diabetics'
    );
  END IF;
  RETURN NEW;
END;
$$;
```

### Complete File Changes Summary

| Bug | File | Change |
|-----|------|--------|
| 1 | `DashboardWidgets.tsx` | `.single()` to `.maybeSingle()` |
| 1 | `useDashboardLayout.ts` | `.single()` to `.maybeSingle()`, remove PGRST116 |
| 2-3 | `FindDiabeticNearMe.tsx` | Fix filter `onValueChange` for "all" to `""` |
| 4 | `OptInBanner.tsx` | Add `useEffect` to sync form from `myProfile` |
| 5 | `FindDiabeticNearMe.tsx` | Comprehensive connected/requested user ID set |
| 6 | `Layout.tsx` | Remove duplicate `recordVisit`, `useStreaks`, `useRef` |
| 7 | `NotificationCenter.tsx` + `Layout.tsx` | Accept and pass `className` prop |
| 8-10 | Database migration | Constraints, index, trigger debounce |
| 11 | `ConnectionRequestModal.tsx` | Reset message on open |
| 12 | `useDiabeticProfiles.ts` | Add user ID filter to delete |
| 13 | `useDirectMessages.ts` | Add realtime subscription to `useUnreadCounts` |
| 14 | `useOnboarding.ts` | `.single()` to `.maybeSingle()` |
| 15 | `useSurveySubmission.ts` | `.single()` to `.maybeSingle()` |
| 16 | `useSurveyDemographics.ts` | `.single()` to `.maybeSingle()` |
| 17 | `usePushNotifications.ts` | `.single()` to `.maybeSingle()` |
| 18 | `DirectMessagePanel.tsx` | Fix scroll with sentinel element |
| 19 | `withAdmin.tsx` | `.single()` to `.maybeSingle()` |
| 20 | `Layout.tsx` | Dynamic copyright year |
| 21 | `Settings.tsx` | `.single()` to `.maybeSingle()` |
| 22 | `DemographicsForm.tsx` | `.single()` to `.maybeSingle()` |
| 23 | `useStreaks.ts` | Stabilize `recordVisit` callback reference |
| 24 | `useNotifications.ts` | Add realtime subscription for live updates |
| 25 | `useDeviceDetails.ts` | `.single()` to `.maybeSingle()` for device_metrics |
| 26 | `useMedicationReviews.ts` | Fix race condition in toggleHelpful, add double-click guard |
| 27 | `useSavedPosts.ts` | Replace `supabase.auth.getUser()` with `useAuthStore`, add user ID to query key |
| 28 | `useChatSessions.ts` | `.single()` to `.maybeSingle()`, add user ID filter |
| 29 | `useExperienceSubmissions.ts` | Fix race condition in upvote, add double-click guard |
| 30 | `useStreaks.ts` | Query DB inside mutation instead of stale closure |
| 31 | `useExperienceSubmissions.ts` | Replace sequential count loop with `Promise.all` or single grouped query |
| 32 | `useMedicationDetails.ts` | `.single()` to `.maybeSingle()` for both medication lookups |
| 33 | `ArticleDetail.tsx` | `.single()` to `.maybeSingle()`, proper 404 UI |
| 34 | `useProjects.ts` | `.single()` to `.maybeSingle()`, handle null project |
| 35 | `useT1DCompanies.ts` | `.single()` to `.maybeSingle()` in `useCompanyById` |
| 36 | `ShopSuccess.tsx` | `.single()` to `.maybeSingle()`, add retry/polling for webhook delay |

### Unchanged
All existing pages, routes, sidebar navigation, dashboard widgets, diabetes burnout, peer comparison, research hub, devices, shop checkout flow, and all other features remain completely untouched. Only targeted fixes to the 36 items listed above.

