import Layout from '@/components/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Calendar, Users, Target, Beaker, ExternalLink, AlertCircle, Award, Lightbulb, Heart, Dna, FlaskConical, Microscope } from 'lucide-react';
import { useState } from 'react';
import { useClinicalTrialsDetailed } from '@/hooks/useClinicalTrialsDetailed';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EntityLogo } from '@/components/ui/entity-logo';
import CureProgressStats from '@/components/cure/CureProgressStats';
import { motion } from 'framer-motion';

function CureHeroAnimation() {
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
        {/* Title */}
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
                      background: phase.progress === 100
                        ? phase.color
                        : 'hsl(var(--background))',
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
                        color: phase.progress === 100
                          ? 'hsl(var(--background))'
                          : phase.color,
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

        {/* Animated pulse text */}
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
            Data sourced from ClinicalTrials.gov — may not reflect latest updates
          </span>
        </motion.p>
      </div>
    </div>
  );
}

export default function CureProgress() {
  usePageMeta('Cure Progress', 'Track T1D cure research progress — clinical trials, therapy phases, and breakthroughs toward a cure.');
  const { data: clinicalTrials, loading, error, refreshData } = useClinicalTrialsDetailed();
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  // Calculate simulation data from actual trial progress
  const getSimulationData = () => {
    const phase3Count = (clinicalTrials || []).filter(t => t.phase === 'Phase 3').length;
    const approvedCount = (clinicalTrials || []).filter(t => t.phase === 'Approved').length;
    
    // Adjust projection based on actual trial progress
    const progressFactor = Math.min(1, (phase3Count * 5 + approvedCount * 10) / 100);
    
    return [
      { year: 2020, withCure: 100, withoutCure: 100 },
      { year: 2025, withCure: 85 - (progressFactor * 10), withoutCure: 100 },
      { year: 2030, withCure: 65 - (progressFactor * 15), withoutCure: 100 },
      { year: 2035, withCure: 40 - (progressFactor * 10), withoutCure: 100 },
      { year: 2040, withCure: 20 - (progressFactor * 5), withoutCure: 100 },
      { year: 2045, withCure: 10 - (progressFactor * 3), withoutCure: 100 },
      { year: 2050, withCure: 5, withoutCure: 100 }
    ];
  };

  const simulationData = getSimulationData();

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Phase 1': return 'bg-primary/10 text-primary dark:bg-primary/20';
      case 'Phase 2': return 'bg-warning/10 text-warning dark:bg-warning/20';
      case 'Phase 3': return 'bg-chart-3/10 text-chart-3 dark:bg-chart-3/20';
      case 'Approved': return 'bg-success/10 text-success dark:bg-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredTrials = selectedPhase === 'all' 
    ? clinicalTrials || []
    : (clinicalTrials || []).filter(trial => trial.phase === selectedPhase);

  const activeTrials = (clinicalTrials || []).filter(t => 
    t.overall_status === 'Recruiting' || t.overall_status === 'Active, not recruiting'
  );
  
  const totalParticipants = filteredTrials.reduce((sum, trial) => sum + (trial.enrollment_count || 0), 0);
  const phase3Trials = (clinicalTrials || []).filter(t => t.phase === 'Phase 3').length;

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-4xl font-heading font-bold text-foreground">
              Cure Progress Tracker
            </h1>
            <Badge variant="outline" className="text-muted-foreground border-muted-foreground/40 text-xs">
              Reference Data
            </Badge>
          </div>
          <p className="text-muted-foreground mb-8">
            Real-time tracking of Type 1 diabetes cure research progress from ClinicalTrials.gov worldwide database.
          </p>
          <div className="mb-8">
            <MedicalDisclaimer context="Cure research data is sourced from ClinicalTrials.gov. Projections and timelines are illustrative estimates, not validated forecasts." />
          </div>

          {/* Illustrative Cure Pipeline Animation */}
          <CureHeroAnimation />

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Live Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{loading ? '...' : activeTrials.length}</p>
                <p className="text-sm text-muted-foreground">Active Trials</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{loading ? '...' : totalParticipants.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Participants</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {loading ? '...' : filteredTrials.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Trials</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Beaker className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {loading ? '...' : phase3Trials}
                </p>
                <p className="text-sm text-muted-foreground">Phase 3 Trials</p>
              </CardContent>
            </Card>
          </div>

          {/* Cure Progress Stats Component */}
          <CureProgressStats
            totalTrials={filteredTrials.length}
            activeTrials={activeTrials.length}
            phase3Trials={phase3Trials}
            totalParticipants={totalParticipants}
            countries={25}
          />

          {/* Tabs for different views */}
          <Tabs defaultValue="trials" className="mb-8">
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
              <TabsTrigger value="trials">Clinical Trials</TabsTrigger>
              <TabsTrigger value="projection">Projections</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="trials" className="mt-6">
              {/* Phase Filters */}
              <div className="flex gap-3 mb-8 flex-wrap">
                <Button 
                  variant={selectedPhase === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedPhase('all')}
                  size="sm"
                >
                  All Phases
                </Button>
                <Button 
                  variant={selectedPhase === 'Phase 1' ? 'default' : 'outline'}
                  onClick={() => setSelectedPhase('Phase 1')}
                  size="sm"
                >
                  Phase 1
                </Button>
                <Button 
                  variant={selectedPhase === 'Phase 2' ? 'default' : 'outline'}
                  onClick={() => setSelectedPhase('Phase 2')}
                  size="sm"
                >
                  Phase 2
                </Button>
                <Button 
                  variant={selectedPhase === 'Phase 3' ? 'default' : 'outline'}
                  onClick={() => setSelectedPhase('Phase 3')}
                  size="sm"
                >
                  Phase 3
                </Button>
                <Button 
                  variant={selectedPhase === 'Phase 4' ? 'default' : 'outline'}
                  onClick={() => setSelectedPhase('Phase 4')}
                  size="sm"
                >
                  Phase 4
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Trials */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Clinical Trials</h2>
                    <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                      Refresh Data
                    </Button>
                  </div>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-20 w-full" />
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredTrials.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Beaker className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No trials found for this phase</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredTrials.slice(0, 10).map((trial) => (
                      <Card key={trial.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-2">{trial.title}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {trial.brief_summary || 'No summary available'}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge className={getPhaseColor(trial.phase || 'N/A')}>
                                {trial.phase || 'N/A'}
                              </Badge>
                              <Badge variant="outline">{trial.overall_status || 'Unknown'}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Enrollment</p>
                                <p className="font-medium">{trial.enrollment_count?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <EntityLogo
                                  type="company"
                                  name={trial.sponsor_name || 'Unknown'}
                                  size="sm"
                                />
                                <div>
                                  <p className="text-muted-foreground">Sponsor</p>
                                  <p className="font-medium line-clamp-1">{trial.sponsor_name || 'Unknown'}</p>
                                </div>
                              </div>
                            </div>
                            
                            {trial.interventions && trial.interventions.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Interventions</p>
                                <div className="flex flex-wrap gap-1">
                                  {trial.interventions.slice(0, 2).map((intervention, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {intervention}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                NCT ID: {trial.nct_id}
                              </span>
                              <Button variant="outline" size="sm" asChild>
                                <a href={trial.study_url || `https://clinicaltrials.gov/study/${trial.nct_id}`} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View
                                </a>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Recent Updates */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Recent Updates</h2>
                  <div className="space-y-4">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-3/4" />
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      (clinicalTrials || [])
                        .sort((a, b) => new Date(b.last_update_date || b.updated_at).getTime() - new Date(a.last_update_date || a.updated_at).getTime())
                        .slice(0, 5)
                        .map((trial, index) => (
                        <Card key={index} className="relative">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                {index < 4 && (
                                  <div className="w-px h-12 bg-border mt-2"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <h4 className="font-medium line-clamp-1">{trial.title}</h4>
                                  <Badge className={getPhaseColor(trial.phase || 'N/A')} variant="secondary">
                                    {trial.phase || 'N/A'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {trial.brief_summary || 'No summary available'}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  Last updated: {new Date(trial.last_update_date || trial.updated_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projection" className="mt-6">
              {/* Outcome Simulator */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-warning" />
                    Projected Impact: Life with vs without Cure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={simulationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis label={{ value: 'Relative Disease Burden (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${value}%`, 
                            name === 'withCure' ? 'With Cure Breakthrough' : 'Without Cure'
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="withoutCure" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          name="withoutCure"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="withCure" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="withCure"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    <strong>⚠ Illustrative projection only.</strong> This is a simplified model based on the number of trials in each phase, 
                    not a validated epidemiological forecast. Actual timelines depend on regulatory approvals, manufacturing scale-up, 
                    and healthcare policy — factors not captured here.
                  </p>
                </CardContent>
              </Card>

              {/* Research Investment Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Global T1D Cure Research Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3 italic">Estimates from published reports and IDF Diabetes Atlas. Figures are approximate.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">~$2.8B</p>
                      <p className="text-sm text-muted-foreground">Est. Annual Research Funding</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">~150</p>
                      <p className="text-sm text-muted-foreground">Est. Research Institutions</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">~50K</p>
                      <p className="text-sm text-muted-foreground">Est. Researchers Worldwide</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-warning" />
                    T1D Cure Research Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-success rounded-full border-2 border-background shadow" />
                        <div className="w-0.5 h-16 bg-border" />
                      </div>
                      <div className="flex-1 pb-4">
                        <Badge className="mb-2">November 2022</Badge>
                        <h4 className="font-semibold">Tzield (Teplizumab) FDA Approved</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          First disease-modifying therapy to delay T1D onset. Can delay diagnosis by an average of 2+ years in at-risk individuals.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-primary rounded-full border-2 border-background shadow" />
                        <div className="w-0.5 h-16 bg-border" />
                      </div>
                      <div className="flex-1 pb-4">
                        <Badge variant="secondary" className="mb-2">2024</Badge>
                        <h4 className="font-semibold">Vertex VX-880 Phase 1/2 Success</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Stem cell-derived islet cells showing insulin independence in multiple patients. Some participants have eliminated insulin entirely.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-primary rounded-full border-2 border-background shadow" />
                        <div className="w-0.5 h-16 bg-border" />
                      </div>
                      <div className="flex-1 pb-4">
                        <Badge variant="secondary" className="mb-2">2024-2025</Badge>
                        <h4 className="font-semibold">Multiple Encapsulation Devices in Trials</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sernova Cell Pouch, ViaCyte devices, and others testing methods to protect transplanted cells without immunosuppression.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-warning rounded-full border-2 border-background shadow" />
                        <div className="w-0.5 h-16 bg-border" />
                      </div>
                      <div className="flex-1 pb-4">
                        <Badge variant="outline" className="mb-2">2025-2027</Badge>
                        <h4 className="font-semibold">Expected Phase 3 Results</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Several therapies expected to complete Phase 3 trials, potentially leading to additional FDA approvals for T1D cure approaches.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-muted-foreground rounded-full border-2 border-background shadow" />
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">2030+</Badge>
                        <h4 className="font-semibold">Potential Functional Cure Availability</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on current trajectories, functional cures eliminating daily insulin dependence could become more widely available.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}