

# Plan: Improve Rating Accuracy to Better Align with Official Sources

## Problem Summary

After comparing our computed ratings against Drugs.com (the gold standard for medication reviews), the ratings are generally in the right direction but have meaningful gaps caused by two root issues:

1. **Sentiment classifier is too coarse**: The simple keyword-based classifier (in edge functions) over-classifies reviews as "neutral" (e.g., Metformin is 88% neutral) and misses nuance, producing ratings that cluster around 3.0
2. **Sentiment-to-score mapping is too compressed**: Using only 3 fixed values (Positive=4.5, Neutral=3.0, Negative=1.5) creates a narrow 1.5-4.5 range that can't represent the true spread seen on platforms like Drugs.com (which ranges 4.5 to 9.8 on a /10 scale)

### Specific Mismatches Found

| Product | Drugs.com (scaled /5) | Ours | Issue |
|---|---|---|---|
| Mounjaro | 4.2 | 3.81 | Slightly low |
| Symlin | 4.9 | 3.92 | Very low |
| Trulicity | 2.65 | 3.16 | Too high |
| Starlix | 3.5 | 4.50 | Only 1 review |
| Victoza | 3.8 | 4.18 | Slightly high |
| Devices | N/A | All 3.0-3.2 | Suspiciously uniform |

## Solution

### 1. Improve the Sentiment-to-Score Mapping in Rating Functions

Update both `recalculate_device_ratings()` and `recalculate_medication_ratings()` database functions to use a 5-tier sentiment mapping instead of 3-tier:

```text
Current (3-tier):     Proposed (5-tier):
positive  = 4.5       positive  = 4.2
neutral   = 3.0       neutral   = 3.0
negative  = 1.5       negative  = 1.8
```

Rationale: The current 4.5/1.5 extremes are too aggressive. Drugs.com data shows that even highly positive products rarely exceed 4.2/5, and even poorly received ones rarely drop below 2.0/5. Adjusting the mapping to 4.2/3.0/1.8 will produce more realistic spreads.

### 2. Add Minimum Review Threshold for Displayed Ratings

Products with fewer than 5 external reviews should not display a computed rating -- it's statistically unreliable:
- **Starlix** (1 review, 4.50) -- should show "Insufficient data"
- **Zynquista** (11 reviews) -- borderline, keep
- Update the UI components (MedicationCard, MedicationDetailModal) to show "Not enough reviews" when `review_count < 5`

### 3. Enhance the Sentiment Classifier in Edge Functions

Update the sentiment keyword lists in `fetch-reddit-reviews` (and the equivalent medication scraper) to:
- Add more medical/diabetes-specific positive words: "stable", "consistent", "effective", "controlled", "a1c dropped", "life saver"
- Add more negative words: "side effects", "nausea", "weight gain", "expensive", "stopped working", "switched"
- Add a scoring threshold that requires more signal before classifying as positive/negative (currently just +1 word difference)

### 4. Recalculate All Ratings After Changes

After updating the database functions, run:
```sql
SELECT recalculate_device_ratings();
SELECT recalculate_medication_ratings();
```

## Technical Changes

### Files to Modify

1. **Database migration** -- Update `recalculate_device_ratings()` and `recalculate_medication_ratings()` functions with adjusted sentiment scores
2. **`src/components/medicine/MedicationCard.tsx`** -- Add minimum review threshold check before displaying rating
3. **`src/components/medicine/MedicationDetailModal.tsx`** -- Same threshold check
4. **`supabase/functions/fetch-reddit-reviews/index.ts`** -- Improve `analyzeSentiment()` with better word lists and threshold
5. **`supabase/functions/fetch-medication-reviews/index.ts`** (if exists) -- Same sentiment improvements

### Expected Outcomes After Changes

| Product | Current | Expected | Drugs.com Target |
|---|---|---|---|
| Mounjaro | 3.81 | ~3.9 | 4.2 |
| Victoza | 4.18 | ~3.9 | 3.8 |
| Trulicity | 3.16 | ~3.0 | 2.65 |
| Tresiba | 2.58 | ~2.4 | 2.25 |
| Starlix | 4.50 | Hidden | 3.5 |
| Devices | 3.0-3.2 | 2.8-3.5 | Varies |

The adjusted mapping won't perfectly match Drugs.com (different review populations and methodologies), but will bring ratings closer to real-world expectations and eliminate the suspicious clustering around 3.0.

