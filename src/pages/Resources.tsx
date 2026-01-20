import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Heart, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Calculator,
  BookOpen,
  ExternalLink,
  Search,
  FileCheck,
  GraduationCap,
  Phone,
  Globe,
  Baby,
  Sparkles,
  Map,
  Pill,
  Stethoscope
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Resource {
  id: string;
  title: string;
  description: string;
  url?: string;
  internalRoute?: string;
  type: 'external' | 'internal' | 'tool';
  featured?: boolean;
  tags?: string[];
}

const resourceCategories = [
  {
    id: 'insurance',
    label: 'Insurance & Financial',
    icon: Shield,
    description: 'Health insurance support, coverage guides, and financial assistance',
    resources: [
      {
        id: '1',
        title: 'Health Insurance Support Hub',
        description: 'Find coverage options, appeal templates, and navigate insurance denials for diabetes supplies.',
        url: 'https://diabetes.org/tools-resources/health-insurance-support',
        type: 'external' as const,
        featured: true,
        tags: ['insurance', 'coverage']
      },
      {
        id: '2',
        title: 'Prior Authorization Guide',
        description: 'Step-by-step guide to getting prior authorization for CGMs, pumps, and insulin.',
        url: 'https://diabetes.org/tools-resources/health-insurance-support',
        type: 'external' as const,
        tags: ['insurance', 'authorization']
      },
      {
        id: '3',
        title: 'Insurance Appeal Letter Generator',
        description: 'Create personalized appeal letters for insurance denials using our AI-powered tool.',
        internalRoute: '/financial-tools',
        type: 'internal' as const,
        featured: true,
        tags: ['insurance', 'appeals', 'tool']
      },
      {
        id: '4',
        title: 'FSA/HSA Optimization Guide',
        description: 'Maximize your flexible spending account for diabetes supplies and equipment.',
        url: 'https://diabetes.org/tools-resources/health-insurance-support',
        type: 'external' as const,
        tags: ['fsa', 'hsa', 'savings']
      }
    ]
  },
  {
    id: 'affordability',
    label: 'Affordable Insulin',
    icon: DollarSign,
    description: 'Programs and resources to help afford insulin and supplies',
    resources: [
      {
        id: '5',
        title: 'Lilly $35 Insulin Program',
        description: 'Eli Lilly\'s program offering insulin for $35/month or less for eligible patients.',
        url: 'https://www.insulinaffordability.com/',
        type: 'external' as const,
        featured: true,
        tags: ['insulin', 'lilly', 'affordability']
      },
      {
        id: '6',
        title: 'Novo Nordisk Patient Assistance',
        description: 'Free or reduced-cost insulin for uninsured or underinsured patients.',
        url: 'https://www.novocare.com/insulin/my99insulin.html',
        type: 'external' as const,
        featured: true,
        tags: ['insulin', 'novo', 'patient assistance']
      },
      {
        id: '7',
        title: 'Sanofi Patient Connection',
        description: 'Sanofi\'s assistance program for Lantus, Toujeo, and Admelog.',
        url: 'https://www.sanofipatientconnection.com/',
        type: 'external' as const,
        tags: ['insulin', 'sanofi', 'assistance']
      },
      {
        id: '8',
        title: 'GetInsulin.org',
        description: 'Navigator tool to find the best insulin assistance program for your situation.',
        url: 'https://getinsulin.org/',
        type: 'external' as const,
        featured: true,
        tags: ['insulin', 'navigator', 'affordability']
      },
      {
        id: '9',
        title: 'Civica Rx Insulin',
        description: 'Low-cost biosimilar insulins available through Mark Cuban\'s Cost Plus Drugs.',
        url: 'https://costplusdrugs.com/medications/categories/diabetes/',
        type: 'external' as const,
        tags: ['insulin', 'biosimilar', 'cost plus']
      }
    ]
  },
  {
    id: 'mental-health',
    label: 'Mental Health',
    icon: Heart,
    description: 'Mental health resources, support groups, and therapist directories',
    resources: [
      {
        id: '10',
        title: 'ADA Mental Health Provider Directory',
        description: 'Find mental health professionals who specialize in diabetes-related challenges.',
        url: 'https://diabetes.org/tools-resources/mental-health-directory',
        type: 'external' as const,
        featured: true,
        tags: ['mental health', 'therapy', 'providers']
      },
      {
        id: '11',
        title: 'Mental Health Hub',
        description: 'Comprehensive mental health resources for people with T1D, including assessments and coping strategies.',
        internalRoute: '/mental-health',
        type: 'internal' as const,
        featured: true,
        tags: ['mental health', 'assessment', 'internal']
      },
      {
        id: '12',
        title: 'Diabulimia Helpline',
        description: 'Specialized support for eating disorders related to insulin manipulation.',
        url: 'https://www.diabetesandeatingdisorders.org.uk/',
        type: 'external' as const,
        tags: ['diabulimia', 'eating disorder', 'support']
      },
      {
        id: '13',
        title: 'Diabetes Distress Resources',
        description: 'Learn about diabetes burnout and distress, and find strategies to cope.',
        url: 'https://www.breakthrought1d.org/t1d-resources/',
        type: 'external' as const,
        tags: ['burnout', 'distress', 'coping']
      }
    ]
  },
  {
    id: 'newly-diagnosed',
    label: 'Newly Diagnosed',
    icon: Baby,
    description: 'Essential resources for those new to Type 1 Diabetes',
    resources: [
      {
        id: '14',
        title: 'Breakthrough T1D Newly Diagnosed Resources',
        description: 'Comprehensive toolkit for families and individuals newly diagnosed with T1D.',
        url: 'https://www.breakthrought1d.org/newly-diagnosed/',
        type: 'external' as const,
        featured: true,
        tags: ['newly diagnosed', 'toolkit', 'basics']
      },
      {
        id: '15',
        title: 'First 30 Days Survival Guide',
        description: 'Day-by-day guide to managing T1D in the first month after diagnosis.',
        url: 'https://www.breakthrought1d.org/t1d-resources/',
        type: 'external' as const,
        featured: true,
        tags: ['newly diagnosed', 'guide', 'first month']
      },
      {
        id: '16',
        title: 'Understanding Your Numbers',
        description: 'Learn to interpret blood glucose readings, A1C, and other key metrics.',
        url: 'https://diabetes.org/tools-resources/tests-calculators',
        type: 'external' as const,
        tags: ['education', 'numbers', 'basics']
      },
      {
        id: '17',
        title: 'Carb Counting 101',
        description: 'Essential guide to counting carbohydrates for insulin dosing.',
        url: 'https://diabetes.org/food-nutrition/understanding-carbs',
        type: 'external' as const,
        tags: ['carbs', 'nutrition', 'dosing']
      }
    ]
  },
  {
    id: 'disaster-relief',
    label: 'Disaster & Emergency',
    icon: AlertTriangle,
    description: 'Emergency preparedness and disaster relief resources',
    resources: [
      {
        id: '18',
        title: 'ADA Disaster Relief Resources',
        description: 'Emergency supply replacement, insulin storage during disasters, and relief programs.',
        url: 'https://diabetes.org/tools-resources/disaster-relief',
        type: 'external' as const,
        featured: true,
        tags: ['disaster', 'emergency', 'relief']
      },
      {
        id: '19',
        title: 'Emergency Supply Checklist',
        description: 'Personalized emergency kit checklist based on your diabetes management regimen.',
        internalRoute: '/scenario-lab',
        type: 'internal' as const,
        tags: ['emergency', 'supplies', 'checklist']
      },
      {
        id: '20',
        title: 'Insulin Storage Without Power',
        description: 'How to safely store insulin during power outages and extreme temperatures.',
        url: 'https://diabetes.org/tools-resources/disaster-relief',
        type: 'external' as const,
        tags: ['insulin', 'storage', 'power outage']
      }
    ]
  },
  {
    id: 'calculators',
    label: 'Tests & Calculators',
    icon: Calculator,
    description: 'Interactive tools for diabetes management calculations',
    resources: [
      {
        id: '21',
        title: 'ADA Tests & Calculators',
        description: 'Official ADA calculators for A1C, BMI, and diabetes risk assessment.',
        url: 'https://diabetes.org/tools-resources/tests-calculators',
        type: 'external' as const,
        featured: true,
        tags: ['calculator', 'a1c', 'tools']
      },
      {
        id: '22',
        title: 'Glucose Data Analyzer',
        description: 'Upload your CGM data to get AI-powered insights on patterns and time in range.',
        internalRoute: '/data-upload',
        type: 'internal' as const,
        featured: true,
        tags: ['cgm', 'analysis', 'internal']
      },
      {
        id: '23',
        title: 'Scenario Lab',
        description: 'Simulate glucose responses to different activities, foods, and situations.',
        internalRoute: '/scenario-lab',
        type: 'internal' as const,
        tags: ['simulator', 'prediction', 'internal']
      }
    ]
  },
  {
    id: 'community',
    label: 'Community & Support',
    icon: Users,
    description: 'Local chapters, support groups, and community connections',
    resources: [
      {
        id: '24',
        title: 'ADA Local Chapters',
        description: 'Find local ADA chapters for in-person events, walks, and community support.',
        url: 'https://diabetes.org/local/chapters',
        type: 'external' as const,
        featured: true,
        tags: ['community', 'local', 'events']
      },
      {
        id: '25',
        title: 'Community Solutions Finder',
        description: 'Discover real solutions shared by the T1D community for common challenges.',
        internalRoute: '/community-solutions',
        type: 'internal' as const,
        featured: true,
        tags: ['community', 'solutions', 'internal']
      },
      {
        id: '26',
        title: 'T1D Camp Programs',
        description: 'Find diabetes camps for children and teens to connect with peers.',
        url: 'https://www.breakthrought1d.org/t1d-resources/',
        type: 'external' as const,
        tags: ['camp', 'children', 'teens']
      },
      {
        id: '27',
        title: 'Breakthrough T1D Resources',
        description: 'Comprehensive resources from JDRF (now Breakthrough T1D) for all stages of T1D life.',
        url: 'https://www.breakthrought1d.org/t1d-resources/',
        type: 'external' as const,
        tags: ['resources', 'comprehensive', 'jdrf']
      }
    ]
  },
  {
    id: 'state-forms',
    label: 'State Forms',
    icon: FileCheck,
    description: 'State-specific forms for driving, school, and workplace accommodations',
    resources: [
      {
        id: '28',
        title: 'State Forms Finder',
        description: 'Find official state forms for driving privileges, school accommodations, and more.',
        internalRoute: '/resources/state-forms',
        type: 'internal' as const,
        featured: true,
        tags: ['forms', 'driving', 'school', 'state']
      }
    ]
  }
];

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('insurance');

  const filteredResources = resourceCategories.map(category => ({
    ...category,
    resources: category.resources.filter(resource =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }));

  const totalResources = resourceCategories.reduce((sum, cat) => sum + cat.resources.length, 0);
  const featuredResources = resourceCategories.flatMap(cat => 
    cat.resources.filter(r => r.featured)
  );

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">{resource.title}</h3>
              {resource.featured && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {resource.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {resource.tags?.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            {resource.type === 'external' && resource.url ? (
              <Button size="sm" variant="outline" asChild>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Visit
                </a>
              </Button>
            ) : resource.internalRoute ? (
              <Button size="sm" asChild>
                <Link to={resource.internalRoute}>
                  Open
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            T1D Resources Library
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Comprehensive resources for managing Type 1 Diabetes — from insurance support to mental health, 
            community connections to state-specific forms.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {totalResources} Resources
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {resourceCategories.length} Categories
            </span>
          </div>
        </section>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/resources/state-forms">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Map className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">State Forms Finder</p>
                  <p className="text-xs text-muted-foreground">DMV, School, Work</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <a href="https://getinsulin.org/" target="_blank" rel="noopener noreferrer">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Pill className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-sm">Insulin Assistance</p>
                  <p className="text-xs text-muted-foreground">Find affordable insulin</p>
                </div>
              </CardContent>
            </Card>
          </a>
          <Link to="/mental-health">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/30">
                  <Heart className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Mental Health</p>
                  <p className="text-xs text-muted-foreground">Support & Assessment</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/community-solutions">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/30">
                  <Users className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Community</p>
                  <p className="text-xs text-muted-foreground">Real solutions</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Tabbed Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
            {filteredResources.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.label}
                {searchQuery && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.resources.length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {filteredResources.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.label}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {category.resources.length > 0 ? (
                    <div className="grid gap-4">
                      {category.resources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No resources found matching "{searchQuery}"
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Need Immediate Help?</h3>
                  <p className="text-sm text-muted-foreground">
                    ADA Helpline: 1-800-DIABETES (1-800-342-2383)
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <a href="https://diabetes.org" target="_blank" rel="noopener noreferrer">
                    Visit ADA
                  </a>
                </Button>
                <Button asChild>
                  <a href="https://www.breakthrought1d.org/" target="_blank" rel="noopener noreferrer">
                    Breakthrough T1D
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Resources;
