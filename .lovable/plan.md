
# Implementation Plan: 6 Feature Domains — Progress Tracker

## Status Key: ✅ Done | 🔄 In Progress | ⬜ Not Started

---

## Domain 1: Advanced Applied AI & Clinical Modeling

- ✅ 1.1 Client-Side Time-Series Forecasting — `timeSeriesForecaster.ts`, `glucoseForecast.worker.ts`, `useGlucoseForecast.ts`
- ✅ 1.2 Client-Side Local AI (WebLLM) — `webllmLoader.ts`, `useLocalAI.ts`
- ✅ 1.3 Menstrual/Hormonal Cycle Models — `hormonalCycleModels.ts` + DB table `hormonal_cycle_logs`
- ⬜ 1.3b Hormonal Cycle Tracker UI (`HormonalCycleTracker.tsx`)

## Domain 2: Seamless Interoperability

- ✅ 2.1 Nightscout Connections DB — table created
- ⬜ 2.1b Nightscout Sync Edge Function + UI (`NightscoutConnector.tsx`)
- ✅ 2.2 Nutrition Lookup Edge Function — `nutrition-lookup/index.ts`
- ⬜ 2.2b Food Lookup UI (`FoodLookup.tsx`, `useNutritionLookup.ts`)
- ⬜ 2.3 Fax-to-Doctor (requires Phaxio API key)

## Domain 3: Hardware & Edge

- ✅ 3.1 Web Bluetooth Bridge — `bluetoothBridge.ts`
- ⬜ 3.1b Bluetooth Pairing UI (`BluetoothDevicePairing.tsx`)
- ✅ 3.2 Smartwatch Endpoint — `watch-data/index.ts`
- ✅ 3.3 NFC Scanner — `nfcScanner.ts`
- ⬜ 3.3b NFC Supply Scanner UI (`NFCSupplyScanner.tsx`)

## Domain 4: Compassionate UX

- ✅ 4.1 Burnout Detector — `burnoutDetector.ts`, `useBurnoutAwareness.ts`
- ✅ 4.2 Alert Budget — `alertBudget.ts` + DB table `user_alert_preferences`
- ✅ 4.3 Retinopathy Mode — `retinopathy-mode.css`, `useRetinopathyMode.ts`
- ✅ 4.4 Mentor Matcher — `mentorMatcher.ts` + DB tables `mentor_profiles`, `mentor_matches`
- ⬜ 4.4b Mentor Directory UI (`MentorDirectory.tsx`)
- ✅ 4.5 Charity Points DB — tables created
- ⬜ 4.5b Charity Points UI (`CharityPointsWidget.tsx`)
- ⬜ 4.6 Digital Companion UI (`DigitalCompanion.tsx`)

## Domain 5: B2B / Clinic Portals

- ✅ 5.1 Provider Patient Links DB — table created
- ⬜ 5.1b Provider Dashboard UI (`ProviderDashboard.tsx`, `withProvider.tsx`)
- ✅ 5.2 RPM Billing Report — `rpmBillingReport.ts`
- ⬜ 5.2b RPM Billing Export UI (`RPMBillingExport.tsx`)
- ✅ 5.3 Clinic Tenants DB — table created
- ⬜ 5.3b Clinic Branding Hook + Route (`useClinicBranding.ts`)
- ✅ 5.4 Data License Consents DB — table created
- ⬜ 5.4b Citizen Science UI (`CitizenScience.tsx`)
- ✅ 5.5 User Subscriptions DB — table created
- ⬜ 5.5b Subscription Tier Hook + Edge Guard (`useSubscriptionTier.ts`, `edgeGuard.ts`)
- ⬜ 5.6 Stripe Connect Escrow (requires Stripe Connect setup)

## Domain 6: Observability & Audit

- ✅ 6.1 Audit Trail DB — table created with immutable policies
- ⬜ 6.1b Audit Log Admin UI (`AuditLog.tsx`)
- ⬜ 6.2 DSAR Export Edge Function
- ✅ 6.3 Health Check Endpoint — `health-check/index.ts`
- ✅ 6.4 Trace Context — `traceContext.ts` + DB table `request_traces`
- ✅ 6.5 Feature Flags DB — dedicated `feature_flags` table created
- ⬜ 6.5b Feature Flag Manager UI (`FeatureFlagManager.tsx`)

---

**Completed:** ~25 utilities, 13 DB tables, 3 edge functions, all core algorithms
**Remaining:** ~15 UI components, 2 edge functions, Stripe Connect integration
