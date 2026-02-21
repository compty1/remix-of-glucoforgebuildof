import { useState } from "react";
import { usePageMeta } from '@/hooks/usePageMeta';
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InfoRail } from "@/components/InfoRail";
import { DollarSign, Search, RefreshCw, TrendingUp, Calendar, Building, Info } from "lucide-react";
import { useResearchFunding } from "@/hooks/useResearchFunding";
import { FundingDetailModal } from "@/components/funding/FundingDetailModal";

interface FundingProject {
  id: string;
  project_number: string | null;
  project_title: string;
  principal_investigator: string | null;
  organization: string | null;
  fiscal_year: number | null;
  funding_amount: number | null;
  project_start_date: string | null;
  project_end_date: string | null;
  abstract: string | null;
  nih_spending_category?: string | null;
}

const ResearchFunding = () => {
  usePageMeta('Research Funding', 'Track NIH-funded T1D research projects, grant allocations, and principal investigators.');
  const { data: funding, loading, error, refetch } = useResearchFunding();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<FundingProject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProjectClick = (project: FundingProject) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const filteredFunding = funding.filter(project =>
    project.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.principal_investigator?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.abstract?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFunding = funding.reduce((sum, p) => sum + (p.funding_amount || 0), 0);
  const avgFunding = funding.length > 0 ? totalFunding / funding.length : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground">Research Funding Dashboard</h1>
            <Badge variant="outline" className="text-muted-foreground border-muted-foreground/40 text-xs">
              Reference Data
            </Badge>
          </div>
          <p className="text-muted-foreground">NIH-funded diabetes research projects and grant tracking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      NIH Diabetes Research Grants
                    </CardTitle>
                    <CardDescription>Active and recent diabetes research funding from NIH RePORTER</CardDescription>
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
                      placeholder="Search by title, PI, or organization..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Funding List */}
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
                    <p>Error loading funding data: {error}</p>
                    <Button onClick={refetch} className="mt-4">Try Again</Button>
                  </div>
                ) : filteredFunding.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No funding projects found matching your search</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredFunding.map((project) => (
                      <div 
                        key={project.id} 
                        className="p-6 border rounded-lg hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer"
                        onClick={() => handleProjectClick(project as FundingProject)}
                      >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{project.project_title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{project.project_number}</span>
                              <span>•</span>
                              <Badge variant="outline">{project.fiscal_year}</Badge>
                            </div>
                          </div>
                          {project.funding_amount && (
                            <div className="text-right">
                              <div className="font-bold text-xl text-success">
                                ${(project.funding_amount / 1000000).toFixed(2)}M
                              </div>
                              <div className="text-xs text-muted-foreground">Total Award</div>
                            </div>
                          )}
                        </div>

                        {/* PI and Organization */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {project.principal_investigator && (
                            <div>
                              <p className="text-xs text-muted-foreground">Principal Investigator</p>
                              <p className="font-medium">{project.principal_investigator}</p>
                            </div>
                          )}
                          {project.organization && (
                            <div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                Institution
                              </p>
                              <p className="font-medium">{project.organization}</p>
                            </div>
                          )}
                        </div>

                        {/* Project Timeline */}
                        {(project.project_start_date || project.project_end_date) && (
                          <div className="mb-4">
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <Calendar className="h-3 w-3" />
                              Project Timeline
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              {project.project_start_date && (
                                <span>{new Date(project.project_start_date).toLocaleDateString()}</span>
                              )}
                              {project.project_start_date && project.project_end_date && <span>→</span>}
                              {project.project_end_date && (
                                <span>{new Date(project.project_end_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Abstract Preview + Learn More */}
                        {project.abstract && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {project.abstract}
                            </p>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="mt-2 p-0 h-auto text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProjectClick(project as FundingProject);
                              }}
                            >
                              <Info className="h-3 w-3 mr-1" />
                              Learn More
                            </Button>
                          </div>
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
              whatThisShows="NIH-funded research grants focused on diabetes, including basic science, clinical trials, and translational research projects."
              whyItMatters="Tracking research funding helps understand where scientific breakthroughs may come from and which institutions are leading diabetes research."
              nextSteps="Monitor funded projects to stay informed about cutting-edge research that may lead to new treatments and technologies."
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Funding Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Total Projects</span>
                    <span className="font-bold text-xl">{funding.length}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Total Funding</span>
                    <span className="font-bold text-xl">${(totalFunding / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Based on available NIH data — some projects have undisclosed funding amounts.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Avg Grant Size</span>
                    <span className="font-bold text-lg">${(avgFunding / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Top Institutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(funding.map(p => p.organization).filter(Boolean)))
                    .slice(0, 5)
                    .map((org, idx) => {
                      const orgProjects = funding.filter(p => p.organization === org);
                      const orgTotal = orgProjects.reduce((sum, p) => sum + (p.funding_amount || 0), 0);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{org}</span>
                            <Badge variant="outline">{orgProjects.length}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${(orgTotal / 1000000).toFixed(1)}M total
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Funding Detail Modal */}
        <FundingDetailModal
          project={selectedProject}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      </div>
    </Layout>
  );
};

export default ResearchFunding;