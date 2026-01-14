import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CommandCenterWidget } from '@/components/CommandCenterWidget';
import { InfoRail } from '@/components/InfoRail';
import Layout from '@/components/Layout';
import { SurveyModal } from '@/components/SurveyModal';
import { useSurveys } from '@/hooks/useSurveys';
import { 
  Search, 
  FileText, 
  Users, 
  BarChart3,
  TrendingUp,
  BookOpen,
  ExternalLink,
  Filter,
  Calendar,
  Star,
  ThumbsUp,
  MessageSquare,
  Download,
  Share2,
  Bookmark,
  RefreshCw,
  AlertCircle,
  Clock,
  Eye,
  Award,
  Vote,
  Plus
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
}

interface SurveyCardProps {
  survey: Survey;
  onTakeSurvey: (survey: Survey) => void;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ survey, onTakeSurvey }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getQuestionCount = () => {
    if (Array.isArray(survey.questions)) {
      return survey.questions.length;
    }
    return 0;
  };

  return (
    <Card className="command-center-widget">
      <CardHeader>
        <div className="flex justify-between items-start mb-3">
          <Badge variant="outline">{survey.category}</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(survey.created_at)}</span>
          </div>
        </div>
        
        <CardTitle className="text-xl font-heading leading-tight mb-2">
          {survey.title}
        </CardTitle>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {survey.description}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{getQuestionCount()} questions</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>~{Math.max(1, Math.ceil(getQuestionCount() / 2))} min</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => onTakeSurvey(survey)}
            >
              <Vote className="h-4 w-4 mr-2" />
              Take Survey
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              toast({
                title: "Survey Bookmarked!",
                description: "Survey saved to your reading list.",
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
    <CardHeader>
      <div className="flex justify-between items-start mb-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { surveys, loading, error, refetch } = useSurveys();

  const filteredSurveys = surveys.filter(survey => {
    const matchesCategory = selectedCategory === 'all' || 
                           survey.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTakeSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSurvey(null);
  };

  // Get unique categories from surveys, plus some standard ones
  const surveyCategories = [...new Set(surveys.map(s => s.category))];
  const categories = ['all', ...surveyCategories];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Citizen Science & Advocacy Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Empowering the T1D community to drive research through collaborative surveys, 
            data collection, and evidence-based advocacy.
          </p>
        </section>

        {/* Featured Survey */}
        <section className="mb-12">
          <Card className="hero-gradient text-white p-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-6 w-6 text-warning fill-current" />
              <Badge className="bg-white/20 text-white">Community Research</Badge>
            </div>
            <h2 className="text-2xl font-heading font-bold mb-4">
              Your Voice Shapes T1D Research
            </h2>
            <p className="text-lg text-white/90 mb-6 max-w-3xl">
              Participate in community-driven research studies that directly influence device development, 
              treatment protocols, and advocacy efforts for the Type 1 diabetes community.
            </p>
            <div className="flex gap-4">
              <Button 
                className="bg-white text-primary hover:bg-white/90"
                onClick={refetch}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Surveys
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Plus className="mr-2 h-4 w-4" />
                Create Survey
              </Button>
            </div>
          </Card>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{surveys.length}</h3>
            <p className="text-sm text-muted-foreground">Available Surveys</p>
          </Card>
          <Card className="text-center p-6">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Community</h3>
            <p className="text-sm text-muted-foreground">Driven Research</p>
          </Card>
          <Card className="text-center p-6">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Impact</h3>
            <p className="text-sm text-muted-foreground">Evidence Based</p>
          </Card>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                {categories.slice(0, 6).map((category) => (
                  <Button 
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </Button>
                ))}
              </div>
              
              <div className="relative w-full lg:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search surveys..."
                  className="pl-10 w-full lg:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Error State */}
        {error && (
          <section className="mb-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          </section>
        )}

        {/* Surveys Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }, (_, i) => <SurveyCardSkeleton key={i} />)
          ) : filteredSurveys.length > 0 ? (
            // Actual data
            filteredSurveys.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} onTakeSurvey={handleTakeSurvey} />
            ))
          ) : (
            // No results
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
        </section>

        {/* Info Rail */}
        <section className="mb-8">
          <InfoRail
            whatThisShows="Community-driven research surveys that help shape T1D treatment, device development, and advocacy efforts. Each survey is designed to gather meaningful data from the T1D community."
            whyItMatters="Your participation directly influences research priorities, informs device manufacturers, and provides evidence for advocacy efforts. Community data drives better outcomes for everyone with T1D."
            nextSteps="Browse available surveys, participate in studies that interest you, or create your own survey to investigate specific aspects of T1D management that matter to you."
          />
        </section>

        {/* Community Impact CTA */}
        <section>
          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="text-center">
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                Ready to Make an Impact?
              </h2>
              <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of T1D community members contributing to research that shapes 
                the future of diabetes care and advocacy.
              </p>
              <Button size="lg" className="mr-4">
                Browse Active Surveys
                <Eye className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Your Survey
              </Button>
            </div>
          </Card>
        </section>

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