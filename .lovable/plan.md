

# Comprehensive 80-Issue Audit Fix Plan

This plan addresses every remaining issue across data quality, source labeling, missing SEO metadata, and scraped content problems. Split into two implementation phases.

---

## Phase 1: Critical Data Quality Fixes

### 1. Delete Junk Scraped Content from Database (4 records)
**What:** 4 external_device_reviews contain scraped website navigation ("Skip to main content", "Keyboard shortcuts", "Skip to FDA Search") instead of actual review content. These pass through to the UI despite the client-side JUNK_MARKERS filter because the filter only checks the first 50 characters or uses partial matching.
**Fix:** Run a SQL migration to DELETE the 4 junk rows from `external_device_reviews` where content starts with navigation text. This is a permanent data-level fix rather than relying solely on client-side filtering.

### 2. Fix Drug Pricing Edge Function -- All 29 Records Show $0
**What:** The `medicare-data-feed` edge function fetches from OpenFDA NDC Directory, which does not include pricing data. The function explicitly sets `unit_price: 0` and `medicare_price: null` on line 73. All 29 drug_pricing_data records are therefore useless.
**Fix:** Update the edge function to also query the NADAC (National Average Drug Acquisition Cost) API from CMS, which provides actual wholesale drug pricing. Use the NDC codes from OpenFDA to cross-reference NADAC data. Add reference pricing fallbacks for the 8 diabetes drugs when the API returns no data, clearly labeled as "Reference Data (CMS NADAC)".

### 3. Harden JUNK_MARKERS Filter in useExternalReviews
**What:** The client-side filter in `useExternalReviews.ts` checks content but some junk still passes through if markers appear mid-content. The filter in `useMedicationDetails.ts` and the edge function `fetch-medication-reviews` have slightly different marker lists.
**Fix:** Unify the JUNK_MARKERS list across all 3 files, add additional markers ("Skip to FDA Search", "Skip to footer links", "Skip to in this section"), and check the first 500 characters (not the full content) for junk markers, which is where scraped navigation always appears.

### 4. App Reviews Source Labeling
**What:** 25 of 37 app_reviews have no `source_url`. These come from App Store (11), Google Play (8), Facebook (4), and GitHub (2). They are curated/seeded content, not scraped.
**Fix:** Already partially addressed in prior work (tooltip added). Verify the tooltip from Plan Item 1B is rendering correctly.

---

## Phase 2: Missing usePageMeta Calls (SEO/Metadata)

The following 13 pages are missing `usePageMeta()` calls, meaning they lack proper document titles and meta descriptions:

| Page | File | Suggested Title | Suggested Description |
|------|------|----------------|----------------------|
| Privacy | Privacy.tsx | Privacy Policy | How GlucoForge handles your data, privacy rights, and security practices. |
| Terms | Terms.tsx | Terms of Service | GlucoForge terms, conditions, and usage policies. |
| Contact | Contact.tsx | Contact Us | Get in touch with the GlucoForge team for support, feedback, or partnerships. |
| Accessibility | Accessibility.tsx | Accessibility | Our commitment to digital accessibility and WCAG compliance. |
| Healthcare Experience | HealthcareExperience.tsx | Healthcare Experience | Share and read real healthcare experiences from the T1D community. |
| AI Center | AICenter.tsx | AI Center | Research-based T1D predictions, management scenarios, and AI-powered insights. |
| Shop | Shop.tsx | Shop | Browse T1D accessories, supplies, and community merchandise. |
| Auth | Auth.tsx | Sign In | Sign in or create your GlucoForge account. |
| Reset Password | ResetPassword.tsx | Reset Password | Reset your GlucoForge account password. |
| Discoveries | Discoveries.tsx | Discoveries | Browse T1D research discoveries, breakthroughs, and clinical findings. |
| Device Analytics | DeviceAnalytics.tsx | Device Analytics | Compare CGMs, pumps, and diabetes devices with real-world data and FDA safety reports. |
| Fixes | Fixes.tsx | Community Fixes | User-submitted fixes and workarounds for diabetes device issues. |
| Not Found | NotFound.tsx | Page Not Found | The page you requested could not be found. |

**Also missing from admin pages** (11 pages with no usePageMeta):
Admin, AdminDashboard, AdminArticles, AdminContent, AdminIntegrations, AdminLowSugarStories, AdminProjects, AdminSettings, AdminShop, AdminUsers, AdminWarriors, ContentModeration

Admin pages will get a generic pattern: `usePageMeta('Admin - [Section]', 'GlucoForge admin panel.')`.

---

## Phase 3: Edge Function & Hook Hardening

### 5. Update medicare-data-feed to fetch real NADAC pricing
**File:** `supabase/functions/medicare-data-feed/index.ts`
- After fetching NDC codes from OpenFDA, query the CMS NADAC API (`https://data.medicaid.gov/api/1/datastore/query/`) for actual wholesale drug acquisition costs
- Map NADAC results back to drug records using NDC codes
- If NADAC returns no data for a drug, use curated reference prices with `data_source: 'Reference (CMS NADAC 2025)'`
- Never store $0 as a real price

### 6. Unify JUNK_MARKERS across all hooks
**Files:** `useExternalReviews.ts`, `useMedicationDetails.ts`, `fetch-medication-reviews/index.ts`
- Create shared constant list with all known markers
- Add: "Skip to FDA Search", "Skip to footer links", "Skip to in this section", "In this section:", "Back\\\\"
- Check first 500 chars only (navigation junk is always at the top)

---

## Summary

| Category | Count | Effort |
|----------|-------|--------|
| Delete junk DB records | 4 rows | Small |
| Fix drug pricing ($0 issue) | 1 edge function | Medium |
| Harden junk filters | 3 files | Small |
| Add usePageMeta calls | ~25 pages | Medium |
| Total | ~30 file changes | Medium-Large |

No breaking changes. No new tables needed. The drug pricing fix requires redeploying the medicare-data-feed edge function and re-invoking it to populate real prices.

