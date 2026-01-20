import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimeInRangeChartProps {
  timeInRange: number;
  timeAbove180: number;
  timeAbove250: number;
  timeBelow70: number;
  timeBelow54: number;
}

const TimeInRangeChart: React.FC<TimeInRangeChartProps> = ({
  timeInRange,
  timeAbove180,
  timeAbove250,
  timeBelow70,
  timeBelow54
}) => {
  // Calculate the remaining percentages
  const timeHigh = timeAbove180 - timeAbove250;
  const timeLow = timeBelow70 - timeBelow54;
  
  const data = [
    { name: 'Very High (>250)', value: timeAbove250, color: '#DC2626', target: '<5%' },
    { name: 'High (180-250)', value: Math.max(0, timeHigh), color: '#F97316', target: '<25% total' },
    { name: 'In Range (70-180)', value: timeInRange, color: '#10B981', target: '>70%' },
    { name: 'Low (54-70)', value: Math.max(0, timeLow), color: '#FBBF24', target: '<4%' },
    { name: 'Very Low (<54)', value: timeBelow54, color: '#EF4444', target: '<1%' },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium" style={{ color: data.color }}>{data.name}</p>
          <p className="text-lg font-bold">{data.value.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Target: {data.target}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          🎯 Time in Range Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribution of glucose values across clinical ranges
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground truncate">{item.name}</span>
              <span className="font-medium ml-auto">{item.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
        
        {/* Clinical Targets */}
        <div className="mt-4 p-3 rounded-lg bg-muted/30 text-xs">
          <p className="font-medium mb-1">📋 Clinical Targets:</p>
          <p className="text-muted-foreground">
            TIR ≥70% • Time Below ≤4% • Very Low ≤1% • Time Above ≤25%
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeInRangeChart;