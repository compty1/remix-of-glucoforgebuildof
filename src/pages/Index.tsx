import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Search, TrendingUp, Users, Database, Heart, ArrowRight, Zap, Shield, Globe, Beaker, Brain, Hammer, Code, Palette, PieChart, Server, FileText, Clock, Smartphone, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import DiscoveryCard from '@/components/DiscoveryCard';
import { WeeklyDigestSignup } from '@/components/WeeklyDigestSignup';
import { StatementJar } from '@/components/home/StatementJar';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import logoImage from '@/assets/glycoforge-logo.png';

interface DiscoveryCardData {
  id: string;
  title: string;
  snippet: string;
  icon_url: string;
  credibility: 'High' | 'Medium' | 'Low';
  mechanism: string;
  sources: Array<{ title: string; url: string }>;
  created_at: string;
}

const volunteerRoles = [
  { id: 'frontend', title: 'Frontend Developer', description: 'Build user interfaces with React and TypeScript', icon: Code },
  { id: 'backend', title: 'Backend Developer', description: 'Build APIs and data infrastructure', icon: Server },
  { id: 'data', title: 'Data Scientist', description: 'Analyze patterns and build AI models', icon: PieChart },
  { id: 'design', title: 'UI/UX Designer', description: 'Design beautiful, accessible experiences', icon: Palette },
  { id: 'devops', title: 'DevOps Engineer', description: 'Build infrastructure and deployment pipelines', icon: Server },
  { id: 'writer', title: 'Technical Writer', description: 'Document features and create guides', icon: FileText },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [featuredInsights, setFeaturedInsights] = useState<DiscoveryCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedInsights = async () => {
      try {
        const { data, error } = await supabase
          .from('discovery_cards')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        
        const typedData = (data || []).map(item => ({
          ...item,
          credibility: item.credibility as 'High' | 'Medium' | 'Low',
          sources: Array.isArray(item.sources) ? item.sources as Array<{ title: string; url: string }> : []
        }));
        
        setFeaturedInsights(typedData);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedInsights();
  }, []);

  return (
    <Layout>
      {/* Hero Section - Updated Copy */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple-dark/20 via-transparent to-brand-purple-light/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-8">
            <img src={logoImage} alt="GlucoForge" className="h-24 w-auto max-w-md" />
          </div>
          <h1 className="heading-hero text-white mb-6 leading-tight">
            For the Warriors in a Vicious Battle
          </h1>
          <p className="text-hero text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
            Living with Type 1 diabetes means navigating relentless chaos. Broken tools. Missing context. 
            Daily stress shards that could be eliminated with simple, smart solutions. We're building them — together.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-brand-red hover:bg-brand-red-dark text-white text-xl px-12 py-4 h-auto font-bold shadow-brand hover:shadow-glow transition-all"
              onClick={async () => {
                try {
                  const { data, error } = await supabase.functions.invoke('create-donation', {
                    body: { amount: 25 }
                  });
                  
                  if (error) throw error;
                  
                  if (data?.url) {
                    window.open(data.url, '_blank');
                  }
                } catch (error) {
                  console.error('Donation error:', error);
                }
              }}
            >
              Donate Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-xl px-12 py-4 h-auto font-semibold border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 animate-float">
          <div className="w-16 h-16 rounded-full bg-brand-teal/20 backdrop-blur-sm flex items-center justify-center">
            <Beaker className="h-8 w-8 text-brand-teal" />
          </div>
        </div>
        <div className="absolute bottom-32 right-32 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-20 h-20 rounded-full bg-brand-red/20 backdrop-blur-sm flex items-center justify-center">
            <Brain className="h-10 w-10 text-brand-red" />
          </div>
        </div>
        <div className="absolute top-1/3 right-20 animate-float" style={{ animationDelay: '4s' }}>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
        </div>
      </section>

      {/* The Challenge We're Solving */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-section text-foreground mb-4">
              The Challenge We're Solving
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <Card className="text-center command-center-widget">
              <CardContent className="pt-6">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">8.4M</p>
                <p className="text-sm text-muted-foreground">People with Type 1 diabetes worldwide</p>
              </CardContent>
            </Card>
            <Card className="text-center command-center-widget">
              <CardContent className="pt-6">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">24/7</p>
                <p className="text-sm text-muted-foreground">Constant management required</p>
              </CardContent>
            </Card>
            <Card className="text-center command-center-widget">
              <CardContent className="pt-6">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">100+</p>
                <p className="text-sm text-muted-foreground">Daily micro-decisions about health</p>
              </CardContent>
            </Card>
            <Card className="text-center command-center-widget">
              <CardContent className="pt-6">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">5+</p>
                <p className="text-sm text-muted-foreground">Apps needed to manage T1D effectively</p>
              </CardContent>
            </Card>
          </div>

          {/* Small Fixes. Massive Relief. */}
          <Card className="command-center-widget border-primary/20 mb-16">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
                Small Fixes. Massive Relief.
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto">
                Living with Type 1 diabetes isn't just about managing blood sugar — it's about navigating hundreds of tiny, 
                relentless stressors every single day. Device alerts that don't sync. Data scattered across five apps. 
                Missing context that turns a simple decision into a mental marathon. The truth? Many of these stress shards 
                can be eliminated with simple, smart tools — the kind that should already exist, but don't. We're going to build them.
              </p>
            </CardContent>
          </Card>

          {/* Emma's Story */}
          <Card className="command-center-widget border-l-4 border-l-primary bg-primary/5">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <Quote className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-foreground mb-2">
                    Your Impact in Action: Emma's Story
                  </h4>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    When 16-year-old Emma's Dexcom sensor kept failing during her soccer games, she felt defeated. 
                    Through GlucoForge's AI-powered community insights, Emma discovered a sports-specific adhesive 
                    technique shared by other T1D athletes. Within days, she was back on the field with confidence.
                  </p>
                  <blockquote className="text-lg font-medium text-primary italic border-l-2 border-primary pl-4">
                    "GlucoForge didn't just solve my technical problem—it gave me back my dreams."
                  </blockquote>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/get-involved")}
                  className="gap-2"
                >
                  <Heart className="h-5 w-5" />
                  Help Create More Stories
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Unified Platform Section */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
              A Unified, Intelligent Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything T1D warriors need, in one place
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Heart, label: 'Personalized Health' },
              { icon: Activity, label: 'CGM Insights' },
              { icon: Beaker, label: 'Mega Discoveries' },
              { icon: Globe, label: 'Global Data' },
              { icon: TrendingUp, label: 'New Findings' },
              { icon: Database, label: 'Clinical Data' },
              { icon: Brain, label: 'Advanced AI Patterns' },
              { icon: Users, label: 'Community Discussions' },
              { icon: PieChart, label: 'Impact Visualizer' },
            ].map((item, i) => (
              <Card key={i} className="text-center command-center-widget hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto mb-3 forge-gradient rounded-full flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium text-foreground">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Roadmap */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-section text-foreground mb-4">
              Our Roadmap
            </h2>
            <p className="text-hero text-muted-foreground max-w-3xl mx-auto">
              Building the platform step by step, with transparency and community input.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="command-center-widget relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                1
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-center">Foundation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Core infrastructure, volunteer system, and community outreach. File 501(c)(3) paperwork.
                </p>
                <Badge className="mt-4">Current Phase</Badge>
              </CardContent>
            </Card>
            
            <Card className="command-center-widget relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-lg border-2 border-border">
                2
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-center">Platform Alpha</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  First features live: data ingestion, AI insights, device management tools.
                </p>
              </CardContent>
            </Card>
            
            <Card className="command-center-widget relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-lg border-2 border-border">
                3
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-center">Community Beta</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Open beta with community testing, feedback loops, and continuous improvement.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/get-involved")}
              className="gap-2"
            >
              I'm Ready to Help
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Grounded in Science */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" variant="outline">Evidence-Based Approach</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Grounded in Science
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">DCCT/EDIC Studies:</strong> Decades of research prove that 
                  reducing glycemic variability prevents complications and improves quality of life.
                </p>
                <p>
                  <strong className="text-foreground">Glycemic Damage Index:</strong> We're building metrics that 
                  capture not just average glucose, but the volatility and chaos that cause real harm.
                </p>
              </div>
              <Button variant="link" className="px-0 mt-4" asChild>
                <Link to="/research">
                  Read the Science <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {/* Emma's Story Repeat (Real Impact) */}
            <Card className="command-center-widget border-l-4 border-l-success">
              <CardContent className="p-8">
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  Real Impact
                </h4>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  When 16-year-old Emma's Dexcom sensor kept failing during her soccer games, she felt defeated. 
                  Through GlucoForge's AI-powered community insights, Emma discovered a sports-specific adhesive 
                  technique shared by other T1D athletes. Within days, she was back on the field with confidence.
                </p>
                <blockquote className="text-primary font-medium italic">
                  "GlucoForge didn't just solve my technical problem—it gave me back my dreams."
                </blockquote>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* We Need Warriors of Every Kind */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              We Need Warriors of Every Kind
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Click a role to learn more about how your skills can make a difference.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {volunteerRoles.map((role) => (
              <Card 
                key={role.id} 
                className="command-center-widget cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                onClick={() => navigate("/get-involved")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <role.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{role.title}</h3>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button size="lg" onClick={() => navigate("/get-involved")} className="gap-2">
              View All Opportunities
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Insights */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
              Latest Evidence-Based Discoveries
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              AI-discovered insights from analyzing real-time conversations across 50,000+ posts in verified T1D communities
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredInsights.map((insight) => (
                <DiscoveryCard key={insight.id} data={insight} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-16">
            <Link to="/discover">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-12 py-4 h-auto border-primary/20 hover:bg-primary/5 transition-forge"
              >
                View All Discoveries
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Statement Jar Section */}
      <StatementJar />

      {/* How It Works */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How GlucoForge Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple, secure, and science-backed approach to diabetes research collaboration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Discover Insights</h3>
              <p className="text-muted-foreground">
                Browse evidence-based glucose management strategies with credibility scores and scientific backing.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Share Data Securely</h3>
              <p className="text-muted-foreground">
                Upload your CGM data and experiences to contribute to the collective knowledge base.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Advance Research</h3>
              <p className="text-muted-foreground">
                Join a global community accelerating diabetes research through open science and collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Digest Signup Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <WeeklyDigestSignup variant="full" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the Future of Diabetes Research
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Be part of a community that's revolutionizing how we understand and manage diabetes through shared knowledge and real-world evidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="medical" 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
            >
              <Heart className="mr-2" />
              {user ? "Go to Dashboard" : "Get Started Today"}
            </Button>
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 bg-white/20 hover:bg-white/30"
              onClick={() => navigate("/research")}
            >
              Explore Research
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
