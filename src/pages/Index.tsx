import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Search, TrendingUp, Users, Database, Heart, ArrowRight, Zap, Shield, Globe, Beaker, Brain, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import DiscoveryCard from '@/components/DiscoveryCard';
import { WeeklyDigestSignup } from '@/components/WeeklyDigestSignup';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import logoImage from '@/assets/glucoforge-logo.svg';

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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-highlight/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-8">
            <img src={logoImage} alt="GlucoForge" className="h-20 w-auto max-w-md animate-forge-glow" />
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight">
            Forging tools. Fueling hope.<br />
            <span className="text-gradient bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Fighting diabetes together.
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
            Where scientific rigor meets real-world experience. An arsenal, command center, 
            and sanctuary for every T1D warrior.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="accent-gradient text-xl px-12 py-4 h-auto font-semibold shadow-glow hover:shadow-elegant transition-forge"
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
              className="text-xl px-12 py-4 h-auto font-semibold border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 animate-float">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Beaker className="h-8 w-8 text-white/80" />
          </div>
        </div>
        <div className="absolute bottom-32 right-32 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Brain className="h-10 w-10 text-white/80" />
          </div>
        </div>
        <div className="absolute top-1/3 right-20 animate-float" style={{ animationDelay: '4s' }}>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Heart className="h-6 w-6 text-white/80" />
          </div>
        </div>
      </section>
      
      {/* Nonprofit Roadmap */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
              Our Journey to 501(c)(3) Status
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transparent roadmap showing our path to becoming a fully registered nonprofit organization
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary via-highlight to-accent"></div>
            
            <div className="space-y-12">
              {/* Pre-launch */}
              <div className="flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="command-center-widget">
                    <h3 className="text-xl font-heading font-semibold text-foreground mb-2">Pre-launch</h3>
                    <p className="text-muted-foreground">Platform development, community building, and initial research</p>
                  </div>
                </div>
                <div className="w-4 h-4 bg-primary rounded-full relative z-10 border-4 border-background"></div>
                <div className="w-1/2 pl-8">
                  <Badge className="bg-primary text-primary-foreground">Current Phase</Badge>
                </div>
              </div>
              
              {/* 3 Months */}
              <div className="flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <Badge className="bg-muted text-muted-foreground">Next: 3 Months</Badge>
                </div>
                <div className="w-4 h-4 bg-highlight rounded-full relative z-10 border-4 border-background"></div>
                <div className="w-1/2 pl-8">
                  <div className="command-center-widget">
                    <h3 className="text-xl font-heading font-semibold text-foreground mb-2">File Paperwork</h3>
                    <p className="text-muted-foreground">Submit 501(c)(3) application and establish legal framework</p>
                  </div>
                </div>
              </div>
              
              {/* 6 Months */}
              <div className="flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="command-center-widget">
                    <h3 className="text-xl font-heading font-semibold text-foreground mb-2">Launch Public Beta</h3>
                    <p className="text-muted-foreground">Open platform to T1D community with full feature set</p>
                  </div>
                </div>
                <div className="w-4 h-4 bg-accent rounded-full relative z-10 border-4 border-background"></div>
                <div className="w-1/2 pl-8">
                  <Badge className="bg-muted text-muted-foreground">6 Months</Badge>
                </div>
              </div>
              
              {/* 1 Year */}
              <div className="flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <Badge className="bg-muted text-muted-foreground">1 Year</Badge>
                </div>
                <div className="w-4 h-4 bg-success rounded-full relative z-10 border-4 border-background"></div>
                <div className="w-1/2 pl-8">
                  <div className="command-center-widget">
                    <h3 className="text-xl font-heading font-semibold text-foreground mb-2">Scale Impact</h3>
                    <p className="text-muted-foreground">Expand reach, partnerships, and research capabilities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
              Small Fixes. Massive Relief.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform delivers the tools T1D warriors need to forge their path forward
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center command-center-widget group hover:animate-forge-glow">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 forge-gradient rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-heading text-primary">Evidence-Based</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary mb-3 font-heading">50,000+</p>
                <p className="text-muted-foreground leading-relaxed">
                  Global sources continuously scanned for breakthrough T1D research
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center command-center-widget group hover:animate-forge-glow">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 forge-gradient rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-heading text-primary">Community-Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary mb-3 font-heading">120+</p>
                <p className="text-muted-foreground leading-relaxed">
                  Verified T1D communities analyzed for real-world insights
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center command-center-widget group hover:animate-forge-glow">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 forge-gradient rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-heading text-primary">Real-Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary mb-3 font-heading">24/7</p>
                <p className="text-muted-foreground leading-relaxed">
                  Continuous monitoring for device issues and emerging patterns
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Insights */}
      <section className="py-20 bg-background">
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
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
