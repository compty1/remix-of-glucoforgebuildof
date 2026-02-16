

# Remove Connection + Direct Messaging for Find a Diabetic Near Me

## Overview
Two additions to the existing Connections tab on `/find-diabetics`:
1. A "Remove Connection" button on each accepted connection card, with a confirmation dialog
2. A full direct messaging (DM) system so connected users can chat after accepting a request

## 1. Remove/Disconnect from a Connection

### UI Changes
- Add a "Disconnect" button (with `UserMinus` icon) to each card in the "My Connections" section of `ConnectionsTab.tsx`
- Clicking it opens an `AlertDialog` confirmation: "Are you sure you want to disconnect from [name]?"
- On confirm, deletes the `connection_requests` row entirely

### Hook Changes (`useDiabeticProfiles.ts`)
- Add a `removeConnection` mutation that deletes from `connection_requests` where `id` matches and the user is either `from_user_id` or `to_user_id`

### Database (Migration)
- Add an RLS policy on `connection_requests` allowing DELETE when `auth.uid()` is either `from_user_id` or `to_user_id`

## 2. Direct Messaging Between Connected Users

### Database (Migration)
New table: `direct_messages`
- `id` (uuid, PK, default gen_random_uuid())
- `sender_id` (uuid, not null)
- `receiver_id` (uuid, not null)
- `content` (text, not null)
- `is_read` (boolean, default false)
- `created_at` (timestamptz, default now())

RLS policies:
- SELECT: user can read messages where they are sender or receiver
- INSERT: user can send messages where `sender_id = auth.uid()` AND the sender+receiver pair has an accepted connection request
- UPDATE: receiver can mark messages as read (`is_read` only)

Enable realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;`

Notification trigger: `notify_direct_message()` -- on INSERT, creates a notification for the receiver with type "direct_message", linking to `/find-diabetics`

### New Hook: `src/hooks/useDirectMessages.ts`
- `useConversation(otherUserId)`: fetches all messages between current user and otherUserId, ordered by created_at
- `sendMessage` mutation: inserts into `direct_messages`
- `markAsRead` mutation: updates `is_read = true` for unread messages from the other user
- Realtime subscription on `direct_messages` to get live updates
- `useUnreadCounts()`: fetches unread message counts grouped by sender for badge display

### New Component: `src/components/find-diabetics/DirectMessagePanel.tsx`
- A slide-out panel (using Sheet from radix) or inline expandable section
- Shows conversation history with the selected connection
- Message input at the bottom with send button
- Messages styled similarly to the existing `ChatMessage.tsx` pattern (user on right, other on left)
- Auto-scroll to latest message
- Marks messages as read when the panel is open

### UI Integration in `ConnectionsTab.tsx`
- Add a "Message" button (with `MessageCircle` icon) next to each accepted connection card
- Clicking opens the `DirectMessagePanel` for that user
- Show unread message count badge on each connection card if there are unread messages
- Add unread count to the "Connections" tab badge in `FindDiabeticNearMe.tsx`

### Notification Center Update
- Add `direct_message` to the `TYPE_ICONS` map in `NotificationCenter.tsx` (use `💬` icon)

## Files Summary

### New Files
- `src/hooks/useDirectMessages.ts`
- `src/components/find-diabetics/DirectMessagePanel.tsx`

### Modified Files
- `src/hooks/useDiabeticProfiles.ts` -- add `removeConnection` mutation
- `src/components/find-diabetics/ConnectionsTab.tsx` -- add Disconnect button with confirmation, Message button, unread badges, DM panel integration
- `src/pages/FindDiabeticNearMe.tsx` -- pass `removeConnection` to ConnectionsTab, update badge to include unread DMs
- `src/components/notifications/NotificationCenter.tsx` -- add `direct_message` icon

### Database Migration
- RLS DELETE policy on `connection_requests`
- `direct_messages` table with RLS policies
- Realtime enabled for `direct_messages`
- `notify_direct_message()` trigger function and trigger

### Unchanged
All other pages and features remain untouched.

