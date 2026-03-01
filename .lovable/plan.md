

# Rename "Platform Reviews" to "Consumer Reviews", Boost to 100+ Real Reviews per Product, Separate Social-Only Buzz, and Add Weekly Auto-Refresh

## What Changes

### 1. Rename "Platform Reviews" to "Consumer Reviews" everywhere

The first tab in the device and medication review sections currently says "Platform Reviews". This will be renamed to **"Consumer Reviews"** across all affected components:
- `DeviceReviewsTab.tsx` -- tab label
- `MedicationDetailModal.tsx` -- tab label and "From Review Platforms" heading
- `AppCenter.tsx` -- tab label if applicable

### 2. Calculate accurate overall review scores from imported reviews

Currently device `avg_rating` and `review_count` are based only on 32 seeded user reviews (fake user IDs like `00000000-...`). The real data lives in `external_device_reviews` (320 records) and `external_medication_reviews` (1,910 records) but isn't factored into any displayed rating.

**Changes:**
- **Devices:** Create a database function `recalculate_device_ratings()` that computes average sentiment score (positive=5, neutral=3, negative=1) from `external_device_reviews` combined with user `device_reviews`, then updates `devices.avg_rating` and `devices.review_count` with the combined total.
- **Medications:** Add `avg_rating` and `review_count` columns to the `medications` table. Create a matching `recalculate_medication_ratings()` function that computes from `external_medication_reviews` sentiment + user `medication_reviews` ratings.
- **Frontend:** Update `DeviceHero.tsx` to show the recalculated score, and `MedicationDetailModal.tsx` to display the computed average.
- Run both recalculation functions after data refresh.

### 3. Boost to 100+ real consumer reviews per product

Current state: devices average ~40 external reviews each, medications average ~43. Target is 100+ per product.

**Changes to edge functions:**
- **`fetch-device-reviews`:** Add 2 more search passes per device (total 5 passes) with varied query angles: product comparison queries, "pros and cons" queries, and long-term user experience queries. Increase per-search limit from 10 to 15.
- **`fetch-medication-reviews`:** Add more Drugs.com pagination (currently scrapes page 1 only -- add pages 2-5), and add a web search pass per medication for WebMD, Healthline, and other consumer review sources. Increase Reddit search limit from 5 to 8.

After deploying, re-run both scrapers to populate the database to 100+ reviews per product.

### 4. Make "Reviews & Buzz" only show social/community content

Currently the second tab ("Reviews & Buzz" for devices, "Community" for medications) mixes official review sources with social content. This will be cleaned up:

**Devices (`DeviceReviewsTab.tsx`):**
- Rename tab from "Reviews & Buzz" to "Community Buzz"
- Filter `externalReviews` to only show social sources (reddit, forum, facebook, youtube, medium, etc.) -- exclude official review sites (healthline, webmd, drugs.com, etc.)
- Move official-source external reviews into the "Consumer Reviews" tab alongside user reviews

**Medications (`MedicationDetailModal.tsx`):**
- Already mostly correct (official in Reviews tab, community in Buzz tab)
- Verify the source filter lists are comprehensive and consistent

### 5. Weekly auto-refresh of all reviews

Currently there is NO cron job to refresh review data. The `scheduled-maintenance` cron only verifies community post links.

**Changes:**
- Create a new edge function `refresh-reviews/index.ts` that:
  1. Calls `fetch-device-reviews` for all devices in batches
  2. Calls `fetch-medication-reviews` for all medications in batches
  3. Runs `recalculate_device_ratings()` and `recalculate_medication_ratings()`
  4. Logs results to `data_refresh_logs`
- Add a weekly cron job (Sundays 4 AM UTC) to invoke `refresh-reviews`

## Technical Details

### Database migrations

```text
-- Add rating columns to medications table
ALTER TABLE medications ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2);
ALTER TABLE medications ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Function: recalculate_device_ratings
CREATE OR REPLACE FUNCTION recalculate_device_ratings() ...
  - For each device: count external reviews by sentiment, combine with device_reviews avg
  - Sentiment mapping: positive=4.5, neutral=3.0, negative=1.5
  - Update devices.avg_rating and devices.review_count

-- Function: recalculate_medication_ratings() 
  - Same pattern for medications table
```

### Edge function changes

**`fetch-device-reviews/index.ts`:**
- Add search queries: `"{device}" pros cons comparison 2024 2025` and `"{device}" long term review diabetes experience`
- Increase limit per search from 10 to 15

**`fetch-medication-reviews/index.ts`:**
- Scrape Drugs.com pages 2-5 (currently only page 1)
- Add WebMD/Healthline web search pass per medication

**New `refresh-reviews/index.ts`:**
- Orchestrator that calls both fetch functions in batches with delays
- Calls rating recalculation RPCs
- Logs to data_refresh_logs

### Frontend changes

**`DeviceReviewsTab.tsx`:**
- Line 165: "Platform Reviews" -> "Consumer Reviews"  
- Line 169: "Reviews & Buzz" -> "Community Buzz"
- Add official-source external reviews to the Consumer Reviews tab
- Filter community tab to social-only sources

**`MedicationDetailModal.tsx`:**
- Line 409: "From Review Platforms" -> "Consumer Reviews"
- Ensure tab labels say "Consumer Reviews" not "Reviews"

**`AppCenter.tsx`:**
- Update any "Platform Reviews" labels to "Consumer Reviews"

### Cron job

```sql
SELECT cron.schedule(
  'weekly-review-refresh',
  '0 4 * * 0',  -- Sundays 4 AM UTC
  $$ SELECT net.http_post(...refresh-reviews...) $$
);
```

### Execution order

1. Deploy database migrations (add columns, create functions)
2. Update and deploy all 3 edge functions
3. Run scrapers to boost review counts to 100+
4. Run rating recalculation
5. Update frontend components
6. Add cron job
7. Verify end-to-end

