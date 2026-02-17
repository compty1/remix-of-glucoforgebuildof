

## Diabeto 18+ Expansion: Comprehensive Adult T1D Content Hub

### Overview
Transform the Diabeto 18+ page from a basic post feed into a full-featured community hub (matching the Community Solutions architecture) with rich, realistic content seeded from real public sources about sex, intimacy, alcohol, and substances with Type 1 Diabetes.

---

### 1. Expand the adult_content_posts table

Add columns to match the richer `community_posts` schema and support the new features:

- `topic_tags` (text array) -- for filtering by sub-topics like "cgm_during_sex", "erectile_dysfunction", "lows_during_sex"
- `sentiment` (text) -- positive/neutral/negative
- `confidence_score` (float) -- content quality score
- `post_type` (text) -- "post", "article", "research", "guide"
- `is_featured` (boolean) -- for editorial picks
- `source_type` (text) -- "reddit", "research", "organization", "blog"

---

### 2. Create a comprehensive seed function: `seed-adult-content-expanded`

A new edge function that seeds 40-50 realistic posts across all categories, drawing from the real sources provided and similar public discussions. Content will be organized into these sub-categories:

**Intimacy (15-20 posts):**
- Sex with CGMs/pumps -- practical device management (inspired by the Reddit threads provided)
- Erectile dysfunction and T1D -- prevalence, community experiences
- Blood sugar crashes during sex -- management strategies
- Disclosure to new partners -- when and how to tell
- Body image and intimacy with devices
- Sex differences in insulin requirements (from the Diabeloop study)
- Hormonal effects on blood sugar

**Alcohol (10-12 posts):**
- Delayed hypoglycemia after drinking
- Best/worst drink choices
- College/party survival guides
- Social pressure and diabetes

**Substances (8-10 posts):**
- Cannabis and blood sugar effects
- Party drugs and CGM reliability
- Harm reduction strategies

**Research and Articles (5-8 posts):**
- Curated content from GrownUpT1Ds.org resources
- The EUROSPEC poster on sex differences in insulin requirements
- Diabeloop clinical study findings
- Medical journal summaries on sexual health and T1D

Each post will include realistic tips, warnings, comment counts, and source URLs pointing to the actual public sources (Reddit threads, research papers, organization pages).

---

### 3. Upgrade the Diabeto18Plus page UI

Rewrite the page to mirror the Community Solutions architecture with:

**a) Enhanced category tabs:**
- All Topics | Intimacy & Sex | Alcohol | Substances | Research & Articles

**b) Search bar** -- text search across titles and content (reusing `CommunitySearchBar` pattern)

**c) Filter bar** -- sentiment, source type (Reddit/Research/Blog), time range, minimum upvotes

**d) Sidebar with:**
- Trending 18+ discussions
- Quick topic chips (e.g., "CGM during sex", "Lows after drinking", "ED and T1D")
- Curated resource links (GrownUpT1Ds, Diabeloop study, etc.)

**e) Richer post cards** -- adding sentiment icons, topic tags, confidence badges, expand/collapse content, and "View Original" links to real sources

**f) Featured articles section** -- a top banner area for research/organization content (Diabeloop study, EUROSPEC poster, GrownUpT1Ds resources)

---

### 4. Create a custom hook: `useAdultContentSearch`

Modeled after `useCommunitySearch`, this hook will provide:
- Paginated fetching from `adult_content_posts`
- Text search (title + content)
- Category, sentiment, source_type, and topic_tag filters
- Sort by upvotes, date, or relevance
- Infinite scroll support with accumulated posts

---

### 5. Add a "Curated Resources" section

A static/semi-static component listing verified external resources:
- GrownUpT1Ds.org community link
- Diabeloop sex-differences study
- EUROSPEC research poster
- Key Reddit megathreads

Each with description, "Verified" badge, and external link.

---

### Technical Details

**Files to create:**
- `supabase/functions/seed-adult-content-expanded/index.ts` -- seed function with 40-50 realistic posts + comments
- `src/hooks/useAdultContentSearch.ts` -- search/filter hook
- `src/components/adult-content/AdultSearchBar.tsx` -- search component
- `src/components/adult-content/AdultFilterBar.tsx` -- filter component
- `src/components/adult-content/AdultPostCard.tsx` -- enhanced post card
- `src/components/adult-content/FeaturedResources.tsx` -- curated resources section
- `src/components/adult-content/TrendingAdultTopics.tsx` -- sidebar trending topics

**Files to modify:**
- `src/pages/Diabeto18Plus.tsx` -- full rewrite to use new components
- `supabase/config.toml` -- register new edge function

**Database migration:**
- Add new columns to `adult_content_posts` (topic_tags, sentiment, confidence_score, post_type, is_featured, source_type)

