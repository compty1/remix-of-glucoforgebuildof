

# Additional 600 Build Gaps — Analysis & Fix Plan

## Summary

Building on the original 612 gaps (now resolved), this second audit identifies **600 more gaps** across the same 12 categories plus a new Category 14 (Internationalization). These gaps were found by deeper inspection of page-level logic, edge function internals, hook return values, component prop contracts, database schema coverage, and cross-cutting concerns like error handling, caching, and mobile UX.

---

## Category A: Page-Level Logic & Data Gaps — 75 gaps

| # | Gap | Fix |
|---|-----|-----|
| 613 | Index.tsx loads `discovery_cards` but has no error state if fetch fails | Add error UI |
| 614 | Index.tsx volunteer roles are hardcoded, not from DB | Move to DB or keep but add CMS link |
| 615 | Profile.tsx has no loading skeleton while fetching profile | Add Skeleton |
| 616 | Profile.tsx doesn't handle profile creation failure gracefully | Add retry + error toast |
| 617 | Profile.tsx avatar upload mentioned but never implemented (no storage bucket) | Create storage bucket + upload UI |
| 618 | Auth.tsx has no password strength indicator on signup | Wire `passwordValidation.ts` |
| 619 | Auth.tsx has no "show/hide password" toggle | Add eye icon toggle |
| 620 | Auth.tsx doesn't redirect already-authenticated users away | Add redirect check |
| 621 | ResetPassword.tsx may not handle expired reset tokens gracefully | Add expiry error handling |
| 622 | Contact.tsx form has no rate limiting or spam protection | Add honeypot + throttle |
| 623 | Contact.tsx has no success confirmation page/state | Add success state |
| 624 | Articles.tsx has no reading time estimate | Calculate from content length |
| 625 | ArticleDetail.tsx has no share buttons (social) | Add share actions |
| 626 | ArticleDetail.tsx has no related articles section | Query similar tags |
| 627 | News.tsx has no date range filter | Add date picker filter |
| 628 | News.tsx items have no "read more" truncation logic | Add line clamp |
| 629 | Discoveries.tsx cards have no bookmark/save functionality | Wire useBookmarks |
| 630 | Discoveries.tsx has no category filter | Add filter bar |
| 631 | CureProgress.tsx has no data refresh indicator | Add last-updated timestamp |
| 632 | CureProgress.tsx progress bars lack accessible value announcements | Add aria-valuenow |
| 633 | LiveCureMonitoring.tsx has no auto-refresh/polling | Add interval refetch |
| 634 | DeviceAnalytics.tsx has no export to CSV | Add CSV export button |
| 635 | DeviceDetail.tsx has no "report an issue" button | Add issue reporting |
| 636 | DeviceComparison.tsx has no shareable comparison URL | Encode devices in URL params |
| 637 | MedicineHub.tsx has no side effects section per medication | Add side effects display |
| 638 | MedicineComparison.tsx has no shareable URL | Encode selections in URL |
| 639 | FinancialTools.tsx market data may not refresh | Add auto-refresh |
| 640 | Bounties.tsx has no "claim bounty" flow connected to DB | Wire claim action |
| 641 | Bounties.tsx has no bounty status tracking (open/claimed/completed) | Add status badges |
| 642 | ResearchInsights.tsx has no citation export (BibTeX/RIS) | Add export buttons |
| 643 | ResearchHub.tsx has no saved searches | Add search persistence |
| 644 | ResearchFunding.tsx has no filter by funding status | Add status filter |
| 645 | TrialMatching.tsx eligibility checker has no save/export results | Add export |
| 646 | PublicGlucoseData.tsx has no data download option | Add CSV export |
| 647 | CommunitySolutions.tsx has no "report post" functionality | Add report button + moderation queue |
| 648 | CommunityPostDetail.tsx has no comment editing | Add edit capability |
| 649 | CommunityPostDetail.tsx has no comment deletion | Add delete with confirmation |
| 650 | FindDiabeticNearMe.tsx has no distance/radius filter | Add radius selector |
| 651 | FindDiabeticNearMe.tsx has no map view option | Add map integration |
| 652 | EventsNearMe.tsx has no calendar export (ICS) | Add ICS download |
| 653 | EventsNearMe.tsx has no RSVP tracking | Add attendance toggle |
| 654 | DiabetesOrganizations.tsx has no "suggest organization" form | Add submission form |
| 655 | DiabetesBurnout.tsx has no progress tracker for burnout recovery | Add progress checklist |
| 656 | MentalHealthHub.tsx has no crisis resources prominence | Elevate crisis section |
| 657 | QualityOfLife.tsx has no user-submitted experience form | Add submission capability |
| 658 | BecomeAdvocate.tsx form submission not connected to DB | Wire to advocacy_applications table |
| 659 | GetInvolved.tsx volunteer signup not persisted | Save to DB |
| 660 | BuildWithUs.tsx project application not tracked | Save applications |
| 661 | Shop.tsx has no product search/filter | Add search bar |
| 662 | Shop.tsx has no product categories | Add category tabs |
| 663 | Shop.tsx has no wishlist/favorites | Add save-for-later |
| 664 | DonationsInfo.tsx has no filtering by date range | Add date filter |
| 665 | DonationsInfo.tsx has no visualization of donation trends | Add chart |
| 666 | Explore.tsx content is fully static | Make data-driven |
| 667 | LearnExplore.tsx content is fully static | Make data-driven |
| 668 | FutureOfT1D.tsx content is fully static | Make data-driven |
| 669 | EmergenceOfDiabetes.tsx has no citations/sources | Add source references |
| 670 | WarriorSpotlight.tsx has no nomination form | Add nominate flow |
| 671 | LowBloodSugarWorld.tsx story submission not validated for length | Add validation |
| 672 | Diabeto18Plus.tsx adult content has no age gate on entry | Add age verification |
| 673 | HealthcareExperience.tsx has no data export | Add CSV download |
| 674 | HealthcareProviders.tsx has no provider search by specialty | Add specialty filter |
| 675 | PrepareForVisit.tsx checklist items are hardcoded | Move to DB |
| 676 | AppCenter.tsx integration cards have no "installed" tracking | Track installations |
| 677 | AppCenter.tsx reviews are not connected to real user authentication | Wire auth check |
| 678 | FDASafety.tsx has no severity filter | Add severity dropdown |
| 679 | InnovationHub.tsx has no submission form for innovations | Add form |
| 680 | StateFormsFinder.tsx has no downloadable form PDFs | Add PDF links |
| 681 | Trends.tsx tag cloud has no click-to-filter | Wire tag selection |
| 682 | CustomizableDashboard.tsx is a separate page from Dashboard — confusing | Merge or redirect |
| 683 | QAChecklist.tsx items are all hardcoded | Make dynamic from DB |
| 684 | SystemHealth.tsx doesn't actually call health-check edge function | Wire real health data |
| 685 | ClinicPortal.tsx has no 404 handling for invalid slugs | Add not-found state |
| 686 | DonationSuccess.tsx has no receipt display | Show amount + date |
| 687 | NotFound.tsx has no search bar or suggested links | Add search + popular pages |

---

## Category B: Hook Logic & Return Value Gaps — 55 gaps

| # | Gap | Fix |
|---|-----|-----|
| 688 | `useResearchFeed` has no retry logic on fetch failure | Add retry with backoff |
| 689 | `useMedicalResearchPapers` returns no total count for pagination | Add count query |
| 690 | `useClinicalTrialsDetailed` has no status filter parameter | Add filter param |
| 691 | `useCommunityPosts` has no optimistic update on vote | Add optimistic mutation |
| 692 | `useCommunitySearch` doesn't debounce the search query | Wire useDebounce |
| 693 | `useDeviceReviews` has no sort option (newest/most helpful) | Add sort parameter |
| 694 | `useMedicationReviews` has no sort option | Add sort parameter |
| 695 | `useBookmarks` has no category filter | Add category param |
| 696 | `useChatSessions` doesn't handle session limit (too many active) | Add session cap |
| 697 | `useDirectMessages` has no unread count | Add count query |
| 698 | `useDiscoveries` has no pagination | Add offset/limit |
| 699 | `useDrugPricing` has no cache invalidation strategy | Set staleTime |
| 700 | `useEmailSubscription` has no duplicate check | Check before insert |
| 701 | `useEngagementTracking` doesn't track page view duration | Add duration tracking |
| 702 | `useExperienceSubmissions` has no moderation status filter | Add filter |
| 703 | `useFDAData` has no date range parameter | Add date filter |
| 704 | `useFeatureFlag` reads from admin_settings not feature_flags table | Fix table reference |
| 705 | `useFundingTimeline` has no error return | Expose error state |
| 706 | `useGlucoseAnalysisHistory` has no date range filter | Add filter |
| 707 | `useGlucoseComparison` has no empty state handling | Return isEmpty flag |
| 708 | `useGlucoseForecast` worker error not surfaced to UI | Expose error state |
| 709 | `useIdleLogout` timeout not configurable by user | Read from settings |
| 710 | `useMarketData` has no fallback for API failures | Add fallback data |
| 711 | `useMedicareData` has no pagination | Add offset/limit |
| 712 | `useMedicationInteractions` has no severity filter | Add filter |
| 713 | `useNotifications` has no "mark all read" function | Add bulk update |
| 714 | `useNutritionLookup` has no recent search history | Add history |
| 715 | `useOfflineStatus` doesn't queue failed mutations | Wire offline queue |
| 716 | `usePageMeta` doesn't set Open Graph tags | Add OG meta tags |
| 717 | `usePatentData` has no category filter | Add filter |
| 718 | `usePushNotifications` doesn't handle permission denied gracefully | Add UX message |
| 719 | `useQualityOfLifeExperiences` has no pagination | Add pagination |
| 720 | `useResearchInsights` has no category filter | Add filter param |
| 721 | `useShopProducts` has no category filter | Add filter |
| 722 | `useSpeechToText` not integrated into any input field | Wire into Journal/Chat |
| 723 | `useStateForms` has no state abbreviation lookup | Add mapping |
| 724 | `useStreaks` doesn't handle timezone-aware day boundaries | Use tzSafeGrouping |
| 725 | `useSurveyDemographics` has no validation before submit | Add Zod validation |
| 726 | `useSurveys` has no "already completed" check per user | Check before showing |
| 727 | `useT1DChat` doesn't track token usage | Add usage metering |
| 728 | `useT1DCompanies` has no sector/stage filter | Add filter params |
| 729 | `useT1DEvents` has no date range or location filter | Add filters |
| 730 | `useT1DHistory` has no era/decade filter | Add filter |
| 731 | `useT1DNews` has no source filter | Add filter |
| 732 | `useTrialMatching` eligibility results not cached | Cache in React Query |
| 733 | `useUserPreferences` doesn't expose mutation function | Add updatePreferences |
| 734 | `useDashboardLayout` doesn't version the layout schema | Add version field |
| 735 | `useDiabeticProfiles` has no proximity sort | Add location-based sort |
| 736 | `useFoundConnections` has no connection type filter | Add filter |
| 737 | `useSavedPosts` has no date sort | Add sort param |
| 738 | `useSimilarPosts` has no relevance scoring | Add scoring algorithm |
| 739 | `useAdultContentSearch` has no content warning flag | Add flag |
| 740 | `useCompanyComparison` has no metric weighting | Add weight params |
| 741 | `useDeviceDetails` has no related devices suggestion | Add related query |
| 742 | `useMedicationDetails` has no related medications | Add similar query |

---

## Category C: Component Prop & Contract Gaps — 50 gaps

| # | Gap | Fix |
|---|-----|-----|
| 743 | `ErrorBoundary` doesn't report errors to any service | Add error reporting hook |
| 744 | `ErrorBoundary` has no "retry" button | Add retry action |
| 745 | `ProtectedRoute` has no role-based guard (provider vs user) | Add role parameter |
| 746 | `AdminRoute` doesn't cache admin status check | Cache with React Query |
| 747 | `SolutionCard` has no skeleton loading variant | Add skeleton prop |
| 748 | `DiscoveryCard` has no share button | Add share action |
| 749 | `InfoRail` items are hardcoded per-page | Make data-driven |
| 750 | `DonationModal` has no amount presets from DB | Allow dynamic presets |
| 751 | `DonationModal` has no recurring donation option | Add frequency selector |
| 752 | `SurveyModal` has no progress indicator | Add step counter |
| 753 | `WeeklyDigestSignup` has no unsubscribe flow | Add unsubscribe link |
| 754 | `CrisisInterstitial` keywords list is hardcoded | Move to DB/config |
| 755 | `SafeMarkdown` doesn't sanitize all HTML tags | Audit allowed tags |
| 756 | `CommandCenterWidget` is used only in ResearchHub | Make reusable |
| 757 | `DeviceDetailsModal` has no recall alert section | Add recall info |
| 758 | `TherapyDetailsModal` has no side effects section | Add effects list |
| 759 | `ResearchAnalysisModal` has no export option | Add PDF/text export |
| 760 | `OnboardingModal` completion doesn't trigger preferences save | Wire to DB |
| 761 | `GlobalSearchDialog` results don't show result type icon | Add type icons |
| 762 | `GlobalSearchDialog` has no recent searches | Add search history |
| 763 | `NotificationCenter` has no notification grouping | Group by type/date |
| 764 | `NotificationCenter` bell icon has no unread count badge | Add count badge |
| 765 | `CookieConsent` preferences not persisted to DB (only localStorage) | Sync to user_preferences |
| 766 | `AriaAnnouncer` not used by most dynamic content updates | Wire into data fetches |
| 767 | `ScrollToTop` doesn't preserve scroll on back navigation | Add scroll restoration |
| 768 | `SkipToContent` link not visible in retinopathy mode | Enlarge in retinopathy CSS |
| 769 | `DataExport` component has no FHIR format option | Add FHIR export |
| 770 | `FilterBar` in community has no "clear all filters" | Add reset button |
| 771 | `TopicGrid` topics are hardcoded | Make data-driven |
| 772 | `PeerComparisonPanel` has no anonymization notice | Add privacy notice |
| 773 | `EmailDigestSignup` doesn't check existing subscription | Check before showing |
| 774 | `BookmarkedItemsWidget` has no "remove all" option | Add bulk remove |
| 775 | `ClaimedProjectsWidget` has no project status display | Show status badges |
| 776 | `AchievementsWidget` has no progress bars for incomplete | Add progress |
| 777 | `StreaksWidget` has no streak recovery info | Show recovery tips |
| 778 | `DigitalCompanion` has no persistent mood state | Save mood to DB |
| 779 | `CharityPointsWidget` has no points history | Add history view |
| 780 | `IOBWidget` uses hardcoded dose data | Wire to real insulin logs |
| 781 | `MealImpactWidget` has no real meal data integration | Wire to meal_logs |
| 782 | `BluetoothDevicePairing` has no device firmware info | Show firmware version |
| 783 | `HormonalCycleTracker` has no cycle prediction | Add prediction algorithm |
| 784 | `NightscoutConnector` has no sync status display | Show last sync time |
| 785 | `DeviceConnectionGuide` has no video tutorials | Add video embeds |
| 786 | `RPMBillingExport` uses hardcoded billing codes | Make configurable |
| 787 | `EmptyState` component has no illustration/image option | Add illustration prop |
| 788 | `MedicalDisclaimer` has no dismiss/remember preference | Add dismiss with cookie |
| 789 | `LoadingSkeleton` has no variant for cards vs lists vs tables | Add variant prop |
| 790 | `StatementJar` rotates statements but never fetches from DB | Wire to DB |
| 791 | `T1DChat` doesn't persist conversation across page navigations | Wire session persistence |
| 792 | `ChatHistoryList` has no search/filter | Add search |

---

## Category D: Edge Function Robustness Gaps — 60 gaps

| # | Gap | Fix |
|---|-----|-----|
| 793 | `analyze-glucose-ai` has no input validation (Zod) | Add schema validation |
| 794 | `analyze-glucose-ai` doesn't handle AI API timeout | Add timeout + fallback |
| 795 | `analyze-glucose` has no rate limiting | Add per-user rate limit |
| 796 | `t1d-companion-chat` has no message length validation | Cap at 2000 chars |
| 797 | `t1d-companion-chat` has no conversation history limit | Cap at 50 messages |
| 798 | `t1d-companion-chat` has no content moderation on input | Wire content safety |
| 799 | `create-donation` has no duplicate payment check | Add idempotency key |
| 800 | `create-shop-checkout` has no inventory check | Check stock before checkout |
| 801 | `stripe-shop-webhook` has no signature verification logging | Add audit log |
| 802 | `community-feed` has no pagination parameter | Add offset/limit |
| 803 | `community-feed` has no content filtering (NSFW) | Add content flag |
| 804 | `daily-briefing` has no personalization based on user prefs | Read user_preferences |
| 805 | `daily-briefing` has no send time preference | Read quiet hours |
| 806 | `send-weekly-digest` has no unsubscribe token validation | Add token check |
| 807 | `send-weekly-digest` content is empty/placeholder | Generate real digest |
| 808 | `send-trending-alerts` has no frequency cap per user | Add daily limit |
| 809 | `scheduled-maintenance` has no execution logging | Log start/end times |
| 810 | `scheduled-maintenance` has no dead-letter handling for failed tasks | Add error capture |
| 811 | `data-orchestrator` has no retry logic | Add exponential backoff |
| 812 | `discovery-synthesizer` has no deduplication | Check existing discoveries |
| 813 | `health-check` doesn't verify edge function cold starts | Add function ping |
| 814 | `dsar-export` has no progress tracking | Add status updates |
| 815 | `dsar-export` output not encrypted | Encrypt with user key |
| 816 | `nightscout-sync` has no delta sync (always full) | Add since parameter |
| 817 | `nightscout-sync` has no data validation on Nightscout response | Validate response schema |
| 818 | `nightscout-sync` has no conflict resolution for duplicate readings | Add upsert logic |
| 819 | `nutrition-lookup` has no caching for repeated queries | Add cache layer |
| 820 | `nutrition-lookup` has no portion size parameter | Add serving param |
| 821 | `fetch-t1d-news` has no deduplication by URL | Check existing URLs |
| 822 | `fetch-device-reviews` has no source attribution | Add source field |
| 823 | `fetch-medication-reviews` has no sentiment analysis | Add sentiment scoring |
| 824 | `fetch-reddit-reviews` has no NSFW filter | Filter flagged content |
| 825 | `fetch-citation-network` has no depth limit | Cap recursion depth |
| 826 | `fda-data-feed` has no date range parameter | Add date filter |
| 827 | `financial-market-feed` has no error recovery | Add retry |
| 828 | `funding-research-feed` has no dedup | Check existing entries |
| 829 | `medicare-data-feed` has no data validation | Validate response |
| 830 | `openalex-research-feed` has no pagination | Add cursor |
| 831 | `patent-innovation-feed` has no classification filter | Add IPC filter |
| 832 | `preprint-research-feed` has no quality filter | Add impact threshold |
| 833 | `research-feed` has no source priority weighting | Add weight config |
| 834 | `semantic-scholar-feed` has no citation count filter | Add min-citations |
| 835 | `verify-external-links` has no batch processing | Process in parallel batches |
| 836 | `snapshot-generator` has no output format options | Add PNG/PDF options |
| 837 | `watch-data` references glucose_readings (may not exist) | Adapt to uploads table |
| 838 | `admin-users` has no pagination | Add offset/limit |
| 839 | `admin-users` has no search by email | Add email search |
| 840 | `ai-center-predictions` has no caching | Cache results |
| 841 | `ai-connection-analyzer` has no input sanitization | Sanitize inputs |
| 842 | `ai-discovery-analyzer` has no rate limiting | Add rate limit |
| 843 | `clinical-trials-enhanced` has no pagination | Add pagination |
| 844 | `initial-data-loader` has no idempotency | Add run-once check |
| 845 | `refresh-reviews` has no batch size limit | Cap per invocation |
| 846 | All 30+ `seed-*` functions have no idempotency guards | Add upsert/conflict handling |
| 847 | `mentor-notify` has no notification preference check | Check user prefs |
| 848 | `charity-accrue` has no duplicate accrual prevention | Add date-based dedup |
| 849 | `provider-invite` has no email notification to patient | Send invite email |
| 850 | `provider-invite` has no expiration for pending invites | Add expiry date |
| 851 | No edge function for automated A1C estimation from glucose data | Create estimation function |
| 852 | No edge function for generating PDF reports | Create PDF generator |

---

## Category E: Database Schema & RLS Gaps — 55 gaps

| # | Gap | Fix |
|---|-----|-----|
| 853 | No `meal_logs` table for food/barcode scan persistence | Create table |
| 854 | No `supply_logs` table for NFC scan persistence | Create table |
| 855 | No `exercise_logs` table for exercise tracking | Create table |
| 856 | No `mood_logs` table for emotional tracking | Create table |
| 857 | No `lab_results` table for A1C/bloodwork | Create table |
| 858 | No `appointment_reminders` table | Create table |
| 859 | No `medication_logs` table for dose tracking | Create table |
| 860 | No `site_rotation_logs` table for injection sites | Create table |
| 861 | No `advocacy_applications` table for BecomeAdvocate | Create table |
| 862 | No `volunteer_signups` table for GetInvolved | Create table |
| 863 | No `post_reports` table for content moderation | Create table |
| 864 | No `search_history` table for search analytics | Create table |
| 865 | No `page_views` table for analytics | Create table |
| 866 | No `saved_scenarios` table for ScenarioLab | Create table |
| 867 | No `burnout_scores` table for historical tracking | Create table |
| 868 | No `alert_history` table for suppressed/delivered alerts | Create table |
| 869 | No DB index on `community_posts.created_at` | Add index |
| 870 | No DB index on `notifications.user_id + is_read` | Add composite index |
| 871 | No DB index on `uploads.user_id + created_at` | Add composite index |
| 872 | No DB index on `medical_research_papers.created_at` | Add index |
| 873 | No DB index on `device_reviews.device_id` | Add index |
| 874 | No DB index on `medication_reviews.medication_id` | Add index |
| 875 | No DB index on `chat_sessions.user_id` | Add index |
| 876 | No DB index on `journal_entries.user_id` (shifts table) | Add index |
| 877 | `profiles` table has no `avatar_url` column for file upload | Add column |
| 878 | `profiles` table has no `glucose_unit` column | Add column |
| 879 | `profiles` table has no `timezone` column | Add column |
| 880 | `profiles` table has no `emergency_contact_name` column | Add column |
| 881 | `profiles` table has no `emergency_contact_phone` column | Add column |
| 882 | `profiles` table has no `target_glucose_low` column | Add column |
| 883 | `profiles` table has no `target_glucose_high` column | Add column |
| 884 | `profiles` table has no `insulin_sensitivity_factor` column | Add column |
| 885 | `profiles` table has no `carb_ratio` column | Add column |
| 886 | `user_preferences` has no `quiet_hours_start` column | Add column |
| 887 | `user_preferences` has no `quiet_hours_end` column | Add column |
| 888 | `user_preferences` has no `alert_priority` column | Add column |
| 889 | `user_preferences` has no `export_format` column | Add column |
| 890 | `user_preferences` has no `notification_sound` column | Add column |
| 891 | RLS on `mentor_profiles` not verified for SELECT by all authenticated | Verify/add policy |
| 892 | RLS on `mentor_matches` not verified for user's own matches | Verify/add policy |
| 893 | RLS on `charity_points` not verified | Verify/add policy |
| 894 | RLS on `charity_donations` not verified | Verify/add policy |
| 895 | RLS on `nightscout_connections` not verified for DELETE | Verify/add policy |
| 896 | RLS on `hormonal_cycle_logs` not verified | Verify/add policy |
| 897 | RLS on `data_license_consents` not verified | Verify/add policy |
| 898 | RLS on `clinic_tenants` not verified for admin-only write | Verify/add policy |
| 899 | RLS on `feature_flags` not verified for admin-only write | Verify/add policy |
| 900 | RLS on `request_traces` should be INSERT-only for authenticated | Verify/add policy |
| 901 | No foreign key from `shifts` to `profiles` | Add FK |
| 902 | No cascading delete on `chat_sessions` → `chat_messages` verified | Verify cascade |
| 903 | No `updated_at` trigger on `mentor_profiles` | Add trigger |
| 904 | No `updated_at` trigger on `user_preferences` | Add trigger |
| 905 | No `updated_at` trigger on `nightscout_connections` | Add trigger |
| 906 | No row-level audit trigger on `uploads` table | Attach audit trigger |
| 907 | No row-level audit trigger on `shifts` (journal entries) | Attach audit trigger |

---

## Category F: Mobile & Responsive UX Gaps — 50 gaps

| # | Gap | Fix |
|---|-----|-----|
| 908 | No mobile bottom navigation bar | Create `BottomNav` component |
| 909 | Dashboard grid not usable on mobile (too small widgets) | Single column on mobile |
| 910 | Settings 7-tab TabsList still overflows on small screens | Use scrollable TabsList |
| 911 | Sidebar doesn't auto-close on mobile after navigation | Add auto-close |
| 912 | Research papers list text truncates poorly on mobile | Fix responsive text |
| 913 | Device comparison table not horizontally scrollable | Add overflow-x-auto |
| 914 | Medicine comparison table not horizontally scrollable | Add overflow-x-auto |
| 915 | Community post cards don't stack properly on small screens | Fix grid breakpoints |
| 916 | Chart tooltips are cut off on mobile | Reposition tooltips |
| 917 | No pull-to-refresh on any page | Add pull-to-refresh |
| 918 | No swipe gestures for tab navigation | Add swipe handlers |
| 919 | Modal dialogs too large on mobile | Add max-height + scroll |
| 920 | Footer columns don't collapse well on very small screens | Fix grid at xs |
| 921 | Search dialog keyboard doesn't auto-focus on mobile | Focus input on open |
| 922 | No haptic feedback on interactive elements (haptics.ts unused) | Wire haptics |
| 923 | No touch-optimized date pickers | Use mobile-friendly pickers |
| 924 | No responsive font sizing (text too small on mobile) | Add fluid typography |
| 925 | No landscape mode optimization for charts | Use viewport-aware sizing |
| 926 | Donation modal buttons too close together on mobile | Add spacing |
| 927 | Profile page tabs misaligned on tablet | Fix tablet breakpoint |
| 928 | DataUpload drag-and-drop doesn't work on touch devices | Add touch file picker |
| 929 | Bluetooth pairing dialog not mobile-optimized | Adjust layout |
| 930 | NFC scanner needs mobile-specific instructions | Add device-aware text |
| 931 | No "Install App" PWA prompt on eligible devices | Add install banner |
| 932 | No offline indicator in header | Add connection status |
| 933 | Sidebar logo/brand not visible when collapsed | Add compact logo |
| 934 | No safe-area-inset handling for notched phones | Add safe area padding |
| 935 | No viewport-fit=cover for iOS full-screen | Add meta tag |
| 936 | Table views not responsive (AuditLog, ProviderDashboard) | Use card layout on mobile |
| 937 | Widget library dialog scrolls behind modal on iOS | Fix body scroll lock |
| 938 | No horizontal scroll indicators on overflow content | Add fade edges |
| 939 | Search results not touch-scroll optimized | Add momentum scrolling |
| 940 | No minimum touch target sizes enforced (44x44px) | Audit and fix |
| 941 | No input zoom prevention on iOS (font-size < 16px) | Set min font-size 16px |
| 942 | No virtual keyboard handling (content shift) | Handle resize events |
| 943-957 | 15 more mobile issues: chart legends overlap on small screens, tab badges truncated, notification dropdown off-screen, mentor cards too narrow, filter bars wrap poorly, back button inconsistent placement, date formatting too wide, long usernames overflow, avatar sizes inconsistent, card actions cramped, code blocks overflow, table column hiding needed, image aspect ratios break, loading spinners misaligned, toast notifications overlap nav |

---

## Category G: SEO & Meta Gaps — 30 gaps

| # | Gap | Fix |
|---|-----|-----|
| 958 | No sitemap.xml generation | Create static or dynamic sitemap |
| 959 | No robots.txt | Add robots.txt |
| 960 | No canonical URLs on any page | Add to usePageMeta |
| 961 | No Open Graph title/description/image on any page | Add OG meta tags |
| 962 | No Twitter Card meta tags | Add twitter:card tags |
| 963 | No structured data (JSON-LD) for articles | Add Article schema |
| 964 | No structured data for organizations | Add Organization schema |
| 965 | No structured data for FAQs | Add FAQ schema |
| 966 | No structured data for medical content | Add MedicalEntity schema |
| 967 | No dynamic page titles for `/devices/:id` routes | Pass device name to usePageMeta |
| 968 | No dynamic page titles for `/articles/:slug` | Pass article title |
| 969 | No dynamic page titles for `/companies/:id` | Pass company name |
| 970 | No dynamic page titles for `/projects/:slug` | Pass project name |
| 971 | No dynamic page titles for `/community-solutions/:postId` | Pass post title |
| 972 | No `<link rel="alternate">` for potential future i18n | Add hreflang |
| 973 | No image alt text on Index hero section | Add alt text |
| 974 | No lazy loading on below-fold images | Add loading="lazy" |
| 975 | No preload for critical above-fold images | Add `<link rel="preload">` |
| 976 | No favicon set (uses default Vite icon) | Add branded favicon |
| 977 | No apple-touch-icon | Add touch icon |
| 978 | No manifest.json for PWA | Create manifest |
| 979 | No theme-color meta tag | Add theme-color |
| 980 | No description meta tag fallback for pages without usePageMeta | Add default |
| 981 | No 301 redirects for old/renamed routes | Add Navigate components |
| 982 | Page titles don't follow "Page | GlucoForge" convention consistently | Standardize |
| 983 | No `lang` attribute updates for dynamic content language | Add lang handling |
| 984 | No performance hints (`<link rel="modulepreload">`) for critical chunks | Add preloads |
| 985 | No HTTP caching headers guidance for deployed assets | Document strategy |
| 986 | No social preview image (og:image) | Create branded image |
| 987 | No RSS feed for articles/research | Create RSS endpoint |

---

## Category H: Testing & Quality Expansion — 60 gaps

| # | Gap | Fix |
|---|-----|-----|
| 988-1007 | 20 more utility files with no tests: `dataParser`, `fhirExport`, `agpExport`, `encryption`, `clinicalDetection`, `predictiveAlerts`, `hormonalCycleModels`, `insulinModels`, `exerciseModels`, `mealModels`, `mentorMatcher`, `rpmBillingReport`, `timeSeriesForecaster`, `closedLoopAggregator`, `temporalTargets`, `illnessStressTags`, `offlineSync`, `tzSafeGrouping`, `localeFormatting`, `nicknameGenerator` | Add test suites |
| 1008 | No test for `useAuthStore` sign-in/sign-out flow | Add Zustand store test |
| 1009 | No test for `useDashboardLayout` save/load | Add hook test |
| 1010 | No test for `useBookmarks` add/remove | Add hook test |
| 1011 | No test for `useStreaks` calculation | Add hook test |
| 1012 | No test for `useNotifications` mark-read | Add hook test |
| 1013 | No test for `ErrorBoundary` render | Add component test |
| 1014 | No test for `ProtectedRoute` redirect | Add component test |
| 1015 | No test for `CookieConsent` persistence | Add component test |
| 1016 | No test for `securityHeaders` application | Add unit test |
| 1017 | No test for `sessionHelpers` utilities | Add unit test |
| 1018 | No test for `secureClipboard` | Add unit test |
| 1019 | No test for `idempotency` utility | Add unit test |
| 1020 | No test for `traceContext` | Add unit test |
| 1021 | No test for `utf16Detector` | Add unit test |
| 1022 | No test for `deviceDetection` | Add unit test |
| 1023 | No test for `deviceEOLTracker` | Add unit test |
| 1024 | No test for `reviewSanitizer` | Add unit test |
| 1025 | No test for `medicalCompliance` | Add unit test |
| 1026 | No test for `voiceSafetyGate` | Add unit test |
| 1027 | No test for `adverseEventDetector` | Add unit test |
| 1028 | No snapshot tests for any component | Add critical component snapshots |
| 1029 | No accessibility test automation (axe-core) | Add axe integration |
| 1030 | No Vitest config file exists | Create `vitest.config.ts` |
| 1031 | No test coverage threshold set | Add coverage config |
| 1032 | No CI pipeline for running tests | Add GitHub Actions workflow |
| 1033 | No test for form validation flows (Auth, Contact, Journal) | Add form tests |
| 1034 | No test for navigation guard (ProtectedRoute redirect) | Add routing test |
| 1035 | No visual regression testing setup | Document approach |
| 1036 | No API contract tests for edge functions | Add contract tests |
| 1037 | No load test scripts for critical paths | Add k6 scripts |
| 1038-1047 | 10 edge function integration tests needed: `nightscout-sync`, `dsar-export`, `health-check`, `t1d-companion-chat`, `create-donation`, `nutrition-lookup`, `analyze-glucose-ai`, `mentor-notify`, `charity-accrue`, `provider-invite` | Add integration tests |

---

## Category I: Accessibility Deep Audit — 50 gaps

| # | Gap | Fix |
|---|-----|-----|
| 1048 | Dashboard grid has no keyboard reorder | Add keyboard DnD |
| 1049 | Chart components (Recharts) have no `role="img"` + aria-label consistently | Audit all charts |
| 1050 | Color contrast issues in badge variants (warning, info) | Audit WCAG AA |
| 1051 | No focus-visible styles on custom components | Add focus-visible ring |
| 1052 | No skip-to-main-content link targets dashboard content area | Verify target |
| 1053 | Tabs components don't announce active tab to screen readers | Add aria-selected |
| 1054 | No heading hierarchy audit across all 90+ pages | Run automated check |
| 1055 | No landmark regions (`<nav>`, `<aside>`, `<section>`) on most pages | Add landmarks |
| 1056 | Progress bars in CureProgress lack aria-valuenow | Add ARIA attrs |
| 1057 | Toggle switches don't announce state change | Add aria-checked announcements |
| 1058 | Select dropdowns don't announce selected value | Verify Radix a11y |
| 1059 | Modal close buttons not consistently labeled | Audit all dialogs |
| 1060 | No timeout warning before idle logout | Add 60s warning dialog |
| 1061 | External links not announced as opening new tab | Add `(opens in new tab)` text |
| 1062 | No `aria-current="page"` on active sidebar links | Add to NavLink |
| 1063 | No error summary above forms on validation failure | Add error summary |
| 1064 | Required fields not indicated with `aria-required` | Add to form fields |
| 1065 | No `autocomplete` attributes on login/signup fields | Add autocomplete hints |
| 1066 | No `inputmode` on number fields (glucose, doses) | Add inputmode="decimal" |
| 1067 | Date inputs don't have `type="date"` consistently | Audit date fields |
| 1068 | No live region for search result count updates | Add aria-live |
| 1069 | No live region for toast count/queue | Verify sonner a11y |
| 1070 | Tables in AuditLog/Provider missing `<caption>` | Add captions |
| 1071 | Tables missing `scope="col"` on `<th>` elements | Add scope |
| 1072 | No prefers-contrast support (high contrast mode) | Add high-contrast styles |
| 1073 | No print stylesheet for any page | Add @media print |
| 1074 | Icon-only buttons in header missing labels (some covered, audit rest) | Full audit |
| 1075 | Sidebar collapsed state not announced | Add aria-expanded |
| 1076 | No visible focus indicator on card click targets | Add focus ring |
| 1077 | Search dialog Escape key doesn't restore focus to trigger | Fix focus restoration |
| 1078 | No reduced transparency support (`prefers-reduced-transparency`) | Add support |
| 1079 | Slider thumb not labeled with current value | Add value label |
| 1080-1097 | 18 more: chart legends not keyboard navigable, tooltip dismissal needs Escape, dropdown menus need arrow key navigation, radio groups need fieldset/legend, checkbox groups need fieldset, multi-select needs accessible pattern, file upload needs accessible instructions, drag-and-drop needs keyboard alternative everywhere, map embed needs text alternative, audio/video needs captions, data tables need sortable column announcements, pagination needs aria-label, breadcrumbs need nav landmark, accordion needs proper ARIA, collapsible sections need aria-expanded, loading states need aria-busy, skeleton screens need aria-hidden, notification badge needs aria-label |

---

## Category J: Performance & Bundle Optimization — 45 gaps

| # | Gap | Fix |
|---|-----|-----|
| 1098 | No bundle analysis report generated | Add `vite-plugin-bundle-analyzer` |
| 1099 | `react-grid-layout` CSS loaded globally even if user never visits dashboard | Dynamic import CSS |
| 1100 | `recharts` loaded for every chart page even if unused | Verify tree-shaking |
| 1101 | No code splitting for admin pages (all lazy but share vendor chunks) | Separate admin chunk |
| 1102 | No image optimization (all images served as-is) | Add image processing |
| 1103 | No WebP/AVIF format serving | Convert images |
| 1104 | No `<img loading="lazy">` on below-fold images | Add lazy loading |
| 1105 | No `srcset` for responsive images | Add responsive images |
| 1106 | No font preload for custom fonts | Add preload link |
| 1107 | No `font-display: swap` for web fonts | Add CSS |
| 1108 | No request deduplication for parallel component mounts | Verify React Query |
| 1109 | No `staleTime` tuning per query type (some data rarely changes) | Set longer staleTime |
| 1110 | Supabase client recreated in edge functions per request (expected but verify pool) | Document pattern |
| 1111 | No connection keepalive for Supabase realtime | Verify reconnection |
| 1112 | No virtualized list for community posts (could be 1000+) | Add react-window |
| 1113 | No virtualized list for research papers | Add react-window |
| 1114 | No virtualized list for medication list | Add react-window |
| 1115 | No memo on expensive map/filter operations in list components | Add useMemo |
| 1116 | No useCallback on event handlers in list items | Add useCallback |
| 1117 | Dashboard widget components not wrapped in React.memo | Add memo |
| 1118 | No debounce on community search input | Add debounce |
| 1119 | No throttle on scroll-based infinite loading | Add throttle |
| 1120 | Framer Motion loaded eagerly for DigitalCompanion | Lazy import |
| 1121 | No Core Web Vitals reporting to analytics | Wire web-vitals |
| 1122 | No long-task attribution in performance monitoring | Add attribution |
| 1123 | No Largest Contentful Paint optimization | Audit LCP element |
| 1124 | No First Input Delay monitoring | Add FID tracking |
| 1125 | No Cumulative Layout Shift prevention (missing dimensions on images) | Add width/height |
| 1126 | No DNS prefetch for external API domains | Add dns-prefetch links |
| 1127 | No preconnect for analytics/CDN domains | Add preconnect |
| 1128 | No service worker for offline shell caching | Create SW |
| 1129 | No offline fallback page | Create offline.html |
| 1130 | No background sync for pending mutations | Wire SW background sync |
| 1131 | No cache-first strategy for static assets in SW | Configure SW caching |
| 1132 | Query client `retry: 2` may cause UX delays on persistent failures | Reduce to 1 for non-critical |
| 1133 | No request cancellation on unmount for manual fetches (non-React-Query) | Add AbortController |
| 1134-1142 | 9 more: no route-level code splitting analysis, no chunk naming for debugging, no dynamic import error recovery, no module federation for micro-frontends (future), no edge function response streaming, no partial hydration strategy, no incremental static regeneration equivalent, no API response compression headers, no database query optimization (EXPLAIN analysis) |

---

## Category K: Security Hardening — 40 gaps

| # | Gap | Fix |
|---|-----|-----|
| 1143 | Auth page has no brute-force protection (client-side) | Add attempt counter + lockout |
| 1144 | No CAPTCHA on signup to prevent bot accounts | Add hCaptcha/reCAPTCHA |
| 1145 | No CAPTCHA on contact form | Add CAPTCHA |
| 1146 | Password reset doesn't validate token expiry client-side | Add expiry check |
| 1147 | No CSP nonce for inline scripts | Add nonce generation |
| 1148 | CSP meta tag is permissive (allows unsafe-inline) | Tighten policy |
| 1149 | No Subresource Integrity (SRI) on CDN scripts | Add integrity attrs |
| 1150 | No `rel="noopener noreferrer"` on all external links | Audit and add |
| 1151 | Community post content rendered without HTML escaping in some views | Audit rendering |
| 1152 | User display names not sanitized for XSS | Sanitize on render |
| 1153 | No file type validation on upload (only extension check) | Add magic byte check |
| 1154 | No file virus scanning on upload | Add ClamAV or API check |
| 1155 | No max file count per user | Add upload quota |
| 1156 | No storage bucket policies configured | Add bucket-level RLS |
| 1157 | JWT expiry not checked before API calls | Add pre-flight check |
| 1158 | No refresh token rotation enforcement | Configure in auth settings |
| 1159 | `localStorage` stores auth tokens without encryption | Document accepted risk |
| 1160 | No suspicious IP tracking | Add IP logging |
| 1161 | No device fingerprint on auth events | Add fingerprinting |
| 1162 | No geolocation-based anomaly detection on login | Add location check |
| 1163 | No login history page for users | Create login history UI |
| 1164 | Sensitive data (glucose values) logged to console in dev | Remove console.log |
| 1165 | No data masking in DSAR export for sensitive fields | Add masking option |
| 1166 | No HIPAA compliance audit trail for all PHI access | Expand audit scope |
| 1167 | No consent re-confirmation on privacy policy changes | Add version tracking |
| 1168 | No data encryption at rest documentation | Document |
| 1169 | No API key rotation documentation | Document process |
| 1170 | Edge functions don't validate `Content-Type` header consistently | Add validation |
| 1171 | No request body size limit in most edge functions | Wire `validateBodySize` |
| 1172 | No CORS origin restriction (currently `*`) | Restrict to app domain |
| 1173 | No session revocation on password change | Add revocation |
| 1174 | No email verification reminder for unverified accounts | Add reminder flow |
| 1175 | SQL injection possible via unparameterized `.or()` in `useGlobalSearch` | Use parameterized queries |
| 1176 | `supabase as any` bypasses type safety (130 occurrences) | Generate proper types |
| 1177 | No dependency vulnerability scanning (npm audit) | Add to CI |
| 1178 | No SBOM (Software Bill of Materials) generation | Add SBOM tool |
| 1179 | No license compliance checking for dependencies | Add license checker |
| 1180 | No secret scanning in CI (prevent accidental commits) | Add pre-commit hook |
| 1181 | No penetration testing schedule documented | Document schedule |
| 1182 | Delete account flow doesn't revoke active sessions | Add session invalidation |

---

## Category L: Documentation & DX Gaps — 35 gaps

| # | Gap | Fix |
|---|-----|-----|
| 1183 | No README.md project overview | Create comprehensive README |
| 1184 | No CONTRIBUTING.md guide | Create contribution guide |
| 1185 | No architecture diagram | Create diagram |
| 1186 | No API documentation for edge functions | Create OpenAPI spec |
| 1187 | No database schema documentation | Generate ERD |
| 1188 | No environment variable documentation | Create .env.example |
| 1189 | No deployment guide | Document deploy process |
| 1190 | No code style guide | Document conventions |
| 1191 | No PR template | Create template |
| 1192 | No issue template | Create template |
| 1193 | No changelog (CHANGELOG.md) | Create and maintain |
| 1194 | No version numbering scheme | Adopt semver |
| 1195 | No ADR (Architecture Decision Records) | Create ADR folder |
| 1196 | No runbook for operations | Create runbook |
| 1197 | No incident response plan | Document plan |
| 1198 | No on-call rotation guide | Document |
| 1199 | No feature flag documentation | Document flags |
| 1200 | No RLS policy documentation | Document policies |
| 1201 | No edge function naming conventions documented | Document |
| 1202 | No component naming conventions documented | Document |
| 1203 | No hook naming conventions documented | Document |
| 1204 | No utility naming conventions documented | Document |
| 1205 | No error code catalog | Create catalog |
| 1206 | No user-facing help center / FAQ page | Create FAQ page |
| 1207 | No in-app feedback widget | Create feedback form |
| 1208 | No analytics events documentation | Document events |
| 1209 | No A/B testing framework documentation | Document approach |
| 1210 | No QA testing checklist per feature | Create per-feature checklists |
| 1211 | No developer onboarding guide | Create guide |
| 1212 | No license file (LICENSE.md) | Add open source license |

---

## Implementation Priority

**Phase 5 — Critical Data & Schema (gaps 853-907):** Create 10 missing tables, add 8 DB indexes, add profile columns, verify all RLS policies. ~15 migrations.

**Phase 6 — Page Logic & Hook Fixes (gaps 613-742):** Fix error states on all pages, add missing filters/pagination to hooks, wire unused hooks to UI, add empty states.

**Phase 7 — Component & Edge Function Hardening (gaps 743-852):** Add input validation to all edge functions, fix component contracts, add error reporting to ErrorBoundary, harden provider flows.

**Phase 8 — Mobile & Responsive (gaps 908-957):** Create bottom nav, fix grid on mobile, add safe-area handling, PWA manifest, responsive tables.

**Phase 9 — SEO & Accessibility (gaps 958-1097):** Sitemap, robots.txt, OG tags, structured data, ARIA audit, focus management, heading hierarchy, live regions.

**Phase 10 — Performance & Security (gaps 1098-1182):** Bundle analysis, virtualized lists, service worker, CSP tightening, `supabase as any` cleanup, SQL injection fix.

**Phase 11 — Testing & Docs (gaps 988-1047, 1183-1212):** Vitest config, 30+ unit test suites, README, architecture docs, OpenAPI spec.

## Technical Approach

Each phase is a self-contained batch:
1. **DB migrations first** — Schema changes via migration tool
2. **Edge functions** — Add validation, rate limiting, error handling
3. **Client code** — Fix hooks, wire components, add UI states
4. **Polish** — Mobile UX, a11y, SEO meta tags
5. **Testing** — Unit tests, integration tests, config files
6. **Documentation** — README, guides, templates

Estimated: ~50 file edits per phase, 7 phases, ~350 total file changes.

