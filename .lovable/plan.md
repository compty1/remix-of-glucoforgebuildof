

# Comprehensive Fix Plan: CGM Analysis Platform

This plan addresses every issue raised across clinical accuracy, security, parsing, architecture, auth, UX, routing, dependencies, and compliance. Issues are grouped into 8 phases ordered by patient safety impact.

---

## Phase 1: Critical Clinical and Mathematical Fixes

These affect medical accuracy and patient safety -- highest priority.

### 1.1 Fix CV Calculation (Bessel's Correction)
- **File:** `supabase/functions/analyze-glucose/index.ts` lines ~2153, ~408, ~1959
- Change `/ values.length` to `/ (values.length - 1)` for sample standard deviation in `analyzeGlucoseDataComprehensive`, `calculateDayNightMetrics`, and overnight stability calculations

### 1.2 Fix Fake AGP Percentiles
- **File:** `analyze-glucose/index.ts` line ~1818-1826
- Replace `p5: percentile(...) * 0.85` and `p95: stat.p90 * 1.1` with real p5/p95 calculated from actual per-hour raw readings stored in `calculateHourlyStatistics`
- Extend `calculateHourlyStatistics` to also compute p5 and p95 from raw values

### 1.3 Fix MAGE Algorithm
- **File:** `analyze-glucose/index.ts` line ~1868-1899
- Current bug: records `peak - nadir` on direction change but doesn't reset the opposite anchor correctly
- Fix: on upward direction change, record `values[i] - nadir` as the excursion; on downward, record `peak - values[i]`
- Add time-gap check: skip excursion if gap between readings > 30 minutes (data gap issue)

### 1.4 Fix GVI Calculation
- **File:** `analyze-glucose/index.ts` line ~2172-2177
- Replace `idealDelta = 5` with proper GVI: compare actual path length to ideal straight-line path length
- Formula: `actualPathLength = sum(abs(delta_i))`, `idealPathLength = abs(lastValue - firstValue)`, `GVI = actualPathLength / idealPathLength`

### 1.5 Add GMI Minimum Data Requirement
- **File:** `analyze-glucose/index.ts` line ~2170, ~2194
- If `daysOfData < 10`, set `gmi = null` and add insight text "GMI requires 10+ days of data"
- Extract GMI constants `3.31` and `0.02392` into named constants with citation (Bergenstal et al. 2018)

### 1.6 Add mmol/L Auto-Detection and Conversion
- **File:** `analyze-glucose/index.ts` in `parseCSV`, `parseJSON`, `parseExcel`, `parseXML`
- If parsed value is in range 0.5-33.3 and header contains "mmol", auto-convert: `value * 18.018`
- Also detect by checking if median of first 20 values < 35 (mmol/L range)

### 1.7 Customizable Target Ranges
- **File:** `analyze-glucose/index.ts` -- accept optional `targetLow` and `targetHigh` in request body (default 70/180)
- **File:** `src/pages/DataUpload.tsx` -- pass user profile targets if configured
- Replace all hardcoded 70/180 references in TIR calculations with these parameters

### 1.8 Fix Overnight Stability False Positive
- **File:** `analyze-glucose/index.ts` line ~1963
- Before labeling "Excellent Overnight Stability", check if overnight avg < 70; if so, label "Overnight Hypoglycemia" (critical severity)

### 1.9 Make Dawn/Meal/Night Hours Configurable
- Replace hardcoded dawn hours (4-8 AM), meal hours (7-9, 12-14, 18-20), night hours (10PM-6AM) with configurable defaults
- Accept optional `schedulePreferences` in request body or fall back to standard defaults
- Add shift worker awareness note in pattern descriptions

### 1.10 Fix Negative Glucose, Zero Variance, Empty Array Guards
- Add `if (values.length === 0) return 0` before `Math.max(...values)` and `Math.min(...values)` calls (line ~1857)
- Filter negative values in validation
- Handle zero stdDev: if stdDev === 0, set CV = 0, skip MAGE calculation

### 1.11 Fix Data Gaps in MAGE
- In `calculateMAGE`, add check: if time between consecutive readings > 30 minutes, treat as gap boundary and don't count the swing

### 1.12 Fix Executive Summary Risk Logic
- **File:** line ~600-646
- Change `else if` chain to accumulate ALL risks independently (remove else-if masking)
- Remove `topRisks.slice(0, 3)` -- show all critical risks, cap warnings at 5

### 1.13 Fix "Time Below 70" Text Bug
- **File:** line ~2202-2206
- Distinguish: 0% = "No lows detected -- excellent", 0-4% = "Within target", >4% = "Needs attention"

### 1.14 Fix Hypo Warning When Average is Low
- In overnight stability and executive summary, flag if average < 70 as critical rather than positive

### 1.15 Add Unit Type Parameter
- All calculation functions should accept a `unit: 'mg/dL' | 'mmol/L'` parameter
- Display results in the user's preferred unit

---

## Phase 2: Security Hardening

### 2.1 Add JWT Verification to Sensitive Edge Functions
Functions that MUST verify auth in code (keep `verify_jwt = false` in config.toml per Lovable Cloud guidelines but add `getClaims()` check):
- `admin-users`, `analyze-glucose`, `analyze-glucose-ai`, `ai-center-predictions`, `ai-connection-analyzer`, `ai-discovery-analyzer`, `daily-briefing`, `send-weekly-digest`, `send-push-notification`, `notification-triggers`, `create-donation`, `create-shop-checkout`, `t1d-companion-chat`

Pattern to add at top of each:
```typescript
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return errorResponse('Unauthorized', 401);
}
const { data, error } = await supabase.auth.getClaims(token);
if (error) return errorResponse('Unauthorized', 401);
const userId = data.claims.sub;
```

### 2.2 Verify Stripe Webhook Signatures
- **File:** `supabase/functions/stripe-shop-webhook/index.ts` -- Already has signature verification code. Verify `STRIPE_WEBHOOK_SECRET` is set and log when verification is skipped in dev mode

### 2.3 Add Database-Backed Rate Limiting for AI Functions
- Replace in-memory `rateLimitStore` Map in `analyze-glucose` with database check (query `uploads` table for recent submissions by user)
- Add per-user rate limits to `ai-center-predictions`, `analyze-glucose-ai`, `ai-connection-analyzer`

### 2.4 Fix RLS Bypass in analyze-glucose
- **File:** line ~2266-2269
- Use user's auth token to create supabase client for DB updates on their own uploads
- Only use SERVICE_ROLE_KEY for operations that genuinely need admin access

### 2.5 Add Server-Side Payload Size Validation
- Add `validateBodySize(req, 6_291_456)` (6MB) at top of `analyze-glucose`
- Apply to other edge functions using shared `_shared/cors.ts` utility

### 2.6 Add Content-Type Enforcement
- Verify `Content-Type: application/json` header before `req.json()` in all edge functions

### 2.7 Protect Seed Functions
- Add admin-only auth check to all `seed-*` functions to prevent unauthorized database writes

### 2.8 Fix Hardcoded Project ID
- `config.toml` line 1: `project_id = "meucptevbewkcipbtxih"` -- this is auto-managed by Lovable Cloud, no action needed

---

## Phase 3: Data Parsing Fixes

### 3.1 Fix CSV Parser
- **File:** `analyze-glucose/index.ts` line ~1326
- Extend header search from first 20 rows to first 50 rows (LibreView/Dexcom metadata)
- Handle escaped quotes `""` in CSV fields (current parser flips `inQuotes` but doesn't handle `""`)
- Handle `\r\n` line endings (split by `/\r?\n/` instead of `\n`)
- Handle Dexcom "Low"/"High" strings: map to 40 and 400 mg/dL with a `sensorExtreme` flag
- Don't blindly default `valueCol = 1` -- require glucose-related header match or flag as unknown

### 3.2 Fix XML Parser -- Replace Regex with DOMParser
- **File:** line ~1530-1625
- Replace regex parsing with Deno's built-in DOMParser:
```typescript
const parser = new DOMParser();
const doc = parser.parseFromString(content, "text/xml");
const entries = doc.querySelectorAll("entry, reading, glucose");
```

### 3.3 Fix Excel Dynamic Import
- Add retry wrapper (3 attempts with exponential backoff) around SheetJS CDN import
- Pin to specific version URL to prevent breaking changes

### 3.4 Fix JSON/Nightscout Date Parsing
- **File:** line ~1424
- Use explicit: `new Date(Number(item.date))` for Unix timestamps, validate `dateString` format before `new Date()`

### 3.5 Add Data Deduplication
- After parsing, deduplicate by timestamp: `readings = [...new Map(readings.map(r => [r.timestamp.getTime(), r])).values()]`

### 3.6 Add Timezone-Aware Date Parsing
- Accept optional `timezone` parameter from client
- Apply offset to parsed dates

### 3.7 Handle Sensor "Low"/"High" Strings
- In CSV and Excel parsers, before `parseFloat`, check for "Low" -> 40, "High" -> 400 with flag

### 3.8 Fix AI JSON Response Parsing
- **File:** line ~1281
- Strip markdown code fences before JSON.parse: `content.replace(/^```json?\n?/,'').replace(/\n?```$/,'')`

### 3.9 Add Omnipod/Tandem Format Detection
- Add specific format detection patterns for Omnipod 5 CSV and Tandem t:connect CSV exports

### 3.10 Fix Fragile Metric Regexes (CV pattern)
- **File:** line ~859-873
- Tighten regex context to avoid false matches from table matrices

### 3.11 Fix PDF Legacy Text Extraction
- **File:** line ~1125-1179
- Add FlateDecode decompression attempt before BT/ET extraction (use `pako` or skip gracefully)

### 3.12 Fix Text Quality Assessment
- **File:** line ~722-762
- Don't grant full score just for high alphanumeric ratio -- require at least 1 CGM keyword

---

## Phase 4: Architecture and Performance

### 4.1 Fix Base64 Conversion (Stack Overflow on Large Files)
- **File:** `src/pages/DataUpload.tsx` line ~254-259
- Replace `String.fromCharCode(...bytes.subarray(i, i + chunkSize))` with `FileReader.readAsDataURL()`:
```typescript
const base64 = await new Promise<string>((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve((reader.result as string).split(',')[1]);
  reader.readAsDataURL(file);
});
```

### 4.2 Use Supabase Storage for Raw Files
- Create `cgm-uploads` storage bucket (private, with RLS)
- Upload raw file to bucket FIRST, then pass storage path to edge function
- Edge function reads from bucket instead of receiving 10MB JSON payloads
- This eliminates payload size limit issues

### 4.3 Fix Sequential File Processing
- **File:** `DataUpload.tsx` line ~192-194, ~424-426
- Change `for (const file of files) await processFile(file)` to `Promise.allSettled(files.map(f => processFile(f)))`

### 4.4 Fix Zombie Upload States
- Add AbortController with 120s timeout to AI gateway fetch calls
- Add scheduled cleanup: any upload stuck in `processing` for > 10 minutes gets marked `error`

### 4.5 Remove or Make Auto-Journaling Opt-In
- **File:** `analyze-glucose/index.ts` line ~2664-2697
- Remove automatic journal entry creation or gate behind a user preference flag

### 4.6 Fix Memory Leak in setUploadedFiles
- Collect all processed files into an array, then call `setUploadedFiles` once instead of inside each iteration

### 4.7 Fix Rate Limiter (In-Memory Won't Work in Serverless)
- Remove in-memory `rateLimitStore` Map (line ~13)
- Replace with database-backed rate check or remove entirely (rely on auth-based rate limiting)

### 4.8 Fix Error Handling in Catch Block
- **File:** line ~2774
- Log the `_inner` error with context instead of silently swallowing it

### 4.9 Add AbortController Timeout for AI Gateway Calls
- Wrap all `fetch("https://ai.gateway.lovable.dev/...")` calls with AbortController (60s timeout)

### 4.10 Fix DB Row Size Risk
- For files with 50,000+ readings, consider summarizing `daily_data` and `hourly_data` rather than storing full arrays

### 4.11 Monolithic Function Refactoring
- The 2,782-line `analyze-glucose/index.ts` should be noted for future modularization but kept as single file per Lovable edge function constraints (all code must be in index.ts)

---

## Phase 5: Auth and Session Fixes

### 5.1 Fix Session Race Condition
- **File:** `src/store/authStore.ts`
- Add a `_latestEventTimestamp` flag; `getSession` result should not overwrite a more recent `onAuthStateChange` event

### 5.2 Fix signOut Error Handling
- Replace empty `catch {}` with: `catch(e) { console.warn('Sign out failed:', e); }` and still clear local state

### 5.3 Fix "Session Expired" Toast on Manual Logout
- Track manual logout intent: set a flag before calling `signOut()`, check it in the `SIGNED_OUT` handler to suppress the expiry toast

### 5.4 Fix Post-Login Redirects
- **File:** `src/components/ProtectedRoute.tsx`
- Pass `state={{ from: location.pathname }}` in the Navigate component
- In Auth page: read `location.state?.from` and redirect back after successful login

### 5.5 Redirect Logged-In Users Away from /auth
- In Auth page component, check if user exists and redirect to `/dashboard`

### 5.6 Fix Display Name Privacy
- Replace `email.split('@')[0]` with generic fallback like `"User"` to avoid exposing email prefix publicly

### 5.7 Protect Success Routes
- Wrap `/donate/success` and `/shop/success` in ProtectedRoute or add session_id validation

### 5.8 Clear Stale Session Storage
- Clear `gf_was_logged_in` on successful auth initialization to prevent infinite loop

### 5.9 Fix Incomplete Cleanup (getSession Promise)
- Track the getSession promise and use an `isMounted` flag to prevent state updates after unmount

### 5.10 Fix Storage Key Leak
- `gf_was_logged_in` should be defensively cleared on successful sign-in, not just sign-out

### 5.11 Handle Clock Skew
- Catch JWT validation errors and surface a user-friendly message about device clock being incorrect

### 5.12 Handle Third-Party Cookie Blocking
- Wrap localStorage/sessionStorage access in try/catch to handle Brave/Safari strict mode

### 5.13 Handle Offline Mode Gracefully
- If auth initialization fails due to network, show cached state or offline message instead of broken logged-out state

### 5.14 Fix Double Initialization in Strict Mode
- Add guard in `initialize()` to prevent duplicate subscriptions if called twice

### 5.15 Add Role Verification for Admin
- Ensure AdminRoute checks role before render, not after, to prevent flash of unauthorized content

---

## Phase 6: Frontend UX Fixes

### 6.1 Fix File Size Display
- Replace `(file.size / 1024 / 1024).toFixed(1) MB` with proper formatter: <1KB show bytes, <1MB show KB, else show MB

### 6.2 Add Drag-and-Drop Validation Before Accept
- Check file type on `dragover` event and show visual rejection feedback for unsupported types

### 6.3 Add Accessibility to Drop Zone
- Add `role="button"`, `tabIndex={0}`, `onKeyDown` handler for keyboard-triggered file picker

### 6.4 Add Upload Progress Indicator
- Show indeterminate progress bar during processing (current implementation has an animated bar but no actual progress tracking)

### 6.5 Fix Retry Button
- Cache the File object in state and re-trigger `processFile()` on retry click instead of showing a toast

### 6.6 Add Data Coverage Dates
- Show actual data date range (e.g., "Oct 1 - Oct 14") from `detailedAnalysis.dataStart`/`dataEnd` in the upload list

### 6.7 Add Health Data Consent Checkbox
- Add checkbox before first upload: "I consent to AI processing of my health data"
- Store consent in user profile or localStorage

### 6.8 Fix Pagination After Delete
- Reset to page 0 and refetch after deleting an upload to prevent offset drift

### 6.9 Handle "Soon" Buttons
- Add tooltip explaining the feature is coming soon, or wire to a waitlist form

### 6.10 Add Zod Validation for mapUploadRecord
- Replace unsafe `as` type assertions with Zod schema validation for runtime safety

### 6.11 Fix getFileType Default
- Change `return 'cgm'` default to `return 'unknown'` and handle unknown type in UI gracefully

### 6.12 Fix Hidden ID Validation
- Ensure `temp-` ID is properly cleared on error state so delete button appears

### 6.13 Add Visual Data Range
- Show data coverage dates in recent uploads list alongside upload date

### 6.14 Fix Theme Inconsistency
- Verify `bg-warning/10` and `text-warning` map to valid Tailwind config tokens

### 6.15 Fix Missing Loading Skeletons
- Add skeleton states in AnalysisResultsModal for heavy chart components

### 6.16 Fix Upload Cancellation
- Add AbortController to the fetch request so users can cancel in-progress uploads

### 6.17 Fix Unformatted Confidence Score
- Guard against undefined `confidenceScore` in UI rendering

### 6.18 Fix Missing Data Export Wiring
- Validate `analysisData` completeness before passing to DataExport component

### 6.19 Fix Mobile Responsiveness
- Change 4-column grid to 3-column on medium screens to reduce vertical scroll

### 6.20 Fix Hydration Date
- Replace `new Date().toLocaleDateString()` with a stable format to avoid SSR/client mismatch

---

## Phase 7: App Architecture and Build

### 7.1 Configure QueryClient Defaults
- **File:** `src/App.tsx` line 132
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 2, refetchOnWindowFocus: false },
    mutations: { onError: (err: Error) => toast.error(err.message) }
  }
});
```

### 7.2 Fix Suspense Boundary
- Move `<Suspense>` to wrap only the route outlet area, not the entire Routes including Navigation/Sidebar

### 7.3 Add Lazy Import Error Recovery
- Wrap all `lazy()` calls in a retry utility that catches chunk load failures and does `window.location.reload()`

### 7.4 Fix Unhandled Rejection Handler
- **File:** `App.tsx` line ~171
- Add Safari ("Load failed") and Firefox ("network connection was lost") patterns to the filter
- Filter out React Query cancellation errors and AbortError

### 7.5 Remove Duplicate Toast Libraries
- Remove `@radix-ui/react-toast` dependency and `<Toaster />` from radix; keep only Sonner
- Remove the import on line 2 and the `<Toaster />` on line 305

### 7.6 Add TooltipProvider Delay
- **File:** line 304 -- Add `delayDuration={300}` to `<TooltipProvider>`

### 7.7 Move axe-core to devDependencies
- Move from `dependencies` to `devDependencies` to reduce production bundle

### 7.8 Dynamic Import Heavy Libraries
- Dynamically import `html2canvas`, `jspdf`, and `canvas-confetti` only when actually invoked

### 7.9 Fix AdminRoute Eager Import
- **File:** line 89 -- `import { AdminRoute }` should be lazy loaded with the admin route group

### 7.10 Add ThemeProvider
- Wrap app in `<ThemeProvider>` from `next-themes` for proper dark/light mode support

### 7.11 Extract Route Definitions
- Move all route definitions to a `src/routes.tsx` file with a `ROUTES` constants object for maintainability

### 7.12 Fix Query Params Dropped on Redirect
- `/glucose/upload` redirect: preserve search params by constructing destination with `useSearchParams`

### 7.13 Fix Global Promise Rejection Spam
- Filter out aborted fetch requests and React Query cancellations from toast spam

### 7.14 Fix 404 Page Context
- Render NotFound within the authenticated layout shell if user is logged in

### 7.15 Fix Admin Route Flicker
- Combine ProtectedRoute and AdminRoute into a single component to prevent sequential render checks

### 7.16 Register Service Worker
- Add service worker registration in `main.tsx` for offline caching

### 7.17 Fix ScrollToTop Behavior
- Use native browser scroll restoration for back button, only force scroll to top on forward navigation

### 7.18 Add Pre-connect Headers
- Add `<link rel="preconnect">` for Supabase URL in `index.html`

### 7.19 Fix Chunk Naming
- Add Vite rollup options to name chunks for better network debugging

### 7.20 Fix Missing ErrorElement
- Add error boundaries per route group using React Router's `errorElement`

### 7.21 Fix Double Error Boundaries
- Coordinate ErrorBoundary and unhandled rejection handler to prevent dual error messages

### 7.22 Cancel Pending Requests on Unmount
- Add AbortController to custom fetch calls in edge function invocations

### 7.23 Fix Engagement Tracking
- Verify `useEngagementTracking` uses strict dependency arrays to prevent infinite analytics events

---

## Phase 8: Medical Compliance and Edge Cases

### 8.1 Add Auto-Logout for Inactivity
- Implement 30-minute idle timer that signs out user and shows warning modal

### 8.2 Add Visibility Change Blur
- Listen for `visibilitychange` event and apply CSS blur overlay when tab is hidden

### 8.3 Handle Corrupted Dates
- If dates reset to 1970/2000, flag as "Device clock error" instead of silently dropping, show user notification

### 8.4 Fix AI Temperature Consistency
- `analyze-glucose-ai` uses `temperature: 0.7` -- change to `0.3` for clinical consistency

### 8.5 Add Patient Context to AI Prompts
- Include diabetes type (T1/T2), pregnancy status, age from user profile in AI educator prompts

### 8.6 Fix AI Token Limits
- `extractSummaryMetricsFromText` uses `max_tokens: 500` -- increase to `1500` to prevent truncation

### 8.7 Add Multi-Language Report Support
- Expand AI extraction prompts to mention Spanish/German/French CGM keywords (Glukose, Glucosa, etc.)

### 8.8 Fix AI Hallucination Risk
- Add explicit instruction in vision prompts: "If any value is unclear or blurry, return null for that field. Never guess."

### 8.9 Fix Missing System Fallback for AI Gateway
- If AI gateway returns 5xx or times out, return a user-friendly message instead of "not a CGM report"

### 8.10 Fix Legacy AI Model Reference
- `analyze-glucose-ai` uses `google/gemini-3-flash-preview` -- update to stable model identifier

### 8.11 Add HIPAA Consent Modal
- Add a first-time consent modal before accessing `/data-upload` or `/dashboard` requiring acceptance of health data processing terms

### 8.12 Fix File Hashing for Deduplication
- Hash file contents (SHA-256) client-side before uploading to reject duplicates without hitting the edge function

### 8.13 Fix Concurrent Upload State Glitch
- Use functional state updater with collected results to prevent stale closure overwrites

### 8.14 Fix Insulin/Carb Data Not Utilized
- Currently `item.insulin` and `item.carbs` are parsed but never used in statistics -- either utilize in analysis or clearly label as "not yet supported"

### 8.15 Fix Missing Pump/Bolus Parsing
- Wire parsed insulin and carb data into meal timing analysis and missed bolus detection

### 8.16 Validate AI Response for "Not a CGM Report" False Negatives
- If image metrics have `reportPeriodDays` but no glucose data, don't treat as valid -- require at least one glucose metric

### 8.17 Fix TypeScript Strictness
- Ensure `tsconfig.json` has `strict: true` and fix resulting `any` type issues

### 8.18 Fix `error: any` Types in AuthStore
- Import `AuthError` from `@supabase/supabase-js` for proper typing

### 8.19 Add Zod on Client for Upload Payloads
- Use Zod to validate the database response in `mapUploadRecord` instead of `as` casts

### 8.20 Fix Missing `date-fns-tz`
- Install `date-fns-tz` for proper timezone-aware date handling in CGM data

### 8.21 Fix Stripe JS Direct Import
- Ensure `@stripe/stripe-js` is only imported dynamically on shop/checkout pages, not at app root

### 8.22 Fix `detectMissedBoluses` O(N^2) Complexity
- Replace `sorted.slice().some()` inside loop with sliding window pointer approach

### 8.23 Fix `entryMatch[1]` Memory in Regex Loops
- Set `entryMatch = null` after processing to allow GC for large XML files

### 8.24 Fix Interpolation Bounds in Percentile Function
- **File:** line ~1769-1776
- Add bounds check: `if (upper >= sorted.length) return sorted[sorted.length - 1]`

### 8.25 Fix CSV Column Matching Fallback
- Don't default `valueCol = 1` if column 1 header is not glucose-related

### 8.26 Fix Missing Error Tracking
- Note: No Sentry/Datadog integration planned currently, but improve error logging in catch blocks

### 8.27 Fix Window Reference in AuthStore
- Note: `window.location.origin` is fine for SPA; SSR migration would require separate handling

### 8.28 Add MFA Support
- Note for future: Add AAL2 check in auth flow for medical compliance

### 8.29 Fix Onboarding Interceptor
- If user hasn't completed profile (diabetes type), redirect from /dashboard to /profile with setup wizard

### 8.30 Fix Stripe Redirect Validation
- `/shop/success` should validate `session_id` query param and prevent duplicate fulfillment on refresh

### 8.31 Fix Sonner/Toaster Z-Index Conflict
- Remove duplicate Toaster to eliminate positioning conflicts

### 8.32 Implement Proper File Size Limiting on Server
- The 10MB limit is checked client-side; add server-side enforcement via `validateBodySize`

### 8.33 Fix Broken Scroll Anchor
- ScrollToTop should check for URL hash and skip scroll-to-top when hash is present

### 8.34 Add Missing ENV Validations
- Validate `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` at boot with clear error message

---

## Implementation Order

1. **Phase 1** -- Clinical math fixes (patient safety)
2. **Phase 2** -- Security hardening (data protection)
3. **Phase 3** -- Parsing accuracy (data integrity)
4. **Phase 4** -- Architecture (stability/performance)
5. **Phase 5** -- Auth/session (user experience)
6. **Phase 6** -- Frontend UX (polish)
7. **Phase 7** -- App architecture (maintainability)
8. **Phase 8** -- Compliance and edge cases

## Files Modified

- `supabase/functions/analyze-glucose/index.ts` (major refactor -- phases 1, 3, 4)
- `supabase/functions/analyze-glucose-ai/index.ts` (phase 8)
- `supabase/functions/ai-center-predictions/index.ts` (phase 2)
- `supabase/functions/admin-users/index.ts` (phase 2)
- `supabase/functions/send-push-notification/index.ts` (phase 2)
- `supabase/functions/notification-triggers/index.ts` (phase 2)
- `supabase/functions/create-shop-checkout/index.ts` (phase 2)
- `supabase/functions/daily-briefing/index.ts` (phase 2)
- `supabase/functions/send-weekly-digest/index.ts` (phase 2)
- `supabase/functions/t1d-companion-chat/index.ts` (phase 2)
- `supabase/functions/ai-connection-analyzer/index.ts` (phase 2)
- `supabase/functions/ai-discovery-analyzer/index.ts` (phase 2)
- `supabase/functions/create-donation/index.ts` (phase 2)
- All `seed-*` edge functions (phase 2 -- auth check)
- `src/pages/DataUpload.tsx` (phases 4, 6)
- `src/App.tsx` (phases 5, 7)
- `src/store/authStore.ts` (phase 5)
- `src/components/ProtectedRoute.tsx` (phase 5)
- `src/pages/Auth.tsx` (phase 5)
- Database migration for storage bucket (phase 4)
- New utility files: `src/utils/lazyRetry.ts`, `src/utils/formatFileSize.ts`, `src/routes.tsx`

## Notes

- Each phase can be deployed independently
- Phase 1 is the most critical and will be implemented first
- The plan addresses all 200+ issues from every category listed
- Some items marked as "Note for future" where implementation requires user decisions or is out of scope for immediate fixes (MFA, SSR migration, Sentry integration)

