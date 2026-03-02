

# Updated Comprehensive Fix Plan: Waves 8 + 9

This plan retains ALL existing items from Phases 1-14 (Wave 8) and adds Wave 9 enhancements as **Phases 15-20**. Cross-cutting impacts on existing phases are noted inline.

---

## Phases 1-14: UNCHANGED (Wave 8)

All 178 items across the existing 14 phases remain exactly as defined. The following Wave 9 enhancements are additive and organized into 6 new phases.

---

## Phase 15: Advanced Clinical and Physiological Modeling (Wave 9)

### Cross-Phase Impact
- Phase 1 items 1.19 (Exercise Type Differentiation), 1.20 (Menstrual Cycle), and 1.18 (IOB) are **expanded** by the items below but NOT removed from Phase 1. Phase 1 implements the basic guards; Phase 15 implements the full clinical models.

### New Items

**15.1 Pharmacokinetic/Pharmacodynamic Insulin Curves**
Replace the static sine/cosine curves in `InsulinTimingChart.tsx` with compartment-model math (simplified Hovorka model). Accept user-specific parameters: body weight (kg), insulin analog type (Fiasp, Novolog, Humalog, Lyumjev), and insulin sensitivity factor. Calculate IOB decay dynamically rather than using fixed onset/peak/duration triplets.
- Files: `src/components/medicine/InsulinTimingChart.tsx`, new `src/utils/insulinModels.ts`
- DB: Add `insulin_analog`, `body_weight_kg`, `insulin_sensitivity_factor` columns to `profiles` table

**15.2 Macronutrient Gastric Emptying / "Pizza Effect" Logic**
Update `analyze-glucose` post-meal spike detection to accept meal composition tags (high-fat, high-protein, mixed). When tagged as high-fat/protein, extend the expected glucose rise window from 2 hours to 3-6 hours. Add dual-wave bolus recommendation in AI insights when delayed absorption is detected.
- Files: `supabase/functions/analyze-glucose/index.ts`, `supabase/functions/analyze-glucose-ai/index.ts`
- UI: Add meal composition selector (Simple Carb / Mixed / High Fat+Protein) to `Journal.tsx` form

**15.3 Illness and Stress Day Tagging**
Add "Sick Day" and "High Stress" toggle buttons to the Journal entry form (`Journal.tsx`). Tag these entries in the `shifts` table. Update `analyze-glucose` to mathematically exclude illness/stress-tagged days from baseline SD, CV, and TIR calculations so anomaly days don't corrupt the user's standard metrics.
- Files: `src/pages/Journal.tsx`, `supabase/functions/analyze-glucose/index.ts`
- DB: Add `is_sick_day` boolean and `stress_level` enum to `shifts` table

**15.4 Exercise Intensity Stratification**
Upgrade `ExerciseCorrelationCard.tsx` to differentiate aerobic (sustained cardio) vs anaerobic/HIIT (sprints, weights). Display separate correlation curves. Update AI prompts to warn that anaerobic exercise triggers hepatic glucose release (spikes BG) while aerobic increases insulin sensitivity for up to 24 hours.
- Files: `src/components/glucose/ExerciseCorrelationCard.tsx`, `supabase/functions/analyze-glucose-ai/index.ts`

**15.5 Menstrual/Hormonal Cycle Integration (Full Model)**
Expand Phase 1 item 1.20 into a full cycle tracker. Add a cycle phase log UI in Settings/Profile. Feed cycle phase data into `SeasonalPatternsTab.tsx` to overlay luteal-phase insulin resistance patterns. AI engine must annotate "Luteal phase detected -- expect 20-40% higher insulin needs" when applicable.
- Files: `src/pages/Settings.tsx`, `src/components/public-glucose/SeasonalPatternsTab.tsx`, `supabase/functions/analyze-glucose-ai/index.ts`
- DB: New `cycle_logs` table (user_id, phase, start_date, end_date)

---

## Phase 16: Data Interoperability and Ecosystem Integration (Wave 9)

**16.1 Nightscout Live-Sync via Edge Function**
Add Nightscout URL + API Secret fields to `Settings.tsx`. Create a new `nightscout-sync` edge function triggered by CRON (every 15 minutes) that fetches new entries from the user's Nightscout instance and inserts them into the uploads/readings pipeline. Validate API secret server-side only.
- Files: New `supabase/functions/nightscout-sync/index.ts`, `src/pages/Settings.tsx`
- DB: Add `nightscout_url` (encrypted) and `nightscout_api_secret_hash` to `profiles`
- CRON: Schedule every 15 minutes

**16.2 Standardized AGP PDF Export**
Update `src/utils/pdfExport.ts` to generate an industry-standard AGP (Ambulatory Glucose Profile) 1-page report matching the format used by Epic/Cerner EMR systems. Include: median line, 10th/25th/75th/90th percentile bands, daily glucose profiles overlay, TIR/GMI/CV summary box, and data sufficiency indicator.
- Files: `src/utils/pdfExport.ts`

**16.3 Dietary Database Search (USDA FoodData Central)**
Create a `food-search` edge function that proxies requests to the USDA FoodData Central API (free, no key required). Integrate into `Journal.tsx` with an autocomplete food search field that auto-populates carb/fat/protein grams when a user selects a food item.
- Files: New `supabase/functions/food-search/index.ts`, `src/pages/Journal.tsx`
- New component: `src/components/journal/FoodSearchAutocomplete.tsx`

**16.4 Apple HealthKit / Google Health Connect Guidance**
Add a "Connect Your Device" section in Settings with instructions for Dexcom Clarity share, LibreLinkUp, and Tidepool export. For Capacitor-wrapped builds, document the path to native HealthKit/Health Connect plugins. For web-only users, provide clear step-by-step CSV export guides per device.
- Files: `src/pages/Settings.tsx`, new `src/components/settings/DeviceConnectionGuide.tsx`

**16.5 FHIR/HL7 Export**
Extend the "Export My Data" feature (Phase 14, item 11) to include a FHIR R4 Bundle export option. Map glucose observations to `Observation` resources and medication logs to `MedicationStatement` resources using standard LOINC codes.
- Files: New `src/utils/fhirExport.ts`, `src/pages/Settings.tsx`

---

## Phase 17: Admin Governance, Trust and Safety (Wave 9)

**17.1 Admin User Impersonation with Audit Log**
Add a "View as User" button in `AdminUsers.tsx` that creates a read-only session mirroring the target user's data. Log every impersonation event (admin_id, target_user_id, start_time, end_time, actions_taken) in a new `admin_audit_log` table. Display a persistent red banner "Viewing as [User]" during impersonation. Impersonation sessions are read-only -- no mutations allowed.
- Files: `src/pages/admin/AdminUsers.tsx`, new `src/components/admin/ImpersonationBanner.tsx`
- DB: New `admin_audit_log` table with RLS restricting to admins
- Edge function: New `admin-impersonate` that returns user's data context

**17.2 Automated Self-Harm Detection (Expanded from Phase 11.12)**
Expand Phase 11 item 12 (PHQ-9 crisis interstitial). Add keyword-based detection in community post submissions and chat messages. Create a `content-safety` edge function that screens text for self-harm indicators using a curated keyword list + AI classification. Flagged content goes to `QuarantineTable` and triggers immediate 988 Crisis Lifeline overlay.
- Files: New `supabase/functions/content-safety/index.ts`, `src/components/community/`, `src/components/mental-health/MentalHealthAssessmentSection.tsx`

**17.3 Verified Medical Professional Badges**
Add NPI (National Provider Identifier) verification flow: user submits NPI number, admin validates against the NPPES NPI Registry API, and grants a "Verified Medical Professional" badge. Display badge in community posts and solution responses.
- DB: Add `npi_number`, `is_verified_professional` boolean to `profiles` or new `professional_verification` table
- Files: `src/pages/Settings.tsx`, new `supabase/functions/verify-npi/index.ts`, community post components
- Admin: Add verification queue in admin dashboard

**17.4 Content Versioning and Edit History**
Create a `post_revisions` table. On every edit of a community post or solution, insert the previous version as a revision. Admin dashboard shows full edit history with diff view. Users see "edited" label with timestamp.
- DB: New `post_revisions` table (post_id, previous_content, previous_title, edited_by, edited_at, revision_number)
- Files: Community post edit components, admin content moderation views

---

## Phase 18: Next-Generation Features (Wave 9)

**18.1 Voice-to-Text Logging**
Add a microphone button to `InlineSubmissionForm.tsx` and `Journal.tsx` using the Web Speech API (`webkitSpeechRecognition`). On transcription complete, pass the raw text to an AI edge function that parses it into structured fields (insulin units, carb grams, food description, activity type). Graceful fallback for unsupported browsers.
- Files: `src/components/experience/InlineSubmissionForm.tsx`, `src/pages/Journal.tsx`
- New: `src/hooks/useSpeechToText.ts`, `supabase/functions/parse-voice-log/index.ts`

**18.2 Predictive Alerting via Push Notifications**
Extend `send-trending-alerts` edge function to analyze user's historical patterns and generate predictive alerts. Example: "You typically go low around 3 PM on weekdays. Consider a small snack." Use the last 14 days of journal data to detect recurring time-of-day patterns. Send via existing push notification infrastructure.
- Files: `supabase/functions/send-trending-alerts/index.ts` (or new `predictive-alerts` function)

**18.3 Widget Deep-Linking**
In `DashboardWidgets.tsx`, make chart data points clickable. Clicking navigates to `/data-upload?date=YYYY-MM-DD&highlight=true` which opens the analysis modal scrolled to that specific day's data.
- Files: `src/components/dashboard/DashboardWidgets.tsx`, `src/pages/DataUpload.tsx`

**18.4 Device End-of-Life Tracker**
Add pump/CGM warranty expiration date fields to `DeviceMetricsCard.tsx` and user profile. When a device is within 6 months of warranty expiration, surface a proactive alert card linking to `DeviceComparison.tsx` and insurance authorization resources. Store warranty dates in a new `user_devices` table.
- DB: New `user_devices` table (user_id, device_id, purchase_date, warranty_expiration, serial_number)
- Files: `src/components/device/DeviceMetricsCard.tsx`, `src/pages/DeviceComparison.tsx`

**18.5 Offline-First Data Access**
Implement a service worker caching strategy for critical user data (last 7 days of glucose readings, journal entries, medication schedule). Use Cache API with network-first for API calls and cache-first for static assets. Show "Offline Mode" banner when disconnected. Queue mutations for sync on reconnection using IndexedDB.
- Files: `public/sw.js` (expand existing), new `src/utils/offlineSync.ts`, `src/hooks/useOfflineStatus.ts`
- Note: Full RxDB/WatermelonDB integration deferred as advisory; IndexedDB + Cache API is sufficient for web-first approach

---

## Phase 19: Platform Security and Data Integrity (Wave 9)

### Cross-Phase Impact
- Phase 2 security items remain unchanged. Phase 19 adds new categories not covered by Phase 2.

**19.1 End-to-End Encryption for Journals and DMs**
Implement client-side encryption using the Web Crypto API (AES-GCM) for journal entries (`EntryModal.tsx`) and direct messages (`DirectMessagePanel.tsx`). Generate per-user encryption keys derived from their password via PBKDF2. Store only ciphertext in the database. Decrypt client-side on read.
- Files: New `src/utils/encryption.ts`, `src/components/experience/EntryModal.tsx`, `src/components/find-diabetics/DirectMessagePanel.tsx`
- Warning: Key management is complex; implement key backup/recovery flow

**19.2 Data Retention and Right-to-be-Forgotten Engine**
Create a `data-retention-check` CRON edge function (monthly). Query for users inactive >2 years. Send warning email via Resend. After 30 days with no login, anonymize their data (replace PII with hashes, keep aggregate statistics). Log all actions in `consent_audit_log` (Phase 10).
- Files: New `supabase/functions/data-retention-check/index.ts`
- CRON: Monthly schedule

**19.3 Idempotency Keys on All Mutations**
Generate UUID idempotency keys client-side for every form submission. Add `idempotency_key` column to tables receiving user submissions (community_posts, device_reviews, medication_reviews, shifts, experience_submissions). Backend rejects duplicates with 409 Conflict.
- Files: New `src/utils/idempotency.ts`, all form submission components and their corresponding edge functions/DB calls
- DB: Add `idempotency_key` (unique, nullable) to relevant tables

**19.4 Feature Flag System**
Create a `feature_flags` table in the database with columns: flag_name, is_enabled, rollout_percentage, created_at. Build a `useFeatureFlag` hook that checks flags on mount. Wrap experimental/unstable components with feature flag checks. Admin UI to toggle flags without redeployment.
- DB: New `feature_flags` table (flag_name VARCHAR PRIMARY KEY, is_enabled BOOLEAN, rollout_pct INT, description TEXT)
- Files: New `src/hooks/useFeatureFlag.ts`, `src/pages/admin/AdminFeatureFlags.tsx`
- RLS: Public read, admin-only write

**19.5 Shared Zod Schema Package**
Create `src/schemas/` directory with Zod schemas for all edge function request/response contracts. Import these schemas in both frontend form validation and edge function input validation to ensure strict type compliance across the network boundary.
- Files: New `src/schemas/glucose.ts`, `src/schemas/journal.ts`, `src/schemas/community.ts`, `src/schemas/shop.ts`
- Update: All edge functions to import and validate against these schemas

---

## Phase 20: UI/UX Polishing (Wave 9)

### Cross-Phase Impact
- Phase 6 and 14 UX items remain. Phase 20 adds new interaction patterns.

**20.1 Haptic Feedback for Critical Events**
Add `navigator.vibrate()` calls (with feature detection) for: achievement unlocks in `AchievementUnlockModal.tsx`, severe pattern detection alerts, and critical low blood sugar warnings. Respect `prefers-reduced-motion` (ties into Phase 6.22).
- Files: New `src/utils/haptics.ts`, achievement/alert components

**20.2 Skeleton Theme Sync**
Update `src/components/ui/skeleton.tsx` to accept a `variant` prop that adjusts the skeleton background based on the parent container's background color (e.g., card vs page). Use CSS custom properties to inherit from the nearest Card ancestor.
- Files: `src/components/ui/skeleton.tsx`

**20.3 Sticky Table Headers**
Add `position: sticky; top: 0; z-index: 10` to comparison table headers in `CompanyComparisonBar.tsx` and `MedicineCompareBar.tsx` (and their associated comparison pages). Ensure the header row stays visible during vertical scroll through 20+ rows.
- Files: `src/pages/CompanyComparison.tsx`, `src/pages/MedicineComparison.tsx`, relevant comparison table components

**20.4 Graceful AI Loading States**
When `DynamicPredictions.tsx` or any AI chat component takes >3 seconds to respond, display a rotating array of "Did you know?" diabetes facts. Implement as a `useAILoadingFacts` hook with a curated list of 20+ educational snippets.
- Files: `src/components/ai-center/DynamicPredictions.tsx`, new `src/hooks/useAILoadingFacts.ts`, all AI chat components

---

## Updated Implementation Order

| Phase | Priority | Description | Source |
|-------|----------|-------------|--------|
| 1 | P0 | Clinical math + medical safety | Wave 8 |
| 2 | P0 | Security hardening | Wave 8 |
| 3 | P1 | Data parsing | Wave 8 |
| 4 | P1 | Architecture + performance | Wave 8 |
| 5 | P1 | Auth/session | Wave 8 |
| 6 | P2 | Frontend UX | Wave 8 |
| 7 | P2 | App architecture | Wave 8 |
| 8 | P1 | AI prompts (Wave 8) | Wave 8 |
| 9 | P1 | E-Commerce / Financial | Wave 8 |
| 10 | P2 | Database optimization | Wave 8 |
| 11 | P0 | Medical compliance / Legal | Wave 8 |
| 12 | P1 | AI prompt engineering | Wave 8 |
| 13 | P2 | Component-level fixes | Wave 8 |
| 14 | P3 | i18n / Accessibility | Wave 8 |
| 15 | P1 | Advanced clinical modeling | Wave 9 |
| 16 | P1 | Data interoperability | Wave 9 |
| 17 | P1 | Admin governance / trust | Wave 9 |
| 18 | P2 | Next-gen features | Wave 9 |
| 19 | P1 | Platform security / integrity | Wave 9 |
| 20 | P3 | UI/UX polishing | Wave 9 |

## Summary

- **Wave 8 items**: 178 items across 14 phases (UNCHANGED)
- **Wave 9 items added**: 25 items across 6 new phases (15-20)
- **Total coverage**: ~203 items
- **New DB tables**: `cycle_logs`, `admin_audit_log`, `post_revisions`, `user_devices`, `feature_flags` + column additions to `profiles`, `shifts`
- **New Edge Functions**: `nightscout-sync`, `food-search`, `admin-impersonate`, `content-safety`, `verify-npi`, `parse-voice-log`, `data-retention-check`
- **New utility files**: `insulinModels.ts`, `encryption.ts`, `idempotency.ts`, `haptics.ts`, `offlineSync.ts`, `fhirExport.ts`
- **New hooks**: `useSpeechToText`, `useFeatureFlag`, `useOfflineStatus`, `useAILoadingFacts`

