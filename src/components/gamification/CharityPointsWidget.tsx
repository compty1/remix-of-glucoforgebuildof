import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Heart, Coins, Loader2 } from 'lucide-react';

const sb = supabase as any;

const CHARITIES = [
  { name: 'JDRF', description: 'Type 1 Diabetes Research' },
  { name: 'Beyond Type 1', description: 'T1D Community & Education' },
  { name: 'Diabetes Research Institute', description: 'Cure-focused Research' },
];

const POINTS_PER_DOLLAR = 100;

export default function CharityPointsWidget() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [totalDonated, setTotalDonated] = useState(0);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState(CHARITIES[0].name);
  const [pointsToSpend, setPointsToSpend] = useState(100);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await sb
        .from('charity_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setBalance(data.points_balance);
        setTotalDonated(data.total_donated_cents);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleDonate = async () => {
    if (!user || pointsToSpend > balance || pointsToSpend < POINTS_PER_DOLLAR) return;
    setDonating(true);
    const amountCents = Math.floor(pointsToSpend / POINTS_PER_DOLLAR) * 100;

    const { error: donationError } = await sb.from('charity_donations').insert({
      user_id: user.id,
      points_spent: pointsToSpend,
      amount_cents: amountCents,
      charity_name: selectedCharity,
    });

    if (donationError) {
      toast.error('Failed to process donation');
      setDonating(false);
      return;
    }

    const newBalance = balance - pointsToSpend;
    const newTotal = totalDonated + amountCents;
    await sb.from('charity_points').upsert({
      user_id: user.id,
      points_balance: newBalance,
      total_donated_cents: newTotal,
      last_conversion_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    setBalance(newBalance);
    setTotalDonated(newTotal);
    toast.success(`Donated $${(amountCents / 100).toFixed(2)} to ${selectedCharity}!`);
    setDonating(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const dollarValue = (balance / POINTS_PER_DOLLAR).toFixed(2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Heart className="h-5 w-5 text-destructive" />
          Charity Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{balance}</p>
            <p className="text-xs text-muted-foreground">points (≈ ${dollarValue})</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">${(totalDonated / 100).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">total donated</p>
          </div>
        </div>

        {balance >= POINTS_PER_DOLLAR && (
          <div className="space-y-3 pt-2 border-t">
            <Select value={selectedCharity} onValueChange={setSelectedCharity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CHARITIES.map(c => (
                  <SelectItem key={c.name} value={c.name}>{c.name} — {c.description}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              {[100, 500, 1000].filter(v => v <= balance).map(v => (
                <Badge key={v} variant={pointsToSpend === v ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setPointsToSpend(v)}>
                  {v} pts
                </Badge>
              ))}
            </div>
            <Button size="sm" onClick={handleDonate} disabled={donating || pointsToSpend > balance}>
              {donating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              <Coins className="h-4 w-4 mr-1" />
              Donate ${Math.floor(pointsToSpend / POINTS_PER_DOLLAR)}
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Earn 1 point per streak day. Donations are batched monthly.
        </p>
      </CardContent>
    </Card>
  );
}
