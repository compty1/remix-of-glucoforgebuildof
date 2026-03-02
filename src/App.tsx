import React, { useEffect, Suspense, lazy } from "react";
// Fix 7.5: Removed duplicate Toaster (radix) — keeping only Sonner
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEngagementTracking } from "@/hooks/useEngagementTracking";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import { useDynamicViewportHeight } from "@/hooks/useDynamicViewportHeight";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Eagerly loaded critical routes
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy loaded routes for code splitting (items 1476-1478)
const Journey = lazy(() => import("./pages/Journey"));
const About = lazy(() => import("./pages/About"));
const Fixes = lazy(() => import("./pages/Fixes"));
const Discoveries = lazy(() => import("./pages/Discoveries"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Accessibility = lazy(() => import("./pages/Accessibility"));
const Contact = lazy(() => import("./pages/Contact"));
const Profile = lazy(() => import("./pages/Profile"));
const Insights = lazy(() => import("./pages/Insights"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LiveCureMonitoring = lazy(() => import("./pages/LiveCureMonitoring"));
const DeviceAnalytics = lazy(() => import("./pages/DeviceAnalytics"));
const ResearchHub = lazy(() => import("./pages/ResearchHub"));
const CitizenScience = lazy(() => import("./pages/CitizenScience"));
const DataUpload = lazy(() => import("./pages/DataUpload"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Donate = lazy(() => import("./pages/donate/Donate"));
const DonateSuccess = lazy(() => import("./pages/donate/DonateSuccess"));
const DonateCancel = lazy(() => import("./pages/donate/DonateCancel"));
const CureProgress = lazy(() => import("./pages/CureProgress"));
// GlucoseUpload is now a redirect to /data-upload (Issue 104)
const Journal = lazy(() => import("./pages/Journal"));
const Bounties = lazy(() => import("./pages/Bounties"));
const FinancialTools = lazy(() => import("./pages/FinancialTools"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminIntegrations = lazy(() => import("./pages/admin/AdminIntegrations"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const MentalHealthHub = lazy(() => import("./pages/MentalHealthHub"));
const ScenarioLab = lazy(() => import("./pages/ScenarioLab"));
const Trends = lazy(() => import("./pages/Trends"));
const Settings = lazy(() => import("./pages/Settings"));
const PrepareForVisit = lazy(() => import("./pages/PrepareForVisit"));
const CustomizableDashboard = lazy(() => import("./pages/CustomizableDashboard"));
const Discover = lazy(() => import("./pages/Discover"));
const DiscoverDetails = lazy(() => import("./pages/DiscoverDetails"));
const QAChecklist = lazy(() => import("./pages/QAChecklist"));
const FDASafety = lazy(() => import("./pages/FDASafety"));
const InnovationHub = lazy(() => import("./pages/InnovationHub"));
const ResearchFunding = lazy(() => import("./pages/ResearchFunding"));
const ResearchInsights = lazy(() => import("./pages/ResearchInsights"));
const DeviceDetail = lazy(() => import("./pages/DeviceDetail"));
const DeviceComparison = lazy(() => import("./pages/DeviceComparison"));
const T1DCompanion = lazy(() => import("./pages/T1DCompanion"));
const CommunitySolutions = lazy(() => import("./pages/CommunitySolutions"));
const CommunityPostDetail = lazy(() => import("./pages/CommunityPostDetail"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Companies = lazy(() => import("./pages/Companies"));
const CompanyDetail = lazy(() => import("./pages/CompanyDetail"));
const CompanyComparison = lazy(() => import("./pages/CompanyComparison"));
const Resources = lazy(() => import("./pages/Resources"));
const StateFormsFinder = lazy(() => import("./pages/StateFormsFinder"));
const News = lazy(() => import("./pages/News"));
const BuildWithUs = lazy(() => import("./pages/BuildWithUs"));
const DevelopmentProjectDetail = lazy(() => import("./pages/DevelopmentProjectDetail"));
const GetInvolved = lazy(() => import("./pages/GetInvolved"));
const MedicineHub = lazy(() => import("./pages/MedicineHub"));
const MedicineComparison = lazy(() => import("./pages/MedicineComparison"));
const TrialMatching = lazy(() => import("./pages/TrialMatching"));
const QualityOfLife = lazy(() => import("./pages/QualityOfLife"));
import { AdminRoute } from "./components/admin/AdminRoute";

// Lazy loaded phase routes
const LowBloodSugarWorld = lazy(() => import("./pages/LowBloodSugarWorld"));
const Diabeto18Plus = lazy(() => import("./pages/Diabeto18Plus"));
const Articles = lazy(() => import("./pages/Articles"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const HealthcareExperience = lazy(() => import("./pages/HealthcareExperience"));
const HealthcareProviders = lazy(() => import("./pages/HealthcareProviders"));
const AppCenter = lazy(() => import("./pages/AppCenter"));
const EmergenceOfDiabetes = lazy(() => import("./pages/EmergenceOfDiabetes"));
const LearnExplore = lazy(() => import("./pages/LearnExplore"));
const WarriorSpotlight = lazy(() => import("./pages/WarriorSpotlight"));
const Shop = lazy(() => import("./pages/Shop"));
const PublicGlucoseData = lazy(() => import("./pages/PublicGlucoseData"));
const ShopSuccess = lazy(() => import("./pages/shop/ShopSuccess"));
const ShopCancel = lazy(() => import("./pages/shop/ShopCancel"));

const AdminArticles = lazy(() => import("./pages/admin/AdminArticles"));
const AdminLowSugarStories = lazy(() => import("./pages/admin/AdminLowSugarStories"));
const AdminWarriors = lazy(() => import("./pages/admin/AdminWarriors"));
const AdminShop = lazy(() => import("./pages/admin/AdminShop"));
const ContentModeration = lazy(() => import("./pages/admin/ContentModeration"));

const AICenter = lazy(() => import("./pages/AICenter"));
const DiabetesOrganizations = lazy(() => import("./pages/DiabetesOrganizations"));
const BecomeAdvocate = lazy(() => import("./pages/BecomeAdvocate"));
const EventsNearMe = lazy(() => import("./pages/EventsNearMe"));
const FutureOfT1D = lazy(() => import("./pages/FutureOfT1D"));
const Explore = lazy(() => import("./pages/Explore"));
const YourExperience = lazy(() => import("./pages/YourExperience"));
const DonationsInfo = lazy(() => import("./pages/DonationsInfo"));
const SupportGlucoForge = lazy(() => import("./pages/SupportGlucoForge"));
const DiabetesBurnout = lazy(() => import("./pages/DiabetesBurnout"));
const FindDiabeticNearMe = lazy(() => import("./pages/FindDiabeticNearMe"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading page">
    <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
    <span className="sr-only">Loading...</span>
  </div>
);

// Fix 7.1: Configure QueryClient with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false, // Fix 7.4: Prevent refetch spam on tab switch
    },
    mutations: {
      onError: (err: Error) => toast.error(err.message),
    },
  },
});

// Inner component that uses hooks requiring QueryClient
const AppContent = () => {
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  
  // Track user engagement (visits, streaks) - must be inside QueryClientProvider
  useEngagementTracking();

  // Fix 8.1: Auto-logout after 30 minutes of inactivity (medical data security)
  useIdleLogout();

  // Phase 6.27: Dynamic viewport height for mobile browser chrome
  useDynamicViewportHeight();

  // Phase 5.8 / 7.28: Clear query cache on logout
  useEffect(() => {
    if (!user) {
      queryClient.clear();
    }
  }, [user, queryClient]);

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  // Session expiry handling — notify user when token refresh fails (Issue 119)
  // Fix 5.3: Check manual logout intent to avoid confusing "session expired" toast
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESHED') return; // success
      if (event === 'SIGNED_OUT') {
        // Check if this was an unexpected sign-out (e.g., expired token)
        const wasManual = useAuthStore.getState()._manualSignOut;
        if (wasManual) {
          // Reset the flag
          useAuthStore.setState({ _manualSignOut: false });
          return;
        }
        try {
          const wasLoggedIn = sessionStorage.getItem('gf_was_logged_in');
          if (wasLoggedIn) {
            sessionStorage.removeItem('gf_was_logged_in');
            toast.warning('Your session has expired. Please sign in again.');
          }
        } catch { /* storage blocked */ }
      }
      if (event === 'SIGNED_IN') {
        try {
          sessionStorage.setItem('gf_was_logged_in', '1');
        } catch { /* storage blocked */ }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Issue 232: Handle unhandled promise rejections not caught by ErrorBoundary
  // Fix 7.4: Improved cross-browser error message filtering
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || String(event.reason) || 'An unexpected error occurred';
      // Filter out network errors, aborted fetches, and React Query cancellations
      const ignoredPatterns = [
        'NetworkError', 'Failed to fetch', 'Load failed', // Safari
        'The network connection was lost', // Firefox
        'AbortError', 'The user aborted a request', 'cancelled',
        'The operation was aborted', 'signal is aborted'
      ];
      const shouldIgnore = ignoredPatterns.some(p => msg.includes(p));
      if (!shouldIgnore) {
        toast.error(`Unexpected error: ${msg.slice(0, 100)}`);
      }
      event.preventDefault();
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/about" element={<About />} />
        <Route path="/fixes" element={<Fixes />} />
        <Route path="/discoveries" element={<Discoveries />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/donate/success" element={<DonateSuccess />} />
        <Route path="/donate/cancel" element={<DonateCancel />} />
        <Route path="/cure-progress" element={<CureProgress />} />
        <Route path="/insights" element={<Insights />} />
        {/* Redirect legacy glucose upload route to the canonical data-upload page (Issue 104) */}
        <Route path="/glucose/upload" element={<Navigate to="/data-upload" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/cure" element={<LiveCureMonitoring />} />
        <Route path="/devices" element={<DeviceAnalytics />} />
        <Route path="/devices/:deviceId" element={<DeviceDetail />} />
        <Route path="/devices/compare" element={<DeviceComparison />} />
        <Route path="/research" element={<ResearchHub />} />
        <Route path="/surveys" element={<ProtectedRoute><CitizenScience /></ProtectedRoute>} />
        <Route path="/data-upload" element={<ProtectedRoute><DataUpload /></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
        <Route path="/bounties" element={<ProtectedRoute><Bounties /></ProtectedRoute>} />
        <Route path="/financial-tools" element={<ProtectedRoute><FinancialTools /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><AdminUsers /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute><AdminRoute><AdminContent /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/integrations" element={<ProtectedRoute><AdminRoute><AdminIntegrations /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminRoute><AdminSettings /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AdminRoute><AdminAnalytics /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute><AdminRoute><AdminProjects /></AdminRoute></ProtectedRoute>} />
        <Route path="/mental-health" element={<MentalHealthHub />} />
        <Route path="/scenario-lab" element={<ProtectedRoute><ScenarioLab /></ProtectedRoute>} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/help" element={<PrepareForVisit />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/discover/:id" element={<DiscoverDetails />} />
        <Route path="/fda-safety" element={<FDASafety />} />
        <Route path="/innovation" element={<InnovationHub />} />
        <Route path="/research-funding" element={<ResearchFunding />} />
        <Route path="/research-insights" element={<ResearchInsights />} />
        <Route path="/t1d-companion" element={<T1DCompanion />} />
        <Route path="/community-solutions" element={<CommunitySolutions />} />
        <Route path="/community-solutions/:postId" element={<CommunityPostDetail />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/compare" element={<CompanyComparison />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/customizable-dashboard" element={<ProtectedRoute><CustomizableDashboard /></ProtectedRoute>} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/state-forms" element={<StateFormsFinder />} />
        <Route path="/news" element={<News />} />
        <Route path="/medicines" element={<MedicineHub />} />
        <Route path="/medicines/compare" element={<MedicineComparison />} />
        <Route path="/build-with-us" element={<BuildWithUs />} />
        <Route path="/build-with-us/:projectId" element={<DevelopmentProjectDetail />} />
        <Route path="/get-involved" element={<GetInvolved />} />
        <Route path="/trials" element={<TrialMatching />} />
        <Route path="/quality-of-life" element={<QualityOfLife />} />
        {/* Redirect legacy route to canonical */}
        <Route path="/donation-result" element={<Navigate to="/donate/success" replace />} />
        <Route path="/qa-checklist" element={<ProtectedRoute><AdminRoute><QAChecklist /></AdminRoute></ProtectedRoute>} />
        
        {/* New Routes - Phases 3-24 */}
        <Route path="/low-blood-sugar-world" element={<LowBloodSugarWorld />} />
        <Route path="/diabeto-18plus" element={<ProtectedRoute><Diabeto18Plus /></ProtectedRoute>} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        <Route path="/healthcare-experience" element={<HealthcareExperience />} />
        <Route path="/healthcare-providers" element={<HealthcareProviders />} />
        <Route path="/app-center" element={<AppCenter />} />
        <Route path="/emergence" element={<EmergenceOfDiabetes />} />
        <Route path="/learn" element={<LearnExplore />} />
        <Route path="/warrior-spotlight" element={<WarriorSpotlight />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/success" element={<ShopSuccess />} />
        <Route path="/shop/cancel" element={<ShopCancel />} />
        <Route path="/public-glucose-data" element={<PublicGlucoseData />} />
        
        {/* New Pages - Phases 1-8 */}
        <Route path="/ai-center" element={<AICenter />} />
        <Route path="/organizations" element={<DiabetesOrganizations />} />
        <Route path="/advocate" element={<ProtectedRoute><BecomeAdvocate /></ProtectedRoute>} />
        <Route path="/events" element={<EventsNearMe />} />
        <Route path="/future" element={<FutureOfT1D />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/your-experience" element={<ProtectedRoute><YourExperience /></ProtectedRoute>} />
        <Route path="/donations-info" element={<DonationsInfo />} />
        <Route path="/support" element={<SupportGlucoForge />} />
        <Route path="/diabetes-burnout" element={<DiabetesBurnout />} />
        <Route path="/find-diabetics" element={<ProtectedRoute><FindDiabeticNearMe /></ProtectedRoute>} />
        
        {/* Admin Content Management Routes */}
        <Route path="/admin/articles" element={<ProtectedRoute><AdminRoute><AdminArticles /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/low-sugar-stories" element={<ProtectedRoute><AdminRoute><AdminLowSugarStories /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/warriors" element={<ProtectedRoute><AdminRoute><AdminWarriors /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/shop" element={<ProtectedRoute><AdminRoute><AdminShop /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/content-moderation" element={<ProtectedRoute><AdminRoute><ContentModeration /></AdminRoute></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* Fix 7.6: Add delay to prevent tooltip flicker */}
        <TooltipProvider delayDuration={300}>
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
