
# Continuation Plan: Update AnalysisResultsModal.tsx and DataUpload.tsx to Display Enhanced Analysis Data

## Current State

The CGM analysis pipeline enhancement has completed:
1. Database migration with new columns (`confidence_score`, `validation_flags`, `novel_signals`, etc.)
2. TypeScript types in `src/types/glucose-analysis.ts`
3. Validation rules in `src/config/glucose-validation-rules.ts`
4. New UI components created:
   - `ConfidenceScoreBadge.tsx` - Visual confidence indicator
   - `NovelSignalsCard.tsx` - Missed-bolus, timing, drift display
   - `DataQualityPanel.tsx` - Wear-time, gaps visualization
   - `ExecutiveSummary.tsx` - Top-level analysis summary
5. Edge function refactored with enhanced algorithms

## What Needs to Be Done

### 1. Update AnalysisResultsModal.tsx

Add new tabs and integrate the enhanced analysis components:

**New Props to Add:**
```typescript
interface AnalysisResultsModalProps {
  // ... existing props
  confidenceScore?: number;
  confidenceBand?: 'high' | 'moderate' | 'low' | 'unreliable' | 'unknown';
  validationFlags?: ValidationFlag[];
  dataQuality?: DataQuality;
  novelSignals?: NovelSignals;
  executiveSummary?: ExecutiveSummary;
  dayNightAnalysis?: DayNightMetrics;
}
```

**New Tab Structure:**
```
Overview    | AGP Chart | Trends | Quality | Signals | Risk | Day Compare | Insights
(existing)  | (existing)| (exist)| (NEW)   | (NEW)   |(exist)| (existing) | (existing)
```

**Changes:**
- Import new components: `ExecutiveSummary`, `DataQualityPanel`, `NovelSignalsCard`, `ConfidenceScoreBadge`
- Add Executive Summary at top of Overview tab (replaces basic AI summary)
- Add new "Quality" tab with `DataQualityPanel`
- Add new "Signals" tab with `NovelSignalsCard`
- Add `ConfidenceScoreBadge` to the modal header
- Update PDF export to include new sections

### 2. Update DataUpload.tsx

**Enhance UploadedFile Interface:**
```typescript
interface UploadedFile {
  // ... existing fields
  confidenceScore?: number;
  confidenceBand?: 'high' | 'moderate' | 'low' | 'unreliable' | 'unknown';
  validationFlags?: any[];
  dataQuality?: any;
  novelSignals?: any;
  executiveSummary?: any;
  dayNightAnalysis?: any;
}
```

**Changes:**
- Map new database columns to the `UploadedFile` state when fetching uploads
- Pass new props to `AnalysisResultsModal`
- Update the file processing to capture enhanced analysis results
- Show confidence badge on file cards for completed uploads

### 3. Update Recent Uploads Display

Add visual indicators:
- Show confidence score badge on completed upload cards
- Color-code status based on data quality
- Show number of novel signals detected

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/data-upload/AnalysisResultsModal.tsx` | Add new tabs, integrate enhanced components, update props |
| `src/pages/DataUpload.tsx` | Extend interface, pass new props, update file cards |

## Implementation Steps

### Step 1: Update AnalysisResultsModal.tsx

1. Add imports for new components and types
2. Extend `AnalysisResultsModalProps` interface
3. Add `ConfidenceScoreBadge` to dialog header
4. Replace AI summary with `ExecutiveSummary` component in Overview tab
5. Add new "Quality" tab with `DataQualityPanel`
6. Add new "Signals" tab with `NovelSignalsCard`
7. Update PDF export function to include new analysis data

### Step 2: Update DataUpload.tsx

1. Extend `UploadedFile` interface with new fields
2. Update `fetchUploads` to map new database columns
3. Update `processFile` to capture enhanced analysis results
4. Add confidence badge to file cards
5. Pass all new props to `AnalysisResultsModal`

---

## Technical Details

### New Tab Icons
- Quality tab: `ShieldCheck` icon
- Signals tab: `Zap` icon

### Conditional Rendering
- Only show Quality/Signals tabs when enhanced data is available
- Fall back gracefully if `executiveSummary` or `novelSignals` are undefined
- Show loading skeleton for tabs while data loads

### PDF Export Enhancement
Add new sections to the export:
- Executive Summary with TIR progress
- Data Quality metrics (wear-time, gaps)
- Novel signals detected (missed boluses, patterns)
- Confidence score and band

---

## Expected Outcome

After implementation:
1. Users see a professional **Executive Summary** at the top of analysis results
2. **Confidence Score Badge** in the header shows data quality at a glance
3. **Data Quality tab** reveals wear-time, gaps, and sampling details
4. **Novel Signals tab** surfaces missed boluses, meal timing issues, sensor drift, and recurring patterns
5. File cards in the upload list show confidence badges
6. PDF exports include all enhanced analysis sections

This completes the frontend integration of the clinical-grade CGM analysis pipeline.
