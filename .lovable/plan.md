

# Extended Build Audit: 400 Additional Hardcoded/Fake Data Issues (Items 801-1200)

This extends the existing 800-item audit with 400 newly discovered instances of hardcoded, fabricated, placeholder, or disconnected data throughout the codebase. Nothing from the existing plan (items 1-800) has been removed.

---

## Category 13: Hardcoded Dashboard and Widget Data (Items 801-830)

### 13.1 Dashboard Widgets Fake Values (10)
801. DashboardWidgets.tsx:89-97 -- When not logged in, glucose widget shows hardcoded demo data: `currentBG: 127`, `timeInRange: 78`, `estA1C: 6.8`, `cv: 24` -- labeled `isDemo: true` but no visual indicator to user
802. DashboardWidgets.tsx:113 -- `sensorDaysLeft: 3` hardcoded for device-status widget regardless of real sensor data
803. DashboardWidgets.tsx:114 -- `batteryLevel: 85` hardcoded for device-status widget -- never reads actual device
804. DashboardWidgets.tsx:115 -- `lastReading: '2 min ago'` hardcoded string -- never computed from real timestamp
805. DashboardWidgets.tsx:118-123 -- Fallback device widget for non-logged-in users sets `cgmConnected: true` with all fake sensor data
806. DashboardWidgets.tsx:145 -- `activeMembers: 2847 + (count || 0)` -- base number `2847` is fabricated to inflate community member count
807. DashboardWidgets.tsx:191 -- Health metrics fallback values `timeInRange: 78`, `gmi: 6.8`, `cv: 24` used when no real data exists
808. DashboardWidgets.tsx:200-205 -- Non-logged-in health metrics widget likely shows hardcoded fallback values
809. No visual "demo data" badge/indicator shown to user when viewing fabricated widget values
810. Widget data never refreshes in real-time -- all values are snapshot-on-load

### 13.2 Admin Dashboard Hardcoded Charts (10)
811. AdminDashboard.tsx:21-28 -- `userActivityData` array is entirely fabricated (Jan: 120 users, Feb: 150, etc.) -- never queries actual user activity
812. AdminDashboard.tsx:30-36 -- `platformUsageData` pie chart data hardcoded (Dashboard: 35%, Data Upload: 25%, etc.) -- no analytics backing
813. AdminAnalytics.tsx:58-64 -- `featureUsageData` hardcoded identically to AdminDashboard (Dashboard: 35, Data Upload: 25, etc.) -- duplicated fake data
814. AdminAnalytics.tsx:176 -- Card title explicitly says "(Sample)" -- acknowledging the data is fake
815. No actual analytics/tracking system exists to populate real usage data
816. Admin dashboard user activity chart shows linear growth (120 to 420) that is clearly fabricated
817. No page view tracking, session tracking, or feature usage instrumentation exists in the app
818. Admin export function (AdminAnalytics.tsx:66-78) exports the fake stats as if they are real data
819. No way for admins to see actual daily/weekly/monthly active user counts
820. Admin dashboard "Active Users" stat derived from DB count but activity charts are still hardcoded

### 13.3 QA Checklist False Claims (10)
821. QAChecklist.tsx:42 -- Claims "Upload progress displays" status: 'pass' but progress bar is hardcoded at 65%
822. QAChecklist.tsx:43 -- Claims "File processing simulates correctly" status: 'pass' -- acknowledges it's simulation, not real processing
823. QAChecklist.tsx:49 -- Claims "Scenario lab simulations work" status: 'pass' but simulations use Math.random()
824. QAChecklist.tsx:51 -- Claims "Simulation history saves" status: 'pass' -- needs verification
825. QAChecklist.tsx:306-310 -- States "GlucoForge is now a fully functional, production-ready platform" -- overstates readiness
826. QAChecklist.tsx publicly accessible at `/qa-checklist` -- exposes internal QA status to all users
827. QA items all have 'pass' status -- no failing items recorded despite known issues
828. No automated test runner backs the QA checklist -- all statuses are manually hardcoded
829. QA checklist doesn't cover any of the 800+ issues identified in this audit
830. QA checklist has no mechanism to re-run or verify checks automatically

---

## Category 14: Hardcoded Public-Facing Statistics (Items 831-870)

### 14.1 Homepage and Landing Stats (15)
831. Index.tsx:153 -- "8.4M" people with T1D worldwide -- static number, not sourced or dated
832. Index.tsx:159 -- "24/7" stat presented as data point but is just a label
833. Index.tsx:165 -- "100+" daily micro-decisions -- hardcoded, uncited statistic
834. Index.tsx:171 -- "5+" apps stat -- hardcoded
835. Index.tsx:436 -- "50,000+ posts in verified T1D communities" -- fabricated claim, not sourced from database count
836. Donate.tsx:77 -- "10,000+" Active Participants -- hardcoded, no DB query for actual user count
837. Donate.tsx:84 -- "25" Active Trials -- hardcoded, not queried from clinical_trials table
838. Donate.tsx:91 -- "$500K" Research Funded -- hardcoded, not sourced from donations table
839. Donate.tsx:98 -- "501(c)(3)" presented as fact but described as pending elsewhere
840. DiabetesBurnout.tsx:258 -- "36-45%" burnout statistic hardcoded (though sourced from research, should cite)
841. DiabetesBurnout.tsx:262 -- "100+" health decisions stat repeated from homepage
842. CureProgress.tsx:522 -- "$2.8B+" Annual Research Funding -- hardcoded
843. CureProgress.tsx:526 -- "150+" Research Institutions -- hardcoded
844. CureProgress.tsx:530 -- "50K+" Researchers Worldwide -- hardcoded
845. CureProgress.tsx:150 -- "Live data from global clinical trial registries" claim with animated pulse -- partially true (uses clinicaltrials.gov) but data may be stale

### 14.2 SupportGlucoForge Stats and Claims (10)
846. SupportGlucoForge.tsx:47 -- "50+" Pages & Features -- hardcoded
847. SupportGlucoForge.tsx:48 -- "27+" Development Projects -- hardcoded, should count from `developmentProjects` array
848. SupportGlucoForge.tsx:49 -- "10+" Research Sources -- hardcoded
849. SupportGlucoForge.tsx:50 -- "30+" Devices Tracked -- hardcoded, should query devices table count
850. SupportGlucoForge.tsx:51 -- "100+" Medications Profiled -- hardcoded, should query medications table count
851. SupportGlucoForge.tsx:63 -- "50,000+ peer-reviewed fixes" -- fabricated claim in feature description
852. SupportGlucoForge.tsx:172-177 -- Funding allocation percentages (45%, 25%, 15%, 10%, 5%) hardcoded -- no actual budget tracking
853. SupportGlucoForge.tsx:182-187 -- Donor tiers and benefits hardcoded -- no system implements these tiers or tracks donor levels
854. SupportGlucoForge.tsx:200-215 -- Three testimonials ("Sarah M.", "James K.", "Alex T.") are fabricated
855. SupportGlucoForge.tsx:126-168 -- Development roadmap phases hardcoded with dates and statuses -- not connected to any project tracking system

### 14.3 DonationImpactVisualization Claims (5)
856. DonationImpactVisualization.tsx:64 -- "Enable 1,000+ glucose analyses" -- fabricated impact claim
857. DonationImpactVisualization.tsx -- All impact tier descriptions ("$10 funds...", "$25 enables...") are fabricated
858. DonationImpactVisualization.tsx -- No actual mapping between donation amounts and platform costs exists
859. No donation tracking or impact reporting system exists to back these claims
860. No quarterly transparency reports mentioned in FAQs are actually generated

### 14.4 DonationsInfo Page Hardcoded Data (10)
861. DonationsInfo.tsx:38-159 -- Entire `organizationsData` array (6 organizations with funding amounts) is hardcoded -- claimed "based on public 990 forms" but not fetched from any API
862. DonationsInfo.tsx:44 -- JDRF `totalDonations: 198000000` -- hardcoded estimate
863. DonationsInfo.tsx:64 -- ADA `totalDonations: 145000000` -- hardcoded estimate
864. DonationsInfo.tsx:84 -- DRI Foundation `totalDonations: 32000000` -- hardcoded estimate
865. DonationsInfo.tsx:104 -- Joslin `totalDonations: 58000000` -- hardcoded estimate
866. DonationsInfo.tsx:124 -- Helmsley Trust `totalDonations: 75000000` -- hardcoded estimate
867. DonationsInfo.tsx:144 -- diaTribe `totalDonations: 8500000` -- hardcoded estimate
868. DonationsInfo.tsx:161-168 -- `yearlyTrendsData` for organization donations over time is hardcoded
869. DonationsInfo.tsx:170-175 -- `sectorBreakdown` pie chart data hardcoded ($189.5M individual, $126.5M corporate, etc.)
870. These numbers may be inaccurate or outdated -- no data source verification or last-updated timestamp shown

---

## Category 15: Hardcoded Scientific and Research Data (Items 871-920)

### 15.1 Public Glucose Data Tab Hardcoded Arrays (15)
871. SeasonalPatternsTab.tsx:9-22 -- `MONTHLY_DATA` array (12 months of glucose stats) entirely hardcoded -- not computed from actual `public_glucose_data` table
872. SeasonalPatternsTab.tsx:24-29 -- `SEASONAL_SUMMARY` array hardcoded (Winter avg 158, Spring 145, Summer 137, Autumn 146)
873. SeasonalPatternsTab.tsx:31-37 -- `RADAR_DATA` array hardcoded (5 metrics across 4 seasons)
874. PopulationTrendsTab.tsx:10-18 -- `YEARLY_TRENDS` array (7 years of TIR data 2018-2024) entirely hardcoded
875. PopulationTrendsTab.tsx:21-29 -- `STUDY_COMPARISON` array (7 studies) hardcoded with one marked `isDynamic: true`
876. PopulationTrendsTab.tsx:32-38 -- `REGIONAL_DATA` array (5 regions with TIR, CGM use, AID use) hardcoded -- claims sample sizes like `n: 12000`
877. PopulationTrendsTab.tsx:41-49 -- `TECH_ADOPTION` array (7 years of technology adoption %) hardcoded
878. PublicGlucoseData.tsx:401 -- Fallback text claims "31,000+ readings from 750+ anonymized users" -- hardcoded fallback when actual count unavailable
879. SeasonalPatternsTab presents hardcoded data as if computed from real CGM uploads
880. PopulationTrendsTab claims "This Dataset" row with dynamic values but all other study rows are static
881. No disclaimers or "illustrative data" labels on any of these hardcoded charts
882. Regional data claims (North America n=12000, Europe n=9500) are fabricated
883. Technology adoption percentages (CGM: 35% in 2018 to 78% in 2024) are hardcoded estimates
884. No data source citations for study comparison numbers (T1D Exchange, UK Biobank, TEDDY, etc.)
885. These hardcoded arrays should be replaced with aggregations from the `public_glucose_data` table or clearly labeled as reference data

### 15.2 EmergenceOfDiabetes Research Data (10)
886. EmergenceOfDiabetes.tsx:85-260 -- Entire research studies array (~10 studies) hardcoded with DOIs, sample sizes, findings, and methodology
887. While DOIs and citations appear legitimate, the data is static and never refreshed
888. No mechanism to update findings when new research is published
889. PubMed IDs hardcoded but never used to fetch current citation counts or updated abstracts
890. Study sample sizes like "8,676 children" and "545 cases, 1,668 controls" are static text not verified against current publications
891. No last-verified date shown for any research citation
892. Methodology descriptions are static summaries that may become outdated
893. No link to fetch full paper or current abstract from PubMed API
894. "Myths Coming Soon" placeholder at line 963 -- content gap
895. No mechanism for researchers to submit corrections or updates to cited data

### 15.3 CureProgress Simulation Data (5)
896. CureProgress.tsx:163-178 -- `getSimulationData()` generates "projections" using a crude formula: `progressFactor = Math.min(1, (phase3Count * 5 + approvedCount * 10) / 100)` -- this is not a real predictive model
897. CureProgress.tsx:507-509 -- Claims "Projection based on current clinical trial trajectories and historical breakthrough patterns" -- misleading description of simple arithmetic
898. CureProgress.tsx:17-23 -- Hero animation shows phases with hardcoded progress percentages (Discovery: 100%, Phase 1: 100%, Phase 2: 75%, Phase 3: 40%, Cure: 0%)
899. Timeline milestones (Tzield approval, Vertex VX-880, etc.) are hardcoded and will become stale
900. No mechanism to update cure progress milestones when new breakthroughs occur

---

## Category 16: Hardcoded Content in Feature Pages (Items 921-980)

### 16.1 FindDiabeticNearMe Hardcoded Tips (5)
901. FindDiabeticNearMe.tsx:44-46 -- `TIPS` array with 3 tips ("Diabetes Walks", "Spot the CGM", "Diabetes Camps") hardcoded
902. No user-submitted tips or community-sourced content
903. Tip about "JDRF One Walk" and "ADA Step Out" events has no dates or location data
904. No integration with event APIs to show actual upcoming diabetes walks
905. No location-based content despite page name implying geographic features

### 16.2 SupportGlucoForge Testimonials and FAQs (5)
906. SupportGlucoForge.tsx:200-215 -- Three testimonials are fabricated ("Sarah M.", "James K.", "Alex T.") with made-up quotes
907. SupportGlucoForge.tsx:219-242 -- FAQ answers hardcoded including "quarterly transparency reports" that don't exist
908. SupportGlucoForge.tsx:222 -- Claims 501(c)(3) donations will be "tax-deductible retroactively" -- potential legal inaccuracy
909. No mechanism for actual users to submit testimonials
910. FAQ section not connected to any CMS or database -- can't be updated without code changes

### 16.3 FinancialTools Hardcoded Resources (5)
911. FinancialTools.tsx:155-163 -- Resource links array contains URLs pointing to "#" that trigger "Coming Soon" toast
912. FinancialTools.tsx:268-286 -- Template buttons trigger "Coming Soon" toast -- no actual template content
913. No actual appeal letter templates exist despite UI suggesting they do
914. No insurance plan data integration
915. Financial tools page is primarily a static information page with no interactive functionality

### 16.4 Fixes Page Dead Links (5)
916. Fixes.tsx:49 -- All fix items have `link: '#'` -- every fix links to a dead anchor
917. Fixes page fetches from `trending_device_issues` but assigns placeholder links
918. No actual fix detail pages or deep links to solutions
919. Fix difficulty ratings derived from a basic mapping function, not community-verified
920. No mechanism for users to submit or verify fix effectiveness

### 16.5 Development Projects Static Data (5)
921. `src/data/developmentProjects.ts` -- 27+ development projects hardcoded in a TypeScript file instead of database
922. Project progress percentages (10%, 15%, etc.) are hardcoded and never updated
923. Project tasks with statuses ('todo', 'in_progress', 'done') are static -- no real task tracking
924. Resource links in projects may be stale/broken -- no verification
925. Target completion dates hardcoded -- no connection to any project management system

### 16.6 Volunteer Roles Static Data (5)
926. `src/data/volunteerRoles.ts` -- All volunteer roles, technical roles, skills, and tasks hardcoded
927. No application/signup flow for volunteer roles despite listing open positions
928. Open projects listed in roles are static references -- not connected to actual project data
929. No way for users to express interest or apply for roles
930. No admin interface to manage or update volunteer role listings

### 16.7 Cure Report Content (5)
931. `src/data/cureReportContent.ts` -- Cure report content entirely hardcoded
932. `src/data/projectReportsContent.ts` -- Project report content entirely hardcoded
933. ProjectFullReport.tsx:119 -- "Report Coming Soon" placeholder for project reports
934. No mechanism to generate reports from live data
935. Report content becomes stale immediately after deployment

### 16.8 Achievement Definitions (5)
936. `src/data/achievementDefinitions.ts` -- All achievement criteria hardcoded in TypeScript
937. Achievement progress tracking may not accurately reflect user activity
938. No admin interface to create or modify achievements
939. Achievement thresholds not tuned to actual user behavior data
940. No A/B testing or adjustment mechanism for gamification elements

### 16.9 ScenarioLab Deep Dive (5)
941. ScenarioLab.tsx:77-143 -- `generateGlucoseCurve()` uses 8 scenario branches all driven by `Math.random()` and basic arithmetic
942. ScenarioLab.tsx:91 -- Meal scenario: `baseline - 6 + Math.random() * 5` -- purely random glucose after "recovery"
943. ScenarioLab.tsx:130 -- Illness scenario: `baseline + 20 + Math.random() * 20` -- random elevated glucose
944. ScenarioLab.tsx:138 -- Default case: `baseline + Math.random() * 10 - 5` -- baseline noise
945. ScenarioLab.tsx:142 -- Additional "natural variation" layer: `Math.random() * 8 - 4` added on top

### 16.10 DataUpload Deep Dive (15)
946. DataUpload.tsx:475 -- "Total Files: 12" hardcoded
947. DataUpload.tsx:479 -- "Data Points: 47,382" hardcoded
948. DataUpload.tsx:483 -- "Insights Found: 156" hardcoded
949. DataUpload.tsx:487 -- "Last Upload: 2 days ago" hardcoded
950. DataUpload.tsx:412 -- Progress bar `value={65}` hardcoded -- stuck at 65% forever
951. DataUpload.tsx:498-512 -- Four "Quick Actions" buttons with no onClick handlers (Connect CGM, Schedule Auto-Upload, Share with Doctor, Export Analysis)
952. DataUpload.tsx:165 -- `Date.now().toString()` for file IDs -- collision risk on simultaneous uploads
953. DataUpload.tsx:181-200 -- File content read entirely into memory as base64 -- will crash on large files
954. GlucoseUpload.tsx:41 -- `Math.random().toString(36).substr(2, 9)` for IDs -- weak generation
955. No file type validation beyond extension checking
956. No file size enforcement despite claiming 50MB limit
957. No upload progress WebSocket or polling -- progress bar is decorative
958. No upload cancellation support
959. No upload retry on failure
960. No upload history persistence -- refreshing page loses all upload state

---

## Category 17: Disconnected or Orphaned Features (Items 961-1020)

### 17.1 Notification System Disconnects (10)
961. Settings notification preferences save to localStorage (Settings.tsx:230) but `notification_preferences` DB table exists unused by Settings
962. NotificationCenter reads from DB notifications table -- completely separate system from Settings toggles
963. Push notification switch in Settings (line 499) is decorative -- no push notification infrastructure
964. Email digest frequency setting not connected to `send-weekly-digest` edge function
965. Notification categories in Settings don't map to actual notification types in the DB
966. No notification preferences migration from localStorage to database
967. "Community Activity" and "Research Updates" notification toggles have no backend triggers
968. In-app notification badge count disconnected from notification preferences
969. No notification for new community replies to user's posts
970. No notification for device review responses

### 17.2 Profile and Settings Disconnects (10)
971. Settings.tsx:333 -- T1D Diagnosis Date input field renders but value is never read from or written to database
972. Settings.tsx:339-351 -- Primary CGM selector renders with device options but selection not persisted
973. Settings.tsx:355-367 -- Insulin Delivery selector renders but selection not persisted
974. Settings.tsx:379 -- Research Participation switch renders but toggle not persisted
975. Profile save function (Settings.tsx:197-225) only persists `display_name` and `bio` -- ignores all other fields
976. Privacy toggle states (data sharing, analytics, public profile) lost on page refresh
977. Compact Mode toggle (Settings.tsx:659) has no state variable or handler
978. Animations toggle (Settings.tsx:669) has `defaultChecked` but no effect on any animations
979. No mechanism to upload profile avatar despite UI suggesting it
980. Theme selection not synced to user profile in database -- only in localStorage via next-themes

### 17.3 Email and Communication Disconnects (10)
981. `EmailDigestSignup` component (dashboard) and `WeeklyDigestSignup` component are two separate implementations
982. `EmailDigestSignup` uses UPSERT, `WeeklyDigestSignup` uses INSERT via `useEmailSubscription` -- inconsistent
983. `send-weekly-digest` edge function exists but has no cron trigger
984. No email sending service configured (no SendGrid, Postmark, etc. API key in secrets)
985. `send-trending-alerts` edge function exists but no trigger mechanism
986. `daily-briefing` edge function exists but no trigger mechanism
987. Newsletter delivery day "Sunday" mentioned in UI but not configurable
988. No email unsubscribe mechanism in actual emails (since no emails are sent)
989. No email template preview available to users
990. Contact form submissions go to database but no notification to admin

### 17.4 Data Pipeline Disconnects (10)
991. `update_trends()` DB function is a no-op (`NULL;` body) -- trends page has no data pipeline
992. `data_refresh_logs` table exists but no process writes to it
993. `backfill_audit` table exists but no process writes to it
994. `trend_analysis_metrics` table exists but no pipeline populates it
995. `population_insights` table exists but no pipeline populates it
996. `shifts` table purpose unclear -- may be entirely unused
997. `simulations` table -- no clear UI for viewing saved simulations beyond ScenarioLab
998. Seed functions are one-time-use but remain deployed and invokable
999. FDA data feed edge function may not have proper API credentials configured
1000. Medicare data feed edge function may not refresh on any schedule

### 17.5 Stripe Integration Disconnects (10)
1001. DonationModal.tsx:18 uses Stripe key `pk_test_51QSwq6...` hardcoded
1002. `.env` file has different Stripe key `pk_test_TYooMQauvdEDq54NiTphI7jx` -- two keys in conflict
1003. DonationModal minimum validation is $1 (line 35), but `create-donation` edge function has $5 minimum -- mismatch
1004. DonationModal has no maximum validation, but edge function caps at $100,000
1005. `stripe-shop-webhook` falls back to unverified event parsing when no webhook secret
1006. No STRIPE_WEBHOOK_SECRET configured in edge function secrets
1007. Donate.tsx recurring donation UI (monthly/quarterly/annual) -- but `create-donation` edge function doesn't support recurring billing
1008. No subscription management page for recurring donors
1009. No donation receipt/confirmation email sent post-payment
1010. Donor tier benefits (SupportGlucoForge.tsx:182-187) are listed but no system tracks or grants them

### 17.6 Feature Claims vs Reality (10)
1011. SupportGlucoForge.tsx:96 -- Claims "CGM Data Upload with AI analysis" -- analysis is algorithmic, not AI
1012. SupportGlucoForge.tsx:97 -- Claims "Clinical-grade PDF report generation" -- no clinical validation of reports
1013. SupportGlucoForge.tsx:63 -- Claims "50,000+ peer-reviewed fixes" -- peer review is just upvotes, number is fabricated
1014. SupportGlucoForge.tsx:98 -- Claims "Glucose heatmaps, AGP charts, pattern detection" -- pattern detection is rule-based
1015. SupportGlucoForge.tsx:95 -- Claims "Research Hub with AI-generated TLDR summaries" -- verify if AI actually generates these
1016. Index hero "Donate Now" at $25 fires without confirmation dialog
1017. SupportGlucoForge "quarterly transparency reports" mentioned in FAQ but none exist
1018. "Advisory board consideration" listed as donor benefit but no advisory board exists
1019. "Open Source Spirit" claimed but no public repository
1020. "Weekly updates" claimed but no changelog or release notes page exists

---

## Category 18: Hardcoded Content in Components (Items 1021-1080)

### 18.1 Entity and Brand Hardcoding (10)
1021. Device images use DuckDuckGo icon proxy (`icons.duckduckgo.com/ip3/`) -- may return low-quality favicons instead of product images
1022. Device manufacturer to domain mapping hardcoded in `seed-reliable-device-images` edge function
1023. Medication images similarly proxied through third-party icon services
1024. No fallback mechanism when DuckDuckGo icon API is down or returns broken images
1025. Company logos fetched via external APIs with no local caching
1026. No image CDN or optimization for device/medication images
1027. Entity logos may display as tiny 16x16 favicons instead of proper product images
1028. No manufacturer-approved product images -- only web favicons
1029. Image URL scheme will break if DuckDuckGo changes their API
1030. No image alt text variations for different device models from same manufacturer

### 18.2 Community Content Hardcoding (10)
1031. Emma's story appears twice on Index.tsx (lines 192-226 and 364-379) -- identical content duplicated
1032. Index.tsx hero section volunteer roles hardcoded (Beta Testers, Researchers, Designers, etc.)
1033. GetInvolved.tsx:45-48 -- `transparencyItems` list hardcoded
1034. BecomeAdvocate page content entirely static with no CMS connection
1035. Community guidelines/rules not linked from post submission forms
1036. No user-generated success stories flow beyond community posts
1037. "Real Impact" section on homepage uses fabricated/curated stories
1038. No mechanism to feature actual community member stories on homepage
1039. Community post seeding creates 220+ posts but no ongoing content generation
1040. Community "solutions" are seeded once and become stale without new user contributions

### 18.3 TrendPrediction Component (5)
1041. TrendPrediction.tsx:50 -- Confidence values like `78` are hardcoded in prediction objects
1042. TrendPrediction.tsx:65 -- Post-breakfast spike confidence `72` is hardcoded
1043. Prediction algorithms use simple threshold comparisons, not actual predictive models
1044. "Trend Prediction" naming implies ML/AI but implementation is rule-based
1045. No prediction accuracy tracking or feedback loop

### 18.4 Comparison and Benchmark Data (10)
1046. PopulationTrendsTab.tsx:23-28 -- Study comparison data (T1D Exchange, JAEB, UK Biobank, TEDDY, JDRF CREATE) hardcoded with specific n-values and metrics
1047. PopulationTrendsTab.tsx:22 -- "This Dataset" row claims to be dynamic but all reference data is static
1048. No mechanism to update study comparison data when new publications release
1049. ATTD Consensus guidelines (line 28) show `n: 0` -- clearly a reference standard, not a study sample
1050. Study years are static and will become increasingly outdated
1051. ComparisonWidget.tsx:169 -- Displays sample sizes but these are from hardcoded reference data
1052. ExerciseCorrelationCard.tsx -- Exercise correlation analysis is purely from uploaded user data but benchmarks may be missing
1053. ClinicalSuggestionsPanel.tsx -- Clinical suggestions are rule-based, not clinician-reviewed
1054. Health metrics benchmarks (target TIR 70%, target CV <36%) are hardcoded constants
1055. No mechanism to adjust benchmarks based on user age, diabetes duration, or clinical goals

### 18.5 PsychLoad and Mental Health Content (5)
1056. PsychLoadComparisonSection.tsx:86-88 -- "100+ mg/dL swings possible in just one hour" hardcoded
1057. DiabetesBurnout statistics ("36-45%") cited from research but presented as static facts
1058. Mental health resource links and crisis hotline numbers are hardcoded
1059. No mechanism to verify crisis hotline numbers are current
1060. Mental health content has no professional review or endorsement mechanism

### 18.6 Footer and Layout Hardcoding (10)
1061. Footer copyright year is dynamic but legal text is static
1062. Footer "501(c)(3) Status" link goes to `/about` -- same as "About Us" link
1063. Footer social links may point to non-existent social accounts
1064. Footer "50,000+ posts" claim repeated from body content
1065. No footer link to terms of service or privacy policy pages
1066. Contact page office address (Contact.tsx:106) shows "Coming Soon"
1067. No actual physical address or registration information displayed
1068. "Emerging 501(c)(3)" status text will become stale once status changes
1069. Copyright entity name may need updating if organization structure changes
1070. No cookie consent banner or GDPR compliance notice

---

## Category 19: Configuration and Environment Hardcoding (Items 1071-1120)

### 19.1 Stripe Configuration (5)
1071. DonationModal.tsx:18 -- Stripe publishable key is a string literal in source code, not from env
1072. Two different Stripe test keys exist (DonationModal vs .env) -- unclear which is active
1073. No production Stripe key configuration path
1074. Stripe webhook secret not in configured secrets -- webhooks are unverified
1075. No Stripe dashboard link or management interface for admins

### 19.2 API and Service Hardcoding (10)
1076. Edge functions use various hardcoded API endpoints for external services
1077. Reddit API calls in `fetch-reddit-reviews` require auth credentials not configured
1078. No API key rotation mechanism for any external service
1079. External API rate limits not documented or handled consistently
1080. No health monitoring for external API dependencies
1081. ClinicalTrials.gov API endpoint hardcoded in edge function
1082. FDA API endpoint hardcoded in edge function
1083. NIH RePORTER API endpoint hardcoded in edge function
1084. Medicare.gov API endpoint hardcoded in edge function
1085. No fallback or circuit breaker for when external APIs are unavailable

### 19.3 UI Configuration Hardcoding (10)
1086. Predefined donation amounts ($10, $25, $50, $100) hardcoded in DonationModal
1087. Newsletter delivery day "Sunday" hardcoded in multiple locations
1088. Search keyboard shortcut "Cmd+K" hardcoded -- no customization
1089. Dashboard grid breakpoints hardcoded in useDashboardLayout hook
1090. Default widget list hardcoded in useDashboardLayout
1091. Sidebar navigation item order hardcoded in AppSidebar.tsx
1092. Theme colors hardcoded in Tailwind config -- no runtime theme customization
1093. Toast duration/position not configurable
1094. Pagination limits (`.limit(50)`, `.limit(10)`) hardcoded throughout hooks
1095. File upload size limit "50MB" claimed but not enforced

### 19.4 Content Configuration (15)
1096. Achievement definitions hardcoded -- can't add new achievements without code deploy
1097. Volunteer roles hardcoded -- can't update without code deploy
1098. Development projects hardcoded -- can't update without code deploy
1099. Donor tier definitions hardcoded
1100. FAQ answers hardcoded -- can't update without code deploy
1101. Financial tools resource URLs hardcoded (many pointing to "#")
1102. State forms download URLs hardcoded and disabled
1103. Cure timeline milestones hardcoded
1104. Research study citations hardcoded
1105. Organization donation data hardcoded
1106. Seasonal glucose patterns hardcoded
1107. Population trends comparison data hardcoded
1108. Regional glucose data hardcoded
1109. Technology adoption trend data hardcoded
1110. Exercise correlation benchmarks hardcoded

---

## Category 20: Missing Disclaimers and Legal/Compliance (Items 1111-1150)

### 20.1 Medical and Legal Disclaimers (15)
1111. No medical disclaimer on glucose analysis results
1112. No "not medical advice" banner on clinical suggestions
1113. No disclaimer that ScenarioLab predictions are simulated, not predictive
1114. No disclaimer on medication interaction checker results
1115. No disclaimer on device comparison data accuracy
1116. ClinicalSuggestionsPanel provides actionable health suggestions without medical oversight disclaimer
1117. TrendPrediction component shows health predictions without confidence context
1118. Glucose analysis reports could be interpreted as medical advice
1119. "Clinical-grade" PDF report claim may have regulatory implications
1120. No terms of service page
1121. No privacy policy page
1122. No cookie policy
1123. No data processing agreement for GDPR compliance
1124. No HIPAA compliance notice (handling health data)
1125. No user consent flow for health data collection

### 20.2 Data Accuracy Disclaimers (10)
1126. DonationsInfo page shows organization funding amounts with no "estimated" label
1127. Public glucose data tabs show hardcoded research data with no "illustrative" label
1128. Population comparison data presented as factual with no verification date
1129. Clinical trial data from ClinicalTrials.gov may be delayed -- no staleness indicator
1130. Drug pricing data may be outdated -- no last-refreshed timestamp visible to users
1131. Medicare coverage data may be outdated -- no last-refreshed timestamp
1132. FDA safety data may be delayed -- no update frequency shown
1133. Device reliability scores methodology not disclosed
1134. Medication satisfaction percentages methodology not disclosed
1135. Community "quality scores" calculation not explained to users

---

## Category 21: Remaining Hardcoded Instances (Items 1136-1200)

### 21.1 GlucoseUpload Component Issues (10)
1136. GlucoseUpload.tsx:47 -- `Math.random().toString(36).substr(2, 9)` for file IDs
1137. GlucoseUpload.tsx claims 50MB file size limit but no actual enforcement
1138. GlucoseUpload accepts file types by extension only -- no MIME type validation
1139. No virus/malware scanning on uploaded files
1140. No file content validation (CSV structure, required columns, etc.)
1141. Upload component shows drag-and-drop but may not work on mobile touch
1142. No sample/template CSV file available for users
1143. No data format documentation linked from upload interface
1144. No upload history page beyond the current session
1145. Uploaded file data not viewable after leaving the page

### 21.2 Shop and E-Commerce Hardcoding (5)
1146. Shop product data comes from database but product images may use placeholder URLs
1147. Shop checkout redirects to Stripe but no order confirmation page verifies payment
1148. No inventory tracking -- products show as available regardless
1149. No shipping address collection or shipping cost calculation
1150. No order history page for users

### 21.3 Search and Navigation Hardcoding (10)
1151. GlobalSearchDialog page/route list hardcoded -- new pages must be manually added
1152. Search only searches client-side predefined routes -- no full-text database search
1153. No search indexing for community posts, devices, medications, articles
1154. No recent searches persistence
1155. No search analytics to track what users look for
1156. Sidebar navigation items hardcoded in arrays -- not configurable
1157. Sidebar badge counts (if any) are static
1158. No "recently visited" or "favorites" navigation
1159. No user-customizable dashboard beyond widget arrangement
1160. Keyboard shortcuts not discoverable in UI

### 21.4 Auth and User Data Hardcoding (10)
1161. Settings.tsx:491 -- Email delivery shows `alex@example.com` instead of user's actual email
1162. No mechanism to detect if user has completed profile setup
1163. No welcome email sent on registration
1164. No email verification reminder flow
1165. Auth.tsx -- signup doesn't show password requirements upfront
1166. No "remember me" option on login
1167. No social auth providers (Google, Apple, etc.)
1168. No magic link authentication option
1169. Admin role check queries `admin_users` table on every protected page load -- no caching
1170. User role/permissions not cached in session -- re-fetched on every admin page

### 21.5 Miscellaneous Hardcoded Items (30)
1171. Index.tsx:4 -- `dropIcon` imported but never used in rendered JSX (dead import)
1172. `src/data/` directory contains 5 files of hardcoded data that should be in database
1173. `useEngagementTracking` hook has engagement trigger thresholds hardcoded
1174. Smart onboarding modal fires after hardcoded 2-second delay
1175. Onboarding checklist items hardcoded
1176. Achievement unlock confetti colors hardcoded (gold, orange, red, purple)
1177. GoodBadJars gradient colors hardcoded inline
1178. Chart colors (`hsl(var(--chart-1))` through `--chart-5`) limited to 5 -- some charts need more
1179. PDF report generation uses hardcoded template layout
1180. DataExport component uses hardcoded CSV column headers
1181. Date format inconsistent -- some use `toLocaleDateString()`, others use date-fns
1182. Currency formatting not centralized -- some use `toLocaleString()`, others manual `$` prefix
1183. Error messages in catch blocks are inconsistent (some show technical details, others generic)
1184. Console.log statements in 39+ page files running in production
1185. Loading timeout values hardcoded (e.g., setTimeout with magic numbers)
1186. Supabase query `.limit()` values inconsistent (10, 50, 100, unbounded)
1187. Toast message strings hardcoded throughout (no i18n or centralized strings)
1188. Button labels inconsistent ("Cancel" vs "Close" vs "Dismiss")
1189. Empty state messages inconsistent across pages
1190. Error state messages inconsistent across pages
1191. No centralized constants file for shared values (limits, thresholds, URLs)
1192. No feature flags system -- all features always on
1193. No A/B testing infrastructure
1194. No analytics event tracking (no page views, no click tracking, no funnel analysis)
1195. No user feedback collection mechanism (no NPS, no satisfaction survey)
1196. Glucose unit always mg/dL -- no mmol/L support
1197. Timezone assumed from browser -- no explicit timezone setting
1198. Date ranges in filters use hardcoded options (7 days, 30 days, 90 days)
1199. Recharts tooltip formatting hardcoded per-chart instead of shared formatter
1200. No data export format options beyond what's hardcoded (CSV only in most places, JSON in admin)

---

## Implementation Priority (Updated for Items 801-1200)

### Phase 1 -- Critical Fixes (Items that mislead users or cause errors)
- Replace hardcoded DataUpload stats (946-950) with real values from database
- Fix `alex@example.com` hardcoded email in Settings (1161)
- Remove or gate QA Checklist from public access (826)
- Fix Date.now() ID collision (952)
- Fix Stripe key mismatch between DonationModal and .env (1001-1002)
- Fix donation amount validation mismatch between client and server (1003-1004)
- Add "demo data" visual indicator when showing fabricated widget values (809)
- Remove dead `dropIcon` import from Index.tsx (1171)
- De-duplicate Emma's story on homepage (1031)

### Phase 2 -- Misleading Claims and Fake Data
- Replace admin dashboard hardcoded charts with real analytics queries (811-820)
- Connect SeasonalPatternsTab and PopulationTrendsTab to actual `public_glucose_data` aggregations (871-885)
- Label ScenarioLab as "simulation/demonstration" not "AI-powered predictions" (941-945)
- Add disclaimers to CureProgress projections (896-900)
- Replace or label DonationsInfo organization data with last-verified dates (861-870)
- Replace fabricated testimonials with real user quotes or remove (906)
- Fix or remove inflated community member count (806)

### Phase 3 -- Connect Disconnected Features
- Persist Settings profile fields (CGM, pump, diagnosis, research) to database (971-975)
- Connect notification preferences to database table instead of localStorage (961-968)
- Wire up dead Quick Actions buttons or remove them (951)
- Configure email sending service and cron triggers for digest/alerts (983-990)
- Fix recurring donation support in edge function (1007)
- Add webhook secret verification (1005-1006)

### Phase 4 -- Content Management
- Move hardcoded data files (`src/data/`) to database tables (1172)
- Make achievements, volunteer roles, FAQs, and roadmap admin-configurable (1096-1110)
- Add medical and legal disclaimers (1111-1125)
- Add data accuracy/staleness indicators (1126-1135)
- Create terms of service and privacy policy pages (1120-1122)

### Phase 5 -- Polish and Quality
- Replace all fabricated public-facing statistics with real DB counts or clearly label (831-860)
- Add proper "illustrative data" labels to hardcoded research charts (881, 884)
- Centralize date formatting, currency formatting, error messages (1181-1183)
- Remove 345+ console.log statements from production code (1184)
- Add feature flags system for controlled rollout (1192)
- Add analytics event tracking infrastructure (1194)

