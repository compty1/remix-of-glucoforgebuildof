import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Bell, 
  CheckCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useEmailSubscription } from '@/hooks/useEmailSubscription';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface WeeklyDigestSignupProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const WeeklyDigestSignup: React.FC<WeeklyDigestSignupProps> = ({ 
  variant = 'full',
  className = ''
}) => {
  const { user } = useAuthStore();
  const { subscription, loading, subscribe } = useEmailSubscription();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async () => {
    const emailToUse = user?.email || email.trim();
    
    if (!emailToUse) {
      toast({ 
        title: 'Email required', 
        description: 'Please enter your email address', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);
    const success = await subscribe(emailToUse, {
      include_trials: true,
      include_papers: true,
      min_impact: 'medium',
    });
    setIsSubmitting(false);

    if (success) {
      toast({ 
        title: '🎉 Subscribed!', 
        description: 'You\'ll receive weekly research digests every Sunday' 
      });
    } else {
      toast({ 
        title: 'Error', 
        description: 'Failed to subscribe. Please try again.', 
        variant: 'destructive' 
      });
    }
  };

  // Already subscribed state
  if (subscription?.is_active) {
    return (
      <Card className={`bg-success/5 border-success/20 ${className}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-success">Subscribed to Weekly Digest</p>
              <p className="text-sm text-muted-foreground">
                Next digest arrives Sunday • <Link to="/research" className="underline hover:text-foreground">Manage preferences</Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Checking subscription...</div>
        </CardContent>
      </Card>
    );
  }

  // Compact variant for dashboard widgets
  if (variant === 'compact') {
    return (
      <Card className={`bg-gradient-to-r from-highlight/5 to-primary/5 border-highlight/20 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-highlight/10">
              <Mail className="h-4 w-4 text-highlight" />
            </div>
            <div>
              <p className="font-medium text-sm">Weekly Research Digest</p>
              <p className="text-xs text-muted-foreground">Top T1D research, every Sunday</p>
            </div>
          </div>
          
          {user ? (
            <Button 
              size="sm" 
              className="w-full gap-2" 
              onClick={handleSubscribe}
              disabled={isSubmitting}
            >
              <Bell className="h-4 w-4" />
              {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 text-sm"
              />
              <Button 
                size="sm" 
                onClick={handleSubscribe}
                disabled={isSubmitting}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant for homepage
  return (
    <Card className={`bg-gradient-to-br from-highlight/10 via-primary/5 to-background border-highlight/20 overflow-hidden ${className}`}>
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Left side - Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-highlight/10">
                <Mail className="h-5 w-5 text-highlight" />
              </div>
              <Badge variant="outline" className="text-highlight border-highlight/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            <h3 className="text-xl font-bold mb-2">Get the Weekly Research Digest</h3>
            <p className="text-muted-foreground mb-3">
              Stay informed with curated T1D research, clinical trial updates, and community discoveries 
              delivered to your inbox every Sunday.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Top research papers</Badge>
              <Badge variant="secondary">Clinical trial updates</Badge>
              <Badge variant="secondary">AI summaries</Badge>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full md:w-auto md:min-w-[280px]">
            {user ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Subscribe with: <span className="font-medium text-foreground">{user.email}</span>
                </p>
                <Button 
                  className="w-full gap-2" 
                  onClick={handleSubscribe}
                  disabled={isSubmitting}
                >
                  <Bell className="h-4 w-4" />
                  {isSubmitting ? 'Subscribing...' : 'Subscribe to Weekly Digest'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
                <Button 
                  className="w-full gap-2" 
                  onClick={handleSubscribe}
                  disabled={isSubmitting}
                >
                  <Bell className="h-4 w-4" />
                  {isSubmitting ? 'Subscribing...' : 'Subscribe to Weekly Digest'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Free • Unsubscribe anytime • No spam
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
