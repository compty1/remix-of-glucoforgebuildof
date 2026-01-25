
# Plan: Add EntityLogo to Missing Pages

## Problem Summary

Logos are now working in Companies, Medications, and Device sections thanks to the multi-tier EntityLogo fallback system. However, several other pages still show generic icons instead of real logos:

1. **App Center** - Apps have `logo_url` in database but not using EntityLogo fallback system
2. **Diabetes Organizations** - Hardcoded data with empty logo URLs, not using EntityLogo
3. **Live Cure Monitoring** - Therapy cards show sponsor names but no logos
4. **Cure Progress / Clinical Trials** - Trial cards show sponsors but no logos
5. **Research pages** - Show journals/institutions but no logos

**Note:** The Public Glucose Data expansion is already complete - the database has 10,500+ records with all insulin dosing, basal rate, and carb ratio fields populated.

---

## Implementation Plan

### Phase 1: App Center Logo Integration

**File:** `src/pages/AppCenter.tsx`

Update the `AppCard` component to use `EntityLogo` with fallback:

```typescript
import { EntityLogo } from '@/components/ui/entity-logo';

// In AppCard component, replace the logo section:
<EntityLogo 
  type="company"
  name={app.developer || app.name}
  logoUrl={app.logo_url}
  size="lg"
/>
```

Also update the dialog modal to use EntityLogo.

### Phase 2: Organizations Page Logo Integration

**File:** `src/pages/DiabetesOrganizations.tsx`

1. Import EntityLogo component
2. Add domain mappings to EntityLogo for diabetes organizations:
   - `breakthrought1d.org` (Breakthrough T1D / JDRF)
   - `diabetes.org` (ADA)
   - `beyondtype1.org` (Beyond Type 1)
   - `diabetessisters.org`
   - `diabetesresearch.org` (DRI Foundation)
   - `childrenwithdiabetes.com`
   - `t1dexchange.org`
   - `idf.org` (International Diabetes Federation)

3. Replace the generic Building2 icon with EntityLogo in organization cards:

```typescript
<EntityLogo 
  type="organization"
  name={org.name}
  websiteUrl={org.website_url}
  size="lg"
/>
```

### Phase 3: Live Cure Monitoring Logo Integration

**File:** `src/pages/LiveCureMonitoring.tsx`

Add sponsor logos to therapy cards:

```typescript
import { EntityLogo } from '@/components/ui/entity-logo';

// In therapy card, add logo next to sponsor name:
<div className="flex items-center gap-2">
  <EntityLogo 
    type="company"
    name={therapy.sponsor}
    size="sm"
  />
  <p className="text-sm text-muted-foreground">{therapy.sponsor}</p>
</div>
```

### Phase 4: Cure Progress & Trial Cards

**File:** `src/pages/CureProgress.tsx` and `src/components/trials/TrialCard.tsx`

Add sponsor logos to clinical trial displays:

```typescript
// In TrialCard sponsor section:
<div className="flex items-center gap-2">
  <EntityLogo 
    type="company"
    name={trial.sponsor || trial.sponsor_name}
    size="sm"
  />
  <p className="text-sm font-medium line-clamp-1">{trial.sponsor}</p>
</div>
```

### Phase 5: Expand EntityLogo Domain Mappings

**File:** `src/components/ui/entity-logo.tsx`

Add mappings for common T1D app developers and research institutions:

```typescript
// App developers
'mysugr': 'mysugr.com',
'sugarmate': 'sugarmate.io',
'nightscout': 'nightscout.github.io',
'xdrip': 'github.com',
'dexcom': 'dexcom.com',
'abbott': 'abbott.com',
'calorie king': 'calorieking.com',
'diabits': 'diabits.com',

// Research institutions
'nih': 'nih.gov',
'niaid': 'niaid.nih.gov',
'stanford': 'stanford.edu',
'harvard': 'harvard.edu',
'yale': 'yale.edu',
'university of florida': 'ufl.edu',
'university of miami': 'miami.edu',
'barbara davis': 'barbaradaviscenter.com',
'ucsd': 'ucsd.edu',
'university of alberta': 'ualberta.ca',
'karolinska': 'ki.se',
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/entity-logo.tsx` | Add ~30 new domain mappings for apps, organizations, and research institutions |
| `src/pages/AppCenter.tsx` | Integrate EntityLogo into AppCard and dialog |
| `src/pages/DiabetesOrganizations.tsx` | Replace Building2 icon with EntityLogo |
| `src/pages/LiveCureMonitoring.tsx` | Add EntityLogo to therapy sponsor display |
| `src/pages/CureProgress.tsx` | Add EntityLogo to trial sponsor display |
| `src/components/trials/TrialCard.tsx` | Add EntityLogo to sponsor section |

---

## Technical Details

### EntityLogo Props Being Used

```typescript
<EntityLogo 
  type="company" | "organization" | "device" | "medication"
  name={string}           // Used for domain lookup
  logoUrl={string | null} // Primary source from database
  websiteUrl={string}     // Secondary source for domain extraction
  size="sm" | "md" | "lg"
/>
```

### Fallback Chain (Already Implemented)
1. Database `logo_url` (if provided)
2. Clearbit API from mapped domain
3. Clearbit from extracted website URL
4. Google S2 Favicon API (128px)
5. Generic type-specific icon

---

## Expected Outcome

After implementation:
- App Center will show app developer logos (mySugr, Dexcom, Abbott, etc.)
- Organizations page will show real nonprofit logos (JDRF/BT1D, ADA, Beyond Type 1)
- Cure Monitoring will show pharma/biotech sponsor logos (Vertex, Novo Nordisk, Sanofi)
- Clinical trial cards will show research institution logos
- All pages maintain consistent visual hierarchy with the multi-tier fallback system
