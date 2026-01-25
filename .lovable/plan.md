
# Comprehensive Enhancement Plan: T1D History, News, Data, Logos, and Clickable Features

## Overview

This plan addresses eight major feature areas based on the codebase analysis:

1. **T1D History Enhancement** - More content, detailed descriptions, clickable cards under timeline
2. **T1D News Fix** - Debug and fix the page error preventing content display
3. **Public CGM Data Expansion** - More data points, insights, and tabs
4. **Emergence of Diabetes Data** - Add accurate trend data and analysis
5. **Research Links Fix** - Fix non-functioning external links
6. **Logo Implementation** - Ensure logos display across companies, medications, devices
7. **T1D Companies Clickability** - Make each company card fully clickable
8. **Innovation Hub Clickability** - Add detailed modal for each innovation/patent

---

## Current State Analysis

### Identified Issues

| Area | Current State | Problem |
|------|---------------|---------|
| T1D History | 28 events in database | Limited content; cards exist but need more events below timeline |
| T1D News | 119 articles in database | Page loads but likely API/data format error prevents display |
| Public CGM Data | 10,500 readings | Current tabs exist but need more insights |
| Emergence Data | 0 records in `diabetes_emergence_data` | Missing trend data over time |
| Logos - Companies | 23/56 have logos | 33 companies missing logos |
| Logos - Medications | 0/29 have logos | Using inline manufacturer mapping |
| Logos - Devices | 0/8 have images | No device images |
| Innovations | Patents display but not clickable | No detail modal exists |

---

## Phase 1: T1D History Enhancement

### 1.1 Add More Historical Events (30+ new events)

**File:** `supabase/functions/seed-t1d-history/index.ts`

Add comprehensive events covering:
- Modern era (2010-2025): Dexcom G5/G6/G7, Control-IQ, Omnipod 5, iLet, Libre 2/3
- Cure progress: Teplizumab approval, Vertex VX-880 trials, encapsulation advances
- Digital health: Loop DIY APS, Tidepool Loop FDA clearance, AAPS
- Research milestones: DCCT results, artificial pancreas studies

Each event includes:
- `year`, `year_end` (for spans)
- `era` and `category` classification
- `short_description` (50-100 words)
- `detailed_description` (300-500 words with historical context)
- `image_url` and `image_caption`
- `sources` array with verifiable links
- `interesting_facts` array (3-5 facts)
- `impact_score` (1-10)
- `decade` and `decade_summary`

### 1.2 Display Event Cards Below Timeline by Category

**File:** `src/pages/Explore.tsx`

Add a new section after the timeline showing event cards:

```typescript
// After InteractiveTimeline, add:
{selectedCategory !== 'all' && filteredEvents && filteredEvents.length > 0 && (
  <div className="mt-8">
    <h2 className="heading-subsection mb-6">
      {categories.find(c => c.value === selectedCategory)?.label} Events
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredEvents.map(event => (
        <HistoryEventCard 
          key={event.id} 
          event={event} 
          onClick={() => handleEventClick(event)} 
        />
      ))}
    </div>
  </div>
)}
```

### 1.3 Create HistoryEventCard Component

**New File:** `src/components/explore/HistoryEventCard.tsx`

Clickable card component showing:
- Year badge with era color-coding
- Title and short description
- Category icon
- Impact score indicator
- Click handler to open EventDetailModal

---

## Phase 2: T1D News Page Fix

### 2.1 Debug News Loading Issue

**Investigation Points:**
1. `useT1DNews` hook fetches from `t1d_news_articles` table (119 records exist)
2. Check for data format mismatches between hook and component expectations
3. Verify `fetch-t1d-news` edge function response format

**File:** `src/hooks/useT1DNews.ts`

Add defensive coding:
```typescript
// Add null checks and type validation
const mappedData = (data as NewsArticle[])
  .filter(article => article && article.title && article.id)
  .map(article => ({
    ...article,
    description: article.description || 'No description available',
    image_url: article.image_url || null,
    category: article.category || 'general'
  }));
```

### 2.2 Add Error Boundary

**File:** `src/pages/News.tsx`

Wrap content in error boundary with fallback UI and retry button.

---

## Phase 3: Public CGM Data Expansion

### 3.1 Add More Data Points

**File:** `supabase/functions/seed-public-glucose/index.ts`

Expand dataset to include:
- More diverse user profiles (pediatric, elderly, athletes)
- Different pump/CGM combinations
- International regions (UK, Germany, Australia, Canada)
- MDI vs pump comparisons
- Different diabetes duration categories

### 3.2 Add New Insight Tabs

**File:** `src/pages/PublicGlucoseData.tsx`

Add tabs for:

```typescript
<TabsList>
  <TabsTrigger value="overview">Overview</TabsTrigger>
  <TabsTrigger value="patterns">Patterns</TabsTrigger>
  <TabsTrigger value="demographics">Demographics</TabsTrigger>
  <TabsTrigger value="devices">Device Comparison</TabsTrigger>  // NEW
  <TabsTrigger value="variability">Variability</TabsTrigger>    // NEW
  <TabsTrigger value="mealtime">Meal Patterns</TabsTrigger>     // NEW
</TabsList>
```

New insights to add:
- **Glucose Variability Index (GVI)** - Coefficient of variation analysis
- **Meal Response Patterns** - Post-prandial glucose curves
- **Insulin Sensitivity Factor** - Estimated ISF by demographics
- **Exercise Impact** - Activity correlation with TIR
- **Sleep Quality Correlation** - Overnight glucose stability

---

## Phase 4: Emergence of Diabetes Data

### 4.1 Create and Populate Data Table

**Database Migration:**

```sql
-- Populate diabetes_emergence_data with historical diagnosis trends
INSERT INTO diabetes_emergence_data (year, region, age_group, diagnoses_count, source)
VALUES
  -- US data
  (1990, 'US', 'All', 15000, 'CDC SEARCH Study'),
  (1995, 'US', 'All', 18500, 'CDC SEARCH Study'),
  (2000, 'US', 'All', 22000, 'CDC SEARCH Study'),
  ...
  (2023, 'US', 'All', 64000, 'CDC Diabetes Statistics'),
  -- European data
  (1990, 'Europe', 'All', 45000, 'EURODIAB Study'),
  ...
```

### 4.2 Add Correlation Analysis Section

**File:** `src/pages/EmergenceOfDiabetes.tsx`

Add new tab: "Concurrent Trends"

Show coinciding environmental/lifestyle changes:
- Vitamin D deficiency rates over time
- Antibiotic usage trends
- C-section rates
- Breastfeeding duration trends
- Formula feeding changes
- Processed food consumption

Each with:
- Correlation coefficient (if data supports)
- "Coincidence indicator" for non-causal correlations
- Citations to relevant studies

### 4.3 Create Seed Function for Emergence Data

**New File:** `supabase/functions/seed-emergence-data/index.ts`

Populate with real CDC/IDF data points from published studies.

---

## Phase 5: Research Links Fix

### 5.1 Enhance Verified Link System

**File:** `src/components/ui/verified-link.tsx`

Add more fallback patterns:
```typescript
const fallbackPatterns = {
  pubmed: (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}`,
  doi: (doi: string) => `https://doi.org/${doi}`,
  clinicaltrials: (nct: string) => `https://clinicaltrials.gov/study/${nct}`,
  scholar: (title: string) => `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`,
  openAlex: (id: string) => `https://openalex.org/works/${id}`,
  // Add archive.org fallback for broken links
  wayback: (url: string) => `https://web.archive.org/web/${url}`
};
```

### 5.2 Update Research Hub External Links

**File:** `src/pages/ResearchHub.tsx`

Wrap all external links with VerifiedLink component:
```typescript
<VerifiedLink 
  href={item.link}
  fallbackHref={item.doi ? `https://doi.org/${item.doi}` : undefined}
>
  View Full Paper
</VerifiedLink>
```

---

## Phase 6: Logo Implementation

### 6.1 Update Company Logos Seed Function

**File:** `supabase/functions/seed-company-logos/index.ts`

Add all missing company logos:
```typescript
const companyLogos = {
  // Add missing 33 companies
  "Insitro": "https://logo.clearbit.com/insitro.com",
  "Noom": "https://logo.clearbit.com/noom.com",
  "Virta Health": "https://logo.clearbit.com/virtahealth.com",
  "Omada Health": "https://logo.clearbit.com/omadahealth.com",
  // ... all remaining companies
};
```

### 6.2 Add Medication Logo Support

**Database Migration:**

```sql
-- Add logo_url column to medications if missing
ALTER TABLE medications ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Update with Clearbit logos
UPDATE medications SET logo_url = 'https://logo.clearbit.com/lilly.com' 
WHERE manufacturer ILIKE '%lilly%';
```

**New File:** `supabase/functions/seed-medication-logos/index.ts`

Populate logos for all manufacturers.

### 6.3 Add Device Images

**Database Migration:**

```sql
-- Update devices with product images
UPDATE devices SET image_url = 'https://example.com/dexcom-g7.png'
WHERE name ILIKE '%Dexcom G7%';
```

Source official product images or use placeholder brand images.

### 6.4 Create Unified Logo Component

**New File:** `src/components/ui/entity-logo.tsx`

```typescript
interface EntityLogoProps {
  type: 'company' | 'medication' | 'device' | 'organization';
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  fallbackIcon?: React.ComponentType;
}

export function EntityLogo({ type, name, logoUrl, size = 'md', fallbackIcon }: EntityLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  // Generate Clearbit URL as fallback if no logo provided
  const clearbitUrl = useMemo(() => {
    const domain = extractDomainFromName(name);
    return domain ? `https://logo.clearbit.com/${domain}` : null;
  }, [name]);

  const displayUrl = logoUrl || clearbitUrl;
  
  // ... render with fallback icon on error
}
```

---

## Phase 7: T1D Company Card Clickability

### 7.1 Make Entire Card Clickable

**File:** `src/components/companies/CompanyCard.tsx`

Update card to be fully clickable:
```typescript
import { useNavigate } from 'react-router-dom';

export function CompanyCard({ company, ... }: CompanyCardProps) {
  const navigate = useNavigate();
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking checkbox
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) return;
    navigate(`/companies/${company.id}`);
  };

  return (
    <Card 
      className="... cursor-pointer"
      onClick={handleCardClick}
    >
      // ... existing content
    </Card>
  );
}
```

### 7.2 Add Visual Click Indication

Add hover effect and click feedback:
```typescript
<Card className="group hover:shadow-lg hover:border-primary/40 
  active:scale-[0.99] transition-all duration-200 cursor-pointer">
```

---

## Phase 8: Innovation Hub Clickability

### 8.1 Create Patent Detail Modal

**New File:** `src/components/innovation/PatentDetailModal.tsx`

Modal displaying:
- Full patent title
- Complete abstract
- All inventors with LinkedIn search links
- Assignee with company profile link (if T1D company)
- Filing date and publication date
- Classification codes
- Related patents
- Direct link to Google Patents

### 8.2 Update Innovation Hub

**File:** `src/pages/InnovationHub.tsx`

Add modal state and click handlers:
```typescript
const [selectedPatent, setSelectedPatent] = useState<PatentData | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

// Update patent card to be clickable
<div 
  key={patent.id} 
  className="p-6 border rounded-lg hover:bg-muted/50 cursor-pointer 
    hover:border-primary/40 transition-all"
  onClick={() => {
    setSelectedPatent(patent);
    setIsModalOpen(true);
  }}
>
  // ... existing content
</div>

// Add modal
<PatentDetailModal 
  patent={selectedPatent}
  open={isModalOpen}
  onOpenChange={setIsModalOpen}
/>
```

---

## Implementation Order

| Phase | Priority | Estimated Effort | Dependencies |
|-------|----------|------------------|--------------|
| Phase 2 (News Fix) | Critical | Small | None |
| Phase 7 (Company Clicks) | High | Small | None |
| Phase 8 (Innovation Clicks) | High | Medium | None |
| Phase 6 (Logos) | High | Medium | Seed functions |
| Phase 1 (History) | Medium | Large | Seed function + UI |
| Phase 3 (CGM Data) | Medium | Medium | Seed function |
| Phase 4 (Emergence) | Medium | Large | Database migration + seed |
| Phase 5 (Links) | Low | Small | None |

---

## Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/explore/HistoryEventCard.tsx` | Clickable history event card |
| `src/components/innovation/PatentDetailModal.tsx` | Patent detail popup |
| `src/components/ui/entity-logo.tsx` | Unified logo component |
| `supabase/functions/seed-emergence-data/index.ts` | Emergence trend data |

---

## Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/pages/News.tsx` | Add error handling, debug data flow |
| `src/hooks/useT1DNews.ts` | Add defensive coding, type validation |
| `src/pages/Explore.tsx` | Add event cards grid below timeline |
| `src/pages/PublicGlucoseData.tsx` | Add new insight tabs |
| `src/pages/EmergenceOfDiabetes.tsx` | Add concurrent trends tab |
| `src/pages/InnovationHub.tsx` | Add patent detail modal |
| `src/components/companies/CompanyCard.tsx` | Make fully clickable |
| `src/components/ui/verified-link.tsx` | Add more fallback patterns |
| `supabase/functions/seed-t1d-history/index.ts` | Add 30+ new events |
| `supabase/functions/seed-public-glucose/index.ts` | Expand dataset |
| `supabase/functions/seed-company-logos/index.ts` | Add missing logos |

---

## Testing Checklist

- [ ] T1D News page loads without errors
- [ ] History events display on timeline and in grid below
- [ ] Clicking any history event opens detail modal
- [ ] Clicking any company card navigates to detail page
- [ ] Clicking any patent/innovation opens detail modal
- [ ] All company logos display (or show fallback icon)
- [ ] Medication cards show manufacturer logos
- [ ] Device cards show product images
- [ ] Research links navigate correctly
- [ ] Public CGM data shows new insight tabs
- [ ] Emergence of Diabetes shows trend charts with real data
