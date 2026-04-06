import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoRail } from '@/components/InfoRail';
import { CompanyCard } from '@/components/companies/CompanyCard';
import CompanyComparisonBar from '@/components/companies/CompanyComparisonBar';
import FundingTimelineChart from '@/components/companies/FundingTimelineChart';
import { useT1DCompanies, CompanyFilters } from '@/hooks/useT1DCompanies';
import { BackButton } from '@/components/ui/back-button';
import { 
  Search, Building2, DollarSign, TrendingUp, Globe, 
  Filter, RefreshCw, Users, Beaker, Heart, GitCompare
} from 'lucide-react';

const Companies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [companyType, setCompanyType] = useState<string>('');
  const [focusArea, setFocusArea] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  const filters: CompanyFilters = useMemo(() => ({
    search: searchQuery,
    companyType: companyType && companyType !== 'all' ? companyType : undefined,
    focusArea: focusArea && focusArea !== 'all' ? focusArea : undefined,
    country: country && country !== 'all' ? country : undefined,
  }), [searchQuery, companyType, focusArea, country]);

  const { companies, loading, error, stats, refetch } = useT1DCompanies(filters);

  const toggleCompareSelection = (id: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(id)) {
        return prev.filter(cId => cId !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const selectedCompaniesInfo = useMemo(() => {
    return companies
      .filter(c => selectedForComparison.includes(c.id))
      .map(c => ({ id: c.id, name: c.name }));
  }, [companies, selectedForComparison]);

  // Get unique values for filters
  const focusAreas = useMemo(() => {
    const areas = new Set<string>();
    companies.forEach(c => c.focus_areas?.forEach(a => areas.add(a)));
    return Array.from(areas).sort();
  }, [companies]);

  const countries = useMemo(() => {
    const c = new Set<string>();
    companies.forEach(comp => comp.country && c.add(comp.country));
    return Array.from(c).sort();
  }, [companies]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(0)}M`;
    return `$${amount.toLocaleString()}`;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCompanyType('');
    setFocusArea('');
    setCountry('');
  };

  const hasFilters = searchQuery || companyType || focusArea || country;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <BackButton fallbackPath="/dashboard" />
        
        {/* Hero Section */}
        <div className="text-center space-y-3 py-6">
          <div className="flex items-center justify-center gap-3">
            <Building2 className="h-10 w-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              T1D Innovation Landscape
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore {stats?.totalCompanies || 60}+ companies and startups working to transform 
            Type 1 diabetes treatment, from CGM technology to cure research.
          </p>
          <p className="text-sm text-muted-foreground">
            <GitCompare className="h-4 w-4 inline mr-1" />
            Select up to 4 companies to compare side-by-side
          </p>
        </div>

        {/* Funding Timeline Chart */}
        <FundingTimelineChart />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? <Skeleton className="h-7 w-12" /> : stats?.totalCompanies || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Companies</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? <Skeleton className="h-7 w-16" /> : formatCurrency(stats?.totalFunding || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Funding</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-highlight/5 to-highlight/10 border-highlight/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-highlight/10">
                  <Beaker className="h-5 w-5 text-highlight" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? <Skeleton className="h-7 w-12" /> : stats?.byType?.startup || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Startups</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Heart className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? <Skeleton className="h-7 w-12" /> : stats?.byFocusArea?.['Cure Research'] || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Cure Research</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search & Filters */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search companies, technologies, focus areas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" onClick={() => refetch()} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Select value={companyType} onValueChange={setCompanyType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="acquired">Acquired</SelectItem>
                      <SelectItem value="non-profit">Non-Profit</SelectItem>
                      <SelectItem value="subsidiary">Subsidiary</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={focusArea} onValueChange={setFocusArea}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Focus Area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Focus Areas</SelectItem>
                      {focusAreas.map(area => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>

                {hasFilters && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    Showing {companies.length} of {stats?.totalCompanies || 0} companies
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error State */}
            {error && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-4 text-center">
                  <p className="text-destructive">{error}</p>
                  <Button variant="outline" onClick={() => refetch()} className="mt-2">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Companies Grid */}
            {!loading && !error && (
              <>
                {companies.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No companies found</h3>
                      <p className="text-muted-foreground mt-1">
                        Try adjusting your search or filters
                      </p>
                      {hasFilters && (
                        <Button variant="outline" onClick={clearFilters} className="mt-4">
                          Clear Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companies.map(company => (
                      <CompanyCard 
                        key={company.id} 
                        company={company}
                        isSelected={selectedForComparison.includes(company.id)}
                        onToggleCompare={toggleCompareSelection}
                        showCompareCheckbox={true}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="This database tracks 60+ companies actively working on Type 1 diabetes solutions, from CGM manufacturers to cure research pioneers."
              whyItMatters="Understanding the T1D innovation landscape helps you track cure progress and new technologies."
              nextSteps="Click on any company to view detailed information, funding history, and products."
            />

            {/* Top Focus Areas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Top Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats?.byFocusArea && Object.entries(stats.byFocusArea)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([area, count]) => (
                    <div 
                      key={area} 
                      className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded transition-colors"
                      onClick={() => setFocusArea(area)}
                    >
                      <span className="text-foreground">{area}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Top Countries */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  By Country
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats?.byCountry && Object.entries(stats.byCountry)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([c, count]) => (
                    <div 
                      key={c} 
                      className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded transition-colors"
                      onClick={() => setCountry(c)}
                    >
                      <span className="text-foreground">{c}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Company Comparison Bar */}
        <CompanyComparisonBar 
          selectedCompanies={selectedCompaniesInfo}
          onRemove={(id) => setSelectedForComparison(prev => prev.filter(cId => cId !== id))}
          onClearAll={() => setSelectedForComparison([])}
        />
      </div>
    </Layout>
  );
};

export default Companies;
