import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoRail } from '@/components/InfoRail';
import { Skeleton } from '@/components/ui/skeleton';
import { EntityLogo } from '@/components/ui/entity-logo';
import { useDiabetesOrganizations, Organization } from '@/hooks/useDiabetesOrganizations';
import { 
  Building2, 
  Search, 
  ExternalLink, 
  Users, 
  Calendar,
  DollarSign,
  Target,
  Globe,
  Heart,
  BookOpen,
  Award,
  Star,
  Filter
} from 'lucide-react';

export default function DiabetesOrganizations() {
  const { organizations, loading, error } = useDiabetesOrganizations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.mission_statement?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || org.org_type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'research': return 'bg-primary/10 text-primary border-primary/20';
      case 'advocacy': return 'bg-success/10 text-success border-success/20';
      case 'support': return 'bg-highlight/10 text-highlight border-highlight/20';
      case 'education': return 'bg-warning/10 text-warning border-warning/20';
      case 'hybrid': return 'bg-accent/10 text-accent border-accent/20';
      case 'foundation': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const totalFunding = organizations.reduce((sum, org) => sum + (org.annual_revenue || 0), 0);
  const totalVolunteers = organizations.reduce((sum, org) => sum + (org.volunteer_count || 0), 0);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <BackButton fallbackPath="/dashboard" />
          <div className="space-y-6 mt-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
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
        <BackButton fallbackPath="/dashboard" />

        {/* Hero Section */}
        <section className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-success rounded-xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Diabetes Organizations</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive directory of organizations dedicated to T1D research, advocacy, 
            support, and education. Verified data on funding, leadership, and impact.
          </p>
        </section>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 text-center">
              <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{organizations.length}</p>
              <p className="text-sm text-muted-foreground">Organizations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <DollarSign className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatCurrency(totalFunding)}</p>
              <p className="text-sm text-muted-foreground">Combined Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="h-8 w-8 text-highlight mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalVolunteers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Volunteers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Globe className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold">170+</p>
              <p className="text-sm text-muted-foreground">Countries Served</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Search & Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search organizations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Organization Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="advocacy">Advocacy</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Organizations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOrganizations.map((org) => (
                <Card key={org.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <EntityLogo
                        type="organization"
                        name={org.name}
                        websiteUrl={org.website_url}
                        size="lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {org.name}
                              {org.charity_navigator_rating >= 4 && (
                                <Star className="h-4 w-4 text-warning fill-current" />
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              Est. {org.founded_year} • {org.headquarters}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className={getTypeColor(org.org_type)}>
                            {org.org_type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {org.mission_statement}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Annual Revenue</p>
                        <p className="font-semibold">{formatCurrency(org.annual_revenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Volunteers</p>
                        <p className="font-semibold">{org.volunteer_count.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Current Projects */}
                    {org.current_projects.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Projects</p>
                        <div className="flex flex-wrap gap-1">
                          {org.current_projects.slice(0, 2).map((project, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {project.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => window.open(org.website_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Website
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => window.open(org.donate_url, '_blank')}
                      >
                        <Heart className="h-3 w-3" />
                        Donate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="Directory of verified diabetes organizations with real data on funding, leadership, and current projects."
              whyItMatters="Know where your donations go and find organizations aligned with your values and interests."
              nextSteps="Research organizations before donating. Consider volunteering or applying for their programs."
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-warning" />
                  Top Rated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {organizations
                    .filter(org => org.charity_navigator_rating >= 4)
                    .slice(0, 4)
                    .map(org => (
                      <div key={org.id} className="flex items-center justify-between">
                        <span className="text-sm">{org.acronym}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: org.charity_navigator_rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-warning fill-current" />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  By Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['research', 'advocacy', 'support', 'education'].map(type => {
                    const count = organizations.filter(o => o.org_type === type).length;
                    return (
                      <div 
                        key={type} 
                        className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 p-2 rounded"
                        onClick={() => setSelectedType(type)}
                      >
                        <span className="capitalize">{type}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
