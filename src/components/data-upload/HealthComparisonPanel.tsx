import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Activity, Brain, Droplets, Eye, Shield, 
  Pill, Leaf, Zap, Moon, Footprints, GlassWater
} from 'lucide-react';

interface DetailedAnalysis {
  avgGlucose?: number;
  cv?: number;
  timeInRange?: number;
  timeAbove180?: number;
  timeBelow70?: number;
  gmi?: number;
  stdDev?: number;
  mage?: number;
}

interface HealthComparisonPanelProps {
  detailedAnalysis?: DetailedAnalysis;
}

const HealthComparisonPanel: React.FC<HealthComparisonPanelProps> = ({ detailedAnalysis }) => {
  const userTIR = detailedAnalysis?.timeInRange ?? 0;
  const userAvg = detailedAnalysis?.avgGlucose ?? 0;
  const userCV = detailedAnalysis?.cv ?? 0;
  const userGMI = detailedAnalysis?.gmi ?? 0;
  const userTimeHigh = detailedAnalysis?.timeAbove180 ?? 0;
  const userTimeLow = detailedAnalysis?.timeBelow70 ?? 0;

  const getGapColor = (userVal: number, idealMin: number, idealMax: number, lowerIsBetter = false) => {
    if (lowerIsBetter) {
      if (userVal <= idealMax) return 'text-success';
      if (userVal <= idealMax * 1.5) return 'text-warning';
      return 'text-destructive';
    }
    if (userVal >= idealMin) return 'text-success';
    if (userVal >= idealMin * 0.7) return 'text-warning';
    return 'text-destructive';
  };

  // Use ADA T1D-appropriate targets (NOT non-diabetic benchmarks)
  const metrics = [
    { label: 'Time in Range (70-180)', user: `${userTIR.toFixed(1)}%`, healthy: '≥70% (T1D target)', gap: userTIR >= 70 ? 'On target ✓' : `${(70 - userTIR).toFixed(1)}% below target`, color: getGapColor(userTIR, 70, 100), source: 'ADA Standards of Care 2024 (T1D)' },
    { label: 'Average Glucose', user: `${userAvg.toFixed(0)} mg/dL`, healthy: '100-154 mg/dL', gap: userAvg > 154 ? `+${(userAvg - 154).toFixed(0)} mg/dL` : 'On target', color: getGapColor(100, userAvg, 154), source: 'ADA/ATTD Consensus 2019' },
    { label: 'Coefficient of Variation', user: `${userCV.toFixed(1)}%`, healthy: '<36% (T1D target)', gap: userCV > 36 ? `+${(userCV - 36).toFixed(1)}%` : 'On target', color: getGapColor(userCV, 0, 36, true), source: 'ATTD Consensus 2019' },
    { label: 'GMI (Estimated A1C)', user: `${userGMI.toFixed(1)}%`, healthy: '<7% (ADA T1D goal)', gap: userGMI > 7 ? `+${(userGMI - 7).toFixed(1)}%` : 'On target', color: getGapColor(userGMI, 0, 7, true), source: 'ADA Standards of Care 2024' },
    { label: 'Time Above 180', user: `${userTimeHigh.toFixed(1)}%`, healthy: '<25% (T1D target)', gap: userTimeHigh > 25 ? `+${(userTimeHigh - 25).toFixed(1)}%` : 'On target', color: getGapColor(userTimeHigh, 0, 25, true), source: 'ADA Standards of Care 2024' },
    { label: 'Time Below 70', user: `${userTimeLow.toFixed(1)}%`, healthy: '<4% (T1D target)', gap: userTimeLow > 4 ? `+${(userTimeLow - 4).toFixed(1)}%` : 'On target', color: getGapColor(userTimeLow, 0, 4, true), source: 'ADA Standards of Care 2024' },
  ];

  const healthImpacts = [
    { icon: Heart, title: 'Cardiovascular Risk', t1d: '2-4x higher risk of heart disease', healthy: 'Baseline risk', detail: 'Glucose variability causes endothelial dysfunction and accelerated atherosclerosis. Each 1% increase in A1C raises CV risk by 11%.', source: 'ADA Standards of Care 2024; DCCT/EDIC Study', severity: userGMI > 7 ? 'high' : userGMI > 6.5 ? 'moderate' : 'low' },
    { icon: Shield, title: 'Kidney Function', t1d: '40% develop some nephropathy', healthy: '<5% develop kidney issues', detail: 'Chronic hyperglycemia damages glomerular filtration. Tight control (A1C <7%) reduces nephropathy risk by 54%.', source: 'DCCT/EDIC, N Engl J Med 2011', severity: userGMI > 7.5 ? 'high' : 'moderate' },
    { icon: Zap, title: 'Neuropathy Risk', t1d: '50% develop neuropathy over lifetime', healthy: '<1% prevalence', detail: 'Prolonged hyperglycemia causes nerve damage. CV >36% is associated with higher neuropathy risk. Post-meal spikes are a key driver.', source: 'Pop-Busui et al., Diabetes Care 2017', severity: userCV > 36 ? 'high' : 'moderate' },
    { icon: Eye, title: 'Eye Health (Retinopathy)', t1d: '80% show changes after 15+ years', healthy: 'No diabetes-related risk', detail: 'Glucose fluctuations damage retinal blood vessels. Annual screening essential. Each 1% A1C reduction lowers retinopathy risk by 35%.', source: 'DCCT, Diabetes 1995', severity: userGMI > 7 ? 'high' : 'moderate' },
    { icon: Moon, title: 'Sleep Quality', t1d: '45% report disrupted sleep', healthy: '15% general population', detail: 'Nocturnal hypoglycemia, CGM alarms, and worry about overnight levels fragment sleep. Poor sleep worsens insulin resistance by up to 25%.', source: 'Reutrakul & Van Cauter, Diabetes Care 2018', severity: userTimeLow > 4 ? 'high' : 'moderate' },
  ];

  const mentalHealthImpacts = [
    { title: 'Daily Decision Load', t1d: '180-300 diabetes-related decisions/day', healthy: '~35 health decisions/day', detail: 'Every meal, activity, and fluctuation requires a decision. This adds 150-265 extra health decisions daily that non-diabetics never face.' },
    { title: 'Diabetes Distress', t1d: '25-45% prevalence', healthy: '0%', detail: 'Feeling overwhelmed by the constant demands of diabetes management. Different from depression—specific to diabetes burden.' },
    { title: 'Depression Risk', t1d: '2-3x higher rates', healthy: 'Baseline (7-8%)', detail: 'Chronic disease burden, glucose variability, and the relentless nature of T1D management significantly increase depression risk.' },
    { title: 'Anxiety', t1d: '20% prevalence', healthy: '7% general population', detail: 'Fear of hypoglycemia, complications worry, and social stigma drive anxiety. Nocturnal hypo anxiety particularly impacts sleep.' },
    { title: 'Chronic Stress Hormones', t1d: 'Elevated cortisol from vigilance', healthy: 'Normal circadian pattern', detail: 'Constant glucose monitoring and fear of dangerous lows keeps the stress response activated, raising cortisol and further destabilizing glucose.' },
  ];

  const supplements = [
    { name: 'Vitamin D3', dosage: '2,000-4,000 IU/day', reason: 'Improves insulin sensitivity and immune regulation. T1D patients have 70-80% prevalence of deficiency.', evidence: 'Strong', personalNote: userGMI > 7 ? 'May help improve your insulin sensitivity given elevated GMI' : 'Supports immune regulation', source: 'Diabetes Care 2023; Hyppönen et al.' },
    { name: 'Magnesium Glycinate', dosage: '200-400mg/day', reason: 'Essential for glucose metabolism and insulin signaling. Depleted by urinary losses in T1D.', evidence: 'Strong', personalNote: userCV > 30 ? 'May help reduce glucose variability' : 'Supports stable glucose levels', source: 'Diabetes Metab Res Rev 2015' },
    { name: 'Omega-3 (EPA/DHA)', dosage: '1,000-2,000mg/day', reason: 'Reduces cardiovascular risk and systemic inflammation. T1D patients face 2-4x CV risk.', evidence: 'Strong', personalNote: userTimeHigh > 25 ? 'Important given your elevated time above range—CV protection needed' : 'Ongoing cardiovascular protection', source: 'AHA Scientific Statement 2019' },
    { name: 'Alpha-Lipoic Acid', dosage: '300-600mg/day', reason: 'Powerful antioxidant that reduces oxidative stress from glucose fluctuations. Shown to improve neuropathy symptoms.', evidence: 'Moderate', personalNote: userCV > 36 ? 'Your high glucose variability increases oxidative stress—ALA is particularly relevant' : 'Neuroprotective benefits', source: 'Ziegler et al., Diabetes Care 2006' },
    { name: 'Chromium Picolinate', dosage: '200-1,000mcg/day', reason: 'Enhances insulin receptor activity and may improve glucose uptake. Often depleted in T1D.', evidence: 'Moderate', personalNote: 'May support insulin sensitivity', source: 'Diabetes Technol Ther 2006' },
    { name: 'B-Complex (B1, B6, B12)', dosage: 'Standard B-complex daily', reason: 'Neuroprotective. B12 especially important if taking metformin. Benfotiamine (B1 derivative) may prevent complications.', evidence: 'Moderate', personalNote: 'Neuroprotection is essential for all T1D patients', source: 'Stracke et al., Exp Clin Endocrinol Diabetes 2001' },
  ];

  const lifestylePlans = [
    { icon: GlassWater, title: 'Hydration Target', plan: 'Aim for 3-4 liters/day', detail: 'Hyperglycemia causes osmotic diuresis, increasing fluid loss. Dehydration concentrates blood glucose, worsening readings. Adequate water intake supports kidney function and glucose dilution.', t1dReason: 'T1D patients lose more water through elevated glucose filtration' },
    { icon: Footprints, title: 'Post-Meal Walking', plan: '10-15 minute walk after each meal', detail: 'Walking within 30 minutes of eating reduces post-meal glucose spikes by 30-50%. Muscle contractions increase glucose uptake independent of insulin (GLUT4 translocation).', t1dReason: 'Reduces insulin demand and post-meal spike severity' },
    { icon: Moon, title: 'Sleep Optimization', plan: '7-9 hours with consistent schedule', detail: 'Sleep deprivation increases insulin resistance by 25-30%. Set CGM alerts to urgent-only overnight. Consider sleep mode features on your pump.', t1dReason: 'Poor sleep directly worsens next-day glucose control' },
    { icon: Brain, title: 'Stress Management', plan: '10-15 min daily mindfulness/breathing', detail: 'Stress raises cortisol, which triggers gluconeogenesis and raises blood glucose. Regular stress reduction can lower A1C by 0.3-0.5%.', t1dReason: 'Cortisol directly opposes insulin action in T1D' },
    { icon: Activity, title: 'Exercise Strategy', plan: 'Resistance training 3x/week + daily movement', detail: 'Resistance training before cardio stabilizes glucose better. Exercise increases insulin sensitivity for 24-48 hours. Start with lower intensity to learn glucose responses.', t1dReason: 'Builds muscle glucose storage capacity, reducing overall levels' },
    { icon: Leaf, title: 'Anti-Inflammatory Diet Focus', plan: 'Increase omega-3s, reduce processed foods', detail: 'Chronic inflammation from glucose variability accelerates complications. Anti-inflammatory foods (fatty fish, berries, leafy greens, turmeric) reduce systemic inflammation.', t1dReason: 'T1D is an autoimmune condition—inflammation management is critical' },
  ];

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 border-destructive/20 text-destructive';
      case 'moderate': return 'bg-warning/10 border-warning/20 text-warning';
      case 'low': return 'bg-success/10 border-success/20 text-success';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-8">
      {/* Glucose Metrics Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Your Glucose vs. ADA T1D Targets
          </CardTitle>
          <p className="text-sm text-muted-foreground">Comparison against ADA-recommended targets for T1D management — not non-diabetic benchmarks</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Metric</th>
                  <th className="text-center py-2 font-medium">Your Value</th>
                  <th className="text-center py-2 font-medium">Healthy Range</th>
                  <th className="text-center py-2 font-medium">Gap</th>
                  <th className="text-right py-2 font-medium text-xs text-muted-foreground">Source</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 font-medium">{m.label}</td>
                    <td className="py-3 text-center font-mono">{m.user}</td>
                    <td className="py-3 text-center text-muted-foreground">{m.healthy}</td>
                    <td className={`py-3 text-center font-semibold ${m.color}`}>{m.gap}</td>
                    <td className="py-3 text-right text-xs text-muted-foreground max-w-32 truncate">{m.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Physical Health Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Physical Health Impact: T1D vs. Healthy Person
          </CardTitle>
          <p className="text-sm text-muted-foreground">How glucose variability affects long-term health compared to someone without diabetes</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {healthImpacts.map((impact, i) => (
            <div key={i} className={`p-4 rounded-lg border ${severityColor(impact.severity)}`}>
              <div className="flex items-start gap-3">
                <impact.icon className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{impact.title}</h4>
                    <Badge variant="outline" className="text-xs capitalize">{impact.severity} risk</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <div className="text-sm"><span className="font-medium">T1D:</span> {impact.t1d}</div>
                    <div className="text-sm text-muted-foreground"><span className="font-medium">Healthy:</span> {impact.healthy}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">{impact.detail}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">📚 {impact.source}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Mental Health Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-highlight" />
            Mental Health Impact: The Invisible Burden
          </CardTitle>
          <p className="text-sm text-muted-foreground">The psychological toll of managing T1D 24/7/365</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {mentalHealthImpacts.map((impact, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-semibold mb-1">{impact.title}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 text-sm">
                <div><span className="font-medium text-highlight">T1D:</span> {impact.t1d}</div>
                <div className="text-muted-foreground"><span className="font-medium">Healthy:</span> {impact.healthy}</div>
              </div>
              <p className="text-sm text-muted-foreground">{impact.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Personalized Supplement Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Personalized Supplement Recommendations
          </CardTitle>
          <p className="text-sm text-muted-foreground">Based on your glucose data and T1D-specific research. Always consult your healthcare provider before starting supplements.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {supplements.map((supp, i) => (
            <div key={i} className="p-4 rounded-lg border bg-primary/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{supp.name}</h4>
                    <Badge variant="outline" className={supp.evidence === 'Strong' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
                      {supp.evidence} evidence
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-primary mb-1">Dosage: {supp.dosage}</p>
                  <p className="text-sm text-muted-foreground mb-2">{supp.reason}</p>
                  <div className="bg-accent/30 rounded p-2 text-sm">
                    <span className="font-medium">For you:</span> {supp.personalNote}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 italic">📚 {supp.source}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm text-warning">
            ⚠️ These recommendations are informational only. Always discuss with your endocrinologist before starting any supplement, as some may interact with insulin or other medications.
          </div>
        </CardContent>
      </Card>

      {/* Actionable Lifestyle Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-success" />
            Actionable Lifestyle Plans
          </CardTitle>
          <p className="text-sm text-muted-foreground">Evidence-based lifestyle changes with specific T1D reasoning</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lifestylePlans.map((plan, i) => (
            <div key={i} className="p-4 rounded-lg border bg-success/5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <plan.icon className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold">{plan.title}</h4>
                  <p className="text-sm font-medium text-success mb-1">{plan.plan}</p>
                  <p className="text-sm text-muted-foreground mb-2">{plan.detail}</p>
                  <p className="text-xs text-primary italic">💡 T1D-specific: {plan.t1dReason}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthComparisonPanel;
