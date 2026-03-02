# Updated Comprehensive Fix Plan: Waves 8 + 9

This plan retains ALL existing items from Phases 1-14 (Wave 8) and adds Wave 9 enhancements as **Phases 15-20**. Cross-cutting impacts on existing phases are noted inline.

---

## Phase 1: Clinical Math + Medical Safety (Wave 8 - P0)

**1.1** Validate TIR calculation uses correct thresholds (70-180 mg/dL standard, configurable)
**1.2** CV calculation must use Bessel's correction (N-1 denominator)
**1.3** MAGE calculation: directional swings with 1-SD threshold, 30-min gap handling
**1.4** GVI: compare actual path length to ideal straight-line path
**1.5** GMI requires minimum 10 days of CGM data
**1.6** Auto-detect mmol/L values (value * 18.018 conversion)
**1.7** Handle data deduplication by timestamp
**1.8** Support customizable TIR targets
**1.9** Configurable hours for Dawn Phenomenon detection
**1.10** Configurable meal spike windows
**1.11** Accommodate varied user schedules and timezones
**1.12** Validate all glucose math against ADA clinical standards
**1.13** Ensure AGP percentile calculations are statistically sound
**1.14** Risk matrix heatmap calculations verified
**1.15** Trend prediction confidence intervals validated
**1.16** CGM Compression Low Detection
**1.17** Hypoglycemia Unawareness Detection
**1.18** Insulin Stacking / IOB Calculation
**1.19** Exercise Type Differentiation
**1.20** Menstrual Cycle Impact
**1.21** Pregnancy Mode Toggle
**1.22** Pediatric Threshold Mode
**1.23** Data Completeness Warning
**1.24** BG vs CGM Visual Separation
**1.25** Carb Ratio Awareness

---

## Phase 2: Security Hardening (Wave 8 - P0)

**2.1-2.8** Core RLS, JWT, body size, CORS, sanitization, SQL injection, rate limiting, session handling
**2.9** Filename Sanitization
**2.10** Quarantine Content Filtering
**2.11** Content Sanitization Upgrade (DOMPurify)
**2.12** Signed URLs for Exports
**2.13** Storage Bucket RLS
**2.14** Service Worker PHI Caching
**2.15** Supabase Key Logging Prevention
**2.16** Realtime Filter Enforcement
**2.17** Magic Link Pre-fetch Protection
**2.18** Analytics PII Hashing
**2.19** Adult Content Server-Side Filtering

---

## Phase 3: Data Parsing (Wave 8 - P1)

**3.1-3.10** CSV/Excel/XML/Nightscout/Vision parsers, unit detection, timestamp normalization, dedup, validation, error reporting

---

## Phase 4: Architecture + Performance (Wave 8 - P1)

**4.1-4.11** Modular edge functions, shared utils, query optimization, pagination, caching, error handling, logging, health checks, graceful degradation, batch processing, connection pooling
**4.12** Snapshot Generator Safety (UUID temp filenames)
**4.13** Scheduled Maintenance Deadlocks (batched deletes)
**4.14** Medicare/FDA Feed Streaming

---

## Phase 5: Auth/Session (Wave 8 - P1)

**5.1-5.8** Email/password auth, session persistence, route guards, profile management, password reset, email verification, session timeout, multi-device

---

## Phase 6: Frontend UX (Wave 8 - P2)

**6.1-6.20** Loading states, error boundaries, toasts, form validation, responsive, dark/light, keyboard nav, screen reader, progressive disclosure, optimistic UI, empty states, pagination, search debounce, filter persistence, breadcrumbs, confirmation dialogs, drag-drop upload, chart interactivity, print layouts, share functionality
**6.21** Modal Back Button Support
**6.22** Reduced Motion for Confetti
**6.23** Chart Animation Disable on Mobile
**6.24** ResizeObserver Debounce
**6.25** Data Quality Empathetic Framing
**6.26** Truncation in Dropdowns
**6.27** Dynamic Viewport Height (dvh)
**6.28** Recharts Y-Axis Width
**6.29** Broken Avatar Fallback
**6.30** Non-Breaking Space Normalization

---

## Phase 7: App Architecture (Wave 8 - P2)

**7.1-7.23** Code splitting, lazy loading, Zustand, React Query, bundle size, image/font optimization, SW, PWA, analytics, error tracking, performance monitoring, SEO, sitemap, robots.txt, OG tags, JSON-LD, canonicals, 404, redirects, env config, build optimization, CI/CD
**7.24** Route Transition Loading Indicator
**7.25** Vite Vendor Chunk Splitting
**7.26** PostCSS Preset Env
**7.27** Build Target es2020
**7.28** Query Cache Clear on Logout
**7.29** React Query Offline Mutations

---

## Phase 8: AI Prompts (Wave 8 - P1)

**8.1-8.10** System prompts, temperature, patient context, hallucination prevention, response format, token limits, fallbacks, prompt versioning, A/B testing, usage tracking

---

## Phase 9: E-Commerce / Financial Integrity (Wave 8 - P1)

**9.1** Float-to-Cents Conversion
**9.2** Cart Persistence
**9.3** Donation Minimum/Maximum
**9.4** Shop Success Validation
**9.5** Webhook Event Coverage
**9.6** Checkout Idempotency
**9.7** Double-Click Prevention
**9.8** Donation Impact Desync

---

## Phase 10: Database Optimization (Wave 8 - P2)

**10.1** B-Tree Indexes on user_id FKs
**10.2** GIN Indexes for Search (pg_trgm)
**10.3** Enum Types for statuses
**10.4** Soft Deletes
**10.5** VARCHAR Constraints
**10.6** Foreign Key Cascades
**10.7** Materialized Views
**10.8** Consent Audit Log
**10.9** TIMESTAMPTZ Enforcement
**10.10** UUID v7
**10.11** Row Size Monitoring

---

## Phase 11: Medical Compliance / Legal (Wave 8 - P0)

**11.1** AI Interaction Checker Guardrails
**11.2** Insulin Dosage Refusal
**11.3** Mental Health Crisis Interstitial (988)
**11.4** Geolocation Fuzzing
**11.5** Community Fix Pre-Moderation
**11.6** A1C → GMI Relabeling
**11.7** "Cure" → "Therapeutic Advancements"
**11.8** Pharmacodynamics Disclaimer
**11.9** FHIR/HL7 Export
**11.10** GDPR Right to Rectification
**11.11** COPPA Pediatric Consent
**11.12** FDA MedWatch Link
**11.13** k-Anonymity
**11.14** CCPA/GDPR Hard Deletion
**11.15** Dynamic Medical Disclaimer

---

## Phase 12: AI Prompt Engineering (Wave 8 - P1)

**12.1** Prompt Injection Firewall
**12.2** PII Scrubbing Middleware
**12.3** AI Hallucination Disclaimers
**12.4** Chat Context Window Limit
**12.5** Source URL Verification
**12.6** Device Context in Prompts
**12.7** SSE Streaming for Chat
**12.8** Chat Export PHI Warning
**12.9** Blob URL Memory Cleanup
**12.10** AI Token Limit for Analysis
**12.11** Seed Data Hallucination Prevention

---

## Phase 13: Component-Level Fixes (Wave 8 - P2)

**13.1** Bayesian Averaging for Reviews
**13.2** Double-Submission Prevention
**13.3** Carousel Virtualization
**13.4** Form Draft Preservation
**13.5** Markdown XSS Prevention (rehype-sanitize)
**13.6** DataRefreshBanner Timer Isolation
**13.7** Resize Observer Debounce
**13.8** DeviceMetricsCard Null Handling
**13.9** SavePostNotesModal Unsaved Warning
**13.10** SavePostNotesModal Character Limit
**13.11** MedicationUsageStats Grouping ("Other")
**13.12** FearsCloud Screen Reader
**13.13** Nickname Generator Uniqueness
**13.14** PeerComparisonPanel k-Anonymity
**13.15** InteractiveTimeline Lazy Loading
**13.16** CitationNetwork Canvas/WebGL
**13.17** TrendingDeviceIssues Time Decay
**13.18** MentalHealthAssessment Draft Saving
**13.19** Radix Portal Z-Index Management
**13.20** Prop Consolidation for AnalysisResultsModal

---

## Phase 14: i18n / Accessibility / Polish (Wave 8 - P3)

**14.1** Locale-Aware Formatting
**14.2** Calendar Week Start
**14.3** Hardcoded Currency
**14.4** Date Format Localization
**14.5** Missing Alt Text
**14.6** Aria-Live Regions
**14.7** Touch Targets (44x44px)
**14.8** Focus-Visible Rings
**14.9** Skeleton Loader Delay
**14.10** Orphaned Toasts on Navigation
**14.11** Data Portability Export
**14.12** Overscroll Behavior
**14.13** Skip Link Validation
**14.14** Accessible Form Labels
**14.15** RTL Layout Support
**14.16** High-Contrast Persistent Toggle
**14.17** Touch-Action for Sliders
**14.18** robots.txt PHI Protection

---

## Phase 15: Advanced Clinical and Physiological Modeling (Wave 9 - P1)

### Cross-Phase Impact
- Phase 1 items 1.18 (IOB), 1.19 (Exercise), 1.20 (Menstrual) are **expanded** here. Phase 1 = basic guards; Phase 15 = full clinical models.

**15.1 Pharmacokinetic/Pharmacodynamic Insulin Curves**
Replace static sine/cosine curves in `InsulinTimingChart.tsx` with compartment-model math (simplified Hovorka model). Accept user-specific parameters: body weight (kg), insulin analog type (Fiasp, Novolog, Humalog, Lyumjev), and insulin sensitivity factor.
- Files: `src/components/medicine/InsulinTimingChart.tsx`, new `src/utils/insulinModels.ts`
- DB: Add `insulin_analog`, `body_weight_kg`, `insulin_sensitivity_factor` to `profiles`

**15.2 Macronutrient Gastric Emptying / "Pizza Effect" Logic**
Update `analyze-glucose` post-meal spike detection for meal composition tags (high-fat, high-protein, mixed). Extend glucose rise window from 2h to 3-6h. Add dual-wave bolus recommendation.
- Files: `supabase/functions/analyze-glucose/index.ts`, `supabase/functions/analyze-glucose-ai/index.ts`
- UI: Add meal composition selector to `Journal.tsx`

**15.3 Illness and Stress Day Tagging**
Add "Sick Day" and "High Stress" toggles to Journal. Exclude tagged days from baseline SD, CV, TIR.
- Files: `src/pages/Journal.tsx`, `supabase/functions/analyze-glucose/index.ts`
- DB: Add `is_sick_day` boolean and `stress_level` enum to `shifts`

**15.4 Exercise Intensity Stratification**
Differentiate aerobic vs anaerobic/HIIT in `ExerciseCorrelationCard.tsx`. Separate correlation curves. AI warns about hepatic glucose release from anaerobic exercise.
- Files: `src/components/glucose/ExerciseCorrelationCard.tsx`, `supabase/functions/analyze-glucose-ai/index.ts`

**15.5 Menstrual/Hormonal Cycle Integration (Full Model)**
Full cycle tracker in Settings. Overlay luteal-phase patterns in `SeasonalPatternsTab.tsx`. AI annotates insulin resistance.
- Files: `src/pages/Settings.tsx`, `src/components/public-glucose/SeasonalPatternsTab.tsx`
- DB: New `cycle_logs` table

---

## Phase 16: Data Interoperability and Ecosystem Integration (Wave 9 - P1)

**16.1 Nightscout Live-Sync**
Edge function + CRON (15 min) to fetch from user's Nightscout instance.
- New: `supabase/functions/nightscout-sync/index.ts`
- DB: Add `nightscout_url`, `nightscout_api_secret_hash` to `profiles`

**16.2 Standardized AGP PDF Export**
Industry-standard AGP 1-pager for Epic/Cerner EMR. Median, percentile bands, TIR/GMI/CV box.
- Files: `src/utils/pdfExport.ts`

**16.3 Dietary Database Search (USDA FoodData Central)**
Edge function proxy to USDA API. Autocomplete food search in Journal.
- New: `supabase/functions/food-search/index.ts`, `src/components/journal/FoodSearchAutocomplete.tsx`

**16.4 Apple HealthKit / Google Health Connect Guidance**
"Connect Your Device" section in Settings with export guides.
- New: `src/components/settings/DeviceConnectionGuide.tsx`

**16.5 FHIR/HL7 Export**
FHIR R4 Bundle export with LOINC codes.
- New: `src/utils/fhirExport.ts`

---

## Phase 17: Admin Governance, Trust and Safety (Wave 9 - P1)

**17.1 Admin User Impersonation with Audit Log**
Read-only "View as User" in `AdminUsers.tsx`. Persistent red banner. `admin_audit_log` table.
- New: `src/components/admin/ImpersonationBanner.tsx`, `supabase/functions/admin-impersonate/index.ts`
- DB: New `admin_audit_log` table

**17.2 Automated Self-Harm Detection**
Keyword + AI screening in `content-safety` edge function. 988 Crisis Lifeline overlay.
- New: `supabase/functions/content-safety/index.ts`

**17.3 Verified Medical Professional Badges**
NPI verification via NPPES API. Admin verification queue.
- New: `supabase/functions/verify-npi/index.ts`
- DB: New `professional_verification` table

**17.4 Content Versioning and Edit History**
`post_revisions` table. Diff view in admin. "Edited" label for users.
- DB: New `post_revisions` table

---

## Phase 18: Next-Generation Features (Wave 9 - P2)

**18.1 Voice-to-Text Logging**
Web Speech API mic button. AI parses transcription into structured fields.
- New: `src/hooks/useSpeechToText.ts`, `supabase/functions/parse-voice-log/index.ts`

**18.2 Predictive Alerting via Push**
Analyze 14-day patterns for recurring time-of-day lows. Push notifications.
- Files: `supabase/functions/send-trending-alerts/index.ts`

**18.3 Widget Deep-Linking**
Clickable chart data points → `/data-upload?date=YYYY-MM-DD&highlight=true`
- Files: `src/components/dashboard/DashboardWidgets.tsx`, `src/pages/DataUpload.tsx`

**18.4 Device End-of-Life Tracker**
Warranty expiration tracking. Proactive alerts at 6 months.
- DB: New `user_devices` table
- Files: `src/components/device/DeviceMetricsCard.tsx`

**18.5 Offline-First Data Access**
Service worker + IndexedDB for last 7 days. "Offline Mode" banner. Mutation queue.
- Files: `public/sw.js`, new `src/utils/offlineSync.ts`, `src/hooks/useOfflineStatus.ts`

---

## Phase 19: Platform Security and Data Integrity (Wave 9 - P1)

**19.1 E2EE for Journals and DMs**
Web Crypto API (AES-GCM). PBKDF2 key derivation. Ciphertext-only storage.
- New: `src/utils/encryption.ts`

**19.2 Data Retention Engine**
Monthly CRON. 2-year inactivity warning. Anonymization after 30 days.
- New: `supabase/functions/data-retention-check/index.ts`

**19.3 Idempotency Keys on All Mutations**
Client-side UUID keys. Backend 409 Conflict on duplicates.
- New: `src/utils/idempotency.ts`
- DB: Add `idempotency_key` to submission tables

**19.4 Feature Flag System**
`feature_flags` table. `useFeatureFlag` hook. Admin UI.
- DB: New `feature_flags` table
- New: `src/hooks/useFeatureFlag.ts`, `src/pages/admin/AdminFeatureFlags.tsx`

**19.5 Shared Zod Schema Package**
`src/schemas/` directory for all edge function contracts.
- New: `src/schemas/glucose.ts`, `journal.ts`, `community.ts`, `shop.ts`

---

## Phase 20: UI/UX Polishing (Wave 9 - P3)

**20.1 Haptic Feedback for Critical Events**
`navigator.vibrate()` with feature detection. Respects `prefers-reduced-motion`.
- New: `src/utils/haptics.ts`

**20.2 Skeleton Theme Sync**
`variant` prop on `skeleton.tsx` matching parent container background.
- Files: `src/components/ui/skeleton.tsx`

**20.3 Sticky Table Headers**
`position: sticky` on comparison table headers.
- Files: `src/pages/CompanyComparison.tsx`, `src/pages/MedicineComparison.tsx`

**20.4 Graceful AI Loading States**
Rotating "Did you know?" facts after 3s wait.
- New: `src/hooks/useAILoadingFacts.ts`

---

## Implementation Order

| Phase | Priority | Description | Source |
|-------|----------|-------------|--------|
| 1 | P0 | Clinical math + medical safety | Wave 8 |
| 2 | P0 | Security hardening | Wave 8 |
| 11 | P0 | Medical compliance / Legal | Wave 8 |
| 3 | P1 | Data parsing | Wave 8 |
| 4 | P1 | Architecture + performance | Wave 8 |
| 5 | P1 | Auth/session | Wave 8 |
| 8 | P1 | AI prompts | Wave 8 |
| 9 | P1 | E-Commerce / Financial | Wave 8 |
| 12 | P1 | AI prompt engineering | Wave 8 |
| 15 | P1 | Advanced clinical modeling | Wave 9 |
| 16 | P1 | Data interoperability | Wave 9 |
| 17 | P1 | Admin governance / trust | Wave 9 |
| 19 | P1 | Platform security / integrity | Wave 9 |
| 6 | P2 | Frontend UX | Wave 8 |
| 7 | P2 | App architecture | Wave 8 |
| 10 | P2 | Database optimization | Wave 8 |
| 13 | P2 | Component-level fixes | Wave 8 |
| 18 | P2 | Next-gen features | Wave 9 |
| 14 | P3 | i18n / Accessibility | Wave 8 |
| 20 | P3 | UI/UX polishing | Wave 9 |

## Summary

- **Wave 8 items**: ~178 items across 14 phases
- **Wave 9 items**: 25 items across 6 new phases (15-20)
- **Total**: ~203 items across 20 phases
- **New DB tables**: `cycle_logs`, `admin_audit_log`, `post_revisions`, `user_devices`, `feature_flags`, `professional_verification`
- **New Edge Functions**: `nightscout-sync`, `food-search`, `admin-impersonate`, `content-safety`, `verify-npi`, `parse-voice-log`, `data-retention-check`
- **New utilities**: `insulinModels.ts`, `encryption.ts`, `idempotency.ts`, `haptics.ts`, `offlineSync.ts`, `fhirExport.ts`
- **New hooks**: `useSpeechToText`, `useFeatureFlag`, `useOfflineStatus`, `useAILoadingFacts`
