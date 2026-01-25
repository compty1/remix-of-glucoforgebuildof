
# Implementation Plan: Explore Page (T1D History Timeline) + Your Experience Page (Animated Jar Submissions)

## Overview
This plan adds two new feature-rich pages to the GlycoForge platform:
1. **Explore Page** (`/explore`) - Interactive zoomable timeline of T1D history from ancient times to present
2. **Your Experience Page** (`/your-experience`) - Animated blood drop jars for community submissions across 4 categories

---

## PART 1: Explore Page - Interactive T1D History Timeline

### Database Schema

Create a new table `t1d_history_events` to store timeline events:

```sql
CREATE TABLE t1d_history_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  year_end INTEGER, -- For date ranges (e.g., "1920s")
  era TEXT, -- 'ancient', 'pre-insulin', 'early-insulin', 'modern', 'digital'
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  detailed_description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'discovery', 'treatment', 'technology', 'research', 'cultural', 'landmark'
  subcategory TEXT, -- More specific categorization
  image_url TEXT,
  image_caption TEXT,
  sources TEXT[], -- Array of source URLs/citations
  interesting_facts TEXT[], -- Array of lesser-known facts
  impact_score INTEGER DEFAULT 5, -- 1-10 importance rating for filtering
  decade TEXT, -- For decade grouping ('1990s', '2000s', etc.)
  decade_summary TEXT, -- Overview of that decade's treatment landscape
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE t1d_history_events ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for history events"
  ON t1d_history_events FOR SELECT TO public USING (true);
```

### Historical Events Data (Seed Function)

Create `supabase/functions/seed-t1d-history/index.ts` with accurate historical data spanning:

**Ancient Period (1550 BCE - 1800s)**
- 1550 BCE: Ebers Papyrus - First known documentation of diabetes symptoms (excessive urination)
- 250 BCE: Apollonius of Memphis coins term "diabetes" (Greek for "to pass through")
- 1674: Thomas Willis adds "mellitus" (honey-sweet) after tasting diabetic urine
- 1776: Matthew Dobson proves sugar in urine/blood

**Pre-Insulin Era (1800s - 1921)**
- 1869: Paul Langerhans discovers islets of Langerhans
- 1889: Minkowski & von Mering link pancreas to diabetes
- 1893: Gustave-Edouard Laguesse suggests islets produce diabetes-preventing secretion
- 1906: Jean de Meyer names hypothetical substance "insulin"

**Insulin Discovery Era (1921-1940)**
- 1921: Banting & Best isolate insulin; first successful human treatment (Leonard Thompson)
- 1922: Eli Lilly begins commercial insulin production
- 1923: Banting & Macleod win Nobel Prize
- 1936: Hagedorn develops protamine insulin (first long-acting)

**Mid-Century Advances (1940s-1970s)**
- 1949: First urine glucose test strips
- 1955: Oral sulfonylureas discovered
- 1959: Scientists distinguish Type 1 from Type 2 diabetes
- 1969: First portable glucose meter (Ames Reflectance Meter - took 2 minutes!)
- 1970: First insulin pump prototype

**Technology Revolution (1980s-1990s)**
- 1980: Home blood glucose monitoring becomes practical
- 1982: FDA approves first recombinant human insulin (Humulin)
- 1986: Insulin pens introduced in Europe
- 1990s: Glucose meters shrink, readings drop from 120 seconds to 30 seconds
- 1996: First rapid-acting insulin analog (Humalog)
- 1999: First CGM (Continuous Glucose Monitor) approved (MiniMed CGMS)

**Digital & Modern Era (2000s-Present)**
- 2004: Dexcom's first CGM
- 2006: First modern insulin pump with CGM integration
- 2016: FDA approves first hybrid closed-loop system (Medtronic 670G)
- 2017: Loop DIY APS gains popularity
- 2021: FDA approves first interoperable automated insulin dosing software
- 2023: Teplizumab (Tzield) - first drug to delay T1D onset

**Decade Treatment Summaries**
- 1990s: Large meters (Glucometer Elite), 60-second readings, 10+ daily finger sticks, NPH/Regular insulin, strict meal schedules
- 2000s: Smaller meters, 5-second readings, insulin pumps become mainstream, early CGM (bulky, inaccurate)
- 2010s: CGM revolution, Dexcom G4/G5, hybrid closed loops, flash glucose monitoring
- 2020s: AID systems, Omnipod 5, Tandem Control-IQ, tubeless pumps, integrated smartphone apps

**Interesting Lesser-Known Facts**
- Before insulin, average life expectancy after T1D diagnosis was 1-2 years
- Leonard Thompson (first insulin patient) lived 13 more years
- Early insulin extracted from pig and cow pancreases - took 2 tons of pig parts for 8 oz of insulin
- "Starvation diets" of 400 calories/day were the only treatment pre-insulin
- The 1989 "Ames Glucometer II Memory" was first meter with memory - stored 10 readings
- Early insulin was so impure, patients developed lipodystrophy (fat lumps) at injection sites

### Frontend Components

**1. Main Page: `src/pages/Explore.tsx`**
- Hero section with vintage-to-modern visual gradient
- Interactive timeline visualization using a custom React component
- Filter controls: Era, Category, Impact Level
- Zoom controls for timeline granularity (decades vs years vs events)
- Search functionality

**2. Timeline Component: `src/components/explore/InteractiveTimeline.tsx`**
- Horizontal scrollable timeline with zoom capability
- Era markers with distinct visual styles
- Event nodes that expand on hover/click
- Decade grouping with treatment summary cards
- Smooth scrolling and pinch-to-zoom support

**3. Event Detail Modal: `src/components/explore/EventDetailModal.tsx`**
- Full event description
- Historical images (where available)
- Source citations
- Related events
- "Interesting fact" callouts
- Share functionality

**4. Decade Treatment Card: `src/components/explore/DecadeTreatmentCard.tsx`**
- Visual representation of typical 1990s/2000s/etc treatment
- Icons for devices used (syringes, meters, pumps)
- Description of daily life during that era
- Before/after comparison slider where relevant

### Navigation Updates

Add to `contentItems` in `src/components/AppSidebar.tsx`:
```typescript
{ title: "Explore T1D History", url: "/explore", icon: History }
```

Add route to `src/App.tsx`:
```typescript
import Explore from "./pages/Explore";
// ...
<Route path="/explore" element={<Explore />} />
```

---

## PART 2: Your Experience Page - Animated Jar Submissions

### Database Schema

Create tables for the four submission categories:

```sql
-- Good and bad experiences (existing community_statements can be extended or new table)
CREATE TABLE experience_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'good', 'bad', 'daily_tasks', 'fears', 'embarrassing_lows'
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  is_anonymous BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT true,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE experience_submissions ENABLE ROW LEVEL SECURITY;

-- Public read for approved
CREATE POLICY "Public read approved submissions"
  ON experience_submissions FOR SELECT TO public 
  USING (is_approved = true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can submit"
  ON experience_submissions FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Users can update own submissions
CREATE POLICY "Users update own submissions"
  ON experience_submissions FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);
```

### Frontend Components

**1. Main Page: `src/pages/YourExperience.tsx`**
- Four distinct animated jar sections
- Submission forms for each category
- Scrollable gallery of past submissions

**2. Animated Jar Components:**

**Good/Bad Experiences Jar: `src/components/experience/GoodBadJars.tsx`**
- Two side-by-side glass jars with labels
- Blood drops animate falling into the appropriate jar on submission
- Jar "fill level" reflects actual submission count
- Drops inside jar float/bob with gentle animation
- Click a drop to read the full submission

**Daily Tasks Jar: `src/components/experience/DailyTasksJar.tsx`**
- Unique animation: Dripping IV bag or medicine bottle aesthetic
- Each submission appears as a "drip" falling
- Visual counter showing "X things T1Ds do that others don't"
- Examples: "Check blood sugar before driving", "Carry emergency glucose everywhere", "Calculate carbs for every meal"

**Fears & Worries Cloud: `src/components/experience/FearsCloud.tsx`**
- Animation: Swirling storm cloud aesthetic with lightning flickers
- Submissions appear as words/phrases floating in the cloud
- Dark purple/gray gradient with occasional flashes
- Therapeutic concept: "releasing fears into the storm"
- Clicking reveals full submission with community support options

**Embarrassing Lows Jar: `src/components/experience/EmbarrassingLowsJar.tsx`**
- Animation: Juice boxes, candy, glucose tablets tumbling into a fun container
- Playful, less serious animation style
- Colorful drops with confetti-like elements
- Stories can be upvoted/reacted to
- Most popular stories featured at top

**3. Submission Form Component: `src/components/experience/SubmissionForm.tsx`**
- Textarea with character limit
- Category selector (or embedded in specific jar section)
- Anonymous toggle
- Animated "drop into jar" button with satisfying animation feedback

**4. Entry Reader Modal: `src/components/experience/EntryModal.tsx`**
- Full text display
- Date submitted
- Upvote/react buttons
- Share option
- "This helped me" acknowledgment

### Animation Specifications

**Blood Drop Animation (CSS Keyframes)**
```css
@keyframes dropFall {
  0% { transform: translateY(-100px) scale(1); opacity: 0; }
  10% { opacity: 1; }
  70% { transform: translateY(200px) scale(1); }
  85% { transform: translateY(180px) scale(1.1, 0.9); }
  100% { transform: translateY(200px) scale(1); }
}

@keyframes jarBob {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-5px) rotate(1deg); }
}

@keyframes stormPulse {
  0%, 100% { opacity: 0.7; filter: brightness(1); }
  50% { opacity: 1; filter: brightness(1.2); }
}

@keyframes lightningFlash {
  0%, 90%, 100% { opacity: 0; }
  92%, 95% { opacity: 1; }
}
```

**Jar Fill Level Logic**
- Query submission count per category
- Calculate fill percentage (e.g., 100 submissions = 50% full, 500 = 100%)
- Animate liquid level gradient accordingly
- Add "liquid wobble" effect on new submissions

### Navigation Updates

Add to `contentItems` in `src/components/AppSidebar.tsx`:
```typescript
{ title: "Your Experience", url: "/your-experience", icon: Heart }
```

Add route to `src/App.tsx`:
```typescript
import YourExperience from "./pages/YourExperience";
// ...
<Route path="/your-experience" element={<ProtectedRoute><YourExperience /></ProtectedRoute>} />
```

---

## Implementation Order

| Step | Task | Files |
|------|------|-------|
| 1 | Create database migration for `t1d_history_events` | Migration SQL |
| 2 | Create database migration for `experience_submissions` | Migration SQL |
| 3 | Create seed function for T1D history events | `supabase/functions/seed-t1d-history/index.ts` |
| 4 | Update `supabase/config.toml` with new function | `supabase/config.toml` |
| 5 | Deploy and execute seed function | Edge function deployment |
| 6 | Create InteractiveTimeline component | `src/components/explore/InteractiveTimeline.tsx` |
| 7 | Create EventDetailModal component | `src/components/explore/EventDetailModal.tsx` |
| 8 | Create DecadeTreatmentCard component | `src/components/explore/DecadeTreatmentCard.tsx` |
| 9 | Create Explore page | `src/pages/Explore.tsx` |
| 10 | Create GoodBadJars component | `src/components/experience/GoodBadJars.tsx` |
| 11 | Create DailyTasksJar component | `src/components/experience/DailyTasksJar.tsx` |
| 12 | Create FearsCloud component | `src/components/experience/FearsCloud.tsx` |
| 13 | Create EmbarrassingLowsJar component | `src/components/experience/EmbarrassingLowsJar.tsx` |
| 14 | Create SubmissionForm component | `src/components/experience/SubmissionForm.tsx` |
| 15 | Create EntryModal component | `src/components/experience/EntryModal.tsx` |
| 16 | Create YourExperience page | `src/pages/YourExperience.tsx` |
| 17 | Update AppSidebar with new navigation items | `src/components/AppSidebar.tsx` |
| 18 | Update App.tsx with new routes | `src/App.tsx` |
| 19 | Add custom animations to index.css | `src/index.css` |
| 20 | Seed initial experience submissions | `supabase/functions/seed-experience-submissions/index.ts` |

---

## Technical Details

### Explore Page Hooks
- `useT1DHistory()` - Fetches and filters timeline events
- `useTimelineZoom()` - Manages zoom level state and calculations

### Your Experience Hooks  
- `useExperienceSubmissions(category)` - Fetches submissions by category
- `useSubmitExperience()` - Handles form submission with animation trigger

### Image Strategy for Timeline
- Use placeholder images initially with descriptive alt text
- Source public domain historical images (Wikimedia Commons, NIH archives)
- Store image URLs in database, fallback to illustrated placeholders

### Accessibility Considerations
- All animations respect `prefers-reduced-motion`
- Timeline navigable via keyboard (arrow keys)
- Screen reader descriptions for visual elements
- Jar submissions readable in list format alternative

---

## Sample Historical Events Data

```typescript
const sampleEvents = [
  {
    year: 1552,
    era: 'ancient',
    title: 'Ebers Papyrus Documents Diabetes',
    short_description: 'First known written documentation of diabetes symptoms',
    detailed_description: 'The Ebers Papyrus, an ancient Egyptian medical document dating to around 1550 BCE but likely copied from earlier texts, contains the first known description of a condition matching diabetes. It describes a "medicine to drive away the passing of too much urine" - recognizing polyuria as a key symptom.',
    category: 'discovery',
    interesting_facts: [
      'The Ebers Papyrus contains over 700 magical formulas and remedies',
      'The recommended "cure" included a mixture of bones, wheat, grain, grit, green lead, and earth'
    ],
    sources: ['https://www.diabetes.org/about-diabetes/history']
  },
  {
    year: 1921,
    era: 'insulin-discovery',
    title: 'Banting & Best Isolate Insulin',
    short_description: 'The discovery that would save millions of lives',
    detailed_description: 'In the summer of 1921, Frederick Banting and Charles Best, working in J.J.R. Macleod\'s lab at the University of Toronto with biochemist James Collip, successfully isolated insulin from dog pancreas...',
    category: 'landmark',
    decade: '1920s',
    decade_summary: 'Before 1921, a T1D diagnosis was a death sentence within months. The only "treatment" was starvation diets limiting patients to 400 calories per day to minimize symptoms.',
    interesting_facts: [
      'Banting sold his insulin patent to the University of Toronto for $1, believing it should be available to all',
      'Early insulin was so impure that patients often had severe allergic reactions'
    ]
  },
  {
    year: 1995,
    era: 'technology',
    title: 'The 1990s Diabetes Experience',
    decade: '1990s',
    decade_summary: 'Large meters the size of a brick, test strips that cost a fortune, 60+ second readings, NPH and Regular insulin with rigid meal schedules, finger prickers that felt like staplers, and logbooks that were never quite up to date.',
    category: 'treatment',
    interesting_facts: [
      'The Glucometer Elite was considered "compact" at 4 inches long',
      'Patients typically tested 2-4 times daily due to strip costs',
      'Insulin pens existed but pumps were rare and bulky'
    ]
  }
];
```

---

## Files Created/Modified Summary

### New Files
- `src/pages/Explore.tsx`
- `src/pages/YourExperience.tsx`
- `src/components/explore/InteractiveTimeline.tsx`
- `src/components/explore/EventDetailModal.tsx`
- `src/components/explore/DecadeTreatmentCard.tsx`
- `src/components/experience/GoodBadJars.tsx`
- `src/components/experience/DailyTasksJar.tsx`
- `src/components/experience/FearsCloud.tsx`
- `src/components/experience/EmbarrassingLowsJar.tsx`
- `src/components/experience/SubmissionForm.tsx`
- `src/components/experience/EntryModal.tsx`
- `supabase/functions/seed-t1d-history/index.ts`
- `supabase/functions/seed-experience-submissions/index.ts`

### Modified Files
- `src/App.tsx` (add routes)
- `src/components/AppSidebar.tsx` (add navigation items)
- `src/index.css` (add new animations)
- `supabase/config.toml` (add new functions)
- Database migrations (2 new tables)
