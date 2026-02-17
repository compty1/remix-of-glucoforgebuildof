import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Share2, Users, Cpu, MapPin, Activity, Moon, Sun } from 'lucide-react';

export interface GlucoseInsight {
  id: string;
  title: string;
  insight: string;
  category: 'device' | 'demographics' | 'pattern' | 'safety' | 'correlation';
  confidence: number;
  dataPoints: number;
  icon?: 'cpu' | 'users' | 'map' | 'activity' | 'moon' | 'sunrise' | 'lightbulb';
}

interface GlucoseInsightCardProps {
  insight: GlucoseInsight;
}

const iconMap = {
  cpu: Cpu,
  users: Users,
  map: MapPin,
  activity: Activity,
  moon: Moon,
  sunrise: Sun,
  lightbulb: Lightbulb,
};

const categoryColors = {
  device: 'bg-warning/10 text-warning',
  demographics: 'bg-accent/10 text-accent-foreground',
  pattern: 'bg-primary/10 text-primary',
  safety: 'bg-destructive/10 text-destructive',
  correlation: 'bg-brand-red/10 text-brand-red',
};

export function GlucoseInsightCard({ insight }: GlucoseInsightCardProps) {
  const Icon = iconMap[insight.icon || 'lightbulb'];
  
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'GlucoForge Insight',
        text: `${insight.title}: ${insight.insight}`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(`${insight.title}: ${insight.insight}`);
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
                {Math.round(insight.confidence * 100)}% confidence
              </span>
            </div>
            
            <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
            <p className="text-sm text-muted-foreground">{insight.insight}</p>
            
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
