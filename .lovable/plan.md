

# Plan: Complete Settings Integration & Nightscout Connectivity

## Problem Summary

Many settings components and features were created but **never wired into the UI**. The Settings page (`src/pages/Settings.tsx`) only has 5 tabs (Profile, Notifications, Privacy, Appearance, Data) and is missing:

1. **Nightscout Connector** -- exists at `src/components/settings/NightscoutConnector.tsx` but is never imported or rendered anywhere
2. **Hormonal Cycle Tracker** -- exists at `src/components/settings/HormonalCycleTracker.tsx`, never used
3. **Bluetooth Device Pairing** -- exists at `src/components/settings/BluetoothDevicePairing.tsx`, never used
4. **Device Connection Guide** -- exists at `src/components/settings/DeviceConnectionGuide.tsx`, never used
5. **Retinopathy Accessibility Mode** -- hook exists (`useRetinopathyMode.ts`) but no toggle in Settings
6. **Alert Budget** -- utility exists (`alertBudget.ts`) but no preferences UI in Settings
7. **Burnout Awareness** -- hook exists (`useBurnoutAwareness.ts`) but no toggle in Settings
8. **Subscription Tier** -- hook exists (`useSubscriptionTier.ts`) but no display in Settings
9. **Digital Companion** -- component exists but no toggle to enable/disable it
10. **Charity Points** -- component exists but no visibility in Settings
11. **Data Export (DSAR)** -- edge function exists but no "Download My Data" button using it
12. **Mentor Directory, Provider Dashboard, Audit Log, Feature Flag Manager** -- pages exist but no routes in `App.tsx`

Additionally, Nightscout should appear in contextually relevant places beyond just Settings (Dashboard, Data Upload, App Center).

---

## Implementation

### 1. Expand Settings Page with New Tabs

Add two new tabs to `src/pages/Settings.tsx`:

- **"Integrations"** tab -- containing:
  - `NightscoutConnector` component (already built, just import and render)
  - `BluetoothDevicePairing` component
  - `DeviceConnectionGuide` component

- **"Accessibility"** tab -- containing:
  - Retinopathy Mode toggle (using `useRetinopathyMode` hook)
  - Reduced Motion preference display
  - Alert Budget configuration (daily limit slider, snooze controls)
  - Burnout-Aware Notifications toggle

Update the tab grid from `grid-cols-5` to `grid-cols-7` (or use a scrollable tab list).

### 2. Add Missing Settings to Existing Tabs

- **Profile tab**: Add `HormonalCycleTracker` component below the Research Participation section
- **Appearance tab**: Add Retinopathy Mode quick toggle, Digital Companion enable/disable toggle
- **Data tab**: Add "Download Full Data Archive" button that calls the `dsar-export` edge function. Add subscription tier display.
- **Notifications tab**: Add Alert Budget controls (max alerts/day, snooze duration)

### 3. Wire Nightscout Throughout the Build

- **Dashboard** (`src/pages/Dashboard.tsx`): Add a "Connect Nightscout" banner/widget if no Nightscout connection exists, linking to Settings > Integrations
- **Data Upload** (`src/pages/DataUpload.tsx`): Add a "Or sync from Nightscout" call-to-action alongside the file upload, linking to Settings > Integrations
- **App Center** (`src/pages/AppCenter.tsx`): When showing the Nightscout app card, add a "Connect" button that links to Settings > Integrations

### 4. Add Missing Routes to App.tsx

Add lazy imports and routes for pages that exist but have no routes:

- `/mentors` -> `MentorDirectory`
- `/provider/dashboard` -> `ProviderDashboard` (protected)
- `/admin/audit-log` -> `AuditLog` (admin-only)
- `/admin/feature-flags` -> `FeatureFlagManager` (admin-only)

### 5. Wire Retinopathy Mode Globally

In `App.tsx`, call `useRetinopathyMode()` and apply the CSS class to `<html>` when enabled, and import `retinopathy-mode.css`.

### 6. Admin Settings Sync

Ensure `AdminSettings.tsx` feature flags list includes the new flags: `nightscout_sync`, `bluetooth_pairing`, `nfc_scanning`, `retinopathy_mode`, `alert_budget`, `burnout_detection`, `charity_points`, `digital_companion`, `mentor_matching`, `local_ai`.

---

## Technical Details

### Files to modify:
1. **`src/pages/Settings.tsx`** -- Add "Integrations" and "Accessibility" tabs; import and render `NightscoutConnector`, `BluetoothDevicePairing`, `DeviceConnectionGuide`, `HormonalCycleTracker`; add retinopathy toggle, alert budget UI, burnout toggle, DSAR export button, subscription display
2. **`src/App.tsx`** -- Add lazy imports and routes for `MentorDirectory`, `ProviderDashboard`, `AuditLog`, `FeatureFlagManager`; apply retinopathy mode class globally; import `retinopathy-mode.css`
3. **`src/pages/Dashboard.tsx`** -- Add Nightscout connection status banner
4. **`src/pages/DataUpload.tsx`** -- Add "Sync from Nightscout" CTA
5. **`src/pages/AppCenter.tsx`** -- Add "Connect" action on Nightscout app card
6. **`src/pages/admin/AdminSettings.tsx`** -- Expand default feature flags list with all new features

### New files: None -- all components and utilities already exist.

### Database changes: None -- all tables already exist.

### Edge function changes: None -- `dsar-export` already deployed.

