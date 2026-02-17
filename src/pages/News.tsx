import { useState } from 'react';
import { Newspaper, RefreshCw, Search, AlertCircle, Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useT1DNews } from '@/hooks/useT1DNews';
import { NewsCard } from '@/components/news/NewsCard';
import { FeaturedNewsCard } from '@/components/news/FeaturedNewsCard';
import { NewsCategoryFilter } from '@/components/news/NewsCategoryFilter';
import { BackButton } from '@/components/ui/back-button';
import Layout from '@/components/Layout';
import { toast } from 'sonner';

const NewsCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-video w-full" />
    <CardContent className="p-4 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
  </Card>
);

const News = () => {
  const {
    articles,
    featuredArticles,
    loading,
    refreshing,
    error,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    refreshNews,
    getCategoryCounts,
  } = useT1DNews();

  const [localSearch, setLocalSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  const categoryCounts = getCategoryCounts();
  const mainFeatured = featuredArticles[0];
  const secondaryFeatured = featuredArticles.slice(1, 3);

  return (
    <Layout>
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border/50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <BackButton fallbackPath="/dashboard" className="mb-4" />
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Newspaper className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">T1D News</h1>
                <p className="text-muted-foreground text-sm">
                  Latest news and updates from the Type 1 Diabetes community
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshNews}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success('Subscribe feature coming soon!')}>
                <Rss className="h-4 w-4" />
                Subscribe
              </Button>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news articles..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="default">Search</Button>
          </form>

          {/* Category Filter */}
          <NewsCategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Error state */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. Showing cached articles if available.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="space-y-8">
            {/* Featured skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Skeleton className="h-[400px] md:h-[500px] rounded-xl" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Skeleton className="h-[200px] rounded-lg" />
                <Skeleton className="h-[200px] rounded-lg" />
              </div>
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <NewsCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : articles.length === 0 && featuredArticles.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Newspaper className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No news articles yet</h3>
            <p className="text-muted-foreground mb-4">
              Click refresh to fetch the latest T1D news from around the web.
            </p>
            <Button onClick={refreshNews} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Fetch News
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Section */}
            {mainFeatured && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  Featured Stories
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <FeaturedNewsCard article={mainFeatured} isMain />
                  </div>
                  {secondaryFeatured.length > 0 && (
                    <div className="grid grid-cols-1 gap-4">
                      {secondaryFeatured.map((article) => (
                        <FeaturedNewsCard key={article.id} article={article} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Latest News Grid */}
            {articles.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  Latest News
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({articles.length} articles)
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default News;
