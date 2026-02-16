import { useState, useEffect } from 'react';
import { Search, Filter, SortDesc, Loader2, Sparkles, TrendingUp, FlaskConical, Cpu, Users, Pill, Database, FileText, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import DiscoveryCard from '@/components/DiscoveryCard';
import { supabase } from '@/integrations/supabase/client';
import { LiveResearchFeed } from '@/components/discover/LiveResearchFeed';
import { TrialSpotlight } from '@/components/discover/TrialSpotlight';
import { CommunityPulse } from '@/components/discover/CommunityPulse';
import { CureProgressWidget } from '@/components/discover/CureProgressWidget';
import { DataSourcesBadge } from '@/components/discover/DataSourcesBadge';
import { QuickStatCard } from '@/components/discover/QuickStatCard';
import { PeerComparisonPanel } from '@/components/glucose/PeerComparisonPanel';
import { useQuery } from '@tanstack/react-query';

interface DiscoveryCardData {
  id: string;
  title: string;
  snippet: string;
  icon_url: string;
  credibility: 'High' | 'Medium' | 'Low';
  mechanism: string;
  sources: Array<{ title: string; url: string }>;
  created_at: string;
  category?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Insights', icon: Sparkles },
  { id: 'cure_breakthrough', label: 'Cure Progress', icon: FlaskConical },
  { id: 'medication', label: 'Medications', icon: Pill },
  { id: 'device', label: 'Devices', icon: Cpu },
  { id: 'research', label: 'Research', icon: TrendingUp },
  { id: 'community', label: 'Community', icon: Users },
];

const Discover = () => {
  const [insights, setInsights] = useState<DiscoveryCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCredibility, setSelectedCredibility] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch live stats
  const { data: stats } = useQuery({
    queryKey: ['discover-stats'],
    queryFn: async () => {
      const [{ count: researchCount }, { count: trialCount }, { count: deviceCount }] = await Promise.all([
        supabase.from('research_items').select('*', { count: 'exact', head: true }),
        supabase.from('clinical_trials_detailed').select('*', { count: 'exact', head: true }),
        supabase.from('devices').select('*', { count: 'exact', head: true }),
      ]);
      return { research: researchCount || 0, trials: trialCount || 0, devices: deviceCount || 0 };
    }
  });

  useEffect(() => {
    fetchInsights();
  }, [searchTerm, selectedCredibility, selectedCategory]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('discovery_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,snippet.ilike.%${searchTerm}%,mechanism.ilike.%${searchTerm}%`);
      }
      if (selectedCredibility) {
        query = query.eq('credibility', selectedCredibility);
      }
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      const typedData = (data || []).map(item => ({
        ...item,
        credibility: item.credibility as 'High' | 'Medium' | 'Low',
        sources: Array.isArray(item.sources) ? item.sources as Array<{ title: string; url: string }> : []
      }));

      setInsights(typedData);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  const credibilityFilters = ['High', 'Medium', 'Low'];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Evidence-Based T1D Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover What Matters</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time data from research, clinical trials, devices, and the T1D community—all in one place.
          </p>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <QuickStatCard title="Research Papers" value={stats?.research || 0} icon={FileText} colorClass="bg-primary/10 text-primary" />
          <QuickStatCard title="Clinical Trials" value={stats?.trials || 0} icon={FlaskConical} colorClass="bg-green-100 text-green-600 dark:bg-green-900/30" />
          <QuickStatCard title="Devices Tracked" value={stats?.devices || 0} icon={Cpu} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30" />
          <QuickStatCard title="Data Sources" value="6+" icon={Database} colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30" />
        </div>

        {/* Data Sources Badge */}
        <DataSourcesBadge />

        {/* Multi-Source Data Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 my-8">
          <LiveResearchFeed />
          <TrialSpotlight />
          <CommunityPulse />
          <CureProgressWidget />
          <PeerComparisonPanel compact />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search insights..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <div className="flex gap-2">
                <Button variant={selectedCredibility === null ? "default" : "outline"} onClick={() => setSelectedCredibility(null)} size="sm">All</Button>
                {credibilityFilters.map((filter) => (
                  <Button key={filter} variant={selectedCredibility === filter ? "default" : "outline"} onClick={() => setSelectedCredibility(filter)} size="sm">{filter}</Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {insights.map((insight) => (
              <DiscoveryCard key={insight.id} data={insight} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No insights found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters.</p>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCredibility(null); setSelectedCategory('all'); }}>Clear filters</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Discover;