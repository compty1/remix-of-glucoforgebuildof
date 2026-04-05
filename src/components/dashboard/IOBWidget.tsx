/**
 * Gap 92/93: IOB Calculator Dashboard Widget
 * Shows insulin-on-board status from iobCalculator utility.
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Syringe } from 'lucide-react';
import { computeIOBTimeline, type InsulinEvent } from '@/utils/iobCalculator';
import { useMemo } from 'react';

interface IOBWidgetProps {
  events?: InsulinEvent[];
}

export default function IOBWidget({ events = [] }: IOBWidgetProps) {
  const currentIOB = useMemo(() => {
    if (events.length === 0) return null;
    const timeline = computeIOBTimeline(events, [{ timestamp: new Date() }] as any);
    return timeline[0]?.totalIOB ?? 0;
  }, [events]);

  return (
    <Card className="h-full p-4">
      <div className="flex items-center gap-2 mb-3">
        <Syringe className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-sm">Insulin on Board</h3>
      </div>
      {currentIOB !== null ? (
        <div>
          <p className="text-2xl font-bold">{currentIOB.toFixed(2)}u</p>
          <Badge variant="secondary" className="text-xs mt-1">Active IOB</Badge>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Log insulin doses to track your active insulin on board.
        </p>
      )}
    </Card>
  );
}
