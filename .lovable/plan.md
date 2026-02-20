
# Remaining Issues — Full Audit

Below is the complete, categorized list of issues that have **not yet been fixed**, based on a thorough review of every hook, page, and component in the codebase.

---

## Category 1: SEO / Page Metadata (usePageMeta missing)

The following pages have NO `usePageMeta` call — their browser tab shows the generic app title and no Open Graph description is set:

| # | Page File | Route |
|---|-----------|-------|
| 1 | `src/pages/Index.tsx` | `/` (Home) |
| 2 | `src/pages/Dashboard.tsx` | `/dashboard` |
| 3 | `src/pages/Profile.tsx` | `/profile` |
| 4 | `src/pages/Settings.tsx` | `/settings` |
| 5 | `src/pages/News.tsx` | `/news` |
| 6 | `src/pages/ResearchHub.tsx` | `/research` |
| 7 | `src/pages/ResearchInsights.tsx` | `/research-insights` |
| 8 | `src/pages/CureProgress.tsx` | `/cure-progress` |
| 9 | `src/pages/LiveCureMonitoring.tsx` | `/live-cure-monitoring` |
| 10 | `src/pages/CitizenScience.tsx` | `/citizen-science` |
| 11 | `src/pages/Discover.tsx` | `/discover` |
| 12 | `src/pages/PublicGlucoseData.tsx` | `/public-glucose-data` |
| 13 | `src/pages/YourExperience.tsx` | `/your-experience` |
| 14 | `src/pages/DiabetesBurnout.tsx` | `/diabetes-burnout` |
| 15 | `src/pages/QualityOfLife.tsx` | `/quality-of-life` ← (current route) |
| 16 | `src/pages/DiabetesOrganizations.tsx` | `/organizations` |
| 17 | `src/pages/DeviceComparison.tsx` | `/device-comparison` |
| 18 | `src/pages/MedicineComparison.tsx` | `/medicine-comparison` |
| 19 | `src/pages/CompanyDetail.tsx` | `/company/:id` |
| 20 | `src/pages/TrialMatching.tsx` | `/trial-matching` |
| 21 | `src/pages/FinancialTools.tsx` | `/financial-tools` |
| 22 | `src/pages/ScenarioLab.tsx` | `/scenario-lab` |
| 23 | `src/pages/About.tsx` | `/about` |
| 24 | `src/pages/FDASafety.tsx` | `/fda-safety` |

---

## Category 2: QA Checklist — Known Failing Tests

These are the `status: 'fail'` items in `QAChecklist.tsx` that still need code fixes:

| # | ID | Item | Status |
|---|----|------|--------|
| 1 | `data-5` | File size enforcement | `fail` — QAChecklist says "50MB limit" but code enforces 10MB without warning text update |
| 2 | `feat-2` | Scenario lab uses physiological model | `fail` — QAChecklist description says "Math.random() and simple sine waves" (the model has since been improved to deterministic equations, so this **status should be updated to `warning`**) |
| 3 | `content-3` | Trend analysis has data pipeline | `fail` — `trend_analysis_metrics` table has no data ingestion |
| 4 | `content-4` | Email digest sends on schedule | `fail` — Edge function exists but no cron trigger configured |
| 5 | `admin-3` | Admin dashboard charts use real data | `fail` — `AdminDashboard.tsx` uses hardcoded `userActivityData` and `platformUsageData` arrays (clearly marked "PLACEHOLDER DATA" in file) |

---

## Category 3: QA Checklist — Warnings Needing Resolution

| # | ID | Item | Action Needed |
|---|----|------|---------------|
| 1 | `data-2` | Upload progress display | Shows animated pulse, not real byte-level progress |
| 2 | `dash-4` | Device status connection state | No real CGM API — only `user_preferences` |
| 3 | `set-7` | Account deletion cascade | Deletes 9 tables but 15+ more reference `user_id` |
| 4 | `pay-4` | Webhook signature verification | Falls back to unverified parsing when `STRIPE_WEBHOOK_SECRET` not set |

---

## Category 4: Performance — staleTime Missing

These hooks use `useQuery` but **no `staleTime`**, meaning they re-fetch on every window focus:

| # | Hook File |
|---|-----------|
| 1 | `useResearchFeed.ts` |
| 2 | `useDeviceDetails.ts` |
| 3 | `useT1DCompanies.ts` |
| 4 | `usePatentData.ts` |
| 5 | `useDiabetesOrganizations.ts` |
| 6 | `useT1DEvents.ts` |
| 7 | `useT1DNews.ts` |
| 8 | `useClinicalTrialsDetailed.ts` |
| 9 | `useResearchFunding.ts` |
| 10 | `useCompanyComparison.ts` |
| 11 | `useCommunityPosts.ts` |
| 12 | `useMarketData.ts` |
| 13 | `useDiscoveries.ts` |
| 14 | `useDrugPricing.ts` |
| 15 | `useMedicalResearchPapers.ts` |
| 16 | `useFundingTimeline.ts` |
| 17 | `useFoundConnections.ts` |
| 18 | `useCureMonitoring.ts` |
| 19 | `useDeviceAnalytics.ts` |

---

## Category 5: Data Transparency — Missing "Reference Data" Badges

Pages/components that display seeded/static data without any badge indicating it is reference/demo content:

| # | File | What needs a badge |
|---|------|--------------------|
| 1 | `src/pages/CureProgress.tsx` | Clinical trial timeline chart uses hardcoded data points |
| 2 | `src/pages/LiveCureMonitoring.tsx` | Trial list is seeded reference data |
| 3 | `src/pages/DiabetesOrganizations.tsx` | Organization records are seeded |
| 4 | `src/pages/FinancialTools.tsx` | Medicare/drug pricing data is reference data |
| 5 | `src/pages/ResearchFunding.tsx` | Funding timeline data is seeded |
| 6 | `src/pages/ResearchInsights.tsx` | Paper list is seeded reference data |

---

## Category 6: Accessibility (A11y) — Outstanding Items

| # | Component | Issue |
|---|-----------|-------|
| 1 | `src/pages/ScenarioLab.tsx` | Chart `<LineChart>` has no `role="img"` or `aria-label`; `<label>` elements for inputs use `className` text instead of the `htmlFor`/`id` pairing correctly |
| 2 | `src/pages/QualityOfLife.tsx` | Deficiency cards are interactive (`onClick`) but are `<div>` elements with no `role="button"` or `tabIndex` — keyboard inaccessible |
| 3 | `src/pages/QualityOfLife.tsx` | Resource cards have same issue — `onClick` on a `<Card>` (a `<div>`) with no keyboard role |
| 4 | `src/components/ai-center/DynamicPredictions.tsx` | Any chart rendering lacks `aria-label` |
| 5 | `src/pages/DiscoverDetails.tsx` | Missing `usePageMeta` and no structured `article` role |
| 6 | `src/pages/CommunityPostDetail.tsx` | External source link title says "Search for similar community discussions on Reddit" which may mislead — the link goes to the original post URL, not a Reddit search |

---

## Category 7: UX / Navigation — Dead Ends & Broken Flows

| # | File | Issue |
|---|------|-------|
| 1 | `src/pages/ScenarioLab.tsx` | No `BackButton` or `usePageMeta`; no breadcrumb context |
| 2 | `src/pages/ResearchHub.tsx` | No `BackButton` on a detail-level page |
| 3 | `src/pages/FDASafety.tsx` | No `BackButton` |
| 4 | `src/pages/FinancialTools.tsx` | No `BackButton` |
| 5 | `src/pages/DeviceComparison.tsx` | Uses imperative `useNavigate` back button instead of `<BackButton>` component |
| 6 | `src/pages/QAChecklist.tsx` | No `BackButton`; page is admin-only but is not wrapped in `<AdminRoute>` |
| 7 | `src/pages/PublicGlucoseData.tsx` | 1,545 lines — massive unmaintainable file; no `usePageMeta` |

---

## Category 8: Admin Dashboard — Placeholder / Fake Data

| # | File | Issue |
|---|------|-------|
| 1 | `src/pages/admin/AdminDashboard.tsx` | `userActivityData` and `platformUsageData` are hardcoded fake arrays — already labelled "PLACEHOLDER DATA" in the file comment. Charts are shown with "Illustrative Data" badges but should either pull real data or be removed |

---

## Category 9: Minor / Low-Priority Polish

| # | File | Issue |
|---|------|-------|
| 1 | `src/pages/QAChecklist.tsx` | `data-5` status says `fail` for file size enforcement, but the code **does** enforce 10MB — the checklist description still says "50MB limit" (outdated) |
| 2 | `src/pages/QAChecklist.tsx` | `feat-2` status says `fail` for Scenario Lab using `Math.random()`, but the simulation code was already refactored to deterministic equations — status should be updated to `pass` or `warning` |
| 3 | `src/pages/YourExperience.tsx` | `Math.random()` used for animated blood drop positions — not a bug, but uses non-seeded randomness (low priority, animation only) |
| 4 | `src/pages/Dashboard.tsx` | No `usePageMeta` for the most visited authenticated page |
| 5 | `src/pages/Settings.tsx` | "2FA available" item is `pending` — no implementation or timeline |
| 6 | `src/pages/Settings.tsx` | "Data export" item is `pending` — no implementation or timeline |

---

## Summary Count

| Category | # Issues |
|----------|----------|
| Missing `usePageMeta` (SEO) | 24 pages |
| QA Checklist failures | 5 items |
| QA Checklist warnings | 4 items |
| Missing `staleTime` (performance) | 19 hooks |
| Missing data transparency badges | 6 pages |
| Accessibility gaps | 6 items |
| UX/navigation dead ends | 7 items |
| Admin fake data | 1 item |
| Minor polish | 6 items |
| **Total** | **~78 items** |

The highest-priority batches to tackle next are:
1. **SEO** — 24 pages missing `usePageMeta` (quick wins, one-liner each)
2. **Performance** — 19 hooks missing `staleTime` (prevents excessive re-fetches)
3. **Accessibility** — QoL page cards (`role="button"` + `tabIndex`) and ScenarioLab chart labels
4. **QA Checklist sync** — Update `data-5` and `feat-2` statuses to reflect current code reality
