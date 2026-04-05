/**
 * Gap 97: Meal Impact Widget
 * Shows meal composition profiles from mealModels utility.
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Apple } from 'lucide-react';
import { MEAL_PROFILES, type MealComposition } from '@/utils/mealModels';

export default function MealImpactWidget() {
  const profiles = Object.values(MEAL_PROFILES);

  return (
    <Card className="h-full p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-3">
        <Apple className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-sm">Meal Impact Guide</h3>
      </div>
      <div className="space-y-2">
        {profiles.slice(0, 4).map(p => (
          <div key={p.composition} className="text-xs border rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{p.label}</span>
              {p.suggestDualWave && <Badge variant="outline" className="text-[10px]">Dual-wave</Badge>}
            </div>
            <p className="text-muted-foreground">Rise: {p.riseStart}-{p.riseEnd}min</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
