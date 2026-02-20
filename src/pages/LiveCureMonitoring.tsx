import React, { useState } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CommandCenterWidget } from '@/components/CommandCenterWidget';
import { InfoRail } from '@/components/InfoRail';
import { TherapyDetailsModal } from '@/components/TherapyDetailsModal';
import { CureApproachesReport } from '@/components/cure/CureApproachesReport';
import { EntityLogo } from '@/components/ui/entity-logo';
import Layout from '@/components/Layout';
import { useCureMonitoring, CureTherapy } from '@/hooks/useCureMonitoring';
import { motion } from 'framer-motion';
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
  Sparkles,
  Microscope,
  FlaskConical,
  Dna,
  Heart
} from 'lucide-react';

function CurePipelineAnimation() {
  const phases = [
    { label: 'Discovery', icon: Microscope, progress: 100, color: 'hsl(var(--chart-4))' },
    { label: 'Phase 1', icon: FlaskConical, progress: 100, color: 'hsl(var(--chart-2))' },
    { label: 'Phase 2', icon: Dna, progress: 75, color: 'hsl(var(--chart-5))' },
    { label: 'Phase 3', icon: Beaker, progress: 40, color: 'hsl(var(--chart-3))' },
    { label: 'Cure', icon: Heart, progress: 0, color: 'hsl(var(--success))' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 md:p-10 mb-8">
      {/* Floating background particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10"
          style={{
            width: 8 + i * 6,
            height: 8 + i * 6,
            top: `${15 + i * 14}%`,
            left: `${10 + i * 15}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            The Journey to a <span className="text-gradient">T1D Cure</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Tracking the global pipeline from lab discovery to real-world cure
          </p>
        </motion.div>

        {/* Animated Pipeline */}
        <div className="flex items-center justify-between gap-2 md:gap-0 max-w-3xl mx-auto">
          {phases.map((phase, i) => {
            const Icon = phase.icon;
            return (
              <div key={phase.label} className="flex items-center flex-1 last:flex-initial">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 200 }}
                  className="flex flex-col items-center gap-2 relative"
                >
                  <motion.div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2"
                    style={{
                      borderColor: phase.color,
                      background: phase.progress === 100 ? phase.color : 'hsl(var(--background))',
                    }}
                    animate={phase.progress > 0 && phase.progress < 100 ? {
                      boxShadow: [
                        `0 0 0px ${phase.color}`,
                        `0 0 20px ${phase.color}`,
                        `0 0 0px ${phase.color}`,
                      ],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon
                      className="h-5 w-5 md:h-6 md:w-6"
                      style={{
                        color: phase.progress === 100 ? 'hsl(var(--background))' : phase.color,
                      }}
                    />
                  </motion.div>
                  <span className="text-[10px] md:text-xs font-medium text-muted-foreground text-center">
                    {phase.label}
                  </span>
                  {phase.progress > 0 && phase.progress < 100 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-[10px] font-bold"
                      style={{ color: phase.color }}
                    >
                      {phase.progress}%
                    </motion.span>
                  )}
                </motion.div>

                {/* Connector line */}
                {i < phases.length - 1 && (
                  <div className="flex-1 h-0.5 bg-border mx-1 md:mx-3 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 h-full"
                      style={{ background: phase.color }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${phase.progress}%` }}
                      transition={{ delay: 0.6 + i * 0.2, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            Live data from global clinical trial registries
          </span>
        </motion.p>
      </div>
    </div>
  );
}

const LiveCureMonitoring = () => {
  usePageMeta('Live Cure Monitoring', 'Real-time monitoring of T1D cure therapy trials, milestones, and treatment pipeline progress.');
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
              Live Cure Tracker
            </h1>
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="text-muted-foreground border-muted-foreground/40 text-xs">
                Reference Data — Seeded from public registries
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Real-time updates on the latest approaches to curing Type 1 Diabetes. Track clinical trials, 
              timelines, and breakthrough developments from leading research institutions.
            </p>
            <Button size="lg" onClick={() => setShowReport(true)} className="gap-2">
              <FileText className="h-5 w-5" />
              View Comprehensive Cure Approaches Report
            </Button>
          </div>

          {/* Cure Pipeline Animation */}
          <CurePipelineAnimation />
          
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
                  <div className="flex items-center gap-2 mt-1">
                    <EntityLogo
                      type="company"
                      name={therapy.sponsor}
                      size="sm"
                    />
                    <p className="text-sm text-muted-foreground">{therapy.sponsor}</p>
                  </div>
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