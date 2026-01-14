import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Search, 
  LayoutDashboard, 
  Beaker, 
  Smartphone, 
  FileText, 
  Users, 
  Heart,
  Upload,
  Settings,
  HelpCircle,
  Shield,
  BookOpen,
  TestTube,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Sparkles
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import logoImage from '@/assets/glucoforge-logo.svg';
import iconImage from '@/assets/glucoforge-icon.svg';

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Discover", url: "/discover", icon: Search },
];

const platformItems = [
  { title: "Live Cure Monitoring", url: "/cure", icon: Beaker },
  { title: "Device Analytics", url: "/devices", icon: Smartphone },
  { title: "FDA Safety Dashboard", url: "/fda-safety", icon: AlertTriangle },
  { title: "Innovation Hub", url: "/innovation", icon: Lightbulb },
  { title: "Research Funding", url: "/research-funding", icon: DollarSign },
  { title: "Research Insights", url: "/research-insights", icon: Sparkles },
  { title: "Research Hub", url: "/research", icon: FileText },
  { title: "Citizen Science", url: "/surveys", icon: Users },
  { title: "Mental Health Hub", url: "/mental-health", icon: Heart },
  { title: "Data Upload", url: "/data-upload", icon: Upload },
  { title: "Glycemic Journal", url: "/journal", icon: BookOpen },
  { title: "Scenario Lab", url: "/scenario-lab", icon: TestTube },
];

const supportItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help & Support", url: "/help", icon: HelpCircle },
  ];

  const adminItems = [
    {
      title: "Admin",
      url: "/admin",
      icon: Shield,
    }
  ];

export function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const location = useLocation();
  const { user } = useAuthStore();
  const currentPath = location.pathname;
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, [user]);

  const isActive = (path: string) => currentPath === path;
  
  const getNavClasses = (path: string) => {
    return isActive(path) 
      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
      : "hover:bg-muted/50 transition-colors";
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} variant="sidebar" collapsible="icon">
      <SidebarContent className="py-4">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6 px-4">
          {state === "collapsed" ? (
            <div className="flex items-center justify-center">
              <img src={iconImage} alt="GF" className="h-8 w-8 flex-shrink-0" />
            </div>
          ) : (
            <div className="flex items-center justify-start w-full">
              <img src={logoImage} alt="GlucoForge" className="h-8 w-auto max-w-full flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : ""}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* T1D Intelligence Hub */}
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : ""}>
            T1D Intelligence Hub
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support */}
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : ""}>
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            
            {isAdmin && (
              <>
                <SidebarSeparator className="my-2" />
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </>
            )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}