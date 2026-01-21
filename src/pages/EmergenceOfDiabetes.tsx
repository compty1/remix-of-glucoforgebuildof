import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  AlertCircle, 
  Check, 
  X,
  HelpCircle,
  Beaker,
  Brain,
  BookOpen
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

interface EmergenceData {
  id: string;
  year: number;
  diagnoses_count: number | null;
  region: string | null;
  age_group: string | null;
  source: string | null;
}

interface DiabetesMyth {
  id: string;
  myth: string;
  official_verdict: string | null;
  official_explanation: string | null;
  official_sources: string[] | null;
  autonomous_verdict: string | null;
  autonomous_explanation: string | null;
  autonomous_reasoning: string | null;
}

const verdictConfig = {
  true: { icon: <Check className="h-5 w-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  false: { icon: <X className="h-5 w-5" />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  partially_true: { icon: <HelpCircle className="h-5 w-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  unproven: { icon: <HelpCircle className="h-5 w-5" />, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20' },
  requires_investigation: { icon: <Beaker className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' }
};

const MythCard: React.FC<{ myth: DiabetesMyth }> = ({ myth }) => {
  const officialConfig = verdictConfig[myth.official_verdict as keyof typeof verdictConfig] || verdictConfig.unproven;
  const autonomousConfig = verdictConfig[myth.autonomous_verdict as keyof typeof verdictConfig] || verdictConfig.unproven;

  return (
    <Card className="command-center-widget">
      <CardHeader>
        <CardTitle className="text-lg flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <span>{myth.myth}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Official Verdict */}
          <div className={`p-4 rounded-lg ${officialConfig.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4" />
              <h4 className="font-semibold">Official Determination</h4>
            </div>
            <div className={`flex items-center gap-2 mb-2 ${officialConfig.color}`}>
              {officialConfig.icon}
              <Badge variant="outline" className="capitalize">{myth.official_verdict?.replace('_', ' ')}</Badge>
            </div>
            {myth.official_explanation && (
              <p className="text-sm text-muted-foreground">{myth.official_explanation}</p>
            )}
            {myth.official_sources && myth.official_sources.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Sources:</p>
                <ul className="text-xs text-muted-foreground">
                  {myth.official_sources.map((source, i) => (
                    <li key={i}>• {source}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Autonomous Verdict */}
          <div className={`p-4 rounded-lg ${autonomousConfig.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4" />
              <h4 className="font-semibold">Independent Analysis</h4>
            </div>
            <div className={`flex items-center gap-2 mb-2 ${autonomousConfig.color}`}>
              {autonomousConfig.icon}
              <Badge variant="outline" className="capitalize">{myth.autonomous_verdict?.replace('_', ' ')}</Badge>
            </div>
            {myth.autonomous_explanation && (
              <p className="text-sm text-muted-foreground mb-2">{myth.autonomous_explanation}</p>
            )}
            {myth.autonomous_reasoning && (
              <details className="text-xs">
                <summary className="cursor-pointer text-primary">View reasoning</summary>
                <p className="mt-2 text-muted-foreground">{myth.autonomous_reasoning}</p>
              </details>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EmergenceOfDiabetes() {
  const [emergenceData, setEmergenceData] = useState<EmergenceData[]>([]);
  const [myths, setMyths] = useState<DiabetesMyth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dataResult, mythsResult] = await Promise.all([
        supabase.from('diabetes_emergence_data').select('*').order('year', { ascending: true }),
        supabase.from('diabetes_myths').select('*').order('created_at', { ascending: false })
      ]);

      if (dataResult.error) throw dataResult.error;
      if (mythsResult.error) throw mythsResult.error;

      setEmergenceData(dataResult.data || []);
      setMyths(mythsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = emergenceData.reduce((acc: any[], item) => {
    const existing = acc.find(d => d.year === item.year);
    if (existing) {
      if (item.region) {
        existing[item.region] = item.diagnoses_count;
      }
    } else {
      acc.push({
        year: item.year,
        [item.region || 'global']: item.diagnoses_count
      });
    }
    return acc;
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">
              The Emergence of Diabetes
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Examining the dramatic rise in Type 1 diabetes diagnoses over the past 35 years, 
            separating fact from fiction, and exploring both official and independent analyses.
          </p>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trends">Rising Trends</TabsTrigger>
            <TabsTrigger value="myths">Myths & Facts</TabsTrigger>
            <TabsTrigger value="factors">Contributing Factors</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="command-center-widget">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">3-5%</p>
                  <p className="text-sm text-muted-foreground">Annual increase in T1D diagnoses worldwide</p>
                </CardContent>
              </Card>
              <Card className="command-center-widget">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">1.6M+</p>
                  <p className="text-sm text-muted-foreground">Americans living with T1D</p>
                </CardContent>
              </Card>
              <Card className="command-center-widget">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">40K+</p>
                  <p className="text-sm text-muted-foreground">New diagnoses per year in the US</p>
                </CardContent>
              </Card>
            </div>

            {/* Trend Chart */}
            <Card className="command-center-widget">
              <CardHeader>
                <CardTitle>T1D Diagnoses Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-80 w-full" />
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="global" stroke="hsl(var(--primary))" strokeWidth={2} name="Global" />
                      <Line type="monotone" dataKey="US" stroke="hsl(var(--chart-2))" strokeWidth={2} name="United States" />
                      <Line type="monotone" dataKey="Europe" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Europe" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <p>Trend data will be available soon</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="myths" className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50 border mb-6">
              <p className="text-sm text-muted-foreground">
                <strong>How to read this section:</strong> Each myth is evaluated twice - 
                once using official medical standards and established studies (Official Determination), 
                and once through independent AI analysis considering broader data from pharmacology, 
                diet, environmental factors, and emerging research (Independent Analysis).
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : myths.length > 0 ? (
              <div className="space-y-6">
                {myths.map(myth => (
                  <MythCard key={myth.id} myth={myth} />
                ))}
              </div>
            ) : (
              <Card className="command-center-widget">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Myths Coming Soon</h3>
                  <p className="text-muted-foreground">
                    We're compiling and analyzing common myths about Type 1 diabetes.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="factors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle>Environmental Factors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium">Vitamin D Deficiency</h4>
                    <p className="text-sm text-muted-foreground">
                      Increased indoor lifestyles correlate with rising T1D rates.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium">Gut Microbiome Changes</h4>
                    <p className="text-sm text-muted-foreground">
                      Antibiotic use and processed foods affecting gut health.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium">Viral Triggers</h4>
                    <p className="text-sm text-muted-foreground">
                      Certain viral infections may trigger autoimmune response.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle>Lifestyle Changes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium">Hygiene Hypothesis</h4>
                    <p className="text-sm text-muted-foreground">
                      Reduced exposure to pathogens in early life may affect immune development.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium">Dietary Changes</h4>
                    <p className="text-sm text-muted-foreground">
                      Early introduction of certain foods and formula feeding studied.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium">Chemical Exposures</h4>
                    <p className="text-sm text-muted-foreground">
                      Pesticides, BPA, and other chemicals under investigation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
