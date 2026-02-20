import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

interface UserDashboard {
  id: string;
  user_id: string;
  layout: {
    layouts: {
      lg: DashboardLayout[];
      md: DashboardLayout[];
      sm: DashboardLayout[];
      xs: DashboardLayout[];
    };
    widgets: string[];
  };
  created_at: string;
  updated_at: string;
}

interface UseDashboardLayoutResult {
  layouts: {
    lg: DashboardLayout[];
    md: DashboardLayout[];
    sm: DashboardLayout[];
    xs: DashboardLayout[];
  };
  widgets: string[];
  loading: boolean;
  error: string | null;
  saveLayout: (newLayouts: any, widgetList: string[]) => Promise<void>;
}

const DEFAULT_WIDGETS = [
  'glucose-trends',
  'device-status',
  'community-insights',
  'quick-actions',
  'recent-activity',
  'health-metrics'
];

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'glucose-trends', x: 0, y: 0, w: 8, h: 4, minW: 6, minH: 3 },
    { i: 'device-status', x: 8, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'community-insights', x: 0, y: 4, w: 6, h: 3, minW: 4, minH: 2 },
    { i: 'quick-actions', x: 6, y: 4, w: 3, h: 3, minW: 2, minH: 2 },
    { i: 'recent-activity', x: 9, y: 4, w: 3, h: 3, minW: 2, minH: 2 },
    { i: 'health-metrics', x: 0, y: 7, w: 12, h: 3, minW: 6, minH: 2 }
  ],
  md: [
    { i: 'glucose-trends', x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'device-status', x: 6, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'community-insights', x: 0, y: 4, w: 5, h: 3, minW: 3, minH: 2 },
    { i: 'quick-actions', x: 5, y: 4, w: 2, h: 3, minW: 2, minH: 2 },
    { i: 'recent-activity', x: 7, y: 4, w: 3, h: 3, minW: 2, minH: 2 },
    { i: 'health-metrics', x: 0, y: 7, w: 10, h: 3, minW: 4, minH: 2 }
  ],
  sm: [
    { i: 'glucose-trends', x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'device-status', x: 0, y: 4, w: 6, h: 3, minW: 3, minH: 2 },
    { i: 'community-insights', x: 0, y: 7, w: 6, h: 3, minW: 3, minH: 2 },
    { i: 'quick-actions', x: 0, y: 10, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'recent-activity', x: 3, y: 10, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'health-metrics', x: 0, y: 12, w: 6, h: 3, minW: 3, minH: 2 }
  ],
  xs: [
    { i: 'glucose-trends', x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 3 },
    { i: 'device-status', x: 0, y: 4, w: 4, h: 3, minW: 2, minH: 2 },
    { i: 'community-insights', x: 0, y: 7, w: 4, h: 3, minW: 2, minH: 2 },
    { i: 'quick-actions', x: 0, y: 10, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'recent-activity', x: 0, y: 12, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'health-metrics', x: 0, y: 14, w: 4, h: 3, minW: 2, minH: 2 }
  ]
};

export const useDashboardLayout = (): UseDashboardLayoutResult => {
  const [layouts, setLayouts] = useState(DEFAULT_LAYOUTS);
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardLayout = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User not logged in, use defaults
        setLayouts(DEFAULT_LAYOUTS);
        setWidgets(DEFAULT_WIDGETS);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('user_dashboards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Failed to fetch dashboard layout: ${fetchError.message}`);
      }

      if (data && data.layout) {
        const savedLayout = data.layout as any;
        if (savedLayout.layouts) {
          setLayouts(savedLayout.layouts);
        }
        if (savedLayout.widgets) {
          setWidgets(savedLayout.widgets);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard layout');
      // Use defaults on error
      setLayouts(DEFAULT_LAYOUTS);
      setWidgets(DEFAULT_WIDGETS);
    } finally {
      setLoading(false);
    }
  };

  const saveLayout = async (newLayouts: any, widgetList: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to save dashboard layout');
      }

      const layoutData = {
        layouts: newLayouts,
        widgets: widgetList
      };

      const { error: saveError } = await supabase
        .from('user_dashboards')
        .upsert({
          user_id: user.id,
          layout: layoutData
        }, {
          onConflict: 'user_id'
        });

      if (saveError) {
        throw new Error(`Failed to save dashboard layout: ${saveError.message}`);
      }

      setLayouts(newLayouts);
      setWidgets(widgetList);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save dashboard layout');
      throw err;
    }
  };

  useEffect(() => {
    fetchDashboardLayout();
  }, []);

  return {
    layouts,
    widgets,
    loading,
    error,
    saveLayout,
  };
};