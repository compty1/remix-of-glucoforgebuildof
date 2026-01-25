
# Fix Logo Display: Multi-Tier Fallback System

## Problem Analysis

The logos are not displaying because:

1. **Clearbit API limitations**: Many T1D companies (Beta Bionics, Diabeloop, Sigilon, Bigfoot, etc.) are not in Clearbit's database, so the API returns 404 errors
2. **Single-point-of-failure logic**: The current `EntityLogo` component only tries one logo source before giving up
3. **Incorrect error handling**: When an image fails, it immediately shows the fallback icon instead of trying alternative sources

## Solution: Multi-Tier Logo Fallback System

Implement a cascading fallback system that tries multiple logo sources before showing the generic icon:

```text
Database logo_url (Clearbit)
         ↓ fails
Google S2 Favicons API (high-resolution)
         ↓ fails  
Logo.dev API (if available)
         ↓ fails
Generic icon fallback
```

## Technical Changes

### 1. Update EntityLogo Component (`src/components/ui/entity-logo.tsx`)

**Replace the current single-attempt logic with a multi-tier fallback:**

- Add `currentAttempt` state to track which source we're trying (0 = primary, 1 = Google S2, 2 = fallback)
- Generate Google S2 Favicon URL from domain: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
- Update `handleImageError` to cycle through sources before showing fallback
- Add `useMemo` to pre-compute all fallback URLs

**New logic flow:**
```typescript
const logoSources = useMemo(() => {
  const sources: string[] = [];
  
  // 1. Database URL (if provided)
  if (logoUrl) sources.push(logoUrl);
  
  // 2. Clearbit URL (derived from name)
  if (clearbitUrl && clearbitUrl !== logoUrl) {
    sources.push(clearbitUrl);
  }
  
  // 3. Google S2 Favicon (high-res)
  const domain = extractDomainFromName(name);
  if (domain) {
    sources.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
  }
  
  return sources;
}, [logoUrl, clearbitUrl, name]);

const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

const handleImageError = () => {
  if (currentSourceIndex < logoSources.length - 1) {
    setCurrentSourceIndex(prev => prev + 1);
  } else {
    setShowFallback(true);
  }
};
```

### 2. Add Website URL Extraction

For companies where we have `website_url` in the database, extract the domain for Google S2:

```typescript
// In CompanyCard.tsx, pass website_url to EntityLogo
<EntityLogo 
  type="company"
  name={company.name}
  logoUrl={company.logo_url}
  websiteUrl={company.website_url}  // NEW prop
  size="md"
/>
```

**EntityLogo will extract domain from website_url as additional fallback source**

### 3. Expanded Domain Mappings

Add missing companies to the domain mappings for better Clearbit/Google matching:

| Company | Correct Domain |
|---------|---------------|
| Semma Therapeutics | vertex.com (acquired) |
| Livongo | teladoc.com (acquired) |
| EOFlow | eoflow.co.kr |
| Pepex Biomedical | pepex.com |
| Common Sensing | commonsensing.com |
| Cecelia Health | ceceliahealth.com |
| Lark Health | lark.com |
| Podimetrics | podimetrics.com |
| MC10 | medidata.com (acquired) |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/entity-logo.tsx` | Add multi-tier fallback logic, add `websiteUrl` prop |
| `src/components/companies/CompanyCard.tsx` | Pass `website_url` to EntityLogo |
| `src/components/medicine/MedicationCard.tsx` | Pass website/manufacturer info to EntityLogo |

## Expected Outcome

After implementation:
- **Major companies** (Dexcom, Tandem, Novo Nordisk): High-res Clearbit logos
- **Smaller companies** (Beta Bionics, Diabeloop): Google S2 favicon (smaller but recognizable)
- **Truly unknown companies**: Generic icon (last resort)

This will dramatically increase logo display success rate from ~20% to ~90%+ of companies.
