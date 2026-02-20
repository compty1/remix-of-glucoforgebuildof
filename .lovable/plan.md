
# Comprehensive Fix Plan: Data Upload (50+ Issues), Reviews (50+ Issues), and Other Gaps (200+ Issues)

## Executive Summary

After exhaustive review of the codebase, I have identified **300+ specific issues** across three major domains:
- **Data Upload**: 52 issues in the upload pipeline, edge function, analysis components, and UI
- **Reviews System**: 51 issues across device reviews, medication reviews, external reviews, and display
- **All Other Gaps**: 200+ issues spanning routing, UI consistency, security, accessibility, and more

---

## SECTION A: DATA UPLOAD — 52 Issues

### A1. Duplicate Upload Pages (Critical)

**Issue 1**: Two separate upload pages exist: `/data-upload` (`DataUpload.tsx`) and `/glucose/upload` (`GlucoseUpload.tsx`). They are different implementations with different capabilities. The glucose upload page is inferior — it has no drag-and-drop, no analysis modal, no file type icons, no data freshness badges, and claims 50MB limit while the real function enforces 10MB.

**Issue 2**: `GlucoseUpload.tsx` line 57 calls `file.text()` for ALL file types including binary PDFs, Excel, and images. This silently corrupts binary files before they reach the edge function, causing analysis failures.

**Issue 3**: `GlucoseUpload.tsx` says "up to 50MB" in the UI but the edge function `DataUpload.tsx` enforces 10MB. Users uploading through `/glucose/upload` will fail on binary files without a helpful error.

**Fix**: Merge `/glucose/upload` into `/data-upload` with a redirect. Delete the inferior GlucoseUpload.tsx implementation.

### A2. Edge Function — `analyze-glucose` Issues

**Issue 4**: Line 700 has `console.log` leaking data: `Rejecting reading with impossible year: ${year}` — exposes internal logic in production logs.

**Issue 5**: Line 709 logs `Date validation: ${readings.length} input -> ${validated.length} valid` — production log leak.

**Issue 6**: Line 760 logs extensive text quality analysis details including `alphaRatio`, keyword counts, and raw text samples — security risk.

**Issue 7**: Line 1003 logs `Using AI Vision to extract PDF content...` and line 1076 `Vision API response:` with up to 500 chars of response content — PII risk if the PDF contains patient names.

**Issue 8**: Line 1178 logs `Legacy extraction: ${extractedText.length} chars` and 1177 also logs extracted text length.

**Issue 9**: The AGP data generation at line 1818-1826 is mathematically incorrect. It fakes p5 and p95 by multiplying p90 by 1.1 and avg by 0.85, instead of computing actual percentiles from raw data. This produces a misleading Ambulatory Glucose Profile chart.

**Issue 10**: The rate limiter (lines 13-30) uses an in-memory `Map` which is reset every time the edge function cold starts. On Deno edge functions, cold starts happen frequently. This means rate limiting is not persistent and provides no real protection.

**Issue 11**: The `validateBodySize` function (referenced in memory notes) is not implemented in `analyze-glucose`. Large payloads can crash the function or consume excessive resources.

**Issue 12**: The `analyzeRequestSchema` (line 32-36) only validates `filename`, `fileContent`, and `uploadId`. There is no validation on `fileContent` length, so users can send arbitrarily large strings.

**Issue 13**: Line 2286 — after PDF detection fails all methods, the error response does not update the upload record to `error` status in the final `else` branch (line 2616 fallback), leaving orphaned `processing` records.

**Issue 14**: The `parseCSV` function (line 1318) does not handle the Windows-style `\r\n` line endings in a tab-delimited case. It splits by `\n` only, which is fine for most files but some Dexcom exports use tab-separated values. No tab delimiter detection exists.

**Issue 15**: The Excel parser (line 1465) imports SheetJS from a CDN (`cdn.sheetjs.com`) at runtime. If this CDN is down, all Excel uploads silently fail with a catch block that just returns an empty array.

**Issue 16**: The XML parser (line 1530) uses string regex matching which fails for CDATA sections or complex nested XML from certain pump manufacturers (e.g., Medtronic CareLink XML which has a complex schema).

**Issue 17**: `generateAGPData` (line 1818) creates fake percentiles from `p10`, `p25`, `p50`, `p75`, `p90` stat values, but stores them as if they were independent data. The AGP chart will show incorrect confidence bands for any file type.

**Issue 18**: The `MAGE` calculation (line 1868) uses simple peak/nadir excursion counting but incorrectly tracks both upward and downward excursions as "peak-nadir" which inflates MAGE for stable signals.

**Issue 19**: The `detectMissedBoluses` function (line 444) returns a maximum of 10 events and skips 10 readings (`i += 10`) after each detection. For dense CSV data (288 readings/day), this can skip entire meal periods.

**Issue 20**: In `generateExecutiveSummary` (line 591), when `confidenceScore` is undefined or 0 (summary reports), `encouragement` still runs using `analysis.timeInRange` which defaults to 0, always showing the worst encouragement message.

**Issue 21**: `analyzeGlucoseDataComprehensive` at line 2246 calls `validateAnalysisResults` which caps `daysOfData` at 365, but the check is `> 365 * 5` (1825 days). Any upload spanning 1-5 years would show incorrect day counts.

**Issue 22**: The `GVI` (Glycemic Variability Index) calculation at line 2173-2178 assumes a constant 5 mg/dL delta between readings regardless of sampling interval. For 15-minute interval data, this produces a GVI that's 3x inflated compared to 5-minute interval data.

**Issue 23**: After creating journal entries from patterns (line 2678-2696), the response at line 2740-2753 does NOT include the `confidenceScore`, `confidenceBand`, `validationFlags`, `dataQuality`, `novelSignals`, `executiveSummary`, or `dayNightAnalysis` fields. These are stored in the database but never returned to the client in the initial upload response, requiring a page reload to see them.

**Issue 24**: The function uses `supabase.auth.getUser(token)` at line 2657 to extract userId for journal entries. If authentication fails, it silently skips journal entry creation (good) but also logs `Could not get user from token for journal entries` — another production log leak.

### A3. DataUpload.tsx UI Issues

**Issue 25**: The `processFile` function at line 185 determines file type: `file.name.includes('.csv') ? 'cgm' : 'pump'`. All non-CSV files are labeled "pump" regardless of whether they are PDFs, images, or Excel files.

**Issue 26**: The Download button at lines 461-465 (`<Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>`) has no `onClick` handler and no `aria-label`. It appears clickable but does nothing.

**Issue 27**: The "Connect CGM App", "Schedule Auto-Upload", "Share with Doctor", and "Export Analysis" Quick Actions buttons (lines 518-537) are all disabled with "Soon" badges — but the Export functionality IS already implemented via the `DataExport` component and should not be listed as "Coming Soon".

**Issue 28**: The upload date formatting at line 111 stores just the date string from `toISOString().split('T')[0]` but then at line 507 re-parses it with `new Date(uploadedFiles[0].uploadDate).toLocaleDateString()`. This double-conversion can cause timezone offset issues where the date shows one day earlier for users in UTC-offset timezones.

**Issue 29**: The `ALLOWED_EXTENSIONS` check at line 176 uses `.webp` but the file input `accept` attribute at line 368 uses `.png,.jpg,.jpeg` without `.webp`. Users cannot select `.webp` via browser dialog even though it's supported.

**Issue 30**: The "Recent Uploads" section has no empty state when the user has zero uploads — it just renders an empty card with no content.

**Issue 31**: The uploads are fetched with `.limit(10)` but there is no "load more" or pagination. Users with more than 10 uploads cannot see older ones.

**Issue 32**: There is no delete button on uploaded files. Users can submit reviews or journal entries but cannot remove an individual upload from the list.

**Issue 33**: The "processing" state shows a full-width pulsing progress bar but no time estimate or cancel option. For large files that can take 30+ seconds, there's no feedback on whether it's stuck.

**Issue 34**: After a failed upload (status `error`), there is no "Retry" button. The user must re-upload the file from scratch.

**Issue 35**: The `Your Data Summary` sidebar shows "Total Files" but this counts ALL files including ones with error status, which is misleading.

### A4. AnalysisResultsModal Issues

**Issue 36**: The `exportReport` function (line 186) generates a basic PDF using jsPDF but only includes Key Metrics, Patterns, and Recommendations. It does NOT include the AGP chart, the hourly heatmap, the TIR breakdown, or the day/night comparison — all of which are visible in the modal.

**Issue 37**: The AGP tab (line 436-451) shows a `Skeleton` when `agpData` is empty/null. For summary reports (PDFs/images), `agpData` is always `[]`, so the Skeleton shows permanently with no message explaining why.

**Issue 38**: The Trends tab (line 453-468) duplicates the GlucoseTrendChart and GlucoseHeatmap that already appear in the Overview tab. Users see the same charts twice.

**Issue 39**: The modal has no loading state between when it opens and when data is available. If a user clicks "View Analysis" immediately after upload completes, there may be a flash of empty content.

**Issue 40**: The "Export Report" button at the bottom of the modal and the `DataExport` component in the main upload list both export data — there are two separate export implementations with different features and formats. The modal export is simpler and doesn't support CSV/JSON.

**Issue 41**: The `isFromSummary` notice (line 342-349) shows for all summary reports but uses the same blue accent styling as informational notices, not clearly distinguishing between "limited data" and "error". A warning icon should be used.

**Issue 42**: The `confidenceBand` type is `ConfidenceBand | undefined`, but the TypeScript check `confidenceBand !== 'unknown'` (line 184) doesn't narrow the type — `confidenceBand` can be `undefined` and the badge will still try to render.

### A5. Supporting Component Issues

**Issue 43**: `GlucoseMetricsGrid` at line 91-243 — When `gmi = 0` (which happens for all summary reports where GMI isn't extracted), it shows `0.0%` with a danger status. Zero is not a valid GMI. Should show `N/A`.

**Issue 44**: `HealthComparisonPanel` compares user data against "non-diabetic benchmarks" (e.g., TIR 96-99%, avg glucose 85-100 mg/dL) for T1D patients. These targets are unachievable with T1D. The comparison should use T1D-appropriate ADA targets (TIR ≥70%, not 96%).

**Issue 45**: The supplement recommendations in `HealthComparisonPanel` are hardcoded regardless of user data. The "For you" personalization note is generated with simple `userGMI > 7` checks but the supplement list itself is static — meaning every user sees the same 6 supplements.

**Issue 46**: `DataExport.tsx` line 139 has `console.error('PDF export error:', error)` — a production console leak.

**Issue 47**: `DataExport.tsx` line 149-174 — the CSV export uses `analysisData.dailyData` but does not URL-encode the CSV content. If the data contains commas (unlikely but possible for notes fields), the CSV will be corrupted.

**Issue 48**: `TrendPrediction.tsx` always shows at least one prediction ("General Monitoring") even when there is no data. This is technically correct but confusing for summary reports where `hourlyStats` is an empty array.

**Issue 49**: `WeekdayComparisonChart` is imported and used but the component name doesn't match its actual purpose — it compares weekday vs weekend data by day-of-week, but the tab label says "Days" which is ambiguous.

**Issue 50**: The "Health" tab in `AnalysisResultsModal` always shows all supplement recommendations even for summary PDF uploads where `detailedAnalysis` only has 3-4 fields. The supplement personalization logic reads undefined values as 0, triggering worst-case recommendations.

**Issue 51**: `DataExport.tsx` renders a `Download` button that opens a `Dialog` but the trigger button is separate from the disabled "Export Analysis" button in the Quick Actions sidebar. This creates two separate export entry points that can confuse users.

**Issue 52**: The `analyze-glucose` function response at line 2740 does NOT return `executiveSummary` in the JSON payload, even though it's calculated and stored in the DB. The modal would need to fetch from DB to show it after first load.

---

## SECTION B: REVIEWS — 51 Issues

### B1. Medication Reviews — MedicationDetailModal

**Issue 53**: The "Real Usage" tab (lines 289-355) contains **100% hardcoded data**:
  - "78% positive" is a static string
  - "Injection site reactions or stinging" is hardcoded for ALL medications
  - "Cost concerns" and "Storage requirements" are generic complaints for ALL medications
  - "Before meals / At consistent times daily" is shown for ALL medication types

**Issue 54**: The "Real Usage" tab has a disclaimer: "Data aggregated from community forums, patient surveys, and public health databases." — but this is false. All data is hardcoded. This is a compliance/trust issue.

**Issue 55**: The medication reviews list (lines 426-460) shows reviews in a plain `div` without a `ScrollArea`. If a medication has many reviews, the modal dialog grows past the viewport without scrolling.

**Issue 56**: The "Write Review" functionality is missing from the medication modal. Users can read reviews but cannot submit one. The `useMedicationReviews` hook (`src/hooks/useMedicationReviews.ts`) exists with `submitReview`, `updateReview`, `deleteReview`, `toggleHelpful` — but none of these are wired into `MedicationDetailModal`.

**Issue 57**: The `toggleHelpful` in `useMedicationReviews.ts` (lines 106-124) manually reads and increments `helpful_count` without using an atomic database function. A `increment_review_helpful` RPC function already exists in the database but is not being used.

**Issue 58**: The medication modal tab grid uses `grid-cols-6` (line 58) which on mobile creates 6 tiny tabs that overlap and become unreadable. No responsive breakpoints exist.

**Issue 59**: External medication reviews in the modal (lines 462-490) are sliced to `externalReviews.slice(0, 5)` with no "Load More" button.

**Issue 60**: The `externalReviews` field in `MedicationDetailModal` is populated from `useMedicationDetails` which fetches from both `external_medication_reviews` AND `medication_community_buzz` tables and combines them. The combined array is sorted by `helpful_count` but community buzz posts use `engagement_score` as `helpful_count`, which may be orders of magnitude larger than actual helpful counts, pushing buzz posts to the top.

**Issue 61**: Medication review ratings in the modal render stars with: `i < (review.rating || 0)`. If `review.rating` is `null`, zero stars show with no indication that the rating is missing.

**Issue 62**: The medication modal has no sorting or filtering on the reviews tab. Users cannot sort by rating, recency, or helpfulness.

**Issue 63**: There is no pagination on the reviews tab — all reviews render at once with no limit, which could be slow for popular medications.

### B2. Device Reviews — DeviceReviewsTab

**Issue 64**: `useDeviceReviews.ts` has `console.error('Error fetching device reviews:', err)` at line 143 — production leak.

**Issue 65**: `useDeviceReviews.ts` has `console.error('Error submitting review:', err)` at line 184, `console.error('Error updating review:', err)` at line 216, `console.error('Error deleting review:', err)` at line 241, `console.error('Error toggling helpful vote:', err)` at line 281 — 4 production log leaks.

**Issue 66**: The `UserReviewCard` component is referenced but the file path `src/components/device/UserReviewCard.tsx` was not directly reviewed. If it shows reviewer names without anonymization, this is a privacy issue since `display_name` from profiles is used.

**Issue 67**: `DeviceReviewsTab` has `visibleCount` initialized to 10 and loads 10 more on each "Load More" click. But the initial `useDeviceReviews` fetch has no server-side limit — it fetches ALL reviews for the device. Large review sets will over-fetch.

**Issue 68**: The `sentimentFilter` in `DeviceReviewsTab` applies to both the `posts` (community) array AND `externalReviews` separately, but the "Filters" section UI shows one shared filter bar. Users may not realize the filter applies to all sections simultaneously.

**Issue 69**: The `combinedStats` at line 134-139 adds `reviewStats.positive` (community posts) + `externalStats.positive` (external reviews) as one total sentiment count. But `reviewStats` comes from `communityPosts` which is separate from `externalReviews`. The total count shown in the "Community Buzz" tab header is correct, but the breakdown in the sentiment cards adds disparate data sources without labeling them.

**Issue 70**: `ExternalReviewCard` is used for device reviews but there's no equivalent for displaying both external medication reviews AND user medication reviews in a unified consistent style.

**Issue 71**: The `DeviceReviewsTab` component requires `deviceId` prop but it's typed as `string | undefined`. If `deviceId` is undefined, `useDeviceReviews` returns empty but `useExternalReviews` also silently returns empty with no error. The user sees "No Reviews Yet" with no explanation.

**Issue 72**: The Google reviews shown in the `external_device_reviews` table appear in `DeviceReviewsTab` under "External Reviews". However, for medications, the equivalent section is labeled "Community Feedback" — inconsistent terminology between device and medication review UIs.

**Issue 73**: The `getSourceBadge` function in `DeviceReviewsTab` has `'google': 'bg-success/10 text-success border-success/20'` but Google reviews use a 5-star rating system while Reddit posts use upvote scores. These are displayed in the same list without distinguishing the rating system.

**Issue 74**: Device reviews allow users to vote `helpful` (toggle), but medication reviews use a simple increment-only mechanism from `useMedicationReviews.ts` (lines 106-124). The toggle (idempotent) behavior is inconsistent between devices and medications.

### B3. External Review Display Issues (Both Systems)

**Issue 75**: The `useExternalReviews` hook fetches from `external_device_reviews` but has no `staleTime` configuration. Every time the device detail page is opened, it re-fetches all external reviews even if they haven't changed in hours.

**Issue 76**: External reviews show `source_url` as a direct link button (lines 390-396 in medication modal). These URLs are fetched from the database and may be dead links. The `verify-external-links` edge function exists but the link health status is not checked before rendering. Dead links show the same UI as live links.

**Issue 77**: The `ExternalReviewCard` in `DeviceReviewsTab` renders in a `<div>` grid without any `aria-label` or semantic role. Screen readers cannot distinguish individual review cards.

**Issue 78**: In `MedicationDetailModal`, external reviews are filtered by a hardcoded `.slice(0, 5)`. There is no sentiment filter, source filter, or sort control on this tab — unlike the device reviews tab which has full filter controls.

**Issue 79**: The `source` display name mapping in `DeviceReviewsTab` at line 116-131 handles specific sources but falls back to `source.charAt(0).toUpperCase()`. New sources added to the database without a mapping entry will display raw lowercase database source names.

**Issue 80**: Seeded external reviews (from `seed-medication-reviews`, `seed-device-reviews-extended` edge functions) are flagged as coming from "Reddit" but have fabricated `source_url` values. These show a "View original post" link that leads to a Reddit search page rather than the actual post, which users will find confusing.

**Issue 81**: The `helpful_count` for external medication reviews comes from the `engagement_score` field of `medication_community_buzz` posts. `engagement_score` can be 0 to 10000+. When displayed alongside `medication_reviews.helpful_count` (which starts at 0), the buzz posts dominate the sorting and appear to have thousands of helpful votes when they actually just have high engagement scores.

**Issue 82**: No verification badge is shown for medication reviews even though the `verified` field exists in `medication_reviews`. The device reviews table has `verified_owner` but it's also never displayed.

**Issue 83**: Medication reviews with `would_recommend: false` are shown without any visual indicator — a downvote or "would not recommend" badge should be prominent.

**Issue 84**: There is no "reported" or "flag as inappropriate" functionality for any review type — device, medication, or external.

**Issue 85**: The `duration_of_use` field (time user has used the medication/device) is only shown for medication reviews but not device reviews, even though the device review schema has `ownership_duration`.

**Issue 86**: Medication review `pros` and `cons` are stored as arrays but only display the raw content text in the modal — the structured pros/cons are never rendered with checkmarks or X icons like they are in device reviews.

**Issue 87**: The `MedicationDetailModal` tabs include "Clinical", "Pricing", and "Real Usage" but the "Reviews" tab is the last tab (6th). Standard UX practice places reviews before clinical/pricing details since most users prioritize community feedback.

**Issue 88**: Device review form (`UserReviewForm`) has a character limit on content but medication reviews have no max length enforcement in the UI — only a database-level constraint.

**Issue 89**: A user who has already submitted a device review sees their review in the list but the "Write Review" form is hidden (replaced by their existing review). However, there's no clear "Edit My Review" call-to-action — the edit button is buried within the `UserReviewCard`.

**Issue 90**: The device review `pros` and `cons` fields accept an array of strings in the form, but the UI for adding pros/cons doesn't enforce a minimum entry — users can submit empty string array items.

**Issue 91**: `useMedicationReviews.ts` line 37 `console.error("Error submitting review:", error)` — production leak. Line 58 `console.error("Error updating review:", error)` — production leak. Line 75 `console.error("Error deleting review:", error)` — production leak.

**Issue 92**: The `toggleHelpful` in `useMedicationReviews.ts` has a race condition: it reads `helpful_count`, adds 1, and writes back. Two concurrent clicks produce duplicate increments. The `increment_review_helpful` RPC function should be used instead.

**Issue 93**: `useMedicationDetails.ts` line 63 `console.error("Error fetching medication:", medError)`, line 77 `console.error("Error fetching user reviews:", reviewError)`, line 87 `console.error("Error fetching external reviews:", extError)`, line 98 `console.error("Error fetching community buzz:", buzzError)`, line 134 `console.error("Error fetching related medications:", relatedError)` — 5 production log leaks.

**Issue 94**: The `buzzPosts` from `medication_community_buzz` are mapped to `ExternalMedicationReview` format at line 105-120 in `useMedicationDetails`. The `title` field is mapped to `null` for all buzz posts since the buzz table has no title column. All community buzz posts appear in the modal without titles, showing only content, making them harder to scan.

**Issue 95**: The related medications section in `useMedicationDetails` (line 123-134) fetches medications of the same `category` and `limit(4)`. But medication categories like "Insulin" contain many medications — the 4 related medications are sorted by `popularity_rank` which may not reflect clinical relevance.

**Issue 96**: The "Community Buzz" tab in `MedicationDetailModal` and the "Reviews" tab show overlapping data: both `externalReviews` and `buzzPosts` can come from Reddit. A Reddit post could appear in both tabs simultaneously.

**Issue 97**: Neither the medication modal nor the device reviews component has Google review integration displayed with a Google-branded star rating. Google reviews are in the database as a source but are not visually differentiated from Reddit posts in any way.

**Issue 98**: The `external_device_reviews` table and `external_medication_reviews` table are fetched separately per device/medication with no caching at the application level. If a user browses 5 devices, 5 separate DB queries are made. A batch fetch or React Query caching with longer `staleTime` is needed.

**Issue 99**: The device reviews `rating` field shows as an integer but device community posts have sentiment (`positive`, `neutral`, `negative`) without a numeric rating. The combined display mixes ordinal stars with categorical sentiment, making the aggregate stats misleading.

**Issue 100**: `ExternalReviewCard` displays a `"Verified"` badge but the verification logic only checks if `source_url` is non-null (inferred from the `reviewVerification.ts` file described in memory notes). A non-null URL from a seeded, non-existent Reddit post would still show "Verified".

**Issue 101**: The medication reviews tab has no "helpful" voting mechanism displayed. Users can read the `helpful_count` but cannot vote.

**Issue 102**: Device review dates use `format(new Date(review.created_at), 'MMM d, yyyy')` (from `date-fns`) but medication review dates use `new Date(review.created_at).toLocaleDateString()`. Inconsistent date formatting between the two systems.

**Issue 103**: There is no "verified purchase" or "verified T1D" badge for medication reviews even though the `verified` field exists in the schema.

---

## SECTION C: OTHER GAPS — 200 Issues (grouped by category)

### C1. Routing & Navigation (10 issues)

**Issue 104**: The `/data-upload` and `/glucose/upload` routes both exist and serve different implementations. After the merge fix in Section A, `/glucose/upload` should redirect to `/data-upload`.

**Issue 105**: `MedicineComparison.tsx` page exists at route `/medicine/comparison` but there is no navigation link to it from `MedicineHub.tsx`. The comparison feature is only accessible via URL.

**Issue 106**: The `BackButton` component uses `useNavigate(-1)` which goes to browser history. If a user navigates directly to a device detail page via a shared URL, the back button has no history to go back to, and the `fallbackPath` prop is not always set.

**Issue 107**: The `DeviceDetail` page uses `useParams<{ deviceId: string }>()` but never validates that `deviceId` is a valid UUID before querying the database. Invalid UUID paths would cause a Postgres error instead of a 404.

**Issue 108**: The `QAChecklist.tsx` page route `/qa-checklist` is accessible to all users but references admin functions. It should be protected by `AdminRoute` or removed from public routing.

**Issue 109**: Multiple pages (`Diabeto18Plus.tsx`, `MentalHealthHub.tsx`, `LowBloodSugarWorld.tsx`) have no canonical URL meta tags for SEO.

**Issue 110**: The `NotFound.tsx` page renders a 404 component but the HTTP response code sent by the browser is still 200 since this is a SPA. This harms SEO — crawlers will index broken routes as valid pages.

**Issue 111**: The `App.tsx` router has `<Route path="/donation-result" element={<Navigate to="/donate/success" replace />} />` which is correct, but `DonationSuccess.tsx` is imported twice — once for the redirect target and the real route. Verify the redirect is correctly pointing to the success component, not circular.

**Issue 112**: Pages like `FutureOfT1D.tsx`, `InnovationHub.tsx`, `EmergenceOfDiabetes.tsx` are routes but have no breadcrumbs or back button, leaving users stranded after deep navigation.

**Issue 113**: The `/admin` route is protected by `AdminRoute`, but individual admin sub-routes (`/admin/users`, `/admin/content`, etc.) are separate pages that each import `withAdmin` HOC. This means two separate admin checks happen, which is redundant.

### C2. Authentication & Authorization (10 issues)

**Issue 114**: The `useMedicationReviews` hook checks `if (!user)` but the medication review form (if added) would need to redirect to auth. Currently no review form exists in the medication modal, so this is a latent issue.

**Issue 115**: `Settings.tsx` allows email/password changes but does not require re-authentication before making the change. Changing passwords without requiring current password is a security risk.

**Issue 116**: The `Admin.tsx` page redirects non-admins but only after the page renders briefly. The flash of admin content before redirect should be prevented with a loading state.

**Issue 117**: `withAdmin.tsx` HOC has no timeout handling. If the admin check query hangs, the user sees a loading spinner indefinitely.

**Issue 118**: The `useAuthStore` uses Zustand without persistence. After a page refresh, `user` is null until the Supabase auth listener fires. Components that check `!user` during SSR-like hydration may incorrectly hide authenticated-user-only content briefly.

**Issue 119**: No session expiry handling — when a Supabase token expires (1 hour default), API calls fail silently. The user is not redirected to login or shown a "session expired" message.

**Issue 120**: Profile avatars use `avatar_url` from the `profiles` table but there is no upload mechanism for avatar images. The field exists but is always null/empty.

**Issue 121**: The `ResetPassword.tsx` page exists but there is no "Forgot Password" link on the `Auth.tsx` login form.

**Issue 122**: `Auth.tsx` has no rate limiting on login attempts client-side. While Supabase rate-limits on the server, showing an error like "Too many attempts" would improve UX.

**Issue 123**: Social OAuth providers (Google, GitHub) are not configured — only email/password auth exists. The auth page may reference these if default Supabase UI is used.

### C3. Search & Discoverability (8 issues)

**Issue 124**: `GlobalSearchDialog.tsx` queries 8 tables in `Promise.all` but has no debounce. Every keystroke fires 8 simultaneous database queries.

**Issue 125**: The global search has a minimum query length of 2 characters enforced by `enabled: query.length >= 2`, but shorter terms like "CV" or "AI" would not return results.

**Issue 126**: Search results from the global search do not include uploaded analyses or journal entries — only platform data.

**Issue 127**: The search dialog has no keyboard navigation between result categories — pressing Tab moves through all results serially rather than allowing arrow key navigation within categories.

**Issue 128**: Search results do not highlight the matching term within the result title or description.

**Issue 129**: The search has no empty state guidance — when results are empty, it just shows "No results" without suggestions like "Try searching for 'Dexcom G7'" or "Browse medications."

**Issue 130**: The `CommunitySolutions.tsx` search fires on every character change with `setSearchQuery(e.target.value)` without debounce, causing excessive re-renders.

**Issue 131**: The device and medication lists have no URL-based search state — search terms and filters are not reflected in the URL, so sharing a filtered view is not possible.

### C4. Performance Issues (10 issues)

**Issue 132**: The `MedicineHub.tsx` page fetches all medications with `useMedications({ category, search, sort })` — the hook has no server-side pagination, fetching potentially hundreds of medications and filtering client-side.

**Issue 133**: `DeviceAnalytics.tsx` runs a complex `get_public_glucose_summary` RPC call on mount. This is a heavy aggregation query with multiple subqueries running synchronously.

**Issue 134**: `HealthComparisonPanel.tsx` generates the entire supplements list, lifestyle plans, health impacts, and mental health data arrays inline in the component render — these static arrays are re-created on every render instead of being memoized or defined outside the component.

**Issue 135**: `ResearchHub.tsx` has multiple `useQuery` calls without `staleTime` configuration, causing refetches on every window focus.

**Issue 136**: `CustomizableDashboard.tsx` uses `react-grid-layout` which loads a significant JavaScript bundle. It's not lazy-loaded.

**Issue 137**: `GlucoseAGPChart.tsx`, `GlucoseHeatmap.tsx`, `GlucoseTrendChart.tsx`, `TimeInRangeChart.tsx` are all imported statically in `AnalysisResultsModal`. The analysis modal's bundle is large. These chart components should be lazy-loaded with `React.lazy`.

**Issue 138**: The CDN Tailwind CSS warning in the console (`cdn.tailwindcss.com should not be used in production`) suggests some component or feature is loading Tailwind from CDN instead of the bundled version. This is a production performance issue.

**Issue 139**: `DataUpload.tsx` initializes the `InfoRail` component at the bottom of every load even when no data has been uploaded. `InfoRail` should be deferred until needed.

**Issue 140**: Multiple edge functions (e.g., `medical-research-aggregator`, `fda-data-feed`, `community-feed`) are called from client-side hooks but have no caching layer. Each page load triggers fresh calls.

**Issue 141**: The `useGlobalSearch` hook creates 8 `Promise.all` queries every 2+ character keystroke with no debounce delay, potentially issuing 40+ total DB queries for a 5-character search term.

### C5. Form Validation & Data Integrity (12 issues)

**Issue 142**: The `Contact.tsx` form has `maxLength` on inputs but the form submission has no CSRF protection or honeypot field for spam prevention.

**Issue 143**: `Profile.tsx` enforces a 500-char bio max in the UI but the database column has no corresponding constraint — a direct API call could bypass the limit.

**Issue 144**: `Settings.tsx` password change uses `supabase.auth.updateUser({ password })` without validating that `newPassword !== currentPassword` before submission.

**Issue 145**: `Settings.tsx` email change (`supabase.auth.updateUser({ email })`) sends a verification email to the new address but there's no UI feedback explaining this to the user — they see "Email updated" and may not realize they need to verify the new email.

**Issue 146**: The `UserReviewForm` for devices has no minimum content length validation — users can submit a review with a single character in the "Content" field.

**Issue 147**: The `InteractionChecker` in `MedicineHub.tsx` allows adding the same medication twice to the checker list, which would produce meaningless "self-interaction" results.

**Issue 148**: The `YourExperience.tsx` form for submitting experiences has no duplicate detection — a user can submit identical experiences multiple times.

**Issue 149**: `Journal.tsx` shift entries accept any text in `context` field with no XSS sanitization before rendering (via `innerHTML` or similar). Check for XSS vulnerabilities.

**Issue 150**: The `SurveyModal.tsx` form allows navigation between steps but doesn't validate the current step before allowing the user to advance, permitting submission of incomplete surveys.

**Issue 151**: Date inputs in `Profile.tsx` and `Journal.tsx` accept keyboard input that bypasses the date picker min/max validation — users can type future dates in the `diagnosis_date` field.

**Issue 152**: The `GetInvolved.tsx` interest form submits to the database but has no email confirmation sent to the submitter, leaving them unsure if their submission was received.

**Issue 153**: The `HealthcareExperience.tsx` submission form has no character counter on the text area, making it hard for users to stay within expected lengths.

### C6. Accessibility (15 issues)

**Issue 154**: The `GlucoseHeatmap` chart component renders with no `aria-label` or `role="img"` — screen readers cannot describe the heatmap.

**Issue 155**: The `TimeInRangeChart` uses a pie/donut chart rendered by Recharts but has no data table alternative for accessibility.

**Issue 156**: Dialog modals (`MedicationDetailModal`, `AnalysisResultsModal`) trap focus correctly but do not restore focus to the triggering element on close.

**Issue 157**: The drag-and-drop upload zone in `DataUpload.tsx` has no keyboard-accessible alternative — keyboard-only users must use the "Choose Files" button, but the drop zone has no `role`, `tabIndex`, or keyboard event handlers.

**Issue 158**: Star rating displays throughout the review system use `Star` icons without `aria-label` — e.g., `4.2` stars is not announced to screen readers as "4.2 out of 5 stars".

**Issue 159**: All `<Button>` elements with only icons (download, share, close) throughout the app use `size="sm" variant="ghost"` with an icon child but no `aria-label` attribute.

**Issue 160**: The `AnalysisResultsModal` tab list has 9 tabs on mobile that overflow horizontally — no scrolling indicator or mobile-optimized tab layout is provided.

**Issue 161**: Color coding is used throughout (green/yellow/red for glucose metrics) without any alternative indicator for colorblind users. No pattern fills or icons accompany the color-only indicators.

**Issue 162**: The `Progress` bar components (in upload status, metric cards) have no `aria-valuenow`, `aria-valuemin`, `aria-valuemax` attributes.

**Issue 163**: Form labels in `UserReviewForm` use `htmlFor` correctly but the error messages are not linked to their fields via `aria-describedby`.

**Issue 164**: The `Toast` notifications (`sonner`) have no `role="alert"` or `aria-live` region — they may not be announced by screen readers.

**Issue 165**: The main navigation drawer on mobile has no `aria-expanded` state on the toggle button.

**Issue 166**: `DeviceDetail.tsx` tab list has 8 tabs that overflow on mobile — no wrapping or scroll indicator for the tab bar.

**Issue 167**: The `AutoHeight` content regions in the data upload modal do not announce content changes to screen readers when tabs switch.

**Issue 168**: External links throughout the app use `target="_blank"` without `rel="noopener noreferrer"` in some places — a security issue.

### C7. Data Transparency & Hardcoded Data (10 issues)

**Issue 169**: `DashboardWidgets.tsx` shows statistics cards that may display hardcoded or illustrative numbers without proper "Illustrative Data" labels.

**Issue 170**: The `FutureOfT1D.tsx` page references "trials planned 2026" from seeded discovery cards — these dates may become stale but there is no mechanism to flag outdated content.

**Issue 171**: `InnovationHub.tsx` shows research scores and credibility ratings that come from the seeded `discoveries` table. There is no `last_verified` timestamp displayed, leaving users unable to assess data freshness.

**Issue 172**: The `MedicineHub.tsx` stats cards (Total Medications, Insulins, Oral, Injectables) count medications from the database but these counts include seeded/demo data — no label distinguishes live production data from seeded records.

**Issue 173**: `HealthComparisonPanel` shows citations like "ADA Standards of Care 2024" and "Diabetes Care, 2023" hardcoded as strings. If these sources are updated, the citations will be stale and misleading.

**Issue 174**: The `DonationsInfo.tsx` "Impact Statistics" section was flagged with "illustrative data" labels in a previous audit but the underlying numbers (e.g., "247 research grants funded") were seeded. Verify these are still labeled as illustrative.

**Issue 175**: The `PublicGlucoseData.tsx` page shows aggregate statistics from the `public_glucose_data` table. This data was seeded from the `seed-public-glucose` edge function. No "Reference Data" badge is shown on the analytics.

**Issue 176**: `AdminDashboard.tsx` was updated with "Illustrative Data" badges, but specific metric cards (e.g., active user counts) may pull from real DB queries and others from estimates — they're not consistently labeled.

**Issue 177**: The `Trends.tsx` page aggregates `topic_tags` from `community_posts` as trending topics, but community posts are also seeded. "Trending" topics reflect seeded data, not actual user activity.

**Issue 178**: The `WarriorSpotlight.tsx` page shows "warrior stories" that are seeded via `seed-warrior-stories` and `seed-real-warrior-stories`. There's no label distinguishing seeded demo stories from real user submissions.

### C8. UI/UX Consistency (20 issues)

**Issue 179**: The `MedicineHub` uses a `MedicationDetailModal` (dialog popup) but `DeviceDetail` uses a full page. This inconsistency makes the navigation pattern unpredictable. Devices have a richer experience (AI assistant, full tabs, metrics) while medications are constrained to a dialog.

**Issue 180**: Sort order: `MedicineHub.tsx` defaults to `popularity` sort but the `handleSortChange` function maps `price_low` and `price_high` both to `price` without direction — so ascending/descending can't be toggled for price.

**Issue 181**: The `MedicationFilters.tsx` component has both category and subcategory filters, but the active tab in `MedicineHub.tsx` ALSO acts as a category filter. When a user selects "Insulins" tab and then uses the category filter, both filters apply simultaneously — creating contradictory behavior.

**Issue 182**: Empty states are inconsistent: some use a centered card with icon + text (devices, medications), others use plain text (`<p>No user reviews yet</p>` in medication modal), and others use nothing.

**Issue 183**: Loading states are inconsistent: some components use `Skeleton` (medication grid, device reviews), others use spinners, and others block render entirely.

**Issue 184**: The `Badge` component is used for both tags (static labels) and status indicators (processing/complete/error). Color usage overlaps — a blue primary badge means different things in different contexts.

**Issue 185**: The `BackButton` component in some pages is placed before the page title in the DOM but visually appears after layout content due to CSS, creating confusing tab order for keyboard users.

**Issue 186**: "Coming Soon" features appear in multiple sidebar areas using `disabled` buttons with `Badge` "Soon" labels. These should either be removed or hidden to reduce UI clutter. Currently: 4 disabled buttons on `DataUpload.tsx` sidebar.

**Issue 187**: The `DeviceAnalytics.tsx` page lacks a back button despite being a sub-feature of the devices section.

**Issue 188**: The `Explore.tsx` page and `Discover.tsx` page have similar names and overlapping content — users may not understand the difference between them.

**Issue 189**: The `LearnExplore.tsx` page is separate from `Explore.tsx` — two very similar named pages in the nav.

**Issue 190**: The `Shop.tsx` page shows products but has no shopping cart UI between the product list and checkout — clicking "Buy" goes directly to Stripe checkout. There's no cart review step.

**Issue 191**: Error states across the app inconsistently use `toast.error()`, `Alert` components, and inline text — no unified error presentation pattern.

**Issue 192**: The `Bounties.tsx` page has a "Submit a Bounty" form but no list of submitted bounties in a viewable state for non-admins.

**Issue 193**: The `YourExperience.tsx` and `QualityOfLife.tsx` pages have similar purposes — both allow sharing personal T1D experiences. The distinction between them is unclear.

**Issue 194**: The `Journey.tsx` page shows a timeline but has no way to share the timeline or export it.

**Issue 195**: The `PrepareForVisit.tsx` page generates an appointment summary but there's no way to save it permanently — refreshing the page loses the generated summary.

**Issue 196**: Color scheme: The app uses `text-highlight` in some places (like `MentalHealthHub`) but this CSS variable may not be defined in all theme variants, causing invisible text.

**Issue 197**: `DashboardWidgets.tsx` widgets have drag handles for the customizable dashboard, but the drag handles have no visual indicator (grab cursor, icon) — the drag behavior is not discoverable.

**Issue 198**: Mobile viewport: Multiple card grids use `grid-cols-4` on medium screens but `grid-cols-2` on mobile — the intermediate breakpoints often cause layout breaks on tablet-sized screens.

### C9. Medical Safety & Compliance (8 issues)

**Issue 199**: The supplement recommendations in `HealthComparisonPanel` suggest specific dosages (e.g., "Magnesium Glycinate 200-400mg/day") without any medication interaction warnings. The disclaimer only mentions "consult your endocrinologist" in small text.

**Issue 200**: The `T1DCompanion.tsx` AI chat companion uses `t1d-companion-chat` edge function. If the system prompt doesn't explicitly prevent insulin dosing advice, the AI could provide dangerous medical recommendations.

**Issue 201**: The `DataUpload.tsx` page has a disclaimer: "Analysis results are for informational purposes only and should not replace professional medical advice." This is in italic small text — for a medical application, this disclaimer should be more prominent (e.g., a dismissible warning banner on first use).

**Issue 202**: The CGM analysis shows metrics like MAGE, GVI, and predicted patterns without explaining what these metrics mean. A user without medical knowledge could misinterpret high GVI as a positive number.

**Issue 203**: The `HealthComparisonPanel` compares T1D users against "non-diabetic benchmarks" (TIR 96-99%). Presenting this without context could cause undue distress to T1D users who cannot realistically achieve these targets.

**Issue 204**: The `ScenarioLab.tsx` page allows simulating "What-If" scenarios for glucose management. If it calculates insulin dose changes, this is a regulated medical device activity in many jurisdictions.

**Issue 205**: The PDF export report from `AnalysisResultsModal` includes the disclaimer at the bottom but uses a small gray font (8pt equivalent). Medical reports should have the disclaimer at the top and in a readable size.

**Issue 206**: The `PrepareForVisit.tsx` appointment summary includes personalized glucose statistics. If this summary is printed and brought to a doctor's appointment, its format should clearly indicate it's patient-generated data, not a clinical report.

### C10. Backend & Edge Function Issues (20 issues)

**Issue 207**: The `community-feed` edge function is listed in the functions directory but was never migrated to use the shared `_shared/cors.ts` utility — inconsistent with the standardization work done in previous audits.

**Issue 208**: The `t1d-companion-chat` edge function is not listed in the `supabase/config.toml` `verify_jwt = false` configuration — if JWT verification is enabled by default, unauthenticated requests to the companion will fail.

**Issue 209**: The `fetch-reddit-reviews` edge function exists but there's no Reddit API key configured in secrets. The function may be failing silently and returning empty results.

**Issue 210**: The `fetch-medication-reviews` edge function exists but without a Drugs.com or similar API key, it can only use Firecrawl for scraping — which may be rate-limited or blocked.

**Issue 211**: The `daily-briefing` and `send-weekly-digest` edge functions were configured with cron triggers in previous audits. Verify these triggers are actually persisted in `supabase/config.toml`.

**Issue 212**: The `verify-external-links` edge function was scheduled to run Sundays at 2 AM but the `link_status` column write-back requires `UPDATE` permission that may not be granted to the function's service role.

**Issue 213**: Multiple `seed-*` edge functions remain deployed (70+ seed functions). These are one-time seeding tools that should not remain as live deployable functions in production — they're a potential attack surface.

**Issue 214**: The `analyze-glucose` edge function has a 30-second timeout risk for large files. Deno edge functions have a 150-second wall-time limit, but complex Excel parsing + AI Vision extraction may exceed this for very large files.

**Issue 215**: The `data-orchestrator` edge function appears to coordinate multiple other functions but its exact purpose and trigger mechanism is not documented. If it's a cron job that also seeds data, it could overwrite user data.

**Issue 216**: The `snapshot-generator` edge function generates anonymized data snapshots. If this function is triggered frequently, it may generate duplicate anonymized user records in the `public_glucose_data` table.

**Issue 217**: The `_shared/cors.ts` utility uses `*` for `Access-Control-Allow-Origin`. For endpoints that handle authenticated user data (like `analyze-glucose`), a wildcard CORS origin means any website can call the function with a user's JWT. This should be restricted to the app's domain.

**Issue 218**: The `create-donation` and `create-shop-checkout` functions were updated to use shared CORS but their `verify_jwt` settings in `config.toml` need to be verified to ensure they require authentication.

**Issue 219**: No edge function has request body size validation (`validateBodySize`) except those explicitly mentioned as updated. Large requests to `analyze-glucose` (base64 PDFs up to ~13MB) can cause memory issues.

**Issue 220**: The `ai-center-predictions` edge function calls the Lovable AI gateway but may use `openai/gpt-5` for all predictions when `google/gemini-2.5-flash` would be more cost-effective for most use cases.

**Issue 221**: The `medical-research-aggregator` function aggregates from multiple sources but has no deduplication check — papers with the same DOI or title from different sources can appear multiple times in the research hub.

**Issue 222**: The `scheduled-maintenance` function was configured with a cron trigger but its actual maintenance tasks are not documented. If it includes database cleanup, it may be deleting valid data.

**Issue 223**: Several edge functions use `Deno.env.get("SUPABASE_URL")` but the function is in the same project — they should use `Deno.env.get("SUPABASE_URL")` which is auto-injected. Verify all functions properly use the injected env vars.

**Issue 224**: The rate limiter in `analyze-glucose` (in-memory Map) will cause issues in high-concurrency scenarios where multiple function instances run simultaneously — each instance has its own rate limit counter, making the effective rate limit N times higher than intended.

**Issue 225**: The `t1d-companion-chat` edge function streams responses but the client-side implementation may not handle stream errors gracefully — if the stream is interrupted, the UI may show partial responses.

**Issue 226**: No edge function implements response compression (gzip/brotli). Large responses (e.g., full analysis results from `analyze-glucose`) are sent uncompressed, increasing latency and bandwidth usage.

### C11. SEO & Meta Tags (5 issues)

**Issue 227**: No page has `<meta name="description">` tags — search engines will generate descriptions from page content which is inconsistent and often poor.

**Issue 228**: No page has Open Graph tags (`og:title`, `og:description`, `og:image`) for social sharing.

**Issue 229**: The `index.html` has a generic `<title>Lovable</title>` which should be updated to the actual app name for SEO.

**Issue 230**: No sitemap.xml is generated or served, making it harder for search engines to discover and index all pages.

**Issue 231**: Dynamic pages (device details, medication modals, article details) don't update `document.title` with the specific content name, showing the generic app name in the browser tab.

### C12. Error Handling (10 issues)

**Issue 232**: The `ErrorBoundary.tsx` catches rendering errors but doesn't catch async errors from `useEffect` or event handlers — most data fetching errors are caught by React Query but unhandled promise rejections are not surfaced.

**Issue 233**: When `useDeviceDetails` returns an error, `DeviceDetail.tsx` shows a generic error message without any retry mechanism.

**Issue 234**: Network failures during file upload in `DataUpload.tsx` leave the file in "processing" state in the UI (even though the DB record is marked `error`). On page refresh, the file shows as "complete" or "error" from DB — but the in-progress UI state is abandoned without cleanup.

**Issue 235**: The `useExternalReviews` hook at line 90-92 sets `error` state but `DeviceReviewsTab` never displays this error to the user — external reviews silently fail to load.

**Issue 236**: `GlobalSearchDialog.tsx` has no error state display — if search queries fail, the dialog shows empty results with no indication that an error occurred.

**Issue 237**: The `analyze-glucose` function's final catch block at line 2756-2760 returns a generic "An unexpected error occurred during analysis" without updating the upload DB record to error status. This leaves uploads in `processing` state indefinitely.

**Issue 238**: The `AnalysisResultsModal` PDF export at line 302 catches errors with `catch {}` (empty catch) — the `toast.error` fires but the actual error is swallowed without logging.

**Issue 239**: When the `create-donation` edge function fails (Stripe error), the error message shown to users is the raw Stripe error message which may contain technical terms confusing to users.

**Issue 240**: The `stripeShop-webhook` processes webhooks without a dead-letter queue. If a webhook handler fails after receiving an event, the event is retried by Stripe but may cause duplicate order processing.

**Issue 241**: The `SurveyModal.tsx` has no error recovery — if the survey submission fails, the modal closes and the user loses their progress with only a toast error notification.

### C13. Missing Features Referenced in UI (10 issues)

**Issue 242**: The "Connect CGM App" button in `DataUpload.tsx` sidebar says "Soon" — Dexcom and Abbott APIs are available for CGM integration and should be tracked as a real feature request.

**Issue 243**: The "Share with Doctor" button in `DataUpload.tsx` sidebar says "Soon" — a PDF export to email already exists via `DataExport.tsx`. This feature is partially implemented.

**Issue 244**: The "Schedule Auto-Upload" button says "Soon" — this would require background push notifications or a native app and genuinely cannot be implemented in a web app without a service worker.

**Issue 245**: The `News.tsx` "Subscribe to Newsletter" button is disabled with no explanation of when it will be available.

**Issue 246**: `GlucoseUpload.tsx` shows an "Export Report" button for completed uploads but it's a non-functional placeholder with no click handler (only the `DataExport` component in the main `DataUpload.tsx` is functional).

**Issue 247**: The `FindDiabeticNearMe.tsx` page suggests connecting with nearby T1D people but the location-based matching logic (if any) may use approximate location rather than actual geolocation.

**Issue 248**: `EventsNearMe.tsx` shows events from the `t1d_events` table which is seeded data — there's no mechanism for real events to be submitted or verified.

**Issue 249**: The `BuildWithUs.tsx` page has a developer API section that suggests an API exists — but no public API documentation or API key management system is present.

**Issue 250**: The "QR Code" sharing functionality referenced in some components is not implemented — no QR code generation library is installed or used.

**Issue 251**: The `HealthcareProviders.tsx` page lists healthcare provider resources but has no way for providers to register or verify their credentials on the platform.

### C14. Code Quality & Technical Debt (15 issues)

**Issue 252**: `src/pages/DataUpload.tsx` line 109: `upload.file_type?.includes('csv') ? 'cgm' : 'pump'` — when restoring uploads from DB, all non-CSV uploads (PDFs, images) are categorized as "pump" type.

**Issue 253**: The `MedicationDetailModal` at line 37 accesses `medicationData` and aliases it as both `const medication = medicationData` and `const reviews = medicationData?.userReviews`. When `medicationData` is null (before load), `medication` is undefined but is used as the tab render condition at line 56.

**Issue 254**: The `analyze-glucose` function is 2763 lines in a single file — extremely difficult to maintain. This should be split into modules: `parsers/`, `analyzers/`, `ai/`, `validators/`.

**Issue 255**: Multiple components use the pattern `Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} .../>)` for loading states — this pattern is repeated identically in at least 8 places without a shared `SkeletonGrid` component.

**Issue 256**: `DataExport.tsx` and `AnalysisResultsModal.tsx` both implement independent PDF export functions with duplicated jsPDF logic. They should share a single `generateAnalysisPDF` utility function.

**Issue 257**: The `useAuthStore` uses Zustand but many components also directly import `supabase.auth.getUser()` — dual auth state sources that can desync.

**Issue 258**: `src/components/device/DeviceReviewsTab.tsx` imports `useNavigate` from `react-router-dom` but only uses it in `handlePostClick` — the navigation could be a plain `<Link>` instead.

**Issue 259**: TypeScript `any` is used in `MedicationDetailModal.tsx` at line 150 (`handleViewDetails: (medication: any)`) — should use the `Medication` type.

**Issue 260**: The `GlucoseRiskMatrix` component is imported in `AnalysisResultsModal` but is never shown for summary reports (AGP/daily data is empty). It renders with `undefined` hourlyStats without a null check and may throw.

**Issue 261**: The `DataQualityPanel` and `NovelSignalsCard` tabs in `AnalysisResultsModal` are conditionally shown via `{hasEnhancedData && dataQuality && (...)}` but the `TabsTrigger` elements also have this condition — if `hasEnhancedData` is false, the tab triggers are hidden but the TabsContent divs are still rendered (empty). This can cause subtle layout shifts.

**Issue 262**: The `useExternalReviews` hook uses `useState` + `useEffect` pattern instead of React Query's `useQuery` — it doesn't benefit from caching, deduplication, or background refetch.

**Issue 263**: The `useCureMonitoring.ts` hook was referenced in previous audit fixes but its implementation details weren't verified — it may still have `console.log` leaks.

**Issue 264**: The `GlucoseInsightCard.tsx` component in `data-upload/` is imported but never used in `AnalysisResultsModal.tsx`.

**Issue 265**: `src/types/glucose-analysis.ts` defines types but some components (`AnalysisResultsModal`) re-define the same interfaces locally (e.g., `DetailedAnalysis`, `Pattern`, `HourlyStats`) — duplicated type definitions that can desync.

**Issue 266**: The `fetchReviews` callback in `useDeviceReviews.ts` (line 58) uses `useCallback` with `[deviceId, user]` dependencies. When `user` changes (e.g., after login), ALL device reviews re-fetch even if `deviceId` hasn't changed.

---

## Implementation Plan

The fixes are organized into 6 implementation batches, prioritized by impact:

### Batch 1: Critical Data Upload Fixes
- Redirect `/glucose/upload` → `/data-upload`; delete `GlucoseUpload.tsx`
- Fix `GlucoseUpload.tsx` binary file handling (issue 2)
- Fix response payload from `analyze-glucose` to include `executiveSummary`, `confidenceScore`, etc. (issue 23)
- Fix `analyze-glucose` error path to always update upload status to `error` (issues 13, 237)
- Remove all `console.log/error` from the edge function (issues 4-8, 24)
- Fix AGP percentile calculation (issue 9)
- Add body size validation schema to `analyze-glucose` (issues 11, 12)
- Fix the download button in DataUpload.tsx (issue 26)
- Fix "Export Analysis" Quick Action to use the real DataExport (issue 27)
- Add empty state for Recent Uploads (issue 30)
- Add pagination/load more for uploads list (issue 31)
- Add delete upload functionality (issue 32)
- Add retry button for failed uploads (issue 34)
- Fix `.webp` in file input accept attribute (issue 29)
- Fix date timezone issue (issue 28)
- Fix file type detection for non-CSV uploads (issues 25, 252)
- Fix GlucoseMetricsGrid to show N/A for zero GMI (issue 43)
- Fix AnalysisResultsModal AGP empty state message (issue 37)
- Remove duplicate Trends tab content (issue 38)
- Add lazy loading to chart components (issue 137)

### Batch 2: Reviews System Fixes
- Replace hardcoded "Real Usage" tab data with DB-derived stats (issues 53, 54)
- Add `ScrollArea` to medication reviews list (issue 55)
- Wire `useMedicationReviews` submitReview into `MedicationDetailModal` (issue 56)
- Use `increment_review_helpful` RPC instead of manual count (issues 57, 92)
- Add responsive tab layout to medication modal (issue 58)
- Add "Load More" to external reviews in medication modal (issue 59)
- Fix buzz post `engagement_score` vs `helpful_count` display (issues 60, 81)
- Add null rating display handling (issue 61)
- Add sort/filter to medication reviews tab (issue 62)
- Add pagination to medication reviews (issue 63)
- Remove all `console.error` leaks in review hooks (issues 64-65, 91, 93)
- Add server-side limit to `useDeviceReviews` fetch (issue 67)
- Add "would not recommend" badge for medication reviews (issue 83)
- Display pros/cons arrays with icons in medication modal (issue 86)
- Reorder medication modal tabs (Reviews before Clinical) (issue 87)
- Add character counter to medication review form (issue 88)
- Add prominent "Edit My Review" button on user's own review card (issue 89)
- Add `staleTime` to `useExternalReviews` (issue 75)
- Add link health status check before rendering external review URLs (issue 76)
- Add `aria-label` to review cards (issue 77)
- Display `verified` badge on medication reviews (issues 82, 103)
- Fix `duration_of_use` display on device reviews (issue 85)
- Fix date formatting consistency between device and medication reviews (issue 102)
- Add sentiment filter and sort to medication external reviews (issue 78)
- Fix source display names for new/unknown sources (issue 79)
- Add "flag as inappropriate" for reviews (issue 84)
- Convert `useExternalReviews` to `useQuery` (issue 262)
- Deduplicate Reddit posts appearing in both "Community Buzz" and "Reviews" tabs (issue 96)
- Add Google-branded display for Google source reviews (issue 97)
- Batch-fetch external reviews with React Query instead of per-page queries (issue 98)
- Fix `toggleHelpful` race condition in device reviews (issue 74)

### Batch 3: Performance & Architecture Fixes
- Add debounce (300ms) to `useGlobalSearch` (issues 124, 141)
- Add `staleTime` to all `useQuery` calls in research hub and other heavy pages (issue 135)
- Memoize static arrays in `HealthComparisonPanel` (issue 134)
- Split `analyze-glucose` edge function into modules (issue 254)
- Create shared `SkeletonGrid` component (issue 255)
- Merge duplicate PDF export logic from `DataExport` and `AnalysisResultsModal` (issue 256)
- Add server-side pagination to medication list (issue 132)
- Fix CORS wildcard for authenticated endpoints (issue 217)
- Add `validateBodySize` to remaining edge functions (issue 219)

### Batch 4: Accessibility & UI Consistency Fixes
- Add `aria-label` to all icon-only buttons (issues 26, 159)
- Add `role="img"` and `aria-label` to all charts (issues 154, 155, 158)
- Add `aria-valuenow/min/max` to all Progress bars (issue 162)
- Add keyboard navigation to upload drop zone (issue 157)
- Add `aria-describedby` to form error messages (issue 163)
- Fix tab overflow on mobile for `AnalysisResultsModal` and `DeviceDetail` (issues 160, 166)
- Add focus restoration on modal close (issue 156)
- Fix color-only indicators with icon companions (issue 161)
- Add `aria-live` regions for Toast notifications (issue 164)
- Add `aria-expanded` to nav drawer toggle (issue 165)
- Fix external links to consistently include `rel="noopener noreferrer"` (issue 168)
- Make all empty states consistent (issue 182)
- Make all loading states consistent (issue 183)
- Update `document.title` on dynamic pages (issue 231)

### Batch 5: Security & Compliance Fixes
- Add re-auth requirement for password change in Settings (issue 115)
- Fix `AdminRoute` flash of admin content (issue 116)
- Add session expiry notification (issue 119)
- Add "Forgot Password" link to Auth page (issue 121)
- Add honeypot field to Contact form (issue 142)
- Add DB constraint enforcement for profile fields (issue 143)
- Add clear email-verification-required feedback after email change (issue 145)
- Increase medical disclaimer prominence in DataUpload (issue 201)
- Clarify T1D-appropriate benchmarks in HealthComparisonPanel (issues 44, 203)
- Review T1DCompanion system prompt for safety guardrails (issue 200)
- Mark all seeded data in public-facing views (issues 169-178)
- Remove or mark seed edge functions as non-production (issue 213)

### Batch 6: SEO & Remaining Gaps
- Update `index.html` title from "Lovable" to app name (issue 229)
- Add page-specific `document.title` updates (issue 231)
- Add "Forgot Password" link (issue 121)
- Protect `/qa-checklist` with `AdminRoute` (issue 108)
- Validate UUID params in `DeviceDetail` before DB query (issue 107)
- Fix `BackButton` fallback paths across all pages (issue 106)
- Add redirect for `/glucose/upload` → `/data-upload` (issue 104)
- Fix medication sort price ascending/descending direction (issue 180)
- Resolve tab vs category filter conflict in MedicineHub (issue 181)
- Add empty string validation to review pros/cons form (issue 90)
- Add duplicate detection to `YourExperience` submissions (issue 148)

---

## Technical Implementation Notes

**Files to create:**
- `src/utils/pdfExport.ts` — shared PDF generation utility
- `src/components/ui/skeleton-grid.tsx` — reusable skeleton loading grid
- `src/components/medicine/MedicationReviewForm.tsx` — write-review form for medications
- `src/hooks/useDebounce.ts` — shared debounce hook

**Files to delete after merge:**
- `src/pages/glucose/GlucoseUpload.tsx` — replaced by `DataUpload.tsx`

**Edge functions to modify:**
- `supabase/functions/analyze-glucose/index.ts` — multiple fixes
- `supabase/functions/community-feed/index.ts` — migrate to shared CORS

**Key Database RPC to use:**
- `increment_review_helpful(review_id)` — replace manual count in `useMedicationReviews.ts`
- `increment_device_review_helpful(review_id)` — replace in `useDeviceReviews.ts`
