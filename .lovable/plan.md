

# Fix: Missing `/auth` Route Causing 404

## Problem

The `/auth` route was accidentally removed from `App.tsx`. The `Auth` component is imported (line 18) but there is no `<Route path="/auth" ...>` anywhere in the routes list. Since `ProtectedRoute` and `AdminRoute` both redirect unauthenticated users to `/auth`, they land on the 404 catch-all route instead.

This means:
- Users cannot log in or sign up
- Any protected page redirect leads to a 404
- The app is effectively locked out for new/logged-out users

## Fix

Add the missing auth route back to `App.tsx`. This is a single-line addition.

### Change in `src/App.tsx`

Add this line after the existing public routes (around line 185, after the `/` route):

```
<Route path="/auth" element={<Auth />} />
```

This goes alongside the other public (non-protected) routes like `/`, `/about`, `/journey`, etc. The Auth page should NOT be wrapped in `ProtectedRoute` since unauthenticated users need to access it.

No other files need changes -- the `Auth` component is already imported and the rest of the routing infrastructure is intact.

