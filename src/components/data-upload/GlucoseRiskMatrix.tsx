import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

interface RiskData {
  hour: number;
  day: string;
  lowRisk: number;
  highRisk: number;
  avgGlucose: number;
}

interface GlucoseRiskMatrixProps {
  data?: RiskData[];
  hourlyStats?: {
    hour: number;
    average: number;
    min: number;
    max: number;
    count: number;
  }[];
}

const GlucoseRiskMatrix = ({ data, hourlyStats }: GlucoseRiskMatrixProps) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate risk matrix from hourly stats if no direct data
  const getRiskLevel = (hour: number, dayIndex: number): { level: string; color: string; risk: string } => {
    if (hourlyStats) {
      const hourData = hourlyStats.find(h => h.hour === hour);
      if (hourData) {
        const cv = hourData.max > 0 ? ((hourData.max - hourData.min) / hourData.average) * 100 : 0;
        
        // High variability = high risk
        if (cv > 50 || hourData.min < 70 || hourData.max > 250) {
          return { level: 'high', color: 'bg-destructive/80', risk: 'High Risk' };
        } else if (cv > 36 || hourData.min < 80 || hourData.max > 180) {
          return { level: 'medium', color: 'bg-warning/70', risk: 'Moderate' };
        } else {
          return { level: 'low', color: 'bg-success/60', risk: 'Low Risk' };
        }
      }
    }

    // Default pattern-based risk for demo
    const isHighRiskTime = (hour >= 2 && hour <= 5) || (hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14);
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    
    if (isHighRiskTime && isWeekend) {
      return { level: 'high', color: 'bg-destructive/80', risk: 'High Risk' };
    } else if (isHighRiskTime || isWeekend) {
      return { level: 'medium', color: 'bg-warning/70', risk: 'Moderate' };
    }
    return { level: 'low', color: 'bg-success/60', risk: 'Low Risk' };
  };

  // Calculate summary stats
  const highRiskCount = days.flatMap((_, dayIdx) => 
    hours.map(hour => getRiskLevel(hour, dayIdx))
  ).filter(r => r.level === 'high').length;

  const mediumRiskCount = days.flatMap((_, dayIdx) => 
    hours.map(hour => getRiskLevel(hour, dayIdx))
  ).filter(r => r.level === 'medium').length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Glucose Risk Matrix
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Identify high-risk time periods for hypo/hyperglycemia
        </p>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-2xl font-bold text-destructive">{highRiskCount}</p>
              <p className="text-xs text-muted-foreground">High Risk Hours</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <div>
              <p className="text-2xl font-bold text-warning">{mediumRiskCount}</p>
              <p className="text-xs text-muted-foreground">Moderate Hours</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
            <TrendingDown className="h-4 w-4 text-success" />
            <div>
              <p className="text-2xl font-bold text-success">{168 - highRiskCount - mediumRiskCount}</p>
              <p className="text-xs text-muted-foreground">Low Risk Hours</p>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-1">
              <div className="w-12" />
              {hours.filter((_, i) => i % 3 === 0).map(hour => (
                <div 
                  key={hour} 
                  className="flex-1 text-xs text-muted-foreground text-center"
                  style={{ minWidth: '24px' }}
                >
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {days.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-1 mb-1">
                <div className="w-12 text-xs font-medium text-muted-foreground">{day}</div>
                <div className="flex flex-1 gap-0.5">
                  {hours.map(hour => {
                    const risk = getRiskLevel(hour, dayIdx);
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={`h-6 flex-1 rounded-sm ${risk.color} transition-all hover:opacity-80 cursor-pointer`}
                        style={{ minWidth: '8px' }}
                        title={`${day} ${hour}:00 - ${risk.risk}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/60" />
            <span className="text-xs text-muted-foreground">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning/70" />
            <span className="text-xs text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive/80" />
            <span className="text-xs text-muted-foreground">High Risk</span>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Key Insights</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Dawn phenomenon:</strong> Monitor 4-7 AM for rising glucose patterns</li>
            <li>• <strong>Post-meal spikes:</strong> Watch 1-3 hours after meals (8-10 AM, 1-3 PM, 7-9 PM)</li>
            <li>• <strong>Weekend patterns:</strong> May differ due to sleep schedule changes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlucoseRiskMatrix;
