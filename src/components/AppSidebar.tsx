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
  Pill
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
import logoImage from '@/assets/glucoforge-logo.svg';
import iconImage from '@/assets/glucoforge-icon.svg';

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Discover", url: "/discover", icon: Search },
];

const platformItemsBeforeProjects = [
  { title: "T1D News", url: "/news", icon: Newspaper },
  { title: "T1D Companion", url: "/t1d-companion", icon: MessageCircle },
  { title: "Community Solutions", url: "/community-solutions", icon: Users },
  { title: "Medicine Hub", url: "/medicines", icon: Pill },
];

const platformItemsAfterProjects = [
  { title: "T1D Companies", url: "/companies", icon: Building2 },
  { title: "Live Cure Monitoring", url: "/cure", icon: Beaker },
  { title: "FDA Safety Dashboard", url: "/fda-safety", icon: AlertTriangle },
  { title: "Innovation Hub", url: "/innovation", icon: Lightbulb },
  { title: "Research Funding", url: "/research-funding", icon: DollarSign },
  { title: "Research Insights", url: "/research-insights", icon: Sparkles },
  { title: "Research Hub", url: "/research", icon: FileText },
  { title: "Contribute", url: "/surveys", icon: HeartHandshake },
  { title: "Mental Health Hub", url: "/mental-health", icon: Heart },
  { title: "Data Upload", url: "/data-upload", icon: Upload },
  { title: "Glycemic Journal", url: "/journal", icon: BookOpen },
  { title: "Scenario Lab", url: "/scenario-lab", icon: TestTube },
];

const supportItems = [
  { title: "About", url: "/about", icon: Info },
  { title: "Build With Us", url: "/build-with-us", icon: Hammer },
  { title: "Get Involved", url: "/get-involved", icon: HandHeart },
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
        .select('id, name, category')
        .order('name', { ascending: true });
      
      if (data) {
        setDevices(data);
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
      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
      : "hover:bg-muted/50 transition-colors";
  };

  const getDeviceNavClasses = (deviceId: string) => {
    return isDeviceActive(deviceId)
      ? "bg-primary text-primary-foreground font-medium"
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
              {/* Items before Projects */}
              {platformItemsBeforeProjects.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Projects with Submenu */}
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
                        {state !== "collapsed" && <span>Projects</span>}
                      </div>
                      {state !== "collapsed" && (
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/projects:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {/* Featured Projects (first 4) */}
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
                      
                      {/* View All Projects */}
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
                      
                      {/* Submit a Project */}
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

              {/* Items after Projects */}
              {platformItemsAfterProjects.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Device Analytics with Submenu */}
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
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        {state !== "collapsed" && <span>Device Analytics</span>}
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
                      {devices.map((device) => {
                        const DeviceIcon = getDeviceIcon(device.category);
                        return (
                          <SidebarMenuSubItem key={device.id}>
                            <SidebarMenuSubButton asChild>
                              <NavLink 
                                to={`/devices/${device.id}`} 
                                className={getDeviceNavClasses(device.id)}
                              >
                                <DeviceIcon className="h-3 w-3" />
                                {state !== "collapsed" && <span>{device.name}</span>}
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
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
