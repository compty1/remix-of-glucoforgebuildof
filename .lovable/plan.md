

# Implementation Plan: 6 Feature Domains (40+ New Capabilities)

This plan covers everything from the 6 requested domains that is **not yet implemented**. Items already present in the codebase (PK insulin models, exercise stratification, meal models, illness/stress tags, IOB calculator, FHIR export, AGP export, feature flags, offline sync, device EOL tracker) are excluded.

---

## Domain 1: Advanced Applied AI & Clinical Modeling

### 1.1 Client-Side Time-Series Forecasting (WebAssembly)
- Create `src/workers/glucoseForecast.worker.ts` as a Web Worker
- Implement a lightweight **Holt-Winters exponential smoothing** model (no ONNX/WASM dependency needed for MVP -- pure TypeScript math)
- Input: last 48-72 hours of glucose readings; Output: predicted glucose for next 1-4 hours with confidence intervals
- Create `src/utils/timeSeriesForecaster.ts` with the forecasting math (triple exponential smoothing handles seasonality of daily glucose patterns)
- Create `src/hooks/useGlucoseForecast.ts` that posts data to the worker and returns predictions
- Integrate predictions into the dashboard chart as a dashed line overlay
- This replaces LLM-based glucose prediction with deterministic math

### 1.2 Client-Side Local AI (WebLLM for T1D Companion)
- Create `src/utils/webllmLoader.ts` that dynamically loads WebLLM from CDN
- Implement a feature-flagged toggle (`local_ai` flag) in settings
- When enabled, the T1D Companion chat falls back to a local Llama model (cached in browser) instead of the server edge function
- Create `src/hooks/useLocalAI.ts` that wraps WebLLM inference with the same `ChatMessage` interface used by `useT1DChat`
- Add a "Local AI" badge in the chat UI when running locally
- Graceful fallback: if WebGPU is unsupported, automatically use server AI

### 1.3 Menstrual/Hormonal Cycle Tracker
- Create DB migration: `hormonal_cycle_logs` table (`id`, `user_id`, `cycle_day`, `date`, `phase` enum ['follicular','ovulation','luteal','menstrual'], `notes`, `created_at`) with RLS
- Create `src/utils/hormonalCycleModels.ts` with phase-specific insulin resistance multipliers (luteal phase: 1.15-1.3x resistance)
- Create `src/components/settings/HormonalCycleTracker.tsx` -- a calendar UI for logging cycle days
- Feed cycle phase context into the AI analysis prompt when data is present
- Auto-exclude luteal-phase high-variance days from baseline TIR calculations (similar to illness/stress tag logic)

---

## Domain 2: Seamless Interoperability & Data Ecosystem

### 2.1 Nightscout API Live-Sync
- Create DB migration: `nightscout_connections` table (`id`, `user_id`, `nightscout_url`, `api_secret_hash`, `last_sync_at`, `sync_enabled`, `created_at`) with RLS
- Create edge function `nightscout-sync/index.ts` that:
  - Accepts a Nightscout URL + API secret
  - Fetches `/api/v1/entries.json?count=288` (last 24h)
  - Transforms Nightscout SGV entries into the app's glucose reading format
  - Upserts into user's glucose data, deduplicating by timestamp
- Create `src/components/settings/NightscoutConnector.tsx` -- a settings panel for URL input, connection test, and sync toggle
- Add a scheduled cron option (every 15 min) via the existing `scheduled-maintenance` function

### 2.2 Nutrition API Integration (OpenFoodFacts)
- Create edge function `nutrition-lookup/index.ts` that:
  - Accepts a barcode string or food search query
  - Calls OpenFoodFacts API (`https://world.openfoodfacts.org/api/v2/product/{barcode}.json`) -- free, no API key needed
  - Returns carbs, fat, protein, fiber, serving size
- Create `src/components/logging/FoodLookup.tsx` with:
  - A text search input for food names
  - A camera-based barcode scanner using the browser's `BarcodeDetector` API (or `quagga2` fallback)
  - Auto-fills carb/fat/protein fields in meal logging
- Create `src/hooks/useNutritionLookup.ts` for the API call

### 2.3 Fax-to-Doctor (AGP Report Delivery)
- Create edge function `fax-agp-report/index.ts` that:
  - Accepts a fax number and PDF base64 data
  - Uses the Phaxio API (or similar) to send the fax
  - Requires a `PHAXIO_API_KEY` secret
- Add a "Fax to Clinic" button in the AGP export UI
- Include a fax number input with US phone formatting validation

---

## Domain 3: Next-Gen Hardware & Edge

### 3.1 Web Bluetooth API Module
- Create `src/utils/bluetoothBridge.ts` that:
  - Uses `navigator.bluetooth.requestDevice()` to pair with known glucose meter GATT services
  - Reads glucose measurement characteristic (UUID `0x2A18`) from Bluetooth Glucose Profile
  - Parses the Bluetooth Glucose Measurement format into app glucose readings
- Create `src/components/settings/BluetoothDevicePairing.tsx` -- a UI for scanning, pairing, and reading from BLE glucose meters
- Feature-flag gated (`bluetooth_pairing`)
- Graceful fallback for browsers without Web Bluetooth

### 3.2 Smartwatch Data Endpoint
- Create edge function `watch-data/index.ts` that:
  - Accepts auth token, returns last 3 hours of glucose + current IOB as minimal JSON
  - Designed for low-bandwidth watch companion apps
  - Response format: `{ glucose: number, trend: string, iob: number, timestamp: string }`
- This is a lightweight REST endpoint, not a full GraphQL server

### 3.3 NFC Supply Scanning
- Create `src/utils/nfcScanner.ts` that:
  - Uses `NDEFReader` API to read NFC tags on insulin vials/sensor boxes
  - Parses common pharmaceutical NFC data (lot number, expiry date, NDC code)
- Create `src/components/logging/NFCSupplyScanner.tsx` for site-change logging and expiration tracking
- Feature-flag gated (`nfc_scanning`)

---

## Domain 4: Behavioral Economics & Compassionate UX

### 4.1 Burnout-Aware Notification Engine
- Create `src/utils/burnoutDetector.ts` that:
  - Analyzes login frequency, data upload gaps, and worsening metrics trends
  - Scores burnout risk (0-100) based on: days since last login, TIR trend direction, streak breaks
  - When score > 60: suppress gamification, surface mental health resources
- Create `src/hooks/useBurnoutAwareness.ts` that reads the score and conditionally hides streak widgets
- Modify notification logic to shift tone from achievement-based to compassionate messaging

### 4.2 Alert Budget System
- Create `src/utils/alertBudget.ts` with:
  - Daily alert cap (configurable, default: 3 predictive alerts/day)
  - Priority ranking: urgent lows > predicted lows > highs > informational
  - Snooze functionality (15min, 30min, 1hr, rest-of-day)
- Create DB migration: `user_alert_preferences` table (`user_id`, `daily_budget`, `snooze_until`, `priority_overrides`)
- Integrate into `predictiveAlerts.ts` as a filter layer

### 4.3 Retinopathy Accessibility Mode
- Create `src/styles/retinopathy-mode.css` with:
  - Black/yellow high-contrast color scheme
  - Minimum 20px base font size, 24px+ for data values
  - Simplified single-column layouts
  - Extra-large touch targets (min 48x48px)
- Create `src/hooks/useRetinopathyMode.ts` that reads from user preferences
- Add a toggle in Settings > Accessibility
- When enabled, inject the CSS class on `<html>` element and pass `isRetinopathyMode` via React context to simplify component layouts

### 4.4 Mentor/Mentee Matching
- Create DB migration: `mentor_profiles` table (`user_id`, `is_mentor`, `years_with_t1d`, `devices_used` JSONB, `specialties` text[], `bio`, `max_mentees`, `created_at`) with RLS
- Create DB migration: `mentor_matches` table (`mentor_id`, `mentee_id`, `status` enum, `matched_at`, `device_overlap_score`)
- Create `src/utils/mentorMatcher.ts` that scores compatibility based on: same pump model, same CGM, years of experience, specialties
- Create `src/pages/MentorDirectory.tsx` with search/filter and request-to-connect flow

### 4.5 Charity Points (Intrinsic Gamification)
- Create DB migration: `charity_points` table (`user_id`, `points_balance`, `total_donated_cents`, `last_conversion_at`)
- Create DB migration: `charity_donations` table (`id`, `user_id`, `points_spent`, `amount_cents`, `charity_name`, `created_at`)
- Create `src/components/gamification/CharityPointsWidget.tsx` showing balance and "Donate Points" button
- Each streak day = 1 point; conversion rate configurable (e.g., 100 points = $1 to JDRF)
- Points are tracked locally in DB; actual donations are batched monthly

### 4.6 Digital Companion (Tamagotchi-Style Dashboard)
- Create `src/components/dashboard/DigitalCompanion.tsx`:
  - A small animated character/tree that reflects health metrics
  - TIR > 70%: happy/thriving; TIR 50-70%: neutral; TIR < 50%: needs care
  - Uses Framer Motion for animations
  - Respects reduced-motion preferences
- Optional dashboard widget, toggled via user preferences
- No clinical data replaced -- purely supplementary visualization

---

## Domain 5: B2B Architecture (Clinic Portals)

### 5.1 Provider Role & Fleet Dashboard
- Create DB migration: add `'provider'` to the `app_role` enum
- Create `src/components/auth/withProvider.tsx` HOC (mirrors `withAdmin.tsx`)
- Create `src/pages/provider/ProviderDashboard.tsx`:
  - List of connected patients with TIR, Time Below Range, last upload date
  - Sort by "Most At Risk" (highest % time below 54 mg/dL)
  - Click into patient detail view (read-only AGP + metrics)
- Create DB migration: `provider_patient_links` table (`provider_id`, `patient_id`, `consent_status`, `linked_at`) with RLS (provider can only see consented patients)

### 5.2 RPM Auto-Billing Reports
- Create `src/utils/rpmBillingReport.ts` that:
  - Counts days with transmitted data per patient per month
  - Counts minutes of provider review time (tracked via page view duration)
  - Maps to CPT codes: 99453 (initial setup), 99454 (device supply, 16+ days/month), 99457 (20+ min review)
- Create `src/components/provider/RPMBillingExport.tsx` that generates a CSV/PDF billing report

### 5.3 Clinic Whitelabeling
- Create DB migration: `clinic_tenants` table (`id`, `slug`, `clinic_name`, `logo_url`, `primary_color`, `secondary_color`, `created_at`)
- Add route matching: `/clinic/:slug` that loads tenant branding from DB
- Create `src/hooks/useClinicBranding.ts` that applies CSS custom properties for colors and injects the logo
- Tenant CSS overrides are applied via CSS variables, not global stylesheet replacement

### 5.4 Opt-in Data Licensing (Citizen Science)
- Create DB migration: `data_license_consents` table (`user_id`, `consented_at`, `revoked_at`, `license_tier`, `anonymization_level`)
- Create `src/pages/CitizenScience.tsx` with:
  - Clear explanation of de-identification process
  - Granular consent toggles (glucose data, device data, demographics)
  - Legal terms acceptance
  - Revocation button with immediate effect

### 5.5 Freemium Edge Guards
- Create DB migration: `user_subscriptions` table (`user_id`, `tier` enum ['free','premium','provider'], `stripe_subscription_id`, `expires_at`)
- Create `src/hooks/useSubscriptionTier.ts` that checks the user's tier
- Create `src/utils/edgeGuard.ts` middleware for edge functions that checks tier before allowing AI analysis calls
- Free tier: local pattern math only; Premium: AI insights, FHIR export, advanced reports

### 5.6 Stripe Connect Escrow for Bounties
- Create edge function `bounty-escrow/index.ts` using Stripe Connect:
  - Create connected accounts for bounty recipients
  - Hold funds in escrow via PaymentIntents with `capture_method: 'manual'`
  - Auto-capture on GitHub PR merge (via webhook)
- Create `src/components/bounties/BountyFunding.tsx` for funding and claiming UI

---

## Domain 6: Enterprise Observability & Audit

### 6.1 FDA 21 CFR Part 11 Audit Trail
- Create DB migration: `audit_trail` table (`id`, `user_id`, `table_name`, `record_id`, `action` enum ['INSERT','UPDATE','DELETE'], `old_value` JSONB, `new_value` JSONB, `reason`, `ip_address`, `created_at`)
- Create immutability: RLS policy allowing only INSERT (no UPDATE/DELETE on audit_trail)
- Create a generic Postgres trigger function `audit_trigger()` that logs all changes to medical record tables (glucose uploads, insulin logs, journal entries)
- Attach triggers to critical tables
- Create `src/pages/admin/AuditLog.tsx` for admin review

### 6.2 Automated DSAR Pipeline
- Create edge function `dsar-export/index.ts` that:
  - Accepts authenticated user request
  - Queries all user data across tables (profile, glucose data, chat sessions, journals, community posts)
  - Packages into a structured JSON archive
  - Generates a download URL (stored temporarily in Supabase Storage)
- Create `src/components/settings/DataExportRequest.tsx` with a "Download My Data" button
- Rate-limit to 1 request per 24 hours

### 6.3 Synthetic Monitoring
- This is an external infrastructure concern (Datadog/Checkly) -- not implementable within the Lovable codebase
- **Alternative**: Create a `health-check/index.ts` edge function that:
  - Tests DB connectivity, AI gateway reachability, and storage access
  - Returns structured health status JSON
  - Can be polled by external monitoring services
- Create `/health` route displaying system status for admins

### 6.4 Distributed Tracing (Lightweight)
- Full OpenTelemetry is infrastructure-level; instead implement **correlation IDs**:
- Create `src/utils/traceContext.ts` that generates a unique `x-trace-id` header per user action
- Pass this header through all edge function calls
- Edge functions log the trace ID with every operation
- Create a `request_traces` table for storing trace data viewable in admin

### 6.5 Feature Flag UI Engine (Enhanced)
- Expand existing `useFeatureFlag.ts` to support:
  - Percentage rollouts (e.g., enable for 10% of users)
  - User segment targeting (by role, subscription tier)
  - Remote flag updates without redeployment
- Create `src/pages/admin/FeatureFlagManager.tsx` with a full CRUD UI for managing flags
- Store flags in a dedicated `feature_flags` table instead of `admin_settings`

---

## Technical Summary

| Domain | New Items | Key Dependencies | DB Migrations |
|--------|-----------|-----------------|---------------|
| 1 - AI & Clinical | 3 | Web Worker, WebLLM CDN | 1 (hormonal_cycle_logs) |
| 2 - Interoperability | 3 | OpenFoodFacts API, Phaxio | 1 (nightscout_connections) |
| 3 - Hardware/Edge | 3 | Web Bluetooth, NFC APIs | 0 |
| 4 - Compassionate UX | 6 | Framer Motion (existing) | 4 (alert prefs, mentors, charity, companion) |
| 5 - B2B/Clinic | 6 | Stripe Connect | 5 (subscriptions, tenants, consents, etc.) |
| 6 - Observability | 5 | None new | 3 (audit_trail, feature_flags, request_traces) |

**Total: ~26 new files, ~14 DB migrations, ~6 new edge functions**

Implementation order: Domain 1 and 4 first (user-facing safety), then Domain 5 (monetization), then Domains 2/3/6 (integrations and infrastructure).

