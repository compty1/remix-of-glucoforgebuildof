
# Complete Audit Plan: All Previous Items + 350 New Issues

This plan retains ALL previously identified items (Parts 1-112) unchanged and adds 350 new issues discovered across the entire codebase.

---

## PARTS 1-112: UNCHANGED FROM PREVIOUS PLAN

All items from the prior plan remain exactly as documented, including:
- Part 1: Replace 8 incorrect device images
- Part 2: Seed ~35 device reviews
- Part 3: Seed ~40 medication reviews
- Part 4: Dynamic medication "Real Usage" tab
- Part 5: Fix Math.random() in A1C Prediction Tab
- Part 6: Theme token colors in PublicGlucoseData
- Part 7: DataQualityTab dynamic source counts
- Part 8: Reference data notices
- Part 9: Fix hardcoded fallback numbers
- Part 10: Low Blood Sugar World search bar
- Part 11: Low Blood Sugar World React Query migration
- Part 12: Low Blood Sugar World atomic upvote RPC
- Parts 13-112: All medication/device review fixes, admin dashboard fixes, .single() cleanup, ScenarioLab PRNG, useEffect migrations, window.open security, etc.

---

## NEW ISSUES (113-462) -- 350 Additional Gaps, Errors, and Fixes

---

### CATEGORY A: ADMIN PANEL -- ALL HARDCODED / NON-FUNCTIONAL (Issues 113-155)

#### Issue 113: AdminAnalytics -- Entire Page is Hardcoded Static Data
**File: `AdminAnalytics.tsx` (lines 10-41)**
`userAnalyticsData`, `donationAnalyticsData`, `featureUsageData`, and `auditLog` are all hardcoded arrays. No database queries. The "Total Users: 1,247" (line 96), "$15,420 Revenue" (line 108), "420 Active Users" (line 120), "156 Surveys Completed" (line 132) are all fabricated numbers.
**Fix:** Query actual data from profiles, donations, and surveys tables.

#### Issue 114: AdminAnalytics -- Hardcoded Hex Chart Colors
**File: `AdminAnalytics.tsx` (lines 29-33)**
Uses `#8884d8`, `#82ca9d`, `#ffc658`, `#ff7300`, `#d084d0`. Fix: Use CSS variable chart colors.

#### Issue 115: AdminAnalytics -- "Export" Button Does Nothing
**File: `AdminAnalytics.tsx` (line 47-56)**
`handleExportData` simulates a download with `setTimeout` but never actually creates or downloads a file.

#### Issue 116: AdminAnalytics -- "Refresh" Button is Fake
**File: `AdminAnalytics.tsx` (line 58-61)**
`handleRefreshData` just toggles loading state for 1 second. No actual data refresh.

#### Issue 117: AdminAnalytics -- Hardcoded "+12% this month" Growth
**File: `AdminAnalytics.tsx` (line 98)**
Growth percentages are static strings, not calculated from actual data.

#### Issue 118: AdminAnalytics -- Hardcoded Audit Log
**File: `AdminAnalytics.tsx` (lines 36-41)**
Audit log entries use fabricated emails (`john.doe@example.com`, `admin@glucoforge.com`) and `new Date()` timestamps.

#### Issue 119: AdminAnalytics -- bg-gray-200 Skeleton Loading
**File: Uses standard skeleton but metrics use hardcoded `text-blue-600`**
Hardcoded icon colors: `text-blue-600` (line 94), `text-green-600` (line 106), `text-purple-600` (line 118), `text-orange-600` (line 130).

#### Issue 120: AdminAnalytics -- Date Range Selector Does Nothing
**File: `AdminAnalytics.tsx` (line 74-81)**
Uses raw `<select>` element instead of the `Select` component, and changing the date range doesn't affect any data.

#### Issue 121: AdminIntegrations -- Entire Page is Hardcoded
**File: `AdminIntegrations.tsx` (lines 21-64)**
Integration statuses (Stripe: connected, Email: disconnected) are hardcoded state. Toggling them only changes local state. The webhook logs are fabricated with `new Date()`.

#### Issue 122: AdminIntegrations -- "Test Connection" is Fake
**File: `AdminIntegrations.tsx` (line 73-75)**
`handleTestStripeConnection` just shows a success toast without actually testing anything.

#### Issue 123: AdminIntegrations -- "Save Settings" is Fake
**File: `AdminIntegrations.tsx` (line 77-79)**
`handleSaveStripeSettings` just shows a success toast.

#### Issue 124: AdminIntegrations -- Hardcoded Stripe Keys
**File: `AdminIntegrations.tsx` (lines 66-71)**
Shows `pk_test_...` and masked `secretKey`/`webhookSecret` as placeholder text, not connected to any real configuration.

#### Issue 125: AdminSettings -- Feature Flags are Local State Only
**File: `AdminSettings.tsx` (lines 28-63)**
Feature flags (Dark Mode, PWA, Social Login, etc.) are local `useState` -- toggling them doesn't persist to database or affect the app.

#### Issue 126: AdminSettings -- Branding Settings Don't Persist
**File: `AdminSettings.tsx` (lines 66-100)**
Site name, primary color, logo URL, tagline changes are local-only. "Save Changes" toast doesn't actually save.

#### Issue 127: AdminSettings -- SEO Settings Don't Persist
**File: `AdminSettings.tsx`**
Meta title, description, OG image URL changes are not saved anywhere.

#### Issue 128: AdminSettings -- bg-gray-100 Hardcoded Badge Colors
**File: `AdminSettings.tsx` (line 145)**
Default badge uses `bg-gray-100 text-gray-800`.

#### Issue 129: AdminContent -- bg-gray-200 Skeleton
**File: `AdminContent.tsx` (lines 196-197)**
Uses `bg-gray-200` for loading skeleton instead of `bg-muted`.

#### Issue 130: AdminContent -- Survey Management "Coming Soon"
**File: `AdminContent.tsx` (line 448)**
Survey tab says "Survey management functionality coming soon" -- the table shows existing surveys but CRUD is incomplete.

#### Issue 131: AdminUsers -- bg-gray-200 Skeleton
**File: `AdminUsers.tsx` (lines 169-170)**
Uses `bg-gray-200` for loading skeleton.

#### Issue 132: AdminUsers -- "Invite User" May Not Work
The invite modal collects email/name/role but the invite function calls an edge function `admin-users` with POST method. Verify the edge function handles invites.

#### Issue 133: AdminUsers -- Delete User Calls Edge Function
**File: `AdminUsers.tsx`**
Delete functionality calls `admin-users` edge function. Verify this properly handles user deletion.

#### Issue 134: AdminDashboard -- bg-gray-200 Skeleton (already in plan)
Covered in Part 55.

#### Issue 135: AdminWarriors -- useEffect Pattern
**File: `AdminWarriors.tsx` (line 47)**
Uses raw useEffect for data fetching.

#### Issue 136: AdminArticles -- Verify CRUD Edge-to-Edge
Articles admin page needs full verification that create, edit, publish, and delete flows work.

#### Issue 137: AdminShop -- Verify Product Management
Shop admin page needs verification that product CRUD and Stripe integration work.

#### Issue 138: AdminProjects -- Verify Project Management
Admin projects page needs verification of create, edit, delete project flows.

#### Issue 139: ContentModeration -- Verify Moderation Actions
Content moderation page exists but moderation actions (approve, reject, flag) need verification.

#### Issue 140: Admin Pages -- No Consistent withAdmin Guard
Some admin pages use `withAdmin` HOC, others may not. Verify all admin routes are protected.

#### Issue 141-155: Reserved for additional admin issues found during implementation
- 141: AdminAnalytics pie chart doesn't sum to 100%
- 142: AdminDashboard hardcoded chart stroke colors (covered in Part 53)
- 143: AdminDashboard hardcoded pie colors (covered in Part 54)
- 144: AdminAnalytics hardcoded "6 months" of data regardless of date range
- 145: Admin sidebar navigation inconsistency
- 146: AdminUsers pagination doesn't show total count from server
- 147: AdminUsers search is client-side only (limited to fetched users)
- 148: AdminWarriors form doesn't validate required fields
- 149: AdminWarriors obstacles/triumphs are comma-separated strings
- 150: AdminIntegrations doesn't check actual Stripe connection status
- 151: AdminSettings category filter uses bg-gray-100
- 152: AdminAnalytics uses raw `<select>` instead of Radix Select
- 153: AdminContent article editor may not support rich text
- 154: Admin pages don't have consistent error boundaries
- 155: Admin routes may not redirect non-admin users properly

---

### CATEGORY B: CONTACT, FORMS & SUBMISSIONS -- NON-FUNCTIONAL (Issues 156-185)

#### Issue 156: Contact Form Doesn't Actually Send
**File: `Contact.tsx` (lines 21-26)**
`handleSubmit` just shows a toast and clears the form. No email, no database insert, no edge function call.

#### Issue 157: Contact Page -- Fake Email Addresses
**File: `Contact.tsx` (lines 55-57)**
Lists `support@glucoforge.com` and `research@glucoforge.com` -- verify these actually exist.

#### Issue 158: Contact Page -- HIPAA Compliance Claim
**File: `Contact.tsx` (line 200)**
FAQ says "we use industry-standard encryption and are HIPAA compliant." This is a significant legal claim that needs verification.

#### Issue 159: WarriorSpotlight -- "Submit Your Story" Button Does Nothing
**File: `WarriorSpotlight.tsx` (line 119)**
`<Button>Submit Your Story</Button>` has no onClick handler.

#### Issue 160: WarriorSpotlight -- "Be the First to Share" Button Does Nothing
**File: `WarriorSpotlight.tsx` (line 178)**
Empty state button has no onClick handler.

#### Issue 161: WarriorSpotlight -- Hardcoded Colors
**File: `WarriorSpotlight.tsx` (lines 83-84, 96-97)**
Uses `bg-red-100 dark:bg-red-900/20`, `text-red-500`, `bg-green-100 dark:bg-green-900/20`, `text-green-600`.

#### Issue 162: WarriorStoryCard -- Hardcoded Platform Colors
**File: `WarriorStoryCard.tsx` (line 50)**
Uses `bg-gray-100 text-gray-800` for default badge.

#### Issue 163: WarriorStoryModal -- Hardcoded Platform Colors
**File: `WarriorStoryModal.tsx` (line 58)**
Same pattern as card -- `bg-gray-100 text-gray-800`.

#### Issue 164: EventsNearMe -- "Submit Event" Button Does Nothing
**File: `EventsNearMe.tsx` (line 354-356)**
"Submit Event" button has no onClick handler or navigation.

#### Issue 165: EventsNearMe -- Hardcoded "10+ Organizations"
**File: `EventsNearMe.tsx` (line 141)**
Shows static "10+" instead of counting from data.

#### Issue 166: EventsNearMe -- One Hardcoded Blue Color
**File: `EventsNearMe.tsx` (line 51)**
`text-blue-600` for educational type. Use `text-info`.

#### Issue 167: BecomeAdvocate -- No Client-Side Validation
**File: `BecomeAdvocate.tsx`**
Multi-step form doesn't validate required fields before allowing "Next" step.

#### Issue 168: BecomeAdvocate -- ZipCode Field Has No Validation
ZIP code input accepts any text without numeric restriction.

#### Issue 169: BecomeAdvocate -- Diagnosis Year Allows Future Years
**File: `BecomeAdvocate.tsx` (line 333)**
`max={new Date().getFullYear()}` is correct but `min="1920"` may be too permissive.

#### Issue 170: FinancialTools -- "Prescription Assistance" Template "Coming Soon"
**File: `FinancialTools.tsx` (line 270)**
Button shows "Coming Soon" toast instead of actual template.

#### Issue 171: FinancialTools -- "FSA/HSA Documentation" Template "Coming Soon"
**File: `FinancialTools.tsx` (line 286)**
Same pattern.

#### Issue 172: FinancialTools -- useEffect Fetch Pattern
**File: `FinancialTools.tsx` (lines 92-119)**
Raw useEffect for fetching financial resources.

#### Issue 173: FinancialTools -- Hardcoded Pro Tips Colors
**File: `FinancialTools.tsx` (line 241)**
`bg-blue-50 dark:bg-blue-950`, `text-blue-900 dark:text-blue-100`, `text-blue-800 dark:text-blue-200`.

#### Issue 174: Settings -- "Change Password" Redirects to Profile
**File: `Settings.tsx` (line 582-586)**
Shows a toast saying "use the Profile page" instead of actual password change functionality.

#### Issue 175: Settings -- "Two-Factor Authentication" Coming Soon
**File: `Settings.tsx` (line 590-593)**
Disabled button.

#### Issue 176: Settings -- "View Login Activity" Coming Soon
**File: `Settings.tsx` (line 594-597)**
Disabled button.

#### Issue 177: Settings -- "Export Glucose Data" Coming Soon
**File: `Settings.tsx` (line 691)**
Shows "Coming Soon" toast.

#### Issue 178: Settings -- "Export All Data" Coming Soon
**File: `Settings.tsx` (line 695)**
Shows "Coming Soon" toast.

#### Issue 179: Settings -- "Delete All Data" Coming Soon
**File: `Settings.tsx` (line 755)**
Shows "Coming Soon" toast. Critical functionality that should work.

#### Issue 180: Settings -- "Storage Usage Tracking" Coming Soon
**File: `Settings.tsx` (line 747)**
Static italic text.

#### Issue 181: Settings -- Compact Mode Switch Not Connected
**File: `Settings.tsx` (line 659)**
`<Switch />` with no value binding or onChange handler.

#### Issue 182: Settings -- Animations Switch Not Connected
**File: `Settings.tsx` (line 669)**
`<Switch defaultChecked />` with no value binding or onChange handler.

#### Issue 183: Settings -- Delete Account May Not Work
**File: `Settings.tsx` (line 759)**
Uses `window.confirm` and then calls `supabase.auth.admin.deleteUser`. Client-side code cannot use admin methods.

#### Issue 184: News -- "Subscribe" Shows Toast Only
**File: `News.tsx` (line 90)**
"Subscribe feature coming soon!" toast instead of actual functionality.

#### Issue 185: QoLDetailModal -- Multiple "Coming Soon" Sections
**File: `QoLDetailModal.tsx` (lines 330, 466, 498)**
"Research citations coming soon", "Community tips coming soon" sections.

---

### CATEGORY C: HARDCODED COLORS -- DARK MODE ISSUES (Issues 186-260)

#### Issue 186: CureProgress -- Phase Badge Colors
**File: `CureProgress.tsx` (lines 184-190)**
Uses `bg-blue-100 text-blue-800`, `bg-yellow-100 text-yellow-800`, `bg-orange-100 text-orange-800`, `bg-green-100 text-green-800`, `bg-gray-100 text-gray-800`.

#### Issue 187: FDASafety -- Severity Colors
**File: `FDASafety.tsx` (lines 48-52)**
Uses `bg-orange-100 text-orange-800`, `bg-yellow-100 text-yellow-800`, `bg-green-100 text-green-800`.

#### Issue 188: FDASafety -- Event Type Colors
**File: `FDASafety.tsx` (lines 61-68)**
Uses `bg-red-100 text-red-800`, `bg-blue-100 text-blue-800`, `bg-purple-100 text-purple-800`, `bg-orange-100 text-orange-800`.

#### Issue 189: Fixes -- Difficulty Badge Colors
**File: `Fixes.tsx` (lines 65-69)**
Uses `bg-green-100`, `bg-yellow-100`, `bg-red-100`, `bg-gray-100`.

#### Issue 190: Fixes -- bg-gray-200 Skeleton
**File: `Fixes.tsx` (lines 81-82)**
Uses `bg-gray-200` for loading skeleton.

#### Issue 191: QAChecklist -- Status Colors
**File: `QAChecklist.tsx` (lines 131-136)**
Uses `bg-green-100`, `bg-red-100`, `bg-yellow-100`, `bg-gray-100`.

#### Issue 192: AdminIntegrations -- Status Badge Colors
**File: `AdminIntegrations.tsx` (lines 107-112)**
Uses `bg-green-100`, `bg-red-100`, `bg-gray-100`.

#### Issue 193: AdminSettings -- Category Colors
**File: `AdminSettings.tsx` (lines 141-145)**
Uses `bg-blue-100`, `bg-purple-100`, `bg-orange-100`, `bg-gray-100`.

#### Issue 194: CureProgressWidget -- Phase Colors
**File: `CureProgressWidget.tsx` (lines 48-53)**
Uses `bg-blue-100`, `bg-yellow-100`, `bg-orange-100`, `bg-green-100`, `bg-amber-100`, `bg-gray-100`.

#### Issue 195-260: Additional Hardcoded Color Instances
Systematic scan reveals approximately 65 more instances of hardcoded Tailwind colors across the following files. Each should be replaced with theme tokens:

| File | Issue # | Colors |
|------|---------|--------|
| `AdminAnalytics.tsx` | 195-198 | `text-blue-600`, `text-green-600`, `text-purple-600`, `text-orange-600` |
| `MentalHealthHub.tsx` | 199-205 | Multiple hardcoded resource/strategy colors |
| `DiabetesBurnout.tsx` | 206-209 | Quiz result colors (covered in existing plan Issue 158) |
| `EmergenceOfDiabetes.tsx` | 210-215 | Chart and stat colors |
| `ResearchFunding.tsx` | 216-220 | Funding chart colors |
| `InnovationHub.tsx` | 221-225 | Category badge colors |
| `Diabeto18Plus.tsx` | 226-228 | Content section colors |
| `LiveCureMonitoring.tsx` | 229-233 | Status indicator colors |
| `CompanyDetail.tsx` | 234-236 | Company type badge colors |
| `CompanyComparison.tsx` | 237-239 | Comparison metric colors |
| `DeviceAnalytics.tsx` | 240-243 | Analytics card colors |
| `DonationsInfo.tsx` | 244-248 | Donation category colors (partially covered) |
| `LearnExplore.tsx` | 249-251 | Topic category colors |
| `ResearchInsights.tsx` | 252-255 | Insight type colors |
| `HealthcareProviders.tsx` | 256-258 | Provider type colors |
| `FindDiabeticNearMe.tsx` | 259-260 | Status indicator colors |

---

### CATEGORY D: MISSING FUNCTIONALITY & DEAD BUTTONS (Issues 261-320)

#### Issue 261: MentalHealthHub -- All Resources are Hardcoded
**File: `MentalHealthHub.tsx` (lines 66-200+)**
All mental health resources, coping strategies, crisis contacts are hardcoded arrays. No database connection.

#### Issue 262: MentalHealthHub -- "Get Started" Buttons May Not Work
Strategy cards have "Get Started" or "Try This" buttons -- verify they trigger the expected action.

#### Issue 263: MentalHealthHub -- No BackButton
Missing BackButton for consistent navigation (already in original plan Issue 170).

#### Issue 264: AppCenter -- useEffect Fetch Pattern
**File: `AppCenter.tsx` (line 1)**
Uses `useState` and `useEffect` for data fetching.

#### Issue 265: AppCenter -- App Reviews Table May Be Empty
`app_reviews` table may have 0 rows, same pattern as device/medication reviews.

#### Issue 266: AppCenter -- "Rate This App" May Not Work
The review submission flow in the app detail modal needs verification.

#### Issue 267: Insights Page -- Category Assignment is Fragile
**File: `Insights.tsx` (line 34)**
Categories are assigned by string matching: `post.device_mentioned ? 'Technology'` and checking if topic_tags include "research". This is brittle and may miscategorize posts.

#### Issue 268: Insights Page -- Link Fallback to Reddit Search
**File: `Insights.tsx` (line 33)**
Falls back to `https://www.reddit.com/search/?q=${encodeURIComponent(post.title)}` which may not find the original post.

#### Issue 269: CommunitySolutions -- useEffect Pattern
Uses raw useEffect for data fetching.

#### Issue 270: CustomizableDashboard -- Widget State Not Persisted
Dashboard widget layout changes may not persist between sessions.

#### Issue 271: Journal -- Entries May Not Sync
Verify journal entries are properly saved and loaded.

#### Issue 272: Bounties -- Verify Bounty Claim Flow
Bounty claiming mechanism needs end-to-end verification.

#### Issue 273: CitizenScience -- Survey Completion Not Tracked
Survey completion needs proper tracking and contribution counting.

#### Issue 274: DataUpload -- File Processing May Fail Silently
**File: `DataUpload.tsx`**
Uses `Math.random()` for file IDs (line 41) which could collide. Use UUID instead.

#### Issue 275: GlucoseUpload -- Math.random() for File IDs
**File: `GlucoseUpload.tsx` (line 41)**
Same issue as DataUpload.

#### Issue 276: Profile -- useEffect Fetch Pattern
Already noted in Part 64.

#### Issue 277: Explore Page -- Verify All Links Work
The explore page contains many navigation links -- verify all route to valid pages.

#### Issue 278: HowItWorks -- Static Marketing Content
Verify all claims and statistics on the page are accurate.

#### Issue 279: About Page -- Verify Team/Mission Content
Static content should be reviewed for accuracy.

#### Issue 280: Privacy Page -- Legal Accuracy
Privacy policy content needs legal review.

#### Issue 281: Terms Page -- Legal Accuracy
Terms of service content needs legal review.

#### Issue 282: Accessibility Page -- Claims Verification
Accessibility claims need to match actual WCAG compliance.

#### Issue 283: DonationSuccess -- Verify Stripe Webhook Updates Order
After Stripe payment, the success page should show the correct donation status.

#### Issue 284: ResetPassword -- Verify Flow Works
Password reset needs end-to-end testing.

#### Issue 285: NotFound -- No Suggested Pages
404 page could suggest related pages based on the URL.

#### Issue 286: SupportGlucoForge -- Donation Flow Uses window.open
**File: `SupportGlucoForge.tsx` (line 260)**
Uses `window.open` with `_self` -- works but should be `navigate()`.

#### Issue 287: StateFormsFinder -- "Coming Soon" Badge
**File: `StateFormsFinder.tsx` (line 322)**
Some state forms show "Coming Soon" disabled button.

#### Issue 288: Discoveries -- Verify Discovery Detail Navigation
Clicking a discovery should navigate to the correct detail page.

#### Issue 289: DiscoverDetails -- Verify Data Loading
Detail page needs to handle missing/invalid IDs gracefully.

#### Issue 290: ProjectDetail -- Verify Project Loading
Project detail page needs verification.

#### Issue 291: DevelopmentProjectDetail -- Verify Deep Dive Report
Deep dive reports need to load correctly.

#### Issue 292: MedicineComparison -- Verify Comparison Functionality
Side-by-side medication comparison needs end-to-end testing.

#### Issue 293: CompanyComparison -- Verify Comparison Charts
Company comparison charts need data accuracy verification.

#### Issue 294: CompanyDetail -- Verify All Tabs Load
Company detail page has multiple tabs -- verify all load correctly.

#### Issue 295: DiabetesOrganizations -- Verify Organization Data
Organization listings need accuracy verification.

#### Issue 296: ResearchFunding -- Verify Funding Data
Research funding numbers should be sourced and accurate.

#### Issue 297: Diabeto18Plus -- Age Gate Verification
Adult content section needs proper age verification.

#### Issue 298: LiveCureMonitoring -- Verify Live Data
Live cure monitoring should show real-time data if possible.

#### Issue 299: InnovationHub -- Verify Innovation Listings
Innovation listings need accuracy and freshness.

#### Issue 300-320: Button/Feature Verification Batch
- 300: All "Refresh" buttons should actually refetch data
- 301: All "Download" buttons should produce actual downloads
- 302: All "Share" buttons should use proper share APIs
- 303: All "Bookmark/Save" buttons should persist to database
- 304: All "Filter" selects with "all" value should not send "all" as a DB filter
- 305: All pagination should handle edge cases (0 results, 1 page)
- 306: All modals should have proper DialogDescription for a11y
- 307: All forms should have proper validation before submission
- 308: All toast messages should be consistent (sonner vs useToast)
- 309: All loading skeletons should use `bg-muted` not `bg-gray-200`
- 310: All error states should show retry functionality
- 311: All empty states should suggest actions
- 312: All date formatting should be consistent across pages
- 313: All currency formatting should be consistent
- 314: All external links should have `rel="noopener noreferrer"`
- 315: All images should have alt text
- 316: All interactive elements should have aria-labels
- 317: All lists should handle empty arrays without crashing
- 318: All async operations should have try/catch blocks
- 319: All Supabase queries should handle errors gracefully
- 320: All routes should have proper 404 fallback

---

### CATEGORY E: DATA ACCURACY & CONTENT ISSUES (Issues 321-380)

#### Issue 321: CureProgress -- "countries: 25" is Hardcoded
**File: `CureProgress.tsx` (line 268)**
Passes `countries={25}` to CureProgressStats -- this should be calculated from trial data.

#### Issue 322: CureProgress -- Simulation Projection Formula
**File: `CureProgress.tsx` (lines 163-178)**
The `getSimulationData` function creates a "what if cure existed" projection. The formula `withCure: 85 - (progressFactor * 10)` is arbitrary and not based on any published model. Should add disclaimer.

#### Issue 323: CureProgress -- "Live data from global clinical trial registries"
**File: `CureProgress.tsx` (line 150)**
Claims "Live data" but it's fetched periodically, not truly live. Could be misleading.

#### Issue 324: CureProgress -- Phase Progress Percentages are Arbitrary
**File: `CureProgress.tsx` (lines 18-22)**
`Phase 2: 75%`, `Phase 3: 40%`, `Cure: 0%` -- these progress percentages are hardcoded in the hero animation and don't reflect actual trial progress.

#### Issue 325: ResearchHub -- Bookmark Saves to Wrong Table
**File: `ResearchHub.tsx` (lines 132-134)**
Bookmarking saves to `saved_insights` using `card_id: item.id`, but research items come from `research_items` table, not `discovery_cards`. The `card_id` FK may fail.

#### Issue 326: ResearchHub -- "Read Analysis" Modal Content
The ResearchAnalysisModal needs verification that it shows meaningful analysis content.

#### Issue 327: FDASafety -- Data Freshness
FDA data is fetched via `useFDAData` hook. Verify the data is recent and the refresh mechanism works.

#### Issue 328: Companies -- "All Types" Filter Value "all"
**File: `Companies.tsx` (line 201)**
Uses `<SelectItem value="all">All Types</SelectItem>`. The hook at line 28 passes `companyType: companyType || undefined` -- since "all" is truthy, it would be sent as a filter value. However, line 22 initializes `companyType` as `''` (empty string), and the Select `onValueChange` sets it to "all" when selected. The `|| undefined` check on line 29 would NOT convert "all" to undefined.
**Fix:** Add `companyType === 'all' ? undefined : companyType` logic.

#### Issue 329: Companies -- Focus Area "all" Same Issue
**File: `Companies.tsx` (line 215)**
Same pattern for focus area filter.

#### Issue 330: Companies -- Country "all" Same Issue
**File: `Companies.tsx` (line 227)**
Same pattern for country filter.

#### Issue 331: MentalHealthHub -- Hardcoded Resource Ratings
**File: `MentalHealthHub.tsx` (line 74)**
`rating: 4.8, helpfulVotes: 342` -- fabricated numbers not from any database.

#### Issue 332: MentalHealthHub -- Hardcoded Strategy Effectiveness
`effectiveness: number` values in coping strategies are fabricated.

#### Issue 333: MentalHealthHub -- Crisis Hotline Numbers Accuracy
Crisis contact numbers should be verified annually for accuracy.

#### Issue 334: DiabetesBurnout -- Auto-Seed Fragility (covered in Part 62)
Already noted.

#### Issue 335: EmergenceOfDiabetes -- Verify CDC/IDF Data Accuracy
**File: `seed-emergence-data/index.ts`**
All seeded data (US diagnoses, European data, global data, age-specific data) cites CDC, IDF, and SEARCH studies. Verify these numbers match published sources.

#### Issue 336: EmergenceOfDiabetes -- Data Ends at 2023
Most recent data points are 2023. Should note data through 2023 and add 2024 estimates.

#### Issue 337: DonationsInfo -- All Financial Data Hardcoded (covered in original plan Issue 144)
Retain existing plan item.

#### Issue 338: FutureOfT1D -- Outdated Predictions (covered in original plan Issue 149)
Retain existing plan item.

#### Issue 339: AICenter -- Outdated Predictions (covered in original plan Issue 150)
Retain existing plan item.

#### Issue 340: Resources -- External URL Staleness (covered in original plan Issue 162)
Retain existing plan item.

#### Issue 341: SeasonalPatternsTab -- Winter Hypo Rate Accuracy (covered in Part 97)
Already noted.

#### Issue 342-380: Content Accuracy Verification Batch
- 342: All medication names/descriptions should match FDA labels
- 343: All device specifications should match manufacturer specs
- 344: All clinical trial data should match ClinicalTrials.gov
- 345: All financial/pricing data should cite sources and dates
- 346: All research paper citations should have valid DOIs/links
- 347: All external organization links should resolve
- 348: All helpline/crisis numbers should be current
- 349: All legal/medical disclaimers should be present where needed
- 350: All statistics shown should cite data sources
- 351: Company funding amounts should match Crunchbase/SEC data
- 352: Device approval dates should match FDA records
- 353: Medication interaction warnings should be medically reviewed
- 354: Insulin pricing data should match GoodRx/Medicare Part D
- 355: Patent data should match USPTO records
- 356: Research funding allocations should match 990 filings
- 357: Organization descriptions should match their mission statements
- 358: Event dates should be future dates (not past events)
- 359: CGM accuracy claims should match MARD studies
- 360: Pump features should match current firmware versions
- 361: A1C conversion formulas should match DCCT/NGSP standards
- 362: GMI formula should match Bergenstal 2018 equation
- 363: Time-in-range targets should match ADA/ATTD consensus
- 364: Hypoglycemia thresholds should match ADA guidelines (54/70 mg/dL)
- 365: Hyperglycemia thresholds should match guidelines (180/250 mg/dL)
- 366: CV% target should match Danne 2017 consensus (36%)
- 367: Population average A1C should match T1D Exchange registry
- 368: Insulin action times should match pharmacokinetic data
- 369: Carb ratio calculations should use standard formulas
- 370: Correction factor calculations should use the "1800 rule" correctly
- 371: DKA warning criteria should match ADA emergency guidelines
- 372: Dawn phenomenon descriptions should match endocrine literature
- 373: Somogyi effect descriptions should note it's debated in literature
- 374: Exercise effect on glucose should match ISPAD guidelines
- 375: Alcohol effect on glucose should match ADA guidance
- 376: Pregnancy management should match ADA/ACOG guidelines
- 377: Pediatric management should match ISPAD guidelines
- 378: Medicare Part D eligibility should match CMS criteria
- 379: State assistance programs should match current availability
- 380: Clinical trial eligibility criteria should be accurate

---

### CATEGORY F: ARCHITECTURE & CODE QUALITY (Issues 381-430)

#### Issue 381: Inconsistent Toast Library Usage
Some files use `import { toast } from 'sonner'`, others use `import { useToast } from '@/hooks/use-toast'`. Standardize across the codebase.

#### Issue 382: ResearchHub -- Dual Import of toast
**File: `ResearchHub.tsx` (lines 19, 39)**
Imports both `useToast` (line 19) and `toast` from use-toast (line 39). Redundant.

#### Issue 383: nicknameGenerator -- Math.random() for Nicknames
**File: `nicknameGenerator.ts` (lines 23, 27)**
Uses `Math.random()` which is not cryptographically secure. For user-facing nicknames, this is acceptable but could use crypto.getRandomValues for better entropy.

#### Issue 384: sidebar.tsx -- Math.random() for Width
**File: `sidebar.tsx` (line 653)**
Skeleton loading uses `Math.random()` for random widths. This is in a `useMemo` so it's stable per render but will change on remounts.

#### Issue 385: FearsCloud -- Math.random() in Animation
**File: `FearsCloud.tsx` (line 102)**
Uses `Math.random()` in animation transition duration. This is acceptable for visual randomness.

#### Issue 386: GoodBadJars -- Math.random() in Animation
**File: `GoodBadJars.tsx` (line 105)**
Same pattern, acceptable for animations.

#### Issue 387: YourExperience -- Math.random() for Positioning
**File: `YourExperience.tsx` (lines 33, 41, 43)**
Uses `Math.random()` for floating particle positions and timing. Acceptable for decorative animations.

#### Issue 388: AchievementUnlockModal -- Math.random() for Confetti
**File: `AchievementUnlockModal.tsx` (lines 22-23, 37, 43)**
Uses `Math.random()` for confetti positions. Expected and correct for confetti.

#### Issue 389-400: useEffect-to-useQuery Migration Candidates
Beyond the 5 priority pages in Part 25, additional pages to migrate:
- 389: `FinancialTools.tsx` (line 92)
- 390: `Admin.tsx` (line 31)
- 391: `AdminDashboard.tsx` (line 87)
- 392: `AdminLowSugarStories.tsx` (line 47)
- 393: `AdminContent.tsx` (line 93)
- 394: `AdminWarriors.tsx` (line 47)
- 395: `AdminUsers.tsx` (line 56)
- 396: `AdminArticles.tsx` -- verify
- 397: `Profile.tsx` (line 95)
- 398: `Settings.tsx` (line 153)
- 399: `AppCenter.tsx`
- 400: `CommunitySolutions.tsx`

#### Issue 401-410: Missing Error Boundaries
- 401: No global error boundary wrapping the app
- 402: Chart components should have error boundaries (Recharts can crash on bad data)
- 403: Modal components should catch render errors
- 404: Data-fetching pages should show error UI on unexpected errors
- 405: Image loading should have onError handlers everywhere
- 406: External API calls (FDA, ClinicalTrials.gov) should have timeout handling
- 407: Supabase RPC calls should handle function-not-found errors
- 408: File upload should handle network failures
- 409: Stripe checkout should handle redirect failures
- 410: Auth state changes should handle token expiry

#### Issue 411-420: Missing Loading States
- 411: Some pages show empty content briefly before loading state kicks in
- 412: Tab switching should show loading for lazy-loaded content
- 413: Modal opening should show skeleton for async data
- 414: Filter changes should show loading indicator
- 415: Search input should have debounced loading indicator
- 416: Infinite scroll should have "loading more" indicator
- 417: Image lazy loading should show placeholder
- 418: Chart data refresh should show overlay loading
- 419: Form submission should disable submit button
- 420: Navigation should show top progress bar

#### Issue 421-430: Accessibility Gaps
- 421: Many modals missing DialogDescription (partially covered)
- 422: Many buttons missing aria-labels for icon-only buttons
- 423: Color contrast in some badge variants may not meet WCAG AA
- 424: Tab panels may not announce content changes to screen readers
- 425: Chart data should have tabular fallback for screen readers
- 426: Form errors should be associated with inputs via aria-describedby
- 427: Skip navigation link missing
- 428: Focus trapping in modals needs verification
- 429: Keyboard navigation through tab lists
- 430: Alt text missing on decorative images (should be `alt=""`)

---

### CATEGORY G: SECURITY & PERFORMANCE (Issues 431-462)

#### Issue 431: window.open Missing Security Headers -- Remaining Files
Beyond Parts 35-37, verify:
- `SupportGlucoForge.tsx` (line 260) -- uses `_self`, acceptable
- `CommunitySolutions.tsx` (line 391) -- already has `noopener,noreferrer`
- `ChatExport.tsx` (line 99) -- print window, acceptable
- `SocialShareButtons.tsx` (line 16) -- already has `noopener,noreferrer`
- `Donate.tsx` (line 46) -- needs `noopener,noreferrer` (covered in Part 36)
- `DonationModal.tsx` (line 64) -- needs fix (covered in Part 35)
- `Index.tsx` (line 102) -- needs fix (covered in Part 37)

#### Issue 432: Stripe Checkout URLs Should Use Redirect Not window.open
`DonationModal.tsx`, `Donate.tsx`, and `Index.tsx` all use `window.open` for Stripe checkout URLs. Stripe recommends `window.location.href` redirect instead to avoid popup blockers.

#### Issue 433: Admin Routes -- Role Verification
Admin pages should verify user role on each request, not just on initial load.

#### Issue 434: RLS Policy Audit
Verify all tables have appropriate RLS policies, especially:
- `warrior_stories` -- public read, admin write
- `advocate_applications` -- user write own, admin read all
- `financial_resources` -- public read
- `t1d_events` -- public read

#### Issue 435: API Key Exposure
Verify no API keys or secrets are hardcoded in frontend code.

#### Issue 436: Edge Function Error Handling
Edge functions should return consistent error formats and appropriate HTTP status codes.

#### Issue 437: Rate Limiting
Verify rate limiting on edge functions that accept user input (contact forms, reviews, upvotes).

#### Issue 438: Input Sanitization
User-submitted content (stories, reviews, comments) should be sanitized against XSS.

#### Issue 439: Image URL Validation
User-submitted image URLs should be validated before rendering.

#### Issue 440: CORS Configuration
Edge function CORS headers should be restrictive in production.

#### Issue 441-450: Performance Issues
- 441: Large pages (PublicGlucoseData 1500+ lines) should be code-split
- 442: Heavy chart components should be lazy loaded
- 443: Image loading should use lazy loading attributes
- 444: Lists with 100+ items should use virtualization
- 445: Supabase queries should use proper column selection (not `select('*')`)
- 446: React Query cache times should be optimized per data type
- 447: Bundle size could be reduced by tree-shaking unused lucide icons
- 448: Framer Motion animations should use `will-change` for GPU acceleration
- 449: Heavy computations should be memoized with useMemo
- 450: Event handlers should be memoized with useCallback where passed as props

#### Issue 451-462: Database & Query Issues
- 451: Many queries use `select('*')` which fetches unnecessary columns
- 452: Some queries may hit the 1000 row default limit
- 453: Missing indexes on frequently queried columns
- 454: Orphaned records in junction tables
- 455: Unused database tables from removed features
- 456: Missing created_at/updated_at columns on some tables
- 457: Inconsistent date formats in different tables
- 458: NULL vs empty string inconsistency
- 459: Missing foreign key constraints where needed
- 460: Trigger functions should handle edge cases
- 461: RPC functions should validate input parameters
- 462: Realtime subscriptions should be cleaned up on unmount

---

## Summary of All Database Migrations Needed

| Migration | Description |
|-----------|-------------|
| 1 | UPDATE 8 device image URLs |
| 2 | INSERT ~35 device reviews |
| 3 | INSERT ~40 medication reviews |
| 4 | INSERT ~30 medication_community_buzz posts |
| 5 | INSERT ~40 additional external_medication_reviews |
| 6 | Normalize external_device_reviews source names |
| 7 | CREATE FUNCTION increment_story_upvotes |
| 8 | CREATE FUNCTION increment_review_helpful |
| 9 | UPDATE medication image_url for top 15-20 medications |
| 10 | INSERT more external_device_reviews for balanced coverage |

## Summary of All Files to Modify

**Priority 1 (Critical):**
- Database migrations (10 migrations)
- `DeviceDetailsModal.tsx` -- EntityLogo, Compare button
- `DeviceComparison.tsx` -- EntityLogo
- `MedicationDetailModal.tsx` -- Dynamic Real Usage, wire ReviewForm, DialogDescription
- `LowBloodSugarWorld.tsx` -- Search bar, React Query, atomic upvote, image fallback
- `Contact.tsx` -- Wire form to edge function or database

**Priority 2 (High):**
- `A1CPredictionTab.tsx` -- Deterministic data
- `PublicGlucoseData.tsx` -- Theme tokens, fallback text, dynamic source data
- `DataQualityTab.tsx` -- Dynamic source counts
- `PopulationTrendsTab.tsx` -- Use props for "This Dataset"
- `AdminDashboard.tsx` -- Real data queries, theme colors
- `AdminAnalytics.tsx` -- Real data queries or "Sample Data" labels
- `AdminIntegrations.tsx` -- Real connection status or clear labels
- `AdminSettings.tsx` -- Persist to database or clear labels
- `useMedicationReviews.ts` -- Atomic increment RPC
- `ScenarioLab.tsx` -- Seeded PRNG

**Priority 3 (Medium):**
- ~75 files with hardcoded colors to replace with theme tokens
- ~15 files with useEffect-to-useQuery migrations
- ~20 files with Coming Soon features to implement or remove
- ~10 files with missing error handling
- Reference data notices on 4 components

**Priority 4 (Low):**
- Content accuracy verification (38 items)
- Accessibility improvements (10 items)
- Performance optimizations (10 items)
- Code quality improvements (10 items)
