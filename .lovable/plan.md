

# Find a Diabetic Near Me

## Overview
Create a new page at `/find-diabetics` that helps T1D users connect with other Type 1 diabetics nearby. This combines two approaches:

1. **Opt-in User Discovery**: Users of this app can choose to make themselves discoverable by setting a general location (city/state). Other users can then browse nearby diabetics and request to connect.
2. **External Community Directory**: Curated, real public resources -- local JDRF chapters, ADA offices, Beyond Type 1 meetups, Reddit community hubs, and diabetes camp alumni networks -- with direct working links so users can find active T1D communities near them.

This avoids any privacy issues since internal matching is strictly opt-in, and external data only links to public organizations and community hubs.

## Privacy-First Design
- Users must explicitly opt in to be discoverable (default is hidden)
- Only city/state and display name are shown -- no email, no real name unless they choose
- Users can set a "looking for" preference (e.g., "workout buddy", "parent of T1D child", "pump user")
- One-click opt-out at any time

## Page Sections

### 1. Hero Section
- Title: "Find a Diabetic Near Me"
- Subtitle explaining the dual approach: connect with app users + find local T1D communities
- Location input (city, state, or ZIP)

### 2. Nearby App Users (Opt-in)
- Grid of user cards showing: avatar, display name, city/state, diagnosis duration, device setup, "looking for" tags
- Filter by: distance/state, interests, device type
- "Request to Connect" button (sends in-app notification)
- Banner prompting logged-in users to opt in if they haven't

### 3. Local T1D Communities & Organizations
- Seeded directory of real organizations with real links:
  - **JDRF Chapters** (jdrf.org/chapter) -- local walks, meetups, mentoring
  - **ADA Local Offices** (diabetes.org/community) -- support groups
  - **Beyond Type 1** (beyondtype1.org) -- online + in-person community
  - **College Diabetes Network** (collegediabetesnetwork.org) -- campus chapters
  - **Diabetes camps** (diabetescamps.org) -- alumni networks
  - **TypeOneNation Summits** -- annual JDRF events by city
- Each entry: name, type, state/region, description, direct URL, category

### 4. Reddit & Online Communities by Region
- Curated list of active Reddit communities with real search links:
  - r/diabetes_t1d, r/diabetes, r/Type1Diabetes
  - Regional search links (e.g., reddit.com/r/diabetes_t1d/search?q=meetup+[state])
  - Discord servers, Facebook groups (linked by name)
- "Find local posts" feature that generates Reddit search URLs for the user's entered location

### 5. Tips for Meeting Other Diabetics
- Practical advice cards: diabetes walks, endo waiting rooms, CGM spotting, online-to-IRL tips
- Safety tips for meeting people from the internet

## Technical Implementation

### Database

**New table: `diabetic_profiles`**
- `id` (uuid, PK)
- `user_id` (uuid, unique, references profiles)
- `display_name` (text)
- `city` (text)
- `state` (text)
- `zip_code` (text, nullable)
- `latitude` (float, nullable, for distance calc)
- `longitude` (float, nullable)
- `diagnosis_year` (int, nullable)
- `device_setup` (text, nullable -- e.g., "Dexcom G7 + Omnipod 5")
- `looking_for` (text[], nullable -- e.g., ["workout buddy", "parent support"])
- `bio_snippet` (text, nullable, max 200 chars)
- `is_visible` (boolean, default true)
- `created_at`, `updated_at` (timestamptz)

RLS: Users can read all visible profiles. Users can only insert/update/delete their own row.

**New table: `t1d_community_directory`**
- `id` (uuid, PK)
- `name` (text)
- `organization_type` (text -- "jdrf_chapter", "ada_office", "campus_chapter", "camp", "online_community", "support_group")
- `description` (text)
- `city` (text, nullable)
- `state` (text, nullable)
- `region` (text, nullable)
- `url` (text)
- `is_national` (boolean)
- `created_at` (timestamptz)

RLS: Public read access.

**New table: `connection_requests`**
- `id` (uuid, PK)
- `from_user_id` (uuid)
- `to_user_id` (uuid)
- `status` (text -- "pending", "accepted", "declined")
- `message` (text, nullable)
- `created_at` (timestamptz)

RLS: Users can read/create their own requests and read requests sent to them.

### Edge Function
**`seed-diabetic-directory`**: Seeds `t1d_community_directory` with 40-50 real organizations:
- 15+ JDRF chapters (with real jdrf.org URLs)
- 10+ ADA local offices
- 5+ College Diabetes Network chapters
- 5+ diabetes camps
- 10+ online communities (Reddit, Discord, Facebook groups with real links)

### New Files
- `src/pages/FindDiabeticNearMe.tsx` -- Main page with all sections
- `src/hooks/useDiabeticProfiles.ts` -- Hook for fetching/managing opt-in profiles and connection requests
- `src/hooks/useCommunityDirectory.ts` -- Hook for fetching the organization directory
- `src/components/find-diabetics/UserProfileCard.tsx` -- Card component for displaying a discoverable user
- `src/components/find-diabetics/OptInBanner.tsx` -- Prompt for users to make themselves discoverable
- `src/components/find-diabetics/CommunityDirectoryCard.tsx` -- Card for external organizations
- `src/components/find-diabetics/ConnectionRequestModal.tsx` -- Modal for sending a connect request
- `supabase/functions/seed-diabetic-directory/index.ts` -- Seeder for real organizations

### Modified Files
- `src/App.tsx` -- Add route `/find-diabetics` (protected)
- `src/components/AppSidebar.tsx` -- Add "Find a Diabetic" link in the Community section

### Patterns
- Follows existing Layout + BackButton + Card patterns
- Community directory cards match the Events/Organizations page style
- Opt-in profile cards follow the Warrior Spotlight card style
- Location filtering follows the Events Near Me pattern (state dropdown + search)
