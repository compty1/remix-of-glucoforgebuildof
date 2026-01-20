import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sunrise, 
  Utensils, 
  Moon, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Pattern {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timeOfDay?: string;
  frequency?: number;
  avgImpact?: number;
}

interface PatternCardProps {
  pattern: Pattern;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern }) => {
  const getIcon = () => {
    switch (pattern.type) {
      case 'dawn_phenomenon':
        return <Sunrise className="h-5 w-5" />;
      case 'post_meal_spike':
        return <Utensils className="h-5 w-5" />;
      case 'overnight_stability':
      case 'overnight_instability':
        return <Moon className="h-5 w-5" />;
      case 'low_clustering':
        return <TrendingDown className="h-5 w-5" />;
      case 'high_clustering':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityStyles = () => {
    switch (pattern.severity) {
      case 'critical':
        return {
          bg: 'bg-destructive/10',
          border: 'border-destructive/30',
          icon: 'text-destructive',
          badge: 'destructive' as const
        };
      case 'warning':
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/30',
          icon: 'text-warning',
          badge: 'secondary' as const
        };
      case 'info':
      default:
        return {
          bg: 'bg-primary/10',
          border: 'border-primary/30',
          icon: 'text-primary',
          badge: 'outline' as const
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <Card className={`${styles.bg} ${styles.border} border`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${styles.bg} ${styles.icon}`}>
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground">{pattern.title}</h4>
              <Badge variant={styles.badge} className="text-xs">
                {pattern.severity === 'critical' ? '⚠️ Critical' : 
                 pattern.severity === 'warning' ? '⚡ Attention' : 
                 '✓ Good'}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {pattern.description}
            </p>
            
            <div className="flex flex-wrap gap-2 text-xs">
              {pattern.timeOfDay && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                  <Clock className="h-3 w-3" />
                  {pattern.timeOfDay}
                </span>
              )}
              {pattern.avgImpact && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                  {pattern.avgImpact > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(pattern.avgImpact).toFixed(0)} mg/dL
                </span>
              )}
              {pattern.frequency && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                  {pattern.frequency}x detected
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternCard;