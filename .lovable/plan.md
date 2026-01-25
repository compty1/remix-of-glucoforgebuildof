
# Comprehensive Implementation Plan: Platform Feature Fixes and Enhancements

## Executive Summary

This plan addresses 7 critical issues discovered during codebase analysis:

1. **Company & Medicine Logos Not Visible** - Database has null values, components need proper logo integration
2. **Research Content Not T1D-Specific** - Filtering needed to show only Type 1 Diabetes research
3. **App Download Links** - Already working correctly, just needs verification
4. **Deep Dive Full Analysis Missing** - Tab exists but TabsContent is not implemented
5. **Site Search Functionality Missing** - No global search across platform content
6. **Public Glucose Data Analysis** - Enhance insights and add correlation discoveries

---

## Issue 1: Company & Medication Logos Not Visible

### Root Cause Analysis

**Company Logos:**
- Database: 39/60 companies have `logo_url: null`
- Remaining 21 use Clearbit API: `https://logo.clearbit.com/company.com`
- CompanyCard.tsx shows Unsplash product images instead of company logos
- No actual logo display logic in the component

**Medication Logos:**
- Database: ALL 49 medications have `logo_url: null`
- MedicationCard.tsx has ZERO logo display code
- No logo URLs were ever populated

### Solution

**Step 1: Update seed-company-logos edge function**
- Enhance with comprehensive logo sources:
  - Clearbit Logo API (primary)
  - Direct brand asset URLs for major companies
  - Brandfetch API as fallback
  - Generated SVG placeholders for smaller companies

**Step 2: Create seed-medication-logos edge function**
- Populate medication logos for all 49 medications
- Use pharmaceutical company brand assets
- Sources:
  - Lilly (Humalog, Basaglar)
  - Novo Nordisk (Novolog, Fiasp, Tresiba, Ozempic)
  - Sanofi (Lantus, Toujeo, Apidra)
  - Boehringer Ingelheim (Jardiance)
  - AstraZeneca (Farxiga)
  - Clearbit for manufacturer logos

**Step 3: Update CompanyCard.tsx**
- Replace Unsplash product images with actual `logo_url`
- Display company logo in card header (60x60px)
- Keep fallback icon if logo_url is null

**Step 4: Update MedicationCard.tsx**
- Add logo display in card header
- Show manufacturer logo (48x48px)
- Fallback to pill icon if logo_url is null

### Files Modified
- `supabase/functions/seed-company-logos/index.ts` (enhance)
- `supabase/functions/seed-medication-logos/index.ts` (create)
- `supabase/config.toml` (add new function)
- `src/components/companies/CompanyCard.tsx`
- `src/components/medicine/MedicationCard.tsx`
- `src/pages/CompanyDetail.tsx` (add logo to detail view)
- `src/pages/MedicineHub.tsx` (ensure logos display in detail modal)

---

## Issue 2: Research Content Not Type 1 Diabetes Specific

### Root Cause Analysis

**medical_research_papers table contains:**
- General diabetes research (Type 2 dominant)
- Diabetic neuropathy (not T1D-specific)
- Non-invasive glucose monitoring (general diabetes)
- Papers with `diabetes_relevance_score` but no T1D filtering

**Current State:**
- 500+ papers in database
- NO `diabetes_type` column or T1D filter
- Frontend displays all diabetes research without distinction

### Solution

**Step 1: Add T1D filtering to database**
```sql
ALTER TABLE medical_research_papers
ADD COLUMN is_type1_relevant boolean DEFAULT false,
ADD COLUMN diabetes_type text CHECK (diabetes_type IN ('type1', 'type2', 'general', 'gestational'));

CREATE INDEX idx_medical_research_t1d ON medical_research_papers(is_type1_relevant)
  WHERE is_type1_relevant = true;
```

**Step 2: Create AI classification edge function**
- `classify-research-t1d/index.ts`
- Use Lovable AI (gemini-2.5-flash) to classify existing papers
- Analyze title + abstract for T1D relevance:
  - Keywords: "type 1", "T1D", "autoimmune diabetes", "insulin dependent"
  - Exclusions: "type 2 only", "gestational", "prediabetes"
  - Context analysis for ambiguous cases

**Step 3: Update research aggregator edge functions**
- Modify `medical-research-aggregator/index.ts`
- Add T1D filtering to search queries:
  - PubMed: `("type 1 diabetes" OR "T1D" OR "insulin-dependent diabetes")`
  - OpenAlex: Filter by Type 1 diabetes concept ID
  - Semantic Scholar: Include T1D keywords

**Step 4: Update frontend queries**
- `src/hooks/useMedicalResearchPapers.ts`
- Add filter: `.eq('is_type1_relevant', true)`
- `src/pages/ResearchHub.tsx`
- Add toggle: "Show Type 1 Only" (default: ON)

### Files Modified
- Migration: `add_t1d_filtering_to_research.sql`
- `supabase/functions/classify-research-t1d/index.ts` (new)
- `supabase/functions/medical-research-aggregator/index.ts`
- `supabase/functions/openalex-research-feed/index.ts`
- `supabase/functions/semantic-scholar-feed/index.ts`
- `src/hooks/useMedicalResearchPapers.ts`
- `src/pages/ResearchHub.tsx`
- `supabase/config.toml`

---

## Issue 3: App Download Links Verification

### Current State Analysis

**Database Review:**
- mySugr: ✅ Real App/Play Store links
- Dexcom G7: ✅ Real links
- LibreLink: ✅ Real links
- Sugarmate: ✅ App Store + web portal
- Nightscout: ✅ App Store + GitHub
- xDrip+: ✅ **GitHub releases** (correct for open-source)
- Glooko: ✅ Real links
- Tidepool: ✅ App Store + web
- Diabits: ✅ Real links
- Calorie King: ✅ Real links

**Assessment: Download links are ALREADY CORRECT**

### Solution

**Only need to enhance display in AppCenter.tsx:**

**Step 1: Add download link validation indicator**
- Show green checkmark for verified links
- Display "Open Source" badge for GitHub downloads
- Add "Web App" badge for browser-based apps

**Step 2: Improve download button UX**
- Primary button for native app download (iOS/Android based on detection)
- Secondary buttons for alternative platforms
- Special styling for open-source downloads with GitHub icon
- Add tooltip: "Download from GitHub Releases" for xDrip+

### Files Modified
- `src/pages/AppCenter.tsx` (enhance download UI)

---

## Issue 4: Deep Dive Full Analysis Not Showing

### Root Cause Analysis

**ProjectDetail.tsx (lines 184-187):**
```tsx
<TabsTrigger value="full-report" className="gap-2">
  <BookOpen className="h-4 w-4" />
  <span className="hidden sm:inline">Full Analysis</span>
</TabsTrigger>
```

**BUT NO CORRESPONDING TabsContent:**
- TabsContent exists for: overview, research, solutions, discussion
- **MISSING:** `<TabsContent value="full-report">`
- ProjectFullReport component exists and works
- projectReportsContent.ts has comprehensive 4000+ word reports

**Result:** Users click "Full Analysis" tab and see nothing

### Solution

**Step 1: Add TabsContent to ProjectDetail.tsx**

Insert after line 408 (after overview TabsContent):

```tsx
<TabsContent value="full-report">
  <ProjectFullReport 
    projectSlug={project.slug}
    projectTitle={project.title}
  />
</TabsContent>
```

**Step 2: Verify report slugs match**

Check that project slugs in database match keys in projectReportsContent.ts:
- "morning-nausea" ✅
- "gastroparesis" ✅
- "dawn-phenomenon" ✅
- etc.

**Step 3: Add "Coming Soon" fallback for projects without reports**

ProjectFullReport.tsx already handles this (lines 115-126) with AlertCircle message.

### Files Modified
- `src/pages/ProjectDetail.tsx` (add TabsContent)

---

## Issue 5: Site Search Functionality Missing

### Current State

- CommunitySearchBar exists but ONLY searches community posts
- No global search across:
  - Projects/Deep Dives
  - Research papers
  - Clinical trials
  - Medications
  - Companies
  - Devices
  - Articles
  - Quality of Life experiences

### Solution

**Step 1: Create global search UI component**

**File: `src/components/search/GlobalSearchDialog.tsx`**
- Triggered by Cmd+K (Mac) or Ctrl+K (Windows)
- Search input with real-time results
- Categorized results (Projects, Research, Medications, etc.)
- Keyboard navigation support

**Step 2: Create search hook**

**File: `src/hooks/useGlobalSearch.ts`**
```typescript
interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'project' | 'research' | 'medication' | 'device' | 'company' | 'article';
  url: string;
  relevance: number;
}
```

**Search Implementation:**
- Debounced search (300ms)
- Parallel queries to multiple tables
- Text search using Postgres `to_tsvector` and `to_tsquery`
- Rank results by relevance

**Step 3: Add database search indexes**

```sql
-- Full-text search indexes
CREATE INDEX idx_projects_search ON health_projects USING GIN(to_tsvector('english', title || ' ' || description || ' ' || COALESCE(symptoms::text, '')));

CREATE INDEX idx_research_search ON medical_research_papers USING GIN(to_tsvector('english', title || ' ' || COALESCE(abstract, '')));

CREATE INDEX idx_medications_search ON medications USING GIN(to_tsvector('english', name || ' ' || COALESCE(generic_name, '') || ' ' || COALESCE(description, '')));

CREATE INDEX idx_devices_search ON devices USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX idx_companies_search ON t1d_companies USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

**Step 4: Add search trigger to Layout**

**File: `src/components/Layout.tsx`**
- Add search icon in header
- Keyboard shortcut listener (Cmd/Ctrl + K)
- Show GlobalSearchDialog on trigger

**Step 5: Create search edge function (optional, for advanced ranking)**

**File: `supabase/functions/global-search/index.ts`**
- Server-side search aggregation
- Advanced relevance scoring
- Caching for common queries

### Files Created/Modified
- `src/components/search/GlobalSearchDialog.tsx` (new)
- `src/components/search/SearchResultCard.tsx` (new)
- `src/hooks/useGlobalSearch.ts` (new)
- `src/components/Layout.tsx` (add search trigger)
- Migration: `add_search_indexes.sql` (new)
- `supabase/functions/global-search/index.ts` (new, optional)
- `supabase/config.toml` (add function if created)

---

## Issue 6: Enhanced Public Glucose Data Analysis

### Current State

**PublicGlucoseData.tsx already has:**
- 10,500 data points ✅
- 250 unique users ✅
- Demographics (age, gender, region) ✅
- Device data (pump, CGM) ✅
- Filters implemented ✅
- Basic visualizations:
  - 24-hour average patterns
  - Time in Range (TIR) distribution
  - Age-based TIR comparison
  - Device-based TIR comparison

**What's Missing:**
- Correlation discoveries
- Insulin dosing insights
- A1C estimation
- Pattern recognition
- Comparative analytics
- Export capabilities

### Solution

**Step 1: Add Advanced Correlation Analysis**

**New visualizations to add:**

1. **Insulin Sensitivity by Age**
   - Scatter plot: basal_rate vs. TIR by age group
   - Shows optimal dosing patterns

2. **Correction Factor Effectiveness**
   - Bar chart: Average correction_factor by control_level
   - Identifies optimal ratios

3. **Carb Ratio Impact**
   - Line chart: carb_ratio vs. post-meal glucose spikes
   - Regional comparison

4. **Device Combination Analysis**
   - Heatmap: TIR by pump + CGM combination
   - "Best device pairing" insights

5. **Regional Control Patterns**
   - Map visualization: Average TIR by location_region
   - Potential healthcare access insights

6. **Duration of Diabetes Impact**
   - Scatter: diabetes_duration_years vs. glucose variability
   - Shows progression patterns

**Step 2: Add AI-Powered Pattern Discovery**

**File: `supabase/functions/analyze-glucose-patterns/index.ts`**
- Use Lovable AI (gemini-2.5-flash)
- Analyze aggregated data for insights:
  - "Users with Omnipod 5 + Dexcom G7 show 12% higher TIR than MDI users"
  - "Age 18-30 group has highest overnight variability"
  - "Western Europe region has lowest hypoglycemia events"

**Step 3: Add Statistical Insights Cards**

**Component: `src/components/data-upload/GlucoseInsightCard.tsx`**
- Display discovered correlations
- "Did you know?" format
- Share button for insights

**Step 4: Add Data Export**

- Export filtered dataset as CSV
- Export visualizations as PNG
- Generate PDF report with insights

**Step 5: Add Demographic Breakdown Panel**

**Component: `src/components/data-upload/DemographicsPanel.tsx`**
- Pie charts for:
  - Age distribution
  - Gender distribution
  - Device usage
  - Regional representation
- Total participant count
- Data freshness indicator

### Files Modified/Created
- `src/pages/PublicGlucoseData.tsx` (add new visualizations)
- `src/components/data-upload/GlucoseInsightCard.tsx` (new)
- `src/components/data-upload/DemographicsPanel.tsx` (new)
- `src/components/data-upload/CorrelationMatrix.tsx` (new)
- `supabase/functions/analyze-glucose-patterns/index.ts` (new)
- `supabase/config.toml` (add function)

---

## Implementation Timeline

### Phase 1: Critical Fixes (Day 1)
**Priority: HIGH - User-facing broken features**

1. ✅ Fix Deep Dive Full Analysis (1 line of code)
   - Add TabsContent to ProjectDetail.tsx
   - Test with morning-nausea project

2. ✅ Company Logo Display
   - Update CompanyCard.tsx
   - Run seed-company-logos function
   - Verify logos appear

3. ✅ Medication Logo Implementation
   - Create seed-medication-logos function
   - Update MedicationCard.tsx
   - Populate and verify

### Phase 2: Research Filtering (Day 2)
**Priority: HIGH - Content quality**

4. ✅ Add T1D Research Filtering
   - Database migration
   - Create classify-research-t1d function
   - Update aggregator functions
   - Frontend filter toggle

### Phase 3: Site Search (Days 3-4)
**Priority: MEDIUM - New functionality**

5. ✅ Implement Global Search
   - Create search components
   - Add database indexes
   - Add to Layout
   - Test all categories

### Phase 4: Enhanced Analytics (Days 5-6)
**Priority: MEDIUM - Enhancement**

6. ✅ Public Glucose Advanced Analysis
   - Add correlation visualizations
   - Create pattern discovery function
   - Add insights cards
   - Add export features

### Phase 5: Polish (Day 7)
**Priority: LOW - UX improvements**

7. ✅ App Download Link Enhancements
   - Improve download button UX
   - Add validation indicators
   - Open-source badges

---

## Technical Implementation Details

### Database Migrations Required

**Migration 1: T1D Research Filtering**
```sql
-- Add Type 1 Diabetes classification
ALTER TABLE medical_research_papers
ADD COLUMN is_type1_relevant boolean DEFAULT false,
ADD COLUMN diabetes_type text CHECK (diabetes_type IN ('type1', 'type2', 'general', 'gestational')),
ADD COLUMN classification_confidence numeric CHECK (classification_confidence >= 0 AND classification_confidence <= 1);

CREATE INDEX idx_medical_research_t1d 
ON medical_research_papers(is_type1_relevant)
WHERE is_type1_relevant = true;

COMMENT ON COLUMN medical_research_papers.is_type1_relevant IS 'AI-classified Type 1 Diabetes relevance';
```

**Migration 2: Search Indexes**
```sql
-- Full-text search support
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_projects_search 
ON health_projects USING GIN(
  to_tsvector('english', 
    title || ' ' || 
    description || ' ' || 
    COALESCE(array_to_string(symptoms, ' '), '')
  )
);

CREATE INDEX idx_projects_title_trgm 
ON health_projects USING GIN(title gin_trgm_ops);

CREATE INDEX idx_research_search 
ON medical_research_papers USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(abstract, ''))
);

CREATE INDEX idx_medications_search 
ON medications USING GIN(
  to_tsvector('english', 
    name || ' ' || 
    COALESCE(generic_name, '') || ' ' || 
    COALESCE(description, '')
  )
);

CREATE INDEX idx_devices_search 
ON devices USING GIN(
  to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

CREATE INDEX idx_companies_search 
ON t1d_companies USING GIN(
  to_tsvector('english', name || ' ' || COALESCE(description, ''))
);
```

### Edge Functions to Create/Modify

**New Functions:**
1. `seed-medication-logos` - Populate medication brand logos
2. `classify-research-t1d` - AI classification for existing papers
3. `global-search` - Unified search endpoint (optional)
4. `analyze-glucose-patterns` - AI pattern discovery

**Modified Functions:**
1. `seed-company-logos` - Enhanced with more logo sources
2. `medical-research-aggregator` - Add T1D filtering
3. `openalex-research-feed` - Add T1D filtering
4. `semantic-scholar-feed` - Add T1D filtering

### Logo Sources Reference

**Company Logos:**
```typescript
const logoSources = [
  { name: 'Dexcom', url: 'https://logo.clearbit.com/dexcom.com' },
  { name: 'Abbott', url: 'https://logo.clearbit.com/abbott.com' },
  { name: 'Medtronic', url: 'https://logo.clearbit.com/medtronic.com' },
  { name: 'Tandem', url: 'https://logo.clearbit.com/tandemdiabetes.com' },
  { name: 'Insulet', url: 'https://logo.clearbit.com/insulet.com' },
  { name: 'Vertex Pharmaceuticals', url: 'https://logo.clearbit.com/vrtx.com' },
  // ... continue for all 60 companies
];
```

**Medication Logos (Manufacturer):**
```typescript
const medicationLogos = {
  // Eli Lilly products
  'Humalog': 'https://logo.clearbit.com/lilly.com',
  'Basaglar': 'https://logo.clearbit.com/lilly.com',
  
  // Novo Nordisk products
  'Novolog': 'https://logo.clearbit.com/novonordisk.com',
  'Fiasp': 'https://logo.clearbit.com/novonordisk.com',
  'Tresiba': 'https://logo.clearbit.com/novonordisk.com',
  'Ozempic': 'https://logo.clearbit.com/novonordisk.com',
  
  // Sanofi products
  'Lantus': 'https://logo.clearbit.com/sanofi.com',
  'Toujeo': 'https://logo.clearbit.com/sanofi.com',
  'Apidra': 'https://logo.clearbit.com/sanofi.com',
  
  // ... continue for all medications
};
```

---

## Testing Checklist

### Logos
- [ ] All company cards display logos or fallback icons
- [ ] All medication cards display manufacturer logos
- [ ] CompanyDetail page shows large logo
- [ ] MedicineHub detail modal shows logo
- [ ] Logos load correctly in light and dark mode
- [ ] Broken image URLs show fallback icons

### Research Filtering
- [ ] Only T1D-relevant papers appear by default
- [ ] Toggle shows all diabetes research when disabled
- [ ] New papers are auto-classified on ingestion
- [ ] Classification confidence shown in UI
- [ ] Admin can manually override classifications

### Deep Dive Analysis
- [ ] "Full Analysis" tab appears on project detail pages
- [ ] Clicking tab loads ProjectFullReport component
- [ ] Table of contents navigation works
- [ ] Print button generates proper PDF
- [ ] Progress bar tracks scroll position
- [ ] References section displays correctly
- [ ] Projects without reports show "Coming Soon" message

### Site Search
- [ ] Cmd+K (Mac) / Ctrl+K (Win) opens search dialog
- [ ] Search icon in header opens dialog
- [ ] Real-time results appear as user types
- [ ] Results categorized correctly
- [ ] Clicking result navigates to correct page
- [ ] Keyboard navigation (arrows, enter, escape) works
- [ ] Search works across all content types
- [ ] Empty state shows helpful message

### Public Glucose Analysis
- [ ] All 10,500 data points load
- [ ] Demographic filters work correctly
- [ ] New correlation charts display
- [ ] AI insights load and refresh
- [ ] Export CSV downloads correct data
- [ ] Export PNG saves visualizations
- [ ] Demographics panel shows accurate stats
- [ ] Patterns are mathematically sound

### App Download Links
- [ ] All app store links open correctly
- [ ] xDrip+ GitHub link works
- [ ] Open-source badge appears for GitHub downloads
- [ ] Web app badge appears for browser-based apps
- [ ] Download buttons adapt to user's platform
- [ ] External link icons appear consistently

---

## Files Summary

### New Files (13)
1. `supabase/functions/seed-medication-logos/index.ts`
2. `supabase/functions/classify-research-t1d/index.ts`
3. `supabase/functions/global-search/index.ts` (optional)
4. `supabase/functions/analyze-glucose-patterns/index.ts`
5. `src/components/search/GlobalSearchDialog.tsx`
6. `src/components/search/SearchResultCard.tsx`
7. `src/hooks/useGlobalSearch.ts`
8. `src/components/data-upload/GlucoseInsightCard.tsx`
9. `src/components/data-upload/DemographicsPanel.tsx`
10. `src/components/data-upload/CorrelationMatrix.tsx`
11. `supabase/migrations/add_t1d_filtering_to_research.sql`
12. `supabase/migrations/add_search_indexes.sql`
13. `src/types/search.ts`

### Modified Files (15)
1. `src/pages/ProjectDetail.tsx` (add TabsContent)
2. `src/components/companies/CompanyCard.tsx` (add logo display)
3. `src/components/medicine/MedicationCard.tsx` (add logo display)
4. `src/pages/CompanyDetail.tsx` (add logo to header)
5. `src/pages/MedicineHub.tsx` (show logos in detail)
6. `supabase/functions/seed-company-logos/index.ts` (enhance)
7. `supabase/functions/medical-research-aggregator/index.ts` (add T1D filter)
8. `supabase/functions/openalex-research-feed/index.ts` (add T1D filter)
9. `supabase/functions/semantic-scholar-feed/index.ts` (add T1D filter)
10. `src/hooks/useMedicalResearchPapers.ts` (add T1D filter)
11. `src/pages/ResearchHub.tsx` (add T1D toggle)
12. `src/components/Layout.tsx` (add search trigger)
13. `src/pages/PublicGlucoseData.tsx` (add visualizations)
14. `src/pages/AppCenter.tsx` (enhance download UX)
15. `supabase/config.toml` (register new functions)

---

## Success Metrics

### User-Facing Improvements
- ✅ Company/medication logos visible: 100% of entities
- ✅ Research relevance: 90%+ papers T1D-specific
- ✅ Deep dive analysis accessible: All 15+ projects
- ✅ Search functionality: <500ms response time
- ✅ Data insights: 10+ correlation discoveries

### Technical Quality
- ✅ No broken images (fallbacks work)
- ✅ Search indexes improve query speed 10x
- ✅ AI classification accuracy >85%
- ✅ All edge functions deploy successfully
- ✅ Zero regression in existing features

### User Experience
- ✅ Logos load in <2 seconds
- ✅ Search accessible via keyboard shortcut
- ✅ Analysis reports readable and comprehensive
- ✅ Download links clearly labeled
- ✅ Glucose insights actionable and accurate

---

## Risk Mitigation

### Potential Issues

**Logo Loading Failures:**
- **Risk:** Clearbit or external URLs may fail
- **Mitigation:** Always use fallback icons, cache successful URLs

**T1D Classification Accuracy:**
- **Risk:** AI may misclassify some papers
- **Mitigation:** Add manual review queue, confidence scores, admin override

**Search Performance:**
- **Risk:** Large dataset may slow searches
- **Mitigation:** GIN indexes, debouncing, result limits, caching

**TabsContent Rendering:**
- **Risk:** Reports may be large and slow
- **Mitigation:** Lazy loading, virtualization, progress indicators

**Data Export:**
- **Risk:** Large datasets crash browser
- **Mitigation:** Paginated export, streaming, server-side generation

---

## Post-Implementation Validation

### Manual Testing Script

**Test 1: Logos**
1. Navigate to /companies
2. Verify logos appear on cards
3. Click on Dexcom company
4. Verify logo in detail header
5. Navigate to /medicines
6. Verify manufacturer logos
7. Check both light/dark modes

**Test 2: Research**
1. Navigate to /research-hub
2. Verify papers are T1D-related
3. Toggle "Show all diabetes research"
4. Verify more papers appear
5. Check paper titles for relevance

**Test 3: Deep Dive**
1. Navigate to /projects
2. Click "Morning Nausea" project
3. Click "Full Analysis" tab
4. Verify comprehensive report loads
5. Test table of contents navigation
6. Try print function

**Test 4: Search**
1. Press Cmd+K (or Ctrl+K)
2. Type "insulin"
3. Verify results from multiple categories
4. Use arrow keys to navigate
5. Press Enter to navigate
6. Press Escape to close

**Test 5: Glucose Data**
1. Navigate to /public-glucose-data
2. Apply age filter
3. Verify charts update
4. Check "Insights" section
5. Test CSV export
6. Verify demographics panel

---

## Maintenance Notes

### Ongoing Tasks

**Logo Management:**
- Monthly: Check for broken Clearbit URLs
- Quarterly: Update logos for rebranded companies
- As needed: Add logos for new entries

**Research Classification:**
- Weekly: Review AI classification queue
- Monthly: Retrain if accuracy drops
- Ongoing: Manual corrections for edge cases

**Search Index Maintenance:**
- Weekly: REINDEX if queries slow
- Monthly: VACUUM ANALYZE search tables
- Quarterly: Review and optimize slow queries

**Data Analysis:**
- Weekly: Refresh glucose pattern insights
- Monthly: Add new correlation analyses
- Quarterly: Validate statistical accuracy

### Documentation Updates

After implementation, update:
- API documentation for new search endpoints
- User guide for search functionality
- Admin panel guide for research classification
- Data dictionary for new columns

