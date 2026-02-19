import React, { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEngagementTracking } from "@/hooks/useEngagementTracking";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Loader2 } from "lucide-react";

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
const GlucoseUpload = lazy(() => import("./pages/glucose/GlucoseUpload"));
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

const queryClient = new QueryClient();

// Inner component that uses hooks requiring QueryClient
const AppContent = () => {
  const initialize = useAuthStore((state) => state.initialize);
  
  // Track user engagement (visits, streaks) - must be inside QueryClientProvider
  useEngagementTracking();

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Index />} />
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
        <Route path="/glucose/upload" element={<ProtectedRoute><GlucoseUpload /></ProtectedRoute>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/cure" element={<ProtectedRoute><LiveCureMonitoring /></ProtectedRoute>} />
        <Route path="/devices" element={<ProtectedRoute><DeviceAnalytics /></ProtectedRoute>} />
        <Route path="/devices/:deviceId" element={<ProtectedRoute><DeviceDetail /></ProtectedRoute>} />
        <Route path="/devices/compare" element={<ProtectedRoute><DeviceComparison /></ProtectedRoute>} />
        <Route path="/research" element={<ProtectedRoute><ResearchHub /></ProtectedRoute>} />
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
        <Route path="/mental-health" element={<ProtectedRoute><MentalHealthHub /></ProtectedRoute>} />
        <Route path="/scenario-lab" element={<ProtectedRoute><ScenarioLab /></ProtectedRoute>} />
        <Route path="/trends" element={<ProtectedRoute><Trends /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/help" element={<PrepareForVisit />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/discover/:id" element={<DiscoverDetails />} />
        <Route path="/fda-safety" element={<ProtectedRoute><FDASafety /></ProtectedRoute>} />
        <Route path="/innovation" element={<ProtectedRoute><InnovationHub /></ProtectedRoute>} />
        <Route path="/research-funding" element={<ProtectedRoute><ResearchFunding /></ProtectedRoute>} />
        <Route path="/research-insights" element={<ProtectedRoute><ResearchInsights /></ProtectedRoute>} />
        <Route path="/t1d-companion" element={<ProtectedRoute><T1DCompanion /></ProtectedRoute>} />
        <Route path="/community-solutions" element={<ProtectedRoute><CommunitySolutions /></ProtectedRoute>} />
        <Route path="/community-solutions/:postId" element={<ProtectedRoute><CommunityPostDetail /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/projects/:slug" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
        <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
        <Route path="/companies/compare" element={<ProtectedRoute><CompanyComparison /></ProtectedRoute>} />
        <Route path="/companies/:id" element={<ProtectedRoute><CompanyDetail /></ProtectedRoute>} />
        <Route path="/customizable-dashboard" element={<ProtectedRoute><CustomizableDashboard /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
        <Route path="/resources/state-forms" element={<ProtectedRoute><StateFormsFinder /></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
        <Route path="/medicines" element={<ProtectedRoute><MedicineHub /></ProtectedRoute>} />
        <Route path="/medicines/compare" element={<ProtectedRoute><MedicineComparison /></ProtectedRoute>} />
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
        <Route path="/public-glucose-data" element={<ProtectedRoute><PublicGlucoseData /></ProtectedRoute>} />
        
        {/* New Pages - Phases 1-8 */}
        <Route path="/ai-center" element={<ProtectedRoute><AICenter /></ProtectedRoute>} />
        <Route path="/organizations" element={<DiabetesOrganizations />} />
        <Route path="/advocate" element={<ProtectedRoute><BecomeAdvocate /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventsNearMe /></ProtectedRoute>} />
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
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
