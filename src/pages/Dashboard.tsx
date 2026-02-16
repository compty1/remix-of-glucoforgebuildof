import React, { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider, Layout as GridLayout } from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Layout from '@/components/Layout';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { DashboardWidgets } from '@/components/dashboard/DashboardWidgets';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Settings, 
  LayoutGrid,
  X,
  Save,
  RotateCcw,
  TrendingUp,
  Users,
  Beaker,
  AlertTriangle,
  Calendar,
  Heart,
  FileText,
  Activity,
  Smartphone,
  BarChart3,
  Bookmark,
  Upload,
  Mail
} from 'lucide-react';
import { WeeklyDigestSignup } from '@/components/WeeklyDigestSignup';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  category: string;
  description: string;
  icon: React.ComponentType<any>;
  defaultSize: { w: number; h: number };
}

import { BookmarkedItemsWidget } from '@/components/dashboard/BookmarkedItemsWidget';
import { ClaimedProjectsWidget } from '@/components/dashboard/ClaimedProjectsWidget';
import { AchievementsWidget } from '@/components/dashboard/AchievementsWidget';
import { StreaksWidget } from '@/components/dashboard/StreaksWidget';
import { PeerComparisonPanel } from '@/components/glucose/PeerComparisonPanel';
import { Trophy, Flame } from 'lucide-react';

const availableWidgets: DashboardWidget[] = [
  {
    id: 'glucose-trends',
    title: 'Glucose Trends',
    component: ({ title }: { title: string }) => <DashboardWidgets widgetId="glucose-trends" isEditing={false} />,
    category: 'Health',
    description: 'View your glucose patterns and trends over time',
    icon: TrendingUp,
    defaultSize: { w: 8, h: 4 }
  },
  {
    id: 'device-status',
    title: 'Device Status',
    component: ({ title }: { title: string }) => <DashboardWidgets widgetId="device-status" isEditing={false} />,
    category: 'Technology',
    description: 'Monitor your diabetes devices and their status',
    icon: Smartphone,
    defaultSize: { w: 4, h: 4 }
  },
  {
    id: 'community-insights',
    title: 'Community Insights',
    component: ({ title }: { title: string }) => <DashboardWidgets widgetId="community-insights" isEditing={false} />,
    category: 'Community',
    description: 'Latest insights and discussions from the community',
    icon: Users,
    defaultSize: { w: 6, h: 3 }
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    component: ({ title }: { title: string }) => <DashboardWidgets widgetId="quick-actions" isEditing={false} />,
    category: 'Tools',
    description: 'Fast access to common tasks and actions',
    icon: Activity,
    defaultSize: { w: 3, h: 3 }
  },
  {
    id: 'recent-activity',
    title: 'Recent Activity',
    component: ({ title }: { title: string }) => <DashboardWidgets widgetId="recent-activity" isEditing={false} />,
    category: 'Personal',
    description: 'Your recent actions and updates',
    icon: Activity,
    defaultSize: { w: 3, h: 3 }
  },
  {
    id: 'health-metrics',
    title: 'Health Metrics',
    component: ({ title }: { title: string }) => <DashboardWidgets widgetId="health-metrics" isEditing={false} />,
    category: 'Health',
    description: 'Overview of your key health indicators',
    icon: Heart,
    defaultSize: { w: 12, h: 3 }
  },
  {
    id: 'weekly-digest',
    title: 'Weekly Digest',
    component: ({ title }: { title: string }) => <WeeklyDigestSignup variant="compact" />,
    category: 'Updates',
    description: 'Sign up for weekly T1D research updates',
    icon: Mail,
    defaultSize: { w: 4, h: 3 }
  },
  {
    id: 'bookmarked-items',
    title: 'Bookmarked Items',
    component: () => <BookmarkedItemsWidget />,
    category: 'Personal',
    description: 'Quick access to your saved articles, research, and resources',
    icon: Bookmark,
    defaultSize: { w: 4, h: 4 }
  },
  {
    id: 'claimed-projects',
    title: 'My Projects',
    component: () => <ClaimedProjectsWidget />,
    category: 'Community',
    description: 'Track your claimed development projects and contributions',
    icon: FileText,
    defaultSize: { w: 4, h: 4 }
  },
  {
    id: 'achievements',
    title: 'Your Achievements',
    component: () => <AchievementsWidget />,
    category: 'Personal',
    description: 'Track your badges, points, and progress',
    icon: Trophy,
    defaultSize: { w: 4, h: 4 }
  },
  {
    id: 'streaks',
    title: 'Your Streaks',
    component: () => <StreaksWidget />,
    category: 'Personal',
    description: 'Track your daily visit and activity streaks',
    icon: Flame,
    defaultSize: { w: 4, h: 3 }
  },
  {
    id: 'peer-comparison',
    title: 'Peer Comparison',
    component: () => <PeerComparisonPanel compact />,
    category: 'Health',
    description: 'Compare your glucose data against users with excellent control',
    icon: Users,
    defaultSize: { w: 4, h: 4 }
  }
];

const Dashboard = () => {
  const { layouts, widgets, loading, error, saveLayout } = useDashboardLayout();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const { toast } = useToast();

  const handleLayoutChange = useCallback((layout: GridLayout[], layouts: { [key: string]: GridLayout[] }) => {
    if (isEditMode) {
      // Only update layouts when in edit mode
      saveLayout(layouts, widgets);
    }
  }, [isEditMode, saveLayout, widgets]);

  const addWidget = (widgetId: string) => {
    if (!widgets.includes(widgetId)) {
      const widget = availableWidgets.find(w => w.id === widgetId);
      if (widget) {
        const newWidgets = [...widgets, widgetId];
        
        // Add to layout with proper positioning
        const newLayouts = { ...layouts };
        Object.keys(newLayouts).forEach(breakpoint => {
          const maxY = Math.max(...newLayouts[breakpoint].map(item => item.y + item.h), 0);
          newLayouts[breakpoint] = [
            ...newLayouts[breakpoint],
            {
              i: widgetId,
              x: 0,
              y: maxY,
              w: widget.defaultSize.w,
              h: widget.defaultSize.h,
              minW: 2,
              minH: 2
            }
          ];
        });
        
        saveLayout(newLayouts, newWidgets);
        toast({
          title: "Widget Added",
          description: `${widget.title} has been added to your dashboard.`,
        });
      }
    }
    setShowWidgetLibrary(false);
  };

  const removeWidget = (widgetId: string) => {
    const newWidgets = widgets.filter(id => id !== widgetId);
    
    // Remove from layout
    const newLayouts = { ...layouts };
    Object.keys(newLayouts).forEach(breakpoint => {
      newLayouts[breakpoint] = newLayouts[breakpoint].filter(item => item.i !== widgetId);
    });
    
    saveLayout(newLayouts, newWidgets);
    toast({
      title: "Widget Removed",
      description: "Widget has been removed from your dashboard.",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Dashboard</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
                GlucoForge Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                Your personalized diabetes management hub. Customize your layout to fit your needs.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={isEditMode ? "default" : "outline"}
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                {isEditMode ? 'Save Layout' : 'Edit Mode'}
              </Button>
              
              <Dialog open={showWidgetLibrary} onOpenChange={setShowWidgetLibrary}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widget
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Widget Library</DialogTitle>
                    <DialogDescription>
                      Choose widgets to add to your dashboard
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {availableWidgets.map((widget) => (
                      <Card key={widget.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <widget.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-sm">{widget.title}</CardTitle>
                              <Badge variant="outline" className="text-xs">{widget.category}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            {widget.description}
                          </p>
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={widgets.includes(widget.id)}
                            onClick={() => addWidget(widget.id)}
                          >
                            {widgets.includes(widget.id) ? 'Added' : 'Add Widget'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {isEditMode && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-accent" />
                <span className="font-medium text-accent">Edit Mode Active</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Drag widgets to rearrange, resize by dragging corners, or click the × to remove widgets.
              </p>
            </div>
          )}
        </section>

        {/* Dashboard Grid */}
        <section className="mb-12">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            compactType="vertical"
            preventCollision={false}
            margin={[16, 16]}
            containerPadding={[0, 0]}
          >
            {widgets.map((widgetId) => {
              const widget = availableWidgets.find(w => w.id === widgetId);
              if (!widget) return null;
              
              const WidgetComponent = widget.component;
              
              return (
                <div key={widgetId} className="relative">
                  {isEditMode && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 z-10 h-6 w-6 p-0 rounded-full"
                      onClick={() => removeWidget(widgetId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <div className="h-full">
                    <WidgetComponent title={widget.title} />
                  </div>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </section>

        {/* Quick Stats Summary */}
        <section>
          <Card className="p-6 hero-gradient text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold mb-2">{availableWidgets.length}</p>
                <p className="text-white/90">Available Widgets</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-2">24/7</p>
                <p className="text-white/90">Real-time Updates</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-2">100%</p>
                <p className="text-white/90">Customizable</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-2">{widgets.length}</p>
                <p className="text-white/90">Active Widgets</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;