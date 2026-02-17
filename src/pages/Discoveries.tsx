import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Calendar, TrendingUp, Search, AlertCircle, Microscope, FlaskConical, Users, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useDiscoveries } from '@/hooks/useDiscoveries';
import { supabase } from '@/integrations/supabase/client';

export default function Discoveries() {
  const [filters, setFilters] = useState({
    type: 'all',
    impact: 'all',
    minCredibility: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { discoveries, loading } = useDiscoveries(filters);

  const filteredDiscoveries = discoveries.filter(d => 
    searchTerm === '' || 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cure_breakthrough': return <Sparkles className="h-4 w-4" />;
      case 'clinical_trial': return <FlaskConical className="h-4 w-4" />;
      case 'research_paper': return <Microscope className="h-4 w-4" />;
      case 'community_symptom': return <Users className="h-4 w-4" />;
      case 'ai_correlation': return <TrendingUp className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Breakthrough': return 'bg-chart-5 text-white';
      case 'High': return 'bg-destructive text-destructive-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'Low': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleSeedData = async () => {
    try {
      await supabase.functions.invoke('seed-discoveries');
      window.location.reload();
    } catch (error) {
      console.error('Failed to seed data:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-3">
              🔬 Type 1 Diabetes Discoveries
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Real-time intelligence from research papers, clinical trials, community insights, and AI-powered analysis
            </p>
            
            {/* Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{discoveries.filter(d => d.discovery_type === 'cure_breakthrough').length}</div>
                  <div className="text-sm text-muted-foreground">Cure Leads</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{discoveries.filter(d => d.discovery_type === 'clinical_trial').length}</div>
                  <div className="text-sm text-muted-foreground">Active Trials</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{discoveries.filter(d => d.discovery_type === 'community_symptom').length}</div>
                  <div className="text-sm text-muted-foreground">Community Patterns</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{Math.round(discoveries.reduce((sum, d) => sum + d.credibility_score, 0) / discoveries.length || 0)}</div>
                  <div className="text-sm text-muted-foreground">Avg Credibility</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discoveries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cure_breakthrough">Cure Breakthroughs</SelectItem>
                  <SelectItem value="clinical_trial">Clinical Trials</SelectItem>
                  <SelectItem value="research_paper">Research Papers</SelectItem>
                  <SelectItem value="community_symptom">Community Patterns</SelectItem>
                  <SelectItem value="ai_correlation">AI Correlations</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.impact} onValueChange={(value) => setFilters({...filters, impact: value})}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Impact Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Impact Levels</SelectItem>
                  <SelectItem value="Breakthrough">Breakthrough</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Empty State */}
          {filteredDiscoveries.length === 0 && (
            <Card className="text-center p-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">No discoveries found. Initialize data to see real T1D research.</p>
                <Button onClick={handleSeedData}>Load Sample Discoveries</Button>
              </CardContent>
            </Card>
          )}

          {/* Discovery Feed */}
          <div className="space-y-6">
            {filteredDiscoveries.map((discovery) => (
              <Card key={discovery.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(discovery.discovery_type)}
                        <Badge variant="outline">{getTypeLabel(discovery.discovery_type)}</Badge>
                        {discovery.impact_level && (
                          <Badge className={getImpactColor(discovery.impact_level)}>
                            {discovery.impact_level}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2">{discovery.title}</CardTitle>
                      <p className="text-muted-foreground">{discovery.summary}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{discovery.credibility_score}</div>
                      <div className="text-xs text-muted-foreground">Credibility</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {discovery.publication_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(discovery.publication_date).toLocaleDateString()}
                        </div>
                      )}
                      {discovery.primary_source && (
                        <Badge variant="secondary">{discovery.primary_source}</Badge>
                      )}
                    </div>
                    {discovery.source_urls && discovery.source_urls.length > 0 && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={discovery.source_urls[0]} target="_blank" rel="noopener noreferrer">
                          View Source
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
