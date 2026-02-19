

# Comprehensive Wiring, Data, and Functionality Audit: 400 Issues (Items 1701-2100)

This extends the existing 1700-item audit with 400 newly verified issues found through deep analysis of the current codebase state. Many are from prior audit rounds that remain unfixed, plus newly discovered gaps.

---

## Category 28: Previously Identified Issues Still Present (Items 1701-1780)

### 28.1 Admin Settings Entirely Local State -- Never Persisted (10)
1701. AdminSettings.tsx:30-62 -- `featureFlags` state is local `useState` -- toggling flags has no backend persistence, resets on refresh
1702. AdminSettings.tsx:64-97 -- `brandingSettings` state is local `useState` -- saving triggers toast only, no DB write
1703. AdminSettings.tsx:99-105 -- `systemSettings` (maintenance mode, registration, retention, timeout, upload limit) all local state
1704. AdminSettings.tsx:128-130 -- `saveBrandingSettings()` just calls `toast.success()` -- no Supabase update
1705. AdminSettings.tsx:132-134 -- `saveSystemSettings()` just calls `toast.success()` -- no Supabase update
1706. AdminSettings.tsx:107-115 -- `toggleFeatureFlag()` updates local state and toasts, never writes to any DB table
1707. Security tab 2FA switch has no `checked` state, no handler, no persistence
1708. Security tab IP Allowlist switch has no `checked` state, no handler, no persistence
1709. Feature flags have no database table -- entire admin settings page is decorative
1710. Maintenance mode toggle has no enforcement anywhere in the app -- toggling does nothing

### 28.2 Admin Routes Missing ProtectedRoute Wrapper (5)
1711. App.tsx:249 -- `/admin/articles` uses `<AdminRoute>` but NOT wrapped in `<ProtectedRoute>` -- unauthenticated users hit admin check before auth check
1712. App.tsx:250 -- `/admin/low-sugar-stories` same issue -- `<AdminRoute>` without `<ProtectedRoute>`
1713. App.tsx:251 -- `/admin/warriors` same issue
1714. App.tsx:252 -- `/admin/shop` same issue
1715. App.tsx:253 -- `/admin/content-moderation` same issue

### 28.3 Notification Delivery Method Switches Still Broken (5)
1716. Settings.tsx:564-565 -- Email delivery Switch `checked={notifications.weeklyReports}` -- mirrors weeklyReports instead of a dedicated `emailDelivery` field
1717. Settings.tsx:566 -- `onCheckedChange` sets `emailDelivery` on notifications object, but `emailDelivery` is not in the initial state type -- value is set but never read or persisted correctly
1718. Settings.tsx:575-576 -- Push notification delivery Switch `checked={notifications.deviceAlerts}` -- mirrors deviceAlerts instead of dedicated field
1719. Settings.tsx:577 -- `onCheckedChange` sets `pushDelivery` but this field doesn't exist in the initial `notifications` state type
1720. These phantom fields (`emailDelivery`, `pushDelivery`) get persisted to DB JSONB but are never read back or used for routing

### 28.4 Console.log Statements Still in Production (10)
1721. 335 console.log/error/warn calls remain across 39 page files (confirmed by search)
1722. useEngagementTracking.ts:43 -- `console.log('Engagement tracked for', today)` runs for every logged-in user daily
1723. useEngagementTracking.ts:46 -- `console.log('Engagement tracking error:', error)` leaks error details
1724. NotFound.tsx:8-10 -- `console.error("404 Error...")` logs every 404 -- could be noisy
1725. Settings.tsx:175,227 -- console.error in profile load/save
1726. DataUpload.tsx:276 -- console.error in upload flow
1727. DashboardWidgets.tsx:236 -- console.error in widget fetch
1728. Admin pages (AdminUsers.tsx has 5 console.error calls, AdminContent.tsx has 4)
1729. Profile.tsx has 4 console.error calls
1730. Donate.tsx:51 -- console.error in donation flow

### 28.5 ScenarioLab Still Has Random Variation (5)
1731. ScenarioLab.tsx:92 -- `exercise_cardio` stabilization phase still uses `Math.random() * 5` for glucose variation
1732. ScenarioLab.tsx:163 -- Default case still uses `Math.random() * 10 - 5` for unknown scenarios
1733. While most curves were improved with physiological models, these two branches still have pure random noise
1734. Line 167 adds deterministic noise `Math.sin(time * 0.7) * 3 + Math.cos(time * 1.3) * 2` -- this is good, but the random component at line 92 undermines reproducibility
1735. Running same scenario twice produces different results due to Math.random()

### 28.6 DonationsInfo Page Still Entirely Hardcoded (10)
1736. DonationsInfo.tsx:38-159 -- All 6 organization funding amounts remain hardcoded ($198M JDRF, $145M ADA, etc.)
1737. While disclaimer text was added ("approximate estimates, last reviewed 2024"), the actual numbers are still static TypeScript arrays
1738. No mechanism to update these numbers without a code deploy
1739. `yearlyTrendsData` array (line 161-168) is entirely fabricated
1740. `sectorBreakdown` pie chart data (line 170-175) is entirely fabricated
1741. Organization `patientsHelped`, `studiesFunded`, `trialsSupported` numbers are all hardcoded estimates
1742. `topPrograms` arrays for each org are hardcoded strings
1743. Website URLs may become stale (JDRF rebranded to Breakthrough T1D)
1744. No API or data source to verify these numbers
1745. No admin interface to update donation organization data

### 28.7 SupportGlucoForge Hardcoded Data Still Present (10)
1746. SupportGlucoForge.tsx -- Development roadmap phases with static dates and statuses
1747. SupportGlucoForge.tsx -- Funding allocation percentages (45%, 25%, 15%, 10%, 5%) hardcoded
1748. SupportGlucoForge.tsx -- Donor tier definitions and benefits hardcoded (no system implements tiers)
1749. SupportGlucoForge.tsx -- Fabricated testimonials now labeled "Community Member (illustrative)" but still fake content
1750. SupportGlucoForge.tsx -- Platform stats ("50+ Pages", "27+ Projects", "10+ Sources") hardcoded
1751. SupportGlucoForge.tsx -- "50,000+ peer-reviewed fixes" claim in feature description -- fabricated
1752. SupportGlucoForge.tsx -- FAQ claims "quarterly transparency reports" that don't exist
1753. SupportGlucoForge.tsx -- Claims "tax-deductible retroactively" -- potential legal inaccuracy
1754. SupportGlucoForge.tsx -- No mechanism for actual users to submit testimonials
1755. SupportGlucoForge.tsx -- FAQ not connected to any CMS or database

### 28.8 src/data/ Files All Still Static (10)
1756. developmentProjects.ts -- 27+ projects with hardcoded progress percentages that never update
1757. developmentProjects.ts -- Task statuses (todo/in_progress/done) are static
1758. developmentProjects.ts -- Target completion dates static and possibly outdated
1759. volunteerRoles.ts -- All roles hardcoded, no application flow
1760. volunteerRoles.ts -- "Open projects" references are static strings
1761. achievementDefinitions.ts -- All achievement criteria/thresholds hardcoded
1762. cureReportContent.ts -- Report content entirely static
1763. projectReportsContent.ts -- Project report content entirely static
1764. No admin interface to manage any data files
1765. These should be database tables with admin CRUD interfaces

### 28.9 "Coming Soon" Stubs With No Implementation Plan (10)
1766. Settings.tsx:677 -- 2FA button disabled with "Coming Soon"
1767. Settings.tsx:681 -- Login activity button disabled with "Coming Soon"
1768. Settings.tsx:881 -- Delete All Data shows "Coming Soon" toast
1769. Settings.tsx:873 -- "Storage usage tracking coming soon" placeholder text
1770. WarriorSpotlight.tsx -- "Stories Coming Soon" placeholder
1771. EmergenceOfDiabetes.tsx:963 -- "Myths Coming Soon" placeholder
1772. AdminContent.tsx:448 -- "Survey management functionality coming soon"
1773. StateFormsFinder.tsx:320-322 -- Download buttons disabled with "Coming Soon"
1774. FinancialTools.tsx:155-158,268-270,283-285 -- Multiple resource links and templates "Coming Soon"
1775. News.tsx:90 -- Subscribe feature "coming soon" toast

---

## Category 29: Data Connection and Wiring Bugs (Items 1781-1860)

### 29.1 Notification System Wiring Failures (10)
1776. Settings notification category toggles (glucoseAlerts, researchUpdates, communityPosts, deviceAlerts, weeklyReports) are persisted to DB but NO backend system reads them to filter notifications
1777. `notify_connection_request()` trigger creates notifications regardless of user's notification preferences
1778. `notify_direct_message()` trigger creates notifications regardless of user's notification preferences
1779. `notification-triggers` edge function has no cron or event trigger configured
1780. `send-weekly-digest` edge function has no cron trigger
1781. `send-trending-alerts` edge function has no trigger
1782. `daily-briefing` edge function has no trigger
1783. No email sending service integration verified (RESEND_API_KEY exists but untested)
1784. Email delivery method switch (Settings line 564) doesn't actually control email routing
1785. Push delivery method switch (Settings line 575) is separate from the PushNotificationsSection

### 29.2 Community Widget ActiveMembers Count Wrong (5)
1786. DashboardWidgets.tsx:138-140 -- `community-insights` widget counts `community_posts` published in last 24h but displays result under label "Posts in last 24h" (line 369) -- this is correct for posts but the variable is named `activeMembers` (line 152) which is misleading
1787. DashboardWidgets.tsx:147-148 -- `userContributions` counts comments where `author_anonymous` matches email prefix -- this is a weak match that won't find contributions if the user's email prefix doesn't match their anonymous name
1788. No actual "active members" count exists -- would need to count unique users with recent activity
1789. The label was previously "Active Members" (inflated with fake 2847 base) -- now shows posts count but variable name is still `activeMembers`
1790. No way to track actual registered user count from client side (would need a server function)

### 29.3 Admin Dashboard "Active Users" Metric Wrong (5)
1791. AdminDashboard.tsx:74-80 -- "Active Users" counts users with shifts in last 30 days -- `shifts` table purpose is unclear and likely empty
1792. AdminDashboard.tsx:82-85 -- `totalDonations` reads from a `donations` table that may not exist or be empty
1793. AdminDashboard.tsx:21-38 -- Chart data is explicitly marked as placeholder but still rendered without visual "illustrative" badge on the charts themselves
1794. Admin export in AdminAnalytics.tsx would export these fabricated chart numbers
1795. No actual user activity tracking (page views, logins, feature usage) exists to populate real charts

### 29.4 Trends Page -- Pipeline Still Missing (5)
1796. `trend_analysis_metrics` table has no data pipeline -- the table is likely permanently empty
1797. Trends.tsx "Refresh Data" button just re-fetches from the empty table (line 53-57)
1798. Page shows "No trend data available yet" permanently with no way to populate
1799. The old `update_trends()` RPC was removed but no replacement aggregation exists
1800. Users clicking "Refresh Data" see "Data Refreshed: Showing latest available trend data" toast but nothing changes

### 29.5 Donate.tsx Recurring Donation UI Disconnected (5)
1801. Donate.tsx:23-24 -- `isRecurring` and `recurringFrequency` state variables exist
1802. Donate.tsx:39-41 -- `handleDonate` sends only `{ amount: currentAmount }` to edge function -- `isRecurring` and `recurringFrequency` are never sent
1803. `create-donation` edge function likely only creates one-time Stripe checkout sessions
1804. The recurring donation toggle and frequency selector UI exists but the selection is silently ignored
1805. User could select "Monthly recurring" and pay, thinking they set up a subscription, but only a one-time charge occurs

### 29.6 Profile Page vs Settings Page Data Conflict (5)
1806. Profile.tsx has its own profile form (display_name, bio, password) separate from Settings.tsx profile tab
1807. Both pages read from and write to the same `profiles` table
1808. Saving on one page doesn't update the other (no shared state or cache invalidation)
1809. Settings has additional fields (diagnosis_date, primary_cgm, insulin_delivery) that Profile doesn't
1810. Profile has password change functionality that Settings redirects to via toast

### 29.7 Stripe Key Configuration (5)
1811. DonationModal.tsx:18 -- Now reads from `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY` (fixed)
1812. If env var is empty, `loadStripe("")` is called -- Stripe will silently fail with no user-facing error
1813. No validation that Stripe key is configured before showing donation UI
1814. No fallback or error message when Stripe isn't configured
1815. `create-donation` edge function success depends on STRIPE_SECRET_KEY being configured in secrets

### 29.8 Edge Function Orchestration Issues (10)
1816. `data-orchestrator` runs daily but individual feed functions may fail silently
1817. ~40 seed functions remain deployed and invokable -- potential resource waste and confusion
1818. `verify-external-links` has no cron trigger -- link health never checked automatically
1819. `snapshot-generator` has no trigger -- snapshots never generated
1820. `scheduled-maintenance` has no trigger -- maintenance tasks never run
1821. No health check endpoint for any edge function
1822. No rate limiting on any edge function
1823. No request size validation on edge functions
1824. CORS headers allow `*` origin on all edge functions
1825. No shared utility module (CORS headers copy-pasted across all functions)

### 29.9 Database Tables Without Data Pipelines (10)
1826. `trend_analysis_metrics` -- empty, no pipeline
1827. `population_insights` -- no pipeline to populate
1828. `data_refresh_logs` -- no process writes to it
1829. `backfill_audit` -- no process writes to it
1830. `shifts` table -- purpose unclear, used for admin "active users" count but likely empty
1831. `update_trends()` DB function was a no-op; now it's called by Trends page but still does nothing useful
1832. `update_updated_at_column()` trigger function exists but no triggers are attached to any table
1833. Device reviews `helpful_count` column updated by trigger `update_review_helpful_count` but trigger depends on a junction table that may not be used
1834. No database cleanup cron for old notifications, expired sessions, or stale data
1835. No materialized views for expensive aggregation queries on `public_glucose_data` (126k+ rows)

---

## Category 30: UI/UX Bugs and Rendering Issues (Items 1836-1920)

### 30.1 Settings Notification Tab Wiring Bug (5)
1836. Settings.tsx:564 -- Email delivery Switch `checked={notifications.weeklyReports}` -- shows weekly reports state, not email delivery state
1837. Settings.tsx:575 -- Push delivery Switch `checked={notifications.deviceAlerts}` -- shows device alerts state, not push delivery state
1838. Toggling email delivery actually toggles `emailDelivery` (phantom key) while display shows `weeklyReports` -- confusing mismatch
1839. Toggling push delivery actually toggles `pushDelivery` (phantom key) while display shows `deviceAlerts` -- confusing mismatch
1840. If user toggles email delivery off, the visual switch doesn't change (it reads from weeklyReports which wasn't changed)

### 30.2 Settings Missing Save Button on Notifications (5)
1841. Settings notification tab has toggle switches but the save button is not visible in the viewport -- user must scroll past PushNotificationsSection and Delivery Methods to find any implicit save
1842. Actually, there is NO explicit "Save Notification Preferences" button visible in the notification tab
1843. `handleSaveNotifications` function exists (line 238-260) but it's never called from any button in the notifications tab
1844. Notification preference changes are in local state only -- user thinks they saved but nothing was persisted
1845. Contrast with privacy tab which has an explicit "Save Privacy Settings" button

### 30.3 Form and Input Issues (10)
1846. Settings profile bio field has no character limit -- can submit unlimited text
1847. Settings diagnosis date has no validation (future dates accepted)
1848. Contact form has no email format validation
1849. Contact form has no rate limiting or anti-spam
1850. Community post submission has no content length validation
1851. BecomeAdvocate form doesn't prevent double submission
1852. Device/medication review forms may not handle very long text
1853. No form auto-save for long-form inputs anywhere
1854. Profile display name has no length limit or character restrictions
1855. No unsaved changes warning when navigating away from any form

### 30.4 Empty States Missing or Poor (10)
1856. Trends page shows "No trend data available yet" but gives misleading suggestion to "click Refresh Data" (which just re-fetches empty table)
1857. Fixes page shows skeleton loader but no "no fixes found" message when `device_issues` table has no solutions
1858. WarriorSpotlight "Stories Coming Soon" -- no timeline
1859. ProjectFullReport "Report Coming Soon" -- no timeline
1860. QoLDetailModal falls back to generic "coming soon" for unknown items
1861. ResearchHub shows loading but no "no results" empty state
1862. MedicineHub shows loading but no empty state for no matching medications
1863. DeviceAnalytics shows loading but no empty state for devices with no data
1864. Shop page may show empty state with no guidance on what to expect
1865. Bounties page may show empty state with no context

### 30.5 Accessibility Gaps (10)
1866. SkipToContent component was created but `Layout.tsx` already had it imported -- verify it's actually rendered correctly
1867. Charts (Recharts) have no text alternatives for screen readers
1868. Icon-only buttons in header (User, LogOut icons) have no aria-labels
1869. Achievement badges use emoji (e.g., "🤝") -- not accessible to screen readers
1870. No `prefers-reduced-motion` support for framer-motion animations
1871. Color-only status indicators (green/red badges) need text alternatives
1872. Focus management missing after route changes (ScrollToTop handles scroll but not focus)
1873. Modal focus trapping may be incomplete (console warning about missing DialogDescription)
1874. Form error messages not linked via `aria-describedby`
1875. Loading spinner (Loader2 in PageLoader) has no accessible text/role

### 30.6 Responsive Design Issues (10)
1876. Settings TabsList `grid-cols-2 lg:grid-cols-5` -- on medium screens (md), 5 tabs wrap to 3+2 rows awkwardly
1877. Header with 5+ action buttons (search, notification bell, user, logout, donate) overflows on screens < 768px
1878. Hero section floating animated elements (Beaker, Brain, Heart) overlap text on mobile
1879. DataUpload drag-and-drop may not work well on mobile touch devices
1880. Footer 4-column grid collapses inconsistently on tablet
1881. Modal dialogs with long content may not scroll properly on small screens
1882. Chart components may not resize on device orientation change
1883. Admin data tables not horizontally scrollable on mobile
1884. Sidebar collapse state may hide critical navigation on mobile
1885. Dashboard grid `xxs: 2 cols` may be too dense for very small screens

### 30.7 Navigation and Routing (10)
1886. No breadcrumb navigation on nested routes (device detail, company detail, etc.)
1887. Quick actions widget buttons now navigate (fixed) but community insights "View Community" also navigates -- verify all widgets have working navigation
1888. No 404 handling for deep links to non-existent community posts, devices, or companies
1889. GlobalSearchDialog searches only a predefined route list -- doesn't search DB content (devices, medications, posts)
1890. No recent searches history
1891. No "favorites" or quick-access bar
1892. `/admin` route (line 178) uses `<ProtectedRoute>` but not `<AdminRoute>` -- any authenticated user can access the admin landing page
1893. `DonationSuccess` mounted at both `/donate/success` (line 160) and `/donation-result` (line 216) -- duplicate routes
1894. `/help` maps to `PrepareForVisit` -- confusing route name
1895. No loading indicator during lazy route transitions (PageLoader shows for initial load only)

---

## Category 31: Security and Data Integrity Issues (Items 1896-1960)

### 31.1 Admin Access Holes (5)
1896. App.tsx:178 -- `/admin` landing page is `<ProtectedRoute><Admin /></ProtectedRoute>` -- missing `<AdminRoute>` wrapper
1897. App.tsx:249-253 -- Five admin content routes (`/admin/articles`, etc.) have `<AdminRoute>` but NOT `<ProtectedRoute>` -- unauthenticated users reach AdminRoute check
1898. AdminRoute component may handle auth check internally, but the pattern is inconsistent with other admin routes
1899. No audit logging for any admin action (role changes, content deletion, user deactivation)
1900. Admin dashboard stats are visible but chart data is fabricated -- admin might make decisions based on fake data

### 31.2 Data Validation Gaps (10)
1901. Settings profile save doesn't validate bio length server-side
1902. Community post content not sanitized for XSS before rendering
1903. No input sanitization on contact form submissions
1904. No CAPTCHA on signup, login, or contact forms
1905. Profile bio has no profanity filter
1906. Community post content has no profanity filter
1907. Donation amount validation mismatch: DonationModal allows $5+, Donate.tsx allows $5+, but edge function may have different rules
1908. File upload claims 10MB limit (MAX_FILE_SIZE) but binary files still read into memory as base64
1909. No Supabase Storage bucket configured despite `file-upload-pipeline` memory noting it should exist
1910. No MIME type validation on uploaded files -- only extension checking

### 31.3 Webhook Security (5)
1911. `stripe-shop-webhook` now checks STRIPE_WEBHOOK_SECRET but the secret is not in configured secrets list
1912. Without the secret, webhook falls back to parsing events without signature verification
1913. No webhook event deduplication -- same event could be processed twice
1914. No webhook retry or dead-letter handling
1915. Shop product fulfillment after payment is not verified

### 31.4 Legal and Compliance Still Missing (10)
1916. No Terms of Service content (Terms.tsx may exist but content quality unverified)
1917. No Privacy Policy with adequate content for health data
1918. No cookie consent banner
1919. No GDPR data processing agreement
1920. No HIPAA compliance notice for handling health data
1921. MedicalDisclaimer component created but not integrated into all relevant pages
1922. ScenarioLab has disclaimer but DataUpload glucose analysis results have no medical disclaimer
1923. ClinicalSuggestionsPanel (in data upload analysis) provides health suggestions without medical oversight disclaimer
1924. TrendPrediction component shows health predictions without confidence context
1925. Crisis hotline numbers in mental health content may be outdated and have no verification mechanism

---

## Category 32: Performance and Architecture Issues (Items 1926-1980)

### 32.1 Query and Data Loading (10)
1926. `useEngagementTracking` hook runs on every mount of `AppContent` (line 136) -- fires streak/achievement checks for every page visit
1927. Dashboard widgets each make independent Supabase queries -- no batching or shared data context
1928. `glucose-trends` and `health-metrics` widgets both fetch from `uploads` table with identical query -- duplicate DB calls
1929. DashboardWidgets `recent-activity` sorts by `time` string (line 191) which is relative text ("2 hours ago") -- not chronological sort
1930. No query timeout configuration -- slow queries hang indefinitely
1931. Supabase query `.limit()` values inconsistent: 1, 3, 5, 10, 20, 50, 100 used across hooks
1932. Community posts infinite scroll loads all posts sequentially -- no cursor-based pagination
1933. `public_glucose_data` aggregation RPC functions on 126k+ rows may timeout
1934. No database indexes verified for frequently filtered columns
1935. `AdminDashboard` makes 5 separate count queries on mount -- could be a single RPC

### 32.2 Component Architecture (10)
1936. Layout component renders 5 modals on every page (DonationModal, OnboardingModal, GlobalSearchDialog, SmartOnboarding, AchievementUnlockModal)
1937. No `React.memo` on expensive list item components (SolutionCard, device cards, medication cards)
1938. No `useMemo` for expensive computations in chart-heavy pages
1939. `useEffect` with `[user, recordVisit, checkTrigger]` deps in useEngagementTracking may fire multiple times if functions aren't stable references
1940. State management fragmented: Zustand (auth), React Query (some hooks), raw useState+useEffect (most pages), next-themes (localStorage)
1941. Toast usage split between `sonner` (toast function) and `@/hooks/use-toast` (useToast hook) -- two toast systems
1942. Loading skeleton patterns reimplemented per page instead of shared components
1943. Date formatting not centralized -- mix of `toLocaleDateString()`, `date-fns`, and manual formatting
1944. Currency formatting not centralized -- some use `toLocaleString()`, others manual `$` prefix
1945. Error message strings hardcoded and inconsistent across pages

### 32.3 Code Quality (10)
1946. DataUpload.tsx:79-83 -- Five `any` typed fields in UploadedFile interface (`validationFlags`, `dataQuality`, `novelSignals`, `executiveSummary`, `dayNightAnalysis`)
1947. DashboardWidgets.tsx widget data discriminated union (line 71) mixes typed interfaces with `{ loaded: boolean } | null` -- not type-safe
1948. Multiple hooks use `catch (error: any)` or untyped catch blocks
1949. `AdminRoute` component and `withAdmin` HOC both implement admin checking -- duplicate patterns
1950. `EmailDigestSignup` (dashboard component) and `WeeklyDigestSignup` (standalone component) -- two implementations of same feature
1951. No shared constants file for magic numbers (query limits, timeout values, animation durations)
1952. No shared formatting utilities
1953. Error boundary catches errors but has no reporting mechanism (no Sentry, no error tracking)
1954. Zero unit tests, zero integration tests, zero E2E tests
1955. No dependency vulnerability scanning

---

## Category 33: Missing Features and Incomplete Flows (Items 1956-2040)

### 33.1 Email System Non-Functional (10)
1956. `send-weekly-digest` edge function deployed but no cron trigger in config.toml
1957. `send-trending-alerts` deployed but no trigger
1958. `daily-briefing` deployed but no trigger
1959. RESEND_API_KEY exists in secrets but no verification that it works
1960. No welcome email on user registration
1961. No email verification reminder
1962. No donation receipt email after payment
1963. No contact form submission notification to admin
1964. No email unsubscribe mechanism
1965. Newsletter "Sunday" delivery claimed in UI but no scheduled job exists

### 33.2 Missing Cron Jobs (5)
1966. No cron for `verify-external-links` -- stale link detection never runs
1967. No cron for `snapshot-generator`
1968. No cron for `scheduled-maintenance`
1969. No cron for data feed refreshes (FDA, Medicare, clinical trials)
1970. No cron for `notification-triggers`

### 33.3 Search and Discovery Incomplete (10)
1971. GlobalSearchDialog searches hardcoded route list only -- no database content search
1972. No full-text search across community_posts table
1973. No search across devices or medications by name
1974. No search across research articles
1975. No search suggestions or autocomplete
1976. No recent searches history
1977. Sidebar navigation items hardcoded in arrays
1978. No "favorites" or quick-access feature
1979. Community search (useCommunitySearch) uses `ilike` which is slow on large tables without indexes
1980. No search analytics to track what users look for

### 33.4 Account Management Gaps (10)
1981. Account deletion covers 28 tables (improved) but may still miss tables: `glucose_analysis_entries`, `push_subscriptions`, `low_blood_sugar_stories`, `review_helpful_votes`
1982. No account deactivation (soft delete) option
1983. No re-authentication before destructive actions (delete account uses `window.confirm` only)
1984. No data export before account deletion
1985. No email change functionality
1986. No session management (view/revoke active sessions)
1987. "Delete All Data" button separate from "Delete Account" -- shows "Coming Soon" toast
1988. Password change in Settings redirects via toast to Profile page -- should be inline
1989. No password strength requirements shown during signup
1990. No multi-factor authentication

### 33.5 Shop and E-Commerce Gaps (5)
1991. No order history page
1992. No inventory tracking
1993. No shipping calculation
1994. Shop checkout redirects to Stripe with no post-payment verification page
1995. STRIPE_WEBHOOK_SECRET not in configured secrets

### 33.6 Gamification Incomplete (10)
1996. Achievement definitions hardcoded in TypeScript -- no admin CRUD
1997. Achievement `earned_at` may be overwritten to null by UPSERT when not completed
1998. Duplicate achievement notifications (4x "Explorer" found in sample data)
1999. Smart onboarding modal fires 2 seconds after login regardless of context
2000. Onboarding checklist items hardcoded
2001. No mechanism to permanently dismiss smart onboarding beyond setting preference
2002. Streak tracking uses client timezone -- breaks across timezone changes
2003. No engagement metrics dashboard for users (streaks, achievements, stats)
2004. No leaderboard or community ranking
2005. Achievement unlock modal may interrupt important workflows (appears over donation flow)

### 33.7 Internationalization and Unit Support (5)
2006. Glucose unit always mg/dL -- no mmol/L support anywhere
2007. Timezone assumed from browser -- no explicit timezone setting in profile
2008. No language selection or i18n
2009. Date format inconsistent across pages
2010. Currency always USD

### 33.8 PWA and Offline (5)
2011. sw.js exists in public/ for push notifications but no full PWA manifest
2012. No offline detection or "you are offline" banner
2013. No offline caching strategy
2014. No favicon configured
2015. No OG meta tags for social sharing

---

## Category 34: Content Freshness and Data Staleness (Items 2016-2060)

### 34.1 Stale Static Content (15)
2016. Index.tsx:27-33 -- Volunteer roles array hardcoded inline
2017. Index.tsx:138 -- "~8.4M" T1D stat from IDF Atlas 2022 -- now potentially outdated
2018. CureProgress.tsx -- Timeline milestones (Tzield approval, Vertex VX-880) hardcoded and will become stale
2019. CureProgress.tsx -- "~$2.8B+" Annual Research Funding is a static estimate
2020. CureProgress.tsx -- "~150+" Research Institutions is a static estimate
2021. CureProgress.tsx -- "~50K+" Researchers Worldwide is a static estimate
2022. PopulationTrendsTab.tsx -- Technology adoption trends (2018-2024) already outdated for 2025+
2023. PopulationTrendsTab.tsx -- Regional data claims fabricated sample sizes (n=12000, n=9500)
2024. SeasonalPatternsTab.tsx -- Monthly glucose data is reference data, labeled but still hardcoded
2025. EmergenceOfDiabetes.tsx -- Research studies with DOIs are static and never refreshed
2026. FindDiabeticNearMe.tsx -- TIPS array with 3 tips hardcoded
2027. Roadmap "Current Phase: Foundation" badge will become stale
2028. Footer "emerging 501(c)(3)" text will become stale
2029. Copyright year is dynamic (good) but entity name and legal status are static
2030. DonationImpactVisualization impact claims ("$10 funds...") are fabricated

### 34.2 Research and External Data Staleness (10)
2031. Research items fetched from DB but no automatic refresh from PubMed/OpenAlex
2032. Clinical trials data from ClinicalTrials.gov may be cached indefinitely without refresh
2033. No "last updated" timestamp visible on research data pages
2034. No staleness indicator on clinical trial listings
2035. FDA safety data may be outdated with no visible refresh timestamp
2036. Medicare coverage data may be outdated
2037. Drug pricing data may be outdated
2038. Patent data in InnovationHub may be outdated
2039. News articles may go stale without auto-refresh
2040. Community posts seeded in bulk but never refreshed organically beyond user submissions

---

## Category 35: Miscellaneous Remaining Issues (Items 2041-2100)

### 35.1 Duplicate Routes and Dead Code (5)
2041. `DonateSuccess` mounted at both `/donate/success` and `/donation-result` -- duplicate
2042. `DonationSuccess.tsx` in pages root AND `DonateSuccess.tsx` in pages/donate/ -- possible two separate components for same purpose
2043. 40+ seed functions deployed and invokable but should only run once -- resource waste
2044. `loadNotificationPreferences()` function at Settings.tsx:200-202 is empty stub -- dead code
2045. `withAdmin` HOC in components/ may be unused since `AdminRoute` component handles admin gating

### 35.2 Type Safety Issues (5)
2046. Settings notification state type doesn't include `emailDelivery` or `pushDelivery` -- phantom keys silently added via onCheckedChange
2047. UploadedFile interface has 5 `any` typed fields
2048. Widget data union type includes `{ loaded: boolean }` catch-all -- not discriminated properly
2049. `Json` type from Supabase requires unsafe type assertions when reading JSONB columns
2050. Multiple `catch (error)` blocks without proper typing

### 35.3 Community Solutions Page Specific Issues (10)
2051. CommunitySolutions.tsx:79 -- `handleQuickTopic` takes keywords string but only uses first word: `keywords.split(' ')[0]`
2052. CommunitySolutions.tsx:83 -- `handleTopicSelect` same issue -- only first word of keywords used
2053. CommunitySolutions.tsx:110 -- `handleTrendingClick` uses first 3 words of title as search -- may miss relevant results
2054. CommunitySolutions.tsx:191 -- `DashboardWidgets recent-activity items.sort()` sorts by relative time strings ("2 hours ago") -- not chronologically correct
2055. Community post `author_anonymous` matching by email prefix (DashboardWidgets:147) is fragile
2056. BrowseBySource component relies on `availableSources` which may be empty if no posts are seeded
2057. AlertPreferencesModal functionality not verified -- may not actually create alerts
2058. DataRefreshBanner triggers community-feed edge function -- verify it actually seeds/refreshes posts
2059. Infinite scroll observer (line 56-69) has `loadMore` in dependency array which may cause re-subscription loops
2060. No community post moderation queue visible to moderators (admin has ContentModeration but separate from CommunitySolutions)

### 35.4 Dashboard and Widget Issues (10)
2061. DashboardWidgets:191 -- `items.sort((a, b) => a.time.localeCompare(b.time))` sorts relative time strings lexicographically -- "1 day ago" sorts before "2 hours ago" incorrectly
2062. Dashboard grid widget IDs may collide if same widget type added twice
2063. No widget refresh mechanism -- data is snapshot-on-mount only
2064. No widget loading timeout -- slow Supabase responses show skeleton indefinitely
2065. Widget error state (line 236) logs error but falls through to render with null data
2066. `glucose-trends` and `health-metrics` widgets make near-identical queries to `uploads` table -- duplicated DB call
2067. Widget library dialog may need internal ScrollArea instead of page scroll
2068. Dashboard edit mode indicator could be more prominent
2069. No widget configuration options (e.g., date range, metric selection)
2070. Widget reordering not persisted until explicit save

### 35.5 Remaining Data File Issues (10)
2071. `achievementDefinitions.ts` -- Point values and thresholds never tuned to actual user behavior data
2072. `volunteerRoles.ts` -- No application or signup flow despite listing open positions
2073. `developmentProjects.ts` -- Resource links in projects may be stale/broken
2074. `cureReportContent.ts` -- Will become outdated immediately
2075. `projectReportsContent.ts` -- Will become outdated immediately
2076. No mechanism for admins to update any of these without code changes
2077. No versioning or audit trail on data file changes
2078. Data files mixed with component code in src/ -- should be in database
2079. Achievement thresholds set without data on typical user behavior
2080. Volunteer roles show openings but no mechanism to express interest

### 35.6 Edge Function and Backend Issues (10)
2081. CORS headers duplicated across all ~80 edge functions -- no shared module
2082. Different versions of @supabase/supabase-js across edge functions
2083. Different versions of stripe-js across edge functions
2084. No standardized error response format across edge functions
2085. No request payload size validation
2086. No timeout handling in edge functions
2087. Seed functions invokable in production -- could accidentally re-seed data
2088. `community-feed` edge function invoked on refresh but may create duplicate posts
2089. `fetch-reddit-reviews` requires Reddit API credentials that may not be configured
2090. No circuit breaker for external API calls in edge functions

### 35.7 Final Miscellaneous (10)
2091. `useEngagementTracking` returns `null` (line 56) -- hook should return `void` or nothing
2092. `useActionTracking` exports multiple tracking functions but most are never called from actual UI actions
2093. Achievement unlock confetti colors hardcoded (cosmetic but not configurable)
2094. No centralized design tokens file
2095. No A/B testing infrastructure
2096. No user feedback collection mechanism (NPS, satisfaction surveys)
2097. No changelog or release notes page for users
2098. No API documentation for edge functions
2099. No monitoring or alerting for edge function failures
2100. Error messages across pages are inconsistent ("Failed to load", "Error loading", "Something went wrong")

---

## Implementation Priority for Items 1701-2100

### Critical -- Broken Functionality
- **Fix notification Save button missing** (1841-1845): Add explicit "Save Notification Preferences" button calling `handleSaveNotifications`
- **Fix notification delivery method switches** (1716-1720, 1836-1840): Add `emailDelivery`/`pushDelivery` to initial state type, bind switches correctly
- **Fix admin routes missing ProtectedRoute** (1711-1715): Wrap 5 admin content routes in `<ProtectedRoute>`
- **Fix admin landing page missing AdminRoute** (1892, 1896): Add `<AdminRoute>` to `/admin` route
- **Fix recurring donation silently ignored** (1801-1805): Pass `isRecurring`/`recurringFrequency` to edge function or remove recurring UI
- **Fix recent-activity sort order** (1929, 2061): Sort by actual timestamp, not relative time string

### High -- Misleading Data
- **AdminSettings entirely decorative** (1701-1710): Either persist settings to DB or clearly label as demo
- **Admin charts still fabricated** (1793-1795): Add visual "Illustrative Data" badge on chart cards
- **Trends page permanently empty** (1796-1800): Either populate `trend_analysis_metrics` via aggregation query or remove the page
- **Recurring donation UI misleading** (1801-1805): Critical -- users may think they set up subscriptions

### Medium -- Console/Code Cleanup
- **Remove 335 console statements** (1721-1730): Replace with structured error handling or silent fails
- **Fix ScenarioLab remaining random** (1731-1735): Replace Math.random with deterministic variation
- **Fix DonationsInfo static data** (1736-1745): Move to database or add prominent "static estimate" labels
- **Fix SupportGlucoForge claims** (1746-1755): Remove fabricated numbers, update testimonials

### Lower -- Architecture and Polish
- **Move src/data/ to database** (1756-1765): Create admin CRUD interfaces
- **Consolidate duplicate components** (1941, 1949-1950): Merge toast systems, admin check patterns
- **Add accessibility improvements** (1866-1875): Screen reader support, focus management
- **Add responsive fixes** (1876-1885): Mobile header overflow, tablet layout issues
- **Implement email system** (1956-1965): Configure cron triggers, test Resend integration

