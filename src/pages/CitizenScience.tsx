import React, { useState, useMemo } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { InfoRail } from '@/components/InfoRail';
import Layout from '@/components/Layout';
import { SurveyModal } from '@/components/SurveyModal';
import { ResearchConsentModal } from '@/components/contribute/ResearchConsentModal';
import { DemographicsForm } from '@/components/contribute/DemographicsForm';
import { MyContributions } from '@/components/contribute/MyContributions';
import { SurveyCategoryCard } from '@/components/contribute/SurveyCategoryCard';
import { useSurveys } from '@/hooks/useSurveys';
import { useSurveyDemographics } from '@/hooks/useSurveyDemographics';
import { useAuthStore } from '@/store/authStore';
import { 
  Search, 
  FileText, 
  Users, 
  BarChart3,
  TrendingUp,
  Calendar,
  Star,
  Share2,
  Bookmark,
  RefreshCw,
  AlertCircle,
  Clock,
  Eye,
  Vote,
  HeartHandshake,
  Smartphone,
  Pill,
  Heart,
  Shield,
  Cpu,
  ArrowRightLeft,
  Stethoscope,
  Activity,
  CheckCircle2,
  Target,
  Award
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: any;
  created_at: string;
  updated_at: string;
  survey_type?: string;
  research_category?: string;
  estimated_time_minutes?: number;
  target_responses?: number;
  requires_demographics?: boolean;
  consent_text?: string;
  status?: string;
}

interface SurveyCardProps {
  survey: Survey;
  onTakeSurvey: (survey: Survey) => void;
}

// Category configuration with icons
const categoryConfig: Record<string, { icon: React.ElementType; description: string; color: string }> = {
  'Device Experience': { 
    icon: Smartphone, 
    description: 'CGM, pumps, and meter experiences',
    color: 'text-blue-500'
  },
  'Treatment': { 
    icon: Pill, 
    description: 'Insulin therapy and medications',
    color: 'text-purple-500'
  },
  'Quality of Life': { 
    icon: Heart, 
    description: 'Daily living and wellbeing',
    color: 'text-pink-500'
  },
  'Safety': { 
    icon: Shield, 
    description: 'Hypoglycemia and emergencies',
    color: 'text-red-500'
  },
  'Technology': { 
    icon: Cpu, 
    description: 'Apps, algorithms, and DIY',
    color: 'text-cyan-500'
  },
  'Transitions': { 
    icon: ArrowRightLeft, 
    description: 'Life stage changes',
    color: 'text-orange-500'
  },
  'Diagnosis': { 
    icon: Stethoscope, 
    description: 'Newly diagnosed experiences',
    color: 'text-green-500'
  },
  'Health Outcomes': { 
    icon: Activity, 
    description: 'Complications and screening',
    color: 'text-amber-500'
  },
};

const SurveyCard: React.FC<SurveyCardProps> = ({ survey, onTakeSurvey }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getQuestionCount = () => {
    if (Array.isArray(survey.questions)) {
      return survey.questions.length;
    }
    return 0;
  };

  const estimatedTime = survey.estimated_time_minutes || Math.max(1, Math.ceil(getQuestionCount() / 2));
  const targetResponses = survey.target_responses || 100;
  // Deterministic progress based on survey ID hash
  const hashCode = survey.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const progressPercent = Math.min(95, (hashCode % 60) + 15);

  const CategoryIcon = categoryConfig[survey.research_category || survey.category]?.icon || FileText;

  return (
    <Card className="command-center-widget hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <CategoryIcon className="h-4 w-4 text-primary" />
            </div>
            <Badge variant="outline">{survey.research_category || survey.category}</Badge>
          </div>
          {survey.requires_demographics && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Research Grade
            </Badge>
          )}
        </div>
        
        <CardTitle className="text-lg font-heading leading-tight mb-2">
          {survey.title}
        </CardTitle>
        
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {survey.description}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{getQuestionCount()} questions</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>~{estimatedTime} min</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(survey.created_at)}</span>
            </div>
          </div>

          {/* Progress to Target */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to goal</span>
              <span>{Math.round(progressPercent)}% of {targetResponses} responses</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => onTakeSurvey(survey)}
            >
              <Vote className="h-4 w-4 mr-2" />
              Contribute
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              toast({
                title: "Survey Saved!",
                description: "Added to your list for later.",
              });
            }}>
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: survey.title,
                  text: survey.description,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(`${survey.title}: ${window.location.href}`);
                toast({
                  title: "Link copied!",
                  description: "Survey link copied to clipboard.",
                });
              }
            }}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SurveyCardSkeleton = () => (
  <Card className="command-center-widget">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4" />
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-2 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CitizenScience = () => {
  usePageMeta('Citizen Science', 'Contribute to T1D research by completing surveys and sharing your experience with the global community.');
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingSurvey, setPendingSurvey] = useState<Survey | null>(null);
  const { surveys, loading, error, refetch } = useSurveys();
  const { hasDemographics } = useSurveyDemographics();

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: surveys.length };
    surveys.forEach(survey => {
      const cat = survey.research_category || survey.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [surveys]);

  const filteredSurveys = surveys.filter(survey => {
    const surveyCategory = survey.research_category || survey.category;
    const matchesCategory = selectedCategory === 'all' || 
                           surveyCategory.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTakeSurvey = (survey: Survey) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to participate in research surveys.",
        variant: "destructive",
      });
      return;
    }

    // If survey requires consent, show consent modal first
    if (survey.requires_demographics || survey.consent_text) {
      setPendingSurvey(survey);
      setShowConsentModal(true);
    } else {
      setSelectedSurvey(survey);
      setIsModalOpen(true);
    }
  };

  const handleConsentGiven = () => {
    if (pendingSurvey) {
      setSelectedSurvey(pendingSurvey);
      setIsModalOpen(true);
      setPendingSurvey(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSurvey(null);
  };

  // Get unique categories from surveys
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    surveys.forEach(s => {
      const cat = s.research_category || s.category;
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [surveys]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HeartHandshake className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">
              Contribute Your Experience
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Your experiences matter. Share your T1D journey through research-grade surveys 
            designed to advance diabetes care and inform medical institutions.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Anonymous & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span>Research Grade</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span>Real Impact</span>
            </div>
          </div>
        </section>

        {/* Main Tabs */}
        <Tabs defaultValue="surveys" className="space-y-8">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3">
            <TabsTrigger value="surveys">
              <FileText className="h-4 w-4 mr-2" />
              Surveys
            </TabsTrigger>
            <TabsTrigger value="contributions">
              <Award className="h-4 w-4 mr-2" />
              My Contributions
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Users className="h-4 w-4 mr-2" />
              Research Profile
            </TabsTrigger>
          </TabsList>

          {/* Surveys Tab */}
          <TabsContent value="surveys" className="space-y-8">
            {/* Featured Banner */}
            <Card className="hero-gradient text-white p-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-6 w-6 text-warning fill-current" />
                <Badge className="bg-white/20 text-white">Community Research</Badge>
              </div>
              <h2 className="text-2xl font-heading font-bold mb-4">
                Help Shape the Future of T1D Care
              </h2>
              <p className="text-lg text-white/90 mb-6 max-w-3xl">
                Your responses are anonymized and contribute to research that informs device development, 
                treatment protocols, and advocacy efforts. Data may be shared with medical institutions and researchers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={refetch}
                  disabled={loading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Surveys
                </Button>
                {!hasDemographics && user && (
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <Users className="mr-2 h-4 w-4" />
                    Complete Research Profile
                  </Button>
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{surveys.length}</div>
                <div className="text-xs text-muted-foreground">Active Surveys</div>
              </Card>
              <Card className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{availableCategories.length}</div>
                <div className="text-xs text-muted-foreground">Research Areas</div>
              </Card>
              <Card className="p-4 text-center">
                <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">Anonymous</div>
                <div className="text-xs text-muted-foreground">Data Collection</div>
              </Card>
              <Card className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">Research</div>
                <div className="text-xs text-muted-foreground">Grade Quality</div>
              </Card>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SurveyCategoryCard
                id="all"
                title="All Surveys"
                description="Browse all available research surveys"
                icon={FileText}
                count={categoryCounts['all'] || 0}
                selected={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
              />
              {Object.entries(categoryConfig).map(([category, config]) => (
                <SurveyCategoryCard
                  key={category}
                  id={category}
                  title={category}
                  description={config.description}
                  icon={config.icon}
                  count={categoryCounts[category] || 0}
                  selected={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search surveys..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Surveys Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loading ? (
                Array.from({ length: 6 }, (_, i) => <SurveyCardSkeleton key={i} />)
              ) : filteredSurveys.length > 0 ? (
                filteredSurveys.map((survey) => (
                  <SurveyCard 
                    key={survey.id} 
                    survey={survey} 
                    onTakeSurvey={handleTakeSurvey} 
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No surveys found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search terms or filters.' 
                      : 'No surveys are currently available. Check back soon!'
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* My Contributions Tab */}
          <TabsContent value="contributions">
            {user ? (
              <MyContributions />
            ) : (
              <Card className="p-12 text-center">
                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Sign In to Track Contributions</h3>
                <p className="text-muted-foreground mb-6">
                  Create an account to track your research contributions and see your impact.
                </p>
                <Button>Sign In</Button>
              </Card>
            )}
          </TabsContent>

          {/* Research Profile Tab */}
          <TabsContent value="profile">
            {user ? (
              <div className="space-y-6">
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Why Complete Your Research Profile?</h3>
                      <p className="text-sm text-muted-foreground">
                        Providing optional demographic information helps researchers stratify data 
                        and draw more meaningful conclusions. This information is kept separate from 
                        your survey responses and is never shared in a way that could identify you.
                      </p>
                    </div>
                  </div>
                </Card>
                <DemographicsForm />
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Sign In to Create Profile</h3>
                <p className="text-muted-foreground mb-6">
                  Create an account to set up your research demographics profile.
                </p>
                <Button>Sign In</Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Rail */}
        <section className="mt-12 mb-8">
          <InfoRail
            whatThisShows="Research-grade surveys designed to collect T1D experiences in formats suitable for medical institutions, researchers, and advocacy organizations."
            whyItMatters="Your anonymous contributions directly influence device development, treatment protocols, and healthcare policy. Community data provides real-world evidence that clinical trials cannot capture."
            nextSteps="Complete your research profile for richer data analysis, then participate in surveys that match your experience. All data is anonymized and may be shared with research partners."
          />
        </section>

        {/* Community Impact CTA */}
        <section>
          <Card className="p-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <div className="text-center">
              <HeartHandshake className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                Every Response Makes a Difference
              </h2>
              <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands contributing to T1D research. Your experiences help shape 
                better devices, treatments, and support for our community.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Start Contributing
                  <Eye className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Research Consent Modal */}
        <ResearchConsentModal
          open={showConsentModal}
          onOpenChange={setShowConsentModal}
          surveyTitle={pendingSurvey?.title || ''}
          consentText={pendingSurvey?.consent_text}
          onConsent={handleConsentGiven}
        />

        {/* Survey Participation Modal */}
        <SurveyModal 
          survey={selectedSurvey}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </Layout>
  );
};

export default CitizenScience;
