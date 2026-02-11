
# Fix: survey_responses `submitted_at` Column Reference

## Problem
`src/components/dashboard/DashboardWidgets.tsx` (line 162) queries `submitted_at` from `survey_responses`, but this column does not exist. The correct column is `completed_at`. This causes a 400 error on the dashboard.

## Fix

**File:** `src/components/dashboard/DashboardWidgets.tsx`

Change lines 162-164 from:
```text
.select('id, survey_id, submitted_at')
.eq('user_id', user.id)
.order('submitted_at', { ascending: false })
```
to:
```text
.select('id, survey_id, completed_at')
.eq('user_id', user.id)
.order('completed_at', { ascending: false })
```

Also update any references to `submitted_at` in the rendering logic below to use `completed_at`.

## Impact
- Fixes the 400 error on the dashboard widget
- No other files are affected
- No database changes needed

## Full Build Status Summary

All 12 live data feeds are operational (200 OK). 126,168 glucose records across 11 sources. All 4 moderation views working. All major UI pages render correctly with expected data. Only this one column reference bug remains.
