import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CommandCenterWidget } from '@/components/CommandCenterWidget';
import { InfoRail } from '@/components/InfoRail';
import { ResearchAnalysisModal } from '@/components/ResearchAnalysisModal';
import Layout from '@/components/Layout';
import { useResearchFeed } from '@/hooks/useResearchFeed';
import { useMedicalResearchPapers } from '@/hooks/useMedicalResearchPapers';
import { useClinicalTrialsDetailed } from '@/hooks/useClinicalTrialsDetailed';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  FileText, 
  Users, 
  BarChart3,
  TrendingUp,
  BookOpen,
  ExternalLink,
  Filter,
  Calendar,
  Star,
  ThumbsUp,
  MessageSquare,
  Download,
  Share2,
  Bookmark,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ResearchItem {
  id: string;
  title: string;
  link: string;
  summary: string;
  source: string;
  impact_level: string;
  created_at: string;
  updated_at: string;
}

interface ResearchCardProps {
  item: ResearchItem;
  onAnalyze: (item: ResearchItem) => void;
}

const ResearchCard: React.FC<ResearchCardProps> = ({ item, onAnalyze }) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-success text-success-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'Low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="command-center-widget">
      <CardHeader>
        <div className="flex justify-between items-start mb-3">
          <Badge className={getImpactColor(item.impact_level)}>
            {item.impact_level} Impact
          </Badge>
          <Badge variant="outline">{item.source}</Badge>
        </div>
        
        <CardTitle className="text-xl font-heading leading-tight mb-2">
          {item.title}
        </CardTitle>
        
        <div className="text-sm text-muted-foreground">
          <p>{item.source} • {formatDate(item.created_at)}</p>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div>
            <h4 className="font-medium text-sm text-foreground mb-2">Summary</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.summary}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={() => onAnalyze(item)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Read Analysis
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={item.link || 'https://pubmed.ncbi.nlm.nih.gov'} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button size="sm" variant="outline" onClick={async () => {
              if (!user) {
                toast({
                  title: "Sign In Required",
                  description: "Please sign in to bookmark research items.",
                  variant: "destructive",
                });
                return;
              }

              try {
                // Use research_items ID as card_id since they're discovery cards
                const { error } = await supabase
                  .from('saved_insights')
                  .insert({ user_id: user.id, card_id: item.id });

                if (error) {
                  if (error.code === '23505') { // Duplicate key error
                    toast({
                      title: "Already Saved",
                      description: "This item is already in your bookmarks.",
                    });
                  } else {
                    throw error;
                  }
                } else {
                  toast({
                    title: "Bookmarked!",
                    description: "Research paper saved to your reading list.",
                  });
                }
              } catch {
                toast({
                  title: "Error",
                  description: "Failed to bookmark item. Please try again.",
                  variant: "destructive",
                });
              }
            }}>
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: item.title,
                  text: item.summary,
                  url: item.link
                });
              } else {
                navigator.clipboard.writeText(`${item.title}: ${item.link}`);
                toast({
                  title: "Link copied!",
                  description: "Research paper link copied to clipboard.",
                });
              }
            }}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ResearchCardSkeleton = () => (
  <Card className="command-center-widget">
    <CardHeader>
      <div className="flex justify-between items-start mb-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ResearchHub = () => {
  const [selectedTab, setSelectedTab] = useState('rss');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showType1Only, setShowType1Only] = useState(true);

  // Debounce search input (Issue 135)
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  };
  
  const { data: researchData, loading: rssLoading, error: rssError, refreshFeed } = useResearchFeed();
  const { data: medicalPapers, loading: papersLoading, error: papersError, refreshData: refreshPapers } = useMedicalResearchPapers({ type1Only: showType1Only });
  const { data: clinicalTrials, loading: trialsLoading, error: trialsError, refreshData: refreshTrials } = useClinicalTrialsDetailed();
  
  const loading = rssLoading || papersLoading || trialsLoading;
  const error = rssError || papersError || trialsError;

  const getTimePeriodFilter = (item: ResearchItem, period: string) => {
    if (period === 'all') return true;
    
    const itemDate = new Date(item.created_at);
    const now = new Date();
    
    switch (period) {
      case 'week':
        return (now.getTime() - itemDate.getTime()) <= (7 * 24 * 60 * 60 * 1000);
      case 'month':
        return (now.getTime() - itemDate.getTime()) <= (30 * 24 * 60 * 60 * 1000);
      case 'year':
        return (now.getTime() - itemDate.getTime()) <= (365 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  };

  // Combine all data sources based on selected tab
  const getCombinedData = () => {
    if (selectedTab === 'rss') return researchData || [];
    if (selectedTab === 'papers') {
      return (medicalPapers || []).map(paper => ({
        id: paper.id,
        title: paper.title,
        link: paper.full_text_url || paper.pdf_url || `https://doi.org/${paper.doi}`,
        summary: paper.abstract || 'No abstract available',
        source: paper.source_database,
        impact_level: paper.open_access ? 'High' : 'Medium',
        created_at: paper.publication_date || paper.created_at,
        updated_at: paper.updated_at
      }));
    }
    if (selectedTab === 'trials') {
      return (clinicalTrials || []).map(trial => ({
        id: trial.id,
        title: trial.title,
        link: trial.study_url || `https://clinicaltrials.gov/study/${trial.nct_id}`,
        summary: trial.brief_summary || 'No summary available',
        source: `ClinicalTrials.gov - ${trial.phase || 'N/A'}`,
        impact_level: trial.phase === 'Phase 3' || trial.phase === 'Phase 4' ? 'High' : 'Medium',
        created_at: trial.start_date || trial.created_at,
        updated_at: trial.updated_at
      }));
    }
    return [];
  };

  const filteredPapers = getCombinedData().filter(item => {
    const matchesCategory = selectedCategory === 'all' || 
                           item.source.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesImpact = selectedImpact === 'all' || 
                         item.impact_level.toLowerCase() === selectedImpact.toLowerCase();
    const matchesTimePeriod = getTimePeriodFilter(item, selectedTimePeriod);
    const matchesSearch = item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         item.summary.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesCategory && matchesImpact && matchesTimePeriod && matchesSearch;
  });

  const handleAnalyze = (item: ResearchItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Research & Discovery Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Plain-language breakdowns of the most important Type 1 Diabetes scientific studies. 
            Where complex research meets actionable insights.
          </p>
          <Badge variant="outline" className="gap-1">
            <Star className="h-3 w-3 fill-current" />
            Focused on Type 1 Diabetes Research
          </Badge>
        </section>

        {/* Breaking Research Highlight */}
        <section className="mb-12">
          <Card className="hero-gradient text-white p-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-6 w-6 text-warning fill-current" />
              <Badge className="bg-white/20 text-white">Breaking Research</Badge>
            </div>
            <h2 className="text-2xl font-heading font-bold mb-4">
              Latest Research from Leading Medical Journals
            </h2>
            <p className="text-lg text-white/90 mb-6 max-w-3xl">
              Stay up-to-date with the most recent Type 1 diabetes research from PubMed and clinical trials. 
              New studies are automatically curated and summarized for easy understanding.
            </p>
            <div className="flex gap-4">
              <Button 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => {
                  refreshFeed();
                  refreshPapers();
                  refreshTrials();
                }}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh All Sources
              </Button>
            </div>
          </Card>
        </section>

        {/* Data Source Tabs */}
        <section className="mb-8">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rss">PubMed RSS ({(researchData || []).length})</TabsTrigger>
              <TabsTrigger value="papers">Medical Papers ({(medicalPapers || []).length})</TabsTrigger>
              <TabsTrigger value="trials">Clinical Trials ({(clinicalTrials || []).length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </section>

        {/* Filters and Search */}
        <section className="mb-8">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Primary Filters */}
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('all')}
                  >
                    All Sources
                  </Button>
                  {selectedTab === 'papers' && (
                    <>
                      <Button 
                        variant={selectedCategory === 'pubmed' ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory('pubmed')}
                      >
                        PubMed Only
                      </Button>
                      <Button 
                        variant={selectedCategory === 'europe pmc' ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory('europe pmc')}
                      >
                        Europe PMC
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="relative w-full lg:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search research papers..."
                    className="pl-10 w-full lg:w-80"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Time Period</label>
                  <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                      <SelectItem value="year">Past Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Impact Level</label>
                  <Select value={selectedImpact} onValueChange={setSelectedImpact}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select impact level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="high">High Impact</SelectItem>
                      <SelectItem value="medium">Medium Impact</SelectItem>
                      <SelectItem value="low">Low Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Research Focus</label>
                  <Select value={showType1Only ? 'type1' : 'all'} onValueChange={(v) => setShowType1Only(v === 'type1')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Research focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="type1">Type 1 Diabetes Only</SelectItem>
                      <SelectItem value="all">All Diabetes Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedImpact('all');
                      setSelectedTimePeriod('all');
                      setSearchTerm('');
                      setShowType1Only(true);
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Error State */}
        {error && (
          <section className="mb-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          </section>
        )}

        {/* Research Papers Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }, (_, i) => <ResearchCardSkeleton key={i} />)
          ) : filteredPapers.length > 0 ? (
            // Actual data
            filteredPapers.map((item) => (
              <ResearchCard key={item.id} item={item} onAnalyze={handleAnalyze} />
            ))
          ) : (
            // No results
            <div className="col-span-2 text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No research papers found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'No research data available yet. Try refreshing the feed.'
                }
              </p>
            </div>
          )}
        </section>

        {/* Info Rail */}
        <section className="mb-8">
          <InfoRail
            whatThisShows="This hub aggregates and analyzes the latest Type 1 diabetes research from major medical journals. Each paper includes summaries and links to the original source."
            whyItMatters="Staying current with research helps the T1D community understand emerging treatments, make informed decisions about care, and participate in clinical trials. Breaking down complex studies makes science accessible."
            nextSteps="Read full articles for papers that interest you, join community discussions to share insights, or set up alerts for specific research areas you want to follow."
          />
        </section>

        {/* Jargon Buster CTA */}
        <section>
          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="text-center">
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                Don't Understand the Science?
              </h2>
              <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our Jargon Buster breaks down complex medical terms and research methodology 
                into plain English that anyone can understand.
              </p>
              <Button size="lg" className="mr-4">
                Explore Jargon Buster
                <BookOpen className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Request Explanation
              </Button>
            </div>
          </Card>
        </section>

        {/* Research Analysis Modal */}
        <ResearchAnalysisModal 
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </Layout>
  );
};

export default ResearchHub;