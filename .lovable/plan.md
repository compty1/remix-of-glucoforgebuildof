

# Fix: Real Reviews Not Showing for Medications and Devices

## Root Cause

The current scraped data has two critical quality issues:

1. **Junk content passes through**: Many reviews contain scraped navigation boilerplate ("Skip to main content", "Error 403", "Healthline - Health Conditions...") instead of actual review text. The frontend junk filter (`useExternalReviews.ts`) catches some but not enough -- and there is no equivalent filter on the medication side.

2. **Low volume**: Only 151 device reviews and 364 medication reviews exist. The edge functions do only 2-3 Firecrawl searches per item, producing thin coverage.

3. **No `onlyMainContent` flag**: The Firecrawl search scrape options don't request `onlyMainContent: true`, so full-page HTML boilerplate gets scraped alongside actual content.

## Solution

### Step 1: Improve both edge functions to produce cleaner, higher-volume data

**For `fetch-device-reviews/index.ts`:**
- Add `onlyMainContent: true` to all Firecrawl `scrapeOptions`
- Expand the `JUNK_MARKERS` list to match the frontend filter (add ~20 more markers like `go to main content`, `visit website`, `share - facebook`, `error 403`, `claimed profile`, `trustscore`, etc.)
- Add a 3rd web search pass per device with different query angles to increase volume
- Strip Reddit navigation boilerplate from scraped markdown (`Skip to main content`, `Skip to Navigation`)

**For `fetch-medication-reviews/index.ts`:**
- Add `onlyMainContent: true` to Reddit Firecrawl `scrapeOptions`
- Add the same expanded `JUNK_MARKERS` filter to the Reddit post scraping (currently missing entirely)
- Clean Reddit content by stripping "Skip to main content" and navigation text before inserting
- Increase Reddit search `limit` from 3 to 5 per medication to boost community buzz volume

### Step 2: Expand the frontend junk filter

**In `src/hooks/useExternalReviews.ts`:**
- Add more junk markers: `go to main content`, `visit website`, `error 403`, `error 404`, `claimed profile`, `trustscore`, `share - facebook`, `logoproducts`, `dexcom logo`
- This ensures any remaining junk in the database is hidden from the UI

### Step 3: Purge existing junk data and re-fetch

- DELETE all records from `external_device_reviews`, `external_medication_reviews`, and `medication_community_buzz`
- Re-run `fetch-device-reviews` for all 8 devices (1 batch)
- Re-run `fetch-medication-reviews` in batches of 5 across all 44 medications
- Target: 400+ clean device reviews, 600+ clean medication reviews, 150+ community buzz posts

### Step 4: Verify

- Query the database to confirm record counts and source diversity
- Check that no junk content remains
- Visually verify the device detail page shows real reviews with proper source badges

## Technical Details

### Edge function changes (fetch-device-reviews)

```text
- scrapeOptions: { formats: ['markdown'] }
+ scrapeOptions: { formats: ['markdown'], onlyMainContent: true }

- JUNK_MARKERS: 10 entries
+ JUNK_MARKERS: 30+ entries (matching frontend filter)

+ Add 3rd search: "{device} diabetes user feedback forum"
```

### Edge function changes (fetch-medication-reviews)

```text
- scrapeOptions: { formats: ['markdown'] }
+ scrapeOptions: { formats: ['markdown'], onlyMainContent: true }

+ Add isJunkContent() filter to fetchRedditPosts results
+ Clean Reddit content: strip "Skip to main content" prefix

- limit: 3 per medication
+ limit: 5 per medication
```

### Frontend filter expansion (useExternalReviews.ts)

```text
Add to JUNK_MARKERS:
  'go to main content', 'visit website', 'error 403', 'error 404',
  'claimed profile', 'trustscore', 'share - facebook',
  'logoproducts', 'dexcom logo', 'products patients'
```

### Execution order

1. Deploy updated edge functions
2. Purge all 3 tables
3. Run device fetch (1 batch of 8)
4. Run medication fetch (9 batches of 5)
5. Verify counts and content quality

