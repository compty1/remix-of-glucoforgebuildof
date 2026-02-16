

# Connection Management and Notification System for Find a Diabetic Near Me

## Verification Results
All three pages (/diabetes-burnout, /find-diabetics, /dashboard) render correctly with no console errors. Data loads successfully across all features.

## New Features

### 1. Accept/Decline Connection Requests + Connections List

**New tab "Connections" on the Find a Diabetic Near Me page** (added as a 5th tab alongside People, Orgs, Online, Tips):

- **Incoming Requests section**: Shows pending requests sent TO the user, each with the sender's profile info (display name, city/state, message), and Accept / Decline buttons
- **My Connections section**: Shows all accepted connections with linked profile cards. Each card has a "View Profile" action
- **Sent Requests section**: Shows outgoing pending requests with status badges

**Hook changes (`useDiabeticProfiles.ts`)**:
- Add `updateConnectionStatus` mutation (updates `connection_requests.status` to "accepted" or "declined")
- Add query to fetch profiles for connected users (join connection_requests with diabetic_profiles)
- Enrich `myRequests` data with sender/receiver profile info by fetching associated `diabetic_profiles`

**New component**: `src/components/find-diabetics/ConnectionsTab.tsx`
- Renders the three sections (incoming, connections, sent)
- Each incoming request shows the sender's avatar, name, location, their intro message, and Accept/Decline buttons
- Accepted connections show full profile cards with the connection date

### 2. In-App Notification on New Connection Request

**Database trigger** (via migration):
- Create a trigger function `notify_connection_request()` on the `connection_requests` table
- On INSERT: creates a row in `notifications` for `to_user_id` with type "connection_request", title "New Connection Request", a message including the sender's display name, and link "/find-diabetics" (navigates to the Connections tab)
- On UPDATE (status changed to "accepted"): creates a notification for `from_user_id` saying their request was accepted

This leverages the existing `notifications` table and `NotificationCenter` component -- no changes needed to the notification UI. The bell icon will automatically show the new notification with the unread badge.

**NotificationCenter update**: Add `connection_request` to the `TYPE_ICONS` map (use a handshake or user-plus icon emoji).

## Technical Details

### Database Migration
- New trigger function `notify_connection_request()` (SECURITY DEFINER) that:
  - On INSERT: looks up sender's `display_name` from `diabetic_profiles`, inserts into `notifications` for the recipient
  - On UPDATE to "accepted": looks up accepter's `display_name`, inserts into `notifications` for the original sender
- Trigger: `AFTER INSERT OR UPDATE ON connection_requests`

### Modified Files
- `src/hooks/useDiabeticProfiles.ts` -- Add `updateConnectionStatus` mutation, add profiles-enriched requests query
- `src/pages/FindDiabeticNearMe.tsx` -- Add 5th "Connections" tab with badge showing pending count
- `src/components/notifications/NotificationCenter.tsx` -- Add `connection_request` icon to TYPE_ICONS

### New Files
- `src/components/find-diabetics/ConnectionsTab.tsx` -- Full connections management UI with incoming requests, accepted connections, and sent requests sections

### Unchanged
- All existing pages, components, and features remain untouched
- Diabetes Burnout page, Peer Comparison, Dashboard, Discover, Public Glucose Data -- no changes
