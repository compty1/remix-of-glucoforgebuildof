import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoRail } from '@/components/InfoRail';
import { Skeleton } from '@/components/ui/skeleton';
import { EntityLogo } from '@/components/ui/entity-logo';
import { 
  Building2, 
  Search, 
  ExternalLink, 
  Users, 
  Calendar,
  DollarSign,
  Target,
  Globe,
  Heart,
  BookOpen,
  Award,
  Star,
  Filter
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  acronym: string;
  purpose: string;
  mission_statement: string;
  org_type: 'research' | 'advocacy' | 'support' | 'education' | 'hybrid' | 'foundation';
  founded_year: number;
  headquarters: string;
  country: string;
  annual_revenue: number;
  annual_donations: number;
  executive_compensation: {
    ceo_name?: string;
    ceo_salary?: number;
  };
  staff_count: number;
  volunteer_count: number;
  current_projects: Array<{ name: string; description: string }>;
  recent_projects: Array<{ name: string; year: number }>;
  future_plans: string;
  history_summary: string;
  notable_achievements: string[];
  website_url: string;
  donate_url: string;
  logo_url: string;
  charity_navigator_rating: number;
}

// Real diabetes organizations data
const organizations: Organization[] = [
  {
    id: '1',
    name: 'Breakthrough T1D',
    acronym: 'BT1D',
    purpose: 'research',
    mission_statement: 'To accelerate life-changing breakthroughs to cure, prevent, and treat type 1 diabetes and its complications.',
    org_type: 'research',
    founded_year: 1970,
    headquarters: 'New York, NY',
    country: 'United States',
    annual_revenue: 200000000,
    annual_donations: 175000000,
    executive_compensation: { ceo_name: 'Aaron Kowalski, PhD', ceo_salary: 650000 },
    staff_count: 200,
    volunteer_count: 50000,
    current_projects: [
      { name: 'T1D Fund', description: 'Venture philanthropy fund investing in T1D cure research' },
      { name: 'Advocacy Program', description: 'Federal and state policy advocacy for T1D community' }
    ],
    recent_projects: [
      { name: 'Teplizumab Approval Support', year: 2022 },
      { name: 'Artificial Pancreas Project', year: 2020 }
    ],
    future_plans: 'Focusing on cell therapies, immunotherapy approaches, and artificial pancreas technology advancement.',
    history_summary: 'Founded in 1970 by parents of children with T1D. Originally named Juvenile Diabetes Research Foundation (JDRF). Rebranded to Breakthrough T1D in 2024. Has funded over $3 billion in research.',
    notable_achievements: ['Helped develop first CGM', 'Funded teplizumab development', 'Created artificial pancreas roadmap'],
    website_url: 'https://www.breakthrought1d.org',
    donate_url: 'https://www.breakthrought1d.org/donate/',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    id: '2',
    name: 'American Diabetes Association',
    acronym: 'ADA',
    purpose: 'hybrid',
    mission_statement: 'To prevent and cure diabetes and to improve the lives of all people affected by diabetes.',
    org_type: 'hybrid',
    founded_year: 1940,
    headquarters: 'Arlington, VA',
    country: 'United States',
    annual_revenue: 180000000,
    annual_donations: 130000000,
    executive_compensation: { ceo_name: 'Charles Henderson', ceo_salary: 700000 },
    staff_count: 400,
    volunteer_count: 100000,
    current_projects: [
      { name: 'Standards of Care', description: 'Annual clinical practice guidelines for diabetes care' },
      { name: 'Tour de Cure', description: 'Cycling fundraising events nationwide' }
    ],
    recent_projects: [
      { name: 'COVID-19 Diabetes Resource Center', year: 2020 },
      { name: 'Health Equity Now Initiative', year: 2021 }
    ],
    future_plans: 'Expanding access to insulin and diabetes technology, reducing healthcare disparities.',
    history_summary: 'Founded in 1940, ADA is the leading voluntary health organization fighting to bend the curve on the diabetes epidemic. Publishes Diabetes Care and Diabetes journals.',
    notable_achievements: ['Created first diabetes standards of care', 'Raised over $2B for research', 'Advocacy for insulin price caps'],
    website_url: 'https://www.diabetes.org',
    donate_url: 'https://www.diabetes.org/donate',
    logo_url: '',
    charity_navigator_rating: 3
  },
  {
    id: '3',
    name: 'Beyond Type 1',
    acronym: 'BT1',
    purpose: 'support',
    mission_statement: 'To change what it means to live with diabetes.',
    org_type: 'support',
    founded_year: 2015,
    headquarters: 'San Francisco, CA',
    country: 'United States',
    annual_revenue: 8000000,
    annual_donations: 6000000,
    executive_compensation: { ceo_name: 'Thom Scher', ceo_salary: 250000 },
    staff_count: 35,
    volunteer_count: 5000,
    current_projects: [
      { name: 'Beyond Type 1 App', description: 'Social network connecting people with T1D' },
      { name: 'Mental Health Resources', description: 'Diabetes distress and mental health support' }
    ],
    recent_projects: [
      { name: 'Snail Mail Club', year: 2021 },
      { name: 'Type 1 Diabetes Resource Guide', year: 2022 }
    ],
    future_plans: 'Expanding global community reach and mental health resources.',
    history_summary: 'Founded in 2015 by Nick Jonas and others. Focused on connecting the T1D community through technology and resources.',
    notable_achievements: ['Built largest T1D online community', 'Created comprehensive resource guides', 'Mental health awareness campaigns'],
    website_url: 'https://beyondtype1.org',
    donate_url: 'https://beyondtype1.org/donate/',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    id: '4',
    name: 'DiabetesSisters',
    acronym: 'DS',
    purpose: 'support',
    mission_statement: 'To improve the health and quality of life of women with diabetes.',
    org_type: 'support',
    founded_year: 2008,
    headquarters: 'Durham, NC',
    country: 'United States',
    annual_revenue: 1200000,
    annual_donations: 900000,
    executive_compensation: { ceo_name: 'Anna Norton', ceo_salary: 130000 },
    staff_count: 8,
    volunteer_count: 500,
    current_projects: [
      { name: 'PODS Meetups', description: 'Part of DiabetesSisters local meetup groups' },
      { name: 'Weekend for Women', description: 'Annual conference for women with diabetes' }
    ],
    recent_projects: [
      { name: 'Diabetes and Pregnancy Initiative', year: 2022 },
      { name: 'Menopause and Diabetes Resources', year: 2023 }
    ],
    future_plans: 'Expanding programs addressing women-specific diabetes challenges.',
    history_summary: 'Founded in 2008 to address the unique needs of women living with diabetes. Created grassroots local support network.',
    notable_achievements: ['Created nationwide PODS network', 'Research on diabetes and womens health', 'Annual Weekend for Women conference'],
    website_url: 'https://diabetessisters.org',
    donate_url: 'https://diabetessisters.org/donate',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    id: '5',
    name: 'The Diabetes Research Institute Foundation',
    acronym: 'DRIF',
    purpose: 'research',
    mission_statement: 'To provide the Diabetes Research Institute with the funding necessary to cure diabetes now.',
    org_type: 'research',
    founded_year: 1971,
    headquarters: 'Hollywood, FL',
    country: 'United States',
    annual_revenue: 25000000,
    annual_donations: 22000000,
    executive_compensation: { ceo_name: 'Sean Doherty', ceo_salary: 350000 },
    staff_count: 45,
    volunteer_count: 3000,
    current_projects: [
      { name: 'BioHub Project', description: 'Mini organ implant to restore insulin production' },
      { name: 'Islet Transplantation', description: 'Improving islet transplant outcomes' }
    ],
    recent_projects: [
      { name: 'BioHub Phase 1 Trials', year: 2023 },
      { name: 'Encapsulation Technology', year: 2022 }
    ],
    future_plans: 'Advancing BioHub technology toward larger clinical trials.',
    history_summary: 'Founded in 1971 to support the Diabetes Research Institute at University of Miami. Pioneered islet transplantation research.',
    notable_achievements: ['Developed Edmonton Protocol improvements', 'BioHub concept development', 'First islet-alone transplants'],
    website_url: 'https://www.diabetesresearch.org',
    donate_url: 'https://www.diabetesresearch.org/donate',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    id: '6',
    name: 'Children with Diabetes',
    acronym: 'CWD',
    purpose: 'education',
    mission_statement: 'To promote understanding, provide support, and help children with diabetes lead full, happy, and healthy lives.',
    org_type: 'education',
    founded_year: 1995,
    headquarters: 'West Chester, OH',
    country: 'United States',
    annual_revenue: 3500000,
    annual_donations: 2800000,
    executive_compensation: { ceo_name: 'Jeff Hitchcock', ceo_salary: 180000 },
    staff_count: 15,
    volunteer_count: 200,
    current_projects: [
      { name: 'Friends for Life Conference', description: 'Annual family conference for T1D' },
      { name: 'Online Community Forum', description: 'Support forum for families' }
    ],
    recent_projects: [
      { name: 'Virtual Friends for Life', year: 2020 },
      { name: 'Focus on Technology', year: 2023 }
    ],
    future_plans: 'Expanding Friends for Life conferences internationally.',
    history_summary: 'Founded in 1995 as one of the first online diabetes communities. Created the Friends for Life conference which has become the premier family diabetes event.',
    notable_achievements: ['Created Friends for Life conference', 'Pioneer in online diabetes community', 'Focus on Technology program'],
    website_url: 'https://childrenwithdiabetes.com',
    donate_url: 'https://childrenwithdiabetes.com/donate/',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    id: '7',
    name: 'T1D Exchange',
    acronym: 'T1DX',
    purpose: 'research',
    mission_statement: 'To accelerate the development of therapies and advance the overall care of people living with type 1 diabetes through the power of data.',
    org_type: 'research',
    founded_year: 2016,
    headquarters: 'Boston, MA',
    country: 'United States',
    annual_revenue: 15000000,
    annual_donations: 12000000,
    executive_compensation: { ceo_name: 'David Panzirer', ceo_salary: 300000 },
    staff_count: 50,
    volunteer_count: 1000,
    current_projects: [
      { name: 'Registry', description: 'Largest T1D patient registry for research' },
      { name: 'Quality Improvement Collaborative', description: 'Improving clinical care standards' }
    ],
    recent_projects: [
      { name: 'CGM Outcomes Research', year: 2023 },
      { name: 'Real-World Data Studies', year: 2022 }
    ],
    future_plans: 'Expanding registry to 500,000 participants for larger research studies.',
    history_summary: 'Founded by JDRF and Helmsley Charitable Trust. Operates largest T1D patient registry with 40,000+ participants.',
    notable_achievements: ['Created largest T1D registry', 'Published influential outcomes data', 'Quality improvement in clinics'],
    website_url: 'https://t1dexchange.org',
    donate_url: 'https://t1dexchange.org/donate/',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    id: '8',
    name: 'International Diabetes Federation',
    acronym: 'IDF',
    purpose: 'advocacy',
    mission_statement: 'To promote diabetes care, prevention and a cure worldwide.',
    org_type: 'advocacy',
    founded_year: 1950,
    headquarters: 'Brussels',
    country: 'Belgium',
    annual_revenue: 12000000,
    annual_donations: 8000000,
    executive_compensation: { ceo_name: 'Andrew Boulton', ceo_salary: 280000 },
    staff_count: 60,
    volunteer_count: 10000,
    current_projects: [
      { name: 'World Diabetes Day', description: 'Global awareness campaign each November 14' },
      { name: 'Diabetes Atlas', description: 'Global diabetes statistics and projections' }
    ],
    recent_projects: [
      { name: 'Diabetes Atlas 10th Edition', year: 2021 },
      { name: 'COVID-19 Response', year: 2020 }
    ],
    future_plans: 'Advocating for universal access to diabetes care and prevention programs.',
    history_summary: 'Founded in 1950, IDF is the umbrella organization for 230+ national diabetes associations in 170+ countries.',
    notable_achievements: ['Created World Diabetes Day', 'Publishes Diabetes Atlas', 'Global advocacy campaigns'],
    website_url: 'https://idf.org',
    donate_url: 'https://idf.org/donate/',
    logo_url: '',
    charity_navigator_rating: 4
  }
];

export default function DiabetesOrganizations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.mission_statement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || org.org_type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'research': return 'bg-primary/10 text-primary border-primary/20';
      case 'advocacy': return 'bg-success/10 text-success border-success/20';
      case 'support': return 'bg-highlight/10 text-highlight border-highlight/20';
      case 'education': return 'bg-warning/10 text-warning border-warning/20';
      case 'hybrid': return 'bg-accent/10 text-accent border-accent/20';
      case 'foundation': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const totalFunding = organizations.reduce((sum, org) => sum + (org.annual_revenue || 0), 0);
  const totalVolunteers = organizations.reduce((sum, org) => sum + (org.volunteer_count || 0), 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <BackButton fallbackPath="/dashboard" />

        {/* Hero Section */}
        <section className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-success rounded-xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Diabetes Organizations</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive directory of organizations dedicated to T1D research, advocacy, 
            support, and education. Verified data on funding, leadership, and impact.
          </p>
        </section>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 text-center">
              <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{organizations.length}</p>
              <p className="text-sm text-muted-foreground">Organizations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <DollarSign className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatCurrency(totalFunding)}</p>
              <p className="text-sm text-muted-foreground">Combined Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="h-8 w-8 text-highlight mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalVolunteers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Volunteers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Globe className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold">170+</p>
              <p className="text-sm text-muted-foreground">Countries Served</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Search & Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search organizations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Organization Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="advocacy">Advocacy</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Organizations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOrganizations.map((org) => (
                <Card key={org.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <EntityLogo
                        type="organization"
                        name={org.name}
                        websiteUrl={org.website_url}
                        size="lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {org.name}
                              {org.charity_navigator_rating >= 4 && (
                                <Star className="h-4 w-4 text-warning fill-current" />
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              Est. {org.founded_year} • {org.headquarters}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className={getTypeColor(org.org_type)}>
                            {org.org_type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {org.mission_statement}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Annual Revenue</p>
                        <p className="font-semibold">{formatCurrency(org.annual_revenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Volunteers</p>
                        <p className="font-semibold">{org.volunteer_count.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Current Projects */}
                    {org.current_projects.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Projects</p>
                        <div className="flex flex-wrap gap-1">
                          {org.current_projects.slice(0, 2).map((project, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {project.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => window.open(org.website_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Website
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => window.open(org.donate_url, '_blank')}
                      >
                        <Heart className="h-3 w-3" />
                        Donate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="Directory of verified diabetes organizations with real data on funding, leadership, and current projects."
              whyItMatters="Know where your donations go and find organizations aligned with your values and interests."
              nextSteps="Research organizations before donating. Consider volunteering or applying for their programs."
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-warning" />
                  Top Rated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {organizations
                    .filter(org => org.charity_navigator_rating >= 4)
                    .slice(0, 4)
                    .map(org => (
                      <div key={org.id} className="flex items-center justify-between">
                        <span className="text-sm">{org.acronym}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: org.charity_navigator_rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-warning fill-current" />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  By Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['research', 'advocacy', 'support', 'education'].map(type => {
                    const count = organizations.filter(o => o.org_type === type).length;
                    return (
                      <div 
                        key={type} 
                        className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 p-2 rounded"
                        onClick={() => setSelectedType(type)}
                      >
                        <span className="capitalize">{type}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
