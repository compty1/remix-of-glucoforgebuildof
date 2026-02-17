import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, TrendingDown, Minus, Scale } from 'lucide-react';

interface GroupData {
  name: string;
  avgGlucose: number;
  tir: number;
  cv: number;
  timeBelowRange: number;
  timeAboveRange: number;
  count: number;
}

interface ComparisonWidgetProps {
  groups: GroupData[];
  groupLabel: string;
}

export function ComparisonWidget({ groups, groupLabel }: ComparisonWidgetProps) {
  const [group1, setGroup1] = useState<string>(groups[0]?.name || '');
  const [group2, setGroup2] = useState<string>(groups[1]?.name || '');

  const selectedGroup1 = groups.find(g => g.name === group1);
  const selectedGroup2 = groups.find(g => g.name === group2);

  const getComparisonIcon = (val1: number, val2: number, higherIsBetter = true) => {
    const diff = val1 - val2;
    if (Math.abs(diff) < 2) return <Minus className="h-4 w-4 text-muted-foreground" />;
    const isPositive = higherIsBetter ? diff > 0 : diff < 0;
    return isPositive 
      ? <TrendingUp className="h-4 w-4 text-success" />
      : <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const getComparisonBadge = (val1: number, val2: number, higherIsBetter = true, unit = '%') => {
    const diff = val1 - val2;
    if (Math.abs(diff) < 2) return <Badge variant="outline">Similar</Badge>;
    const isPositive = higherIsBetter ? diff > 0 : diff < 0;
    return (
      <Badge variant={isPositive ? 'default' : 'secondary'}>
        {diff > 0 ? '+' : ''}{diff.toFixed(1)}{unit}
      </Badge>
    );
  };

  if (groups.length < 2) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Not enough groups to compare
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Compare {groupLabel}s
        </CardTitle>
        <CardDescription>
          Select two groups to compare their glucose metrics side by side
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selectors */}
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={group1} onValueChange={setGroup1}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select group 1" />
            </SelectTrigger>
            <SelectContent>
              {groups.map(g => (
                <SelectItem key={g.name} value={g.name} disabled={g.name === group2}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ArrowRight className="h-5 w-5 text-muted-foreground" />

          <Select value={group2} onValueChange={setGroup2}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select group 2" />
            </SelectTrigger>
            <SelectContent>
              {groups.map(g => (
                <SelectItem key={g.name} value={g.name} disabled={g.name === group1}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Comparison Table */}
        {selectedGroup1 && selectedGroup2 && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground px-2">
              <div>Metric</div>
              <div className="text-center">{selectedGroup1.name}</div>
              <div className="text-center">{selectedGroup2.name}</div>
              <div className="text-center">Difference</div>
            </div>

            {/* Time in Range */}
            <div className="grid grid-cols-4 gap-2 items-center p-3 rounded-lg bg-muted/30">
              <div className="text-sm font-medium">Time in Range</div>
              <div className="text-center text-lg font-semibold">{selectedGroup1.tir}%</div>
              <div className="text-center text-lg font-semibold">{selectedGroup2.tir}%</div>
              <div className="flex items-center justify-center gap-2">
                {getComparisonIcon(selectedGroup1.tir, selectedGroup2.tir, true)}
                {getComparisonBadge(selectedGroup1.tir, selectedGroup2.tir, true)}
              </div>
            </div>

            {/* Average Glucose */}
            <div className="grid grid-cols-4 gap-2 items-center p-3 rounded-lg bg-muted/30">
              <div className="text-sm font-medium">Avg Glucose</div>
              <div className="text-center text-lg font-semibold">{selectedGroup1.avgGlucose.toFixed(0)}</div>
              <div className="text-center text-lg font-semibold">{selectedGroup2.avgGlucose.toFixed(0)}</div>
              <div className="flex items-center justify-center gap-2">
                {getComparisonIcon(selectedGroup1.avgGlucose, selectedGroup2.avgGlucose, false)}
                {getComparisonBadge(selectedGroup1.avgGlucose, selectedGroup2.avgGlucose, false, ' mg/dL')}
              </div>
            </div>

            {/* CV */}
            <div className="grid grid-cols-4 gap-2 items-center p-3 rounded-lg bg-muted/30">
              <div className="text-sm font-medium">Variability (CV)</div>
              <div className="text-center text-lg font-semibold">{selectedGroup1.cv.toFixed(1)}%</div>
              <div className="text-center text-lg font-semibold">{selectedGroup2.cv.toFixed(1)}%</div>
              <div className="flex items-center justify-center gap-2">
                {getComparisonIcon(selectedGroup1.cv, selectedGroup2.cv, false)}
                {getComparisonBadge(selectedGroup1.cv, selectedGroup2.cv, false)}
              </div>
            </div>

            {/* Time Below Range */}
            <div className="grid grid-cols-4 gap-2 items-center p-3 rounded-lg bg-muted/30">
              <div className="text-sm font-medium">Time Below Range</div>
              <div className="text-center text-lg font-semibold">{selectedGroup1.timeBelowRange.toFixed(1)}%</div>
              <div className="text-center text-lg font-semibold">{selectedGroup2.timeBelowRange.toFixed(1)}%</div>
              <div className="flex items-center justify-center gap-2">
                {getComparisonIcon(selectedGroup1.timeBelowRange, selectedGroup2.timeBelowRange, false)}
                {getComparisonBadge(selectedGroup1.timeBelowRange, selectedGroup2.timeBelowRange, false)}
              </div>
            </div>

            {/* Time Above Range */}
            <div className="grid grid-cols-4 gap-2 items-center p-3 rounded-lg bg-muted/30">
              <div className="text-sm font-medium">Time Above Range</div>
              <div className="text-center text-lg font-semibold">{selectedGroup1.timeAboveRange.toFixed(1)}%</div>
              <div className="text-center text-lg font-semibold">{selectedGroup2.timeAboveRange.toFixed(1)}%</div>
              <div className="flex items-center justify-center gap-2">
                {getComparisonIcon(selectedGroup1.timeAboveRange, selectedGroup2.timeAboveRange, false)}
                {getComparisonBadge(selectedGroup1.timeAboveRange, selectedGroup2.timeAboveRange, false)}
              </div>
            </div>

            {/* Sample sizes */}
            <div className="text-xs text-muted-foreground text-center mt-4">
              Sample sizes: {selectedGroup1.name} (n={selectedGroup1.count.toLocaleString()}) vs {selectedGroup2.name} (n={selectedGroup2.count.toLocaleString()})
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ComparisonWidget;
