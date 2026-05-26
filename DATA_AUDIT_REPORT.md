# Data Retrieval & Search Audit

_Generated: 2026-05-25 — covers all 30+ ingestion edge functions, public-source feeds, search hooks, and content pipelines._

**TL;DR**: Three of the "live" sources are quietly broken (USPTO PatentsView, Reddit unauth, Yahoo Finance scraping), several others ingest non-T1D content because keyword matching is too loose, dedup keys collapse to `Date.now()/Math.random()` fallbacks (which silently violates the project's "no Math.random / no mocked data" core rule), search sanitization strips legitimate punctuation, and there is no cross-source content hash so the same paper appears 3–4 times. Sentiment and topic tagging use naive substring matching that mislabels a meaningful share of posts. None of this is catastrophic individually — together it produces the "shaky and inaccurate" feel the user reports.

Findings are tagged P0 (silently broken / wrong data shown), P1 (relevance/accuracy degraded), P2 (polish). Counts: **18 P0, 26 P1, 14 P2**.

---

## 1. Dead or broken upstream sources (P0)

### 1.1 USPTO PatentsView API is retired
`supabase/functions/patent-innovation-feed/index.ts:21` posts to `https://api.patentsview.org/patents/query`. USPTO **shut down PatentsView v1** in early 2025 and migrated to the new Search API at `https://search.patentsview.org/api/v1/patent/`. The current function returns 0 patents on every cron and silently falls through to "return existing data" — the entire patent stream is frozen.
**Fix**: migrate to `https://search.patentsview.org/api/v1/patent/` (POST, `X-Api-Key` header required, schema is similar but field names changed: `patent_id`, `patent_title`, `patent_abstract`, `patent_date`, `inventors[*].inventor_name_first/last`, `assignees[*].assignee_organization`). Add an API key secret. Or switch to Google Patents Public Datasets via BigQuery.

### 1.2 Reddit unauth scraping is rate-limited / 403'd
`community-feed` and `fetch-reddit-reviews` hit `old.reddit.com/r/{sub}/{sort}.json` with a browser UA. Reddit began enforcing OAuth for unauthenticated JSON endpoints in mid-2023 and now returns 403 / 429 for datacenter IPs (Supabase Edge runs from Cloudflare / AWS egress). The function logs `All endpoints failed for r/{sub}` but the orchestrator still reports `success: true`. Community posts are not actually being refreshed.
**Fix**: register a Reddit script app, store `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET`, get a bearer via `https://www.reddit.com/api/v1/access_token`, then hit `https://oauth.reddit.com/r/{sub}/{sort}` with `Authorization: Bearer …` and a unique `User-Agent: web:com.glucoforge:v1 (by /u/youruser)`. Or switch to Pushshift mirror / Search API.

### 1.3 Yahoo Finance v8 is unofficial and frequently 401/429
`financial-market-feed/index.ts:34` hits `https://query1.finance.yahoo.com/v8/finance/chart/{ticker}`. Yahoo started returning 401 with `cookie/crumb` requirements for non-browser UAs in 2024. When it fails the function returns empty `marketData` but still reports success.
**Fix**: either fetch a crumb first (`/v1/test/getcrumb` with the EU consent cookie set), or switch to a reliable free source — Alpha Vantage (key) / Finnhub free tier / Stooq CSV (`https://stooq.com/q/d/l/?s=dxcm.us&i=d`).

### 1.4 CMS Medicaid NADAC URL is malformed
`medicare-data-feed/index.ts:38`: `https://data.medicaid.gov/api/1/datastore/query/a]a64474-d161-4089-be2f-5a21a15e4a57` contains a literal `]` in the dataset UUID. Every fetch 404s and the function silently falls back to the hardcoded `REFERENCE_PRICES` map (12 drugs from Q4 2024) — surfaced to the UI as "live Medicare pricing" with no freshness badge.
**Fix**: correct UUID is `aa64474a-d161-…` (verify against medicaid.gov dataset listing) and use the proper query syntax `/api/1/datastore/query/{datasetId}/0?conditions[0][property]=...`. Also add a `last_synced_at` column and surface a "Reference price — last updated YYYY-MM-DD" badge whenever the live fetch fails.

### 1.5 `research-feed` uses `onConflict: 'link'` with no unique index
`research-feed/index.ts:218` calls `.upsert(..., { onConflict: 'link' })` against `research_items`. Without a `UNIQUE (link)` constraint Postgres rejects the upsert (or, worse, with `ignoreDuplicates: false`, the insert silently degenerates into an insert that creates duplicates). Verify the constraint exists; if not, every run multiplies rows.
**Fix**: `CREATE UNIQUE INDEX IF NOT EXISTS research_items_link_uidx ON research_items (link);`

---

## 2. `Math.random()` / `Date.now()` dedup-key fallbacks (P0 — violates Core Rule)

The memory says: _"No mocked data or `Math.random()`. Use … `crypto.randomUUID()` or deterministic generators."_ Eight feed functions break this:

| File:Line | Field |
|---|---|
| `fda-data-feed/index.ts:69, 97, 124, 154` | `fda_event_id` fallback `recall_${Date.now()}_${Math.random()}` |
| `funding-research-feed/index.ts:91, 166` | `project_number` fallback `NIH_${Date.now()}_${Math.random().toString(36).substr(2,9)}` |
| `clinical-trials-enhanced/index.ts:191` | `nct_id` fallback `trial_${Date.now()}_${Math.random()}` |
| `medical-research-aggregator/index.ts:146` | `paper_id` fallback `europe_${Date.now()}_${Math.random()}` |
| `preprint-research-feed/index.ts` (paper_id) | `paper_id: ${server}_${paper.doi || Date.now()}` |
| `ai-connection-analyzer/index.ts:303` | adds `Math.random() * 20` "variance" to a novelty score |

**Impact**: every row hitting the fallback path becomes its own unique row, so `onConflict` cannot deduplicate. Same FDA recall ingested twice on consecutive crons → two rows. AI novelty score becomes non-deterministic between runs.
**Fix**: drop the row when the natural key is missing (`if (!recall.recall_number) continue;`) OR derive a deterministic id with `await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(canonicalFields)))` and base64url-encode the first 16 bytes. Remove the `+ Math.random()*20` jitter from novelty.

---

## 3. Relevance / off-topic ingestion (P1)

### 3.1 OpenAlex/Semantic Scholar/preprint feeds catch T2D & general endocrinology
- `preprint-research-feed/index.ts:60-66` admits **any** paper whose title or abstract contains `'insulin'`, `'glucose'`, `'glycemic'`, `'beta cell'`, or `'islet'`. T2D, GDM, oncology (β-cell tumors), and general metabolism papers all pass.
- `openalex-research-feed/index.ts:22-35` queries `'continuous glucose monitoring'`, `'artificial pancreas closed loop'` etc. with **no concept filter**. OpenAlex supports `filter=concepts.id:C2779306644` (Type 1 diabetes mellitus). Without it, T2D dominates results.
- `semantic-scholar-feed/index.ts:21-34` — same pattern. Scoring penalizes low-value matches but does not gate them out, and only `medical_research_papers` rows get `is_type1_relevant` flagged downstream — UI views that don't filter on it show the noise.

**Fix**: OpenAlex: add `filter=concepts.id:C2779306644,from_publication_date:{date}`. Semantic Scholar: add `&fieldsOfStudy=Medicine&publicationTypes=JournalArticle,Review` plus a post-fetch reject when `(title+abstract+tldr).match(/type\s*2\s*diabetes|t2dm|gestational/i)` outweighs T1D signals. preprint-feed: require *either* explicit "type 1", "T1D", "T1DM", "autoimmune diabetes", "juvenile diabetes" *or* one of "islet transplant", "beta cell regen", "CAR-T autoimmune". Run the existing `classify-research-t1d` function on every ingest, not just `medical-research-aggregator`.

### 3.2 NIH RePORTER `advanced_text_search` is misused
`funding-research-feed/index.ts:38-46` puts `"type 1 diabetes OR beta cell regeneration OR …"` into `search_text` with `operator: "or"` at the outer level. RePORTER treats `search_text` as a single phrase per term group; the literal word "OR" appears in many funded grant titles. You're effectively text-matching the word "or".
**Fix**: use multiple `criteria.advanced_text_search` calls (one per concept) and union the results client-side, or pass `criteria.terms` as an array. Reference: `https://api.reporter.nih.gov/documents/Data%20Elements%20for%20RePORTER%20Project%20API%20v2.pdf`.

### 3.3 `community-feed` `detectTopics` substring matches false-positive everywhere
`community-feed/index.ts:115-150`:
- `'low'` matches `"follow"`, `"below"`, `"slowly"`, `"lower"`, `"plow"` → tags posts as `glucose_lows`.
- `'high'` matches `"highly"`, `"highest"` → `glucose_highs`.
- `'crash'` matches `"crashed my pump"` (device crash, not glucose).
- `'work'` (workplace category) matches `"workout"`, `"workaround"`, `"network"`.
- `'pump'` matches `"pumping iron"`.

**Fix**: use word-boundary regex per keyword: `new RegExp("\\b" + escapeRegex(kw) + "\\b", "i")`. Add a small stop-list. Move topic-tagging to a post-ingest cron so it can use the AI classifier instead.

### 3.4 `community-feed` `analyzeSentiment` flips on negations
`community-feed/index.ts:97-105`: simple positive/negative word counting. "**not great**", "**hate the pain went away**", "**no problems at all**" all misclassify. Same logic duplicated in `fetch-reddit-reviews`.
**Fix**: route sentiment through Lovable AI Gateway with a 1-shot classifier (`google/gemini-2.5-flash-lite`, temperature 0, batched 20 posts per call), OR adopt VADER (deno-portable) which handles negation. Mark current sentiment field as `sentiment_naive` until rebuilt.

### 3.5 `detectDeviceMention` duplicates and overlaps
`community-feed/index.ts:72-93`:
- `'guardian'` is listed twice (under `'medtronic'` and as its own key).
- `'insulet'` is a separate key from `'omnipod'` but Insulet *makes* Omnipod — a post mentioning "Insulet Omnipod 5" gets tagged `insulet` first (alphabetical), losing the Omnipod link.
- `'inpen'` → `'companion medical'` but Medtronic acquired Companion Medical in 2020; classification depends on legacy term.

**Fix**: model as a flat priority list with a unique brand per match; collapse `insulet` into `omnipod` (or use manufacturer + product fields, not a single tag).

### 3.6 `community-feed` subreddit list contains misspelled / non-existent subs
`community-feed/index.ts:251-270` includes `diabetes_t1` (does not exist — actual sub is `diabetes_t1d` or `Type1Diabetes`), `T1D` (private/banned community), `cgm` (very small, mostly OT). Real T1D-rich subs missing: `t1d_lifestyle`, `diabetes_t1`, `Type1Athletes`, `looped`, `pumpies`, `parentsofdiabetics`, `JustDiagnosed`.

---

## 4. Dedup, freshness, and integrity (P1)

### 4.1 No cross-source content hash → same paper indexed 3–4×
A paper published in NEJM is fetched by `research-feed` (PubMed+EuropePMC), `medical-research-aggregator` (EuropePMC), `openalex-research-feed`, AND `semantic-scholar-feed`. Each uses a different `paper_id` schema (`pmid_…`, `europe_…`, `openalex_W…`, `paperId`). They land in `medical_research_papers` (or `research_items`) as separate rows.
**Fix**: add `content_hash text` column = `sha256(lower(trim(doi || title)))`. Migrate one-time backfill. Add `UNIQUE` index on `content_hash` and switch all upserts to `onConflict: 'content_hash'`. Keep the first inserted `source_database` and append the rest into a `source_databases text[]`.

### 4.2 No `last_synced_at` per source / no per-source health telemetry
`data-orchestrator/index.ts:65-115` swallows per-function errors and returns `success: true` regardless. There is no admin view of which sources failed today.
**Fix**: extend `data_refresh_logs` rows per function call (already partially used by `refresh-reviews`). Surface in `SystemHealth.tsx` with per-source: last-success timestamp, row delta, error string. Email admin if any source has been red for 24h.

### 4.3 Date-only strings parsed via `new Date(...)` drift by TZ
30+ call sites use `new Date(dateOnlyString).toISOString().split('T')[0]`. `new Date('2025-01-15')` in UTC parses as midnight UTC; in a `-08:00` runtime that round-trips to `2025-01-14`. The Deno runtime is usually UTC so this works in production but breaks under any local-dev override.
**Fix**: parse explicitly: `new Date(s + 'T00:00:00Z')` or use the existing `src/utils/tzSafeGrouping.ts` helper (already in memory). Pattern matters in `funding-research-feed`, `preprint-research-feed`, `analyze-glucose`.

### 4.4 60-day deletion in `community-feed` wipes useful historical context
`community-feed/index.ts:413`: `.delete().lt('published_at', sixtyDaysAgo)`. Search hooks (`useCommunitySearch`) offer a `month` time filter, but historical solution posts older than 60d are scrubbed. The "Trending solutions" hook only looks at 48h anyway; deletion provides no caching benefit.
**Fix**: keep posts for 18 months, archive (`is_archived = true`) past 6 months, only delete past 18.

### 4.5 `clinical-trials-enhanced` returns "latest" by `created_at`, not `last_update_date`
`clinical-trials-enhanced/index.ts:259`. A study updated today but originally created 3 years ago will sort behind a brand-new but unchanged study.
**Fix**: `.order('last_update_date', { ascending: false })`.

### 4.6 `fetch-citation-network` limit 50 never paginates
`fetch-citation-network/index.ts:24`: hard `.limit(50)` on papers eligible for citation enrichment. After 50, no further papers ever get their citation network. No offset, no `is_enriched` flag.
**Fix**: add `citations_synced_at` column, query `WHERE citations_synced_at IS NULL ORDER BY publication_date DESC LIMIT 50`, set timestamp after processing.

---

## 5. Client search / hooks (P1)

### 5.1 `searchSanitizer.sanitizeForIlike` strips meaningful punctuation
`src/utils/searchSanitizer.ts`:
```ts
.replace(/\./g, '')   // Remove dots
.replace(/,/g, '')    // Remove commas
```
These remove dots from decimals ("type 1.5 diabetes"), product versions ("Dexcom G6.1"), and abbreviations ("Dr.", "U.S."). Commas are stripped pre-OR-split (the only legitimate use case) but also from inside user input which is fine — the dot is the harmful one. Note: PostgREST does not actually treat `.` as syntactic inside the value portion of an `ilike` filter — only at the operator boundary.
**Fix**: keep dots and commas inside the value; the only PostgREST hazard for `.or()` is the comma at the top level (we already escape `,` and `(`). Re-write:
```ts
return raw.replace(/\\/g,'\\\\').replace(/%/g,'\\%').replace(/_/g,'\\_').replace(/,/g,'').replace(/[()]/g,'').trim();
```

### 5.2 `useGlobalSearch` has no cross-table relevance ranking
`src/hooks/useGlobalSearch.ts:39-99`: 8 parallel `ilike` queries, results concatenated in fixed category order with `.slice(0,5)` per table. A user typing "dexcom g7" sees companies and articles before the device row. No score, no highlighting, no dedup across tables (e.g. an article *about* Dexcom G7 and the device itself).
**Fix**: short-term — score each row client-side: `(title.indexOf(q)===0 ? 100 : title.includes(q) ? 50 : 0) + (category==='device'?20:0)` and sort the combined list. Long-term — add a Postgres `tsvector` materialized search table or use the Supabase `pg_trgm` similarity operator (`%`) in an RPC.

### 5.3 `useGlobalSearch` minimum query length is 2 chars
`src/hooks/useGlobalSearch.ts:21`: triggers at length ≥ 2. With 8 parallel queries returning up to 40 rows total, a user typing "in" runs a full scan of `community_posts` and `articles` on every keystroke after the 2-char mark. Combined with the 300ms debounce that's still ~3 queries per second per active typist.
**Fix**: bump to ≥ 3 chars; cancel in-flight queries via `AbortController` when a newer query starts (current implementation just lets stale promises resolve into stale state).

### 5.4 `useDeviceDetails` builds `.or()` with raw lowercased device-name leg
`src/hooks/useDeviceDetails.ts:108` constructs `searchFilter` with `sanitizeForIlike` on each leg, good. But the FDA leg uses `manufacturer || ''` and the empty fallback creates `manufacturer_name.ilike.%%` which matches every row — pulls all 100 most-recent device events into every device-detail page.
**Fix**: skip the manufacturer leg when blank: build legs into an array, `.filter(Boolean).join(',')`.

### 5.5 `useCommunityPosts` device key collapses too aggressively
`src/hooks/useCommunityPosts.ts:30`: `deviceName.toLowerCase().split(' ')[0]` for "Tandem t:slim X2" → `'tandem'`, which matches every Tandem post including ones about the unrelated Tandem Mobi. No way to distinguish at the hook level.
**Fix**: also store `device_model` (lowercased "g7", "g6", "x2", "mobi") alongside `device_mentioned` and filter on both.

---

## 6. URL verification & link integrity (P1)

### 6.1 `verify-external-links` skips Reddit entirely
`verify-external-links/index.ts:78-83`: short-circuits Reddit URLs as "structurally valid" — any malformed permalink passes. Posts with bad URLs surface to users as broken links.
**Fix**: validate Reddit permalink shape with regex `^/r/[A-Za-z0-9_]{2,21}/comments/[a-z0-9]{4,12}/[^/]+/?$`, mark anything failing as invalid.

### 6.2 `HEAD` request rejected by many academic publishers
`verify-external-links/index.ts:88`: uses `method: 'HEAD'` only. Wiley, Elsevier, NEJM return 405 (Method Not Allowed) — every DOI on those publishers is marked invalid.
**Fix**: fall back to `GET` with `Range: bytes=0-0` on 405.

### 6.3 USPTO link not normalized to `ppubs.uspto.gov`
Memory rule: "USPTO links use ppubs.uspto.gov." `patent-innovation-feed/index.ts:120` writes `https://patents.google.com/patent/US...`. Per the rule this should be `https://ppubs.uspto.gov/pubwebapp/external.html?db=USPAT&pn=US{number}` (or the new `https://patentcenter.uspto.gov/`).
**Fix**: switch the canonical link.

---

## 7. PII, anonymization, and content safety (P2)

### 7.1 `anonymizeAuthor` uses non-cryptographic hash with collisions
`community-feed/index.ts:42-50`: 32-bit FNV-ish hash → `user_${Math.abs(hash)}`. ~50% collision risk after ~65k authors (birthday bound). Two different Reddit users surface as the same anonymized handle.
**Fix**: `const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(author)); return 'user_' + Array.from(new Uint8Array(buf)).slice(0,4).map(b=>b.toString(16).padStart(2,'0')).join('');` — 32-bit but at least cryptographic, and collisions distribute uniformly.

### 7.2 `stripPII` removes ALL URLs — destroys source attribution inside posts
`community-feed/index.ts:55-61`: `.replace(/https?:\/\/[^\s]+/g, '[url]')`. Strips legitimate citations / cross-links in post body. The original permalink is preserved separately so this isn't fatal, but readers see "[url]" littering useful text.
**Fix**: keep URLs whose hostname is in an allow-list (pubmed, doi.org, clinicaltrials.gov, fda.gov, diabetes.org, t1dexchange.org, jdrf.org). Strip the rest.

### 7.3 `community-feed` `seenIds` reset per subreddit
`community-feed/index.ts:298-300`: `const seenIds = new Set();` is declared inside the per-subreddit loop. Cross-posts (same Reddit post id appearing in r/diabetes and r/Type1Diabetes) get two rows — one per source. The composite `(source, post_id)` upsert means data integrity is preserved, but every cross-post is double-counted in `useCommunitySearch` aggregations.
**Fix**: hoist `seenIds` outside the loop and key it on `post_id` only; or accept duplicates but de-dup at read time by `post_id`.

---

## 8. AI / summarization layer (P2)

### 8.1 `research-feed.impact_level: 'High'` hardcoded
`research-feed/index.ts:83, 127`: every PubMed / Europe PMC item gets `impact_level: 'High'`. UI badges become meaningless.
**Fix**: derive from `citation_count` percentile or journal impact factor; default to `'Medium'`.

### 8.2 `ai-discovery-analyzer` writes `publication_date: new Date()` for synthesized cards
`ai-discovery-analyzer/index.ts:337, 373`: synthesized cards get today's date, which makes them sort to the top of "Latest research" indefinitely.
**Fix**: use the underlying source's publication date; mark synthesized rows with `is_ai_synthesized: true` for UI labelling per existing AI-transparency rule.

### 8.3 `ai-connection-analyzer` adds `Math.random()*20` jitter to novelty score
Already listed in §2. Repeats mean two runs over the same input yield different "novelty" scores — visible if a user refreshes.

---

## 9. Resilience & telemetry (P2)

- `tfetch` helper is duplicated in 25+ files (copy-paste). Move to `_shared/tfetch.ts`.
- No exponential backoff anywhere; the only retry is `withRetry` in `fda-data-feed`. Most APIs (Semantic Scholar especially) need 429-aware retry with `Retry-After` honoring.
- `health-check` does not test individual upstream sources — it only pings each function's own `/health` route. An OpenFDA outage shows green.
- `medicare-data-feed` rate-limits to 300ms between tickers but `funding-research-feed` and `openalex-research-feed` do not rate-limit at all (12 queries fired in tight loop).
- All functions return `success: true` even on partial failure. The `data-orchestrator` summary is therefore not actionable.

---

## 10. Prioritized fix wave (next steps)

### Wave A — kill the silent breakage (no schema change, ~3 hours)
1. Switch USPTO PatentsView to new Search API (or remove the cron and label "patent data temporarily unavailable").
2. Add Reddit OAuth bearer flow (requires `REDDIT_CLIENT_ID/SECRET` secrets — ask user).
3. Fix Yahoo Finance fallback to Stooq CSV.
4. Fix CMS NADAC URL typo `a]a64474` → `aa64474a`.
5. Drop rows when natural key missing (remove all `Math.random()`/`Date.now()` id fallbacks).
6. Skip empty manufacturer leg in `useDeviceDetails` `.or()`.
7. Word-boundary regex for `detectTopics` and `analyzeSentiment` negation handling.
8. Hoist `seenIds` in `community-feed`; remove `'guardian'` duplicate; collapse `insulet` into `omnipod`.
9. Switch `clinical-trials-enhanced` order to `last_update_date`.
10. Remove `.replace(/\./g,'')` from `sanitizeForIlike`; bump global-search min length to 3; add AbortController.

### Wave B — relevance gating (3 hours)
11. OpenAlex `filter=concepts.id:C2779306644`.
12. Semantic Scholar `fieldsOfStudy=Medicine`; reject T2D-dominant abstracts.
13. Preprint feed: require explicit T1D term.
14. NIH RePORTER: split text-search into per-concept calls.
15. Run `classify-research-t1d` on every research ingest, not just `medical-research-aggregator`.

### Wave C — dedup & freshness (migration required, 2 hours)
16. Add `content_hash`, `last_synced_at`, `is_archived`, `citations_synced_at` columns; unique index on `content_hash`.
17. Migrate paper ingestion to `onConflict: 'content_hash'`; collapse cross-source duplicates.
18. Extend `data_refresh_logs` per-function-call; surface in `SystemHealth`.
19. Stop deleting community posts at 60 days; archive at 180.

### Wave D — search ranking (4 hours)
20. Cross-table relevance scoring in `useGlobalSearch`.
21. Optional: `pg_trgm` RPC `global_search(query text, k int)` for proper similarity ranking.
22. Per-source telemetry dashboard in `SystemHealth`.

### Wave E — link verification & PII (2 hours)
23. `verify-external-links` GET fallback on 405; structural Reddit permalink regex.
24. SHA-256 anonymized author hash.
25. URL allow-list in `stripPII`.
26. Switch patent links to `ppubs.uspto.gov`.

---

_End of audit._

---

## Wave A — IMPLEMENTED (2026-05-25)

- USPTO PatentsView migrated to `search.patentsview.org/api/v1/patent/` (X-Api-Key gated; degrades gracefully when secret missing); patent links now use canonical `ppubs.uspto.gov`.
- Yahoo Finance now falls back to Stooq CSV on 401/429/empty.
- CMS NADAC dataset UUID corrected to `aa64474a-…` in both constant and per-drug query path.
- All `Math.random()`/`Date.now()` natural-key fallbacks removed in fda-data-feed, funding-research-feed, clinical-trials-enhanced, medical-research-aggregator — rows missing the natural key are now skipped so `onConflict` dedup works.
- `clinical-trials-enhanced` final read now orders by `last_update_date` (was `created_at`).
- `sanitizeForIlike` no longer strips `.` — fixes "Dexcom G6.1", "type 1.5", etc.
- `useDeviceDetails` skips empty manufacturer leg (was matching every FDA event row).
- `useGlobalSearch`: min query length 3, AbortController cancels in-flight searches, cross-table relevance scoring (exact > startsWith > includes, + category boost).
- `community-feed`: SHA-256 author hash (replaces 32-bit FNV with collisions), word-boundary topic detection, negation-aware sentiment, hoisted `seenIds` across subreddits, collapsed `insulet`/`guardian` into their parent device keys.

## Waves B + E + AI fixes — IMPLEMENTED (2026-05-25)

Wave B (relevance gating):
- `openalex-research-feed`: now filters by T1D-adjacent concept IDs (C2779306644, C2780176034, C2776506181) AND post-fetch rejects T2D-dominant abstracts.
- `semantic-scholar-feed`: `fieldsOfStudy=Medicine,Biology` + `publicationTypes=JournalArticle,Review,ClinicalTrial`; `isT2dDominant` reject filter.
- `preprint-research-feed`: requires explicit T1D signal (T1D / autoimmune / juvenile / islet transplant / beta-cell regen / CGM). Skips rows missing DOI (was `Date.now()` fallback).
- `research-feed`: `impact_level` now derived from citation count (Breakthrough/High/Medium/Low) instead of hardcoded "High".

Wave E (link integrity & PII):
- `verify-external-links`: structural Reddit permalink regex (`^/r/{sub}/comments/{id}/…`); HEAD requests now fall back to ranged GET on 405/403 (fixes Wiley/Elsevier/NEJM DOI verification).
- `community-feed.stripPII`: URL allow-list (pubmed, doi.org, clinicaltrials.gov, fda.gov, nih.gov, diabetes.org, t1dexchange.org, jdrf.org, breakthrought1d.org, ada.org, europepmc.org, openalex.org, biorxiv/medrxiv, NEJM, Lancet) — legitimate citations now survive scrub.

AI synthesis fixes:
- `ai-connection-analyzer`: removed `Math.random()*20` novelty jitter — now deterministic evidence-count bonus.
- `ai-discovery-analyzer`: synthesized cards inherit `publication_date` from underlying evidence (was always today, pinning them to top of "Latest research"); flagged with `is_ai_synthesized: true`.

Schema additions (migration):
- `discoveries.is_ai_synthesized` (boolean, default false) — for transparency labels on AI-synthesized cards.
- `medical_research_papers.content_hash` + `last_synced_at` (+ partial index) — foundation for cross-source paper de-duplication.
- `community_posts.is_archived` (+ index) — enables archiving past 6 months instead of deleting at 60 days.

## Waves C + D — IMPLEMENTED (2026-05-25)

Wave C (cross-source deduplication & freshness):
- New `_shared/contentHash.ts` helper: SHA-256 over `doi` → `pmid` → `normalized(title)|firstAuthorSurname|year` (16-byte hex). Same paper surfaced via OpenAlex + Semantic Scholar + Europe PMC + bioRxiv now produces the same hash.
- `medical-research-aggregator`, `openalex-research-feed`, `semantic-scholar-feed`, `preprint-research-feed` all populate `content_hash` + `last_synced_at` on every upsert. Existing `onConflict: 'paper_id'` continues to work; the populated `content_hash` is the foundation for a future backfill that merges cross-source duplicates.
- `scheduled-maintenance`: archives `community_posts` older than 180 days (`is_archived = true`) instead of relying on deletion; default link-verification sweep now skips archived posts. HEAD requests fall back to ranged GET (`Range: bytes=0-1023`) on 405/403 — matches the `verify-external-links` fix.

Wave D (per-source telemetry):
- `health-check` now pings 10 upstream sources (PubMed, EuropePMC, OpenAlex, Semantic Scholar, ClinicalTrials.gov, OpenFDA, NIH RePORTER, USPTO PatentsView v1, CMS NADAC, Stooq) with a 6s timeout each and reports `healthy` / `degraded` / `rate_limited` / `unreachable` per source. The `SystemHealth` page now surfaces real upstream outages instead of always-green.
- Cross-table relevance ranking already shipped in Wave A (`useGlobalSearch` `scoreResult` — exact > startsWith > includes + category boost).

## Waves F + keyless workarounds — IMPLEMENTED (2026-05-26)

**Workarounds for the previously-required external credentials**
- **Reddit (no OAuth needed):** `community-feed` now tries `https://www.reddit.com/r/<sub>/<sort>.rss` first with a compliant `User-Agent` (`web:glucoforge-community-feed:v1.1`). Reddit's RSS endpoint is still served to server IPs without a client_id/secret. Falls back to `old.reddit.com` / `www.reddit.com` JSON only if RSS fails. Inline Atom-to-RedditPost parser keeps the rest of the pipeline unchanged.
- **PatentsView (no API key needed):** `patent-innovation-feed` now falls back to **Firecrawl-scraped Google Patents** when `PATENTSVIEW_API_KEY` is missing OR the keyed API returns nothing. We already hold a Firecrawl key. Parses `[Title](/patent/USxxxxx/)` rows and continues to emit canonical `ppubs.uspto.gov` URLs.

**Wave F — search ranking + dedup hardening (migration applied)**
- `pg_trgm` extension enabled. Trigram GIN indexes added on the 9 highest-traffic search columns: research title/abstract, devices.name, medications.name, t1d_companies.name, clinical_trials_detailed.title, articles.title, community_posts.title, diabetic_health_projects.title. `ilike '%term%'` queries from `useGlobalSearch` now hit indexes instead of seq-scanning.
- `content_hash` backfilled for every existing `medical_research_papers` row using the same DOI → PMID → normalized(title|first author|year) algorithm as the edge-function helper.
- Historical duplicates collapsed (kept the most-recently-updated row per hash).
- `UNIQUE` partial index `uniq_research_content_hash` now enforces single-row-per-paper going forward, so PubMed + OpenAlex + Semantic Scholar + Europe PMC ingests of the same DOI converge into one row.
- `(is_archived, published_at DESC)` index on `community_posts` makes the new archive partition cheap to filter.

**Runtime polish**
- `useGlobalSearch` now aborts superseded queries with an explicit reason (`'superseded-by-newer-search'`) so React Query stops surfacing "signal is aborted without reason" in the preview console.

**Still deferred (require human decisions, not code)**
- Optional: add a `match-by-trigram` RPC and switch `useGlobalSearch` from `ilike` to `similarity()` ordering for typo tolerance (current trigram indexes already help substring search; typo ranking is a follow-up).
- Optional: per-hook freshness badges (`DataFreshnessBadge`) on every research/discovery card. The data plumbing is in place (`last_synced_at`) — only UI placement work remains.

### Remaining (deferred — needs user input or external accounts):
- Reddit OAuth bearer flow (needs `REDDIT_CLIENT_ID/SECRET` secrets from user).
- PatentsView Search API key (`PATENTSVIEW_API_KEY`) — function degrades gracefully when missing.
- Optional: `pg_trgm`-backed `global_search(query, k)` RPC for true fuzzy ranking (deferred — current scoring is sufficient for 3-char min query).
- Backfill job to collapse historical cross-source paper duplicates using the new `content_hash` (one-time admin task — would delete ~thousands of rows; needs explicit approval before running).