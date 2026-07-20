import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export type InsightTarget = 'discovery' | 'discovery_card' | 'research_item' | 'ai_connection';

const REASONS: { value: string; label: string }[] = [
  { value: 'inaccurate', label: 'Medically inaccurate' },
  { value: 'outdated', label: 'Outdated information' },
  { value: 'harmful', label: 'Potentially harmful advice' },
  { value: 'off_topic', label: 'Not relevant to T1D' },
  { value: 'source_broken', label: 'Broken or misleading source link' },
  { value: 'other', label: 'Other' },
];

interface Props {
  targetType: InsightTarget;
  targetId: string;
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'icon';
}

export function ReportInsightDialog({ targetType, targetId, variant = 'ghost', size = 'sm' }: Props) {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('inaccurate');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user?.id) {
      toast.error('Please sign in to report an insight.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('insight_reports').insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || 'Could not submit report.');
      return;
    }
    toast.success('Thank you — our team will review this insight.');
    setOpen(false);
    setDetails('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} aria-label="Report insight">
          <Flag className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-1">Report</span>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this insight</DialogTitle>
          <DialogDescription>
            Help us keep information accurate and safe. Reports are reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Reason</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REASONS.map((r) => (
                <div key={r.value} className="flex items-center gap-2">
                  <RadioGroupItem value={r.value} id={`r-${r.value}`} />
                  <Label htmlFor={`r-${r.value}`} className="font-normal">{r.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="report-details" className="mb-2 block">Additional details (optional)</Label>
            <Textarea
              id="report-details"
              value={details}
              maxLength={2000}
              placeholder="What's inaccurate or harmful about this insight?"
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit report'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}