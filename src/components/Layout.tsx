import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { Menu, LogOut, User, Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { DonationModal } from '@/components/DonationModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import { useOnboarding } from '@/hooks/useOnboarding';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const { showModal, completeOnboarding, dismissModal } = useOnboarding();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex flex-col flex-1">
          {/* Header with sidebar trigger */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <div className="text-sm text-muted-foreground">
                Where scientific rigor meets real-world experience
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                className="accent-gradient"
                onClick={() => setDonationModalOpen(true)}
              >
                <Heart className="h-4 w-4 mr-2" />
                Donate Now
              </Button>
            </div>
          </header>
          
          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="border-t border-border bg-muted/30 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-foreground">GlucoForge</h3>
                  <p className="text-sm text-muted-foreground">
                    Forging tools. Fueling hope. Fighting diabetes together.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Platform</h4>
                  <div className="space-y-2 text-sm">
                    <Link to="/cure" className="block text-muted-foreground hover:text-foreground transition-colors">
                      Live Cure Monitoring
                    </Link>
                    <Link to="/devices" className="block text-muted-foreground hover:text-foreground transition-colors">
                      Device Analytics
                    </Link>
                    <Link to="/research" className="block text-muted-foreground hover:text-foreground transition-colors">
                      Research Hub
                    </Link>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Community</h4>
                  <div className="space-y-2 text-sm">
                    <Link to="/surveys" className="block text-muted-foreground hover:text-foreground transition-colors">
                      Citizen Science
                    </Link>
                    <Link to="/mental-health" className="block text-muted-foreground hover:text-foreground transition-colors">
                      Mental Health Hub
                    </Link>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Organization</h4>
                  <div className="space-y-2 text-sm">
                    <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                      About Us
                    </a>
                    <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                      501(c)(3) Status
                    </a>
                    <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                      Contact
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                <p>&copy; 2024 GlucoForge. An emerging 501(c)(3) nonprofit organization.</p>
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
    </SidebarProvider>
  );
};

export default Layout;