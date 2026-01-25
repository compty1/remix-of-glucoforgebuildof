
# Combined Plan: Logo Redesign + Content Seeding

## Overview
This plan accomplishes two main objectives:
1. Create a new "GlycoForge" logo inspired by the reference image and replace all existing logo instances
2. Deploy and execute the three seeding edge functions to populate content for Diabeto 18+, Articles, and Bounties pages

---

## PART 1: Logo Redesign and Replacement

### Current State Analysis
The reference image shows:
- A purple/magenta blood droplet icon with gradient
- "GlycoForge" text in a clean sans-serif font
- Dark purple background in the header
- Icon on left, text on right layout

### Assets to Create

| Asset | File Path | Purpose |
|-------|-----------|---------|
| Full Logo (PNG) | `src/assets/glycoforge-logo.png` | Hero sections, landing pages, auth forms |
| Icon Only (PNG) | `src/assets/glycoforge-icon.png` | Sidebar collapsed state, favicon |

Both assets will have transparent backgrounds for use on light and dark surfaces.

### Files to Update

| File | Current Reference | New Reference |
|------|-------------------|---------------|
| `src/components/AppSidebar.tsx` | `glucoforge-logo.svg`, `glucoforge-icon.svg` | `glycoforge-logo.png`, `glycoforge-icon.png` |
| `src/pages/Auth.tsx` | `glucoforge-logo.svg` | `glycoforge-logo.png` |
| `src/pages/ResetPassword.tsx` | `glucoforge-logo.svg` | `glycoforge-logo.png` |
| `src/pages/Index.tsx` | `glucoforge-logo-new.png` | `glycoforge-logo.png` |
| `src/pages/admin/AdminSettings.tsx` | Path string to old logo | Updated path string |
| `index.html` | `glucoforge-icon.svg` in favicon link | `glycoforge-icon.png` |
| `index.html` | Title "GlucoForge" | Title "GlycoForge" |

### Implementation Approach
Since AI image generation produces variable results, I will:
1. Create clean SVG assets that match the reference image styling (purple droplet gradient + text)
2. Convert to PNG format with transparent backgrounds
3. Update all import statements and references

---

## PART 2: Content Seeding Execution

### Current Database State
All three content tables are currently empty:
- `adult_content_posts`: 0 rows
- `articles`: 0 rows  
- `bounties`: 0 rows

### Edge Functions Status
The seeding edge functions are already created and configured:
- `supabase/functions/seed-adult-content-posts/index.ts` - 40 real community posts
- `supabase/functions/seed-articles/index.ts` - 20+ comprehensive articles
- `supabase/functions/seed-bounties/index.ts` - 23 community bounties

### Deployment and Execution Steps

**Step 1: Deploy Edge Functions**
Deploy all three seeding functions to make them callable.

**Step 2: Execute Seed Functions**
Call each function to populate the database:

| Function | Expected Content | Categories |
|----------|------------------|------------|
| `seed-adult-content-posts` | 40+ posts | Alcohol (15), Intimacy (15), Drug Effects (10) |
| `seed-articles` | 20+ articles | 18+ Content (5), Research (5), Lifestyle (5), Technology (5) |
| `seed-bounties` | 23 bounties | Research (5), Content (5), Testing (4), Data (4), Translation (2), Community (3) |

**Step 3: Verify Content**
Query the database to confirm content was inserted successfully.

---

## Implementation Order

| Step | Task | Files Changed |
|------|------|---------------|
| 1 | Create new logo SVG assets | `src/assets/glycoforge-logo.png`, `src/assets/glycoforge-icon.png` |
| 2 | Update AppSidebar.tsx imports | `src/components/AppSidebar.tsx` |
| 3 | Update Auth.tsx imports | `src/pages/Auth.tsx` |
| 4 | Update ResetPassword.tsx imports | `src/pages/ResetPassword.tsx` |
| 5 | Update Index.tsx imports | `src/pages/Index.tsx` |
| 6 | Update AdminSettings.tsx path | `src/pages/admin/AdminSettings.tsx` |
| 7 | Update index.html favicon and title | `index.html` |
| 8 | Deploy seeding edge functions | Edge function deployment |
| 9 | Execute seed-adult-content-posts | Database insert |
| 10 | Execute seed-articles | Database insert |
| 11 | Execute seed-bounties | Database insert |
| 12 | Verify all content populated | Database verification |

---

## Content Summary

### Diabeto 18+ Posts (40 total)
Real community posts sourced from r/diabetes_t1d, r/diabetes, TuDiabetes:

**Alcohol (15 posts)**
- Beer management strategies
- Wine vs liquor CGM comparisons
- Delayed low warnings and prevention
- Party survival guides
- Bartender experiences

**Intimacy (15 posts)**
- CGM placement for couples
- Pump management during intimacy
- Partner communication strategies
- Low blood sugar during physical activity

**Drug Effects (10 posts)**
- Cannabis and blood sugar patterns
- Caffeine sensitivity
- Energy drink effects
- Medication interactions

### Articles (20+ total)
Comprehensive, research-backed articles:

**18+ Content (5 articles)**
- Complete Guide to Alcohol and T1D
- Intimacy and Diabetes Technology
- Cannabis and Blood Sugar Research
- Managing Diabetes at Parties
- Science of Delayed Alcohol Lows

**Research & Science (5 articles)**
- Latest Cure Research Update
- CGM Technology Evolution
- Immunotherapy Clinical Trials
- Microbiome Connection
- Beta Cell Regeneration

**Lifestyle (5 articles)**
- Exercise and T1D Guide
- Travel Tips
- Mental Health and Burnout
- Pregnancy Planning
- Starting College with T1D

**Technology (5 articles)**
- DIY Closed Loop Systems
- Choosing Your First Pump
- CGM Accuracy Comparison
- Smart Insulin Pens
- Future of Artificial Pancreas

### Bounties (23 total)
Community engagement tasks with rewards:

**Research Contribution ($190 total)**
- Share CGM Data - $25
- Insulin Timing Survey - $15
- Pump Site Rotation Log - $40
- Time-in-Range Data - $50
- Exercise Impact Study - $60

**Content Creation ($175 total)**
- Diagnosis Story - $20
- CGM Tutorial Video - $75
- Meal Prep Guide - $30
- Travel Kit Setup - $15
- Device Comparison Review - $35

**Testing & Feedback ($125 total)**
- New Feature Testing - $35
- App Reviews - $25
- Medication Hub Feedback - $20
- Accessibility Audit - $45

**Data Entry ($115 total)**
- Device Spec Verification - $30
- Insulin Pricing Data - $25
- Post Categorization - $40
- State Organizations - $20

**Translation ($150 total)**
- Spanish Resource Guide - $100
- Portuguese Tutorial - $50

**Community ($145 total)**
- Host Virtual Meetup - $40
- Forum Moderation - $80
- Answer Newcomer Questions - $25

---

## Technical Notes

### Logo Design Specifications
- Primary gradient: Purple (#3D1A66) to Magenta (#FF4541)
- Blood droplet icon: Stylized, modern medical aesthetic
- Typography: Clean sans-serif matching brand fonts (Inter/system font)
- Transparent background for versatility
- Full logo dimensions: ~400x100px (horizontal layout)
- Icon dimensions: 512x512px (square for favicon/sidebar)

### Safety Considerations
- No existing data will be modified or deleted
- All content additions use INSERT/UPSERT operations
- Existing age verification gate for Diabeto 18+ remains intact
- Medical disclaimers included in all health-related articles
- Source attribution maintained for community posts
