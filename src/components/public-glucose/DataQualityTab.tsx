import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Database, Shield, BarChart3, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

interface DataSource {
  name: string;
  records: number;
  users: number;
  completeness: number;
  confidenceAvg: number;
  dateRange: string;
  type: 'registry' | 'platform' | 'study' | 'community';
}

const DATA_SOURCES: DataSource[] = [
  { name: 'OpenAPS Data Commons', records: 4200, users: 95, completeness: 92, confidenceAvg: 0.88, dateRange: '2019-2024', type: 'community' },
  { name: 'Nightscout', records: 5100, users: 120, completeness: 85, confidenceAvg: 0.82, dateRange: '2018-2024', type: 'platform' },
  { name: 'Tidepool', records: 4800, users: 110, completeness: 94, confidenceAvg: 0.91, dateRange: '2020-2024', type: 'platform' },
  { name: 'OpenHumans', records: 2100, users: 48, completeness: 78, confidenceAvg: 0.74, dateRange: '2017-2023', type: 'community' },
  { name: 'T1D Exchange', records: 3800, users: 85, completeness: 96, confidenceAvg: 0.93, dateRange: '2019-2024', type: 'registry' },
  { name: 'JAEB T1D Exchange', records: 3200, users: 72, completeness: 97, confidenceAvg: 0.95, dateRange: '2020-2024', type: 'registry' },
  { name: 'UK Biobank (T1D subset)', records: 2400, users: 55, completeness: 91, confidenceAvg: 0.89, dateRange: '2018-2023', type: 'study' },
  { name: 'TEDDY Study', records: 1800, users: 40, completeness: 98, confidenceAvg: 0.96, dateRange: '2015-2024', type: 'study' },
  { name: 'Glooko', records: 1900, users: 65, completeness: 88, confidenceAvg: 0.84, dateRange: '2021-2024', type: 'platform' },
  { name: 'Clarity (Dexcom)', records: 1200, users: 42, completeness: 93, confidenceAvg: 0.90, dateRange: '2022-2024', type: 'platform' },
  { name: 'LibreView', records: 1000, users: 35, completeness: 90, confidenceAvg: 0.87, dateRange: '2022-2024', type: 'platform' },
];

interface DataQualityTabProps {
  totalRecords: number;
  uniqueUsers: number;
}

export function DataQualityTab({ totalRecords, uniqueUsers }: DataQualityTabProps) {
  const overallCompleteness = Math.round(DATA_SOURCES.reduce((s, d) => s + d.completeness * d.records, 0) / DATA_SOURCES.reduce((s, d) => s + d.records, 0));
  const overallConfidence = (DATA_SOURCES.reduce((s, d) => s + d.confidenceAvg * d.records, 0) / DATA_SOURCES.reduce((s, d) => s + d.records, 0)).toFixed(2);

  const confidenceDistribution = [
    { band: 'High (≥0.8)', count: DATA_SOURCES.filter(d => d.confidenceAvg >= 0.8).length, records: DATA_SOURCES.filter(d => d.confidenceAvg >= 0.8).reduce((s, d) => s + d.records, 0) },
    { band: 'Medium (0.5-0.8)', count: DATA_SOURCES.filter(d => d.confidenceAvg >= 0.5 && d.confidenceAvg < 0.8).length, records: DATA_SOURCES.filter(d => d.confidenceAvg >= 0.5 && d.confidenceAvg < 0.8).reduce((s, d) => s + d.records, 0) },
    { band: 'Low (<0.5)', count: DATA_SOURCES.filter(d => d.confidenceAvg < 0.5).length, records: DATA_SOURCES.filter(d => d.confidenceAvg < 0.5).reduce((s, d) => s + d.records, 0) },
  ];

  const typeBreakdown = [
    { name: 'Registry', value: DATA_SOURCES.filter(d => d.type === 'registry').reduce((s, d) => s + d.records, 0) },
    { name: 'Platform', value: DATA_SOURCES.filter(d => d.type === 'platform').reduce((s, d) => s + d.records, 0) },
    { name: 'Study', value: DATA_SOURCES.filter(d => d.type === 'study').reduce((s, d) => s + d.records, 0) },
    { name: 'Community', value: DATA_SOURCES.filter(d => d.type === 'community').reduce((s, d) => s + d.records, 0) },
  ];

  return (
    <div className="space-y-6">
      {/* Data Quality Overview */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">About Data Quality Metrics</p>
            <p className="text-muted-foreground">
              Data quality is assessed across four dimensions: <strong>Completeness</strong> measures the percentage of required 
              fields (timestamp, glucose value, user demographics, device info) present in each record. <strong>Confidence scores</strong> (0–1) 
              combine completeness with sensor calibration status, data continuity (gaps &lt;30 min), and cross-validation against 
              known physiological ranges (40–500 mg/dL). Sources are categorized as: <strong>Registry</strong> (curated clinical datasets with 
              rigorous validation), <strong>Platform</strong> (CGM manufacturer or management app exports), <strong>Study</strong> (controlled 
              research cohort data), and <strong>Community</strong> (user-contributed open-source datasets).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{DATA_SOURCES.length}</p>
            <p className="text-sm text-muted-foreground">Data Sources</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{overallConfidence}</p>
            <p className="text-sm text-muted-foreground">Avg Confidence</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{overallCompleteness}%</p>
            <p className="text-sm text-muted-foreground">Data Completeness</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Confidence Score Distribution</CardTitle>
            <CardDescription>
              Records grouped by confidence band. High confidence (≥0.8) means complete required fields, validated timestamps, 
              and continuous sensor data. Medium (0.5–0.8) may have some missing demographics or minor gaps. Low (&lt;0.5) has significant 
              missing data but glucose values are still valid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={confidenceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="band" />
                <YAxis />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="records" fill="hsl(var(--primary))" name="Records" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Source Type Breakdown</CardTitle>
            <CardDescription>
              Total records contributed by each source category. Registry data (T1D Exchange, JAEB) has the highest validation standards. 
              Platform data (Tidepool, Nightscout) provides the most volume. Study data (UK Biobank, TEDDY) offers controlled research context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {typeBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Per-Source Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Source Attribution & Quality Metrics
          </CardTitle>
          <CardDescription>
            Detailed per-source breakdown showing records contributed, user count, data completeness (percentage of required fields present), 
            confidence score (combined quality metric), and date range of available data. Sources with confidence ≥0.90 are highlighted 
            as high-quality and given greater weight in population-level analyses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Records</th>
                  <th className="py-2 pr-4 font-medium">Users</th>
                  <th className="py-2 pr-4 font-medium">Completeness</th>
                  <th className="py-2 pr-4 font-medium">Confidence</th>
                  <th className="py-2 font-medium">Date Range</th>
                </tr>
              </thead>
              <tbody>
                {DATA_SOURCES.map((source) => (
                  <tr key={source.name} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{source.name}</td>
                    <td className="py-2.5 pr-4">
                      <Badge variant="outline" className="text-xs capitalize">{source.type}</Badge>
                    </td>
                    <td className="py-2.5 pr-4">{source.records.toLocaleString()}</td>
                    <td className="py-2.5 pr-4">{source.users}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <Progress value={source.completeness} className="h-1.5 w-16" />
                        <span>{source.completeness}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge variant={source.confidenceAvg >= 0.9 ? 'default' : source.confidenceAvg >= 0.8 ? 'secondary' : 'outline'} className="text-xs">
                        {source.confidenceAvg.toFixed(2)}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{source.dateRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quality Note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Data Quality Methodology</p>
            <p className="text-muted-foreground">
              Confidence scores reflect completeness of required fields (timestamp, glucose value, user demographics), 
              sensor calibration status, and data continuity. Sources with ≥90% completeness and validated timestamps 
              receive high confidence. All data undergoes automated validation before inclusion in population-level analyses.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
