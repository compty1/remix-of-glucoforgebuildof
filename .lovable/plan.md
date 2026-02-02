

# RLS Security Fixes Plan

## Overview
Fix 3 overly permissive RLS policies flagged by the database linter that use `WITH CHECK (true)` for INSERT operations, plus address leaked password protection.

---

## Security Issues to Fix

### 1. `community_comments` Table
**Current Policy:** `Authenticated users can add comments` with `WITH CHECK (true)`

**Problem:** Any authenticated user can insert a comment with any `user_id`, potentially impersonating other users.

**Solution:** Replace with proper user validation:
```sql
DROP POLICY "Authenticated users can add comments" ON public.community_comments;

CREATE POLICY "Users can add their own comments"
ON public.community_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

---

### 2. `notifications` Table
**Current Policy:** `System can insert notifications` with `WITH CHECK (true)`

**Problem:** Any connection can insert notifications for any user.

**Solution:** Create a service role-only INSERT policy and add user-based insert for own notifications:
```sql
DROP POLICY "System can insert notifications" ON public.notifications;

-- Service role for edge functions/triggers
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- Users can only create notifications for themselves (edge case)
CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

---

### 3. `volunteer_interests` Table
**Current Policy:** `Anyone can submit volunteer interest` with `WITH CHECK (true)`

**Problem:** Allows insertion without any validation of user_id or data integrity.

**Solution:** Require either an authenticated user or valid email:
```sql
DROP POLICY "Anyone can submit volunteer interest" ON public.volunteer_interests;

-- For authenticated users - must match their user_id
CREATE POLICY "Authenticated users can submit volunteer interest"
ON public.volunteer_interests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- For anonymous submissions - no user_id but requires email
CREATE POLICY "Anonymous users can submit volunteer interest with email"
ON public.volunteer_interests
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL 
  AND email IS NOT NULL 
  AND email <> ''
);
```

---

### 4. Enable Leaked Password Protection
**Issue:** Password security feature is disabled.

**Action:** Use the configure-auth tool to enable leaked password protection in auth settings.

---

## Files to Modify

### Database Migration
Single SQL migration file with all policy changes:
- Drop 3 existing overly permissive policies
- Create 5 replacement policies with proper validation
- All changes are non-breaking (same functionality, just more secure)

---

## Implementation Order

1. Create and apply database migration for RLS policy fixes
2. Configure auth to enable leaked password protection
3. Verify policies are correctly applied via linter

---

## Risk Assessment

| Change | Risk Level | Rollback |
|--------|------------|----------|
| `community_comments` policy | Low | Users must be authenticated, only affects new inserts |
| `notifications` policy | Low | Edge functions use service role, unaffected |
| `volunteer_interests` policy | Low | Public form still works with email validation |
| Leaked password protection | None | Additive security feature |

---

## Post-Implementation Verification

1. Re-run database linter to confirm 0 warnings
2. Test comment submission flow
3. Test volunteer interest form
4. Verify push notifications still work (uses service role)

