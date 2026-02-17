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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  BarChart3,
  Activity,
  TrendingUp,
  Lightbulb,
  Target,
  Download,
  Loader2,
  AlertTriangle,
  Calendar,
  ShieldCheck,
  Zap,
  Heart
} from 'lucide-react';
import jsPDF from 'jspdf';

import GlucoseMetricsGrid from './GlucoseMetricsGrid';
import GlucoseAGPChart from './GlucoseAGPChart';
import TimeInRangeChart from './TimeInRangeChart';
import GlucoseTrendChart from './GlucoseTrendChart';
import GlucoseHeatmap from './GlucoseHeatmap';
import PatternCard from './PatternCard';
import RecommendationCard from './RecommendationCard';
import GlucoseRiskMatrix from './GlucoseRiskMatrix';
import WeekdayComparisonChart from './WeekdayComparisonChart';
import TrendPrediction from './TrendPrediction';
import ConfidenceScoreBadge from './ConfidenceScoreBadge';
import NovelSignalsCard from './NovelSignalsCard';
import DataQualityPanel from './DataQualityPanel';
import ExecutiveSummary from './ExecutiveSummary';
import HealthComparisonPanel from './HealthComparisonPanel';
import type { 
  ConfidenceBand, 
  ValidationFlag, 
  DataQuality, 
  NovelSignals, 
  ExecutiveSummary as ExecutiveSummaryType,
  DayNightMetrics 
} from '@/types/glucose-analysis';

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
  fromSummaryReport?: boolean;
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

interface AIInsights {
  summary?: string;
  keyFindings?: string[];
  priorityActions?: string[];
  encouragement?: string;
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
  aiInsights?: AIInsights;
  // Enhanced analysis props
  confidenceScore?: number;
  confidenceBand?: ConfidenceBand;
  validationFlags?: ValidationFlag[];
  dataQuality?: DataQuality;
  novelSignals?: NovelSignals;
  executiveSummary?: ExecutiveSummaryType;
  dayNightAnalysis?: DayNightMetrics;
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
  aiInsights,
  // Enhanced analysis props
  confidenceScore,
  confidenceBand,
  validationFlags,
  dataQuality,
  novelSignals,
  executiveSummary,
  dayNightAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);

  // Check if we have any meaningful analysis data (either raw readings or PDF-extracted metrics)
  const hasDetailedData = detailedAnalysis && (
    (detailedAnalysis.readingsCount ?? 0) > 0 || 
    detailedAnalysis.fromSummaryReport === true ||
    detailedAnalysis.avgGlucose !== undefined
  );
  const isFromSummary = detailedAnalysis?.fromSummaryReport === true || readingsCount === 0;
  const hasEnhancedData = confidenceScore !== undefined && confidenceBand && confidenceBand !== 'unknown';

  const exportReport = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;
      
      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(33, 33, 33);
      pdf.text('Glucose Analysis Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      // File info
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`File: ${fileName}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Key Metrics
      if (detailedAnalysis) {
        pdf.setFontSize(14);
        pdf.setTextColor(33, 33, 33);
        pdf.text('Key Metrics', 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(10);
        pdf.setTextColor(66, 66, 66);
        
        const metrics = [
          `Readings Analyzed: ${detailedAnalysis.readingsCount?.toLocaleString() || 'N/A'}`,
          `Days of Data: ${detailedAnalysis.daysOfData || 'N/A'}`,
          `Average Glucose: ${detailedAnalysis.avgGlucose?.toFixed(0) || 'N/A'} mg/dL`,
          `Time in Range (70-180): ${detailedAnalysis.timeInRange?.toFixed(1) || 'N/A'}%`,
          `CV (Variability): ${detailedAnalysis.cv?.toFixed(1) || 'N/A'}%`,
          `GMI: ${detailedAnalysis.gmi?.toFixed(1) || 'N/A'}%`,
        ];
        
        metrics.forEach(metric => {
          pdf.text(`• ${metric}`, 25, yPos);
          yPos += 6;
        });
        yPos += 10;
      }
      
      // Patterns
      if (patterns && patterns.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(33, 33, 33);
        pdf.text('Detected Patterns', 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(10);
        patterns.forEach(pattern => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.setTextColor(pattern.severity === 'critical' ? 180 : pattern.severity === 'warning' ? 200 : 66, 
                           pattern.severity === 'critical' ? 0 : pattern.severity === 'warning' ? 150 : 66, 
                           66);
          pdf.text(`• ${pattern.title}`, 25, yPos);
          yPos += 6;
          pdf.setTextColor(100, 100, 100);
          const descLines = pdf.splitTextToSize(pattern.description, pageWidth - 50);
          descLines.forEach((line: string) => {
            if (yPos > 270) {
              pdf.addPage();
              yPos = 20;
            }
            pdf.text(line, 30, yPos);
            yPos += 5;
          });
          yPos += 3;
        });
        yPos += 10;
      }
      
      // Recommendations
      if (recommendations && recommendations.length > 0) {
        if (yPos > 240) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setTextColor(33, 33, 33);
        pdf.text('Recommendations', 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(10);
        pdf.setTextColor(66, 66, 66);
        recommendations.forEach(rec => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          const recLines = pdf.splitTextToSize(`• ${rec}`, pageWidth - 50);
          recLines.forEach((line: string) => {
            pdf.text(line, 25, yPos);
            yPos += 5;
          });
          yPos += 2;
        });
      }
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Discuss these results with your healthcare provider before making any treatment changes.', 
               pageWidth / 2, 285, { align: 'center' });
      
      pdf.save(`glucose-analysis-${fileName.replace(/\.[^/.]+$/, '')}.pdf`);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Glucose Analysis Results
            </DialogTitle>
            {hasEnhancedData && confidenceScore !== undefined && confidenceBand && (
              <ConfidenceScoreBadge
                score={confidenceScore}
                band={confidenceBand}
                validationFlags={validationFlags}
                showDetails={true}
                size="md"
              />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span>{fileName}</span>
            {readingsCount > 0 ? (
              <Badge variant="outline">{readingsCount.toLocaleString()} readings</Badge>
            ) : (
              <Badge variant="secondary">Summary Report</Badge>
            )}
            {detailedAnalysis?.daysOfData && (
              <Badge variant="secondary">{detailedAnalysis.daysOfData} days</Badge>
            )}
          </div>
        </DialogHeader>

        {/* Summary Report Notice */}
        {isFromSummary && (
          <div className="mx-6 p-3 rounded-lg bg-accent/50 border border-accent text-sm">
            <p className="font-medium text-accent-foreground">📊 Summary Report Analysis</p>
            <p className="text-muted-foreground mt-1">
              This analysis is based on summary metrics from your PDF report. For detailed patterns, AGP charts, and AI recommendations, export your CGM data as CSV from Dexcom Clarity, LibreView, or your pump app.
            </p>
          </div>
        )}

        {hasDetailedData ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 border-b">
              <TabsList className="h-10 flex-wrap">
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
                {hasEnhancedData && dataQuality && (
                  <TabsTrigger value="quality" className="gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Quality
                  </TabsTrigger>
                )}
                {hasEnhancedData && novelSignals && (
                  <TabsTrigger value="signals" className="gap-1.5">
                    <Zap className="h-4 w-4" />
                    Signals
                  </TabsTrigger>
                )}
                <TabsTrigger value="risk" className="gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  Risk
                </TabsTrigger>
                <TabsTrigger value="daycompare" className="gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Days
                </TabsTrigger>
                <TabsTrigger value="insights" className="gap-1.5">
                  <Lightbulb className="h-4 w-4" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="health" className="gap-1.5">
                  <Heart className="h-4 w-4" />
                  Health
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="overview" className="mt-0 space-y-6">
                  {/* Executive Summary - Enhanced */}
                  {executiveSummary ? (
                    <ExecutiveSummary summary={executiveSummary} />
                  ) : aiInsights?.summary ? (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                        ✨ AI Summary
                      </h3>
                      <p className="text-sm text-muted-foreground">{aiInsights.summary}</p>
                      {aiInsights.encouragement && (
                        <p className="text-sm text-primary mt-2">{aiInsights.encouragement}</p>
                      )}
                    </div>
                  ) : null}
                  
                  <GlucoseMetricsGrid analysis={detailedAnalysis} />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TimeInRangeChart
                      timeInRange={detailedAnalysis.timeInRange ?? 0}
                      timeAbove180={detailedAnalysis.timeAbove180 ?? 0}
                      timeAbove250={detailedAnalysis.timeAbove250 ?? 0}
                      timeBelow70={detailedAnalysis.timeBelow70 ?? 0}
                      timeBelow54={detailedAnalysis.timeBelow54 ?? 0}
                    />
                    {hourlyData && hourlyData.length > 0 ? (
                      <GlucoseHeatmap data={hourlyData} />
                    ) : (
                      <div className="p-6 border rounded-lg">
                        <Skeleton className="h-48 w-full" />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="agp" className="mt-0 space-y-6">
                  {agpData && agpData.length > 0 ? (
                    <GlucoseAGPChart data={agpData} />
                  ) : (
                    <div className="p-6 border rounded-lg">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  )}
                  {dailyData && dailyData.length > 0 ? (
                    <GlucoseTrendChart data={dailyData} />
                  ) : (
                    <div className="p-6 border rounded-lg">
                      <Skeleton className="h-48 w-full" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="trends" className="mt-0 space-y-6">
                  {dailyData && dailyData.length > 0 ? (
                    <GlucoseTrendChart data={dailyData} />
                  ) : (
                    <div className="p-6 border rounded-lg">
                      <Skeleton className="h-48 w-full" />
                    </div>
                  )}
                  {hourlyData && hourlyData.length > 0 ? (
                    <GlucoseHeatmap data={hourlyData} />
                  ) : (
                    <div className="p-6 border rounded-lg">
                      <Skeleton className="h-48 w-full" />
                    </div>
                  )}
                </TabsContent>

                {/* Quality Tab - Enhanced */}
                {hasEnhancedData && dataQuality && (
                  <TabsContent value="quality" className="mt-0 space-y-6">
                    <DataQualityPanel dataQuality={dataQuality} />
                  </TabsContent>
                )}

                {/* Signals Tab - Enhanced */}
                {hasEnhancedData && novelSignals && (
                  <TabsContent value="signals" className="mt-0 space-y-6">
                    <NovelSignalsCard novelSignals={novelSignals} />
                  </TabsContent>
                )}

                <TabsContent value="risk" className="mt-0 space-y-6">
                  <GlucoseRiskMatrix
                    hourlyStats={hourlyData?.map(h => ({
                      hour: h.hour,
                      average: h.avg,
                      min: h.min,
                      max: h.max,
                      count: h.count
                    }))} 
                  />
                  <TrendPrediction 
                    hourlyStats={hourlyData?.map(h => ({
                      hour: h.hour,
                      average: h.avg,
                      min: h.min,
                      max: h.max
                    }))}
                  />
                </TabsContent>

                <TabsContent value="daycompare" className="mt-0 space-y-6">
                  <WeekdayComparisonChart 
                    dailyStats={dailyData?.map(d => ({
                      date: d.date,
                      average: d.avg,
                      min: d.min,
                      max: d.max,
                      timeInRange: d.tir
                    }))}
                  />
                </TabsContent>

                <TabsContent value="insights" className="mt-0 space-y-6">
                  {/* AI Key Findings */}
                  {aiInsights?.keyFindings && aiInsights.keyFindings.length > 0 && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h3 className="font-semibold text-primary mb-3">
                        🔬 AI Key Findings
                      </h3>
                      <ul className="space-y-2">
                        {aiInsights.keyFindings.map((finding, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* AI Priority Actions */}
                  {aiInsights?.priorityActions && aiInsights.priorityActions.length > 0 && (
                    <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                      <h3 className="font-semibold text-warning mb-3">
                        ⚡ Priority Actions
                      </h3>
                      <ul className="space-y-2">
                        {aiInsights.priorityActions.map((action, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-warning">{index + 1}.</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
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

                <TabsContent value="health" className="mt-0">
                  <HealthComparisonPanel detailedAnalysis={detailedAnalysis} />
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportReport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisResultsModal;