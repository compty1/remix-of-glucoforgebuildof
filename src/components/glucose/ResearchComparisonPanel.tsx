import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, ExternalLink, TrendingUp, TrendingDown, Minus,
  Award, Target, Users, BarChart3
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ComparisonBenchmark {
  source: string;
  metric: string;
  benchmarkValue: number;
  unit: string;
  dataValue: number;
  description: string;
  doi?: string;
  year: number;
}

interface ResearchComparisonPanelProps {
  tir?: number;
  cv?: number;
  avgGlucose?: number;
  timeBelow70?: number;
  timeAbove180?: number;
}

const ResearchComparisonPanel: React.FC<ResearchComparisonPanelProps> = ({
  tir = 0,
  cv = 0,
  avgGlucose = 0,
  timeBelow70 = 0,
  timeAbove180 = 0
}) => {
  const benchmarks: ComparisonBenchmark[] = [
    {
      source: 'T1D Exchange Registry',
      metric: 'Time in Range (70-180)',
      benchmarkValue: 51,
      unit: '%',
      dataValue: tir,
      description: 'Average TIR across 22,000+ T1D participants in the US registry (2023 data)',
      doi: '10.2337/dc22-1742',
      year: 2023
    },
    {
      source: 'JDRF CREATE Trial',
      metric: 'Time in Range with AID',
      benchmarkValue: 71,
      unit: '%',
      dataValue: tir,
      description: 'TIR achieved by participants using hybrid closed-loop systems',
      doi: '10.2337/dc21-0953',
      year: 2022
    },
    {
      source: 'International Consensus',
      metric: 'Target TIR',
      benchmarkValue: 70,
      unit: '%',
      dataValue: tir,
      description: 'Recommended minimum TIR for adults with T1D (ATTD Consensus)',
      doi: '10.1089/dia.2019.0028',
      year: 2019
    },
    {
      source: 'Diabetes Care Meta-Analysis',
      metric: 'Average CV in CGM Users',
      benchmarkValue: 36,
      unit: '%',
      dataValue: cv,
      description: 'Population average coefficient of variation across CGM studies',
      doi: '10.2337/dc19-1009',
      year: 2019
    },
    {
      source: 'ADA Standards 2024',
      metric: 'Target Time Below 70',
      benchmarkValue: 4,
      unit: '%',
      dataValue: timeBelow70,
      description: 'Maximum recommended time in hypoglycemia range',
      doi: '10.2337/dc24-S006',
      year: 2024
    },
    {
      source: 'ATTD Consensus',
      metric: 'Target Time Above 180',
      benchmarkValue: 25,
      unit: '%',
      dataValue: timeAbove180,
      description: 'Maximum recommended time in hyperglycemia range',
      doi: '10.1089/dia.2019.0028',
      year: 2019
    }
  ];

  const getComparison = (benchmark: ComparisonBenchmark) => {
    const diff = benchmark.dataValue - benchmark.benchmarkValue;
    const isLowerBetter = benchmark.metric.includes('Below') || benchmark.metric.includes('Above') || benchmark.metric.includes('CV');
    
    if (isLowerBetter) {
      if (diff <= -5) return { status: 'better', icon: <TrendingDown className="h-4 w-4 text-success" />, text: 'Better than benchmark' };
      if (diff >= 5) return { status: 'worse', icon: <TrendingUp className="h-4 w-4 text-destructive" />, text: 'Above benchmark' };
      return { status: 'similar', icon: <Minus className="h-4 w-4 text-muted-foreground" />, text: 'Similar to benchmark' };
    } else {
      if (diff >= 5) return { status: 'better', icon: <TrendingUp className="h-4 w-4 text-success" />, text: 'Better than benchmark' };
      if (diff <= -5) return { status: 'worse', icon: <TrendingDown className="h-4 w-4 text-destructive" />, text: 'Below benchmark' };
      return { status: 'similar', icon: <Minus className="h-4 w-4 text-muted-foreground" />, text: 'Similar to benchmark' };
    }
  };

  // Population percentile estimation
  const getPercentile = (value: number, metric: string): number => {
    // Simplified percentile estimates based on T1D Exchange data
    if (metric.includes('Time in Range')) {
      if (value >= 80) return 95;
      if (value >= 70) return 75;
      if (value >= 60) return 55;
      if (value >= 50) return 35;
      return 15;
    }
    if (metric.includes('CV')) {
      if (value < 30) return 90;
      if (value < 36) return 70;
      if (value < 42) return 50;
      return 25;
    }
    return 50;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Research Benchmarks & Comparisons
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare this data against published research and population averages from clinical trials.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Percentile Overview */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Population Percentile Estimate</h4>
                <p className="text-sm text-muted-foreground">Based on T1D Exchange Registry 2023 data</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Time in Range</span>
                  <span className="text-sm font-medium">{getPercentile(tir, 'Time in Range')}th percentile</span>
                </div>
                <Progress value={getPercentile(tir, 'Time in Range')} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Glucose Variability</span>
                  <span className="text-sm font-medium">{getPercentile(cv, 'CV')}th percentile</span>
                </div>
                <Progress value={getPercentile(cv, 'CV')} className="h-2" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Higher percentile = better control compared to the T1D population
            </p>
          </CardContent>
        </Card>

        {/* Benchmark Comparisons */}
        <div className="space-y-3">
          {benchmarks.map((benchmark, index) => {
            const comparison = getComparison(benchmark);
            return (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{benchmark.metric}</h4>
                        <Badge variant="outline" className="text-xs">
                          {benchmark.source} ({benchmark.year})
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{benchmark.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {comparison.icon}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Benchmark: {benchmark.benchmarkValue}{benchmark.unit}</span>
                        <span className="font-medium">This Data: {benchmark.dataValue.toFixed(1)}{benchmark.unit}</span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full bg-muted-foreground/30 rounded-full"
                          style={{ width: `${Math.min(100, benchmark.benchmarkValue)}%` }}
                        />
                        <div 
                          className={`absolute h-full rounded-full ${
                            comparison.status === 'better' ? 'bg-success' : 
                            comparison.status === 'worse' ? 'bg-destructive' : 
                            'bg-primary'
                          }`}
                          style={{ width: `${Math.min(100, benchmark.dataValue)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${
                      comparison.status === 'better' ? 'text-success' :
                      comparison.status === 'worse' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}>
                      {comparison.text}
                    </span>
                    {benchmark.doi && (
                      <a 
                        href={`https://doi.org/${benchmark.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        DOI: {benchmark.doi}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Research Context */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Understanding These Benchmarks
            </h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>T1D Exchange Registry:</strong> The largest real-world T1D database with 22,000+ participants. 
                Reflects actual outcomes in diverse populations.
              </p>
              <p>
                <strong>ATTD/ADA Consensus:</strong> Expert panel recommendations based on evidence linking 
                glycemic metrics to long-term outcomes and quality of life.
              </p>
              <p>
                <strong>Clinical Trials:</strong> Controlled studies often show better outcomes than real-world 
                data due to intensive support and monitoring.
              </p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default ResearchComparisonPanel;
