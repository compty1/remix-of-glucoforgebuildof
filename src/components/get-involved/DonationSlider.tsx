import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart } from 'lucide-react';
import { impactLevels } from '@/data/volunteerRoles';

export function DonationSlider() {
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');
  const [amount, setAmount] = useState(150);

  const getImpactDescription = (value: number) => {
    // Find the closest impact level
    const sorted = [...impactLevels].sort((a, b) => 
      Math.abs(a.amount - value) - Math.abs(b.amount - value)
    );
    return sorted[0]?.description || 'Make a meaningful impact';
  };

  const handleDonate = () => {
    window.location.href = `/donate?amount=${amount}&type=${donationType}`;
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl">Calculate Your Impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={donationType} onValueChange={(v) => setDonationType(v as 'one-time' | 'monthly')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="one-time">One-Time</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          <div className="text-center">
            <span className="text-4xl font-bold text-primary">${amount}</span>
            {donationType === 'monthly' && (
              <span className="text-muted-foreground">/month</span>
            )}
          </div>

          <div className="px-2">
            <Slider
              value={[amount]}
              onValueChange={(value) => setAmount(value[0])}
              min={25}
              max={2500}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>$25</span>
              <span>$150</span>
              <span>$450</span>
              <span>$890</span>
              <span>$2500</span>
            </div>
          </div>

          <div className="bg-accent/50 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-foreground">Your Impact:</p>
            <p className="text-muted-foreground">{getImpactDescription(amount)}</p>
          </div>
        </div>

        <Button onClick={handleDonate} size="lg" className="w-full" variant="default">
          <Heart className="mr-2 h-4 w-4" />
          Donate ${amount} {donationType === 'monthly' ? 'Monthly' : 'Now'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          We're working toward 501(c)(3) status. Your contribution helps us build tools that eliminate daily stress for millions.
        </p>
      </CardContent>
    </Card>
  );
}
