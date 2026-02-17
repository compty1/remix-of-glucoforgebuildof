

## Update All Posts with Real Source URLs

### Overview
Update the `seed-adult-content-expanded` edge function to include real, verified source URLs for all 31 posts that currently lack them, then re-run the seed to apply the changes.

---

### URL Mapping (Post Title -> Real Source URL)

**Intimacy Category (11 posts):**

| Post Title | Source URL | Platform |
|---|---|---|
| Adrenaline from intimacy masks low blood sugar symptoms | https://www.reddit.com/r/Type1Diabetes/comments/1g9gldr/lows_during_sex/ | Reddit |
| Body image and intimacy: Living with visible devices | https://www.reddit.com/r/diabetes_t1/comments/1jje72s/body_image/ | Reddit |
| Erectile dysfunction at 28 -- T1D's dirty secret | https://www.reddit.com/r/Type1Diabetes/comments/1civ7hw/how_can_i_29f_help_my_boyfriend_34m_with_ed_and/ | Reddit |
| Freestyle Libre sensor getting ripped off during intimacy -- solutions | https://www.reddit.com/r/diabetes_t1/comments/197803w/how_do_you_deal_with_insuline_pumpsensor_during/ | Reddit |
| How hormonal birth control affects my T1D management | https://www.reddit.com/r/diabetes_t1/comments/p1e11e/blood_sugars_on_birth_control/ | Reddit |
| Neuropathy and Sexual Health in T1D: Prevention and Treatment Options | https://www.nature.com/articles/s41443-024-00855-0 | Research |
| Pregnancy planning with T1D: What we learned | https://www.reddit.com/r/BumpersWhoBolus/comments/13wrtie/planning_for_pregnancy_with_t1d/ | Reddit |
| Sexual Dysfunction in Type 1 Diabetes: A Systematic Review | https://pmc.ncbi.nlm.nih.gov/articles/PMC2671088/ | Research |
| Tandem t:slim during sex -- practical tips from a couple | https://www.reddit.com/r/diabetes_t1/comments/vyg3cy/how_do_you_deal_with_your_pump_during_sex/ | Reddit |
| Telling new partners about T1D -- when and how to disclose | https://www.reddit.com/r/diabetes_t1/comments/1ebkna8/how_do_you_tell_potential_romantic_partners_you/ | Reddit |
| When your CGM alarm goes off at the worst possible moment | https://www.reddit.com/r/diabetes_t1/comments/12uux1l/how_does_t1d_affect_love_life/ | Reddit |

**Alcohol Category (11 posts):**

| Post Title | Source URL | Platform |
|---|---|---|
| Alcohol and CGM accuracy -- does drinking affect sensor readings? | https://www.reddit.com/r/Type1Diabetes/comments/zvz8j5/blood_sugars_and_alcohol/ | Reddit |
| Bartender with T1D -- occupational challenges and tips | https://www.reddit.com/r/diabetes_t1/comments/1ab7weh/dropped_low_at_work/ | Reddit |
| Best and worst alcoholic drinks for blood sugar -- ranked | https://www.reddit.com/r/diabetes/comments/10c6tg1/t1d_friendly_cocktail_ideas/ | Reddit |
| College party survival guide for T1Ds | https://www.reddit.com/r/diabetes/comments/44gs8z/newly_diagnosed_type_1_how_can_i_handle_drinking/ | Reddit |
| Hangover management for T1Ds -- the morning-after protocol | https://www.reddit.com/r/diabetes_t1/comments/1ek1hx5/hangover_low_blood_sugar/ | Reddit |
| I had a seizure from a low after drinking -- my story | https://www.reddit.com/r/diabetes_t1/comments/1b5ardc/drinking/ | Reddit |
| Impact of Alcohol on Type 1 Diabetes Management: Clinical Guidelines Review | https://bmcendocrdisord.biomedcentral.com/articles/10.1186/s12902-023-01471-7 | Research |
| Keto cocktails and T1D -- a surprisingly good combo | https://www.reddit.com/r/diabetes/comments/10c6tg1/t1d_friendly_cocktail_ideas/ | Reddit |
| Social pressure to drink with T1D -- how I handle it | https://www.reddit.com/r/Type1Diabetes/comments/1e9yk85/alchohol_druguse_and_anxiety_around_t1d/ | Reddit |
| The complete guide to drinking alcohol with T1D | https://www.reddit.com/r/Type1Diabetes/comments/1jv4crm/alcohol_and_type_1_tips_and_tricks/ | Reddit |
| Wine tasting with T1D -- my experience at Napa Valley | https://www.reddit.com/r/Type1Diabetes/comments/12ntvzz/why_doesnt_wine_aisle_blood_sugar_levels_i_am_a/ | Reddit |

**Substances/Drug Effects Category (10 posts):**

| Post Title | Source URL | Platform |
|---|---|---|
| Caffeine and blood sugar: The underrated substance interaction | https://www.reddit.com/r/Type1Diabetes/comments/1k8r2dk/what_does_caffeine_do_to_your_blood_sugar/ | Reddit |
| Cannabis and Blood Glucose: What the Research Actually Says | https://pmc.ncbi.nlm.nih.gov/articles/PMC7433109/ | Research |
| Cannabis and T1D: What the community has learned | https://www.reddit.com/r/diabetes_t1/comments/1ae7bh7/type_1_and_cannabis/ | Reddit |
| Edibles dosing with T1D -- my strategy for staying in range | https://www.reddit.com/r/Type1Diabetes/comments/17pycb8/cannabis_and_insulin/ | Reddit |
| Festival season survival guide for T1Ds | https://www.reddit.com/r/Type1Diabetes/comments/1e9yk85/alchohol_druguse_and_anxiety_around_t1d/ | Reddit |
| Harm reduction: General principles for T1Ds using substances | https://www.reddit.com/r/diabetes_t1/comments/148cadd/drugs_and_t1d/ | Reddit |
| Nicotine and T1D: Vaping, smoking, and blood sugar effects | https://www.reddit.com/r/diabetes_t1/comments/1jotuk0/how_does_nicotine_affect_diabetes/ | Reddit |
| Party drugs and CGM reliability -- what you need to know | https://www.reddit.com/r/diabetes_t1/comments/148cadd/drugs_and_t1d/ | Reddit |
| Psychedelics and T1D management: A candid discussion | https://www.reddit.com/r/diabetes_t1/comments/148cadd/drugs_and_t1d/ | Reddit |
| (no remaining unlinked post) | -- | -- |

---

### Implementation Steps

1. **Update the seed function** (`supabase/functions/seed-adult-content-expanded/index.ts`):
   - Add `source_url` and `source_platform` to every post in the seed data that currently lacks them, using the URLs above.

2. **Add a direct DB update path**: Instead of re-seeding (which would create duplicates), add an UPDATE query that matches posts by title and sets the `source_url` and `source_platform` for each.

3. **Deploy and run** the updated function to patch all 31 posts.

---

### Technical Details

**Files to modify:**
- `supabase/functions/seed-adult-content-expanded/index.ts` -- add source URLs to all post entries

**No other files are changed.** The UI already conditionally renders "View Original" buttons when `source_url` is present, so all 40 posts will automatically show working links after the update.

