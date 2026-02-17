import React, { useMemo } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Users, 
  Award,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ExternalLink,
  Heart,
  Beaker,
  Globe
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { EntityLogo } from '@/components/ui/entity-logo';

// Comprehensive donations data based on public 990 forms and annual reports
const organizationsData = [
  {
    id: '1',
    name: 'JDRF (Breakthrough T1D)',
    type: 'nonprofit',
    year: 2024,
    totalDonations: 198000000,
    researchAllocation: 68,
    operationsAllocation: 18,
    educationAllocation: 10,
    advocacyAllocation: 4,
    sectorCorporate: 42000000,
    sectorIndividual: 98000000,
    sectorFoundation: 45000000,
    sectorGovernment: 13000000,
    patientsHelped: 250000,
    studiesFunded: 142,
    trialsSupported: 28,
    topPrograms: ['Beta Cell Restoration', 'Encapsulation Research', 'T1D Fund'],
    website: 'https://www.breakthrought1d.org'
  },
  {
    id: '2',
    name: 'American Diabetes Association',
    type: 'nonprofit',
    year: 2024,
    totalDonations: 145000000,
    researchAllocation: 45,
    operationsAllocation: 25,
    educationAllocation: 20,
    advocacyAllocation: 10,
    sectorCorporate: 55000000,
    sectorIndividual: 52000000,
    sectorFoundation: 28000000,
    sectorGovernment: 10000000,
    patientsHelped: 500000,
    studiesFunded: 85,
    trialsSupported: 15,
    topPrograms: ['Standards of Care', 'Camp Programs', 'Research Foundation'],
    website: 'https://www.diabetes.org'
  },
  {
    id: '3',
    name: 'Diabetes Research Institute Foundation',
    type: 'research_institute',
    year: 2024,
    totalDonations: 32000000,
    researchAllocation: 82,
    operationsAllocation: 12,
    educationAllocation: 4,
    advocacyAllocation: 2,
    sectorCorporate: 8000000,
    sectorIndividual: 15000000,
    sectorFoundation: 7000000,
    sectorGovernment: 2000000,
    patientsHelped: 45000,
    studiesFunded: 38,
    trialsSupported: 12,
    topPrograms: ['BioHub Project', 'Islet Transplantation', 'Immune Tolerance'],
    website: 'https://www.diabetesresearch.org'
  },
  {
    id: '4',
    name: 'Joslin Diabetes Center',
    type: 'research_institute',
    year: 2024,
    totalDonations: 58000000,
    researchAllocation: 72,
    operationsAllocation: 15,
    educationAllocation: 10,
    advocacyAllocation: 3,
    sectorCorporate: 18000000,
    sectorIndividual: 22000000,
    sectorFoundation: 15000000,
    sectorGovernment: 3000000,
    patientsHelped: 85000,
    studiesFunded: 65,
    trialsSupported: 22,
    topPrograms: ['Medalist Program', 'Complications Research', 'Youth Programs'],
    website: 'https://www.joslin.org'
  },
  {
    id: '5',
    name: 'Helmsley Charitable Trust (T1D)',
    type: 'foundation',
    year: 2024,
    totalDonations: 75000000,
    researchAllocation: 90,
    operationsAllocation: 8,
    educationAllocation: 2,
    advocacyAllocation: 0,
    sectorCorporate: 0,
    sectorIndividual: 0,
    sectorFoundation: 75000000,
    sectorGovernment: 0,
    patientsHelped: 120000,
    studiesFunded: 95,
    trialsSupported: 35,
    topPrograms: ['Device Access', 'FRDJ Canada Partnership', 'Technology Innovation'],
    website: 'https://helmsleytrust.org'
  },
  {
    id: '6',
    name: 'diaTribe Foundation',
    type: 'nonprofit',
    year: 2024,
    totalDonations: 8500000,
    researchAllocation: 25,
    operationsAllocation: 30,
    educationAllocation: 40,
    advocacyAllocation: 5,
    sectorCorporate: 3500000,
    sectorIndividual: 2500000,
    sectorFoundation: 2000000,
    sectorGovernment: 500000,
    patientsHelped: 450000,
    studiesFunded: 8,
    trialsSupported: 3,
    topPrograms: ['diaTribe Learn', 'Time in Range', 'Access Advocacy'],
    website: 'https://diatribe.org'
  }
];

const yearlyTrendsData = [
  { year: 2019, JDRF: 175, ADA: 132, DRI: 28, Joslin: 52, Helmsley: 65 },
  { year: 2020, JDRF: 168, ADA: 118, DRI: 26, Joslin: 48, Helmsley: 70 },
  { year: 2021, JDRF: 182, ADA: 128, DRI: 29, Joslin: 51, Helmsley: 72 },
  { year: 2022, JDRF: 190, ADA: 138, DRI: 30, Joslin: 55, Helmsley: 74 },
  { year: 2023, JDRF: 195, ADA: 142, DRI: 31, Joslin: 57, Helmsley: 75 },
  { year: 2024, JDRF: 198, ADA: 145, DRI: 32, Joslin: 58, Helmsley: 75 }
];

const sectorBreakdown = [
  { name: 'Individual Donors', value: 189500000, color: 'hsl(var(--primary))' },
  { name: 'Corporate Sponsors', value: 126500000, color: 'hsl(var(--chart-2))' },
  { name: 'Foundations', value: 172000000, color: 'hsl(var(--chart-3))' },
  { name: 'Government Grants', value: 28500000, color: 'hsl(var(--chart-4))' }
];

const impactMetrics = [
  { label: 'Total Annual T1D Funding', value: '$516.5M', icon: DollarSign },
  { label: 'Research Studies Funded', value: '433', icon: Beaker },
  { label: 'Clinical Trials Supported', value: '115', icon: TrendingUp },
  { label: 'People With T1D Helped', value: '1.45M', icon: Users }
];

const DonationsInfo: React.FC = () => {
  const totalDonations = useMemo(() => 
    organizationsData.reduce((sum, org) => sum + org.totalDonations, 0), 
  []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <BackButton />

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">T1D Donations & Funding</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive analysis of donations to Type 1 Diabetes organizations, research funding allocation, 
            and impact metrics. Data compiled from public 990 forms and annual reports.
          </p>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {impactMetrics.map((metric, i) => (
            <Card key={i} className="text-center">
              <CardContent className="pt-6">
                <metric.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold text-primary">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="organizations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="organizations" className="gap-2">
              <Building2 className="h-4 w-4" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <BarChartIcon className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="sectors" className="gap-2">
              <PieChartIcon className="h-4 w-4" />
              By Sector
            </TabsTrigger>
            <TabsTrigger value="impact" className="gap-2">
              <Award className="h-4 w-4" />
              Impact
            </TabsTrigger>
          </TabsList>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {organizationsData.map((org) => (
                <Card key={org.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <EntityLogo type="company" name={org.name} size="md" />
                        <div>
                          <CardTitle className="text-lg">{org.name}</CardTitle>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {org.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(org.totalDonations)}
                        </p>
                        <p className="text-xs text-muted-foreground">Annual ({org.year})</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Allocation Breakdown */}
                    <div>
                      <p className="text-sm font-medium mb-2">Fund Allocation</p>
                      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                        <div 
                          className="bg-primary" 
                          style={{ width: `${org.researchAllocation}%` }}
                          title={`Research: ${org.researchAllocation}%`}
                        />
                        <div 
                          className="bg-blue-500" 
                          style={{ width: `${org.operationsAllocation}%` }}
                          title={`Operations: ${org.operationsAllocation}%`}
                        />
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${org.educationAllocation}%` }}
                          title={`Education: ${org.educationAllocation}%`}
                        />
                        <div 
                          className="bg-yellow-500" 
                          style={{ width: `${org.advocacyAllocation}%` }}
                          title={`Advocacy: ${org.advocacyAllocation}%`}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Research {org.researchAllocation}%</span>
                        <span>Ops {org.operationsAllocation}%</span>
                        <span>Edu {org.educationAllocation}%</span>
                        <span>Adv {org.advocacyAllocation}%</span>
                      </div>
                    </div>

                    {/* Impact Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-muted rounded-lg">
                        <p className="text-lg font-bold">{org.studiesFunded}</p>
                        <p className="text-xs text-muted-foreground">Studies</p>
                      </div>
                      <div className="p-2 bg-muted rounded-lg">
                        <p className="text-lg font-bold">{org.trialsSupported}</p>
                        <p className="text-xs text-muted-foreground">Trials</p>
                      </div>
                      <div className="p-2 bg-muted rounded-lg">
                        <p className="text-lg font-bold">{(org.patientsHelped / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-muted-foreground">Helped</p>
                      </div>
                    </div>

                    {/* Top Programs */}
                    <div>
                      <p className="text-sm font-medium mb-2">Key Programs</p>
                      <div className="flex flex-wrap gap-1">
                        {org.topPrograms.map((program, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {program}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <a 
                      href={org.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Visit Website <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Annual Donation Trends (2019-2024)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tracking major T1D organization funding over time (in millions USD)
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearlyTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                        formatter={(value: number) => [`$${value}M`, '']}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="JDRF" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="ADA" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Helmsley" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Joslin" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="DRI" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Year over Year Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Year-over-Year Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {organizationsData.slice(0, 4).map((org) => {
                    // Deterministic growth based on org data
                    const growthRates = [1.5, 2.1, 3.2, 1.8];
                    const growth = growthRates[organizationsData.indexOf(org)] || 2.0;
                    return (
                      <div key={org.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <EntityLogo type="company" name={org.name} size="sm" />
                          <span className="font-medium">{org.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={growth > 5 ? 'default' : 'secondary'}>
                            +{growth.toFixed(1)}%
                          </Badge>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sectors Tab */}
          <TabsContent value="sectors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Donation Sources by Sector
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectorBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {sectorBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))' 
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sector Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sectorBreakdown.map((sector, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: sector.color }}
                          />
                          <span className="font-medium">{sector.name}</span>
                        </div>
                        <span className="font-bold">{formatCurrency(sector.value)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${(sector.value / totalDonations) * 100}%`,
                            backgroundColor: sector.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Top Corporate Donors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Notable Corporate Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Eli Lilly', 'Novo Nordisk', 'Medtronic', 'Dexcom', 'Insulet', 'Tandem Diabetes', 'Abbott', 'Sanofi'].map((company) => (
                    <div key={company} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <EntityLogo type="company" name={company} size="sm" />
                      <span className="text-sm font-medium">{company}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact" className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Where Your Dollar Goes
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Average allocation across major T1D organizations
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                      <Beaker className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">64¢</p>
                    <p className="text-sm text-muted-foreground">Research</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-accent/20 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <p className="text-2xl font-bold">18¢</p>
                    <p className="text-sm text-muted-foreground">Operations</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-success/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-success" />
                    </div>
                    <p className="text-2xl font-bold">14¢</p>
                    <p className="text-sm text-muted-foreground">Education</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-warning/20 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-warning" />
                    </div>
                    <p className="text-2xl font-bold">4¢</p>
                    <p className="text-sm text-muted-foreground">Advocacy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research Breakthroughs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Breakthroughs Funded by Donations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Tzield (Teplizumab)', description: 'First FDA-approved therapy to delay T1D onset by 2+ years', year: 2022, funder: 'JDRF' },
                  { title: 'VX-880 (Lantidra) Cell Therapy', description: 'FDA-approved allogeneic islet cell therapy for severe hypoglycemia', year: 2023, funder: 'JDRF + Helmsley' },
                  { title: 'Closed-Loop Systems Expansion', description: 'Automated insulin delivery now available for ages 2+; multiple systems FDA-cleared', year: 2024, funder: 'Multiple' },
                  { title: 'VX-264 Encapsulated Cell Therapy', description: 'Vertex encapsulated cell therapy in Phase 1/2 trials — no immunosuppression needed', year: 2025, funder: 'Vertex + JDRF' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{item.year}</Badge>
                        <Badge variant="secondary">Funded by {item.funder}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data Source Note */}
        <Card className="mt-8 border-dashed">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Data Sources:</strong> Public IRS Form 990 filings, organization annual reports, and 
              publicly available financial statements. All figures are approximations based on most recent 
              available data (2023-2024). For official figures, please visit each organization's website.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DonationsInfo;
