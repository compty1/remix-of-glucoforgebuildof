import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommandCenterWidget } from '@/components/CommandCenterWidget';
import { InfoRail } from '@/components/InfoRail';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { usePageMeta } from '@/hooks/usePageMeta';
import MentalHealthConditionsSection from '@/components/mental-health/MentalHealthConditionsSection';
import PsychLoadComparisonSection from '@/components/mental-health/PsychLoadComparisonSection';
import DeviceFearDistressSection from '@/components/mental-health/DeviceFearDistressSection';
import MentalHealthAssessmentSection from '@/components/mental-health/MentalHealthAssessmentSection';
import { 
  Heart, 
  Brain, 
  Users, 
  BookOpen,
  MessageSquare,
  Phone,
  Shield,
  Star,
  Clock,
  User,
  Headphones,
  FileText,
  Video,
  Calendar,
  Lightbulb,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

interface MentalHealthResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'podcast' | 'tool' | 'story';
  category: string;
  readTime: string;
  rating: number;
  helpfulVotes: number;
  tags: string[];
  featured?: boolean;
}

interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  category: 'stress' | 'anxiety' | 'burnout' | 'social';
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  timeRequired: string;
  effectiveness: number;
  steps: string[];
  peerReviews: number;
}

const MentalHealthHub = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeStrategy, setActiveStrategy] = useState<CopingStrategy | null>(null);
  usePageMeta('Mental Health Hub', 'Resources, coping strategies, and peer support for managing the psychosocial challenges of Type 1 diabetes.');

  const resources: MentalHealthResource[] = [
    {
      id: 'diabetes-burnout-guide',
      title: 'Understanding and Overcoming Diabetes Burnout',
      description: 'A comprehensive guide to recognizing the signs of diabetes burnout and evidence-based strategies for recovery.',
      type: 'article',
      category: 'Burnout',
      readTime: '8 min read',
      rating: 4.8,
      helpfulVotes: 342,
      tags: ['Burnout', 'Recovery', 'Self-Care'],
      featured: true
    },
    {
      id: 'anxiety-management-t1d',
      title: 'Managing Anxiety Around Glucose Numbers',
      description: 'Practical techniques for reducing anxiety related to blood sugar monitoring and CGM alarms.',
      type: 'video',
      category: 'Anxiety',
      readTime: '12 min watch',
      rating: 4.6,
      helpfulVotes: 189,
      tags: ['Anxiety', 'CGM', 'Coping'],
      featured: false
    },
    {
      id: 'peer-support-stories',
      title: 'Voices of Hope: T1D Warrior Stories',
      description: 'Real stories from the T1D community about overcoming challenges and finding strength.',
      type: 'story',
      category: 'Inspiration',
      readTime: '15 min read',
      rating: 4.9,
      helpfulVotes: 567,
      tags: ['Stories', 'Hope', 'Community'],
      featured: true
    }
  ];

  const copingStrategies: CopingStrategy[] = [
    {
      id: 'box-breathing',
      title: 'Box Breathing for Glucose Anxiety',
      description: 'A simple breathing technique to calm anxiety when checking glucose levels or responding to alarms.',
      category: 'anxiety',
      difficulty: 'Easy',
      timeRequired: '2-3 minutes',
      effectiveness: 87,
      steps: [
        'Inhale slowly for 4 counts',
        'Hold your breath for 4 counts',
        'Exhale slowly for 4 counts',
        'Hold empty lungs for 4 counts',
        'Repeat 4-6 cycles before checking glucose'
      ],
      peerReviews: 234
    },
    {
      id: 'reframe-technique',
      title: 'The "Number is Information" Reframe',
      description: 'Cognitive technique to view glucose readings as neutral information rather than judgments.',
      category: 'stress',
      difficulty: 'Medium',
      timeRequired: '5-10 minutes',
      effectiveness: 92,
      steps: [
        'When you see a high/low number, pause',
        'Say "This number is just information"',
        'Ask "What action can I take right now?"',
        'Focus on the solution, not the problem',
        'Celebrate taking action, regardless of the number'
      ],
      peerReviews: 156
    },
    {
      id: 'social-disclosure',
      title: 'T1D Social Disclosure Strategy',
      description: 'Framework for deciding when and how to share your T1D with friends, colleagues, and dates.',
      category: 'social',
      difficulty: 'Advanced',
      timeRequired: '15-20 minutes',
      effectiveness: 84,
      steps: [
        'Assess your comfort level and the relationship',
        'Choose the right time and setting',
        'Start with basic facts: "I have Type 1 diabetes"',
        'Explain briefly what it means for daily life',
        'Share what support you might need, if any',
        'Answer questions openly and redirect if needed'
      ],
      peerReviews: 89
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'podcast': return <Headphones className="h-4 w-4" />;
      case 'tool': return <Target className="h-4 w-4" />;
      case 'story': return <Heart className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-success text-success-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'Advanced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallbackPath="/dashboard" />
        
        {/* Header */}
        <section className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 forge-gradient rounded-full flex items-center justify-center animate-forge-glow">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Mental Health Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            A dedicated sanctuary with articles, peer stories, and coping strategies 
            for managing the psychosocial aspects of T1D. You are not alone.
          </p>
          
          {/* Crisis Support Banner */}
          <Card className="bg-accent/10 border-accent/20 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Need Immediate Support?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    If you're experiencing a mental health crisis, help is available 24/7.
                  </p>
                  <div className="flex gap-3">
                    <a href="tel:988">
                      <Button size="sm" className="accent-gradient">
                        <Phone className="h-4 w-4 mr-2" />
                        Call 988 Lifeline
                      </Button>
                    </a>
                    <a href="https://988lifeline.org/chat/" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        Chat Support
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Device Fear & Distress Section - NEW */}
        <DeviceFearDistressSection />

        {/* Mental Health Conditions Linked to T1D */}
        <MentalHealthConditionsSection />

        {/* Compare Psychological Load */}
        <PsychLoadComparisonSection />

        {/* Mental Health Assessment Quiz */}
        <MentalHealthAssessmentSection />

        {/* Main Content Tabs */}
        <section className="mb-12">
          <Tabs defaultValue="sanctuary" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
              <TabsTrigger value="sanctuary">Sanctuary</TabsTrigger>
              <TabsTrigger value="strategies">Coping Strategies</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>
            
            {/* Sanctuary Tab - Articles & Resources */}
            <TabsContent value="sanctuary" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                  Your Safe Space for Healing
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Expert-reviewed articles, videos, and tools to help you navigate 
                  the emotional journey of Type 1 diabetes.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {resources.map((resource) => (
                  <Card key={resource.id} className={`command-center-widget ${resource.featured ? 'ring-2 ring-accent/20' : ''}`}>
                    <CardHeader>
                      {resource.featured && (
                        <Badge className="bg-accent text-accent-foreground mb-3 w-fit">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        {getTypeIcon(resource.type)}
                        <Badge variant="outline" className="text-xs">
                          {resource.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{resource.readTime}</span>
                      </div>
                      
                      <CardTitle className="text-lg font-heading leading-tight">
                        {resource.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {resource.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-current text-warning" />
                            <span className="font-medium">{resource.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CheckCircle className="h-4 w-4" />
                            <span>{resource.helpfulVotes} found helpful</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {resource.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button className="w-full" asChild>
                          <a href={resource.id === 'diabetes-burnout-guide' ? '/diabetes-burnout' : resource.id === 'peer-support-stories' ? '/warrior-spotlight' : '/resources'}>
                            {resource.type === 'video' ? 'Watch Now' : 'Read Article'}
                            <FileText className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Coping Strategies Tab */}
            <TabsContent value="strategies" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                  Proven Coping Strategies
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Evidence-based techniques and peer-validated strategies for managing 
                  diabetes-related stress, anxiety, and emotional challenges.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {copingStrategies.map((strategy) => (
                  <Card key={strategy.id} className="command-center-widget">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getDifficultyColor(strategy.difficulty)}>
                          {strategy.difficulty}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{strategy.timeRequired}</span>
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl font-heading">
                        {strategy.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {strategy.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-foreground">Effectiveness</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-full bg-muted rounded-full h-2 max-w-[100px]">
                                <div 
                                  className="forge-gradient h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${strategy.effectiveness}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-success">{strategy.effectiveness}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-foreground">{strategy.peerReviews}</span>
                            <p className="text-xs text-muted-foreground">peer reviews</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground">Steps:</h4>
                          <ol className="space-y-1">
                            {strategy.steps.slice(0, 3).map((step, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary font-medium">{index + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                            {strategy.steps.length > 3 && (
                              <li className="text-sm text-muted-foreground italic">
                                +{strategy.steps.length - 3} more steps...
                              </li>
                            )}
                          </ol>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => setActiveStrategy(activeStrategy?.id === strategy.id ? null : strategy)}
                        >
                          {activeStrategy?.id === strategy.id ? 'Hide Steps' : 'View Full Strategy'}
                          <Lightbulb className="h-4 w-4 ml-2" />
                        </Button>
                        {activeStrategy?.id === strategy.id && (
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
                            <h4 className="text-sm font-medium">All Steps:</h4>
                            <ol className="space-y-1">
                              {strategy.steps.map((step, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary font-medium">{idx + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Community Tab */}
            <TabsContent value="community" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                  Connect & Support
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Join peer support groups, share your story, and connect with 
                  mental health professionals who understand T1D.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="command-center-widget text-center">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Peer Support Groups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-6">
                      Join facilitated support groups with other T1D warriors facing similar challenges.
                    </p>
                    <Button className="w-full" asChild>
                      <a href="/find-diabetic-near-me">
                        Find Groups
                        <Users className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="command-center-widget text-center">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                      <Brain className="h-8 w-8 text-accent" />
                    </div>
                    <CardTitle>Professional Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-6">
                      Connect with therapists and counselors who specialize in chronic illness.
                    </p>
                    <Button className="w-full" variant="outline" asChild>
                      <a href="/healthcare-providers">
                        Find Therapists
                        <Brain className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="command-center-widget text-center">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-success" />
                    </div>
                    <CardTitle>Share Your Story</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-6">
                      Inspire others by sharing your journey and mental health insights.
                    </p>
                    <Button className="w-full" variant="outline" asChild>
                      <a href="/warrior-spotlight">
                        Share Story
                        <Plus className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Info Rail */}
        <section className="mb-8">
          <InfoRail
            whatThisShows="This mental health hub provides evidence-based resources, peer-validated coping strategies, and community support specifically designed for the unique psychological challenges of living with Type 1 diabetes."
            whyItMatters="Mental health significantly impacts glucose management and overall quality of life. Having diabetes-specific mental health resources helps address the unique stressors, anxieties, and burnout that traditional therapy may not fully understand."
            nextSteps="Start with articles that resonate with your current challenges, try evidence-based coping strategies, or connect with peer support groups. Remember: seeking mental health support is a sign of strength, not weakness."
          />
        </section>

        {/* Daily Wellness Check-in CTA */}
        <section>
          <Card className="p-8 hero-gradient text-white">
            <div className="text-center">
              <h2 className="text-3xl font-heading font-bold mb-4">
                Daily Wellness Check-in
              </h2>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                Take a moment to check in with yourself. How are you feeling today, 
                beyond just your glucose numbers?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Heart className="mr-2 h-5 w-5" />
                  Start Check-in
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  View Wellness Trends
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default MentalHealthHub;