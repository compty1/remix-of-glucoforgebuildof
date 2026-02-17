import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Target, Users, Cpu, ArrowUpRight, ArrowDownRight, Minus, Award, AlertTriangle, CheckCircle2, BarChart3, Clock } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Cell,
} from 'recharts';
import { useGlucoseComparison, type ComparisonMetric } from '@/hooks/useGlucoseComparison';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function DeltaBadge({ metric }: { metric: ComparisonMetric }) {
  const absDelta = Math.abs(metric.delta);
  if (absDelta < 0.5) return <Badge variant="outline" className="gap-1"><Minus className="h-3 w-3" /> On par</Badge>;
  if (metric.isUserBetter) return <Badge className="gap-1 bg-success/10 text-success dark:bg-success/20"><ArrowUpRight className="h-3 w-3" /> +{absDelta}{metric.unit} ahead</Badge>;
  return <Badge variant="destructive" className="gap-1"><ArrowDownRight className="h-3 w-3" /> {absDelta}{metric.unit} behind</Badge>;
}

interface PeerComparisonPanelProps {
  compact?: boolean;
}

export function PeerComparisonPanel({ compact = false }: PeerComparisonPanelProps) {
  const { comparison, isLoading, hasUserData, benchmarks } = useGlucoseComparison();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-40 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasUserData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Upload Your Data to Compare</h3>
          <p className="text-sm text-muted-foreground">
            Upload your CGM data in the Data Upload section to see how you compare against users with excellent glucose control.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!comparison) return null;

  if (compact) {
    const tirMetric = comparison.metrics.find(m => m.label === 'Time in Range');
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Peer Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Your TIR</span>
            <span className="text-lg font-bold">{tirMetric?.userValue || 0}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Top Performers</span>
            <span className="text-lg font-bold text-primary">{tirMetric?.benchmarkValue || 0}%</span>
          </div>
          {tirMetric && <DeltaBadge metric={tirMetric} />}
          <div className="text-xs text-muted-foreground">
            You're in the <span className="font-semibold text-foreground">{comparison.percentile}th</span> percentile
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 text-center">
              <div className="text-5xl font-bold text-primary">{comparison.percentile}th</div>
              <div className="text-sm text-muted-foreground mt-1">Percentile</div>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
              {comparison.metrics.filter(m => m.category === 'Core').map(metric => (
                <div key={metric.label} className="text-center">
                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="font-semibold">{metric.userValue}{metric.unit}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-semibold text-primary">{metric.benchmarkValue}{metric.unit}</span>
                  </div>
                  <DeltaBadge metric={metric} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1"><BarChart3 className="h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="time-of-day" className="gap-1"><Clock className="h-4 w-4" />Time of Day</TabsTrigger>
          <TabsTrigger value="strategies" className="gap-1"><Cpu className="h-4 w-4" />Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Profile</CardTitle>
                <CardDescription>Your metrics vs top performers (higher = better)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={comparison.radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="You" dataKey="user" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
                    <Radar name="Top Performers" dataKey="topPerformers" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Metrics Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detailed Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparison.metrics.map(metric => (
                    <div key={metric.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{metric.label}</div>
                        <div className="text-xs text-muted-foreground">{metric.category}</div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right w-16">
                          <div className="font-semibold">{metric.userValue}{metric.unit}</div>
                          <div className="text-xs text-muted-foreground">You</div>
                        </div>
                        <div className="text-right w-16">
                          <div className="font-semibold text-primary">{metric.benchmarkValue}{metric.unit}</div>
                          <div className="text-xs text-muted-foreground">Top</div>
                        </div>
                        <div className="w-28"><DeltaBadge metric={metric} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-success/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" /> Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comparison.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {comparison.strengths.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <Award className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Keep working on your metrics to identify strengths.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-warning/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" /> Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comparison.improvements.length > 0 ? (
                  <ul className="space-y-2">
                    {comparison.improvements.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <Target className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Excellent! You're matching or exceeding top performers across all metrics.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time-of-day" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Time in Range by Time of Day</CardTitle>
              <CardDescription>See when your control differs most from top performers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparison.timeOfDayComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(val: number) => `${val}%`} />
                  <Legend />
                  <Bar dataKey="userTIR" name="Your TIR" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="benchTIR" name="Top Performers TIR" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average Glucose by Time of Day</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparison.timeOfDayComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit=" mg/dL" />
                  <Tooltip formatter={(val: number) => `${val} mg/dL`} />
                  <Legend />
                  <Bar dataKey="userAvg" name="Your Avg" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="benchAvg" name="Top Performers Avg" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Pumps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="h-5 w-5" /> Pumps Used by Top Performers
                </CardTitle>
                <CardDescription>Most common insulin delivery among users with excellent control</CardDescription>
              </CardHeader>
              <CardContent>
                {comparison.benchmarks?.topPumps && comparison.benchmarks.topPumps.length > 0 ? (
                  <div className="space-y-3">
                    {comparison.benchmarks.topPumps.map((pump, i) => (
                      <div key={pump.name} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">#{i + 1}</Badge>
                          <span className="font-medium text-sm">{pump.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{pump.tir}% TIR</div>
                          <div className="text-xs text-muted-foreground">{pump.count.toLocaleString()} readings</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No pump data available.</p>
                )}
              </CardContent>
            </Card>

            {/* Top CGMs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="h-5 w-5" /> CGMs Used by Top Performers
                </CardTitle>
                <CardDescription>Most common glucose monitors among users with excellent control</CardDescription>
              </CardHeader>
              <CardContent>
                {comparison.benchmarks?.topCGMs && comparison.benchmarks.topCGMs.length > 0 ? (
                  <div className="space-y-3">
                    {comparison.benchmarks.topCGMs.map((cgm, i) => (
                      <div key={cgm.name} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">#{i + 1}</Badge>
                          <span className="font-medium text-sm">{cgm.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{cgm.tir}% TIR</div>
                          <div className="text-xs text-muted-foreground">{cgm.count.toLocaleString()} readings</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No CGM data available.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Age Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance by Age Group (Top Performers)</CardTitle>
            </CardHeader>
            <CardContent>
              {comparison.benchmarks?.ageBreakdown && comparison.benchmarks.ageBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparison.benchmarks.ageBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip formatter={(val: number) => `${val}%`} />
                    <Bar dataKey="tir" name="TIR" radius={[4, 4, 0, 0]}>
                      {comparison.benchmarks.ageBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No age breakdown data available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
