import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useCompanyComparison } from '@/hooks/useCompanyComparison';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  GitCompare,
  Share2,
  Trash2,
  Building2,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  FlaskConical,
  Target,
  ExternalLink,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePageMeta } from '@/hooks/usePageMeta';

const formatCurrency = (value: number | null): string => {
  if (!value) return 'Undisclosed';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
};

const CompanyComparison = () => {
  usePageMeta("Company Comparison", "Compare diabetes companies side by side — devices, drugs, pipeline, and reputation.");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialIds = useMemo(() => {
    const idsParam = searchParams.get('ids');
    return idsParam ? idsParam.split(',').filter(Boolean) : [];
  }, []);

  const {
    selectedCompanyIds,
    comparisonCompanies,
    allCompanies,
    loading,
    error,
    addCompany,
    removeCompany,
    clearAll,
    canAddMore,
  } = useCompanyComparison(initialIds);

  // Sync URL with selection
  useEffect(() => {
    if (selectedCompanyIds.length > 0) {
      setSearchParams({ ids: selectedCompanyIds.join(',') });
    } else {
      setSearchParams({});
    }
  }, [selectedCompanyIds, setSearchParams]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Comparison link copied to clipboard');
  };

  const availableCompanies = allCompanies.filter(
    (c) => !selectedCompanyIds.includes(c.id)
  );

  const renderComparisonRow = (
    label: string,
    icon: React.ReactNode,
    getValue: (company: typeof comparisonCompanies[0]) => React.ReactNode
  ) => (
    <tr className="border-b border-border">
      <td className="py-3 px-4 font-medium text-muted-foreground bg-muted/30">
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
      </td>
      {comparisonCompanies.map((company) => (
        <td key={company.id} className="py-3 px-4 text-center">
          {getValue(company)}
        </td>
      ))}
      {Array.from({ length: 4 - comparisonCompanies.length }).map((_, i) => (
        <td key={`empty-${i}`} className="py-3 px-4 text-center text-muted-foreground">
          —
        </td>
      ))}
    </tr>
  );

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/companies')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <GitCompare className="h-6 w-6 text-primary" />
                Company Comparison
              </h1>
              <p className="text-muted-foreground">
                Compare up to 4 companies side-by-side
              </p>
            </div>
          </div>
          {comparisonCompanies.length >= 2 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Company Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Companies to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              {canAddMore && (
                <Select onValueChange={addCompany}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Add a company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {selectedCompanyIds.map((id) => {
                const company = allCompanies.find((c) => c.id === id);
                return company ? (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm flex items-center gap-2"
                  >
                    {company.name}
                    <button onClick={() => removeCompany(id)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-8">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && comparisonCompanies.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Companies Selected</h3>
              <p className="text-muted-foreground mb-4">
                Select companies above to start comparing
              </p>
              <Link to="/companies">
                <Button variant="outline">Browse Companies</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Single Company State */}
        {!loading && comparisonCompanies.length === 1 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Add at least one more company to compare
              </p>
            </CardContent>
          </Card>
        )}

        {/* Comparison Table */}
        {!loading && comparisonCompanies.length >= 2 && (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="py-4 px-4 text-left font-semibold w-[200px]">
                      Comparison
                    </th>
                    {comparisonCompanies.map((company) => (
                      <th key={company.id} className="py-4 px-4 text-center min-w-[180px]">
                        <div className="flex flex-col items-center gap-2">
                          {company.logo_url ? (
                            <img
                              src={company.logo_url}
                              alt={company.name}
                              className="h-10 w-10 object-contain rounded"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <Link
                            to={`/companies/${company.id}`}
                            className="font-semibold hover:text-primary transition-colors"
                          >
                            {company.name}
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => removeCompany(company.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </th>
                    ))}
                    {Array.from({ length: 4 - comparisonCompanies.length }).map((_, i) => (
                      <th key={`empty-header-${i}`} className="py-4 px-4 min-w-[180px]" />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Funding Section */}
                  <tr className="bg-muted/20">
                    <td colSpan={5} className="py-2 px-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Funding
                    </td>
                  </tr>
                  {renderComparisonRow(
                    'Total Funding',
                    <DollarSign className="h-4 w-4" />,
                    (c) => (
                      <span className="font-semibold text-primary">
                        {formatCurrency(c.total_funding_usd)}
                      </span>
                    )
                  )}
                  {renderComparisonRow(
                    'Funding Stage',
                    <Target className="h-4 w-4" />,
                    (c) => c.funding_stage || '—'
                  )}
                  {renderComparisonRow(
                    'Funding Rounds',
                    <DollarSign className="h-4 w-4" />,
                    (c) => c.funding_rounds || '—'
                  )}

                  {/* Clinical Section */}
                  <tr className="bg-muted/20">
                    <td colSpan={5} className="py-2 px-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Clinical Progress
                    </td>
                  </tr>
                  {renderComparisonRow(
                    'Clinical Stage',
                    <FlaskConical className="h-4 w-4" />,
                    (c) => (
                      <Badge variant="outline">{c.clinical_stage || 'N/A'}</Badge>
                    )
                  )}
                  {renderComparisonRow(
                    'Products',
                    <Target className="h-4 w-4" />,
                    (c) => c.productCount || 0
                  )}

                  {/* Company Info Section */}
                  <tr className="bg-muted/20">
                    <td colSpan={5} className="py-2 px-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Company Info
                    </td>
                  </tr>
                  {renderComparisonRow(
                    'Type',
                    <Building2 className="h-4 w-4" />,
                    (c) => c.company_type || '—'
                  )}
                  {renderComparisonRow(
                    'Founded',
                    <Calendar className="h-4 w-4" />,
                    (c) => c.founded_year || '—'
                  )}
                  {renderComparisonRow(
                    'Years Active',
                    <Calendar className="h-4 w-4" />,
                    (c) => (c.yearsInOperation ? `${c.yearsInOperation} years` : '—')
                  )}
                  {renderComparisonRow(
                    'Employees',
                    <Users className="h-4 w-4" />,
                    (c) => c.employee_count || '—'
                  )}
                  {renderComparisonRow(
                    'Headquarters',
                    <MapPin className="h-4 w-4" />,
                    (c) => c.headquarters || '—'
                  )}
                  {renderComparisonRow(
                    'Country',
                    <MapPin className="h-4 w-4" />,
                    (c) => c.country || '—'
                  )}

                  {/* Focus Areas Section */}
                  <tr className="bg-muted/20">
                    <td colSpan={5} className="py-2 px-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Focus Areas
                    </td>
                  </tr>
                  {renderComparisonRow(
                    'Areas',
                    <Target className="h-4 w-4" />,
                    (c) => (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {(c.focus_areas || []).slice(0, 3).map((area, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {(c.focus_areas || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(c.focus_areas || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    )
                  )}

                  {/* Links Section */}
                  <tr className="bg-muted/20">
                    <td colSpan={5} className="py-2 px-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Links
                    </td>
                  </tr>
                  {renderComparisonRow(
                    'Website',
                    <ExternalLink className="h-4 w-4" />,
                    (c) =>
                      c.website_url ? (
                        <a
                          href={c.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          Visit Site
                        </a>
                      ) : (
                        '—'
                      )
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CompanyComparison;
