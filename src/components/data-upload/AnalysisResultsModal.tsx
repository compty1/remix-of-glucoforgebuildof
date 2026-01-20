import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3,
  Activity,
  TrendingUp,
  Lightbulb,
  Target,
  Download
} from 'lucide-react';

import GlucoseMetricsGrid from './GlucoseMetricsGrid';
import GlucoseAGPChart from './GlucoseAGPChart';
import TimeInRangeChart from './TimeInRangeChart';
import GlucoseTrendChart from './GlucoseTrendChart';
import GlucoseHeatmap from './GlucoseHeatmap';
import PatternCard from './PatternCard';
import RecommendationCard from './RecommendationCard';

interface DetailedAnalysis {
  readingsCount?: number;
  avgGlucose?: number;
  medianGlucose?: number;
  stdDev?: number;
  cv?: number;
  timeInRange?: number;
  timeInTightRange?: number;
  timeAbove180?: number;
  timeAbove250?: number;
  timeBelow70?: number;
  timeBelow54?: number;
  gmi?: number;
  gvi?: number;
  mage?: number;
  lowEvents?: number;
  severeLowEvents?: number;
  highEvents?: number;
  severeHighEvents?: number;
  dataStart?: string;
  dataEnd?: string;
  daysOfData?: number;
}

interface Pattern {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timeOfDay?: string;
  frequency?: number;
  avgImpact?: number;
}

interface HourlyStats {
  hour: number;
  avg: number;
  min: number;
  max: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  count: number;
}

interface DailyStats {
  date: string;
  avg: number;
  min: number;
  max: number;
  tir: number;
  readings: number;
  lowEvents: number;
  highEvents: number;
}

interface AGPDataPoint {
  time: string;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

interface AnalysisResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  insights: string[];
  readingsCount: number;
  detailedAnalysis?: DetailedAnalysis;
  hourlyData?: HourlyStats[];
  dailyData?: DailyStats[];
  agpData?: AGPDataPoint[];
  patterns?: Pattern[];
  recommendations?: string[];
}

const AnalysisResultsModal: React.FC<AnalysisResultsModalProps> = ({
  open,
  onOpenChange,
  fileName,
  insights,
  readingsCount,
  detailedAnalysis,
  hourlyData,
  dailyData,
  agpData,
  patterns,
  recommendations,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const hasDetailedData = detailedAnalysis && (detailedAnalysis.readingsCount ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Glucose Analysis Results
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{fileName}</span>
            <Badge variant="outline">{readingsCount.toLocaleString()} readings</Badge>
            {hasDetailedData && detailedAnalysis.daysOfData && (
              <Badge variant="secondary">{detailedAnalysis.daysOfData} days</Badge>
            )}
          </div>
        </DialogHeader>

        {hasDetailedData ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="px-6 border-b">
              <TabsList className="h-10">
                <TabsTrigger value="overview" className="gap-1.5">
                  <Target className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="agp" className="gap-1.5">
                  <Activity className="h-4 w-4" />
                  AGP Chart
                </TabsTrigger>
                <TabsTrigger value="trends" className="gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="insights" className="gap-1.5">
                  <Lightbulb className="h-4 w-4" />
                  Insights
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 max-h-[calc(90vh-140px)]">
              <div className="p-6">
                <TabsContent value="overview" className="mt-0 space-y-6">
                  <GlucoseMetricsGrid analysis={detailedAnalysis} />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TimeInRangeChart
                      timeInRange={detailedAnalysis.timeInRange ?? 0}
                      timeAbove180={detailedAnalysis.timeAbove180 ?? 0}
                      timeAbove250={detailedAnalysis.timeAbove250 ?? 0}
                      timeBelow70={detailedAnalysis.timeBelow70 ?? 0}
                      timeBelow54={detailedAnalysis.timeBelow54 ?? 0}
                    />
                    {hourlyData && hourlyData.length > 0 && (
                      <GlucoseHeatmap data={hourlyData} />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="agp" className="mt-0 space-y-6">
                  {agpData && agpData.length > 0 && (
                    <GlucoseAGPChart data={agpData} />
                  )}
                  {dailyData && dailyData.length > 0 && (
                    <GlucoseTrendChart data={dailyData} />
                  )}
                </TabsContent>

                <TabsContent value="trends" className="mt-0 space-y-6">
                  {dailyData && dailyData.length > 0 && (
                    <GlucoseTrendChart data={dailyData} />
                  )}
                  {hourlyData && hourlyData.length > 0 && (
                    <GlucoseHeatmap data={hourlyData} />
                  )}
                </TabsContent>

                <TabsContent value="insights" className="mt-0 space-y-6">
                  {patterns && patterns.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        🔍 Detected Patterns
                      </h3>
                      {patterns.map((pattern, index) => (
                        <PatternCard key={index} pattern={pattern} />
                      ))}
                    </div>
                  )}
                  
                  {recommendations && recommendations.length > 0 && (
                    <RecommendationCard recommendations={recommendations} />
                  )}

                  <div className="space-y-2">
                    <h3 className="font-semibold">📋 Summary Insights</h3>
                    {insights.map((insight, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/30 border text-sm">
                        {insight}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        ) : (
          <ScrollArea className="max-h-[60vh] p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Readings</p>
                  <p className="text-xl font-bold">{readingsCount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Analysis Insights</h3>
                {insights.map((insight, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/30 border text-sm">
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}

        <div className="px-6 py-4 border-t bg-muted/30 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            💡 Discuss these results with your healthcare provider
          </p>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisResultsModal;