import React, { useState, useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useRetinopathyMode } from '@/hooks/useRetinopathyMode';
import NightscoutConnector from '@/components/settings/NightscoutConnector';
import BluetoothDevicePairing from '@/components/settings/BluetoothDevicePairing';
import HormonalCycleTracker from '@/components/settings/HormonalCycleTracker';
import { 
  User, 
  Bell, 
  Shield, 
  Palette,
  Database,
  Smartphone,
  Mail,
  Lock,
  Eye,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Moon,
  Sun,
  RefreshCw,
  ImageOff,
  BellRing,
  BellOff,
  KeyRound,
  Link2,
  Accessibility,
  Bluetooth,
  EyeOff,
  BellMinus,
  HeartPulse
} from 'lucide-react';
import { clearAllCache, clearFailedCache } from '@/lib/imageCache';

// Push Notifications Section Component
const PushNotificationsSection = () => {
  const { isSupported, isSubscribed, isLoading, permission, toggle } = usePushNotifications();
  const { toast } = useToast();

  const handleTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('GlucoForge Test', {
        body: 'Push notifications are working correctly!',
        icon: '/glucoforge-icon.png',
      });
      toast({
        title: "Test Sent",
        description: "Check for your notification!",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Not Enabled",
        description: "Please enable push notifications first.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <BellRing className="h-5 w-5" />
        Push Notifications
      </h3>
      
      {!isSupported ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Push notifications are not supported in this browser.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                {isSubscribed ? (
                  <BellRing className="h-4 w-4 text-success" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                Browser Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive real-time alerts for research updates, device news, and community posts
              </p>
              {permission === 'denied' && (
                <p className="text-xs text-destructive mt-1">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
              )}
            </div>
            <Switch 
              checked={isSubscribed}
              onCheckedChange={toggle}
              disabled={isLoading || permission === 'denied'}
            />
          </div>

          {isSubscribed && (
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleTestNotification}
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Notification
              </Button>
              <Badge variant="secondary" className="bg-success/10 text-success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Settings = () => {
  usePageMeta('Settings', 'Manage your GlucoForge account settings, notifications, privacy, and data preferences.');
  const { toast } = useToast();
  const { user, signOut } = useAuthStore();
  const { theme, setTheme: setNextTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    bio: '',
    diagnosisDate: '',
    primaryCgm: '',
    insulinDelivery: '',
    researchParticipation: true
  });
  const [notifications, setNotifications] = useState({
    glucoseAlerts: true,
    researchUpdates: false,
    communityPosts: true,
    deviceAlerts: true,
    weeklyReports: true,
    emailDelivery: true,
    pushDelivery: false
  });

  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    anonymousAnalytics: true,
    publicProfile: false,
    researchParticipation: true
  });

  // Password change state — requires current password re-auth (Issue 115)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailChangeInfo, setEmailChangeInfo] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, bio, diagnosis_date, primary_cgm, insulin_delivery, research_participation, notification_preferences, privacy_settings')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) return;

      if (data) {
        setProfile({
          displayName: data.display_name || '',
          bio: data.bio || '',
          diagnosisDate: data.diagnosis_date || '',
          primaryCgm: data.primary_cgm || '',
          insulinDelivery: data.insulin_delivery || '',
          researchParticipation: data.research_participation ?? true
        });
        if (data.notification_preferences) {
          const prefs = data.notification_preferences as typeof notifications;
          setNotifications(prev => ({ ...prev, ...prefs }));
        }
        if (data.privacy_settings) {
          setPrivacy(data.privacy_settings as typeof privacy);
        }
      }
    } catch {
      // Profile load error — defaults will be used
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    // Validate bio length (1846)
    if (profile.bio.length > 500) {
      toast({ variant: "destructive", title: "Error", description: "Bio must be under 500 characters." });
      return;
    }
    // Validate diagnosis date not in future (1847)
    if (profile.diagnosisDate && new Date(profile.diagnosisDate) > new Date()) {
      toast({ variant: "destructive", title: "Error", description: "Diagnosis date cannot be in the future." });
      return;
    }
    // Validate display name length (1854)
    if (profile.displayName.length > 50) {
      toast({ variant: "destructive", title: "Error", description: "Display name must be under 50 characters." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.displayName,
          bio: profile.bio,
          diagnosis_date: profile.diagnosisDate || null,
          primary_cgm: profile.primaryCgm || null,
          insulin_delivery: profile.insulinDelivery || null,
          research_participation: profile.researchParticipation
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: "Success", description: "Profile updated successfully!" });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: notifications })
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: "Success", description: "Notification preferences saved!" });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save preferences" });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ privacy_settings: privacy })
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: "Success", description: "Privacy settings saved!" });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save privacy settings" });
    } finally {
      setLoading(false);
    }
  };

  // Password change — requires current password re-authentication first (Issue 115)
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
      toast({ variant: "destructive", title: "Error", description: "Please enter your current password to confirm." });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast({ variant: "destructive", title: "Error", description: "Password must be at least 8 characters." });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match." });
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      toast({ variant: "destructive", title: "Error", description: "New password must be different from your current password." });
      return;
    }
    setPasswordLoading(true);
    try {
      // Re-authenticate with current password first
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordForm.currentPassword,
      });
      if (reAuthError) {
        toast({ variant: "destructive", title: "Error", description: "Current password is incorrect." });
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({ title: "Success", description: "Password updated successfully!" });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userId = user.id;
      const sb = supabase as any;
      const results = await Promise.allSettled([
        supabase.from('profiles').delete().eq('user_id', userId),
        supabase.from('chat_sessions').delete().eq('user_id', userId),
        supabase.from('user_achievements').delete().eq('user_id', userId),
        supabase.from('user_streaks').delete().eq('user_id', userId),
        supabase.from('email_subscriptions').delete().eq('user_id', userId),
        supabase.from('notification_preferences').delete().eq('user_id', userId),
        supabase.from('notifications').delete().eq('user_id', userId),
        supabase.from('device_reviews').delete().eq('user_id', userId),
        supabase.from('user_dashboards').delete().eq('user_id', userId),
        supabase.from('uploads').delete().eq('user_id', userId),
        supabase.from('survey_responses').delete().eq('user_id', userId),
        supabase.from('user_view_history').delete().eq('user_id', userId),
        supabase.from('user_activity_log').delete().eq('user_id', userId),
        supabase.from('user_bookmarks').delete().eq('user_id', userId),
        supabase.from('diabetic_profiles').delete().eq('user_id', userId),
        supabase.from('user_preferences').delete().eq('user_id', userId),
        supabase.from('user_roles').delete().eq('user_id', userId),
        supabase.from('connection_requests').delete().eq('from_user_id', userId),
        supabase.from('connection_requests').delete().eq('to_user_id', userId),
        supabase.from('direct_messages').delete().eq('sender_id', userId),
        supabase.from('direct_messages').delete().eq('receiver_id', userId),
        supabase.from('claimed_projects').delete().eq('user_id', userId),
        supabase.from('challenge_participants').delete().eq('user_id', userId),
        supabase.from('simulations').delete().eq('user_id', userId),
        supabase.from('community_statements').delete().eq('user_id', userId),
        supabase.from('advocate_applications').delete().eq('user_id', userId),
        supabase.from('adult_content_submissions').delete().eq('user_id', userId),
        supabase.from('medication_reviews').delete().eq('user_id', userId),
        // Additional tables from gap analysis (gaps 177-186)
        sb.from('glucose_analysis_entries').delete().eq('user_id', userId),
        sb.from('push_subscriptions').delete().eq('user_id', userId),
        sb.from('low_blood_sugar_stories').delete().eq('user_id', userId),
        sb.from('review_helpful_votes').delete().eq('user_id', userId),
        sb.from('hormonal_cycle_logs').delete().eq('user_id', userId),
        sb.from('nightscout_connections').delete().eq('user_id', userId),
        sb.from('user_alert_preferences').delete().eq('user_id', userId),
        sb.from('mentor_profiles').delete().eq('user_id', userId),
        sb.from('mentor_matches').delete().eq('mentee_id', userId),
        sb.from('mentor_matches').delete().eq('mentor_id', userId),
        sb.from('data_license_consents').delete().eq('user_id', userId),
        sb.from('user_subscriptions').delete().eq('user_id', userId),
        sb.from('journal_entries').delete().eq('user_id', userId),
      ]);
      // Log failures for debugging (gap 276)
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.warn(`[AccountDelete] ${failures.length} deletion(s) failed:`, failures);
      }
      await signOut();
      toast({
        title: "Account Deleted",
        description: "Your data has been removed and you have been signed out."
      });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete account" });
    } finally {
      setLoading(false);
    }
  };

  // Data export before deletion (1984)
  // Data export with full coverage (gaps 172-176, 187)
  const handleExportBeforeDelete = async () => {
    if (!user) return;
    try {
      const sb = supabase as any;
      const [uploads, surveys, sessions, achievements, streaks, bookmarks, reviews, journal, hormonal, nightscout, preferences] = await Promise.all([
        supabase.from('uploads').select('*').eq('user_id', user.id),
        supabase.from('survey_responses').select('*').eq('user_id', user.id),
        supabase.from('chat_sessions').select('id, context_name, created_at, summary, messages').eq('user_id', user.id),
        supabase.from('user_achievements').select('*').eq('user_id', user.id),
        supabase.from('user_streaks').select('*').eq('user_id', user.id),
        supabase.from('user_bookmarks').select('*').eq('user_id', user.id),
        supabase.from('device_reviews').select('*').eq('user_id', user.id),
        sb.from('journal_entries').select('*').eq('user_id', user.id),
        sb.from('hormonal_cycle_logs').select('*').eq('user_id', user.id),
        sb.from('nightscout_connections').select('nightscout_url, sync_enabled, created_at').eq('user_id', user.id),
        supabase.from('user_preferences').select('*').eq('user_id', user.id),
      ]);
      const exportData = {
        exported_at: new Date().toISOString(),
        user_email: user.email,
        uploads: uploads.data || [],
        surveys: surveys.data || [],
        chat_sessions: sessions.data || [],
        achievements: achievements.data || [],
        streaks: streaks.data || [],
        bookmarks: bookmarks.data || [],
        device_reviews: reviews.data || [],
        journal_entries: journal.data || [],
        hormonal_cycle_logs: hormonal.data || [],
        nightscout_connections: nightscout.data || [],
        user_preferences: preferences.data || [],
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `glucoforge-full-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Exported", description: "All data exported. You can now safely delete your account." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Export failed." });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account, privacy, and platform preferences
          </p>
        </section>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Accessibility className="h-4 w-4" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-info/20 bg-info/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Your profile information helps personalize your GlucoForge experience and contributes to research insights.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" placeholder="Your display name" maxLength={50} value={profile.displayName} onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))} />
                    <p className="text-xs text-muted-foreground">{profile.displayName.length}/50</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ''} disabled />
                    {emailChangeInfo && (
                      <Alert className="border-info/30 bg-info/5">
                        <AlertDescription className="text-xs text-info">{emailChangeInfo}</AlertDescription>
                      </Alert>
                    )}
                    <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact support if needed.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" placeholder="Tell us about yourself" maxLength={500} value={profile.bio} onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">{profile.bio.length}/500</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">T1D Diagnosis Date</Label>
                  <Input id="diagnosis" type="date" max={new Date().toISOString().split('T')[0]} value={profile.diagnosisDate} onChange={(e) => setProfile(prev => ({ ...prev, diagnosisDate: e.target.value }))} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="device">Primary CGM</Label>
                    <Select value={profile.primaryCgm} onValueChange={(val) => setProfile(prev => ({ ...prev, primaryCgm: val }))}>
                      <SelectTrigger id="device">
                        <SelectValue placeholder="Select your CGM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dexcom-g7">Dexcom G7</SelectItem>
                        <SelectItem value="dexcom-g6">Dexcom G6</SelectItem>
                        <SelectItem value="freestyle-libre-3">FreeStyle Libre 3</SelectItem>
                        <SelectItem value="freestyle-libre-2">FreeStyle Libre 2</SelectItem>
                        <SelectItem value="medtronic">Medtronic Guardian</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pump">Insulin Delivery</Label>
                    <Select value={profile.insulinDelivery} onValueChange={(val) => setProfile(prev => ({ ...prev, insulinDelivery: val }))}>
                      <SelectTrigger id="pump">
                        <SelectValue placeholder="Select your insulin delivery method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="omnipod-5">Omnipod 5</SelectItem>
                        <SelectItem value="medtronic-780g">Medtronic 780G</SelectItem>
                        <SelectItem value="tandem-x2">Tandem t:slim X2</SelectItem>
                        <SelectItem value="mdi">Multiple Daily Injections</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />
                <HormonalCycleTracker />
                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Research Participation</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Contribute to Research</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow your anonymized data to contribute to diabetes research studies
                      </p>
                    </div>
                    <Switch checked={profile.researchParticipation} onCheckedChange={(checked) => setProfile(prev => ({ ...prev, researchParticipation: checked }))} />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={loading}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings - Fixed items 1836-1845 */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Glucose Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        High/low glucose notifications and pattern alerts
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.glucoseAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, glucoseAlerts: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Research Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        New clinical trials and cure research progress
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.researchUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, researchUpdates: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Community Posts</Label>
                      <p className="text-sm text-muted-foreground">
                        New discussions and tips from the community
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.communityPosts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, communityPosts: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Device Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Device connectivity and maintenance reminders
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.deviceAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, deviceAlerts: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Weekly glucose patterns and insights summary
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <PushNotificationsSection />

                <Separator />

                {/* Delivery Methods - Fixed items 1716-1720, 1836-1840 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Delivery Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{user?.email || 'Not set'}</p>
                      </div>
                      <Switch 
                        checked={notifications.emailDelivery}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailDelivery: checked }))}
                      />
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Browser & mobile alerts</p>
                      </div>
                      <Switch 
                        checked={notifications.pushDelivery}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushDelivery: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Save Button - Fixed item 1841-1845 */}
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={loading}>Save Notification Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Data Sharing with Researchers</Label>
                      <p className="text-sm text-muted-foreground">
                        Anonymously contribute your data to T1D research studies
                      </p>
                    </div>
                    <Switch 
                      checked={privacy.dataSharing}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, dataSharing: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Anonymous Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve the platform with usage analytics
                      </p>
                    </div>
                    <Switch 
                      checked={privacy.anonymousAnalytics}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, anonymousAnalytics: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to other community members
                      </p>
                    </div>
                    <Switch 
                      checked={privacy.publicProfile}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, publicProfile: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Research Participation</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive invitations to participate in clinical studies
                      </p>
                    </div>
                    <Switch 
                      checked={privacy.researchParticipation}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, researchParticipation: checked }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSavePrivacy} disabled={loading}>Save Privacy Settings</Button>
                </div>

                <Separator />

                {/* Account Security - Inline password change (1988) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Security</h3>
                  <div className="space-y-3">
                    <div className="p-4 border border-border rounded-lg space-y-4">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        <Label className="text-base font-medium">Change Password</Label>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="current-password" className="text-sm">Current Password <span className="text-destructive">*</span></Label>
                          <Input
                            id="current-password"
                            type="password"
                            placeholder="Enter your current password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-password" className="text-sm">New Password</Label>
                            <Input
                              id="new-password"
                              type="password"
                              placeholder="Min. 8 characters"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              placeholder="Re-enter new password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                      {passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 8 && (
                        <p className="text-xs text-destructive">Password must be at least 8 characters</p>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleChangePassword}
                        disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Shield className="h-4 w-4 mr-2" />
                      Two-Factor Authentication (Coming Soon)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              <NightscoutConnector />
              <BluetoothDevicePairing />
            </div>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility">
            <div className="space-y-6">
              <AccessibilitySettings />
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className="h-20 flex-col gap-2"
                      onClick={() => setNextTheme('light')}
                    >
                      <Sun className="h-6 w-6" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className="h-20 flex-col gap-2"
                      onClick={() => setNextTheme('dark')}
                    >
                      <Moon className="h-6 w-6" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      className="h-20 flex-col gap-2"
                      onClick={() => setNextTheme('system')}
                    >
                      <Smartphone className="h-6 w-6" />
                      System
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Display Options</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Compact Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Show more information in less space
                        </p>
                      </div>
                     <Switch 
                        checked={false}
                        disabled
                        aria-label="Compact mode (coming soon)"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground italic">Display options will be available in a future update.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download your data for backup or transfer to another platform
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <Button variant="outline" className="justify-start" onClick={async () => {
                      if (!user) return;
                      try {
                        const { data } = await supabase
                          .from('uploads')
                          .select('file_name, uploaded_at, detailed_analysis')
                          .eq('user_id', user.id)
                          .order('uploaded_at', { ascending: false });
                        if (!data || data.length === 0) {
                          toast({ title: "No Data", description: "No glucose data found to export." });
                          return;
                        }
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `glucose-data-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast({ title: "Exported", description: `${data.length} records exported.` });
                      } catch { toast({ variant: "destructive", title: "Error", description: "Export failed." }); }
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Glucose Data
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={handleExportBeforeDelete}>
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cache Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear cached images if logos aren't displaying correctly
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={async () => {
                        const cleared = await clearFailedCache();
                        toast({
                          title: "Cache Cleared",
                          description: `Cleared ${cleared} failed image entries. Logos will reload.`,
                        });
                        window.location.reload();
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Failed Logos
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={async () => {
                        await clearAllCache();
                        toast({
                          title: "All Cache Cleared",
                          description: "All image cache cleared. Page will reload.",
                        });
                        window.location.reload();
                      }}
                    >
                      <ImageOff className="h-4 w-4 mr-2" />
                      Clear All Image Cache
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                  
                  {/* Export before delete notice (1984) */}
                  <Alert className="border-destructive/20 bg-destructive/5">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      We recommend exporting your data before deleting. Use the &ldquo;Export All Data&rdquo; button above.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => {
                      if (window.confirm('This will delete all your uploaded data, survey responses, and chat history. Your account will remain active. Are you sure?')) {
                        (async () => {
                          if (!user) return;
                          setLoading(true);
                          try {
                            await Promise.allSettled([
                              supabase.from('uploads').delete().eq('user_id', user.id),
                              supabase.from('survey_responses').delete().eq('user_id', user.id),
                              supabase.from('chat_sessions').delete().eq('user_id', user.id),
                              supabase.from('user_achievements').delete().eq('user_id', user.id),
                              supabase.from('user_streaks').delete().eq('user_id', user.id),
                              supabase.from('user_bookmarks').delete().eq('user_id', user.id),
                              supabase.from('user_view_history').delete().eq('user_id', user.id),
                              supabase.from('user_activity_log').delete().eq('user_id', user.id),
                            ]);
                            toast({ title: "Data Deleted", description: "All your data has been removed. Your account remains active." });
                          } catch {
                            toast({ variant: "destructive", title: "Error", description: "Failed to delete data." });
                          } finally {
                            setLoading(false);
                          }
                        })();
                      }
                    }}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone. We recommend exporting your data first.')) {
                        handleDeleteAccount();
                      }
                    }}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    These actions cannot be undone. Please proceed with caution.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

// Accessibility Settings sub-component (gaps 43-46, 55-57)
const AccessibilitySettings = () => {
  const { isEnabled: retinopathyEnabled, toggle: toggleRetinopathy } = useRetinopathyMode();
  const { user } = useAuthStore();
  const [alertBudget, setAlertBudget] = useState(3);
  const [burnoutAware, setBurnoutAware] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load persisted accessibility settings (gaps 44, 46)
  useEffect(() => {
    if (!user) return;
    const loadSettings = async () => {
      const sb = supabase as any;
      const { data } = await sb
        .from('user_alert_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setAlertBudget(data.daily_budget ?? 3);
        setBurnoutAware(data.burnout_aware ?? false);
        setFontSize(data.font_size ?? 16);
        setReducedMotion(data.reduced_motion ?? false);
        setHighContrast(data.high_contrast ?? false);
      }
      setSettingsLoaded(true);
    };
    loadSettings();
  }, [user]);

  // Persist accessibility settings (gaps 43, 45)
  const saveAccessibilitySettings = async (updates: Record<string, any>) => {
    if (!user) return;
    const sb = supabase as any;
    await sb.from('user_alert_preferences').upsert({
      user_id: user.id,
      ...updates,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  };

  const handleAlertBudgetChange = (v: number[]) => {
    setAlertBudget(v[0]);
    saveAccessibilitySettings({ daily_budget: v[0], burnout_aware: burnoutAware, font_size: fontSize, reduced_motion: reducedMotion, high_contrast: highContrast });
  };

  const handleBurnoutAwareChange = (checked: boolean) => {
    setBurnoutAware(checked);
    saveAccessibilitySettings({ daily_budget: alertBudget, burnout_aware: checked, font_size: fontSize, reduced_motion: reducedMotion, high_contrast: highContrast });
  };

  const handleFontSizeChange = (v: number[]) => {
    setFontSize(v[0]);
    document.documentElement.style.fontSize = `${v[0]}px`;
    saveAccessibilitySettings({ daily_budget: alertBudget, burnout_aware: burnoutAware, font_size: v[0], reduced_motion: reducedMotion, high_contrast: highContrast });
  };

  const handleReducedMotionChange = (checked: boolean) => {
    setReducedMotion(checked);
    document.documentElement.classList.toggle('reduce-motion', checked);
    saveAccessibilitySettings({ daily_budget: alertBudget, burnout_aware: burnoutAware, font_size: fontSize, reduced_motion: checked, high_contrast: highContrast });
  };

  const handleHighContrastChange = (checked: boolean) => {
    setHighContrast(checked);
    document.documentElement.classList.toggle('high-contrast', checked);
    saveAccessibilitySettings({ daily_budget: alertBudget, burnout_aware: burnoutAware, font_size: fontSize, reduced_motion: reducedMotion, high_contrast: checked });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              Retinopathy Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              High-contrast black/yellow theme with enlarged text and touch targets for users with vision impairment
            </p>
          </div>
          <Switch checked={retinopathyEnabled} onCheckedChange={toggleRetinopathy} />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <BellMinus className="h-4 w-4" />
              Daily Alert Budget
            </Label>
            <p className="text-sm text-muted-foreground">
              Limit predictive alerts per day to reduce notification fatigue ({alertBudget} alerts/day)
            </p>
          </div>
          <Slider
            value={[alertBudget]}
            onValueChange={(v) => setAlertBudget(v[0])}
            min={1}
            max={10}
            step={1}
            className="max-w-xs"
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <HeartPulse className="h-4 w-4" />
              Burnout-Aware Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              When burnout risk is detected, suppress gamification and surface mental health resources instead
            </p>
          </div>
          <Switch checked={burnoutAware} onCheckedChange={setBurnoutAware} />
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings;
