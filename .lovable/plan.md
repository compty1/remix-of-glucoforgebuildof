

# Multi-Feature Implementation Plan

This plan addresses 5 key areas: scroll fix, health comparison in data analysis, experience page layout improvements, financial workarounds section, and quality of life comparison section.

---

## 1. Fix Analysis Results Modal Scroll Issue

**Problem:** The `AnalysisResultsModal` dialog uses `max-h-[90vh]` on the outer container and `max-h-[calc(90vh-140px)]` on the `ScrollArea`, but the content overflows without proper scrolling in some cases.

**Fix:**
- In `src/components/data-upload/AnalysisResultsModal.tsx`:
  - Change `DialogContent` from `max-h-[90vh]` to `h-[90vh]` with `flex flex-col`
  - Ensure the `Tabs` component has `className="flex-1 flex flex-col overflow-hidden"`
  - Update `ScrollArea` to use `className="flex-1"` instead of a fixed `max-h` calc
  - This ensures the scroll container fills available space and content is always scrollable

---

## 2. Add Health & QoL Comparison Tab in Data Analysis

**What it does:** After uploading CGM data, users see a new "Health Comparison" tab that compares their metrics against a healthy non-diabetic person, with actionable supplement and lifestyle recommendations.

**Implementation:**
- Create `src/components/data-upload/HealthComparisonPanel.tsx` -- a new component with:
  - **T1D vs Non-Diabetic comparison table** using real clinical benchmarks:
    - Non-diabetic TIR: ~96-99%, Avg glucose: 85-100 mg/dL, CV: 15-20%, A1C/GMI: 4.8-5.6%
    - Compares user's actual values side by side with gap analysis
  - **Physical Health Impact section**: cardiovascular risk, kidney function, neuropathy risk, eye health -- each with real clinical data on how glucose variability affects these vs a healthy person
  - **Mental Health Impact section**: decision fatigue (180-300 daily decisions vs 0), sleep disruption, chronic stress hormone elevation
  - **Personalized Supplement Recommendations** based on their glucose data:
    - Vitamin D (insulin sensitivity), Magnesium (glucose metabolism), Omega-3 (cardiovascular), Alpha-Lipoic Acid (neuropathy), Chromium (insulin sensitivity)
    - Each with dosage, reasoning, and evidence level
  - **Actionable Lifestyle Plans**: water intake targets, walking after meals, sleep optimization, stress management -- all with specific T1D-relevant reasoning
  - All comparisons use real clinical data and cite sources (ADA, ATTD, Diabetes Care journal)

- Add "Health" tab to `AnalysisResultsModal.tsx` tabs list, rendering `HealthComparisonPanel` and passing `detailedAnalysis` data

---

## 3. Fix Your Experience Page Layout

**Changes to `src/pages/YourExperience.tsx`:**
- Move `DailyTasksJar` and `FearsCloud` OUT of the 2-column grid
- Give each its own full-width row (same as Embarrassing Lows)
- Order: Good/Bad Jars -> Daily Tasks (full width) -> Fears & Worries (full width) -> Embarrassing Lows (full width)

**Changes to `src/components/experience/FearsCloud.tsx`:**
- Replace the compact word-cloud-only design with an expanded layout matching `EmbarrassingLowsJar`:
  - Keep the storm cloud animation but reduce its height
  - Add a scrollable story list below it (like Embarrassing Lows has) showing full submission content with `line-clamp-2` and click-to-expand via `EntryModal`
  - Add upvote buttons matching the Embarrassing Lows pattern

**Changes to `src/components/experience/DailyTasksJar.tsx`:**
- Move the "Daily Tasks Others Don't Have" heading to be more prominent
- Ensure it renders at full width with the same card/list pattern

---

## 4. Financial & Insurance Workarounds Section

**Create `src/components/resources/CommunityWorkaroundsSection.tsx`:**
- A new section for the Resources page featuring real, verified workarounds people use for device/medicine/insurance coverage
- Organized into tabs: Devices, Medications, Insurance, Financial
- Each workaround card shows:
  - Title, full description, step-by-step instructions
  - Source (Reddit, forums, verified community posts) with link
  - Comments/discussion snippets
  - "Last verified" date and active status indicator
  - Category tags (e.g., "Dexcom", "Free coupon", "Manufacturer program")

**Seed data includes real, currently-active programs:**
- Manufacturer coupons: Dexcom savings card, Libre coupon, Omnipod copay card
- Patient assistance: Lilly $35 insulin, Novo Nordisk PAP, Sanofi Patient Connection
- Community-shared workarounds: Walmart ReliOn insulin ($25/vial), Mark Cuban's Cost Plus Drugs, GoodRx discount codes
- Insurance workarounds: appeal letter strategies, peer-to-peer review tips, formulary exception requests

**Add to `src/pages/Resources.tsx`:** Import and render `CommunityWorkaroundsSection` as a new prominent section above or below the existing tabs.

**Database:** Create a `community_workarounds` table via migration:
- `id`, `title`, `description`, `instructions` (text), `category` (device/medication/insurance/financial), `source_url`, `source_platform`, `comments` (jsonb array), `is_verified`, `last_verified_at`, `is_active`, `tags` (text array), `upvotes`, `created_at`
- RLS: public read, authenticated write
- Seed with 15-20 verified, real workarounds

---

## 5. Quality of Life: T1D vs Healthy Person Comparison

**Create `src/components/quality-of-life/QoLComparisonSection.tsx`:**
- Research-backed comparison section with two main areas:

**Physical Health Comparison:**
- Cardiovascular risk (2-4x higher in T1D, citing ADA Standards of Care)
- Kidney function (40% develop some nephropathy, citing DCCT/EDIC)
- Neuropathy prevalence (50% over lifetime vs <1%)
- Life expectancy gap (~8-13 years, citing Scottish Diabetes Registry & Swedish NDR)
- Sleep quality (45% report disrupted sleep vs 15% general population)
- Exercise capacity and glucose management challenges

**Mental Health Comparison:**
- Daily decision load (180-300 diabetes decisions vs ~35 health decisions for non-diabetic)
- Diabetes distress prevalence (25-45% vs 0%)
- Depression rates (2-3x higher, citing Anderson et al. meta-analysis)
- Anxiety prevalence (20% vs 7% general population, citing Smith et al.)
- Burnout and chronic vigilance burden
- Social impact and stigma data

**Visual presentation:**
- Side-by-side comparison cards with metrics
- Bar charts using Recharts for visual impact comparison
- Each comparison cites its source (journal name, year)
- An "overall QoL score" comparison based on WHO-5, PAID, and SF-36 validated instruments

**Add to `src/pages/QualityOfLife.tsx`:** Import and render between the deficiencies section and the Real Experiences section.

---

## Technical Details

### Files to Create:
1. `src/components/data-upload/HealthComparisonPanel.tsx`
2. `src/components/resources/CommunityWorkaroundsSection.tsx`
3. `src/components/quality-of-life/QoLComparisonSection.tsx`

### Files to Modify:
1. `src/components/data-upload/AnalysisResultsModal.tsx` -- fix scroll + add Health tab
2. `src/pages/YourExperience.tsx` -- layout restructure
3. `src/components/experience/FearsCloud.tsx` -- expand to full entry list
4. `src/pages/Resources.tsx` -- add workarounds section
5. `src/pages/QualityOfLife.tsx` -- add comparison section

### Database Migration:
- Create `community_workarounds` table with seed data of real, verified programs

### No changes to:
- Theme/color system (already migrated)
- Unrelated components
- Supabase client or types files

