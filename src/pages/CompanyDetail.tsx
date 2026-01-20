import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { InfoRail } from '@/components/InfoRail';
import { CompanyCard } from '@/components/companies/CompanyCard';
import { VerifiedLink, linkFallbacks } from '@/components/ui/verified-link';
import { useCompanyById, useRelatedCompanies } from '@/hooks/useT1DCompanies';
import {
  ArrowLeft, Building2, MapPin, Calendar, Users, DollarSign,
  Globe, Linkedin, Twitter, ExternalLink, Beaker, TrendingUp,
  Award, Clock, Link as LinkIcon, Package
} from 'lucide-react';

const CompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company, loading, error } = useCompanyById(id);
  const { companies: relatedCompanies } = useRelatedCompanies(
    company?.focus_areas || null,
    company?.id
  );

  const formatFunding = (amount: number | null) => {
    if (!amount) return 'N/A';
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const getCompanyTypeColor = (type: string | null) => {
    switch (type) {
      case 'public': return 'bg-success/10 text-success border-success/20';
      case 'startup': return 'bg-primary/10 text-primary border-primary/20';
      case 'acquired': return 'bg-warning/10 text-warning border-warning/20';
      case 'non-profit': return 'bg-highlight/10 text-highlight border-highlight/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !company) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <Card className="border-destructive/50">
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Company not found</h3>
          <p className="text-muted-foreground mt-1">
            {error || "The company you're looking for doesn't exist."}
          </p>
              <Button onClick={() => navigate('/companies')} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Companies
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/companies')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={company.name} 
                  className="h-16 w-16 rounded-lg object-contain bg-white border"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {company.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline" className={getCompanyTypeColor(company.company_type)}>
                    {company.company_type || 'Unknown'}
                  </Badge>
                  {company.clinical_stage && (
                    <Badge variant="secondary">{company.clinical_stage}</Badge>
                  )}
                  {company.acquired_by && (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      Acquired by {company.acquired_by}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <p className="text-muted-foreground">
              {company.description || 'No description available'}
            </p>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-3">
              {company.website_url && (
                <VerifiedLink 
                  href={company.website_url}
                  isVerified={company.link_verified}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Globe className="h-4 w-4" />
                  Visit Website
                </VerifiedLink>
              )}
              {company.linkedin_url && (
                <VerifiedLink 
                  href={company.linkedin_url}
                  fallbackHref={company.name ? linkFallbacks.linkedin(company.name.toLowerCase().replace(/\s+/g, '-')) : undefined}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#0077B5] text-white hover:bg-[#0077B5]/90"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </VerifiedLink>
              )}
              {company.crunchbase_url && (
                <VerifiedLink 
                  href={company.crunchbase_url}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-muted"
                >
                  <ExternalLink className="h-4 w-4" />
                  Crunchbase
                </VerifiedLink>
              )}
              {company.twitter_url && (
                <VerifiedLink 
                  href={company.twitter_url}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-muted"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </VerifiedLink>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Company Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Headquarters
                  </div>
                  <div className="font-medium">{company.headquarters || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    Country
                  </div>
                  <div className="font-medium">{company.country || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Founded
                  </div>
                  <div className="font-medium">{company.founded_year || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Employees
                  </div>
                  <div className="font-medium">{company.employee_count || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    Total Funding
                  </div>
                  <div className="font-medium text-success">{formatFunding(company.total_funding_usd)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Stage
                  </div>
                  <div className="font-medium">{company.funding_stage || 'N/A'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Technology Summary */}
            {company.technology_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-primary" />
                    Technology
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{company.technology_summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Products */}
            {company.products && company.products.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Products & Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.products.map((product: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {product.status}
                          </Badge>
                        </div>
                        {product.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Key People */}
            {company.key_people && company.key_people.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Key People
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.key_people.map((person: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{person.name}</div>
                          <div className="text-sm text-muted-foreground">{person.role}</div>
                        </div>
                        {person.linkedin && (
                          <VerifiedLink href={person.linkedin} className="ml-auto">
                            <Linkedin className="h-4 w-4" />
                          </VerifiedLink>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Investors */}
            {company.investors && company.investors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Investors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {company.investors.map((investor: any, i: number) => (
                      <Badge key={i} variant="outline" className="text-sm">
                        {investor.name}
                        {investor.type && (
                          <span className="ml-1 text-muted-foreground">({investor.type})</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Focus Areas */}
            {company.focus_areas && company.focus_areas.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Focus Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {company.focus_areas.map((area, i) => (
                      <Badge key={i} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Source */}
            <InfoRail
              whatThisShows={`Data sourced from ${company.data_source || 'verified sources'}. Last updated: ${new Date(company.updated_at).toLocaleDateString()}`}
              whyItMatters={company.acquired_by ? `This company was acquired by ${company.acquired_by}${company.acquisition_date ? ` on ${new Date(company.acquisition_date).toLocaleDateString()}` : ''}.` : "Track funding and clinical progress for this T1D innovator."}
            />

            {/* Related Companies */}
            {relatedCompanies.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Related Companies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedCompanies.slice(0, 4).map(related => (
                    <Link 
                      key={related.id} 
                      to={`/companies/${related.id}`}
                      className="block p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium text-sm">{related.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {related.focus_areas?.slice(0, 2).join(', ')}
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CompanyDetail;
