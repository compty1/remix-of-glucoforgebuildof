

# Diabetes Burnout Resource Page

## Overview
Create a comprehensive, standalone Diabetes Burnout page at `/diabetes-burnout` that serves as a practical, actionable resource hub. It will combine clinical data, real community posts with working links, supplement/prescription guidance (including seasonal Vitamin D emphasis), and structured recovery plans.

## Page Structure

### 1. Hero Section
- Title: "Diabetes Burnout" with a subtitle emphasizing this is a practical resource that actually works
- Brief clinical definition of diabetes burnout vs. general burnout
- Key statistics (e.g., 36-45% of T1D adults experience burnout at some point, per Diabetes Care research)

### 2. Recognizing Burnout - Signs & Symptoms
- Checklist-style section with common burnout indicators:
  - Skipping blood sugar checks
  - "Rage bolusing" or ignoring highs
  - Avoiding doctor appointments
  - Feeling resentful toward diabetes management
  - Emotional numbness about numbers
  - Carb-counting fatigue
- Interactive self-assessment quiz (simple scoring)

### 3. Evidence-Based Recovery Plans
Tabbed sections with structured, actionable plans:
- **The 2-Week Reset**: A day-by-day minimal viable management plan to ease back in
- **The Permission Plan**: Structured "good enough" targets instead of perfection
- **The Delegation Plan**: What to automate (CGM alerts, AID systems) to reduce decision fatigue
- **The Social Plan**: How to communicate with family/friends/coworkers about burnout

### 4. Supplement & Prescription Guidance for Stress/Anxiety
- **Vitamin D** (emphasized for winter/seasonal):
  - Why T1D patients are especially susceptible (autoimmune link, indoor time)
  - Deficiency symptoms: fatigue, muscle weakness, bone pain, depression, frequent illness, slow wound healing
  - Recommended dosing (2000-5000 IU daily in winter)
  - Testing recommendations (25-hydroxyvitamin D blood test)
- **Magnesium**: For anxiety, sleep, and insulin sensitivity
- **Omega-3s**: Anti-inflammatory, mood support
- **B-Complex**: Energy, nerve health
- **Ashwagandha**: Cortisol reduction
- **Prescription options**: SSRIs/SNRIs commonly used alongside T1D, buspirone for anxiety, noting diabetes-specific considerations
- Each entry includes: dosage info, evidence level, precautions with insulin, and when to talk to a doctor

### 5. Real Community Solutions (Seeded Data)
- Create a new database table `burnout_community_posts` with real Reddit posts and comments about diabetes burnout solutions
- Seed via an edge function `seed-burnout-posts` with 15-20 real posts from:
  - r/diabetes_t1d
  - r/diabetes
  - r/Type1Diabetes
  - Beyond Type 1 forums
- Each post includes: title, content, author (anonymized), score, real working Reddit search URLs, comments
- Display using existing `SolutionCard`-style components with comments, upvotes, and source links
- Topic categories: "Taking a Break", "Automation Saved Me", "Therapy That Worked", "Simplifying Management", "CGM Burnout"

### 6. Practical Daily Tools
- A "Minimum Viable Diabetes" checklist for bad days
- A "Burnout Emergency Kit" - immediate actions when feeling overwhelmed
- Printable/downloadable recovery plan summary

### 7. Mental Health Professional Resources
- How to find a diabetes-specialized therapist
- Telehealth options
- Crisis hotlines (988 Suicide & Crisis Lifeline, JDRF peer support)

## Technical Implementation

### Database
- New table: `burnout_community_posts` with columns matching `community_posts` schema plus a `burnout_category` text field
- New table: `burnout_comments` for threaded comments on burnout posts
- RLS: Public read access (no auth required for reading), matching existing community tables

### Edge Function
- `seed-burnout-posts`: Seeds 15-20 real community posts with realistic data, working Reddit search URLs, and 3-5 comments each

### New Files
- `src/pages/DiabetesBurnout.tsx` - Main page component with all sections
- `src/hooks/useBurnoutPosts.ts` - Hook to fetch burnout community posts and comments
- `supabase/functions/seed-burnout-posts/index.ts` - Seeder edge function

### Modified Files
- `src/App.tsx` - Add route `/diabetes-burnout`
- `src/components/AppSidebar.tsx` - Add navigation link under the Mental Health / Well-being section

### Patterns
- Uses existing `Layout`, `BackButton`, `Card`, `Tabs`, `Badge` components
- Community posts follow the same `SolutionCard` display pattern with `PostComments` integration
- Supplement data follows the `QualityOfLife` page pattern with evidence levels and dosage info
- All community post URLs use Reddit-wide search URL format (e.g., `reddit.com/search/?q={keywords}&type=link`) matching the existing link validation system

