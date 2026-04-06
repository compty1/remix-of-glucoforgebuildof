import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

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
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const qk = ['dashboard-layout', user?.id];

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: qk,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_dashboards')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.layout) {
        const savedLayout = data.layout as any;
        return {
          layouts: savedLayout.layouts || DEFAULT_LAYOUTS,
          widgets: savedLayout.widgets || DEFAULT_WIDGETS,
        };
      }
      return { layouts: DEFAULT_LAYOUTS, widgets: DEFAULT_WIDGETS };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ newLayouts, widgetList }: { newLayouts: any; widgetList: string[] }) => {
      if (!user) throw new Error('You must be logged in to save dashboard layout');
      const { error } = await supabase
        .from('user_dashboards')
        .upsert({ user_id: user.id, layout: { layouts: newLayouts, widgets: widgetList } }, { onConflict: 'user_id' });
      if (error) throw error;
      return { layouts: newLayouts, widgets: widgetList };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(qk, result);
    },
  });

  const saveLayout = useCallback(async (newLayouts: any, widgetList: string[]) => {
    await saveMutation.mutateAsync({ newLayouts, widgetList });
  }, [saveMutation]);

  return {
    layouts: data?.layouts || DEFAULT_LAYOUTS,
    widgets: data?.widgets || DEFAULT_WIDGETS,
    loading: isLoading,
    error: queryError ? String(queryError) : null,
    saveLayout,
  };
};
