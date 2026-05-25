# Data Retrieval & Search Audit

The app pulls from ~30 live edge functions across PubMed, Europe PMC, OpenAlex, Semantic Scholar, arXiv, bioRxiv/medRxiv, ClinicalTrials.gov, openFDA, NIH RePORTER, USPTO/PatentsView, CMS, Yahoo Finance, Reddit, Firecrawl, Resend, and Lovable AI — plus client-side search (`useGlobalSearch`, `useDeviceDetails`, `useCommunityPosts`, etc.). The user reports the system "feels shaky and inaccurate." This plan delivers a written audit, not a code dump, then a prioritized fix wave.

## Phase 1 — Inventory & evidence gathering (read-only)

Build a single source-of-truth matrix covering every retrieval path:

1. **External feeds** (each of the 20 fetch functions listed below) — record:
   - Source URL, auth requirement, rate limits, response shape assumptions
   - Query terms / topic filters used (are they T1D-specific or generic "diabetes"?)
   - Timeout, retry, backoff, pagination, dedupe key
   - Upsert target table + `onConflict` column + how stale rows expire
   - Sentiment/classification logic (where applied)

   Functions: `community-feed`, `fetch-reddit-reviews`, `fetch-t1d-news`, `clinical-trials-enhanced`, `openalex-research-feed`, `semantic-scholar-feed`, `patent-innovation-feed`, `preprint-research-feed` (arXiv/bioRxiv/medRxiv), `funding-research-feed` (NIH RePORTER), `financial-market-feed` (Yahoo), `medicare-data-feed` (CMS NADAC), `fda-data-feed` (510k/PMA/MAUDE/enforcement), `medical-research-aggregator`, `research-feed` (PubMed+EuropePMC), `nutrition-lookup`, `fetch-device-reviews`, `fetch-medication-reviews`, `fetch-citation-network`, `refresh-reviews`, `verify-external-links`, `data-orchestrator`.

2. **Client search & detail hooks** — `useGlobalSearch`, `useDeviceDetails`, `useCommunityPosts`, `useMedicalResearchPapers`, `useClinicalTrialsDetailed`, `useDrugPricing`, `useFDAData`, `usePatentData`, `useResearchFeed`, `useResearchInsights`, `useMarketData`, `useResources`, `useCommunitySearch`, `useExternalReviews`, `useSimilarPosts`. Check:
   - PostgREST `.or()` / `.ilike()` sanitization (`sanitizeForIlike` correctness)
   - `staleTime` choices, row limits, projection, `maybeSingle()` usage
   - Cross-table relevance ranking (currently none — results are concatenated by category with no scoring)

3. **Content quality layer** — `_shared/junkFilter.ts`, `_shared/sentiment.ts`, `reviewSanitizer.ts`, `contentSafety.ts`, T1D-relevance classifier (`classify-research-t1d`). Verify they actually run in every ingestion path.

## Phase 2 — Findings report

Deliver `DATA_AUDIT_REPORT.md` grouped by severity:

- **Accuracy bugs**: wrong field mapping (e.g. arXiv `summary` vs `abstract`), DOI vs URL, date parsing (UTC drift), HTML entities not decoded, truncation mid-word, sentiment mislabel on neutral medical text.
- **Relevance gaps**: queries that pull non-T1D content (generic "diabetes", "insulin" hits T2D), Reddit subs not filtered to T1D, OpenAlex without concept ID `C2779306644`, missing `is_type1_relevant` gate before display.
- **Search gaps**: `useGlobalSearch` lacks relevance scoring, lacks deduplication across tables, no fuzzy/typo tolerance, no highlighting; `.or()` calls that don't sanitize all branches; missing limits causing 1000-row PostgREST cap surprises.
- **Freshness/staleness**: feeds without `last_fetched_at`, no TTL eviction, `staleTime` too long for live trials, `DataFreshnessBadge` not wired everywhere.
- **Dedup & integrity**: weak `onConflict` keys (title-only collisions), missing SHA-256 payload hash, double-counting between PubMed and EuropePMC.
- **Resilience**: missing `AbortSignal.timeout`, no exponential backoff, partial-failure swallowed silently, no per-source success metric in `health-check`.
- **Security**: unsanitized search terms reaching `.or()`, external links missing `rel="noopener"`, USPTO not on `ppubs.uspto.gov`, Firecrawl key exposure checks.
- **Citations/transparency**: research cards missing source attribution, AI summaries not labeled, no "last verified" timestamp on scraped content.

Each finding includes: file:line, severity (P0/P1/P2), reproduction, proposed fix, est. effort.

## Phase 3 — Prioritized fix wave (separate build-mode turn)

After you approve the report, implement P0/P1 fixes in batched commits:
- Wave A: query/relevance fixes + sanitization (no schema changes)
- Wave B: dedupe key + freshness columns (migration)
- Wave C: global search ranking + UI freshness/source badges
- Wave D: `health-check` per-source telemetry dashboard

## Out of scope

- Changing AI model selection or analysis prompts (separate concern)
- Redesigning database schema beyond adding `last_fetched_at` / `content_hash` columns
- Adding new external data sources

## Deliverables of this plan

1. `DATA_AUDIT_REPORT.md` at repo root (~200–400 findings expected based on 5,400 LOC across 20 feed functions + 60+ hooks).
2. Updated `comprehensive_audit_v5.csv` with new "data-quality" category rows.
3. Recommendation: which fixes to ship first.

## Approval question

Want me to (a) execute the full audit and produce the report, or (b) scope it to one slice first — e.g. just the research feeds (PubMed/OpenAlex/Semantic Scholar/arXiv/bioRxiv) or just global search?
