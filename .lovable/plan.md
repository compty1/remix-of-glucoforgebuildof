

# Plan: Fix `avg_rating` Type Gap and Remove Unnecessary Casts

## Problem

The `Medication` interface in `useMedications.ts` is missing the `avg_rating` field. The auto-generated Supabase types already include `avg_rating` on the medications table, but the manually defined `Medication` interface never added it. This forces all UI files to use `(medication as any).avg_rating` casts, which is fragile and defeats TypeScript's type safety.

## Changes

### 1. Add `avg_rating` to the `Medication` interface (`src/hooks/useMedications.ts`)

- Add `avg_rating: number | null;` to the interface (after `prescribing_info_url`)
- Keep the deprecated `rating_avg` line (since the column still exists in the DB and auto-generated types reference it) but it will no longer be used anywhere

### 2. Remove `(medication as any)` casts in 3 files

**`src/components/medicine/MedicationCard.tsx`** (lines 97, 100):
- Change `(medication as any).avg_rating` to `medication.avg_rating`

**`src/components/medicine/MedicationDetailModal.tsx`** (lines 223, 228):
- Change `(medication as any).avg_rating` to `medication.avg_rating`

**`src/pages/MedicineComparison.tsx`** (lines 190, 193):
- Change `(med as any).avg_rating` to `med.avg_rating`

## Verification

All data is already correct in the database:
- All 44 medications have non-null `avg_rating` values computed from real external reviews
- All 8 devices have 100+ reviews with computed `avg_rating`
- `rating_avg` is NULL across all medications
- Zero fake seeded reviews remain in either table
- The sort query already uses `avg_rating` correctly

This is purely a type-safety cleanup -- no behavioral changes, just removing unsafe casts.
