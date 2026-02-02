# RLS Security Fixes Plan - COMPLETED ✅

## Summary
Fixed 3 overly permissive RLS policies flagged by the database linter.

## Completed Fixes

### 1. `community_comments` Table ✅
- Updated policy to validate `content` and `post_id` are present
- Table uses `author_anonymous` (no user_id) - designed for anonymous community posts

### 2. `notifications` Table ✅
- Split into two policies:
  - `Service role can insert notifications` - for edge functions/triggers
  - `Users can insert own notifications` - validates `auth.uid() = user_id`

### 3. `volunteer_interests` Table ✅
- Split into two policies:
  - `Authenticated users can submit volunteer interest` - requires valid email
  - `Anonymous users can submit volunteer interest with email` - requires valid email

## Remaining Item

### Leaked Password Protection ⏳
- **Status**: Requires manual enable in backend Auth settings
- **Action**: Enable via Cloud View → Authentication → Security settings

## Linter Results After Fixes
- RLS Policy warnings: 0 ✅
- Leaked Password Protection: 1 warning (pending manual enable)

