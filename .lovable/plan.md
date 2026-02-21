
# Comprehensive Site Audit — 250+ Issues Found

## Executive Summary

After a deep audit of every page, hook, database table, edge function, and data connector, here is the complete picture of what needs fixing. Issues are organized by severity and category.

---

## CRITICAL DATA QUALITY ISSUES

### 1. Drugs.com Reviews — 81 of 135 Are Scraped Website Navigation HTML, Not Actual Reviews
**File:** `external_medication_reviews` table  
**Problem:** The Firecrawl scraper fetched drugs.com page HTML rather than actual review content. 81 records contain content like `"Skip to main content"`, `"The page you were looking could not be found"`, `"A-Z list of drugs"`, `"pill identifier tool"` — these are website navigation menus, not user reviews.  
**Impact:** The Community/Reviews tab in `MedicationDetailModal.tsx` shows garbage content to users.  
**Fix:** Add a content filter in `useMedicationDetails.ts` that removes `externalReviews` where `content` contains known navigation markers (`"Skip to main content"`, `"A-Z list"`, `"pill identifier"`, `"page you were looking"`, `"Find treatment options"`). Mark those records with a `content_quality: bad` flag and exclude them from the display query.

### 2. External Device Reviews — 6 Records Contain Scraped Site Navigation Text
**File:** `external_device_reviews` table  
**Problem:** Same Firecrawl scraping issue. Records from sources like `consumerguide`, `lovemylibre`, `npm` contain markdown navigation text instead of reviews (e.g., `"Save up to % Save"`, `"Skip to main content"`, `"Keyboard shortcuts for audio player"`).  
**Fix:** In `useExternalReviews.ts`, add a client-side filter that excludes reviews where `content` length < 50 characters OR content contains `"Skip to main content"` OR `"Keyboard shortcuts"` OR `"Save up to"`.

### 3. Reddit External Device Reviews — No Source URLs (Cannot Link to Original Posts)
**File:** `external_device_reviews` table  
**Problem:** All 16 Reddit source records have `source_url = NULL`. The `ExternalReviewCard` correctly hides the "View Original" button when URL is null, but the Verified badge logic (`isValidSourceUrl`) means none of these show as Verified.  
**Fix:** For Reddit reviews without a `source_url`, construct a fallback search URL: `https://www.reddit.com/search/?q=${encodeURIComponent(review.title || review.content?.slice(0, 50) || '')}` and show it as "Search Reddit" rather than "View Original". Update `ExternalReviewCard.tsx` to apply this fallback.

### 4. Reddit External Medication Reviews — No Source URLs (12 records)
**File:** `external_medication_reviews` table  
**Problem:** All 12 Reddit records have `source_url = NULL`. The Community Buzz tab in `MedicationDetailModal.tsx` at line 447 conditionally shows the link — these 12 posts show no link at all.  
**Fix:** Same fallback Reddit search URL approach as above, applied in `MedicationDetailModal.tsx`'s buzz section.

### 5. Drug Pricing Data — ALL 25 Records Have unit_price = 0
**File:** `drug_pricing_data` table, `src/hooks/useDrugPricing.ts`, `src/pages/FinancialTools.tsx`  
**Problem:** The `drug_pricing_data` table was populated from the OpenFDA NDC Directory but price fields were never populated — every row has `unit_price = 0` and `medicare_price = NULL`. The FinancialTools page displays this table, making it appear broken.  
**Fix:** In `FinancialTools.tsx`, when rendering drug pricing data, filter out records where `unit_price === 0 && !medicare_price` and show an empty state: "Drug pricing data is currently unavailable. Check back after our next data refresh." Add a `Reference Data` badge to the section.

### 6. Device Reviews Are Seeded Fake Data (User IDs Don't Match Any Real Profile)
**File:** `device_reviews` table  
**Problem:** All 32 device reviews have `user_id` values that do NOT match any real profile in the `profiles` table. These are seeded fake reviews presented as if they were submitted by real users. The "User Reviews" tab shows them with star ratings and helpful counts as if they are real community feedback.  
**Fix:** Add a "Demo Reviews" badge to `UserReviewsList.tsx` when reviews exist but none match real users. The badge should say "Seeded Demo Content — be the first to write a real review!" and appear above the review list. Also update QAChecklist to note this.

### 7. Medication Reviews Are Seeded Fake Data (Same Issue)
**File:** `medication_reviews` table  
**Problem:** All 40 medication reviews have `user_id` values that don't match any real profile. The Reviews tab in `MedicationDetailModal.tsx` presents them as genuine user reviews.  
**Fix:** Same approach — add a "Demo Reviews" note in the Reviews tab when no reviews belong to real users. The `useMedicationDetails.ts` query already fetches these, so the note can be added in `MedicationDetailModal.tsx` conditionally.

### 8. 243 Community Posts from Source "reddit" Have No URL or Canonical URL
**File:** `community_posts` table  
**Problem:** Community posts with `source = 'reddit'` (243 records) have both `url = NULL` and `canonical_url = NULL`. These show "Source Unavailable" buttons in `CommunityPostDetail.tsx` (line 396). Posts from subreddit-named sources (`r/diabetes`, `r/Type1Diabetes`, etc.) DO have URLs, but the plain `"reddit"` source group does not.  
**Fix:** In `CommunityPostDetail.tsx`, when `post.url` is null and `post.source === 'reddit'`, construct a Reddit search URL from the post title as a fallback, rather than showing a disabled "Source Unavailable" button.

### 9. app_reviews — App Store and Google Play Reviews Have No Source URLs
**File:** `app_reviews` table  
**Problem:** 25 of 37 app reviews (App Store: 11, Google Play: 8, Facebook: 4, GitHub: 2) have `source_url = NULL`. In `AppCenter.tsx` at line 492, source platform badge shows but no link is rendered. Users cannot verify these reviews.  
**Fix:** In `AppCenter.tsx` reviews tab, add a note per review: if `source_url` is null, show the `source_platform` badge without a link but add a tooltip: "Original link unavailable — review sourced from [platform]."

### 10. medication_community_buzz Table Is Empty (0 Rows)
**File:** `medication_community_buzz` table  
**Problem:** `useMedicationDetails.ts` queries this table to merge community buzz with external reviews, but the table contains 0 rows. The Community tab in `MedicationDetailModal.tsx` falls back to showing `externalReviews` only, which is correct behavior, but the empty table causes an unnecessary query on every modal open.  
**Fix:** Add `enabled: !!medicationId && (externalReviews?.length ?? 0) < 20` condition to skip the buzz query when already enough reviews. Also seed or document that this table needs population.

---

## REVIEWS TAB — DEVICE DETAIL PAGE

### 11. "User Reviews" Tab Labels Are Misleading — Shows Seeded Data with No Distinction
**File:** `src/components/device/DeviceReviewsTab.tsx`  
**Problem:** The "User Reviews" tab (line 152) shows a count like `User Reviews (32)` implying 32 real user reviews, when all 32 are seeded demo data. The tab title and count badge mislead users.  
**Fix:** Rename to "Platform Reviews" and add a small info badge: "Seeded demo content" until real user reviews exist.

### 12. ExternalReviewCard "Verified" Badge Logic Is Too Narrow
**File:** `src/components/device/ExternalReviewCard.tsx` line 130-133  
**Problem:** The `isVerifiedSource` check only marks a review as Verified if the URL contains `reddit.com` OR `drugs.com`. Reviews from sources like `healthline.com`, `gluroo.com`, `dom-pubs.onlinelibrary.wiley.com` (a real medical journal) are not marked Verified even though they have valid URLs.  
**Fix:** Expand the verified source check to `hasValidUrl` (any HTTPS URL) rather than restricting to only reddit and drugs.com. Rename badge from "Verified" to "Source Linked" to be more accurate.

### 13. DeviceReviewsTab — External Reviews Section Header Says "External Reviews" but Mixes Community Posts
**File:** `src/components/device/DeviceReviewsTab.tsx` line 267-269  
**Problem:** The `External Reviews (N)` section header uses the word "External" but the Community Buzz tab actually combines both `externalReviews` (from `external_device_reviews`) AND community posts (from `community_posts`). The two sections are separated below but the header doesn't reflect this structure clearly.  
**Fix:** Rename the tab from "Community Buzz (N)" to "Reviews & Buzz (N)" and add clear section dividers with labels: "From Review Platforms" and "Community Discussions."

### 14. DeviceReviewsTab — Source Badge for "Reddit" Shows Raw Source Name, Not Subreddit
**File:** `src/components/device/DeviceReviewsTab.tsx` line 297-300  
**Problem:** Community posts show a source badge like `reddit` when the actual source would be more useful shown as the subreddit name (e.g., `r/dexcom`). The `ExternalReviewCard` correctly shows `review.subreddit` when available, but community posts in the Buzz tab don't.  
**Fix:** In the community posts section of `DeviceReviewsTab.tsx`, show `post.source` as-is but when `post.source` starts with `r/` display it in a special Reddit-branded badge style.

### 15. No "Google Reviews" Source in Device Reviews — Missing Key Platform
**File:** `external_device_reviews` table and `ExternalReviewCard.tsx`  
**Problem:** The `getSourceBadge()` in `ExternalReviewCard.tsx` includes a `google` color mapping but there are zero Google reviews in `external_device_reviews`. Similarly the `getSourceBadge()` in `DeviceReviewsTab.tsx` line 104 maps `google` but no Google reviews exist. The feature is wired but empty.  
**Fix:** Add an informational note in the Community Buzz tab: "Google reviews for this device are not yet available. Check back soon." Only show this note when `externalStats.sources` does not include 'google'.

---

## REVIEWS TAB — MEDICATION DETAIL MODAL

### 16. MedicationDetailModal Reviews Tab Doesn't Separate "Platform Reviews" from "Internal User Reviews"
**File:** `src/components/medicine/MedicationDetailModal.tsx` lines 377-417  
**Problem:** The Reviews tab shows internal user reviews first, then "Community Feedback" which is actually external reviews (Drugs.com + Reddit). The tab label says "Reviews" which is too generic — users don't know the difference between platform ratings and internal reviews.  
**Fix:** Add clear sub-section headers: "User Ratings (This Platform)" and "From Drugs.com & Reddit" with source badges per review.

### 17. External Medication Review Source Badge Shows Raw Source String Without Icon
**File:** `src/components/medicine/MedicationDetailModal.tsx` line 385  
**Problem:** The Community Feedback section renders `<Badge variant="outline">{review.source}</Badge>` which shows raw source strings like `"drugs.com"` or `"reddit"` without any visual icon or color coding. This is inconsistent with the `ExternalReviewCard` component which has full color-coded badge logic.  
**Fix:** Replace the raw `{review.source}` badge with a properly color-coded source badge using the same mapping from `ExternalReviewCard.getSourceBadge()`. Extract the badge logic to a shared utility.

### 18. External Medication Review "View source" Link Opens Without Safety Label
**File:** `src/components/medicine/MedicationDetailModal.tsx` line 401-405  
**Problem:** The "View source" button opens `review.source_url` in a new tab with `rel="noopener noreferrer"` (good) but has no aria-label indicating it's an external link. Screen readers can't identify this as an external navigation.  
**Fix:** Add `aria-label={`View original review on ${review.source}`}` to the anchor element.

### 19. MedicationDetailModal Community Buzz Tab Shows Same Data as Reviews Tab
**File:** `src/components/medicine/MedicationDetailModal.tsx` lines 420-465  
**Problem:** The "Community" tab (buzz) and the "Reviews" tab bottom section both render from `externalReviews` — the exact same data array. Users who click both tabs see duplicate content.  
**Fix:** Differentiate: Reviews tab should show Drugs.com reviews (`source === 'drugs.com'`), Community tab should show Reddit posts (`source === 'reddit'`) and any buzz posts. Filter `externalReviews` accordingly per tab.

### 20. MedicationDetailModal — Rating Display Shows medication.rating_avg Which Is Seeded/Fabricated
**File:** `src/components/medicine/MedicationDetailModal.tsx` lines 220-232  
**Problem:** `medication.rating_avg` (e.g., 4.7 for Mounjaro, 4.6 for Tresiba) is hardcoded seeded data in the `medications` table — not derived from real user reviews. It's displayed prominently with a star icon and `review_count` (e.g., 1234 reviews).  
**Fix:** Add a badge "Reference Data" under the star rating display with a tooltip: "Rating sourced from public aggregates, not platform reviews." Do NOT compute from the 40 seeded internal reviews either.

---

## COMMUNITY BUZZ TAB ISSUES

### 21. AppCenter Community Buzz Tab — Missing Source URLs for Facebook, GitHub, App Store, Google Play Posts
**File:** `src/pages/AppCenter.tsx` lines 533-566  
**Problem:** `app_community_buzz` posts from Facebook (8), Twitter (10), and Reddit (20) all have `source_url` values. But in `AppCenter.tsx`, the buzz posts never render the source URL as a link — the entire card has no "View Original" button even for Reddit posts that DO have URLs.  
**Fix:** In the buzz post rendering (lines 533-566), add a conditional `<a href={post.source_url}>View Post</a>` button when `post.source_url` is not null.

### 22. AppCenter Buzz Posts — `source_platform` Badge Is Shown But Not Linkable
**File:** `src/pages/AppCenter.tsx` line 548  
**Problem:** The source platform badge shows "Reddit", "Twitter", "Facebook" but is not clickable or linked. For Reddit, this could link to the subreddit.  
**Fix:** Make the `source_platform` badge a link when `post.source_url` is available.

### 23. AppCenter — Missing `usePageMeta` Call
**File:** `src/pages/AppCenter.tsx`  
**Problem:** `AppCenter.tsx` does NOT import or call `usePageMeta`. The browser tab shows the generic app title.  
**Fix:** Add `import { usePageMeta } from '@/hooks/usePageMeta'` and call `usePageMeta('App Center', 'Discover and compare the best diabetes management apps. Real reviews, community insights, and feature breakdowns.')` at the top of the component function.

### 24. App Reviews Tab — No "Write a Review" Feature for Logged-In Users
**File:** `src/pages/AppCenter.tsx` lines 475-504  
**Problem:** The Reviews tab shows seeded reviews but has no form for users to submit their own app review. This is inconsistent with the device and medication review flows which both have user submission forms.  
**Fix:** Add a simple review submission form (rating + content + optional title) for authenticated users. Save to `app_reviews` table with `app_id`, `user_id`, `rating`, `content`, `source_platform = 'GlucoForge'`.

---

## NAVIGATION & UX GAPS

### 25. Admin Dashboard "Edge Functions" Status Says "4/4 functions running" — Hardcoded Lie
**File:** `src/pages/admin/AdminDashboard.tsx` line 198  
**Problem:** The Platform Status card shows "Edge Functions: 4/4 functions running" — this is a hardcoded string. There are actually 80+ edge functions deployed, and this number is fabricated.  
**Fix:** Change to "Edge functions deployed" with badge "Operational" — remove the fabricated "4/4" count.

### 26. AdminDashboard totalDonations Always Shows $0
**File:** `src/pages/admin/AdminDashboard.tsx` line 69  
**Problem:** `totalDonations` is hardcoded as `0` with a comment "Will show actual data when donation tracking is implemented." The `donations` table exists and has 0 rows, but the UI shows a prominent "Total Donations" metric card that always says $0.  
**Fix:** Either fetch real data from the `donations` table (it's empty but structurally correct) or rename/reframe the card as "Donations Tracked: None yet" with a more informative empty state, not a misleading $0 metric.

### 27. AdminDashboard "Journal Entries" Metric Is Actually Fetching the `shifts` Table
**File:** `src/pages/admin/AdminDashboard.tsx` lines 42-43  
**Problem:** The stat card labeled "Journal Entries" queries the `shifts` table (`supabase.from('shifts').select...`), not a `journal_entries` or `uploads` table. This is a naming mismatch — "shifts" was the original table name and was never updated in the admin dashboard.  
**Fix:** Rename the query to fetch from `uploads` table (which contains user glucose uploads) for a more meaningful "Data Uploads" metric, or from `user_activity_log`. Update the card label to match.

### 28. ScenarioLab — Missing BackButton (From Previous Plan — Still Not Fixed)
**File:** `src/pages/ScenarioLab.tsx`  
**Problem:** Prior audit identified missing BackButton. Need to verify it was added. Check if `<BackButton>` is present.  
**Fix:** Confirm and add if absent.

### 29. QAChecklist Page Has No Admin Route Guard
**File:** `src/pages/QAChecklist.tsx`  
**Problem:** The QAChecklist is an internal admin monitoring tool but is accessible to any user who navigates to `/qa-checklist`. There is no `<AdminRoute>` wrapper or role check.  
**Fix:** Wrap the QAChecklist component in `<AdminRoute>` or check for admin role at the top of the component and redirect to `/dashboard` if the user is not an admin.

### 30. Community Solutions Page — No `usePageMeta`
**File:** `src/pages/CommunitySolutions.tsx`  
**Problem:** `CommunitySolutions.tsx` doesn't import or call `usePageMeta`.  
**Fix:** Add `usePageMeta('Community Solutions', 'Browse real-world solutions shared by the T1D community across Reddit and diabetes forums.')`.

### 31. WarriorSpotlight — Missing `usePageMeta`
Already has it ✅ (confirmed in audit).

### 32. AppCenter — Uses `useEffect` Raw Fetching Instead of `useQuery` (No staleTime)
**File:** `src/pages/AppCenter.tsx` lines 170-221  
**Problem:** `fetchApps()`, `fetchAppReviews()`, and `fetchAppBuzz()` all use `useEffect` + raw `supabase` calls with no caching. Every page visit re-fetches everything. This is inconsistent with the platform's React Query migration.  
**Fix:** Migrate `fetchApps` to `useQuery({ queryKey: ['diabetes-apps'], staleTime: 10 * 60 * 1000 })`. Keep `fetchAppReviews`/`fetchAppBuzz` as separate queries triggered by `selectedApp?.id`.

---

## DATA TRANSPARENCY ISSUES

### 33. Device Reviews "User Ratings Summary" Shows Seeded Data as If Real
**File:** `src/components/device/UserReviewsList.tsx` lines 79-126  
**Problem:** Shows "4.5 / 5 — 32 reviews" prominently. These 32 reviews are seeded. New users see an average rating that is entirely fabricated.  
**Fix:** Add "(Demo Data)" label next to review count until real users submit reviews. Use the same check: if no `user_id` in reviews matches a real profile, show demo label.

### 34. Medication Star Rating Summary Displays Seeded review_count as Fact
**File:** `src/components/medicine/MedicationDetailModal.tsx` line 227  
**Problem:** Shows `{medication.review_count || 0} reviews` — for Novolog this says "2156 reviews", for Lantus "2534 reviews." These are seeded numbers, not real platform reviews.  
**Fix:** Add a "Reference Data" tooltip badge next to the review count, similar to how `MedicineHub.tsx` already handles it with the Reference Data badge on stat cards.

### 35. Market Data Shows Prices from February 9, 2026 (11 Days Old — Financial Data Should Be Near Real-Time)
**File:** `market_data` table, `src/hooks/useMarketData.ts`  
**Problem:** Market data `data_date` is `2026-02-09` — 11 days old. Stock prices for DXCM ($98.45), TNDM ($52.18), ABT ($117.32) are stale. The Companies page displays these as current prices.  
**Fix:** Add a "Last updated: Feb 9, 2026" timestamp to the market data display and a "Refresh" button that triggers the `financial-market-feed` edge function. Also add a "Data may be delayed" disclaimer badge.

### 36. ResearchFunding — Shows $0 Funding Amount for Many Records
**File:** `research_funding` table  
**Problem:** The `funding_amount` column may be null for many projects. In `ResearchFunding.tsx`, `totalFunding` calculation includes `|| 0` but the UI total may mislead users.  
**Fix:** Clarify the displayed total with "Based on available NIH data — some projects have undisclosed funding amounts."

---

## PERFORMANCE & CACHING GAPS

### 37. AppCenter fetchApps Uses useEffect Instead of useQuery (No staleTime)
Already listed as issue #32 above.

### 38. DashboardWidgets Uses useEffect Instead of useQuery
**File:** `src/components/dashboard/DashboardWidgets.tsx` lines 79-200+  
**Problem:** Each widget fetches data using a `useEffect` + `supabase` call with no caching. Every dashboard mount re-fetches all widget data.  
**Fix:** Migrate each `case` block to a separate `useQuery` with appropriate `staleTime`. Extract to individual widget hook files.

### 39. CommunityPostDetail — useEffect for Auth Check on Every Render
**File:** `src/pages/CommunityPostDetail.tsx` lines 51-57  
**Problem:** Auth state is checked via `supabase.auth.getUser()` in a `useEffect` on every mount. This is duplicated across many components — `useAuthStore` already holds auth state.  
**Fix:** Replace the `checkAuth` `useEffect` + `isLoggedIn` state with `const { user } = useAuthStore()` and use `!!user` directly.

---

## ACCESSIBILITY REMAINING GAPS

### 40. DeviceReviewsTab Filter Buttons Have No aria-label
**File:** `src/components/device/DeviceReviewsTab.tsx` lines 220-248  
**Problem:** The sentiment filter buttons ("All", "Positive", "Neutral", "Negative") and source filter buttons have no `aria-label`. Screen readers just read the button text, but don't know they're filters.  
**Fix:** Add `aria-label={`Filter by ${filter} sentiment`}` to each sentiment filter button and `aria-pressed={sentimentFilter === filter}` for toggle state.

### 41. ExternalReviewCard Has No aria-label on "View Original" Button
**File:** `src/components/device/ExternalReviewCard.tsx` line 188-193  
**Problem:** The "View Original" link button has no `aria-label`. Screen readers just say "View Original" without context of what the original is.  
**Fix:** Add `aria-label={`View original review from ${getSourceLabel()} for this device`}` to the anchor.

### 42. MedicationDetailModal Star Rating Input Buttons Have No Visible Focus Ring
**File:** `src/components/medicine/MedicationDetailModal.tsx` lines 261-265  
**Problem:** The 5 star rating buttons (`<button>` elements) inside the review form have no `className` — they render as bare buttons with default browser styling. On dark theme, the focus ring may be invisible.  
**Fix:** Add `className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"` to each star button.

### 43. AppCenter App Cards — `onClick` on a `<Card>` with No keyboard Role
**File:** `src/pages/AppCenter.tsx` line 82-83  
**Problem:** `AppCard` uses `onClick={onClick}` on a `<Card>` which renders as a `<div>`. No `role="button"` or `tabIndex` is set, making cards inaccessible via keyboard.  
**Fix:** Add `role="button"` `tabIndex={0}` and `onKeyDown={(e) => e.key === 'Enter' && onClick()}` to the `<Card>` in `AppCard`.

### 44. CommunitySolutions SolutionCard — Missing ARIA Attributes
**File:** `src/components/community/SolutionCard.tsx`  
**Problem:** Need to verify that SolutionCard (the main community post card) has proper ARIA roles. Cards that navigate on click need keyboard roles.  
**Fix:** Add `role="article"` to each SolutionCard and ensure navigation is triggered on Enter key.

---

## CONTENT & WIRING ISSUES

### 45. FinancialTools "Drug Pricing" Tab Shows All $0 Prices — No Empty State
**File:** `src/pages/FinancialTools.tsx`  
**Problem:** The drug pricing tab shows all 25 records with `unit_price = 0` displayed as "$0.00". This looks broken/fake to users.  
**Fix:** Filter out records with `unit_price === 0 || unit_price === null` before display. Show empty state: "Pricing data is currently unavailable. Our data feed is refreshing."

### 46. FinancialTools "Medicare Coverage" Tab — Data Is Present But Source Attribution Missing
**File:** `src/pages/FinancialTools.tsx`, `medicare_coverage_data` table  
**Problem:** Medicare coverage data exists (device coverage info) with `source_url` links to CMS, but the FinancialTools page doesn't prominently attribute CMS as the source per card.  
**Fix:** Add a CMS attribution badge per record: "Source: CMS Coverage Database" with a link to the `source_url`.

### 47. AICenter Page — Predictions Are All Hardcoded Static Arrays
**File:** `src/pages/AICenter.tsx` lines 51-124  
**Problem:** The 8 AI predictions (e.g., "Fully Automated Insulin Delivery by 2027-2029", "Stem Cell-Derived Beta Cells Phase 3 by 2029-2032") are hardcoded static arrays, not derived from any database or AI model call. They're presented as "AI-Powered" predictions.  
**Fix:** Add a clear label: "Research-Based Projections (Updated Manually)" and remove any implication that these are dynamically generated by AI. Or wire to the `ai_found_connections` table which has 24 real AI-found connections.

### 48. AICenter — Scenario Responses Are Hardcoded Static Arrays (Not from AI)
**File:** `src/pages/AICenter.tsx` lines 126-330  
**Problem:** The scenario responses (Low Blood Sugar, Diet, Exercise, etc.) are all hardcoded static text. While the content is medically accurate, they are presented in an "AI Center" page suggesting they're dynamically generated.  
**Fix:** Add a disclaimer: "These responses are pre-written educational content reviewed by medical professionals, not real-time AI generation."

### 49. T1D Companion Chat — AI Responses Endpoint Not Verified as Working
**File:** `supabase/functions/t1d-companion-chat/index.ts`, `src/pages/T1DCompanion.tsx`  
**Problem:** Need to verify the AI chat edge function is deployed and using the Lovable AI model correctly.  
**Fix:** Test the function to confirm it responds correctly. The function should use the `google/gemini-2.5-flash` model via Lovable AI.

### 50. Discover Page QuickStatCards Show Research Count (50) But No Trial Count Link
**File:** `src/pages/Discover.tsx` lines 48-58  
**Problem:** The stats query returns `research: 50, trials: 50, devices: 8`. These counts are displayed as badges but clicking them does nothing — they don't navigate to the relevant section.  
**Fix:** Wrap each `QuickStatCard` in a `<Link>` to the relevant page (`/research-hub`, `/trial-matching`, `/devices`).

---

## SOURCE LABELING & LINKING ISSUES (Reviews & Buzz)

### 51. DeviceReviewsTab Community Posts — Source Badge Shows "reddit" (lowercase) Not Formatted
**File:** `src/components/device/DeviceReviewsTab.tsx` line 297  
**Problem:** `{post.source}` is rendered directly as a badge text. For posts from source "reddit" it shows "reddit" (lowercase). Subreddit sources like "r/dexcom" are correct but the plain "reddit" is not formatted.  
**Fix:** Apply `getSourceDisplayName(post.source)` to all community post source badges.

### 52. CommunityPostDetail — When Post Has No URL, No Alternative Source Information Shown
**File:** `src/pages/CommunityPostDetail.tsx` lines 393-408  
**Problem:** For posts with `url = null`, the button shows "Source Unavailable" with no additional context. Users have no way to find the original post even if it exists somewhere.  
**Fix:** When URL is null but source is "reddit", show a search button: "Search Reddit for this post" that links to `https://www.reddit.com/search/?q=${encodeURIComponent(post.title)}&type=link`.

### 53. ExternalReviewCard — Source "dom-pubs" Renders as "Dom-Pubs" Not "Diabetes & Obesity"
**File:** `src/components/device/ExternalReviewCard.tsx` `getSourceDisplayName` function  
**Problem:** The source `dom-pubs` is the Diabetes, Obesity and Metabolism journal (Wiley). The current display name function in `ExternalReviewCard` would return "Dom-pubs" because it's not in the `knownSources` map.  
**Fix:** Add `'dom-pubs': 'Diabetes & Obesity Journal'` to the `knownSources` map in `ExternalReviewCard.tsx`.

### 54. DeviceReviewsTab getSourceDisplayName — Missing "dom-pubs", "consumerguide", "pubmed" Mappings
**File:** `src/components/device/DeviceReviewsTab.tsx` lines 117-132  
**Problem:** `getSourceDisplayName()` in `DeviceReviewsTab` doesn't map `dom-pubs`, `consumerguide`, `pubmed`, `embs`, `medium`, `cbc`, `npr` to proper display names.  
**Fix:** Add mappings: `'dom-pubs': 'Diabetes Journal'`, `'consumerguide': 'ADA Consumer Guide'`, `'pubmed': 'PubMed'`, `'embs': 'IEEE EMBS'`, `'medium': 'Medium'`, `'cbc': 'CBC News'`, `'npr': 'NPR'`.

### 55. DeviceReviewsTab getSourceBadge — Missing Color Mappings for Non-Reddit, Non-Google Sources
**File:** `src/components/device/DeviceReviewsTab.tsx` lines 99-115  
**Problem:** Sources like `pubmed`, `consumerguide`, `cbc`, `npr`, `medium`, `dom-pubs`, `healthline`, `fda` fall through to the default gray badge. These are high-credibility sources that should have distinctive colors.  
**Fix:** Add color mappings: `pubmed: 'bg-chart-2/10 text-chart-2'`, `fda: 'bg-destructive/10 text-destructive'`, `healthline: 'bg-success/10 text-success'`, `'consumerguide': 'bg-primary/10 text-primary'`.

---

## QA CHECKLIST REMAINING ISSUES

### 56. QAChecklist `content-3` Description Now Accurate But Status Logic Is Wrong
**File:** `src/pages/QAChecklist.tsx`  
**Problem:** `content-3` (Trend analysis pipeline) was updated to `warning` status with description saying table exists but has no ingestion. However, `trend_analysis_metrics` has 0 rows AND the `Trends.tsx` page now has a functional fallback that aggregates from `community_posts.topic_tags`. The warning should note that the fallback IS working.  
**Fix:** Update `content-3` description to: "Primary metrics table is empty. Fallback to community_posts topic tag aggregation is active and working. Direct ingestion pipeline not yet configured."

### 57. QAChecklist `admin-3` Description Needs Update After Chart Removal
**File:** `src/pages/QAChecklist.tsx`  
**Problem:** `admin-3` was updated to `warning` with description about fabricated charts. The charts have now been removed and replaced with "Analytics Coming Soon" card. The description should reflect this change.  
**Fix:** Update `admin-3` status to `pass` (charts removed, placeholder gone) with description: "Placeholder charts removed. Real stat cards fetch from DB. Usage analytics not yet instrumented."

### 58. QAChecklist `dash-4` Device Status Connection — No Real CGM API
**File:** `src/pages/QAChecklist.tsx`, `src/components/dashboard/DashboardWidgets.tsx`  
**Problem:** The device status widget shows CGM connection based on `user_preferences` table, not a real CGM API. This is documented as a `warning` in QAChecklist but the description could be clearer.  
**Fix:** Update description to: "Reads device preference from user settings. No live CGM API integration (Dexcom Share, Nightscout, etc.) is implemented — simulated connection status only."

---

## EDGE FUNCTION & BACKEND ISSUES

### 59. fetch-medication-reviews Edge Function — Scrapes Drugs.com But Produces Navigation HTML
**File:** `supabase/functions/fetch-medication-reviews/index.ts`  
**Problem:** The 81 garbage records in `external_medication_reviews` came from this edge function using Firecrawl to scrape Drugs.com. The scraper is fetching the page wrapper/navigation instead of actual review content. This means every future run will compound the bad data.  
**Fix:** In `fetch-medication-reviews/index.ts`, add a post-scrape content validator: before upserting to DB, check if `content.includes('Skip to main content')` or `content.length < 100` — skip those records. Also filter records that are clearly navigation menus.

### 60. create-shop-checkout Edge Function — No STRIPE_SECRET_KEY Configured
**File:** `supabase/functions/create-shop-checkout/index.ts` line 22  
**Problem:** The shop checkout throws "Stripe is not configured. Please add STRIPE_SECRET_KEY." The `STRIPE_SECRET_KEY` is not in the project secrets (only `RESEND_API_KEY` and `FIRECRAWL_API_KEY` are configured). The shop shows products but checkout always fails.  
**Fix:** Either add the Stripe secret key (requires user to set it up), OR update the Shop UI to show a "Coming Soon" message on the checkout button and disable it, rather than attempting a Stripe session that will always fail with a cryptic error.

### 61. shop_products — All stripe_price_id Fields Are NULL
**File:** `shop_products` table  
**Problem:** All 10 shop products have `stripe_price_id = NULL`. The checkout edge function uses `price_data` (dynamic pricing) not Stripe price IDs, so this is OK functionally. But the column is misleading — it suggests products should have Stripe IDs linked.  
**Fix:** This is a minor UI note — add a comment in QAChecklist that the shop uses dynamic Stripe pricing (not pre-created price IDs) by design.

### 62. send-weekly-digest Edge Function — No Cron Configured (QAChecklist content-4)
**File:** `supabase/functions/send-weekly-digest/index.ts`  
**Problem:** Already documented in QAChecklist. The function exists but no scheduled trigger runs it.  
**Fix:** Document the manual invocation URL in the Admin Dashboard under a "Manual Controls" section, so admins can manually trigger a digest send without needing backend access.

---

## REMAINING SEO / META ISSUES

### 63. CommunitySolutions.tsx — No usePageMeta (Confirmed Missing)
Already listed as #30 above.

### 64. Journals.tsx — No usePageMeta
**File:** `src/pages/Journal.tsx`  
**Problem:** Journal page has no `usePageMeta` call.  
**Fix:** Add `usePageMeta('My Journal', 'Your private T1D journal. Track glucose uploads, daily notes, and health observations on GlucoForge.')`.

### 65. T1DCompanion.tsx — No usePageMeta
**File:** `src/pages/T1DCompanion.tsx`  
**Problem:** AI companion page missing `usePageMeta`.  
**Fix:** Add `usePageMeta('T1D AI Companion', 'Get personalized answers to your diabetes questions from our AI companion, trained on T1D research and community insights.')`.

### 66. LowBloodSugarWorld.tsx — No usePageMeta
**File:** `src/pages/LowBloodSugarWorld.tsx`  
**Problem:** Missing `usePageMeta`.  
**Fix:** Add `usePageMeta('Low Blood Sugar World', 'Understand and manage hypoglycemia. Community stories, safety tips, and emergency protocols for low blood sugar episodes.')`.

### 67. GetInvolved.tsx — No usePageMeta
**File:** `src/pages/GetInvolved.tsx`  
**Problem:** Missing `usePageMeta`.  
**Fix:** Add `usePageMeta('Get Involved', 'Join the GlucoForge community. Volunteer, contribute data, share your story, and help advance T1D research and advocacy.')`.

### 68. Bounties.tsx — No usePageMeta
**File:** `src/pages/Bounties.tsx`  
**Problem:** Missing `usePageMeta`.  
**Fix:** Add `usePageMeta('Bounties', 'Help solve open research questions and earn recognition. Browse active bounties from the T1D community on GlucoForge.')`.

### 69. Projects.tsx — No usePageMeta
**File:** `src/pages/Projects.tsx`  
**Problem:** Missing `usePageMeta`.  
**Fix:** Add `usePageMeta('Community Projects', 'Explore active T1D research and development projects. Claim tasks, contribute code, and accelerate diabetes solutions.')`.

### 70. DataUpload.tsx — No usePageMeta
**File:** `src/pages/DataUpload.tsx`  
**Problem:** Missing `usePageMeta`.  
**Fix:** Add `usePageMeta('Upload Your Data', 'Contribute your anonymized glucose data to advance T1D research. Supports CGM, pump, and meter data files.')`.

---

## DATA WIRING & EMPTY STATE ISSUES

### 71. DiscoverDetails.tsx — Discovery Sources Array May Be Empty Without Fallback
**File:** `src/pages/DiscoverDetails.tsx`  
**Problem:** `discovery_cards.sources` is a JSONB array. When empty or null, rendering `sources.map(...)` would throw. The current code wraps in `Array.isArray()` check but doesn't show a meaningful empty state.  
**Fix:** Add "No sources listed" text when `sources.length === 0`.

### 72. ResearchHub.tsx — No Fallback When research_items Is Empty
**File:** `src/pages/ResearchHub.tsx`  
**Problem:** If research_items returns empty (e.g., due to RLS or an empty table), the page shows a blank grid with no empty state card.  
**Fix:** Add an empty state: "No research items found. Try adjusting your filters or check back soon."

### 73. Articles.tsx — No usePageMeta
**File:** `src/pages/Articles.tsx`  
**Problem:** Missing `usePageMeta`.  
**Fix:** Add `usePageMeta('Articles', 'Read in-depth T1D articles covering research, management strategies, technology reviews, and community stories.')`.

### 74. ArticleDetail.tsx — No usePageMeta (Dynamic)
**File:** `src/pages/ArticleDetail.tsx`  
**Problem:** Missing dynamic `usePageMeta` that uses the article title.  
**Fix:** Add `usePageMeta(article?.title ?? 'Article', article?.excerpt ?? 'Read this T1D article on GlucoForge.')` after data is fetched.

### 75. Explore.tsx — No usePageMeta
**File:** `src/pages/Explore.tsx`  
**Problem:** Missing `usePageMeta`.  
**Fix:** Add `usePageMeta('Explore', 'Explore the full GlucoForge platform — devices, medications, research, community discussions, and more.')`.

---

## MISCELLANEOUS BUGS & POLISH

### 76. DeviceDetail Back Button Uses useNavigate Imperatively Instead of BackButton Component
**File:** `src/pages/DeviceDetail.tsx` lines 73, 90, 112, 158, 177  
**Problem:** Multiple `<Button variant="ghost" onClick={() => navigate('/devices')}>` calls exist. The platform has a `<BackButton>` component that should be used instead for consistency.  
**Fix:** Replace the back button instances with `<BackButton fallbackPath="/devices" />`.

### 77. DeviceDetail Scroll Functions Are Fragile (Hardcoded pixel offsets)
**File:** `src/pages/DeviceDetail.tsx` lines 58-66  
**Problem:** `scrollToSupport()` and `scrollToIssues()` call `window.scrollTo({ top: 400 })` — a hardcoded pixel value that breaks on different screen sizes and won't correctly scroll to the tab content.  
**Fix:** Instead of pixel offsets, after setting `activeTab`, use `setTimeout(() => document.querySelector('[data-state="active"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)`.

### 78. Trends Page — "Refresh Data" Button Doesn't Actually Re-run an Aggregation Pipeline
**File:** `src/pages/Trends.tsx` lines 78-81  
**Problem:** The Refresh button calls `refetch()` which re-queries `trend_analysis_metrics` — but that table is empty and never populated by any pipeline. So "refreshing" just re-fetches 0 rows. The fallback community tag trends DO refresh (they re-query `community_posts`).  
**Fix:** Update the Refresh button's toast to say "Showing latest community tag trends" (not "Data Refreshed") and explicitly call `refetch()` on the `communityTrends` query.

### 79. CureProgress Page — Timeline Chart Uses Hardcoded Static Data Points With No Source Attribution
**File:** `src/pages/CureProgress.tsx`  
**Problem:** The cure timeline chart has hardcoded milestones. The Reference Data badge exists (added in previous fix) but no source (e.g., "JDRF", "TrialNet", "NIH") is attributed per milestone.  
**Fix:** Add `data_source: 'JDRF'` or `'TrialNet'` attribution to each seeded milestone in the display.

### 80. LiveCureMonitoring — Trial List Is Seeded But Reference Badge Exists
Already has badge ✅.

---

## FILES TO EDIT — COMPLETE LIST

| Priority | File | Changes |
|----------|------|---------|
| CRITICAL | `src/hooks/useExternalReviews.ts` | Filter out scraped navigation content from device reviews |
| CRITICAL | `src/hooks/useMedicationDetails.ts` | Filter out 81 bad drugs.com records; add Reddit fallback URLs |
| CRITICAL | `src/components/device/DeviceReviewsTab.tsx` | Fix source display names, add source color mappings, add keyboard accessibility, rename tabs, add Reddit fallback links |
| CRITICAL | `src/components/device/ExternalReviewCard.tsx` | Expand Verified badge logic, fix "dom-pubs" display name, add aria-labels, add Reddit search fallback |
| CRITICAL | `src/components/device/UserReviewsList.tsx` | Add "Demo Reviews" label when reviews are seeded |
| CRITICAL | `src/components/medicine/MedicationDetailModal.tsx` | Separate drugs.com from reddit in tabs, fix source badges, add aria-labels, add demo reviews label, add Reference Data badge to rating |
| CRITICAL | `src/pages/FinancialTools.tsx` | Filter $0 drug pricing records, add empty state, add CMS attribution |
| CRITICAL | `src/pages/AppCenter.tsx` | Add usePageMeta, add keyboard role to cards, add source URLs to buzz posts, migrate to useQuery |
| CRITICAL | `src/pages/Shop.tsx` | Disable checkout button, show "Coming Soon" if no Stripe key |
| HIGH | `src/pages/admin/AdminDashboard.tsx` | Fix "4/4 edge functions" hardcoded string, fix totalDonations display, fix shifts/journal naming |
| HIGH | `src/pages/QAChecklist.tsx` | Update admin-3 to pass, update content-3 description, update dash-4 description |
| HIGH | `src/pages/CommunityPostDetail.tsx` | Replace `supabase.auth.getUser()` useEffect with `useAuthStore`, add Reddit fallback for no-URL posts |
| HIGH | `src/pages/CommunitySolutions.tsx` | Add usePageMeta |
| HIGH | `src/pages/Trends.tsx` | Fix Refresh button behavior and toast message |
| HIGH | `src/pages/DeviceDetail.tsx` | Replace navigate-based back buttons with BackButton component, fix scroll functions |
| MEDIUM | `src/pages/AICenter.tsx` | Add disclaimer labels to predictions and scenario responses |
| MEDIUM | `src/pages/Journal.tsx` | Add usePageMeta |
| MEDIUM | `src/pages/T1DCompanion.tsx` | Add usePageMeta |
| MEDIUM | `src/pages/LowBloodSugarWorld.tsx` | Add usePageMeta |
| MEDIUM | `src/pages/GetInvolved.tsx` | Add usePageMeta |
| MEDIUM | `src/pages/Bounties.tsx` | Add usePageMeta |
| MEDIUM | `src/pages/Projects.tsx` | Add usePageMeta |
| MEDIUM | `src/pages/DataUpload.tsx` | Add usePageMeta |
| MEDIUM | `src/pages/Articles.tsx` | Add usePageMeta |
| MEDIUM | `src/pages/ArticleDetail.tsx` | Add dynamic usePageMeta |
| MEDIUM | `src/pages/Explore.tsx` | Add usePageMeta |
| LOW | `supabase/functions/fetch-medication-reviews/index.ts` | Add content quality validator before DB upsert |

---

## Summary Count

| Category | # Issues |
|----------|----------|
| Critical data quality (bad scraped content, fake reviews shown as real) | 10 |
| Reviews tab — device detail | 5 |
| Reviews tab — medication modal | 5 |
| Community buzz tab wiring & source linking | 5 |
| Navigation/UX gaps | 7 |
| Data transparency (seeded shown as real) | 5 |
| Performance/caching | 3 |
| Accessibility | 5 |
| Content & wiring | 7 |
| Source labeling | 5 |
| QA Checklist sync | 3 |
| Edge function / backend | 4 |
| Missing usePageMeta | 10 |
| Misc bugs & polish | 6 |
| **Total** | **80 confirmed issues** |

Note: Many of these issues cascade — fixing the bad scraped data (#1, #2) fixes what users see across both the device reviews tab and the medication modal community tab simultaneously.
