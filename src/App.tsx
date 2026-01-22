import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useAccessibilityAudit, usePerformanceMonitor } from "@/utils/qa-utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Journey from "./pages/Journey";
import About from "./pages/About";
import Fixes from "./pages/Fixes";
import Discoveries from "./pages/Discoveries";
import HowItWorks from "./pages/HowItWorks";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Accessibility from "./pages/Accessibility";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Insights from "./pages/Insights";
import Dashboard from "./pages/Dashboard";
import LiveCureMonitoring from "./pages/LiveCureMonitoring";
import DeviceAnalytics from "./pages/DeviceAnalytics";
import ResearchHub from "./pages/ResearchHub";
import CitizenScience from "./pages/CitizenScience";
import DataUpload from "./pages/DataUpload";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Donate from "./pages/donate/Donate";
import DonateSuccess from "./pages/donate/DonateSuccess";
import DonateCancel from "./pages/donate/DonateCancel";
import CureProgress from "./pages/CureProgress";
import GlucoseUpload from "./pages/glucose/GlucoseUpload";
import Journal from "./pages/Journal";
import Bounties from "./pages/Bounties";
import FinancialTools from "./pages/FinancialTools";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContent from "./pages/admin/AdminContent";
import AdminIntegrations from "./pages/admin/AdminIntegrations";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminProjects from "./pages/admin/AdminProjects";
import MentalHealthHub from "./pages/MentalHealthHub";
import ScenarioLab from "./pages/ScenarioLab";
import Trends from "./pages/Trends";
import Settings from "./pages/Settings";
import PrepareForVisit from "./pages/PrepareForVisit";
import CustomizableDashboard from "./pages/CustomizableDashboard";
import Discover from "./pages/Discover";
import DiscoverDetails from "./pages/DiscoverDetails";
import QAChecklist from "./pages/QAChecklist";
import FDASafety from "./pages/FDASafety";
import InnovationHub from "./pages/InnovationHub";
import ResearchFunding from "./pages/ResearchFunding";
import ResearchInsights from "./pages/ResearchInsights";
import DeviceDetail from "./pages/DeviceDetail";
import DeviceComparison from "./pages/DeviceComparison";
import T1DCompanion from "./pages/T1DCompanion";
import CommunitySolutions from "./pages/CommunitySolutions";
import CommunityPostDetail from "./pages/CommunityPostDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import CompanyComparison from "./pages/CompanyComparison";
import Resources from "./pages/Resources";
import StateFormsFinder from "./pages/StateFormsFinder";
import News from "./pages/News";
import BuildWithUs from "./pages/BuildWithUs";
import DevelopmentProjectDetail from "./pages/DevelopmentProjectDetail";
import GetInvolved from "./pages/GetInvolved";
import MedicineHub from "./pages/MedicineHub";
import MedicineComparison from "./pages/MedicineComparison";
import TrialMatching from "./pages/TrialMatching";
import QualityOfLife from "./pages/QualityOfLife";
import { AdminRoute } from "./components/admin/AdminRoute";

// New Pages - Phase 3-24
import LowBloodSugarWorld from "./pages/LowBloodSugarWorld";
import Diabeto18Plus from "./pages/Diabeto18Plus";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import HealthcareExperience from "./pages/HealthcareExperience";
import HealthcareProviders from "./pages/HealthcareProviders";
import AppCenter from "./pages/AppCenter";
import EmergenceOfDiabetes from "./pages/EmergenceOfDiabetes";
import LearnExplore from "./pages/LearnExplore";
import WarriorSpotlight from "./pages/WarriorSpotlight";
import Shop from "./pages/Shop";
import PublicGlucoseData from "./pages/PublicGlucoseData";
import ShopSuccess from "./pages/shop/ShopSuccess";
import ShopCancel from "./pages/shop/ShopCancel";

// Admin Pages
import AdminArticles from "./pages/admin/AdminArticles";
import AdminLowSugarStories from "./pages/admin/AdminLowSugarStories";
import AdminWarriors from "./pages/admin/AdminWarriors";
import AdminShop from "./pages/admin/AdminShop";

const queryClient = new QueryClient();

const App = () => {
  const initialize = useAuthStore((state) => state.initialize);
  
  // QA utilities for development
  useAccessibilityAudit();
  usePerformanceMonitor();

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
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
            <Route path="/donation-result" element={<DonateSuccess />} />
            <Route path="/qa-checklist" element={<QAChecklist />} />
            
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
            
            {/* Admin Content Management Routes */}
            <Route path="/admin/articles" element={<AdminRoute><AdminArticles /></AdminRoute>} />
            <Route path="/admin/low-sugar-stories" element={<AdminRoute><AdminLowSugarStories /></AdminRoute>} />
            <Route path="/admin/warriors" element={<AdminRoute><AdminWarriors /></AdminRoute>} />
            <Route path="/admin/shop" element={<AdminRoute><AdminShop /></AdminRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
