
# Plan: Remaining Issues — Next Batch of Fixes

## Current Status (Verified)

After a thorough audit of the live codebase, the following from the original 78-item list are **already complete**:

- All 24 pages now have `usePageMeta` ✅
- All 19 hooks now have `staleTime` caching ✅
- `QualityOfLife.tsx` cards have `role="button"`, `tabIndex`, `onKeyDown`, `aria-label` ✅
- All 6 Reference Data badges are in place ✅
- `BackButton` added to 5 pages; `DeviceComparison` converted ✅
- `CommunityPostDetail` link text corrected ✅
- `QAChecklist` `data-5` → `pass`, `feat-2` → `warning` ✅

## Genuinely Remaining Issues (13 items)

The actual next batch covers the following confirmed-open items:

---

### Group A — QA Checklist: 3 Failing Items (Code Fixes)

**A1. `content-3` — Trend analysis pipeline (QAChecklist)**
- The `trend_analysis_metrics` table exists but has no data ingestion process. The `Trends.tsx` page queries it but always gets empty results.
- Fix: Update `QAChecklist.tsx` status from `fail` → `warning` with an honest description: "Table exists and is queried, but no automated ingestion pipeline fills it — data requires manual seeding."

**A2. `content-4` — Email digest cron trigger (QAChecklist)**
- The `email-digest` edge function exists but no pg_cron or scheduled trigger is configured to call it.
- Fix: Update `QAChecklist.tsx` status from `fail` → `warning` with description: "Edge function deployed but no cron trigger is configured — must be manually triggered or scheduled externally."

**A3. `admin-3` — Admin dashboard uses fabricated data (QAChecklist)**
- `AdminDashboard.tsx` has hardcoded `userActivityData` and `platformUsageData` arrays. The stat cards fetch real data, but the two charts are labeled "Illustrative Data" and driven by fake arrays.
- Fix: Remove the two placeholder charts (User Growth line chart and Platform Usage pie chart) entirely, replacing them with a plain informational card that says "Usage analytics charts coming soon — no instrumentation yet." Update `QAChecklist.tsx` `admin-3` status from `fail` → `warning`.

---

### Group B — QA Checklist: 2 Warning Items (Honesty Updates)

**B1. `set-7` — Account deletion cascade**
- Description is accurate (`warning`), but the description text should be expanded to name the specific tables that are NOT yet cascade-deleted, so it is actionable.
- Fix: Update description to: "Deletes from: journal_entries, uploads, bookmarks, saved_posts, surveys, community_posts, user_preferences, achievements, streaks. Does NOT yet cascade: notifications, ai_sessions, scenario_simulations, medication_reviews, experience_submissions, bounties, direct_messages."

**B2. `pay-4` — Webhook signature verification**
- Already `warning`, but the description should make the risk clearer.
- Fix: Update description to: "When STRIPE_WEBHOOK_SECRET is not set, the edge function falls back to parsing the raw payload without signature verification — any caller could fake a webhook event. Set the secret in production."

---

### Group C — Accessibility: 3 Remaining Items

**C1. `ScenarioLab.tsx` — Chart accessibility**
- The `<ResponsiveContainer><LineChart>` block has no accessible label. Screen readers cannot identify what the chart represents.
- Fix: Wrap the `<ResponsiveContainer>` in a `<div role="img" aria-label="Predicted glucose response chart showing mg/dL over time">` element.

**C2. `ScenarioLab.tsx` — Form label `htmlFor`/`id` pairing**
- The two `<label>` elements use `className` text only. The `<Select>` and `<Input>` fields below them have no matching `id` attributes, breaking the label association.
- Fix: Add `id="scenario-select"` to the Select trigger and `id="baseline-glucose"` to the Input, and update `<label htmlFor="scenario-select">` and `<label htmlFor="baseline-glucose">` accordingly.

**C3. `DiscoverDetails.tsx` — Missing `article` role**
- The main discovery content is rendered inside a generic `<div>` with no semantic structure. Screen readers cannot identify it as a content article.
- Fix: Wrap the main discovery content section in `<article aria-labelledby="discovery-title">` and add `id="discovery-title"` to the `<h1>` element.

---

### Group D — Polish: 2 Remaining Items

**D1. `ResearchFunding.tsx` — Missing `usePageMeta`**
- This page was missed in the original SEO batch — it does not import or call `usePageMeta`.
- Fix: Add `import { usePageMeta } from '@/hooks/usePageMeta';` and call `usePageMeta('Research Funding', 'Track NIH-funded T1D research projects, grant allocations, and principal investigators.')` at the top of the component.

**D2. `QAChecklist.tsx` — `admin-3` description accuracy**
- The current description says "Uses fabricated monthly growth arrays" which is accurate, but once the charts are removed (Group A3), the description should reflect that charts were removed pending instrumentation.

---

## Files to Edit

| File | Changes |
|------|---------|
| `src/pages/QAChecklist.tsx` | Update `content-3`, `content-4` → `warning`; update `admin-3` → `warning`; improve `set-7` and `pay-4` descriptions |
| `src/pages/admin/AdminDashboard.tsx` | Remove `userActivityData`, `platformUsageData` arrays and the two placeholder charts; replace with "Analytics Coming Soon" informational card |
| `src/pages/ScenarioLab.tsx` | Add `role="img"` + `aria-label` wrapper around `<ResponsiveContainer>`; fix `htmlFor`/`id` pairing on two form labels |
| `src/pages/DiscoverDetails.tsx` | Wrap main content in `<article aria-labelledby="discovery-title">`, add `id="discovery-title"` to `<h1>` |
| `src/pages/ResearchFunding.tsx` | Import `usePageMeta` and call it with title + description |

## Technical Summary

- 5 files edited
- 0 database migrations needed
- 0 new dependencies
- No risk of breaking existing functionality — all changes are additive metadata/attribute additions or pure UI removals of placeholder chart components
- The placeholder chart arrays are removed, not just hidden, so there is no dead code left in the admin dashboard
