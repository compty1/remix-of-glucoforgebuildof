import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, LogOut, Link2, Unlink, Mail, ShieldCheck } from 'lucide-react';

type ProviderKey = 'google' | 'apple';

const PROVIDERS: { key: ProviderKey; label: string; icon: string }[] = [
  { key: 'google', label: 'Google', icon: 'G' },
  { key: 'apple', label: 'Apple', icon: '' },
];

interface Identity {
  id: string;
  identity_id?: string;
  provider: string;
  email?: string;
  created_at?: string;
}

export function ConnectedAccounts() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const loadIdentities = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUserIdentities();
      if (error) throw error;
      setIdentities((data?.identities ?? []) as Identity[]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadIdentities();
  }, [user, loadIdentities]);

  const linkedProviders = new Set(identities.map((i) => i.provider));
  const emailIdentity = identities.find((i) => i.provider === 'email');

  const handleLink = async (provider: ProviderKey) => {
    setBusyProvider(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/settings?tab=privacy`,
      });
      if (result.error) throw result.error;
      // If redirected, browser navigates away
    } catch (err: any) {
      toast.error(err?.message || `Failed to link ${provider}`);
      setBusyProvider(null);
    }
  };

  const handleUnlink = async (identity: Identity) => {
    if (identities.length <= 1) {
      toast.error('You must keep at least one sign-in method');
      return;
    }
    setBusyProvider(identity.provider);
    try {
      const { error } = await supabase.auth.unlinkIdentity(identity as any);
      if (error) throw error;
      toast.success(`Disconnected ${identity.provider}`);
      await loadIdentities();
    } catch (err: any) {
      toast.error(err?.message || `Failed to unlink ${identity.provider}`);
    } finally {
      setBusyProvider(null);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success('Signed out');
      navigate('/');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Account & Sign-in Methods
        </CardTitle>
        <CardDescription>
          Manage how you sign in to your account. Keep at least one method connected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Email identity (read-only) */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email & Password</p>
                  <p className="text-sm text-muted-foreground">
                    {emailIdentity?.email || user?.email || 'Not set'}
                  </p>
                </div>
              </div>
              {emailIdentity ? (
                <Badge variant="secondary">Connected</Badge>
              ) : (
                <Badge variant="outline">Not connected</Badge>
              )}
            </div>

            {PROVIDERS.map(({ key, label }) => {
              const linked = linkedProviders.has(key);
              const identity = identities.find((i) => i.provider === key);
              const isBusy = busyProvider === key;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-semibold">
                      {key === 'google' ? 'G' : ''}
                    </div>
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        {linked ? identity?.email || 'Connected' : `Sign in with ${label}`}
                      </p>
                    </div>
                  </div>
                  {linked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => identity && handleUnlink(identity)}
                      disabled={isBusy || identities.length <= 1}
                    >
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Unlink className="h-4 w-4 mr-2" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleLink(key)}
                      disabled={isBusy}
                    >
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Link2 className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Sign out of this device</p>
            <p className="text-sm text-muted-foreground">
              End your current session. You'll need to sign in again.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ConnectedAccounts;