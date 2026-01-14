import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Bell, 
  BellOff, 
  CheckCircle,
  Settings,
  Sparkles
} from 'lucide-react';
import { useEmailSubscription } from '@/hooks/useEmailSubscription';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';

export const EmailSubscriptionForm: React.FC = () => {
  const { user } = useAuthStore();
  const { subscription, loading, subscribe, unsubscribe, updatePreferences } = useEmailSubscription();
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    include_trials: true,
    include_papers: true,
    min_impact: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast({ title: 'Email required', description: 'Please enter your email address', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const success = await subscribe(email, preferences);
    setIsSubmitting(false);

    if (success) {
      toast({ title: 'Subscribed!', description: 'You\'ll receive weekly research digests' });
    } else {
      toast({ title: 'Error', description: 'Failed to subscribe. Please try again.', variant: 'destructive' });
    }
  };

  const handleUnsubscribe = async () => {
    setIsSubmitting(true);
    const success = await unsubscribe();
    setIsSubmitting(false);

    if (success) {
      toast({ title: 'Unsubscribed', description: 'You will no longer receive weekly digests' });
    }
  };

  const handleUpdatePreferences = async () => {
    setIsSubmitting(true);
    const success = await updatePreferences(preferences);
    setIsSubmitting(false);

    if (success) {
      toast({ title: 'Preferences updated', description: 'Your digest preferences have been saved' });
    }
  };

  if (!user) {
    return (
      <Card className="command-center-widget">
        <CardContent className="p-6">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Please sign in to subscribe to the weekly research digest.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="command-center-widget">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading subscription...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="command-center-widget">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-highlight" />
            <CardTitle>Weekly Research Digest</CardTitle>
          </div>
          {subscription?.is_active && (
            <Badge className="bg-success/10 text-success">
              <CheckCircle className="h-3 w-3 mr-1" />
              Subscribed
            </Badge>
          )}
        </div>
        <CardDescription>
          Get the top research papers with AI summaries delivered to your inbox every Sunday
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feature highlights */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-highlight border-highlight/30">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-powered TLDR summaries
          </Badge>
          <Badge variant="outline">Top 5-10 papers weekly</Badge>
          <Badge variant="outline">Citation metrics included</Badge>
        </div>

        {subscription?.is_active ? (
          <>
            {/* Preferences Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Digest Preferences</span>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-papers">Include research papers</Label>
                  <Switch
                    id="include-papers"
                    checked={preferences.include_papers}
                    onCheckedChange={(checked) => 
                      setPreferences(p => ({ ...p, include_papers: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-trials">Include clinical trials</Label>
                  <Switch
                    id="include-trials"
                    checked={preferences.include_trials}
                    onCheckedChange={(checked) => 
                      setPreferences(p => ({ ...p, include_trials: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="min-impact">Minimum impact level</Label>
                  <Select
                    value={preferences.min_impact}
                    onValueChange={(value) => 
                      setPreferences(p => ({ ...p, min_impact: value }))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleUpdatePreferences}
                  disabled={isSubmitting}
                >
                  Save Preferences
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive"
                  onClick={handleUnsubscribe}
                  disabled={isSubmitting}
                >
                  <BellOff className="h-4 w-4 mr-2" />
                  Unsubscribe
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Subscribed email: {subscription.email}
              {subscription.last_sent_at && (
                <span> • Last digest: {new Date(subscription.last_sent_at).toLocaleDateString()}</span>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Subscribe Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-papers-new">Include research papers</Label>
                  <Switch
                    id="include-papers-new"
                    checked={preferences.include_papers}
                    onCheckedChange={(checked) => 
                      setPreferences(p => ({ ...p, include_papers: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-trials-new">Include clinical trials</Label>
                  <Switch
                    id="include-trials-new"
                    checked={preferences.include_trials}
                    onCheckedChange={(checked) => 
                      setPreferences(p => ({ ...p, include_trials: checked }))
                    }
                  />
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleSubscribe}
                disabled={isSubmitting}
              >
                <Bell className="h-4 w-4 mr-2" />
                Subscribe to Weekly Digest
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
