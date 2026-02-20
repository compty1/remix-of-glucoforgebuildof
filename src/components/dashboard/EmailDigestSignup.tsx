import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export function EmailDigestSignup() {
  const { user } = useAuthStore();
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .upsert({
          email: email.trim(),
          user_id: user?.id || null,
          subscription_type: 'weekly_digest',
          is_active: true,
        }, {
          onConflict: 'email,subscription_type',
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('Subscribed to weekly research digest!');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">You're subscribed!</h3>
            <p className="text-sm text-muted-foreground">
              Expect your first digest on Sunday with top T1D research.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Weekly Research Digest</CardTitle>
        </div>
        <CardDescription>
          Get the top T1D research papers with AI-generated summaries delivered to your inbox every Sunday.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleSubscribe} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Subscribe'
            )}
          </Button>
        </div>
        <div className="flex gap-2 mt-3">
          <Badge variant="secondary">Free</Badge>
          <Badge variant="secondary">Weekly</Badge>
          <Badge variant="secondary">Unsubscribe Anytime</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
