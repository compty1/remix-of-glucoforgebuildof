
# Comprehensive CGM Analysis Pipeline Enhancement Plan

## Executive Summary

This plan transforms the existing glucose analysis system into a clinical-grade, multi-device CGM analysis pipeline with advanced pattern detection, novel signals not found in standard AGP reports, and explainable recommendations. The implementation follows the detailed specifications from the analysis conversation, prioritizing accuracy, device-specific behaviors, and actionable insights.

---

## Current State Assessment

### Existing Implementation
The current `analyze-glucose` edge function (1707 lines) provides:

| Feature | Status | Gap |
|---------|--------|-----|
| CSV/JSON parsing | Implemented | Limited device-specific parsers |
| PDF extraction | AI Vision + Pattern matching | Works but inconsistent |
| Basic metrics (TIR, GMI, CV) | Implemented | Missing confidence scoring |
| Pattern detection | 6 patterns | Missing missed-bolus, meal-insulin timing |
| AGP visualization | Implemented | No insulin/meal overlays |
| Recommendations | Basic rule-based | Not prioritized by clinical risk |
| Data validation | Minimal | No wear-time or gap analysis |
| Device metadata | None | No firmware/sensor tracking |

### Database Schema (uploads table)
Currently stores: `detailed_analysis`, `hourly_data`, `daily_data`, `agp_data`, `patterns`, `recommendations`, `ai_insights`

**Missing fields for enhanced analysis:**
- `confidence_score` - Data quality confidence
- `validation_flags` - Triggered validation rules
- `device_metadata` - Device type, firmware, sensor info
- `novel_signals` - Missed-bolus, meal timing, sensor drift
- `insulin_events` - Parsed insulin delivery data
- `meal_events` - Parsed carb/meal entries

---

## Implementation Architecture

### Phase 1: Canonical Schema and Validation Rules

**1.1 Create Validation Rules Configuration**

File: `src/config/glucose-validation-rules.ts`

```typescript
interface ValidationRule {
  id: string;
  description: string;
  condition: string;
  window: 'row' | 'day' | 'rolling_14d' | 'dataset';
  severity: 'critical' | 'high' | 'medium' | 'low';
  penalty: number;
  action: string;
  enabled: boolean;
}
```

**Rules to implement:**
1. `timestamp_future` - Reject future timestamps (penalty: 40)
2. `timestamp_drift` - Flag >12hr timezone mismatch (penalty: 20)
3. `low_wear_time` - <70% CGM active over 14 days (penalty: 30)
4. `large_gaps` - >3 gaps of 2+ hours (penalty: 10)
5. `duplicate_rows` - Exact duplicates (penalty: 2)
6. `out_of_range_glucose` - <20 or >1000 mg/dL (penalty: 35)
7. `implausible_insulin` - >50U bolus or >500g carbs (penalty: 15)
8. `missing_required_fields` - No timestamp/device_id (penalty: 50)
9. `firmware_unknown` - Unrecognized format (penalty: 5)
10. `sampling_interval_high` - Median interval >10 min (penalty: 12)
11. `suspicious_sensor_age` - >336 hours sensor use (penalty: 8)
12. `inconsistent_upload_source` - Overlapping sources (penalty: 3)

**Confidence Scoring:**
- Base score: 100
- Subtract penalties for triggered rules
- Bands: ≥85 (high), 60-84 (moderate), 30-59 (low), <30 (unreliable)

**1.2 Database Migration**

Add new columns to `uploads` table:

```sql
ALTER TABLE public.uploads
ADD COLUMN IF NOT EXISTS confidence_score integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS confidence_band text DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS validation_flags jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS device_metadata jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS wear_time_percent numeric,
ADD COLUMN IF NOT EXISTS gap_analysis jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS novel_signals jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS insulin_events jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS meal_events jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS data_quality jsonb DEFAULT '{}'::jsonb;
```

---

### Phase 2: Device-Specific Parsers

**2.1 Canonical Record Schema**

```typescript
interface CanonicalRecord {
  record_id: string;
  device_id: string;
  firmware_version: string | null;
  timestamp_utc: string;
  local_timestamp: string | null;
  glucose_mg_dl: number | null;
  glucose_status: 'OK' | 'SENSOR_ERROR' | 'NO_READING' | 'CALIBRATION_REQUIRED';
  insulin_event: 'BOLUS' | 'BASAL_START' | 'BASAL_STOP' | 'TEMP_BASAL' | 'SUSPEND' | 'RESUME' | 'AUTO_BASAL' | null;
  insulin_units: number | null;
  basal_rate_u_per_hr: number | null;
  carb_event: number | null;
  meal_marker: 'USER_MEAL' | 'AUTO_MEAL_ESTIMATE' | 'NONE';
  device_mode: 'MANUAL' | 'AUTO_MODE' | 'SUSPENDED' | 'UNKNOWN';
  sensor_age_hours: number | null;
  sensor_signal_quality: number | null;
  battery_level: number | null;
  upload_source: 'PHONE_APP' | 'RECEIVER' | 'CLOUD_EXPORT' | 'HCP_PORTAL';
  notes: string | null;
}
```

**2.2 Device Parsers**

Enhance `analyze-glucose/index.ts` with device-specific parsing:

**Dexcom G6/G7 Parser:**
- Detect via headers: `Timestamp (YYYY-MM-DDThh:mm:ss)`, `Glucose Value (mg/dL)`, `Event Type`
- Extract: EGV values, sensor errors, calibration events
- Map `Event Type` to insulin/meal events when present

**Beta Bionics iLet Parser:**
- Detect via headers: `Time`, `Sensor Glucose`, `Delivered Insulin`, `Meal Announcement`
- Extract: Auto-mode behavior, insulin delivery, meal announcements
- Calculate: Auto-mode override frequency

**LibreView Parser:**
- Detect via headers: `Device Timestamp`, `Historic Glucose`, `Scan Glucose`
- Handle: Separate scan vs. historic readings
- Extract: Reader vs. sensor data

**Generic CSV Fallback:**
- Improved column detection with fuzzy matching
- Support for international date formats
- Timezone inference from filename/content

---

### Phase 3: Enhanced Core Metrics

**3.1 Standard Clinical Metrics (already implemented, to be enhanced)**

| Metric | Current | Enhancement |
|--------|---------|-------------|
| TIR (70-180) | Yes | Add day/night breakdown |
| TBR (<70, <54) | Yes | Add event counting with duration |
| TAR (>180, >250) | Yes | Add severity weighting |
| Mean/Median | Yes | Add eAG equivalents |
| CV | Yes | Validate against standard deviation |
| GMI | Yes | Add confidence interval |
| MAGE | Yes | Improve algorithm accuracy |
| GVI | Yes | Add interpretation |

**3.2 Day/Night Breakdown**

Add to `detailedAnalysis`:

```typescript
interface DayNightMetrics {
  dayStart: string; // User-configurable, default "06:00"
  nightStart: string; // User-configurable, default "22:00"
  day: {
    timeInRange: number;
    avgGlucose: number;
    cv: number;
    lowEvents: number;
    highEvents: number;
  };
  night: {
    timeInRange: number;
    avgGlucose: number;
    cv: number;
    lowEvents: number;
    highEvents: number;
  };
}
```

**3.3 Wear-Time and Data Sufficiency**

```typescript
interface DataQuality {
  percentCGMActive: number; // Target: ≥70%
  totalExpectedReadings: number;
  actualReadings: number;
  gapCount: number;
  largestGapMinutes: number;
  medianIntervalMinutes: number;
  dataStartDate: string;
  dataEndDate: string;
  daysOfData: number;
  isSufficientForAnalysis: boolean; // ≥70% over 14+ days
}
```

---

### Phase 4: Novel Signal Detection (High Value)

**4.1 Missed-Bolus Detection**

Algorithm:

```
for each day:
  find candidate_meal_windows = glucose rises where:
    - slope > 2 mg/dL/min over 15 min
    - pre-rise glucose < 200 mg/dL
  
  for each window:
    if no bolus within [-30min, +60min] of rise_start:
      if rise_magnitude > 40 mg/dL OR postprandial_AUC > threshold:
        record missed_bolus_event with:
          - severity = map(rise_magnitude, AUC)
          - time_of_day
          - peak_glucose
          - duration_above_target
```

Output structure:

```typescript
interface MissedBolusEvent {
  timestamp: string;
  peakGlucose: number;
  riseMagnitude: number;
  durationAboveTarget: number;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}
```

**4.2 Meal-Insulin Timing Mismatch Score**

Algorithm:

```
for each meal_event with carbs:
  find nearest bolus within [-60min, +120min]
  delta = bolus_time - meal_time
  postprandial_AUC = integrate(glucose from meal_time to meal_time+4h)
  expected_AUC = model_expected_AUC(carbs, user_sensitivity)
  
  mismatch_score = 
    w1 * abs(delta_minutes)/30 + 
    w2 * max(0, (postprandial_AUC - expected_AUC)) / expected_AUC
```

**4.3 Sensor Drift Index**

```
if SMBG_pairs >= 5:
  offsets = [sensor - SMBG for each pair]
  drift_slope = linear_regression_slope(offsets over time)
  drift_index = drift_slope * 24 (mg/dL per day)
  flag if abs(drift_index) > 10
```

**4.4 Auto-Mode Behavior Metrics (for closed-loop devices)**

```typescript
interface AutoModeMetrics {
  autoModeActivePercent: number;
  overrideFrequencyPerDay: number;
  autoBasalVolatility: number; // SD of auto basal rate overnight
  rescueEventCount: number;
  exitReasons: Record<string, number>;
}
```

**4.5 Recurring Pattern Detector**

Weekly aggregation to find repeating excursions:

```typescript
interface RecurringPattern {
  dayOfWeek: string | 'weekday' | 'weekend';
  timeWindow: string; // "14:00-16:00"
  patternType: 'high' | 'low' | 'variable';
  frequency: number; // occurrences per week
  avgMagnitude: number;
  confidence: number;
}
```

**4.6 Insulin Stacking Risk**

```typescript
interface InsulinStackingEvent {
  timestamp: string;
  bolusSequence: Array<{ time: string; units: number }>;
  estimatedIOB: number;
  stackingRiskScore: number; // 0-100
  subsequentLowEvent: boolean;
}
```

---

### Phase 5: Enhanced Report Structure

**5.1 Report Sections (Priority Order)**

1. **Executive Summary** (3 bullets)
   - Overall TIR with target comparison
   - Top 2 clinical risks (prioritize hypo > hyper)
   - Confidence score with data quality note

2. **Key Metrics Dashboard**
   - TIR/TBR/TAR with clinical targets
   - GMI with A1C equivalence
   - CV with stability rating
   - Wear-time and data coverage

3. **Top 5 Prioritized Issues**
   - Ranked by clinical risk (hypo first)
   - Each with: why it matters, evidence, actionable suggestion
   - Example: "1. Reduce overnight basal by 0.05 U/hr (observed 6/7 nights with median rise 45 mg/dL 2-4 AM; confidence 92%)"

4. **Recurring Patterns**
   - Visual + textual summary
   - Weekday vs. weekend comparison
   - Top 3 worst recurring patterns

5. **Novel Signals Section**
   - Missed-bolus events summary
   - Meal-insulin timing score
   - Auto-mode behavior (if applicable)
   - Sensor drift warning (if detected)

6. **Device & Data Provenance**
   - Device type and firmware
   - Upload source
   - Parser version
   - Confidence score breakdown

7. **Appendix**
   - Raw event list (exportable)
   - Gap map visualization
   - Algorithm outputs with evidence

**5.2 Recommendation Prioritization**

Risk scoring algorithm:

```typescript
function calculateRiskScore(issue: Issue): number {
  let score = 0;
  
  // Hypoglycemia highest priority
  if (issue.type === 'hypoglycemia') score += 100;
  if (issue.type === 'severe_hypoglycemia') score += 150;
  
  // Frequency matters
  score += issue.frequency * 10;
  
  // Severity
  if (issue.severity === 'critical') score *= 1.5;
  if (issue.severity === 'warning') score *= 1.2;
  
  // Recency (recent patterns more important)
  if (issue.lastOccurrence < 7) score *= 1.3;
  
  return score;
}
```

---

### Phase 6: Frontend Enhancements

**6.1 New UI Components**

**Confidence Score Badge:**
```typescript
// src/components/data-upload/ConfidenceScoreBadge.tsx
interface Props {
  score: number;
  band: 'high' | 'moderate' | 'low' | 'unreliable';
  validationFlags: ValidationFlag[];
}
```

**Novel Signals Card:**
```typescript
// src/components/data-upload/NovelSignalsCard.tsx
interface Props {
  missedBoluses: MissedBolusEvent[];
  mealTimingScore: number;
  sensorDrift: number | null;
  autoModeMetrics: AutoModeMetrics | null;
}
```

**Data Quality Panel:**
```typescript
// src/components/data-upload/DataQualityPanel.tsx
interface Props {
  wearTimePercent: number;
  gapAnalysis: GapInfo[];
  dataRange: { start: string; end: string };
  isSufficient: boolean;
}
```

**AGP with Overlays:**
- Enhance `GlucoseAGPChart.tsx` to show:
  - Bolus markers (if insulin data available)
  - Meal markers (if carb data available)
  - Auto-basal shading (for closed-loop devices)

**6.2 Update AnalysisResultsModal.tsx**

Add new tabs:
- **Data Quality** - Wear-time, gaps, confidence score
- **Novel Signals** - Missed-bolus, timing, drift
- **Clinician View** - Formatted for healthcare provider review

**6.3 Executive Summary Card**

New component for top of analysis results:

```typescript
// src/components/data-upload/ExecutiveSummary.tsx
interface Props {
  tir: number;
  topRisks: Array<{ title: string; severity: string }>;
  confidence: number;
  encouragement: string;
}
```

---

### Phase 7: Edge Function Refactoring

**7.1 Modular Structure**

Refactor `analyze-glucose/index.ts` into logical sections:

```
supabase/functions/analyze-glucose/
├── index.ts              # Main server, orchestration
├── parsers/
│   ├── dexcom.ts         # Dexcom G6/G7 parser
│   ├── libre.ts          # LibreView parser
│   ├── ilet.ts           # Beta Bionics parser
│   └── generic.ts        # Generic CSV/JSON
├── validators/
│   ├── rules.ts          # Validation rule definitions
│   └── evaluator.ts      # Rule evaluation engine
├── analyzers/
│   ├── core-metrics.ts   # TIR, GMI, CV, etc.
│   ├── patterns.ts       # Pattern detection
│   ├── novel-signals.ts  # Missed-bolus, timing, drift
│   └── recommendations.ts # AI-enhanced recommendations
└── utils/
    ├── statistics.ts     # Percentile, MAGE, etc.
    └── time-utils.ts     # Timezone, parsing
```

**Note:** Due to edge function constraints, all code must remain in `index.ts` but will be organized with clear section comments.

**7.2 Algorithm Improvements**

**MAGE Calculation (fix):**
- Current implementation has edge cases
- Add proper excursion filtering
- Handle datasets with minimal variability

**Gap Detection:**
```typescript
interface GapInfo {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  type: 'sensor_warmup' | 'calibration' | 'wear_off' | 'unknown';
}
```

**7.3 AI Recommendations Enhancement**

Update AI prompt to include:
- Novel signals context
- Prioritized risk ranking
- Evidence-based suggestions
- Safety disclaimers

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/config/glucose-validation-rules.ts` | Validation rule definitions |
| `src/components/data-upload/ConfidenceScoreBadge.tsx` | Visual confidence indicator |
| `src/components/data-upload/NovelSignalsCard.tsx` | Missed-bolus, timing, drift display |
| `src/components/data-upload/DataQualityPanel.tsx` | Wear-time, gaps visualization |
| `src/components/data-upload/ExecutiveSummary.tsx` | Top-level analysis summary |
| `src/types/glucose-analysis.ts` | TypeScript interfaces for all new types |

### Modified Files
| File | Changes |
|------|---------|
| `supabase/functions/analyze-glucose/index.ts` | Major refactor with all new algorithms |
| `src/components/data-upload/AnalysisResultsModal.tsx` | Add new tabs, executive summary |
| `src/components/data-upload/GlucoseAGPChart.tsx` | Add insulin/meal overlays |
| `src/components/data-upload/PatternCard.tsx` | Add missed-bolus, stacking patterns |
| `src/components/data-upload/GlucoseMetricsGrid.tsx` | Add day/night breakdown |
| `src/pages/DataUpload.tsx` | Display confidence score, data quality |
| `src/integrations/supabase/types.ts` | Will auto-update with new columns |

### Database Migrations
| Migration | Description |
|-----------|-------------|
| `add_enhanced_analysis_columns.sql` | New columns for confidence, validation, novel signals |

---

## Technical Specifications

### Validation Rule Weights

| Rule ID | Penalty | Rationale |
|---------|---------|-----------|
| timestamp_future | 40 | Critical data integrity issue |
| missing_required_fields | 50 | Cannot analyze without core data |
| out_of_range_glucose | 35 | Likely sensor error |
| low_wear_time | 30 | Insufficient data for reliable analysis |
| timestamp_drift | 20 | Timezone issues affect patterns |
| implausible_insulin | 15 | Data entry error likely |
| sampling_interval_high | 12 | Affects time-series analysis |
| large_gaps | 10 | Missing data periods |
| suspicious_sensor_age | 8 | Accuracy may be degraded |
| firmware_unknown | 5 | Minor compatibility concern |
| inconsistent_upload_source | 3 | Deduplication needed |
| duplicate_rows | 2 | Easy to handle |

### Clinical Risk Prioritization

1. **Severe hypoglycemia** (<54 mg/dL) - Highest priority
2. **Hypoglycemia** (<70 mg/dL) - High priority
3. **Nocturnal lows** - High priority (safety during sleep)
4. **High variability** (CV >36%) - Medium-high priority
5. **Very high glucose** (>250 mg/dL) - Medium priority
6. **Time above range** - Medium priority
7. **Pattern consistency** - Lower priority

### Device Support Matrix

| Device | CSV Support | PDF Support | Insulin Data | Meal Data |
|--------|-------------|-------------|--------------|-----------|
| Dexcom G6 | Full | Summary only | Event types | Event types |
| Dexcom G7 | Full | Summary only | Event types | Event types |
| LibreView | Full | Summary only | No | Scan notes |
| Beta Bionics iLet | Full | Summary only | Full | Announcements |
| Tandem t:slim | Planned | No | Full | Carbs |
| Omnipod 5 | Planned | No | Full | Carbs |
| Medtronic | Planned | No | Full | Carbs |

---

## Safety Considerations

1. **Never output explicit dosing commands**
   - Always phrase as suggestions
   - Include "discuss with your healthcare provider" disclaimer

2. **Clinical validation requirement**
   - Log algorithm versions for reproducibility
   - Include data provenance in reports

3. **Confidence-gated recommendations**
   - Low confidence = limit automated claims
   - Show confidence score prominently

4. **Prioritize safety-critical findings**
   - Hypoglycemia patterns always surfaced first
   - Critical severity patterns require attention

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Missed-bolus detection accuracy | >85% (vs. clinician review) |
| Pattern detection sensitivity | >90% for recurring patterns |
| Data quality assessment accuracy | >95% agreement with manual review |
| Report generation time | <5 seconds for 14-day dataset |
| User comprehension score | >4.0/5.0 on actionability |
| Clinician satisfaction | >4.5/5.0 on accuracy and usefulness |

---

## Implementation Phases

### Phase 1 (Week 1): Foundation
- Database migration for new columns
- Validation rules implementation
- Confidence scoring system
- Data quality analysis

### Phase 2 (Week 2): Enhanced Metrics
- Day/night breakdown
- Improved pattern detection
- Gap analysis and wear-time

### Phase 3 (Week 3): Novel Signals
- Missed-bolus detection
- Meal-insulin timing score
- Recurring pattern detector
- Insulin stacking risk

### Phase 4 (Week 4): UI and Reporting
- Executive summary component
- Novel signals card
- Data quality panel
- Enhanced AGP with overlays
- Clinician-ready PDF export

### Phase 5 (Week 5): Device Parsers
- Enhanced Dexcom parser
- Beta Bionics iLet parser
- LibreView improvements
- Generic fallback improvements

### Phase 6 (Ongoing): Validation
- Testing with real device exports
- Clinician review of outputs
- Iteration based on feedback
