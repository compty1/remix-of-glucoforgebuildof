

## Comprehensive Build Audit & Fix Plan (Final Extended -- 170 Total Issues)

### Overview
Full audit of the entire codebase (85+ pages, 80+ edge functions, 75+ hooks, database) has identified **170 total issues**. Issues 1-140 are from previous iterations and remain UNCHANGED. Issues 141-170 are newly identified below.

---

### Previously Identified Issues (1-140) -- UNCHANGED

All 140 issues from the previous plan remain exactly as documented. No items removed.

---

### New Issues (141-170)

#### Issue 141: News Page Missing Layout Wrapper (MODERATE)

**Problem:** `News.tsx` renders directly without the `<Layout>` component (line 57 starts with `<div className="min-h-screen bg-background">`). Unlike every other page in the app, the News page has no sidebar, header, or footer. Users navigating to `/news` see a bare page with no global navigation except the back button.

**Fix:** Wrap the entire page content in `<Layout>`.

**File:** `src/pages/News.tsx` (line 57)

---

#### Issue 142: News Page "Subscribe" Button Does Nothing (MODERATE)

**Problem:** `News.tsx` line 87-90 renders a "Subscribe" button with an RSS icon but no onClick handler. Clicking it does nothing.

**Fix:** Wire to the `WeeklyDigestSignup` component or a subscription dialog.

**File:** `src/pages/News.tsx` (line 87)

---

#### Issue 143: "Download Our Presentation" Links to Non-Existent PDF (MODERATE)

**Problem:** `GetInvolved.tsx` line 160 links to `/presentation.pdf`. There is no `presentation.pdf` file in the project's public directory. Clicking downloads nothing or shows a 404.

**Fix:** Either create and upload a real presentation PDF, or remove this button.

**File:** `src/pages/GetInvolved.tsx` (line 160)

---

#### Issue 144: DonationsInfo Page Uses Entirely Hardcoded Financial Data (MODERATE)

**Problem:** `DonationsInfo.tsx` lines 38-195 hardcode all donation amounts, research allocations, and organizational data (e.g., JDRF $198M, ADA $145M). These are never fetched from any database or API. The page presents itself as data-driven but is entirely static. The data may become outdated.

**Fix:** Either source from a database table (e.g., `t1d_organizations`) or clearly label as "Estimates based on public 990 filings" with a year disclaimer.

**File:** `src/pages/DonationsInfo.tsx`

---

#### Issue 145: DonationsInfo Hardcoded Colors Not Dark-Mode-Friendly (LOW)

**Problem:** `DonationsInfo.tsx` lines 531-548 use hardcoded colors like `bg-blue-100`, `bg-green-100`, `bg-yellow-100` for the "Where Your Dollar Goes" section. These don't adapt to dark mode.

**Fix:** Use theme-aware CSS variables.

**File:** `src/pages/DonationsInfo.tsx` (lines 531-548)

---

#### Issue 146: LowBloodSugarWorld "Share Your Story" Button Does Nothing (MODERATE)

**Problem:** `LowBloodSugarWorld.tsx` line 242 renders `<Button>Share Your Story</Button>` in the empty state with no onClick handler.

**Fix:** Wire to a story submission form/modal.

**File:** `src/pages/LowBloodSugarWorld.tsx` (line 242)

---

#### Issue 147: LowBloodSugarWorld "Share" Button on Each Story Does Nothing (LOW)

**Problem:** `LowBloodSugarWorld.tsx` line 105 renders a Share2 icon button with no onClick handler on every story card.

**Fix:** Wire to the SocialShareButtons component or a share dialog with the story URL.

**File:** `src/pages/LowBloodSugarWorld.tsx` (line 105)

---

#### Issue 148: LowBloodSugarWorld Upvote Has No Auth Check (LOW)

**Problem:** `LowBloodSugarWorld.tsx` line 150-167 allows any visitor (even unauthenticated) to upvote stories by directly calling `supabase.update`. There's no user check and no rate limiting -- a user could click upvote unlimited times.

**Fix:** Add authentication check and track which users have voted to prevent duplicate votes.

**File:** `src/pages/LowBloodSugarWorld.tsx` (lines 150-167)

---

#### Issue 149: FutureOfT1D Predictions Reference Past Dates (MODERATE)

**Problem:** `FutureOfT1D.tsx` line 62-65 references "FDA approval (expected 2024-2025)" and "Insulin icodec approved in EU, FDA submission pending" for predictions dated "3 Years (2029)". Since the current date is February 2026, some of these "current status" descriptions are already outdated.

**Fix:** Update prediction descriptions and current statuses to reflect 2026 reality.

**File:** `src/pages/FutureOfT1D.tsx`

---

#### Issue 150: AICenter Predictions Also Reference Past Timeframes (LOW)

**Problem:** `AICenter.tsx` line 51-96 contains hardcoded predictions with timeframes like "2027-2029". Similar to Issue 149, some key factors and current statuses may be outdated.

**Fix:** Review and update prediction data.

**File:** `src/pages/AICenter.tsx`

---

#### Issue 151: Journey Page is a Static Placeholder with No Actionable Content (LOW)

**Problem:** `Journey.tsx` is a simple static page with 3 cards ("Community First", "Hope Through Data", "Future Forward") and no links, data, or functionality. It serves no functional purpose beyond displaying marketing copy.

**Fix:** Either enrich with actual roadmap/milestone data or redirect to a more useful page.

**File:** `src/pages/Journey.tsx`

---

#### Issue 152: T1DCompanion History Tab Only Visible to Logged-In Users but No Auth Guard (LOW)

**Problem:** `T1DCompanion.tsx` lines 108-113 conditionally render the History tab only if `user` exists, but the TabsList still has `grid-cols-4` creating an awkward 4-column layout with only 3 visible tabs for logged-out users.

**Fix:** Change grid to `grid-cols-3` when user is null, or use a flexible layout.

**File:** `src/pages/T1DCompanion.tsx` (line 95)

---

#### Issue 153: TrialMatching ZIP Code Filter Has No Validation (LOW)

**Problem:** `TrialMatching.tsx` accepts any text in the ZIP code field (line 77-83). Non-numeric or invalid ZIP codes are passed to the search without validation.

**Fix:** Add input validation to ensure 5-digit US ZIP code format.

**File:** `src/pages/TrialMatching.tsx` (lines 77-83)

---

#### Issue 154: Explore Page Uses Inline Style Tag in JSX (LOW)

**Problem:** Several pages embed `<style>` tags directly in JSX (e.g., `LowBloodSugarWorld.tsx` line 248-263 for custom animations). This is a minor anti-pattern that can cause style conflicts.

**Status:** Low priority -- functional but not ideal. Consider moving to Tailwind config or CSS file.

---

#### Issue 155: ResearchInsights 6-Tab Layout Overflows on Mobile (MODERATE)

**Problem:** `ResearchInsights.tsx` line 60 renders a `TabsList` with `grid-cols-6`. On mobile screens, 6 tabs will be extremely cramped or overflow, making them unreadable and untappable.

**Fix:** Use a scrollable TabsList on mobile or reduce to 4 tabs with a "More" dropdown.

**File:** `src/pages/ResearchInsights.tsx` (line 60)

---

#### Issue 156: Companies Page "All Types" Filter Uses Value "all" Which Matches No Records (LOW)

**Problem:** `Companies.tsx` line 201 uses `<SelectItem value="all">All Types</SelectItem>`. However, the `useT1DCompanies` hook passes `companyType` directly as a filter. If "all" is sent as a filter value, it would try to match `company_type = 'all'` which doesn't exist. Need to verify the hook correctly treats "all" as "no filter".

**Fix:** Verify the hook handles `companyType: 'all'` or empty string correctly.

**File:** `src/pages/Companies.tsx`, `src/hooks/useT1DCompanies.ts`

---

#### Issue 157: Shop Missing /shop/success and /shop/cancel Route Pages (MODERATE)

**Problem:** `Shop.tsx` lines 83-84 redirect to `/shop/success` and `/shop/cancel` after Stripe checkout. Need to verify these routes exist in the router and have corresponding page components. If missing, users see a 404 after completing a purchase.

**Fix:** Verify routes exist. If not, create basic success/cancel pages under `src/pages/shop/`.

**Files:** `src/App.tsx`, `src/pages/shop/`

---

#### Issue 158: DiabetesBurnout Quiz Result Colors Use Hardcoded Light-Mode Colors (LOW)

**Problem:** `DiabetesBurnout.tsx` lines 42-45 use hardcoded colors: `bg-green-50`, `bg-yellow-50`, `bg-orange-50`, `bg-red-50`. These will look wrong in dark mode with light backgrounds on dark page.

**Fix:** Add dark mode variants or use theme-aware colors.

**File:** `src/pages/DiabetesBurnout.tsx` (lines 42-45)

---

#### Issue 159: Onboarding Role Selection Has No Visible Effect (LOW)

**Problem:** `OnboardingModal.tsx` collects a user role (newly_diagnosed, experienced, caregiver, researcher) but the selected role doesn't appear to change the user's experience anywhere in the app -- no conditional content, no personalized dashboard.

**Status:** Informational -- the role is saved but not used for personalization.

---

#### Issue 160: Multiple Pages Use `useEffect` for Data Fetching Instead of React Query (LOW)

**Problem:** Pages like `LowBloodSugarWorld.tsx`, `Discover.tsx`, and `DeviceDetail.tsx` use raw `useEffect` + `useState` for data fetching instead of `@tanstack/react-query`. This means no automatic caching, no stale-while-revalidate, and manual loading/error state management. Other pages correctly use React Query.

**Status:** Technical debt -- functional but inconsistent pattern.

---

#### Issue 161: LearnExplore Topics Are All Hardcoded with No DB Content (MODERATE)

**Problem:** `LearnExplore.tsx` lines 22-94 hardcode all 24 topics across 6 categories. The `TopicDetailModal` likely generates content on-the-fly rather than fetching from a database. If the AI model is unavailable, topics show no content.

**Fix:** Verify the TopicDetailModal handles AI unavailability gracefully with fallback content.

**File:** `src/pages/LearnExplore.tsx`, `src/components/learn/TopicDetailModal.tsx`

---

#### Issue 162: Resources Page External Links May Be Stale (MODERATE)

**Problem:** `Resources.tsx` lines 48-344 hardcode 28 external resource URLs (diabetes.org, breakthrought1d.org, getinsulin.org, etc.). These URLs can break over time as organizations restructure their websites. Several point to generic landing pages rather than specific resources.

**Fix:** Periodically verify external URLs. Consider using the `verify-external-links` edge function to check these.

**File:** `src/pages/Resources.tsx`

---

#### Issue 163: DonationsInfo "Recent Breakthroughs" Data is Hardcoded with 2022-2024 Dates (LOW)

**Problem:** `DonationsInfo.tsx` lines 561-566 hardcode 4 research breakthroughs with dates 2022-2024. As time passes, these will feel increasingly stale without updates.

**Fix:** Either update with 2025-2026 breakthroughs or source from database.

**File:** `src/pages/DonationsInfo.tsx` (lines 561-566)

---

#### Issue 164: QualityOfLife Page Renders `selectedDeficiency` and `selectedResource` State But May Not Use Both (LOW)

**Problem:** `QualityOfLife.tsx` line 46-47 initializes two modal states (`selectedDeficiency`, `selectedResource`) but only `selectedResource` appears to trigger the `QoLDetailModal`. `selectedDeficiency` may be unused state.

**Fix:** Verify and clean up unused state.

**File:** `src/pages/QualityOfLife.tsx` (lines 46-47)

---

#### Issue 165: BuildWithUs Project Cards Link to `/build-with-us/:id` -- Verify Route Exists (LOW)

**Problem:** `DevelopmentProjectCard` likely navigates to a project detail page. Need to verify the route `/build-with-us/:projectId` or similar exists and correctly loads `DevelopmentProjectDetail.tsx`.

**Fix:** Verify routing works end-to-end.

**Files:** `src/pages/BuildWithUs.tsx`, `src/App.tsx`

---

#### Issue 166: Admin Page Stats May Show 0 Due to RLS Policies (MODERATE)

**Problem:** `Admin.tsx` lines 36-60 query `profiles`, `shifts`, `bounties`, and `surveys` tables using `count: 'exact'`. If RLS policies restrict access, the admin may see 0 for all stats even with data present.

**Fix:** Verify admin users have proper access via RLS policies or service role key.

**File:** `src/pages/Admin.tsx`

---

#### Issue 167: PrepareForVisit Snapshot Hardcoded Colors in HTML Export (LOW)

**Problem:** `PrepareForVisit.tsx` lines 62-68 generate HTML for download with hardcoded colors (`color: #6A4C93`, `background: #f0f0f0`). The exported HTML always uses light-mode colors regardless of the user's theme preference.

**Status:** Minor -- export formatting doesn't need to match app theme, but the hardcoded brand color may not be ideal.

---

#### Issue 168: Discover Page Uses Both `useEffect` and `useQuery` Simultaneously (LOW)

**Problem:** `Discover.tsx` uses `useQuery` for stats (line 48) but raw `useEffect` + `useState` for the main insights data (line 60-91). This inconsistency means the main data doesn't benefit from React Query's caching and deduplication.

**Fix:** Migrate insights fetching to `useQuery` for consistency.

**File:** `src/pages/Discover.tsx`

---

#### Issue 169: Multiple `window.open()` Instances Still Untracked (MODERATE)

**Problem:** Beyond the 14+ instances tracked in Issues 6 and 90-103, the full search reveals `window.open()` in 20 files total (125 matches). Some additional instances not yet tracked include:
- `src/pages/ResearchHub.tsx` line 118
- `src/pages/CureProgress.tsx` line 405
- `src/pages/DeviceAnalytics.tsx` line 436
- `src/components/device/DeviceSpecsCard.tsx` lines 254, 267
- `src/components/device/FDAIssueStats.tsx` lines 82, 91

These are mostly covered by Issues 6/36/93/94/126 but confirming the full scope: all 20 files with `window.open()` need review.

**Fix:** Systematic conversion of all non-print/non-social `window.open()` calls to anchor tags.

**Files:** 20 files total (see full list in Issue 6 expanded)

---

#### Issue 170: Global Inconsistency -- Some Pages Use BackButton, Others Don't (LOW)

**Problem:** Most sub-pages include `<BackButton />` for navigation, but some don't (e.g., `Journey.tsx`, `MentalHealthHub.tsx`). This creates inconsistent navigation behavior where some pages have no way to go "back" other than browser back button.

**Fix:** Add `<BackButton />` to all sub-pages that aren't top-level dashboard pages.

**Files:** `src/pages/Journey.tsx`, `src/pages/MentalHealthHub.tsx`, and others

---

### Updated Implementation Priority

| Priority | Issues | Description |
|----------|--------|-------------|
| **P0 -- Critical** | 31, 32, 50, 51, 55, 80, 84, 1, 2, 26 | Wrong device images, broken navigation, crisis buttons, dead APIs, broken payment |
| **P1 -- High** | 33, 36, 41, 52, 54, 56, 57, 58, 65, 73, 81, 85, 87, 97, 104, 105, 110, 113, 141, 142, 143, 146, 149, 155, 157, 4, 5, 6, 18, 30, 69, 74, 90-94, 101-103, 126, 139, 161, 162, 166, 169 | Broken links, missing layout, fake data, popup blocking, unwired forms, stale predictions |
| **P2 -- Medium** | 3, 7, 13, 16, 17, 21, 25, 27, 28, 34, 35, 39, 43, 45, 48, 53, 60, 61, 62, 63, 64, 66, 67, 70, 71, 72, 76, 82, 83, 86, 88, 95, 96, 99, 100, 106, 107, 108, 109, 111, 112, 116, 117, 118, 121, 124, 127, 130, 144, 145, 147, 148, 150, 151, 152, 153, 156, 158, 163, 164, 170 | Stubs, UX polish, cosmetic, data quality, hardcoded content |
| **P3 -- Low** | 8, 19, 20, 22, 23, 24, 29, 38, 40, 42, 44, 59, 68, 75, 77, 78, 79, 91, 98, 114, 115, 119, 120, 122, 123, 125, 128, 129, 131-138, 140, 154, 159, 160, 165, 167, 168 | Edge cases, verification, minor polish, tech debt |
| **No Action** | 9, 10, 37, 46, 47, 49, 89 | Working correctly or informational |

---

### Technical Details

**Total files to modify: 45+ files**

*New files for Issues 141-170:*
- `src/pages/News.tsx` -- Add Layout wrapper, wire Subscribe button (Issues 141, 142)
- `src/pages/GetInvolved.tsx` -- Remove or fix presentation.pdf link (Issue 143)
- `src/pages/DonationsInfo.tsx` -- Label data as estimates, fix dark mode colors (Issues 144, 145, 163)
- `src/pages/LowBloodSugarWorld.tsx` -- Wire Share/Story buttons, add auth check on upvote (Issues 146, 147, 148)
- `src/pages/FutureOfT1D.tsx` -- Update outdated prediction statuses (Issue 149)
- `src/pages/AICenter.tsx` -- Update outdated prediction data (Issue 150)
- `src/pages/Journey.tsx` -- Enrich or redirect (Issue 151)
- `src/pages/T1DCompanion.tsx` -- Fix tab grid layout for logged-out users (Issue 152)
- `src/pages/TrialMatching.tsx` -- Add ZIP code validation (Issue 153)
- `src/pages/ResearchInsights.tsx` -- Fix 6-tab mobile overflow (Issue 155)
- `src/pages/Companies.tsx` -- Verify "all" filter handling (Issue 156)
- `src/pages/Shop.tsx` / `src/App.tsx` -- Verify shop success/cancel routes (Issue 157)
- `src/pages/DiabetesBurnout.tsx` -- Fix dark mode quiz colors (Issue 158)
- `src/pages/LearnExplore.tsx` -- Verify AI fallback in TopicDetailModal (Issue 161)
- `src/pages/Resources.tsx` -- Verify external URLs (Issue 162)
- `src/pages/Admin.tsx` -- Verify RLS for admin queries (Issue 166)
- `src/pages/MentalHealthHub.tsx` -- Add BackButton (Issue 170)

*All previously identified files (Issues 1-140) remain in the plan unchanged.*

**Database updates (unchanged + new):**
- `devices` -- Remove/replace Unsplash stock photos (Issues 31, 50, 80)
- `community_posts` -- Fix 27 blank-query URLs and backfill 243 NULL URLs (Issues 4, 5)
- `patent_data` -- Verify patent IDs and links (Issues 8, 44)
- Verify RLS on `direct_messages`, `notifications` tables (Issues 138, 139)
- Verify RLS on admin-accessed tables (Issue 166)

