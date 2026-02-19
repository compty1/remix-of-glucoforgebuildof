import React, { useState, useEffect } from 'react';
import { SkipToContent } from '@/components/SkipToContent';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { Menu, LogOut, User, Heart, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { DonationModal } from '@/components/DonationModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import { useOnboarding } from '@/hooks/useOnboarding';
import { GlobalSearchDialog } from '@/components/search/GlobalSearchDialog';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { SmartOnboarding } from '@/components/onboarding/SmartOnboarding';
import { AchievementUnlockModal } from '@/components/achievements/AchievementUnlockModal';
import { useAchievements } from '@/hooks/useAchievements';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { signOut, user } = useAuthStore();
  const navigate = useNavigate();
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { showModal, completeOnboarding, dismissModal } = useOnboarding();
  
  // Achievements and streaks
  const { recentlyUnlocked, dismissUnlocked } = useAchievements();
  
  // User preferences for smart onboarding
  const { preferences, isLoading: prefsLoading } = useUserPreferences();
  const [showSmartOnboarding, setShowSmartOnboarding] = useState(false);

  // Show smart onboarding if user hasn't completed it
  useEffect(() => {
    if (user && !prefsLoading && preferences && !preferences.onboarding_completed) {
      // Delay slightly to not overwhelm the user
      const timer = setTimeout(() => setShowSmartOnboarding(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, prefsLoading, preferences]);

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <SidebarProvider>
      <SkipToContent />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex flex-col flex-1">
          {/* Header with brand purple gradient */}
          <header className="h-16 flex items-center justify-between px-6 hero-gradient sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <div className="text-sm text-white/80 font-medium">
                Where scientific rigor meets real-world experience
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSearchOpen(true)} 
                className="text-white hover:bg-white/10 gap-2"
              >
                <Search className="h-4 w-4" />
                <span className="hidden md:inline text-sm">Search</span>
                <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-white/10 px-1.5 text-[10px] font-medium">
                  ⌘K
                </kbd>
              </Button>
              
              {/* Notification Center */}
              <NotificationCenter className="text-white hover:bg-white/10" />
              
              <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="text-white hover:bg-white/10" aria-label="Settings">
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-white hover:bg-white/10" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                className="bg-brand-red hover:bg-brand-red-dark text-white shadow-brand"
                onClick={() => setDonationModalOpen(true)}
              >
                <Heart className="h-4 w-4 mr-2" />
                Donate Now
              </Button>
            </div>
          </header>
          
          {/* Main content */}
          <main id="main-content" className="flex-1 bg-background" role="main">
            {children}
          </main>
          
          {/* Footer with brand purple */}
          <footer className="bg-brand-purple-dark py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-lg">GlucoForge</h3>
                  <p className="text-sm text-white/70">
                    Forging tools. Fueling hope. Fighting diabetes together.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Platform</h4>
                  <div className="space-y-2 text-sm">
                    <Link to="/cure" className="block text-white/70 hover:text-brand-teal transition-colors">
                      Live Cure Monitoring
                    </Link>
                    <Link to="/devices" className="block text-white/70 hover:text-brand-teal transition-colors">
                      Devices
                    </Link>
                    <Link to="/research" className="block text-white/70 hover:text-brand-teal transition-colors">
                      Research Hub
                    </Link>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Community</h4>
                  <div className="space-y-2 text-sm">
                    <Link to="/surveys" className="block text-white/70 hover:text-brand-teal transition-colors">
                      Citizen Science
                    </Link>
                    <Link to="/mental-health" className="block text-white/70 hover:text-brand-teal transition-colors">
                      Mental Health Hub
                    </Link>
                  </div>
                </div>
              <div className="space-y-3">
                  <h4 className="font-semibold text-white">Organization</h4>
                  <div className="space-y-2 text-sm">
                    <Link to="/about" className="block text-white/70 hover:text-brand-teal transition-colors">
                      About Us
                    </Link>
                    <Link to="/donations-info" className="block text-white/70 hover:text-brand-teal transition-colors">
                      Donations Data
                    </Link>
                    <Link to="/about" className="block text-white/70 hover:text-brand-teal transition-colors">
                      501(c)(3) Status
                    </Link>
                    <Link to="/contact" className="block text-white/70 hover:text-brand-teal transition-colors">
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm text-white/60">
                <p>&copy; {new Date().getFullYear()} GlucoForge. An emerging 501(c)(3) nonprofit organization.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <DonationModal 
        open={donationModalOpen} 
        onOpenChange={setDonationModalOpen} 
      />
      
      <OnboardingModal 
        open={showModal}
        onComplete={completeOnboarding}
        onDismiss={dismissModal}
      />
      
      <GlobalSearchDialog 
        open={searchOpen} 
        onOpenChange={setSearchOpen} 
      />
      
      {/* Smart Onboarding Modal */}
      <SmartOnboarding 
        open={showSmartOnboarding} 
        onOpenChange={setShowSmartOnboarding} 
      />
      
      {/* Achievement Unlock Celebration */}
      <AchievementUnlockModal 
        achievement={recentlyUnlocked}
        onClose={dismissUnlocked}
      />
    </SidebarProvider>
  );
};

export default Layout;
