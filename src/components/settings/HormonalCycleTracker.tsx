import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Calendar, Moon, Sun, Flower2, Droplets, Loader2 } from 'lucide-react';
import { CYCLE_PHASES, getResistanceMultiplier, type CyclePhase } from '@/utils/hormonalCycleModels';
import { format, subDays, addDays } from 'date-fns';

const PHASE_CONFIG: Record<CyclePhase, { icon: React.ReactNode; color: string; label: string }> = {
  menstrual: { icon: <Droplets className="h-4 w-4" />, color: 'bg-destructive/10 text-destructive', label: 'Menstrual' },
  follicular: { icon: <Flower2 className="h-4 w-4" />, color: 'bg-primary/10 text-primary', label: 'Follicular' },
  ovulation: { icon: <Sun className="h-4 w-4" />, color: 'bg-accent text-accent-foreground', label: 'Ovulation' },
  luteal: { icon: <Moon className="h-4 w-4" />, color: 'bg-warning/10 text-warning', label: 'Luteal' },
};

interface CycleLog {
  id: string;
  cycle_day: number;
  date: string;
  phase: CyclePhase;
  notes: string | null;
}

export default function HormonalCycleTracker() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase>('menstrual');
  const [cycleDay, setCycleDay] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchLogs = async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data } = await (supabase as any)
        .from('hormonal_cycle_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: false });
      setLogs((data as CycleLog[]) || []);
      setLoading(false);
    };
    fetchLogs();
  }, [user]);

  const handleLog = async () => {
    if (!user) return;
    setSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const { error } = await (supabase as any).from('hormonal_cycle_logs').upsert({
      user_id: user.id,
      cycle_day: cycleDay,
      date: today,
      phase: selectedPhase,
      notes: notes || null,
    }, { onConflict: 'user_id,date' });

    if (error) {
      toast.error('Failed to save cycle log');
    } else {
      toast.success('Cycle day logged');
      setNotes('');
      // Refresh
      const { data } = await (supabase as any)
        .from('hormonal_cycle_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', subDays(new Date(), 30).toISOString())
        .order('date', { ascending: false });
      setLogs((data as CycleLog[]) || []);
    }
    setSaving(false);
  };

  const todayLog = logs.find(l => l.date === format(new Date(), 'yyyy-MM-dd'));
  const currentPhase = todayLog?.phase || selectedPhase;
  const phaseInfo = CYCLE_PHASES[currentPhase];
  const resistanceMultiplier = getResistanceMultiplier(currentPhase);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Hormonal Cycle Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Phase Insights */}
        {todayLog && (
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              {PHASE_CONFIG[currentPhase].icon}
              <span className="font-medium">Current Phase: {PHASE_CONFIG[currentPhase].label}</span>
              <Badge variant="outline">Day {todayLog.cycle_day}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{phaseInfo.description}</p>
            <p className="text-sm mt-1">
              <strong>Insulin Resistance:</strong> {((resistanceMultiplier - 1) * 100).toFixed(0)}% {resistanceMultiplier > 1 ? 'increase' : 'baseline'}
            </p>
          </div>
        )}

        {/* Log Today */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Log Today</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Phase</label>
              <Select value={selectedPhase} onValueChange={(v) => setSelectedPhase(v as CyclePhase)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PHASE_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">{cfg.icon} {cfg.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Cycle Day</label>
              <input
                type="number"
                min={1}
                max={45}
                value={cycleDay}
                onChange={(e) => setCycleDay(parseInt(e.target.value) || 1)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <Textarea
            placeholder="Optional notes (symptoms, mood, energy level...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          <Button onClick={handleLog} disabled={saving} size="sm">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {todayLog ? 'Update Today' : 'Log Today'}
          </Button>
        </div>

        {/* Recent History */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recent History</h4>
            <div className="flex flex-wrap gap-1">
              {logs.slice(0, 14).map(log => (
                <div key={log.id} className="flex flex-col items-center gap-0.5">
                  <Badge className={`text-xs ${PHASE_CONFIG[log.phase as CyclePhase]?.color || ''}`}>
                    {log.cycle_day}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(log.date), 'M/d')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
