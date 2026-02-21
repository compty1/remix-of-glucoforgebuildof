

# Fix All Review Gaps: Real Product Reviews + Community Buzz

## Summary of All Issues Found

| # | Issue | Severity |
|---|-------|----------|
| 1 | **Drugs.com scraping broken** -- parses raw markdown paragraphs, produces zero usable reviews. All 156 were previously deleted as junk. | Critical |
| 2 | **41 of 49 medications have zero external reviews** -- only 12 Reddit reviews across 8 meds remain | Critical |
| 3 | **0 community buzz records** -- `medication_community_buzz` table is empty, Community tab shows nothing for all meds | Critical |
| 4 | **5 duplicate medications** (Afrezza, Farxiga, Invokana, Rybelsus, Tradjenta) -- 10 records instead of 5, splitting data | High |
| 5 | **No medication source URLs** -- all 12 existing Reddit reviews have `source_url = NULL` | High |
| 6 | **Device reviews have markdown artifacts** -- `[](url)` empty links, `filter your search`, `Clipboard, Search History` junk in content | High |
| 7 | **6 junk device reviews** remain (pubmed navigation, "filter your search", "community form" placeholder, "link" source, "hcp" promotional, "web" non-review) | Medium |
| 8 | **Medication modal doesn't sanitize external review content** -- line 406 renders raw `review.content` without stripping markdown | Medium |
| 9 | **No Google/WebMD/Amazon badge or source** -- badge colors defined in `ExternalReviewCard` but zero data exists for those sources | Medium |
| 10 | **Medication limit of 8** in edge function -- only processes first 8 meds per run | Medium |
| 11 | **Reddit terms only cover 9 of 49 medications** -- most meds have no search config | Medium |
| 12 | **Drugs.com URL mappings only cover 11 of 49 medications** | Medium |
| 13 | **"Demo Data" badge on real external reviews** in device reviews tab (line 286 of DeviceReviewsTab) | Low |
| 14 | **Inconsistent source casing** -- device reviews have both "Reddit" and "reddit", medication reviews all lowercase "reddit" | Low |

---

## Phase 1: Database Cleanup

### 1A. Delete 6 junk device reviews
Remove records with IDs:
- `3c9e8980...` (PubMed "Clipboard, Search History" navigation)
- `13394e9f...` (diabetesjournals "filter your search" navigation)
- `4c5fbeda...` (community form placeholder)
- `d7805d8e...` ("link" source -- journal navigation "Find a journal, Publish with us")
- `1e8937ce...` ("hcp" -- promotional Medtronic page, not a review)
- `64ed1a76...` ("web" source -- news article, not a review)

### 1B. Deduplicate 5 medications
For each pair (Afrezza, Farxiga, Invokana, Rybelsus, Tradjenta):
- Pick the first ID as primary
- Move any `external_medication_reviews`, `medication_reviews`, `medication_community_buzz` from the duplicate ID to the primary
- Delete the duplicate medication record

### 1C. Normalize device review source casing
Update `external_device_reviews` to standardize sources: "Reddit" to "reddit" (lowercase), so filters work consistently.

---

## Phase 2: Rewrite Medication Review Fetching

### 2A. Rewrite `fetch-medication-reviews` edge function with Firecrawl JSON extraction
Replace the broken markdown paragraph parsing with Firecrawl's LLM-powered JSON extraction. This sends a schema defining the structure of a review (rating, content, author, date, condition) and Firecrawl returns structured data directly.

```text
formats: [{ 
  type: 'json', 
  schema: {
    type: 'object',
    properties: {
      reviews: { type: 'array', items: {
        type: 'object',
        properties: {
          rating: { type: 'number' },
          content: { type: 'string' },
          author: { type: 'string' },
          date: { type: 'string' },
          condition: { type: 'string' }
        }
      }}
    }
  }
}]
```

### 2B. Expand Drugs.com URL mappings to all 44 unique medications
Add URLs for Jardiance, Mounjaro, Trulicity, Victoza, Baqsimi, Glucagon, Admelog, Apidra, Humulin, Semglee, Xultophy, Soliqua, Januvia, Tradjenta, Invokana, Farxiga, Steglatro, Rybelsus, Afrezza, and all others.

### 2C. Expand Reddit search terms to all medications
Add search configs for all 44 unique medications, not just the current 9.

### 2D. Separate Reddit results into `medication_community_buzz` table
Reddit discussions should go to the buzz table (Community tab), while Drugs.com/WebMD reviews go to `external_medication_reviews` (Reviews tab). This properly separates official platform reviews from social feedback.

### 2E. Increase processing limit from 8 to 20 medications per run
Allow more medications to be processed before timeout. Add batch support so subsequent calls can continue where the last left off.

### 2F. Store real source_url for Reddit reviews
The current Reddit fetch already captures `post.permalink` but the 12 existing records have NULL URLs. The rewritten function will correctly persist these.

---

## Phase 3: Improve Device Review Fetching

### 3A. Enhance `cleanContent()` in `fetch-reddit-reviews`
Add patterns to strip:
- Empty markdown links: `[](url)` 
- Social share icons: `[](url#twitter)`, `[](url#facebook)`
- Navigation text: "filter your search", "Find a journal", "Publish with us"
- Emoji clusters at start of content

### 3B. Add content quality scoring
Skip results where cleaned content is mostly navigation, promotional, or under 100 chars after cleaning. Add a `JUNK_MARKERS` list matching the frontend hooks.

### 3C. Standardize source labels
Ensure source values are always lowercase and consistent (e.g., "reddit" not "Reddit").

---

## Phase 4: UI Fixes

### 4A. Sanitize external review content in MedicationDetailModal
Apply the same `sanitizeContent()` function (from `ExternalReviewCard.tsx`) to medication external reviews at lines 406 and 462. Currently renders raw markdown artifacts.

### 4B. Fix source display names in medication modal Community tab
Line 452 uses inline string manipulation. Replace with a proper `getSourceDisplayName()` map matching the one in `ExternalReviewCard.tsx`.

### 4C. Remove "Demo Data" badge from real external reviews
- Device reviews tab line 286: Only show "Demo Data" when reviews are seeded, not when fetched from real sources. Add a check: if all reviews have `fetched_at` timestamps, hide the badge.
- Medication modal lines 388 and 453: Same logic -- only show "Demo Data" for seeded content.

### 4D. Add Google search fallback link for all products
For medications and devices without platform reviews, add a "Search Google Reviews" button linking to `https://www.google.com/search?q=[product name]+reviews`.

### 4E. Properly separate Reviews vs Community tabs in medication modal
- **Reviews tab**: Show user reviews + Drugs.com/WebMD external reviews (official platform content)
- **Community tab**: Show `medication_community_buzz` records + Reddit entries from `external_medication_reviews` (social feedback)
- Currently the split logic at lines 384 and 442 is correct (Drugs.com in Reviews, non-Drugs.com in Community) but needs to also pull from `medication_community_buzz` which is currently empty but will be populated in Phase 2.

---

## Phase 5: Deploy and Populate

### 5A. Deploy updated edge functions
Deploy `fetch-medication-reviews` and `fetch-reddit-reviews`.

### 5B. Run medication review fetch
Invoke `fetch-medication-reviews` to populate:
- Drugs.com reviews into `external_medication_reviews` (Reviews tab)
- Reddit discussions into `medication_community_buzz` (Community tab)

### 5C. Run device review refresh (optional)
Invoke `fetch-reddit-reviews` to refresh device reviews with cleaner content.

### 5D. Verify data quality
Query database to confirm:
- No junk records remain
- Reviews have proper source URLs
- All 44 medications have at least some external content
- Community buzz table is populated

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/fetch-medication-reviews/index.ts` | Full rewrite: Firecrawl JSON extraction for Drugs.com, expand to 44 meds, separate Reddit into buzz table, increase limit |
| `supabase/functions/fetch-reddit-reviews/index.ts` | Enhance cleanContent(), add junk markers, quality scoring, standardize sources |
| `src/components/medicine/MedicationDetailModal.tsx` | Add sanitizeContent, fix source display names, conditional Demo badges, Google fallback link |
| `src/components/device/DeviceReviewsTab.tsx` | Conditional Demo badge, Google fallback link |
| `src/hooks/useExternalReviews.ts` | Add new junk markers for device patterns |

## Expected Outcomes
- 44 unique medications (deduplicated) with 3-10 Drugs.com reviews each in Reviews tab
- 44 medications with Reddit community discussions in Community tab  
- 8 devices with 54+ clean external reviews (6 junk removed, markdown artifacts stripped)
- All reviews content sanitized for display (no `[](url)` artifacts)
- Proper source badges everywhere (Google, WebMD, Drugs.com, Reddit)
- "Demo Data" badge only on seeded content, not real fetched reviews

