import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InfoRail } from "@/components/InfoRail";
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, AlertTriangle } from "lucide-react";

interface TrendMetric {
  id: string;
  metric_name: string;
  metric_value: number | null;
  seven_day_count: number;
  thirty_day_count: number;
  trend_direction: string | null;
  category: string | null;
  calculated_at: string;
}

const Trends = () => {
  const { toast } = useToast();
  const [trends, setTrends] = useState<TrendMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const { data, error } = await supabase
        .from('trend_analysis_metrics')
        .select('*')
        .order('seven_day_count', { ascending: false });

      if (error) throw error;
      setTrends(data || []);
    } catch (error) {
      console.error('Error fetching trends:', error);
      toast({
        title: "Error",
        description: "Failed to load trend analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshTrends = async () => {
    setRefreshing(true);
    try {
      // Re-fetch latest data from the table
      await fetchTrends();
      
      toast({
        title: "Data Refreshed",
        description: "Showing latest available trend data",
      });
    } catch (error) {
      console.error('Error refreshing trends:', error);
      toast({
        title: "Error",
        description: "Failed to refresh trend data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const calculateTrend = (sevenDay: number, thirtyDay: number) => {
    if (thirtyDay === 0) return { direction: 'neutral', percentage: 0 };
    
    const weeklyAverage = sevenDay;
    const monthlyAverage = thirtyDay / 4.3; // Approximate weeks in a month
    
    if (weeklyAverage > monthlyAverage * 1.1) {
      return { 
        direction: 'up', 
        percentage: Math.round(((weeklyAverage - monthlyAverage) / monthlyAverage) * 100)
      };
    } else if (weeklyAverage < monthlyAverage * 0.9) {
      return { 
        direction: 'down', 
        percentage: Math.round(((monthlyAverage - weeklyAverage) / monthlyAverage) * 100)
      };
    }
    
    return { direction: 'neutral', percentage: 0 };
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-success" />;
      default: return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendBadge = (direction: string, percentage: number) => {
    if (direction === 'neutral') return null;
    
    const variant = direction === 'up' ? 'destructive' : 'secondary';
    const symbol = direction === 'up' ? '+' : '-';
    
    return (
      <Badge variant={variant} className="ml-2">
        {symbol}{percentage}%
      </Badge>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Community Trend Analysis</h1>
              <p className="text-muted-foreground">Real-time insights from diabetes community discussions</p>
            </div>
            <Button onClick={refreshTrends} disabled={refreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tracked Topics</p>
                      <p className="text-3xl font-bold">{trends.length}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">7-Day Mentions</p>
                      <p className="text-3xl font-bold">
                        {trends.reduce((sum, t) => sum + t.seven_day_count, 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">30-Day Mentions</p>
                      <p className="text-3xl font-bold">
                        {trends.reduce((sum, t) => sum + t.thirty_day_count, 0)}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
                <CardDescription>
                  Community discussion patterns over the last 7 and 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trends.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No trend data available yet</p>
                    <p className="text-sm">Click "Refresh Data" to analyze current community discussions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trends.map((trend) => {
                      const trendData = calculateTrend(trend.seven_day_count, trend.thirty_day_count);
                      
                      return (
                        <div key={trend.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            {getTrendIcon(trendData.direction)}
                            <div>
                              <h3 className="font-medium capitalize">{trend.metric_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {trend.seven_day_count} mentions this week, {trend.thirty_day_count} this month
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex items-center">
                                <span className="text-sm font-medium">7d:</span>
                                <span className="ml-1 font-bold">{trend.seven_day_count}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium">30d:</span>
                                <span className="ml-1 font-bold">{trend.thirty_day_count}</span>
                              </div>
                            </div>
                            
                            {getTrendBadge(trendData.direction, trendData.percentage)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hot Topics (7-day leaders) */}
            <Card>
              <CardHeader>
                <CardTitle>Hot Topics This Week</CardTitle>
                <CardDescription>Most discussed topics in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trends
                    .filter(t => t.seven_day_count > 0)
                    .slice(0, 6)
                    .map((trend, index) => (
                      <div key={trend.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="text-lg font-bold">{trend.seven_day_count}</span>
                        </div>
                        <h4 className="font-medium capitalize">{trend.metric_name}</h4>
                        <p className="text-sm text-muted-foreground">mentions this week</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="Real-time analysis of what the diabetes community is discussing most, based on Reddit posts and other sources."
              whyItMatters="Understanding trending topics helps identify emerging issues, popular solutions, and community concerns."
              nextSteps="Use trending topics to stay informed about community experiences and discover new solutions others are discussing."
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Understanding Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Increasing mentions (heating up)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-success" />
                  <span className="text-sm">Decreasing mentions (cooling down)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Stable discussion level</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Trends are calculated from community posts in diabetes-related forums and social media. 
                  Data is updated regularly to reflect current community conversations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Trends;