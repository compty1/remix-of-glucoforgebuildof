

# Compare Your Data to High-Performing Users

## Overview
Create a "Peer Comparison" feature that compares the logged-in user's uploaded CGM data against population benchmarks from the public glucose dataset -- specifically filtering for users with "excellent" and "good" control levels. This comparison will appear in three places: the User Dashboard (as a new widget), the Public Glucose Data page (as a new tab), and the Discover page (as a new widget card).

## What You'll See

### 1. New Hook: `useGlucoseComparison`
A central hook that:
- Fetches the user's latest upload analysis (TIR, avg glucose, CV, GMI, time below/above range, patterns)
- Queries the public glucose dataset via RPC to get benchmarks for "excellent" control users (TIR, avg glucose, CV, time below 70, time above 180)
- Computes detailed comparison metrics: deltas, percentile ranking, strengths/weaknesses identification
- Identifies which user patterns (e.g., dawn phenomenon, post-meal spikes) the high-performers have solved and how

### 2. New Component: `PeerComparisonPanel`
A reusable component showing:
- **Side-by-side metrics table**: Your TIR vs Top Performers' TIR, Your CV vs theirs, etc. with color-coded arrows and delta badges
- **Radar chart**: Visual overlay comparing user profile vs high-performer profile across 6 dimensions (TIR, CV, time below, time above, avg glucose, GMI)
- **Strengths & areas for improvement**: Auto-detected based on where user exceeds or falls behind the benchmark
- **"How they do it" section**: For each metric where user is behind, show what device/pump combo, time-of-day patterns, and insulin strategies the high-performers use (derived from public data demographics breakdown)
- **Percentile placement**: Where user sits in the overall population distribution

### 3. New Database RPC: `get_high_performer_benchmarks`
A database function that computes aggregate stats for users with "excellent" and "good" control levels:
- Average glucose, TIR, CV, time below 70, time above 180
- Breakdown by time of day (morning/afternoon/evening/night)
- Most common pump models and CGM models among high performers
- Comparison by age range

### 4. Integration Points

**Dashboard** (`src/pages/Dashboard.tsx`):
- Add a new widget `peer-comparison` to the available widgets list
- Shows a compact summary card with: your TIR vs top performers, quick gap analysis, and a link to full comparison

**Public Glucose Data** (`src/pages/PublicGlucoseData.tsx`):
- Add a new "Your Comparison" tab in the existing tab list
- Shows the full `PeerComparisonPanel` with all detailed analysis
- Only visible when user is logged in and has upload data; otherwise shows a prompt to upload

**Discover** (`src/pages/Discover.tsx`):
- Add a new widget card in the multi-source data widgets grid
- Compact card showing: "Your TIR: X% vs Top Performers: Y%" with a link to full comparison

## Technical Details

### New Files
- `src/hooks/useGlucoseComparison.ts` - Core comparison logic hook
- `src/components/glucose/PeerComparisonPanel.tsx` - Full comparison UI with radar chart, side-by-side table, strengths/weaknesses, and "how they do it" section

### Modified Files
- `src/pages/Dashboard.tsx` - Add `peer-comparison` widget to `availableWidgets` array
- `src/pages/PublicGlucoseData.tsx` - Add "Your Comparison" tab
- `src/pages/Discover.tsx` - Add compact comparison widget card

### Database Changes
- New RPC function `get_high_performer_benchmarks` that aggregates stats from `public_glucose_data` filtered to `control_level IN ('excellent', 'good')`, returning: avg glucose, TIR percentages, CV, time-of-day breakdowns, top pump/CGM models, and age-range breakdowns

### Data Flow
1. User's latest upload `detailed_analysis` JSON provides their metrics
2. RPC call to `get_high_performer_benchmarks` provides population benchmarks for high performers
3. Hook computes deltas, percentiles, strengths, and actionable insights
4. Components render the comparison with Recharts radar chart and comparison tables

### Key Comparison Metrics
- Time in Range (70-180 mg/dL)
- Time Below Range (< 70 mg/dL)
- Time Above Range (> 180 mg/dL)
- Average Glucose
- GMI (Glucose Management Indicator)
- CV (Coefficient of Variation)
- Time-of-day patterns (morning, afternoon, evening, night)
- Device/pump strategy insights from high performers

