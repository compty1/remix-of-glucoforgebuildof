import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DonationImpactVisualization } from '@/components/donate/DonationImpactVisualization';
import { 
  Heart, 
  Rocket, 
  Users, 
  Beaker, 
  MessageCircle, 
  FileText, 
  Activity, 
  Brain, 
  Shield, 
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Pill,
  Calendar,
  Award,
  TrendingUp,
  Sparkles,
  Clock,
  DollarSign,
  Share2,
  Database,
  Code,
  Globe,
  Building2,
  Star,
  Zap,
  Target,
  HeartHandshake
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Platform statistics
const platformStats = [
  { label: 'Pages & Features', value: '50+', icon: Sparkles },
  { label: 'Development Projects', value: '27+', icon: Code },
  { label: 'Research Sources', value: '10+', icon: Database },
  { label: 'Devices Tracked', value: '30+', icon: Smartphone },
  { label: 'Medications Listed', value: '100+', icon: Pill },
  { label: 'Clinical Trials', value: 'Tracked', icon: Beaker },
];

// Feature categories
const featureCategories = [
  {
    title: 'Community & Support',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'T1D Companion AI Chat - 24/7 intelligent support',
      'Community Solutions Hub - 50,000+ peer-reviewed fixes',
      'Warrior Spotlight - Real stories from real people',
      'Threaded discussions with expert verification'
    ]
  },
  {
    title: 'Research & Intelligence',
    icon: Beaker,
    color: 'from-purple-500 to-violet-500',
    features: [
      'Research Hub with AI-generated TLDR summaries',
      'Citation Network Visualization',
      'Live Cure Monitoring - Real-time trial tracking',
      'Innovation Hub - Patent tracking and analysis'
    ]
  },
  {
    title: 'Device & Medication Management',
    icon: Smartphone,
    color: 'from-emerald-500 to-teal-500',
    features: [
      'Comprehensive Device Directory with reliability scores',
      'Medication Hub with interaction checker',
      'FDA Safety Dashboard',
      'Device Solutions Tab - Aggregated community fixes'
    ]
  },
  {
    title: 'Data & Analytics',
    icon: Activity,
    color: 'from-amber-500 to-orange-500',
    features: [
      'CGM Data Upload with AI analysis',
      'Clinical-grade PDF report generation',
      'Glucose heatmaps, AGP charts, pattern detection',
      'Scenario Lab for n-of-1 experiments'
    ]
  },
  {
    title: 'Quality of Life',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    features: [
      'Mental Health Hub with resources and assessments',
      'Quality of Life resource directory',
      'Low Blood Sugar World - Hypo support',
      'Events Near Me locator'
    ]
  },
  {
    title: 'Engagement & Gamification',
    icon: Award,
    color: 'from-indigo-500 to-purple-500',
    features: [
      'Achievement and streak gamification system',
      'Smart Onboarding personalization',
      'Weekly digest email subscription',
      'Push notifications for relevant updates'
    ]
  }
];

// Development roadmap
const roadmapPhases = [
  {
    phase: 'Phase 1',
    status: 'complete',
    timeline: 'Q1-Q2 2025',
    title: 'Foundation',
    items: ['Core platform', 'Device Hub', 'Research Hub']
  },
  {
    phase: 'Phase 2',
    status: 'complete',
    timeline: 'Q3-Q4 2025',
    title: 'Community',
    items: ['Community Solutions', 'AI Chat', 'Glucose Analysis']
  },
  {
    phase: 'Phase 3',
    status: 'current',
    timeline: 'Q1 2026',
    title: 'Expansion',
    items: ['Push Notifications', 'Device Solutions', 'Content Expansion']
  },
  {
    phase: 'Phase 4',
    status: 'upcoming',
    timeline: 'Q2-Q3 2026',
    title: 'Mobile',
    items: ['Photo Carb Estimator', 'CGM Integration API', 'Mobile App']
  },
  {
    phase: 'Phase 5',
    status: 'planned',
    timeline: 'Q4 2026',
    title: 'Intelligence',
    items: ['AI Insulin Calculator', 'Exercise Prediction', 'Personal Science Lab']
  },
  {
    phase: 'Phase 6',
    status: 'vision',
    timeline: '2027+',
    title: 'Global Impact',
    items: ['Open CGM Firmware', 'Global Expansion', 'Clinical Partnerships']
  }
];

// Funding allocation
const fundingAllocation = [
  { category: 'Platform Development', percentage: 45, description: 'Features, infrastructure, hosting' },
  { category: 'Research Integration', percentage: 25, description: 'API access, data partnerships, AI models' },
  { category: 'Community Programs', percentage: 15, description: 'Moderation, events, education' },
  { category: 'Operations', percentage: 10, description: 'Legal, compliance, 501(c)(3) filing' },
  { category: 'Reserve Fund', percentage: 5, description: 'Sustainability and emergencies' },
];

// Donor tiers
const donorTiers = [
  { name: 'Supporter', range: '$5 - $49', benefits: ['Name in community supporters list', 'Thank you email'] },
  { name: 'Contributor', range: '$50 - $249', benefits: ['Badge on profile', 'Quarterly newsletter', 'Early announcements'] },
  { name: 'Champion', range: '$250 - $999', benefits: ['Featured supporter card', 'Early access to features', 'Quarterly video updates'] },
  { name: 'Visionary', range: '$1,000 - $4,999', benefits: ['Advisory input sessions', 'Recognition on about page', 'Annual impact report'] },
  { name: 'Founding Partner', range: '$5,000+', benefits: ['Named recognition everywhere', 'Quarterly briefings', 'Advisory board consideration'] },
];

// Value propositions
const valueProps = [
  { icon: Heart, title: 'Patient-Led', description: 'Built by people who live with T1D daily' },
  { icon: Code, title: 'Technology-First', description: 'Modern web platform, not dated infrastructure' },
  { icon: Share2, title: 'Open Source Spirit', description: 'Community contributions welcome' },
  { icon: Zap, title: 'Rapid Iteration', description: 'Weekly updates vs. annual releases' },
  { icon: Target, title: 'Direct Impact', description: 'Every dollar goes to building tools, not bureaucracy' },
  { icon: Globe, title: 'Unified Platform', description: 'One place for everything T1D-related' },
];

// Illustrative testimonials — these are representative scenarios, not verified user quotes.
const testimonials = [
  {
    quote: "At 2 AM when my CGM failed, the community solutions helped me troubleshoot in minutes. This platform saved my night.",
    author: "Community Member",
    context: "Device troubleshooting (illustrative)"
  },
  {
    quote: "I discovered a clinical trial I qualified for through the research hub. I'm now part of a breakthrough study.",
    author: "Community Member",
    context: "Research discovery (illustrative)"
  },
  {
    quote: "The mental health resources helped me understand I wasn't alone. The community connection changed my perspective on living with T1D.",
    author: "Community Member",
    context: "Community support (illustrative)"
  }
];

// FAQs
const faqs = [
  {
    question: "Is my donation tax-deductible?",
    answer: "We are currently in the process of obtaining 501(c)(3) status. Donations are not tax-deductible at this time. We'll notify all donors if and when this status is confirmed."
  },
  {
    question: "How is my donation used?",
    answer: "Your donation directly funds platform development (45%), research integrations (25%), community programs (15%), operations (10%), and reserves (5%). These are target allocations — transparency reporting is planned but not yet available."
  },
  {
    question: "Can I donate anonymously?",
    answer: "Yes! During checkout, you can choose to remain anonymous. Your contribution will still make the same impact, just without public recognition."
  },
  {
    question: "Do you accept cryptocurrency?",
    answer: "Not currently, but this is on our roadmap. For now, we accept all major credit cards and digital payment methods through Stripe."
  },
  {
    question: "How do recurring donations work?",
    answer: "Recurring donations are charged monthly, quarterly, or annually based on your preference. You can cancel or modify your recurring donation at any time through your dashboard."
  },
  {
    question: "Can my company sponsor GlucoForge?",
    answer: "Absolutely! Corporate sponsorships receive additional recognition and can be customized. Contact us at support@glucoforge.org for partnership opportunities."
  }
];

// Alternative ways to help
const alternativeWays = [
  { icon: Database, title: 'Share Your Data', description: 'Contribute your glucose data anonymously for research', link: '/data-upload' },
  { icon: Code, title: 'Contribute Code', description: 'Help build new features on our development projects', link: '/build-with-us' },
  { icon: Users, title: 'Become a Moderator', description: 'Help maintain our community standards', link: '/get-involved' },
  { icon: Share2, title: 'Spread the Word', description: 'Share GlucoForge on social media', link: null },
  { icon: Building2, title: 'Refer Providers', description: 'Tell your healthcare team about us', link: '/healthcare-providers' },
];

export default function SupportGlucoForge() {
  const [donationAmount, setDonationAmount] = useState(100);
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');

  const handleDonate = () => {
    window.open(`/donate?amount=${donationAmount}&type=${donationType}`, '_self');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple-dark via-brand-purple-light/50 to-brand-teal/30 opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <BackButton />
            <div className="max-w-4xl mx-auto text-center mt-8">
              <Badge variant="secondary" className="mb-4">
                <Heart className="h-3 w-3 mr-1" /> Support Our Mission
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-purple-dark to-brand-teal bg-clip-text text-transparent">
                Fuel the Future of T1D Management
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Your support directly transforms how millions navigate life with Type 1 Diabetes. 
                Every contribution builds tools that eliminate daily stress and accelerate the path to a cure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="hero" onClick={() => document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  <Heart className="mr-2 h-5 w-5" /> Donate Now
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('learn-more')?.scrollIntoView({ behavior: 'smooth' })}>
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {platformStats.map((stat, index) => (
                <Card key={index} className="text-center p-4 bg-background/50">
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-brand-teal" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="learn-more" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                The Problem We're Solving
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                Every day, millions face challenges that shouldn't exist in 2026
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: Clock, problem: '3 AM device failures with no immediate help' },
                  { icon: FileText, problem: 'Research locked in academic papers, inaccessible to patients' },
                  { icon: Users, problem: 'Isolation of managing a chronic condition alone' },
                  { icon: Smartphone, problem: 'Information scattered across dozens of apps and sources' },
                  { icon: MessageCircle, problem: 'Life-changing solutions buried in forum threads' },
                  { icon: Brain, problem: 'Decision fatigue from 300+ daily choices' },
                ].map((item, index) => (
                  <Card key={index} className="p-4 border-destructive/20 bg-destructive/5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-destructive/10 rounded-lg">
                        <item.icon className="h-5 w-5 text-destructive" />
                      </div>
                      <p className="text-foreground font-medium">{item.problem}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section - Features */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" /> Our Solution
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                GlucoForge Platform Overview
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A comprehensive ecosystem built by the T1D community, for the T1D community
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureCategories.map((category, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className={cn("p-4 bg-gradient-to-r text-white", category.color)}>
                    <category.icon className="h-6 w-6 mb-2" />
                    <h3 className="text-lg font-bold">{category.title}</h3>
                  </div>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {category.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Rocket className="h-3 w-3 mr-1" /> Development Roadmap
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Where We're Going
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your support directly accelerates this timeline
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roadmapPhases.map((phase, index) => (
                  <Card 
                    key={index} 
                    className={cn(
                      "relative overflow-hidden",
                      phase.status === 'current' && "ring-2 ring-brand-teal"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0 left-0 w-full h-1",
                      phase.status === 'complete' && "bg-green-500",
                      phase.status === 'current' && "bg-brand-teal",
                      phase.status === 'upcoming' && "bg-amber-500",
                      phase.status === 'planned' && "bg-blue-500",
                      phase.status === 'vision' && "bg-purple-500"
                    )} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={phase.status === 'current' ? 'default' : 'secondary'}>
                          {phase.phase}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{phase.timeline}</span>
                      </div>
                      <CardTitle className="text-lg">{phase.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {phase.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            {phase.status === 'complete' ? (
                              <CheckCircle2 className="h-3 w-3 text-success" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                            )}
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Transparency Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Shield className="h-3 w-3 mr-1" /> Transparency
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Where Your Donation Goes
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every dollar is tracked and reported quarterly
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {fundingAllocation.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-purple-dark to-brand-teal rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Lightbulb className="h-3 w-3 mr-1" /> Why GlucoForge
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Makes Us Different
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {valueProps.map((prop, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="inline-flex p-3 bg-brand-teal/10 rounded-xl mb-4">
                    <prop.icon className="h-6 w-6 text-brand-teal" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground">{prop.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <MessageCircle className="h-3 w-3 mr-1" /> Impact Stories
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Real People, Real Impact
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="text-sm">
                    <span className="font-semibold">{testimonial.author}</span>
                    <span className="text-muted-foreground"> • {testimonial.context}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Donor Tiers */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Award className="h-3 w-3 mr-1" /> Recognition
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Donor Tiers & Benefits
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {donorTiers.map((tier, index) => (
                <Card key={index} className={cn(
                  "p-4 text-center",
                  index === donorTiers.length - 1 && "ring-2 ring-brand-teal bg-brand-teal/5"
                )}>
                  <h3 className="font-bold text-lg mb-1">{tier.name}</h3>
                  <p className="text-brand-teal font-semibold text-sm mb-3">{tier.range}</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Donation Section */}
        <section id="donate-section" className="py-16 md:py-24 bg-gradient-to-br from-brand-purple-dark/10 via-brand-purple-light/5 to-brand-teal/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <Badge variant="secondary" className="mb-4">
                  <Heart className="h-3 w-3 mr-1" /> Make Your Impact
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Support GlucoForge Today
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle>Choose Your Contribution</CardTitle>
                    <CardDescription>Every amount makes a difference</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 space-y-6">
                    <Tabs value={donationType} onValueChange={(v) => setDonationType(v as 'one-time' | 'monthly')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="one-time">One-Time</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="space-y-4">
                      <div className="text-center">
                        <span className="text-4xl font-bold text-brand-purple-dark">${donationAmount}</span>
                        {donationType === 'monthly' && (
                          <span className="text-muted-foreground">/month</span>
                        )}
                      </div>

                      <Slider
                        value={[donationAmount]}
                        onValueChange={(value) => setDonationAmount(value[0])}
                        min={5}
                        max={5000}
                        step={5}
                        className="w-full"
                      />

                      <div className="grid grid-cols-4 gap-2">
                        {[25, 50, 100, 250].map((amount) => (
                          <Button
                            key={amount}
                            variant={donationAmount === amount ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setDonationAmount(amount)}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button onClick={handleDonate} size="lg" className="w-full" variant="hero">
                      <Heart className="mr-2 h-5 w-5" />
                      Donate ${donationAmount} {donationType === 'monthly' ? 'Monthly' : 'Now'}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Secure payment via Stripe. We're working toward 501(c)(3) status.
                    </p>
                  </CardContent>
                </Card>

                <div>
                  <DonationImpactVisualization amount={donationAmount} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alternative Ways */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <HeartHandshake className="h-3 w-3 mr-1" /> Other Ways to Help
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Can't Donate Financially?
              </h2>
              <p className="text-muted-foreground">
                There are many ways to support our mission
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
              {alternativeWays.map((way, index) => (
                <Card key={index} className="p-4 text-center hover:shadow-lg transition-shadow">
                  {way.link ? (
                    <Link to={way.link} className="block">
                      <way.icon className="h-8 w-8 mx-auto mb-3 text-brand-teal" />
                      <h3 className="font-semibold text-sm mb-1">{way.title}</h3>
                      <p className="text-xs text-muted-foreground">{way.description}</p>
                    </Link>
                  ) : (
                    <>
                      <way.icon className="h-8 w-8 mx-auto mb-3 text-brand-teal" />
                      <h3 className="font-semibold text-sm mb-1">{way.title}</h3>
                      <p className="text-xs text-muted-foreground">{way.description}</p>
                    </>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <MessageCircle className="h-3 w-3 mr-1" /> FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-brand-purple-dark to-brand-teal text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Join hundreds of supporters who are helping build the future of T1D management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-brand-purple-dark hover:bg-white/90" onClick={handleDonate}>
                <Heart className="mr-2 h-5 w-5" /> Donate Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link to="/contact">
                  <DollarSign className="mr-2 h-4 w-4" /> Major Gift Inquiry
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-white/60 text-sm">
              For donations over $5,000 or corporate sponsorships, contact us directly at{' '}
              <a href="mailto:support@glucoforge.org" className="underline hover:text-white">
                support@glucoforge.org
              </a>
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
