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
  LucideIcon
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

const platformItems = [
  { title: "T1D Companion", url: "/t1d-companion", icon: MessageCircle },
  { title: "Community Solutions", url: "/community-solutions", icon: Users },
  { title: "Projects", url: "/projects", icon: FolderOpen },
  { title: "Live Cure Monitoring", url: "/cure", icon: Beaker },
  { title: "FDA Safety Dashboard", url: "/fda-safety", icon: AlertTriangle },
  { title: "Innovation Hub", url: "/innovation", icon: Lightbulb },
  { title: "Research Funding", url: "/research-funding", icon: DollarSign },
  { title: "Research Insights", url: "/research-insights", icon: Sparkles },
  { title: "Research Hub", url: "/research", icon: FileText },
  { title: "Citizen Science", url: "/surveys", icon: Search },
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

  // Keep submenu open if on a device page
  React.useEffect(() => {
    if (currentPath.startsWith('/devices/') && currentPath !== '/devices') {
      setDevicesOpen(true);
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
