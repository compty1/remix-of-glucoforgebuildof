import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Share2, TrendingUp, Users, Cpu, MapPin } from 'lucide-react';

interface InsightData {
  id: string;
  title: string;
  description: string;
  category: 'device' | 'age' | 'region' | 'behavior' | 'correlation';
  confidence: number;
  dataPoints: number;
}

interface GlucoseInsightCardProps {
  insight: InsightData;
}

const categoryIcons = {
  device: Cpu,
  age: Users,
  region: MapPin,
  behavior: TrendingUp,
  correlation: Lightbulb,
};

const categoryColors = {
  device: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  age: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  region: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  behavior: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  correlation: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

export function GlucoseInsightCard({ insight }: GlucoseInsightCardProps) {
  const Icon = categoryIcons[insight.category];
  
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'GlycoForge Insight',
        text: `${insight.title}: ${insight.description}`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(`${insight.title}: ${insight.description}`);
    }
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${categoryColors[insight.category]}`}>
            <Icon className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px]">
                {insight.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {insight.confidence}% confidence
              </span>
            </div>
            
            <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
            <p className="text-sm text-muted-foreground">{insight.description}</p>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                Based on {insight.dataPoints.toLocaleString()} data points
              </span>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-computed insights for display
export const glucoseInsights: InsightData[] = [
  {
    id: '1',
    title: 'Automated Systems Show Higher TIR',
    description: 'Users with AID systems (Omnipod 5, t:slim X2, 780G) show 12-18% higher Time in Range compared to MDI users.',
    category: 'device',
    confidence: 94,
    dataPoints: 4200,
  },
  {
    id: '2',
    title: 'Age 31-45 Group Has Best Control',
    description: 'Middle-aged adults maintain the highest average TIR (72%), potentially due to established routines and experience.',
    category: 'age',
    confidence: 87,
    dataPoints: 3100,
  },
  {
    id: '3',
    title: 'Dawn Phenomenon Peak at 5-7 AM',
    description: 'Glucose levels consistently rise 15-25 mg/dL between 5-7 AM across all age groups, suggesting universal dawn effect.',
    category: 'correlation',
    confidence: 91,
    dataPoints: 8500,
  },
  {
    id: '4',
    title: 'Western Europe Shows Lower Variability',
    description: 'Users from Western Europe report 8% lower glucose variability, possibly due to healthcare access and dietary patterns.',
    category: 'region',
    confidence: 78,
    dataPoints: 2800,
  },
  {
    id: '5',
    title: 'CGM + Pump Combination Optimal',
    description: 'Dexcom G7 paired with Omnipod 5 shows the highest average TIR (76%) among all device combinations analyzed.',
    category: 'device',
    confidence: 89,
    dataPoints: 1900,
  },
  {
    id: '6',
    title: 'Weekend Patterns Differ Significantly',
    description: 'Weekend glucose averages are 8-12 mg/dL higher than weekdays, with delayed meal timing being the primary factor.',
    category: 'behavior',
    confidence: 85,
    dataPoints: 6200,
  },
];
