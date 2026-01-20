import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InfoRail } from "@/components/InfoRail";
import { Lightbulb, ExternalLink, Search, RefreshCw, TrendingUp, Users, Building2, DollarSign, ArrowRight } from "lucide-react";
import { usePatentData } from "@/hooks/usePatentData";
import { supabase } from "@/integrations/supabase/client";

const InnovationHub = () => {
  const { data: patents, loading, error, refetch } = usePatentData();
  const [searchQuery, setSearchQuery] = useState('');
  const [topCompanies, setTopCompanies] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopCompanies = async () => {
      const { data } = await supabase
        .from('t1d_companies')
        .select('id, name, total_funding_usd, focus_areas, company_type')
        .eq('is_active', true)
        .order('total_funding_usd', { ascending: false, nullsFirst: false })
        .limit(5);
      setTopCompanies(data || []);
    };
    fetchTopCompanies();
  }, []);

  const filteredPatents = patents.filter(patent =>
    patent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patent.abstract?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patent.assignee?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgRelevance = patents.length > 0
    ? Math.round(patents.reduce((sum, p) => sum + (p.diabetes_relevance_score || 0), 0) / patents.length)
    : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Innovation Hub</h1>
          <p className="text-muted-foreground">Tracking the latest diabetes technology patents and innovations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Recent Diabetes Technology Patents
                    </CardTitle>
                    <CardDescription>Latest innovations from USPTO database</CardDescription>
                  </div>
                  <Button onClick={refetch} size="sm" variant="outline" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patents by title, abstract, or assignee..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Patents List */}
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse p-6 border rounded-lg">
                        <div className="h-4 bg-muted rounded w-2/3 mb-3"></div>
                        <div className="h-3 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-destructive">
                    <p>Error loading patents: {error}</p>
                    <Button onClick={refetch} className="mt-4">Try Again</Button>
                  </div>
                ) : filteredPatents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No patents found matching your search</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredPatents.map((patent) => (
                      <div key={patent.id} className="p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{patent.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{patent.patent_id}</span>
                              <span>•</span>
                              <span>{patent.patent_date}</span>
                            </div>
                          </div>
                          {patent.diabetes_relevance_score && (
                            <Badge variant={patent.diabetes_relevance_score >= 90 ? 'default' : 'secondary'}>
                              {patent.diabetes_relevance_score}% Relevance
                            </Badge>
                          )}
                        </div>

                        {/* Abstract */}
                        {patent.abstract && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {patent.abstract}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {patent.assignee && (
                            <div>
                              <p className="text-xs text-muted-foreground">Assignee</p>
                              <p className="font-medium">{patent.assignee}</p>
                            </div>
                          )}
                          {patent.inventors && patent.inventors.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Inventors ({patent.inventors.length})
                              </p>
                              <p className="font-medium text-sm">{patent.inventors.join(', ')}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {patent.patent_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(patent.patent_url!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View on Google Patents
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="Recent diabetes technology patents filed with the USPTO, including CGM innovations, insulin delivery systems, and artificial pancreas developments."
              whyItMatters="Patents indicate where the diabetes technology industry is heading and what breakthrough innovations may become available in the coming years."
              nextSteps="Monitor patents from leading companies, research emerging technologies, and stay informed about the future of diabetes care."
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Innovation Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Total Patents</span>
                    <span className="font-bold text-xl">{patents.length}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min((patents.length / 20) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Avg Relevance Score</span>
                    <span className="font-bold text-xl">{avgRelevance}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${avgRelevance}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">High Impact Patents</span>
                    <Badge variant="default">
                      {patents.filter(p => (p.diabetes_relevance_score || 0) >= 90).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Top Innovators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(patents.map(p => p.assignee).filter(Boolean)))
                    .slice(0, 5)
                    .map((assignee, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm">{assignee}</span>
                        <Badge variant="outline">
                          {patents.filter(p => p.assignee === assignee).length}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Top T1D Companies */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Top T1D Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCompanies.map((company) => (
                    <Link
                      key={company.id}
                      to={`/companies/${company.id}`}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <span className="text-sm font-medium">{company.name}</span>
                        <div className="text-xs text-muted-foreground">
                          {company.focus_areas?.slice(0, 2).join(', ')}
                        </div>
                      </div>
                      {company.total_funding_usd && (
                        <Badge variant="outline" className="text-xs">
                          <DollarSign className="h-3 w-3 mr-0.5" />
                          {company.total_funding_usd >= 1000000000 
                            ? `${(company.total_funding_usd / 1000000000).toFixed(1)}B`
                            : `${(company.total_funding_usd / 1000000).toFixed(0)}M`
                          }
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
                <Link to="/companies">
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View All Companies
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InnovationHub;