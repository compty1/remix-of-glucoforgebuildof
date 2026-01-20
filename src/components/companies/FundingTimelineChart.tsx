import { useFundingTimeline } from '@/hooks/useFundingTimeline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Bar, ComposedChart, ResponsiveContainer } from 'recharts';

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
};

const chartConfig = {
  totalFunding: {
    label: 'Total Funding',
    color: 'hsl(var(--primary))',
  },
  companyCount: {
    label: 'Companies Founded',
    color: 'hsl(var(--secondary))',
  },
};

const FundingTimelineChart = () => {
  const { timelineData, loading, error, totalInvestment, peakYear } = useFundingTimeline();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Failed to load funding timeline data
        </CardContent>
      </Card>
    );
  }

  if (timelineData.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No funding timeline data available
        </CardContent>
      </Card>
    );
  }

  // Filter to last 15 years for better visualization
  const currentYear = new Date().getFullYear();
  const filteredData = timelineData.filter(d => d.year >= currentYear - 15);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              T1D Investment Timeline
            </CardTitle>
            <CardDescription className="mt-1">
              Funding raised by T1D companies by founding year
            </CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{formatCurrency(totalInvestment)}</span>
            </div>
            {peakYear && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Peak:</span>
                <span className="font-semibold">{peakYear}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fundingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="funding"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis 
              yAxisId="count"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip 
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0]?.payload;
                return (
                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold mb-2">{label}</p>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Funding:</span>
                        <span className="font-medium">{formatCurrency(data?.totalFunding || 0)}</span>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Companies:</span>
                        <span className="font-medium">{data?.companyCount || 0}</span>
                      </p>
                      {data?.topCompanies?.length > 0 && (
                        <div className="pt-1 border-t border-border mt-2">
                          <p className="text-muted-foreground text-xs mb-1">Top companies:</p>
                          {data.topCompanies.map((name: string, i: number) => (
                            <p key={i} className="text-xs truncate">{name}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Area
              yAxisId="funding"
              type="monotone"
              dataKey="totalFunding"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#fundingGradient)"
            />
            <Bar 
              yAxisId="count"
              dataKey="companyCount" 
              fill="hsl(var(--secondary))" 
              opacity={0.6}
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ChartContainer>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-muted-foreground">Funding Raised</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-secondary opacity-60" />
            <span className="text-muted-foreground">Companies Founded</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FundingTimelineChart;
