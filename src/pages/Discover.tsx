import { useState, useEffect } from 'react';
import { Search, Filter, SortDesc, Loader2, Sparkles, TrendingUp, FlaskConical, Cpu, Users, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import DiscoveryCard from '@/components/DiscoveryCard';
import { supabase } from '@/integrations/supabase/client';

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

      if (error) {
        console.error('Error fetching insights:', error);
        throw error;
      }

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

  // Get featured insight (highest credibility, most recent)
  const featuredInsight = insights.find(i => i.credibility === 'High') || insights[0];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Evidence-Based T1D Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover What Matters
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Curated research findings, community discoveries, and breakthrough insights—all validated with credibility scores.
          </p>
        </div>

        {/* Featured Insight */}
        {featuredInsight && !loading && (
          <Card className="mb-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary text-primary-foreground">Featured Insight</Badge>
                    <Badge variant="outline">{featuredInsight.credibility} Credibility</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{featuredInsight.title}</h3>
                  <p className="text-muted-foreground">{featuredInsight.snippet}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Search and Filters */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search insights, mechanisms, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Credibility Filter */}
              <div className="flex gap-2">
                <Button
                  variant={selectedCredibility === null ? "default" : "outline"}
                  onClick={() => setSelectedCredibility(null)}
                  size="sm"
                >
                  All
                </Button>
                {credibilityFilters.map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedCredibility === filter ? "default" : "outline"}
                    onClick={() => setSelectedCredibility(filter)}
                    size="sm"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(searchTerm || selectedCredibility || selectedCategory !== 'all') && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {selectedCredibility && (
                  <Badge variant="secondary">
                    Credibility: {selectedCredibility}
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary">
                    Category: {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCredibility(null);
                    setSelectedCategory('all');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {loading ? 'Searching...' : `${insights.length} insights found`}
          </p>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <SortDesc className="h-4 w-4" />
            Sort by Date
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading insights...</span>
          </div>
        )}

        {/* Insights Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {insights.map((insight) => (
              <DiscoveryCard key={insight.id} data={insight} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && insights.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No insights found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find more results.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCredibility(null);
                  setSelectedCategory('all');
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Discover;