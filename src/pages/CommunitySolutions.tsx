import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, RefreshCw, AlertTriangle, Bell, Bookmark } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommunitySearchBar } from '@/components/community/CommunitySearchBar';
import { FilterBar } from '@/components/community/FilterBar';
import { SolutionCard } from '@/components/community/SolutionCard';
import { TopicGrid } from '@/components/community/TopicGrid';
import { TrendingSolutions } from '@/components/community/TrendingSolutions';
import { DataRefreshBanner } from '@/components/community/DataRefreshBanner';
import { SavedPostsList } from '@/components/community/SavedPostsList';
import { AlertPreferencesModal } from '@/components/community/AlertPreferencesModal';
import { 
  useCommunitySearch, 
  useAvailableSources,
  useRefreshCommunityData,
  type CommunityPost 
} from '@/hooks/useCommunitySearch';

const CommunitySolutions: React.FC = () => {
  const navigate = useNavigate();
  const { triggerRefresh, isRefreshing } = useRefreshCommunityData();
  const [activeTab, setActiveTab] = useState('all');
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  const {
    posts,
    totalCount,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    filters,
    updateFilters,
    loadMore,
    resetFilters,
    refetch,
  } = useCommunitySearch();

  // Infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  const { data: availableSources = [] } = useAvailableSources();

  const handleSearchChange = useCallback((query: string) => {
    updateFilters({ query });
  }, [updateFilters]);

  const handleQuickTopic = useCallback((keywords: string) => {
    updateFilters({ query: keywords.split(' ')[0] });
  }, [updateFilters]);

  const handleTopicSelect = useCallback((keywords: string) => {
    updateFilters({ query: keywords.split(' ')[0] });
    // Scroll to results
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, [updateFilters]);

  const handleAskAI = useCallback((post: CommunityPost) => {
    // Navigate to T1D Companion with pre-filled question and full post context
    navigate('/t1d-companion', { 
      state: { 
        initialMessage: `I found this community post and would like your help understanding it:\n\nTitle: ${post.title}\n\nContent: ${post.content || 'No content'}\n\nCan you explain this and provide additional context?`,
        postContext: {
          title: post.title,
          content: post.content,
          source: post.source,
          score: post.score,
          device_mentioned: post.device_mentioned,
          topic_tags: post.topic_tags,
          url: post.url,
        }
      } 
    });
  }, [navigate]);

  const handleTrendingClick = useCallback((post: CommunityPost) => {
    updateFilters({ query: post.title.split(' ').slice(0, 3).join(' ') });
  }, [updateFilters]);

  const handleSimilarClick = useCallback((post: CommunityPost) => {
    updateFilters({ query: post.title.split(' ').slice(0, 3).join(' ') });
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, [updateFilters]);

  const handleRefresh = async () => {
    try {
      await triggerRefresh();
      refetch();
    } catch (e) {
      // Error handled by hook
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Community Solutions
            </h1>
            <p className="text-muted-foreground mt-1">
              Find real answers and solutions from the T1D community across Reddit and social media
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAlertModal(true)}
            >
              <Bell className="h-4 w-4 mr-2" />
              Get Alerts
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        {/* Data Refresh Banner (shows when empty) */}
        <DataRefreshBanner 
          isEmpty={posts.length === 0 && !isLoading} 
          onRefreshComplete={() => refetch()} 
        />

        {/* Disclaimer */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Disclaimer:</strong> Community posts are for informational purposes only and should not replace professional medical advice. 
            Always consult your healthcare team before making changes to your diabetes management.
          </AlertDescription>
        </Alert>

        {/* Search Section */}
        <Card>
          <CardContent className="pt-6">
            <CommunitySearchBar
              value={filters.query}
              onChange={handleSearchChange}
              onQuickTopic={handleQuickTopic}
            />
          </CardContent>
        </Card>

        {/* Topic Grid */}
        <TopicGrid onTopicSelect={handleTopicSelect} />

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              <Users className="h-4 w-4 mr-2" />
              All Posts
            </TabsTrigger>
            <TabsTrigger value="saved">
              <Bookmark className="h-4 w-4 mr-2" />
              My Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="results-section">
              {/* Results Column */}
              <div className="lg:col-span-3 space-y-4">
                {/* Filter Bar */}
                <FilterBar
                  filters={filters}
                  onFilterChange={updateFilters}
                  onReset={resetFilters}
                  availableSources={availableSources}
                />

                {/* Results Count */}
                {!isLoading && (
                  <div className="text-sm text-muted-foreground">
                    Found <strong>{totalCount}</strong> posts
                    {filters.query && ` matching "${filters.query}"`}
                  </div>
                )}

                {/* Results Grid */}
                {isLoading && posts.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6 space-y-4">
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-16 w-full" />
                          <div className="flex gap-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : posts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No posts found</h3>
                      <p className="text-muted-foreground mb-4">
                        {filters.query
                          ? `No posts matching "${filters.query}". Try a different search term or reset filters.`
                          : 'Click "Refresh Data" to fetch the latest community discussions.'}
                      </p>
                      {filters.query && (
                        <Button variant="outline" onClick={resetFilters}>
                          Reset Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {posts.map((post) => (
                        <SolutionCard
                          key={post.id}
                          post={post}
                          onAskAI={handleAskAI}
                          onSimilarClick={handleSimilarClick}
                        />
                      ))}
                    </div>

                    {/* Infinite Scroll Trigger & Load More */}
                    <div ref={loadMoreRef} className="py-4">
                      {isLoadingMore && (
                        <div className="flex justify-center">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Loading more posts...</span>
                          </div>
                        </div>
                      )}
                      {hasMore && !isLoadingMore && (
                        <div className="flex justify-center">
                          <Button variant="outline" onClick={loadMore}>
                            Load More Posts ({posts.length} of {totalCount})
                          </Button>
                        </div>
                      )}
                      {!hasMore && posts.length > 0 && (
                        <div className="text-center text-muted-foreground text-sm">
                          Showing all {posts.length} posts
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <TrendingSolutions onPostClick={handleTrendingClick} />

                {/* Data Sources Info */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">Data Sources</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• r/diabetes</li>
                      <li>• r/diabetes_t1</li>
                      <li>• r/dexcom</li>
                      <li>• r/omnipod</li>
                      <li>• r/Type1Diabetes</li>
                      <li>• r/InsulinPumps</li>
                      <li>• r/tandemdiabetes</li>
                      <li>• r/medtronicdiabetes</li>
                      <li>• r/cgm</li>
                      <li>• And more...</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                      Data refreshed regularly. All personally identifiable information is removed.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <SavedPostsList onAskAI={handleAskAI} />
          </TabsContent>
        </Tabs>

        {/* Alert Preferences Modal */}
        <AlertPreferencesModal 
          isOpen={showAlertModal} 
          onClose={() => setShowAlertModal(false)} 
        />
      </div>
    </Layout>
  );
};

export default CommunitySolutions;
