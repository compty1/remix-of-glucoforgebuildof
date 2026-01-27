import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  LayoutDashboard, 
  Beaker, 
  Smartphone, 
  FileText, 
  Users, 
  Heart,
  HeartHandshake,
  Upload,
  Settings,
  HelpCircle,
  Shield,
  BookOpen,
  TestTube,
  AlertTriangle,
  MessageCircle,
  Lightbulb,
  DollarSign,
  Sparkles,
  ChevronRight,
  Activity,
  Syringe,
  LayoutGrid,
  FolderOpen,
  Plus,
  Building2,
  Newspaper,
  LucideIcon,
  Library,
  Hammer,
  HandHeart,
  Info,
  Pill,
  Stethoscope,
  Sparkles as SparklesIcon,
  Droplet,
  Award,
  TrendingUp,
  ShoppingBag,
  Brain,
  Megaphone,
  Calendar,
  Rocket,
  Database,
  FlaskConical,
  Microscope,
  GraduationCap,
  HeartPulse,
  Smile,
  Gift
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { EntityLogo } from '@/components/ui/entity-logo';
import dropIcon from '@/assets/glycoforge-drop-icon-new.png';

// ============================================
// REORGANIZED NAVIGATION STRUCTURE
// ============================================

// Main Navigation (always visible at top)
const mainNavItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Discover", url: "/discover", icon: Search },
];

// Community & Support
const communityItems = [
  { title: "T1D Companion", url: "/t1d-companion", icon: MessageCircle },
  { title: "Community Solutions", url: "/community-solutions", icon: Users },
  { title: "Warrior Spotlight", url: "/warrior-spotlight", icon: Award },
  { title: "Your Experience", url: "/your-experience", icon: Heart },
];

// Devices & Medications (with Devices submenu handled separately)
const deviceMedItems = [
  { title: "Medicine Hub", url: "/medicines", icon: Pill },
  { title: "App Center", url: "/app-center", icon: Smartphone },
];

// Research & Science
const researchItems = [
  { title: "Research Hub", url: "/research", icon: FileText },
  { title: "Research Insights", url: "/research-insights", icon: Sparkles },
  { title: "Find Clinical Trials", url: "/trials", icon: Stethoscope },
  { title: "Live Cure Monitoring", url: "/cure", icon: Beaker },
  { title: "Research Funding", url: "/research-funding", icon: DollarSign },
  { title: "Innovation Hub", url: "/innovation", icon: Lightbulb },
];

// Data & Analytics
const dataItems = [
  { title: "Data Upload", url: "/data-upload", icon: Upload },
  { title: "Public Glucose Data", url: "/public-glucose-data", icon: Activity },
  { title: "Glycemic Journal", url: "/journal", icon: BookOpen },
  { title: "Scenario Lab", url: "/scenario-lab", icon: TestTube },
  { title: "AI Center", url: "/ai-center", icon: Brain },
];

// News & Learning
const newsItems = [
  { title: "T1D News", url: "/news", icon: Newspaper },
  { title: "Articles", url: "/articles", icon: FileText },
  { title: "Learn & Explore", url: "/learn", icon: GraduationCap },
  { title: "Explore T1D History", url: "/explore", icon: BookOpen },
  { title: "Future of T1D", url: "/future", icon: Rocket },
  { title: "Emergence of Diabetes", url: "/emergence", icon: TrendingUp },
];

// Quality of Life
const qualityOfLifeItems = [
  { title: "Quality of Life", url: "/quality-of-life", icon: SparklesIcon },
  { title: "Mental Health Hub", url: "/mental-health", icon: HeartPulse },
  { title: "Healthcare Experience", url: "/healthcare-experience", icon: Stethoscope },
  { title: "Low Blood Sugar World", url: "/low-blood-sugar-world", icon: Droplet },
  { title: "Diabeto 18+", url: "/diabeto-18plus", icon: AlertTriangle },
];

// Companies & Organizations
const companiesItems = [
  { title: "T1D Companies", url: "/companies", icon: Building2 },
  { title: "Organizations", url: "/organizations", icon: Building2 },
  { title: "T1D Donations Data", url: "/donations-info", icon: Gift },
  { title: "FDA Safety Dashboard", url: "/fda-safety", icon: AlertTriangle },
];

// Get Involved
const getInvolvedItems = [
  { title: "Build With Us", url: "/build-with-us", icon: Hammer },
  { title: "Get Involved", url: "/get-involved", icon: HandHeart },
  { title: "Support Us", url: "/support", icon: Heart },
  { title: "Bounties", url: "/bounties", icon: DollarSign },
  { title: "Contribute Data", url: "/surveys", icon: HeartHandshake },
  { title: "Become Advocate", url: "/advocate", icon: Megaphone },
];

// Other
const otherItems = [
  { title: "Shop", url: "/shop", icon: ShoppingBag },
  { title: "Events Near Me", url: "/events", icon: Calendar },
];

// Support & Settings
const supportItems = [
  { title: "About", url: "/about", icon: Info },
  { title: "Healthcare Providers", url: "/healthcare-providers", icon: Building2 },
  { title: "Resources", url: "/resources", icon: Library },
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

interface Device {
  id: string;
  name: string;
  category: string | null;
  manufacturer: string | null;
}

const getDeviceIcon = (category: string | null): LucideIcon => {
  switch (category?.toLowerCase()) {
    case 'cgm':
      return Activity;
    case 'pump':
      return Syringe;
    default:
      return Smartphone;
  }
};

export function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const location = useLocation();
  const { user } = useAuthStore();
  const currentPath = location.pathname;
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [devicesOpen, setDevicesOpen] = React.useState(false);
  const [projectsOpen, setProjectsOpen] = React.useState(false);
  const [featuredProjects, setFeaturedProjects] = React.useState<{
    id: string;
    title: string;
    slug: string;
  }[]>([]);

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

  React.useEffect(() => {
    const fetchDevices = async () => {
      const { data } = await supabase
        .from('devices')
        .select('id, name, category, manufacturer')
        .order('name', { ascending: true });
      
      if (data) {
        setDevices(data as Device[]);
      }
    };

    fetchDevices();
  }, []);

  // Fetch featured projects for submenu
  React.useEffect(() => {
    const fetchFeaturedProjects = async () => {
      const { data } = await supabase
        .from('diabetic_health_projects')
        .select('id, title, slug')
        .eq('status', 'published')
        .eq('featured', true)
        .order('view_count', { ascending: false })
        .limit(4);
      
      if (data) {
        setFeaturedProjects(data);
      }
    };

    fetchFeaturedProjects();
  }, []);

  // Keep submenu open if on a device page
  React.useEffect(() => {
    if (currentPath.startsWith('/devices/') && currentPath !== '/devices') {
      setDevicesOpen(true);
    }
  }, [currentPath]);

  // Keep submenu open if on a projects page
  React.useEffect(() => {
    if (currentPath.startsWith('/projects')) {
      setProjectsOpen(true);
    }
  }, [currentPath]);

  const isActive = (path: string) => currentPath === path;
  const isDeviceActive = (deviceId: string) => currentPath === `/devices/${deviceId}`;
  
  const getNavClasses = (path: string) => {
    return isActive(path) 
      ? "bg-brand-purple-dark text-white font-semibold shadow-sm" 
      : "hover:bg-muted text-foreground transition-colors";
  };

  const getDeviceNavClasses = (deviceId: string) => {
    return isDeviceActive(deviceId)
      ? "bg-brand-purple-dark text-white font-semibold"
      : "hover:bg-muted text-foreground transition-colors";
  };

  // Render a navigation group
  const renderNavGroup = (label: string, items: typeof mainNavItems, emoji?: string) => (
    <SidebarGroup>
      <SidebarGroupLabel className={`${state === "collapsed" ? "sr-only" : ""} text-muted-foreground font-semibold text-xs uppercase tracking-wider flex items-center gap-1`}>
        {emoji && <span>{emoji}</span>}
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} className={getNavClasses(item.url)}>
                  <item.icon className={`h-4 w-4 ${isActive(item.url) ? '' : 'text-brand-teal'}`} />
                  {state !== "collapsed" && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className={`${state === "collapsed" ? "w-14" : "w-64"} border-r border-border bg-background`} variant="sidebar" collapsible="icon">
      <SidebarContent className="py-4 bg-background">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6 px-2">
          {state === "collapsed" ? (
            <div className="flex items-center justify-center">
              <img src={dropIcon} alt="GF" className="h-10 w-10 flex-shrink-0 logo-animated-drop object-contain" />
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full px-2">
              <img src={dropIcon} alt="GlycoForge" className="h-10 w-10 flex-shrink-0 logo-animated-drop object-contain" />
              <span className="text-xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-purple-light bg-clip-text text-transparent">
                GlycoForge
              </span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        {renderNavGroup("Main", mainNavItems, "📍")}

        {/* Community & Support */}
        {renderNavGroup("Community", communityItems, "💬")}

        {/* Devices & Medications */}
        <SidebarGroup>
          <SidebarGroupLabel className={`${state === "collapsed" ? "sr-only" : ""} text-muted-foreground font-semibold text-xs uppercase tracking-wider flex items-center gap-1`}>
            <span>🏥</span>
            Devices & Meds
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Devices Submenu */}
              <Collapsible
                open={devicesOpen}
                onOpenChange={setDevicesOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      className={`w-full justify-between ${
                        currentPath === '/devices' || currentPath.startsWith('/devices/')
                          ? "bg-brand-purple-dark/10 text-brand-purple-dark font-semibold"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className={`h-4 w-4 ${currentPath.startsWith('/devices') ? '' : 'text-brand-teal'}`} />
                        {state !== "collapsed" && <span>Devices</span>}
                      </div>
                      {state !== "collapsed" && (
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink to="/devices" className={getNavClasses('/devices')}>
                            <LayoutGrid className="h-3 w-3" />
                            {state !== "collapsed" && <span>All Devices</span>}
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {devices.map((device) => (
                        <SidebarMenuSubItem key={device.id}>
                          <SidebarMenuSubButton asChild>
                            <NavLink 
                              to={`/devices/${device.id}`} 
                              className={getDeviceNavClasses(device.id)}
                            >
                              <EntityLogo 
                                type="device" 
                                name={device.manufacturer || device.name} 
                                size="xs" 
                              />
                              {state !== "collapsed" && <span>{device.name}</span>}
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Other device/med items */}
              {deviceMedItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className={`h-4 w-4 ${isActive(item.url) ? '' : 'text-brand-teal'}`} />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Research & Science */}
        <SidebarGroup>
          <SidebarGroupLabel className={`${state === "collapsed" ? "sr-only" : ""} text-muted-foreground font-semibold text-xs uppercase tracking-wider flex items-center gap-1`}>
            <span>🔬</span>
            Research
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Deep Dive Projects Submenu */}
              <Collapsible
                open={projectsOpen}
                onOpenChange={setProjectsOpen}
                className="group/projects"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      className={`w-full justify-between ${
                        currentPath.startsWith('/projects')
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        {state !== "collapsed" && <span>Deep Dive Projects</span>}
                      </div>
                      {state !== "collapsed" && (
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/projects:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {featuredProjects.map((project) => (
                        <SidebarMenuSubItem key={project.id}>
                          <SidebarMenuSubButton asChild>
                            <NavLink 
                              to={`/projects/${project.slug}`} 
                              className={currentPath === `/projects/${project.slug}` 
                                ? "bg-primary text-primary-foreground font-medium" 
                                : "hover:bg-muted/50 transition-colors"}
                            >
                              <FolderOpen className="h-3 w-3" />
                              {state !== "collapsed" && (
                                <span className="truncate">{project.title}</span>
                              )}
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                      
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink 
                            to="/projects" 
                            className={currentPath === '/projects'
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted/50 transition-colors"}
                          >
                            <LayoutGrid className="h-3 w-3" />
                            {state !== "collapsed" && <span>View All Projects</span>}
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink 
                            to="/projects?submit=true" 
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            {state !== "collapsed" && <span>Submit a Project</span>}
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {researchItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className={`h-4 w-4 ${isActive(item.url) ? '' : 'text-brand-teal'}`} />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Data & Analytics */}
        {renderNavGroup("Data & Analytics", dataItems, "📊")}

        {/* News & Learning */}
        {renderNavGroup("News & Learning", newsItems, "📰")}

        {/* Quality of Life */}
        {renderNavGroup("Quality of Life", qualityOfLifeItems, "💚")}

        {/* Companies & Organizations */}
        {renderNavGroup("Companies", companiesItems, "🏢")}

        {/* Get Involved */}
        {renderNavGroup("Get Involved", getInvolvedItems, "🤝")}

        {/* Other */}
        {renderNavGroup("Other", otherItems, "🛒")}

        {/* Support & Settings */}
        {renderNavGroup("Support", supportItems, "⚙️")}

        {/* Admin */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarSeparator className="my-2" />
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className={`h-4 w-4 ${isActive(item.url) ? '' : 'text-brand-red'}`} />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
