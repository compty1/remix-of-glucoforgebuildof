import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

interface DailyStats {
  date: string;
  average: number;
  min: number;
  max: number;
  timeInRange: number;
}

interface WeekdayComparisonChartProps {
  dailyStats?: DailyStats[];
}

const WeekdayComparisonChart = ({ dailyStats }: WeekdayComparisonChartProps) => {
  // Process data to get weekday vs weekend comparison
  const processData = () => {
    if (!dailyStats || dailyStats.length === 0) {
      // Demo data
      return {
        weekday: { avgGlucose: 142, timeInRange: 68, avgLow: 85, avgHigh: 198 },
        weekend: { avgGlucose: 158, timeInRange: 54, avgLow: 72, avgHigh: 225 },
        byDay: [
          { day: 'Mon', avgGlucose: 138, timeInRange: 72, label: 'Weekday' },
          { day: 'Tue', avgGlucose: 140, timeInRange: 70, label: 'Weekday' },
          { day: 'Wed', avgGlucose: 142, timeInRange: 68, label: 'Weekday' },
          { day: 'Thu', avgGlucose: 145, timeInRange: 65, label: 'Weekday' },
          { day: 'Fri', avgGlucose: 148, timeInRange: 62, label: 'Weekday' },
          { day: 'Sat', avgGlucose: 162, timeInRange: 52, label: 'Weekend' },
          { day: 'Sun', avgGlucose: 155, timeInRange: 56, label: 'Weekend' },
        ]
      };
    }

    const weekdayData: DailyStats[] = [];
    const weekendData: DailyStats[] = [];
    const byDay: { day: string; avgGlucose: number; timeInRange: number; label: string }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayTotals: Record<string, { glucose: number[]; tir: number[] }> = {};

    dailyStats.forEach(stat => {
      const date = new Date(stat.date);
      const dayOfWeek = date.getDay();
      const dayName = dayNames[dayOfWeek];
      
      if (!dayTotals[dayName]) {
        dayTotals[dayName] = { glucose: [], tir: [] };
      }
      dayTotals[dayName].glucose.push(stat.average);
      dayTotals[dayName].tir.push(stat.timeInRange);

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendData.push(stat);
      } else {
        weekdayData.push(stat);
      }
    });

    // Calculate by day averages
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
      const data = dayTotals[day];
      if (data && data.glucose.length > 0) {
        byDay.push({
          day,
          avgGlucose: Math.round(data.glucose.reduce((a, b) => a + b, 0) / data.glucose.length),
          timeInRange: Math.round(data.tir.reduce((a, b) => a + b, 0) / data.tir.length),
          label: ['Sat', 'Sun'].includes(day) ? 'Weekend' : 'Weekday'
        });
      }
    });

    const calcAvg = (arr: DailyStats[], key: keyof DailyStats) => {
      if (arr.length === 0) return 0;
      const sum = arr.reduce((acc, s) => acc + (typeof s[key] === 'number' ? s[key] as number : 0), 0);
      return Math.round(sum / arr.length);
    };

    return {
      weekday: {
        avgGlucose: calcAvg(weekdayData, 'average'),
        timeInRange: calcAvg(weekdayData, 'timeInRange'),
        avgLow: calcAvg(weekdayData, 'min'),
        avgHigh: calcAvg(weekdayData, 'max')
      },
      weekend: {
        avgGlucose: calcAvg(weekendData, 'average'),
        timeInRange: calcAvg(weekendData, 'timeInRange'),
        avgLow: calcAvg(weekendData, 'min'),
        avgHigh: calcAvg(weekendData, 'max')
      },
      byDay
    };
  };

  const { weekday, weekend, byDay } = processData();
  const weekdayBetter = weekday.timeInRange > weekend.timeInRange;

  const chartConfig = {
    avgGlucose: { label: 'Avg Glucose', color: 'hsl(var(--primary))' },
    timeInRange: { label: 'Time in Range %', color: 'hsl(var(--accent))' },
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Weekday vs Weekend Comparison
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare glucose patterns between weekdays and weekends
        </p>
      </CardHeader>
      <CardContent>
        {/* Summary Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-lg border-2 ${weekdayBetter ? 'border-green-500 bg-green-500/5' : 'border-muted'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Weekdays</h3>
              {weekdayBetter && <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded">Better</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-bold">{weekday.avgGlucose}</p>
                <p className="text-xs text-muted-foreground">Avg mg/dL</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{weekday.timeInRange}%</p>
                <p className="text-xs text-muted-foreground">Time in Range</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${!weekdayBetter ? 'border-green-500 bg-green-500/5' : 'border-muted'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Weekends</h3>
              {!weekdayBetter && <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded">Better</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-bold">{weekend.avgGlucose}</p>
                <p className="text-xs text-muted-foreground">Avg mg/dL</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{weekend.timeInRange}%</p>
                <p className="text-xs text-muted-foreground">Time in Range</p>
              </div>
            </div>
          </div>
        </div>

        {/* Difference Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg">
          {weekdayBetter ? (
            <>
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                Weekdays have <strong className="text-green-500">{weekday.timeInRange - weekend.timeInRange}%</strong> better Time in Range
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4 text-amber-500" />
              <span className="text-sm">
                Weekends have <strong className="text-green-500">{weekend.timeInRange - weekday.timeInRange}%</strong> better Time in Range
              </span>
            </>
          )}
        </div>

        {/* Daily Breakdown Chart */}
        <div className="h-64">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis 
                  yAxisId="glucose"
                  orientation="left"
                  tick={{ fontSize: 11 }}
                  domain={[60, 200]}
                  label={{ value: 'mg/dL', angle: -90, position: 'insideLeft', fontSize: 10 }}
                />
                <YAxis 
                  yAxisId="tir"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  domain={[0, 100]}
                  label={{ value: 'TIR %', angle: 90, position: 'insideRight', fontSize: 10 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine yAxisId="glucose" y={140} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Bar 
                  yAxisId="glucose"
                  dataKey="avgGlucose" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="Avg Glucose"
                />
                <Bar 
                  yAxisId="tir"
                  dataKey="timeInRange" 
                  fill="hsl(var(--accent))" 
                  radius={[4, 4, 0, 0]}
                  name="Time in Range %"
                />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Recommendations */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Pattern Insights</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {weekdayBetter ? (
              <>
                <li>• <strong>Weekend challenge:</strong> Consider maintaining weekday meal timing on weekends</li>
                <li>• <strong>Sleep patterns:</strong> Irregular weekend sleep may affect morning glucose</li>
                <li>• <strong>Activity levels:</strong> Match weekend activity with insulin adjustments</li>
              </>
            ) : (
              <>
                <li>• <strong>Work stress:</strong> Weekday stress may be affecting glucose levels</li>
                <li>• <strong>Meal timing:</strong> Consider more consistent weekday meal schedules</li>
                <li>• <strong>Exercise routine:</strong> Weekend activity may be helping - replicate on weekdays</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekdayComparisonChart;
