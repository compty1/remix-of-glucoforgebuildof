import React, { useState, useEffect } from 'react';
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
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';
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
  BellOff
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
    weeklyReports: true
  });

  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    anonymousAnalytics: true,
    publicProfile: false,
    researchParticipation: true
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadNotificationPreferences();
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

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

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
          setNotifications(data.notification_preferences as typeof notifications);
        }
        if (data.privacy_settings) {
          setPrivacy(data.privacy_settings as typeof privacy);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadNotificationPreferences = () => {
    // Notification preferences are now loaded from the database in loadUserProfile
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
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
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile"
      });
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
      toast({
        title: "Success",
        description: "Notification preferences saved!"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save preferences"
      });
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
      toast({
        title: "Success",
        description: "Privacy settings saved!"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save privacy settings"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Delete user data from key tables before signing out
      const userId = user.id;
      await Promise.allSettled([
        supabase.from('profiles').delete().eq('user_id', userId),
        supabase.from('chat_sessions').delete().eq('user_id', userId),
        supabase.from('user_achievements').delete().eq('user_id', userId),
        supabase.from('user_streaks').delete().eq('user_id', userId),
        supabase.from('email_subscriptions').delete().eq('user_id', userId),
        supabase.from('notification_preferences').delete().eq('user_id', userId),
        supabase.from('notifications').delete().eq('user_id', userId),
        supabase.from('device_reviews').delete().eq('user_id', userId),
        supabase.from('user_dashboards').delete().eq('user_id', userId),
      ]);
      await signOut();
      toast({
        title: "Account Deleted",
        description: "Your data has been removed and you have been signed out."
      });
    } catch (error) {
      console.error('Account deletion error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete account"
      });
    } finally {
      setLoading(false);
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
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
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
                    <Input id="name" placeholder="Your display name" value={profile.displayName} onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ''} disabled />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact support if needed.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">T1D Diagnosis Date</Label>
                  <Input id="diagnosis" type="date" value={profile.diagnosisDate} onChange={(e) => setProfile(prev => ({ ...prev, diagnosisDate: e.target.value }))} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="device">Primary CGM</Label>
                    <Select value={profile.primaryCgm} onValueChange={(val) => setProfile(prev => ({ ...prev, primaryCgm: val }))}>
                      <SelectTrigger>
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
                      <SelectTrigger>
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

          {/* Notification Settings */}
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

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Delivery Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{user?.email || 'Not set'}</p>
                      </div>
                      <Switch 
                        checked={notifications.weeklyReports}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailDelivery: checked }))}
                      />
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Mobile app alerts</p>
                      </div>
                      <Switch 
                        checked={notifications.deviceAlerts}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushDelivery: checked }))}
                      />
                    </div>
                  </div>
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

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Security</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => {
                      toast({
                        title: "Change Password",
                        description: "Please use the Profile page to change your password.",
                      });
                    }}>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Shield className="h-4 w-4 mr-2" />
                      Two-Factor Authentication (Coming Soon)
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Eye className="h-4 w-4 mr-2" />
                      View Login Activity (Coming Soon)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Animations</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable smooth transitions and animations
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
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
                    <Button variant="outline" className="justify-start" onClick={() => toast({ title: "Coming Soon", description: "Data export will be available in a future update." })}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Glucose Data
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => toast({ title: "Coming Soon", description: "Data export will be available in a future update." })}>
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
                  <p className="text-sm text-muted-foreground italic">Storage usage tracking coming soon.</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => toast({ variant: "destructive", title: "Coming Soon", description: "Data deletion will be available in a future update." })}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
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

export default Settings;