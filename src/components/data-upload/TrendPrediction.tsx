import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, AlertTriangle, TrendingUp, TrendingDown, Zap } from "lucide-react";

interface Pattern {
  type: string;
  confidence: number;
  description: string;
  time_range?: string;
  severity?: string;
}

interface TrendPredictionProps {
  patterns?: Pattern[];
  hourlyStats?: {
    hour: number;
    average: number;
    min: number;
    max: number;
  }[];
}

const TrendPrediction = ({ patterns, hourlyStats }: TrendPredictionProps) => {
  // Generate predictions from patterns and hourly stats
  const generatePredictions = () => {
    const predictions: {
      title: string;
      time: string;
      prediction: string;
      confidence: number;
      type: 'high' | 'low' | 'stable' | 'variable';
      icon: React.ReactNode;
      actionable: string;
    }[] = [];

    // Analyze hourly stats for patterns
    if (hourlyStats && hourlyStats.length > 0) {
      // Dawn phenomenon detection (4-8 AM)
      const dawnHours = hourlyStats.filter(h => h.hour >= 4 && h.hour <= 8);
      const dawnAvg = dawnHours.reduce((a, b) => a + b.average, 0) / Math.max(dawnHours.length, 1);
      const nightAvg = hourlyStats.filter(h => h.hour >= 0 && h.hour <= 3)
        .reduce((a, b) => a + b.average, 0) / Math.max(hourlyStats.filter(h => h.hour >= 0 && h.hour <= 3).length, 1);
      
      if (dawnAvg > nightAvg + 20) {
        predictions.push({
          title: 'Dawn Phenomenon',
          time: '4:00 AM - 8:00 AM',
          prediction: `Glucose likely to rise ~${Math.round(dawnAvg - nightAvg)} mg/dL`,
          confidence: 78,
          type: 'high',
          icon: <TrendingUp className="h-4 w-4 text-red-500" />,
          actionable: 'Consider adjusting overnight basal or taking early morning correction'
        });
      }

      // Post-breakfast spike (8-10 AM)
      const breakfastHours = hourlyStats.filter(h => h.hour >= 8 && h.hour <= 10);
      const maxBreakfast = Math.max(...breakfastHours.map(h => h.max));
      if (maxBreakfast > 180) {
        predictions.push({
          title: 'Post-Breakfast Spike',
          time: '8:00 AM - 10:00 AM',
          prediction: `High risk of spike above ${Math.round(maxBreakfast)} mg/dL`,
          confidence: 72,
          type: 'high',
          icon: <Zap className="h-4 w-4 text-amber-500" />,
          actionable: 'Pre-bolus 15-20 min before eating, consider lower-carb breakfast'
        });
      }

      // Afternoon dip (2-4 PM)
      const afternoonHours = hourlyStats.filter(h => h.hour >= 14 && h.hour <= 16);
      const minAfternoon = Math.min(...afternoonHours.map(h => h.min));
      if (minAfternoon < 80) {
        predictions.push({
          title: 'Afternoon Low Risk',
          time: '2:00 PM - 4:00 PM',
          prediction: `Increased risk of dropping below ${Math.round(minAfternoon)} mg/dL`,
          confidence: 65,
          type: 'low',
          icon: <TrendingDown className="h-4 w-4 text-blue-500" />,
          actionable: 'Plan a small snack or reduce lunch bolus by 10-15%'
        });
      }

      // Overnight stability (12-4 AM)
      const overnightHours = hourlyStats.filter(h => h.hour >= 0 && h.hour <= 4);
      const overnightVariability = Math.max(...overnightHours.map(h => h.max)) - Math.min(...overnightHours.map(h => h.min));
      if (overnightVariability < 40) {
        predictions.push({
          title: 'Stable Overnight',
          time: '12:00 AM - 4:00 AM',
          prediction: 'Low variability expected overnight',
          confidence: 85,
          type: 'stable',
          icon: <Clock className="h-4 w-4 text-green-500" />,
          actionable: 'Current basal rates appear well-tuned for nighttime'
        });
      } else if (overnightVariability > 80) {
        predictions.push({
          title: 'Overnight Variability',
          time: '12:00 AM - 4:00 AM',
          prediction: `High variability (${Math.round(overnightVariability)} mg/dL range)`,
          confidence: 70,
          type: 'variable',
          icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
          actionable: 'Consider reviewing dinner composition and bedtime snack timing'
        });
      }
    }

    // Add patterns from analysis if available
    if (patterns && patterns.length > 0) {
      patterns.forEach(pattern => {
        if (!predictions.find(p => p.title.toLowerCase().includes(pattern.type.toLowerCase()))) {
          predictions.push({
            title: pattern.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            time: pattern.time_range || 'Throughout day',
            prediction: pattern.description,
            confidence: pattern.confidence,
            type: pattern.severity === 'high' ? 'high' : pattern.severity === 'low' ? 'low' : 'variable',
            icon: pattern.severity === 'high' ? <TrendingUp className="h-4 w-4 text-red-500" /> : 
                  pattern.severity === 'low' ? <TrendingDown className="h-4 w-4 text-blue-500" /> : 
                  <AlertTriangle className="h-4 w-4 text-amber-500" />,
            actionable: 'Review with your healthcare provider for personalized advice'
          });
        }
      });
    }

    // Default predictions if none generated
    if (predictions.length === 0) {
      predictions.push({
        title: 'General Monitoring',
        time: 'All day',
        prediction: 'Insufficient data for specific predictions',
        confidence: 0,
        type: 'stable',
        icon: <Brain className="h-4 w-4 text-muted-foreground" />,
        actionable: 'Continue logging data for more accurate pattern detection'
      });
    }

    return predictions.sort((a, b) => b.confidence - a.confidence);
  };

  const predictions = generatePredictions();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'high': return 'bg-red-500/10 border-red-500/30 text-red-600';
      case 'low': return 'bg-blue-500/10 border-blue-500/30 text-blue-600';
      case 'stable': return 'bg-green-500/10 border-green-500/30 text-green-600';
      case 'variable': return 'bg-amber-500/10 border-amber-500/30 text-amber-600';
      default: return 'bg-muted border-muted-foreground/30';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'bg-green-500';
    if (confidence >= 50) return 'bg-amber-500';
    return 'bg-muted-foreground';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          Pattern-Based Predictions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-detected patterns and predicted glucose trends for the coming day
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${getTypeColor(prediction.type)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {prediction.icon}
                  <h4 className="font-semibold">{prediction.title}</h4>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {prediction.time}
                </Badge>
              </div>
              
              <p className="text-sm mb-3">{prediction.prediction}</p>
              
              {/* Confidence meter */}
              {prediction.confidence > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">{prediction.confidence}%</span>
                  </div>
                  <Progress 
                    value={prediction.confidence} 
                    className="h-1.5"
                  />
                </div>
              )}
              
              {/* Actionable advice */}
              <div className="flex items-start gap-2 pt-2 border-t border-current/10">
                <Zap className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <p className="text-xs opacity-80">{prediction.actionable}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-muted">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> These predictions are based on historical patterns and should not replace medical advice. 
            Always consult with your healthcare provider for treatment decisions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendPrediction;
