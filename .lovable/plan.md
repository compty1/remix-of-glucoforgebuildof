

# Plan: Clean Up Fake Data, Deprecate `rating_avg`, and Boost Reviews to 100+

## Summary

Three major actions: (1) delete all 72 seeded fake user reviews and recalculate ratings, (2) fully deprecate the stale `rating_avg` column in favor of computed `avg_rating`, and (3) re-run and enhance scrapers to reach 100+ reviews per product.

---

## Step 1: Delete 72 Fake Seeded User Reviews

All 32 device_reviews and 40 medication_reviews have `user_id` values like `00000000-0000-0000-0000-000000000001` through `00000000-...0010`. These are entirely seeded placeholder data.

**Database operations:**
- `DELETE FROM device_reviews WHERE user_id::text LIKE '00000000%'` (removes 32 rows)
- `DELETE FROM medication_reviews WHERE user_id::text LIKE '00000000%'` (removes 40 rows)

After deletion, run both recalculation RPCs:
- `SELECT recalculate_device_ratings()` -- ratings will now come purely from external reviews
- `SELECT recalculate_medication_ratings()` -- same

**UI cleanup:**
- Remove the "Demo Reviews" banner and "Demo Data" badge logic from `UserReviewsList.tsx` (the seed-detection code added in the previous phase is no longer needed since there will be no seed reviews)
- Remove "Sample" badge logic from `UserReviewsList.tsx` -- all remaining reviews will be real

---

## Step 2: Deprecate `rating_avg` Column

The `rating_avg` column on the `medications` table contains stale hardcoded seed values (e.g., 4.2, 4.3) that conflict with the dynamically computed `avg_rating`. Currently 5 files still reference `rating_avg`.

**Frontend changes (4 files):**

1. **`src/hooks/useMedications.ts`** (line 38, 103):
   - Remove `rating_avg` from the `Medication` type interface
   - Change sort case `"rating"` from `query.order("rating_avg", ...)` to `query.order("avg_rating", ...)`

2. **`src/components/medicine/MedicationCard.tsx`** (lines 97-101):
   - Replace `(medication as any).avg_rating || medication.rating_avg` with simply `medication.avg_rating`
   - Remove the `(medication as any)` cast -- `avg_rating` will be a proper field on the type

3. **`src/components/medicine/MedicationDetailModal.tsx`** (lines 224-229):
   - Replace `(medication as any).avg_rating || medication.rating_avg` with `medication.avg_rating`
   - Remove fallback to `rating_avg`
   - Remove the "Reference Data" badge entirely (line 235-237) since all ratings are now computed

4. **`src/pages/MedicineComparison.tsx`** (lines 190-193):
   - Replace `med.rating_avg` with `med.avg_rating` (using the `as any` cast if needed until types regenerate)

**Database migration:**
- Set `rating_avg = NULL` for all medications to prevent any accidental use
- We will NOT drop the column (to avoid breaking the auto-generated types.ts), but nullify it

---

## Step 3: Boost Device Reviews to 100+ Per Product

Current device review counts range from 7 (Medtronic 780G) to 62 (Tandem Mobi). Target is 100+ each.

**Enhancement to `fetch-device-reviews/index.ts`:**
- Add more search query angles per device:
  - "pros and cons" comparison queries
  - "long term" user experience queries
  - Forum-specific queries (diabetesdaily, tudiabetes, beyondtype1)
  - YouTube review queries
- Increase Firecrawl `limit` from 15 to 20 per search
- Add 3 additional search passes per device (total ~7-8 passes vs current 5)
- Focus extra queries on the lowest-count devices (Medtronic 780G at 7, Omnipod 5 at 29)

**Execution:** Deploy the updated function, then invoke it for all 8 devices via `refresh-reviews`.

---

## Step 4: Boost Medication Reviews to 100+ Per Product

27 medications have fewer than 50 external reviews, including 6 with 0. Several have fewer than 15.

**Enhancement to `fetch-medication-reviews/index.ts`:**
- Increase Drugs.com pagination from pages 1-5 to pages 1-10 for medications with low counts
- Add more web search queries per medication (WebMD reviews, Healthline, patient forums)
- Add fallback search queries for the 6 medications with 0 reviews (Humulin N, Novolin N, Precose, Humulin R U-500, Retatrutide, Zynquista) using generic names and drug class terms
- Increase Reddit search breadth by adding more subreddit targets

**Missing Drugs.com URLs:** Add entries for medications not currently in the URL map:
- `tresiba u-200`, `humalog u-200`, `humulin n`, `humulin r u-500`, `novolin n`, `retatrutide`, `zynquista`, `baqsimi`, `gvoke`

**Execution:** Deploy the updated function, then invoke it for all medications via `refresh-reviews`.

---

## Step 5: Run Scrapers and Recalculate

After deploying updated edge functions:

1. Call `fetch-device-reviews` for all 8 devices in batches of 2 with delays
2. Call `fetch-medication-reviews` for all 44 medications in batches of 10 with delays
3. Run `SELECT recalculate_device_ratings()` and `SELECT recalculate_medication_ratings()`
4. Verify counts: query both external review tables to confirm 100+ per product

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/hooks/useMedications.ts` | Replace `rating_avg` with `avg_rating` in type and sort query |
| `src/components/medicine/MedicationCard.tsx` | Use `avg_rating` directly, remove `rating_avg` fallback |
| `src/components/medicine/MedicationDetailModal.tsx` | Use `avg_rating` directly, remove Reference Data badge |
| `src/pages/MedicineComparison.tsx` | Use `avg_rating` instead of `rating_avg` |
| `src/components/device/UserReviewsList.tsx` | Remove demo/seed detection banners (no more seed data) |
| `supabase/functions/fetch-device-reviews/index.ts` | Add more search queries, increase limits |
| `supabase/functions/fetch-medication-reviews/index.ts` | Add missing drug URLs, increase pagination, add search passes |

### Database Operations (via insert tool, not migrations)
- DELETE seeded reviews (72 rows)
- UPDATE medications SET rating_avg = NULL
- SELECT recalculate_device_ratings()
- SELECT recalculate_medication_ratings()

### Execution Order
1. Delete fake reviews from both tables
2. Nullify `rating_avg` on all medications
3. Update frontend to use `avg_rating` everywhere
4. Update and deploy both scraper edge functions
5. Run scrapers to boost counts
6. Recalculate all ratings
7. Verify end-to-end

