

# Fix Content Loading Issues Plan

## Problem Summary

Multiple pages fail to load content because:
1. Device detail pages reference old UUIDs that were replaced during seeding
2. Medications seeding fails due to invalid date format
3. Related seed functions fail due to foreign key violations (stale device IDs)
4. Warrior stories seeding fails due to missing database column

---

## Implementation Steps

### Phase 1: Database Schema Fix

**Add missing column for warrior stories:**
```sql
ALTER TABLE warrior_stories 
ADD COLUMN IF NOT EXISTS source_link_verified boolean DEFAULT false;
```

---

### Phase 2: Fix Seed Function Data Errors

**File: `supabase/functions/seed-medications/index.ts`**

Line 1180 - Replace invalid date with null:
```typescript
// Before
fda_approval_date: "Not FDA approved for T1D",

// After  
fda_approval_date: null,
```

---

### Phase 3: Fix Foreign Key Issues in Dependent Seed Functions

**File: `supabase/functions/seed-trending-issues/index.ts`**
- Modify to dynamically fetch device IDs from the `devices` table by name
- Replace hardcoded UUIDs with dynamic lookups:
```typescript
// Fetch current device IDs
const { data: devices } = await supabase
  .from('devices')
  .select('id, name');

// Create lookup map
const deviceMap = new Map(devices.map(d => [d.name, d.id]));

// Use in seed data
device_id: deviceMap.get('Dexcom G7')
```

**File: `supabase/functions/seed-device-improvements/index.ts`**
- Same dynamic lookup approach

---

### Phase 4: Improve Error Handling for Device Detail Page

**File: `src/pages/DeviceDetail.tsx`**

Improve the "Device not found" error state to redirect users:
```tsx
if (error) {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Device not found. The device may have been updated or removed.
            <Button variant="link" onClick={() => navigate('/devices')}>
              Browse all devices
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </Layout>
  );
}
```

**File: `src/hooks/useDeviceDetails.ts`**

Change `.single()` to `.maybeSingle()` to handle missing devices gracefully:
```typescript
const { data: deviceData, error: deviceError } = await supabase
  .from('devices')
  .select('*')
  .eq('id', deviceId)
  .maybeSingle();  // Instead of .single()

if (!deviceData) {
  setError('Device not found');
  setLoading(false);
  return;
}
```

---

### Phase 5: Re-run Failed Seed Functions

After fixes are deployed, re-run in order:
1. `seed-real-warrior-stories`
2. `seed-medications`
3. `seed-trending-issues`
4. `seed-device-improvements`

---

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Add `source_link_verified` column |
| `supabase/functions/seed-medications/index.ts` | Fix invalid date at line 1180 |
| `supabase/functions/seed-trending-issues/index.ts` | Dynamic device ID lookup |
| `supabase/functions/seed-device-improvements/index.ts` | Dynamic device ID lookup |
| `supabase/functions/seed-real-warrior-stories/index.ts` | Remove or fix `source_link_verified` field |
| `src/hooks/useDeviceDetails.ts` | Use `.maybeSingle()` instead of `.single()` |
| `src/pages/DeviceDetail.tsx` | Improve error state with navigation |

---

## Technical Details

### Why This Happened

The seed functions follow a **delete-all-then-insert** pattern which:
1. Generates new UUIDs for each run
2. Breaks any existing URLs/bookmarks
3. Breaks foreign key references in dependent tables

### Recommended Future Improvement

Consider using **upsert with stable IDs** or **name-based lookups** instead of delete-all patterns to maintain URL stability.

---

## Testing Checklist

After implementation:
- [ ] Navigate to a device detail page - should show device or helpful error
- [ ] Medications page shows medication data
- [ ] Trending issues display on device pages
- [ ] Warrior stories page loads content

