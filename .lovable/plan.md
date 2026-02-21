

# Fetch Real Device Reviews and Community Buzz via Firecrawl

## Problem

The device pages currently show only 55 seeded/fabricated reviews across 8 devices. The "Platform Reviews" tab and "Community Buzz" section lack real, sourced content. The medication side already has 894+ real Drugs.com reviews and 104 Reddit community posts fetched via Firecrawl, but nothing equivalent exists for devices.

## Solution

Create a new `fetch-device-reviews` edge function that uses Firecrawl to:
1. **Scrape Google review results** for each device (targeting sites like Reddit, Healthline, Verywell Health, JDRF, DiaTribe, etc.) to populate `external_device_reviews` as "Platform Reviews"
2. **Search Reddit** for real community discussions to populate a new device community buzz flow

This mirrors the existing `fetch-medication-reviews` pattern.

## Plan

### Step 1: Create `fetch-device-reviews` edge function

A new edge function at `supabase/functions/fetch-device-reviews/index.ts` that:

- Accepts `startIndex` and `batchSize` params for batch processing
- For each device in the `devices` table:
  - **Google/Web reviews**: Uses Firecrawl search (`site:reddit.com OR site:diatribe.org OR site:healthline.com OR site:verywellhealth.com {device name} review`) to find real review content. Scrapes each result for markdown content.
  - **Reddit community buzz**: Uses Firecrawl search (`site:reddit.com {device name} experience review`) to find real Reddit posts, then inserts them into `external_device_reviews` with `source: 'reddit'`
- Performs sentiment analysis on scraped content
- Deduplicates by `external_id` before inserting
- Targets 50+ reviews per popular device (Dexcom G7, Omnipod 5, etc.) to reach 400+ total across all 8 devices

Device-specific search queries:
- **Dexcom G7**: `"dexcom g7" review experience accuracy`
- **Dexcom G6**: `"dexcom g6" review experience`
- **Omnipod 5**: `"omnipod 5" review experience`
- **Tandem t:slim X2**: `"tandem tslim" OR "t:slim x2" review`
- **Medtronic 780G**: `"medtronic 780g" review experience`
- **Freestyle Libre 3**: `"freestyle libre 3" review experience`
- **Beta Bionics iLet**: `"ilet bionic pancreas" review experience`
- **Tandem Mobi**: `"tandem mobi" review experience`

### Step 2: Clear existing seeded device reviews

Before running the new function, delete the 55 existing fabricated reviews from `external_device_reviews` so only real Firecrawl-sourced content remains.

### Step 3: Run the edge function in batches

Execute `fetch-device-reviews` in batches of 2-3 devices at a time to stay within edge function timeout limits. Each device will get multiple Firecrawl search calls to maximize review count.

### Step 4: Verify data and UI

- Confirm 400+ real reviews exist with proper `source` labels (reddit, diatribe, healthline, etc.)
- Confirm `source_url` fields link to real pages
- Confirm the device detail page shows reviews with source badges and "View source" links in both "Platform Reviews" and "Community Buzz" tabs

## Technical Details

### Edge function structure
```text
supabase/functions/fetch-device-reviews/index.ts
  - DEVICE_SEARCH_QUERIES: Record<device_name, search_terms>
  - fetchWebReviews(deviceName, searchQuery): uses Firecrawl search API
  - fetchRedditBuzz(deviceName): uses Firecrawl search with site:reddit.com
  - analyzeSentiment(text): reuses same keyword-based approach
  - Main handler: iterates devices, fetches reviews, inserts into external_device_reviews
```

### Database operations
- INSERT into `external_device_reviews` (existing table, no schema changes needed)
- Fields used: `device_id`, `source`, `external_id`, `author_anonymous`, `rating`, `title`, `content`, `sentiment`, `helpful_count`, `published_at`, `source_url`, `device_mentioned`, `verified_purchase`, `subreddit`

### No UI changes needed
The existing `DeviceReviewsTab` and `useExternalReviews` hook already read from `external_device_reviews` and display source badges, sentiment filters, and source links. Once the data is populated, it will render automatically.
