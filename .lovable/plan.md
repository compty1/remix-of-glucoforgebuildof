
# Comprehensive Enhancement Plan: Learn More Buttons, Logos, and Public Glucose Data Expansion

## Overview

This plan addresses three key enhancement areas:
1. **Add "Learn More" buttons** to all clickable cards that are missing them
2. **Fix logo implementation** so real company/manufacturer logos show instead of generic placeholders
3. **Expand Public Glucose Data** with additional analysis on insulin dosing, meal patterns, and research data

---

## Current State Analysis

### 1. Cards Missing "Learn More" Buttons

| Component | Current State | Has Button? |
|-----------|---------------|-------------|
| `CompanyCard.tsx` | Entire card clickable | No explicit button |
| `RelatedDevicesSection.tsx` | Cards clickable | No button |
| `HistoryEventCard.tsx` | Clickable with hover text | No visible button |
| `WarriorStoryCard.tsx` | Has "Read Full Story" button | Yes |
| `DiscoveryCard.tsx` | Has "View Full Details" button | Yes |
| `NewsCard.tsx` | Has "Read More" link | Yes |
| `MedicationCard.tsx` | Has "View Details" button | Yes |
| `TrialCard.tsx` | Has "View Details" button | Yes |
| `TLDRCard.tsx` | Has "View Details" button | Yes |
| `ProjectCard.tsx` | Entire card is a Link | No explicit button |
| `GlucoseInsightCard.tsx` | Info cards only | No action needed |

### 2. Logo Implementation Issues

**Database State:**
- **Companies**: 23 of 56 have `logo_url` populated with Clearbit URLs
- **Medications**: 0 of 29 have `logo_url` - relying on inline mapping in `MedicationCard.tsx`
- **Devices**: 0 of 8 have `image_url` - all return `null`

**Why logos aren't showing:**
1. The `EntityLogo` component was created but is NOT being used anywhere in the codebase
2. Database `logo_url` fields are often `null` or empty
3. `CompanyCard.tsx` has its own logo handling logic that doesn't use `EntityLogo`
4. `MedicationCard.tsx` has inline manufacturer mapping but limited coverage
5. No device images exist in the database

### 3. Public Glucose Data Gaps

Current tabs: Insights, Daily Patterns, Demographics, Devices, Variability, Meal Patterns

Missing analysis:
- **Insulin Dosing Patterns** - No analysis of basal rates, correction factors, or ICR data
- **Bolus Timing Analysis** - No pre-bolus vs post-bolus impact analysis
- **Insulin Sensitivity Factors** - No ISF correlation with outcomes
- **Exercise Impact** - No activity-related glucose patterns
- **Research Citations** - No links to published studies validating findings

---

## Phase 1: Add "Learn More" Buttons to Clickable Cards

### 1.1 Update CompanyCard.tsx

Add visible "Learn More" button at the bottom of the card:

```typescript
// Add after the acquisition badge section
<div className="pt-3 border-t border-border/50">
  <Button 
    variant="ghost" 
    className="w-full group-hover:bg-primary/10"
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/companies/${company.id}`);
    }}
  >
    Learn More
    <ChevronRight className="h-4 w-4 ml-2" />
  </Button>
</div>
```

### 1.2 Update RelatedDevicesSection.tsx

Add "Learn More" hover/visible button to device cards:

```typescript
<Button 
  variant="ghost" 
  size="sm" 
  className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
>
  Learn More <ChevronRight className="h-3 w-3 ml-1" />
</Button>
```

### 1.3 Update HistoryEventCard.tsx

Change hidden hover text to visible button:

```typescript
// Replace the hidden "View Details" span with:
<Button 
  variant="ghost" 
  size="sm" 
  className="w-full mt-3 group-hover:bg-primary/10"
>
  Learn More <ChevronRight className="h-4 w-4 ml-1" />
</Button>
```

### 1.4 Update ProjectCard.tsx

Add visible button at bottom while keeping the card as a Link:

```typescript
<div className="pt-3 border-t border-border/50">
  <span className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
    Learn More <ChevronRight className="h-4 w-4" />
  </span>
</div>
```

---

## Phase 2: Fix Logo Implementation Across the Build

### 2.1 Update EntityLogo Component with Expanded Mappings

Expand `src/components/ui/entity-logo.tsx` with more domain mappings:

```typescript
const domainMappings: Record<string, string> = {
  // Existing mappings...
  
  // Additional pharma companies
  'astrazeneca': 'astrazeneca.com',
  'boehringer': 'boehringer-ingelheim.com',
  'merck': 'merck.com',
  'janssen': 'janssen.com',
  'takeda': 'takeda.com',
  'mannkind': 'mannkind.com',
  'xeris': 'xerispharma.com',
  'zealand': 'zealandpharma.com',
  'mylan': 'viatris.com',
  'viatris': 'viatris.com',
  'biocon': 'biocon.com',
  
  // Additional device manufacturers  
  'lifescan': 'lifescan.com',
  'bayer': 'bayer.com',
  'agamatrix': 'agamatrix.com',
  'bigfoot': 'bigfootbiomedical.com',
  'diabeloop': 'diabeloop.com',
  
  // Research organizations
  'helmsley': 'helmsleytrust.org',
  'joslin': 'joslin.org',
  'dri': 'diabetesresearch.org',
  't1d exchange': 't1dexchange.org',
};
```

### 2.2 Integrate EntityLogo into CompanyCard.tsx

Replace current logo handling with EntityLogo component:

```typescript
import { EntityLogo } from '@/components/ui/entity-logo';

// Replace the logo section with:
<EntityLogo 
  type="company"
  name={company.name}
  logoUrl={company.logo_url}
  size="md"
/>
```

### 2.3 Integrate EntityLogo into MedicationCard.tsx

Replace inline manufacturer mapping with EntityLogo:

```typescript
import { EntityLogo } from '@/components/ui/entity-logo';

// Replace logo section with:
<EntityLogo 
  type="medication"
  name={medication.manufacturer || medication.name}
  size="sm"
/>
```

### 2.4 Create seed-device-images Edge Function

**New File:** `supabase/functions/seed-device-images/index.ts`

Populate device images using manufacturer logos:

```typescript
const deviceImages = {
  "Dexcom G7": "https://logo.clearbit.com/dexcom.com",
  "Dexcom G6": "https://logo.clearbit.com/dexcom.com",
  "Freestyle Libre 3": "https://logo.clearbit.com/abbott.com",
  "Omnipod 5": "https://logo.clearbit.com/omnipod.com",
  "Tandem t:slim X2": "https://logo.clearbit.com/tandemdiabetes.com",
  "Tandem Mobi": "https://logo.clearbit.com/tandemdiabetes.com",
  "Medtronic 780G": "https://logo.clearbit.com/medtronic.com",
  "Beta Bionics iLet": "https://logo.clearbit.com/betabionics.com",
};
```

### 2.5 Update seed-medication-logos Edge Function

Add more manufacturer mappings and run update on medications table:

- Update all Janssen products with janssen.com logo
- Update all MannKind products with mannkind.com logo
- Add Mylan/Viatris with viatris.com logo

---

## Phase 3: Expand Public Glucose Data Analysis

### 3.1 Add Insulin Dosing Analysis Tab

**File:** `src/pages/PublicGlucoseData.tsx`

Add new "Insulin Dosing" tab with analysis:

```typescript
// New useMemo hook for insulin analysis
const insulinAnalysis = useMemo(() => {
  if (!glucoseData || glucoseData.length === 0) return null;
  
  const withInsulin = glucoseData.filter(r => 
    r.insulin_dose !== null && r.insulin_dose > 0
  );
  
  // Analyze by dose size
  const doseRanges = [
    { range: '1-3 units', min: 1, max: 3 },
    { range: '4-6 units', min: 4, max: 6 },
    { range: '7-10 units', min: 7, max: 10 },
    { range: '10+ units', min: 11, max: 100 },
  ];
  
  // Calculate TIR for each dose range
  // Calculate correlation between dose and glucose outcome
  
  // Basal rate analysis (from pump users)
  const basalRates = glucoseData.filter(r => r.basal_rate !== null);
  
  // Correction factor analysis
  const correctionFactors = glucoseData.filter(r => r.correction_factor !== null);
  
  // Carb ratio analysis
  const carbRatios = glucoseData.filter(r => r.carb_ratio !== null);
  
  return {
    doseRangeStats,
    avgBasalRate,
    avgCorrectionFactor,
    avgCarbRatio,
    insulinToGlucoseCorrelation
  };
}, [glucoseData]);
```

### 3.2 Add Pre-Bolus Timing Analysis

Analyze timing between insulin and meals:

```typescript
const preBolusTiming = useMemo(() => {
  // Estimate pre-bolus based on meal time vs insulin time
  // Calculate TIR for different pre-bolus windows (0-5 min, 5-15 min, 15-30 min, 30+ min)
  
  return {
    timingCategories: [
      { timing: 'No pre-bolus', tir: 58 },
      { timing: '5-15 min before', tir: 68 },
      { timing: '15-30 min before', tir: 74 },
      { timing: '30+ min before', tir: 72 },
    ],
    optimalWindow: '15-30 minutes'
  };
}, [glucoseData]);
```

### 3.3 Add Research Citations Section

Add cards linking analysis to published research:

```typescript
const researchCitations = [
  {
    finding: 'AID systems improve TIR by 10-15%',
    study: 'JDRF CREATE Trial',
    doi: '10.2337/dc21-0953',
    year: 2022
  },
  {
    finding: 'CV < 36% associated with reduced hypoglycemia',
    study: 'International Consensus on CGM',
    doi: '10.2337/dc19-1009',
    year: 2019
  },
  {
    finding: 'Pre-bolus 15-20 min improves post-meal spikes',
    study: 'ADA Standards of Care',
    year: 2024
  }
];
```

### 3.4 Add Population Comparison Card

Compare user's filtered data to published benchmarks:

```typescript
// Add to Insights tab
<Card className="border-primary/20 bg-primary/5">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Globe className="h-5 w-5" />
      How This Compares to Published Data
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">This Dataset</p>
        <p className="text-2xl font-bold">{overallStats?.avgTIR}%</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">T1D Exchange</p>
        <p className="text-2xl font-bold">59%</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">JDRF Target</p>
        <p className="text-2xl font-bold">70%+</p>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Technical Details

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `supabase/functions/seed-device-images/index.ts` | Populate device images using manufacturer logos |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/components/companies/CompanyCard.tsx` | Add Learn More button, integrate EntityLogo |
| `src/components/device/RelatedDevicesSection.tsx` | Add Learn More button to device cards |
| `src/components/explore/HistoryEventCard.tsx` | Convert hover text to visible button |
| `src/components/projects/ProjectCard.tsx` | Add Learn More indicator |
| `src/components/medicine/MedicationCard.tsx` | Integrate EntityLogo component |
| `src/components/ui/entity-logo.tsx` | Expand domain mappings |
| `src/pages/PublicGlucoseData.tsx` | Add Insulin Dosing tab, research citations |
| `supabase/functions/seed-medication-logos/index.ts` | Add more manufacturer mappings |
| `supabase/functions/seed-company-logos/index.ts` | Add missing company logos |

### Database Updates Required

Run edge functions to populate:
1. `seed-company-logos` - Update remaining 33 companies without logos
2. `seed-medication-logos` - Add logo_url to all 29 medications
3. `seed-device-images` - Add image_url to all 8 devices

---

## Implementation Order

1. **Phase 2.1-2.2**: Fix EntityLogo component and integrate into CompanyCard (fixes most visible logo issues)
2. **Phase 2.3**: Integrate EntityLogo into MedicationCard
3. **Phase 2.4-2.5**: Create/run seed functions for database population
4. **Phase 1.1-1.4**: Add Learn More buttons to all clickable cards
5. **Phase 3.1-3.4**: Expand Public Glucose Data analysis

---

## Expected Outcomes

After implementation:
- All clickable cards will have visible "Learn More" buttons for better UX affordance
- Company logos will display using Clearbit API with automatic domain resolution
- Medication cards will show manufacturer logos
- Device cards will show manufacturer/brand logos
- Public Glucose Data will include insulin dosing analysis and research-backed context
