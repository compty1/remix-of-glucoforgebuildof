import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAdultContentSearch } from '@/hooks/useAdultContentSearch';
import { AdultSearchBar } from '@/components/adult-content/AdultSearchBar';
import { AdultFilterBar } from '@/components/adult-content/AdultFilterBar';
import { AdultPostCard } from '@/components/adult-content/AdultPostCard';
import { FeaturedResources } from '@/components/adult-content/FeaturedResources';
import { TrendingAdultTopics } from '@/components/adult-content/TrendingAdultTopics';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield,
  Lock,
  AlertTriangle,
  RefreshCw,
  Heart,
  Wine,
  Pill,
  FlaskConical,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Diabeto18Plus() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

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
  } = useAdultContentSearch();

  // Infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const verified = localStorage.getItem('diabeto_age_verified');
    if (verified === 'true') {
      setAgeVerified(true);
      setShowAgeVerification(false);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  const handleAgeVerification = (verified: boolean) => {
    if (verified) {
      localStorage.setItem('diabeto_age_verified', 'true');
      setAgeVerified(true);
      setShowAgeVerification(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleSearchChange = useCallback((query: string) => {
    updateFilters({ query });
  }, [updateFilters]);

  const handleTrendingClick = useCallback((post: any) => {
    updateFilters({ query: post.title.split(' ').slice(0, 3).join(' ') });
  }, [updateFilters]);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const { error } = await supabase.functions.invoke('seed-adult-content-expanded');
      if (error) throw error;
      toast.success('Content loaded successfully!');
      refetch();
    } catch (err) {
      toast.error('Failed to load content');
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  if (showAgeVerification && !ageVerified) {
    return (
      <Layout>
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-destructive" />
                <DialogTitle className="text-xl">Age Verification Required</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                This section contains mature content about adult situations encountered
                by Type 1 diabetics, including discussions about alcohol, intimacy,
                and recreational substances.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                By entering, you confirm that you are at least 18 years old and
                understand that this content is for educational purposes only.
              </p>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  ⚠️ This content is not medical advice. Always consult your healthcare
                  provider before making changes to your diabetes management.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => handleAgeVerification(false)}>
                I'm Under 18 — Exit
              </Button>
              <Button onClick={() => handleAgeVerification(true)}>
                <Lock className="h-4 w-4 mr-2" />
                I'm 18+ — Enter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <BackButton />
            <h1 className="text-3xl font-bold flex items-center gap-3 mt-2">
              <Shield className="h-8 w-8 text-primary" />
              Diabeto 18+
              <Badge variant="secondary">18+</Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Real talk about adult situations and diabetes from the T1D community
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSeedData}
            disabled={isSeeding}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSeeding ? 'animate-spin' : ''}`} />
            {isSeeding ? 'Loading...' : 'Refresh Content'}
          </Button>
        </div>

        {/* Disclaimer */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Disclaimer:</strong> Content reflects real community experiences and is not medical advice.
            Recreational substance use and excessive alcohol carry significant health risks, especially with diabetes.
            Always prioritize your safety and consult your healthcare team.
          </AlertDescription>
        </Alert>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <AdultSearchBar value={filters.query} onChange={handleSearchChange} />
          </CardContent>
        </Card>

        {/* Quick Category Chips */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filters.category === 'all' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => updateFilters({ category: 'all' })}
          >
            <Users className="h-3.5 w-3.5 mr-1" /> All Topics
          </Badge>
          <Badge
            variant={filters.category === 'intimacy' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => updateFilters({ category: 'intimacy' })}
          >
            <Heart className="h-3.5 w-3.5 mr-1" /> Intimacy & Sex
          </Badge>
          <Badge
            variant={filters.category === 'alcohol' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => updateFilters({ category: 'alcohol' })}
          >
            <Wine className="h-3.5 w-3.5 mr-1" /> Alcohol
          </Badge>
          <Badge
            variant={filters.category === 'drug_effects' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => updateFilters({ category: 'drug_effects' })}
          >
            <Pill className="h-3.5 w-3.5 mr-1" /> Substances
          </Badge>
          <Badge
            variant={filters.postType === 'research' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => updateFilters({ postType: filters.postType === 'research' ? 'all' : 'research' })}
          >
            <FlaskConical className="h-3.5 w-3.5 mr-1" /> Research
          </Badge>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Results Column */}
          <div className="lg:col-span-3 space-y-4">
            <AdultFilterBar
              filters={filters}
              onFilterChange={updateFilters}
              onReset={resetFilters}
            />

            {!isLoading && (
              <div className="text-sm text-muted-foreground">
                Found <strong>{totalCount}</strong> posts
                {filters.query && ` matching "${filters.query}"`}
              </div>
            )}

            {isLoading && posts.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-16 w-full" />
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
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Click "Refresh Content" to load community discussions and research articles.
                  </p>
                  <Button onClick={handleSeedData} disabled={isSeeding}>
                    {isSeeding ? 'Loading...' : 'Load Content'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {posts.map((post) => (
                    <AdultPostCard key={post.id} post={post} />
                  ))}
                </div>

                <div ref={loadMoreRef} className="py-4">
                  {isLoadingMore && (
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading more...</span>
                      </div>
                    </div>
                  )}
                  {hasMore && !isLoadingMore && (
                    <div className="flex justify-center">
                      <Button variant="outline" onClick={loadMore}>
                        Load More ({posts.length} of {totalCount})
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
            <TrendingAdultTopics onPostClick={handleTrendingClick} />
            <FeaturedResources />
          </div>
        </div>
      </div>
    </Layout>
  );
}
