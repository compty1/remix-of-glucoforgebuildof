import React, { useState, useCallback } from 'react';
import { Responsive, WidthProvider, Layout as GridLayout } from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CommandCenterWidget } from '@/components/CommandCenterWidget';
import { InfoRail } from '@/components/InfoRail';
import AppLayout from '@/components/Layout';
import {
  LiveCureProgressWidget,
  CommunityFeedWidget,
  DeviceAlertWidget,
  PersonalStatsWidget,
  UpcomingEventsWidget
} from '@/components/dashboard/DashboardWidgets';
import { 
  Plus, 
  Settings, 
  LayoutGrid,
  Maximize2,
  Minimize2,
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
  Smartphone
} from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { usePageMeta } from '@/hooks/usePageMeta';

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

const CustomizableDashboard = () => {
  usePageMeta("My Dashboard", "Your personalized T1D dashboard — glucose, mood, devices, and community.");
  const [layouts, setLayouts] = useState<{ [key: string]: GridLayout[] }>({
    lg: [
      { i: 'cure-progress', x: 0, y: 0, w: 4, h: 3 },
      { i: 'community-feed', x: 4, y: 0, w: 4, h: 3 },
      { i: 'device-alerts', x: 8, y: 0, w: 4, h: 3 },
      { i: 'personal-stats', x: 0, y: 3, w: 3, h: 2 },
      { i: 'upcoming-events', x: 3, y: 3, w: 5, h: 2 }
    ]
  });

  const [activeWidgets, setActiveWidgets] = useState<string[]>([
    'cure-progress',
    'community-feed', 
    'device-alerts',
    'personal-stats',
    'upcoming-events'
  ]);

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

  const availableWidgets: DashboardWidget[] = [
    {
      id: 'cure-progress',
      title: 'Live Cure Progress',
      component: LiveCureProgressWidget,
      category: 'Research',
      description: 'Real-time tracking of promising T1D cure therapies',
      icon: Beaker,
      defaultSize: { w: 4, h: 3 }
    },
    {
      id: 'community-feed',
      title: "What's Working Feed",
      component: CommunityFeedWidget,
      category: 'Community',
      description: 'Latest community insights and trending solutions',
      icon: Users,
      defaultSize: { w: 4, h: 3 }
    },
    {
      id: 'device-alerts',
      title: 'Device Alert Ticker',
      component: DeviceAlertWidget,
      category: 'Technology',
      description: 'Real-time alerts about device issues and fixes',
      icon: AlertTriangle,
      defaultSize: { w: 4, h: 3 }
    },
    {
      id: 'personal-stats',
      title: 'Personal CGM Trends',
      component: PersonalStatsWidget,
      category: 'Personal',
      description: 'Your glucose management statistics and trends',
      icon: TrendingUp,
      defaultSize: { w: 3, h: 2 }
    },
    {
      id: 'upcoming-events',
      title: 'Research Milestones',
      component: UpcomingEventsWidget,
      category: 'Research',
      description: 'Upcoming cure research milestones and events',
      icon: Calendar,
      defaultSize: { w: 5, h: 2 }
    },
    {
      id: 'mental-health-check',
      title: 'Daily Wellness Check',
      component: ({ title }: { title: string }) => (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Heart className="h-4 w-4 text-accent" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">How are you feeling today?</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm">😊 Good</Button>
              <Button variant="outline" size="sm">😐 Okay</Button>
              <Button variant="outline" size="sm">😔 Tough</Button>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              View Wellness Hub
            </Button>
          </CardContent>
        </Card>
      ),
      category: 'Wellness',
      description: 'Quick daily mental health check-in',
      icon: Heart,
      defaultSize: { w: 3, h: 2 }
    },
    {
      id: 'research-summary',
      title: 'Research Digest',
      component: ({ title }: { title: string }) => (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Latest Breakthrough</p>
              <p className="text-xs text-muted-foreground">
                New insulin patch technology shows 89% accuracy in Phase 2 trials
              </p>
              <Badge variant="outline" className="text-xs">High Impact</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Read Full Summary
            </Button>
          </CardContent>
        </Card>
      ),
      category: 'Research',
      description: 'Daily digest of important research updates',
      icon: FileText,
      defaultSize: { w: 4, h: 2 }
    }
  ];

  const handleLayoutChange = useCallback((layout: GridLayout[], layouts: { [key: string]: GridLayout[] }) => {
    setLayouts(layouts);
  }, []);

  const addWidget = (widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      const widget = availableWidgets.find(w => w.id === widgetId);
      if (widget) {
        setActiveWidgets([...activeWidgets, widgetId]);
        
        // Add to layout
        const newLayouts = { ...layouts };
        Object.keys(newLayouts).forEach(breakpoint => {
          newLayouts[breakpoint] = [
            ...newLayouts[breakpoint],
            {
              i: widgetId,
              x: 0,
              y: Math.max(...newLayouts[breakpoint].map(item => item.y + item.h), 0),
              w: widget.defaultSize.w,
              h: widget.defaultSize.h
            }
          ];
        });
        setLayouts(newLayouts);
      }
    }
    setShowWidgetLibrary(false);
  };

  const removeWidget = (widgetId: string) => {
    setActiveWidgets(activeWidgets.filter(id => id !== widgetId));
    
    // Remove from layout
    const newLayouts = { ...layouts };
    Object.keys(newLayouts).forEach(breakpoint => {
      newLayouts[breakpoint] = newLayouts[breakpoint].filter(item => item.i !== widgetId);
    });
    setLayouts(newLayouts);
  };

  const resetLayout = () => {
    const defaultLayout = [
      { i: 'cure-progress', x: 0, y: 0, w: 4, h: 3 },
      { i: 'community-feed', x: 4, y: 0, w: 4, h: 3 },
      { i: 'device-alerts', x: 8, y: 0, w: 4, h: 3 },
      { i: 'personal-stats', x: 0, y: 3, w: 3, h: 2 },
      { i: 'upcoming-events', x: 3, y: 3, w: 5, h: 2 }
    ];
    
    setLayouts({ lg: defaultLayout });
    setActiveWidgets(['cure-progress', 'community-feed', 'device-alerts', 'personal-stats', 'upcoming-events']);
  };

  const getWidgetCategories = () => {
    const categories = [...new Set(availableWidgets.map(w => w.category))];
    return categories;
  };

  return (
    <AppLayout>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
                Command Center Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                Your personalized T1D intelligence hub. Drag, resize, and customize your view.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={isCustomizing ? "default" : "outline"}
                onClick={() => setIsCustomizing(!isCustomizing)}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                {isCustomizing ? 'Done' : 'Customize'}
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
                            disabled={activeWidgets.includes(widget.id)}
                            onClick={() => addWidget(widget.id)}
                          >
                            {activeWidgets.includes(widget.id) ? 'Added' : 'Add Widget'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              
              {isCustomizing && (
                <Button variant="outline" onClick={resetLayout}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
          
          {isCustomizing && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-accent" />
                <span className="font-medium text-accent">Customization Mode Active</span>
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
            isDraggable={isCustomizing}
            isResizable={isCustomizing}
            compactType="vertical"
            preventCollision={false}
            margin={[16, 16]}
            containerPadding={[0, 0]}
          >
            {activeWidgets.map((widgetId) => {
              const widget = availableWidgets.find(w => w.id === widgetId);
              if (!widget) return null;
              
              const WidgetComponent = widget.component;
              
              return (
                <div key={widgetId} className="relative">
                  {isCustomizing && (
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

        {/* Info Rail */}
        <section className="mb-8">
          <InfoRail
            whatThisShows="This customizable dashboard displays real-time data from across the GlucoForge platform. Widgets can be dragged, resized, and configured to match your personal information needs and workflow."
            whyItMatters="Everyone's T1D journey is different. A personalized command center helps you focus on the data and insights most relevant to your situation, whether that's cure research, device troubleshooting, or community support."
            nextSteps="Click 'Customize' to rearrange widgets, 'Add Widget' to browse the library, or dive into any widget to explore detailed data. Your layout automatically saves as you make changes."
          />
        </section>

        {/* Quick Stats Summary */}
        <section>
          <Card className="p-6 hero-gradient text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold mb-2">47</p>
                <p className="text-white/90">Active Cure Trials</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-2">1,247</p>
                <p className="text-white/90">Community Fixes</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-2">89%</p>
                <p className="text-white/90">User Satisfaction</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-2">24/7</p>
                <p className="text-white/90">Intelligence Updates</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
};

export default CustomizableDashboard;