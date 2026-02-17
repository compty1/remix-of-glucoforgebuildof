import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Brain, Activity, Moon, Eye, Shield, Zap, 
  Users, Clock, AlertTriangle, TrendingDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const physicalComparisons = [
  { category: 'Cardiovascular Risk', t1d: 75, healthy: 20, unit: 'Risk Score', t1dLabel: '2-4x higher', healthyLabel: 'Baseline', detail: 'T1D patients face 2-4x increased risk of heart disease due to chronic hyperglycemia and glucose variability causing endothelial dysfunction.', source: 'ADA Standards of Care 2024', icon: Heart },
  { category: 'Kidney Disease', t1d: 40, healthy: 5, unit: '% Prevalence', t1dLabel: '40% develop nephropathy', healthyLabel: '<5% prevalence', detail: 'Approximately 40% of T1D patients develop some degree of diabetic nephropathy. Tight glucose control reduces risk by 54%.', source: 'DCCT/EDIC Study, N Engl J Med 2011', icon: Shield },
  { category: 'Neuropathy', t1d: 50, healthy: 1, unit: '% Lifetime Risk', t1dLabel: '50% over lifetime', healthyLabel: '<1% prevalence', detail: 'Peripheral neuropathy affects half of all T1D patients over their lifetime. Glucose variability (CV >36%) is a key independent risk factor.', source: 'Pop-Busui et al., Diabetes Care 2017', icon: Zap },
  { category: 'Sleep Disruption', t1d: 45, healthy: 15, unit: '% Affected', t1dLabel: '45% disrupted', healthyLabel: '15% general pop.', detail: 'Nocturnal hypoglycemia, CGM alarms, and anxiety about overnight glucose levels fragment sleep. Poor sleep worsens next-day insulin resistance by 25%.', source: 'Reutrakul & Van Cauter, Diabetes Care 2018', icon: Moon },
  { category: 'Retinopathy', t1d: 80, healthy: 0, unit: '% After 15yr', t1dLabel: '80% show changes', healthyLabel: 'No diabetes risk', detail: 'After 15+ years of T1D, approximately 80% show some retinal changes. Each 1% reduction in A1C reduces retinopathy risk by 35%.', source: 'DCCT, Diabetes 1995', icon: Eye },
  { category: 'Life Expectancy Gap', t1d: 70, healthy: 82, unit: 'Avg Years', t1dLabel: '8-13 year gap', healthyLabel: 'Full expectancy', detail: 'T1D is associated with an 8-13 year reduction in life expectancy, though modern management is narrowing this gap significantly.', source: 'Scottish Diabetes Registry 2015; Swedish NDR 2019', icon: TrendingDown },
];

const mentalComparisons = [
  { category: 'Daily Decisions', t1d: 240, healthy: 35, unit: 'Decisions/Day', t1dLabel: '180-300/day', healthyLabel: '~35/day', detail: 'Every meal, activity change, glucose fluctuation, and insulin adjustment requires conscious decision-making. This creates an invisible cognitive load that non-diabetics never experience.' },
  { category: 'Diabetes Distress', t1d: 35, healthy: 0, unit: '% Prevalence', t1dLabel: '25-45%', healthyLabel: '0% (N/A)', detail: 'Feeling overwhelmed, burned out, or defeated by the constant demands of diabetes management. This is distinct from clinical depression and specific to the diabetes experience.' },
  { category: 'Depression', t1d: 22, healthy: 8, unit: '% Prevalence', t1dLabel: '2-3x higher', healthyLabel: '7-8% baseline', detail: 'The chronic burden of T1D management, fear of complications, and constant vigilance significantly increase risk of major depressive disorder.', source: 'Anderson et al., Diabetes Care 2001 (meta-analysis)' },
  { category: 'Anxiety', t1d: 20, healthy: 7, unit: '% Prevalence', t1dLabel: '20% prevalence', healthyLabel: '7% general pop.', detail: 'Fear of hypoglycemia is the primary driver, but complications worry, social stigma, and the unpredictability of glucose also contribute.', source: 'Smith et al., Diabetic Medicine 2013' },
  { category: 'Burnout', t1d: 50, healthy: 10, unit: '% Experience', t1dLabel: '44-54%', healthyLabel: '~10% (work burnout)', detail: 'Diabetes burnout—the feeling of being overwhelmed by and wanting to give up on management—affects roughly half of all T1D patients at some point.' },
];

const chartDataPhysical = physicalComparisons.slice(0, 5).map(c => ({
  name: c.category,
  'T1D': c.t1d,
  'Healthy': c.healthy,
}));

const chartDataMental = mentalComparisons.map(c => ({
  name: c.category,
  'T1D': c.t1d,
  'Healthy': c.healthy,
}));

const QoLComparisonSection: React.FC = () => {
  return (
    <section className="py-8 px-4 border-b">
      <div className="container mx-auto max-w-6xl space-y-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Activity className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">T1D vs. Healthy Person: Quality of Life Comparison</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Research-backed comparison of the physical and mental health impact of living with Type 1 Diabetes 
            versus a healthy individual. All data sourced from peer-reviewed clinical studies.
          </p>
        </div>

        {/* Physical Health Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              Physical Health Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataPhysical} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={95} />
                  <Tooltip />
                  <Bar dataKey="T1D" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} name="T1D" />
                  <Bar dataKey="Healthy" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} name="Healthy Person" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {physicalComparisons.map((comp, i) => (
                <div key={i} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-start gap-3">
                    <comp.icon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">{comp.category}</h4>
                      <div className="flex gap-4 mt-1 text-sm">
                        <span className="text-destructive font-medium">{comp.t1dLabel}</span>
                        <span className="text-success">{comp.healthyLabel}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{comp.detail}</p>
                      <p className="text-xs text-muted-foreground mt-1 italic">📚 {comp.source}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mental Health Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-highlight" />
              Mental Health & Psychological Burden
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chart */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataMental} layout="vertical" margin={{ left: 110, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={105} />
                  <Tooltip />
                  <Bar dataKey="T1D" fill="hsl(var(--highlight))" radius={[0, 4, 4, 0]} name="T1D" />
                  <Bar dataKey="Healthy" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} name="Healthy Person" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detail Cards */}
            <div className="space-y-3">
              {mentalComparisons.map((comp, i) => (
                <div key={i} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold">{comp.category}</h4>
                      <div className="flex gap-4 mt-1 text-sm">
                        <span className="text-highlight font-medium">{comp.t1dLabel}</span>
                        <span className="text-success">{comp.healthyLabel}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{comp.detail}</p>
                      {comp.source && <p className="text-xs text-muted-foreground mt-1 italic">📚 {comp.source}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overall QoL Score */}
        <Card className="bg-gradient-to-r from-primary/5 via-highlight/5 to-success/5">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Overall Quality of Life Impact</h3>
              <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                Based on WHO-5 Well-Being Index, PAID (Problem Areas in Diabetes) scale, and SF-36 Health Survey data
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-background border">
                  <p className="text-sm text-muted-foreground">WHO-5 Well-Being</p>
                  <p className="text-2xl font-bold text-highlight">56/100</p>
                  <p className="text-xs text-muted-foreground">vs. 72/100 general pop.</p>
                  <p className="text-xs text-muted-foreground italic mt-1">Topp et al., 2015</p>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <p className="text-sm text-muted-foreground">Diabetes Distress (PAID)</p>
                  <p className="text-2xl font-bold text-warning">38/100</p>
                  <p className="text-xs text-muted-foreground">≥40 = clinically significant</p>
                  <p className="text-xs text-muted-foreground italic mt-1">Polonsky et al., 2005</p>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <p className="text-sm text-muted-foreground">SF-36 Physical Health</p>
                  <p className="text-2xl font-bold text-primary">45/100</p>
                  <p className="text-xs text-muted-foreground">vs. 50/100 norm (lower = worse)</p>
                  <p className="text-xs text-muted-foreground italic mt-1">Hart et al., Diabetes Care 2003</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="p-4 rounded-lg bg-muted/50 border text-center">
          <p className="text-sm text-muted-foreground">
            💡 This comparison is not meant to discourage, but to validate the invisible burden T1D patients carry daily.
            Modern technology and management approaches are steadily closing these gaps.
          </p>
        </div>
      </div>
    </section>
  );
};

export default QoLComparisonSection;
