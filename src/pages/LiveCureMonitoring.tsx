import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CommandCenterWidget } from '@/components/CommandCenterWidget';
import { InfoRail } from '@/components/InfoRail';
import { TherapyDetailsModal } from '@/components/TherapyDetailsModal';
import { CureApproachesReport } from '@/components/cure/CureApproachesReport';
import Layout from '@/components/Layout';
import { useCureMonitoring, CureTherapy } from '@/hooks/useCureMonitoring';
import { 
  Activity, 
  TrendingUp, 
  Calendar, 
  Beaker, 
  Star,
  ExternalLink,
  Filter,
  Search,
  ArrowRight,
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react';

const LiveCureMonitoring = () => {
  const { data, loading, error } = useCureMonitoring();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTherapy, setSelectedTherapy] = useState<CureTherapy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const therapies = data?.therapies || [];
  const stats = data?.stats || { activeTrials: 0, avgYearsToMarket: 0, successRate: 0, topConfidence: 0 };
  
  const categories = ['All', ...Array.from(new Set(therapies.map(t => t.category)))];
  
  const filteredTherapies = therapies
    .filter(therapy => {
      const matchesSearch = therapy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           therapy.sponsor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || therapy.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Featured therapies first
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      // Then by confidence score
      return (b.confidence_score || 0) - (a.confidence_score || 0);
    });

  const getPhaseColor = (phase: string) => {
    if (phase.includes('III') || phase === 'Approved') return 'bg-success text-success-foreground';
    if (phase.includes('II')) return 'bg-warning text-warning-foreground';
    if (phase.includes('I')) return 'bg-info text-info-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getNextMilestone = (milestones: any[] = []) => {
    const pendingMilestones = milestones
      .filter(m => m.status === 'Pending' || m.status === 'In Progress')
      .sort((a, b) => new Date(a.target_date || '').getTime() - new Date(b.target_date || '').getTime());
    
    if (pendingMilestones.length > 0) {
      const milestone = pendingMilestones[0];
      const targetDate = milestone.target_date ? new Date(milestone.target_date).toLocaleDateString() : 'TBD';
      return `${targetDate} - ${milestone.title}`;
    }
    return 'No upcoming milestones';
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to Load Cure Data</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Stats */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              Live Cure Monitoring Dashboard
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Real-time tracking of the most promising T1D cure research, with progress percentages based on clinical trial milestones
            </p>
            <Button size="lg" onClick={() => setShowReport(true)} className="gap-2">
              <FileText className="h-5 w-5" />
              View Comprehensive Cure Approaches Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center command-center-widget">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 mx-auto mb-2 forge-gradient rounded-full flex items-center justify-center">
                  <Beaker className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-heading">Active Trials</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                ) : (
                  <p className="text-3xl font-bold text-primary mb-1">{stats.activeTrials}</p>
                )}
                <p className="text-sm text-muted-foreground">Worldwide</p>
              </CardContent>
            </Card>
            
            <Card className="text-center command-center-widget">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 mx-auto mb-2 forge-gradient rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-heading">Avg. Years to Market</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                ) : (
                  <p className="text-3xl font-bold text-primary mb-1">{stats.avgYearsToMarket}</p>
                )}
                <p className="text-sm text-muted-foreground">From Phase 1</p>
              </CardContent>
            </Card>
            
            <Card className="text-center command-center-widget">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 mx-auto mb-2 forge-gradient rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-heading">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                ) : (
                  <p className="text-3xl font-bold text-primary mb-1">{stats.successRate}%</p>
                )}
                <p className="text-sm text-muted-foreground">Phase 1 to Approval</p>
              </CardContent>
            </Card>
            
            <Card className="text-center command-center-widget">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 mx-auto mb-2 forge-gradient rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-heading">Top Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                ) : (
                  <p className="text-3xl font-bold text-primary mb-1">{stats.topConfidence}%</p>
                )}
                <p className="text-sm text-muted-foreground">Best Therapy</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {categories.map((category: string) => (
                  <Button 
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'All' && <Filter className="h-4 w-4 mr-2" />}
                    {category}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search therapies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Therapy Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="command-center-widget">
                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredTherapies.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No therapies found matching your criteria.</p>
            </div>
          ) : (
            filteredTherapies.map((therapy) => (
              <Card key={therapy.id} className="command-center-widget relative">
                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2 flex-wrap">
                      {therapy.is_featured && (
                        <Badge className="bg-amber-500 text-white gap-1">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                      <Badge className={getPhaseColor(therapy.phase)}>{therapy.phase}</Badge>
                    </div>
                    <Badge variant="outline">{therapy.category}</Badge>
                  </div>
                  <CardTitle className="text-xl font-heading">{therapy.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{therapy.sponsor}</p>
                  {therapy.approach_type && (
                    <Badge variant="secondary" className="mt-2 w-fit">
                      {therapy.approach_type}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Clinical Progress</span>
                        <span className="font-semibold">{therapy.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="forge-gradient h-2 rounded-full transition-all duration-500"
                          style={{ width: `${therapy.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Confidence Score */}
                    <div className="flex justify-between items-center py-2 border-y border-border">
                      <span className="text-sm font-medium">Confidence Score</span>
                      <div className="flex items-center gap-2">
                        <div className={`text-lg font-bold ${
                          (therapy.confidence_score || 0) >= 80 ? 'text-success' :
                          (therapy.confidence_score || 0) >= 60 ? 'text-warning' : 'text-muted-foreground'
                        }`}>
                          {therapy.confidence_score}%
                        </div>
                        <Star className="h-4 w-4 fill-current text-warning" />
                      </div>
                    </div>
                    
                    {/* Next Milestone */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Next Milestone</p>
                      <p className="text-sm text-muted-foreground">{getNextMilestone(therapy.milestones)}</p>
                    </div>
                    
                    {/* Estimated Completion */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Est. Completion</p>
                      <p className="text-sm text-muted-foreground">
                        {therapy.estimated_completion ? new Date(therapy.estimated_completion).getFullYear() : 'TBD'}
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => {
                        setSelectedTherapy(therapy);
                        setIsModalOpen(true);
                      }}
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>

        {/* Info Rail */}
        <section className="mb-8">
          <InfoRail
            whatThisShows="This dashboard tracks the clinical development progress of therapies aimed at curing or significantly improving Type 1 Diabetes. Progress percentages are calculated based on completed clinical trial phases and regulatory milestones."
            whyItMatters="Understanding cure research helps the T1D community stay informed about potential breakthrough treatments and realistic timelines. The confidence scores help set appropriate expectations based on scientific evidence."
            nextSteps="Click 'View Details' on any therapy to see complete trial data, recent publications, and patient enrollment information. Set up alerts to be notified of major milestones."
          />
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="p-8 hero-gradient text-white">
            <h2 className="text-3xl font-heading font-bold mb-4">Stay Updated on Cure Progress</h2>
            <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              Get personalized alerts when trials you're following reach major milestones
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Set Up Alerts
              </Button>
              <Link to="/companies">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Explore T1D Companies
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>

      {/* Therapy Details Modal */}
      <TherapyDetailsModal 
        therapy={selectedTherapy}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTherapy(null);
        }}
      />

      {/* Comprehensive Report Modal */}
      <CureApproachesReport
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </Layout>
  );
};

export default LiveCureMonitoring;