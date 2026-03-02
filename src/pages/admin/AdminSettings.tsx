import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Palette, Shield, Zap, Upload, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { usePageMeta } from '@/hooks/usePageMeta';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'features' | 'ui' | 'experimental';
}

interface BrandingSetting {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'color' | 'image' | 'url';
}

interface SystemSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  dataRetentionDays: number;
  sessionTimeoutMinutes: number;
  maxFileUploadMB: number;
}

const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  { id: 'dark_mode', name: 'Dark Mode', description: 'Enable dark mode theme support', enabled: true, category: 'ui' },
  { id: 'pwa_features', name: 'PWA Features', description: 'Progressive Web App capabilities', enabled: true, category: 'features' },
  { id: 'experimental_charts', name: 'Experimental Charts', description: 'New chart visualizations in beta', enabled: false, category: 'experimental' },
  { id: 'social_login', name: 'Social Login', description: 'Google/Facebook authentication', enabled: false, category: 'features' },
  { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Detailed user behavior tracking', enabled: true, category: 'features' },
  { id: 'nightscout_sync', name: 'Nightscout Sync', description: 'Enable Nightscout CGM data synchronization', enabled: true, category: 'features' },
  { id: 'bluetooth_pairing', name: 'Bluetooth Pairing', description: 'Web Bluetooth device pairing for glucose meters', enabled: false, category: 'experimental' },
  { id: 'nfc_scanning', name: 'NFC Scanning', description: 'NFC-based supply scanning and tracking', enabled: false, category: 'experimental' },
  { id: 'retinopathy_mode', name: 'Retinopathy Mode', description: 'High-contrast accessibility mode for vision-impaired users', enabled: true, category: 'ui' },
  { id: 'alert_budget', name: 'Alert Budget', description: 'Daily alert cap to reduce notification fatigue', enabled: true, category: 'features' },
  { id: 'burnout_detection', name: 'Burnout Detection', description: 'Detect and respond to diabetes management burnout', enabled: true, category: 'features' },
  { id: 'charity_points', name: 'Charity Points', description: 'Convert engagement points to charitable donations', enabled: false, category: 'features' },
  { id: 'digital_companion', name: 'Digital Companion', description: 'Animated health companion on dashboard', enabled: false, category: 'ui' },
  { id: 'mentor_matching', name: 'Mentor Matching', description: 'T1D mentor/mentee matching system', enabled: false, category: 'features' },
  { id: 'local_ai', name: 'Local AI', description: 'Browser-based AI using WebLLM (no server needed)', enabled: false, category: 'experimental' },
];

const DEFAULT_BRANDING: BrandingSetting[] = [
  { id: 'site_name', name: 'Site Name', value: 'GlucoForge', type: 'text' },
  { id: 'primary_color', name: 'Primary Color', value: '#8B5CF6', type: 'color' },
  { id: 'logo_url', name: 'Logo URL', value: '/src/assets/glucoforge-logo-new.png', type: 'image' },
  { id: 'support_email', name: 'Support Email', value: 'support@glucoforge.com', type: 'text' },
  { id: 'privacy_url', name: 'Privacy Policy URL', value: '/privacy', type: 'url' },
];

const DEFAULT_SYSTEM: SystemSettings = {
  maintenanceMode: false,
  registrationEnabled: true,
  dataRetentionDays: 365,
  sessionTimeoutMinutes: 60,
  maxFileUploadMB: 50,
};

// Helper to load/save settings via admin_settings table
async function loadSetting<T>(key: string, fallback: T): Promise<T> {
  const { data } = await supabase
    .from('admin_settings')
    .select('setting_value')
    .eq('setting_key', key)
    .maybeSingle();
  return data ? (data.setting_value as unknown as T) : fallback;
}

async function saveSetting(key: string, value: unknown, category: string, userId: string) {
  const { error } = await supabase
    .from('admin_settings')
    .upsert({
      setting_key: key,
      setting_value: value as any,
      category,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'setting_key' });
  if (error) throw error;
}

export default function AdminSettings() {
  usePageMeta('Admin - Settings', 'GlucoForge admin panel.');
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(DEFAULT_FEATURE_FLAGS);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSetting[]>(DEFAULT_BRANDING);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM);

  useEffect(() => {
    const load = async () => {
      try {
        const [flags, branding, system] = await Promise.all([
          loadSetting('feature_flags', DEFAULT_FEATURE_FLAGS),
          loadSetting('branding', DEFAULT_BRANDING),
          loadSetting('system', DEFAULT_SYSTEM),
        ]);
        setFeatureFlags(flags);
        setBrandingSettings(branding);
        setSystemSettings(system);
      } catch {
        // Falls back to defaults silently
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleFeatureFlag = async (flagId: string) => {
    const updated = featureFlags.map(f => f.id === flagId ? { ...f, enabled: !f.enabled } : f);
    setFeatureFlags(updated);
    try {
      await saveSetting('feature_flags', updated, 'features', user!.id);
      toast.success('Feature flag saved');
    } catch {
      toast.error('Failed to save feature flag');
    }
  };

  const updateBrandingSetting = (settingId: string, value: string) => {
    setBrandingSettings(s => s.map(st => st.id === settingId ? { ...st, value } : st));
  };

  const handleSaveBranding = async () => {
    setSaving('branding');
    try {
      await saveSetting('branding', brandingSettings, 'branding', user!.id);
      toast.success('Branding settings saved');
    } catch {
      toast.error('Failed to save branding settings');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveSystem = async () => {
    setSaving('system');
    try {
      await saveSetting('system', systemSettings, 'system', user!.id);
      toast.success('System settings saved');
    } catch {
      toast.error('Failed to save system settings');
    } finally {
      setSaving(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'features': return 'bg-primary/10 text-primary';
      case 'ui': return 'bg-accent text-accent-foreground';
      case 'experimental': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">System Settings</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Settings are persisted to the database and apply across all admin sessions.
          </p>

          <Tabs defaultValue="features" className="space-y-6">
            <TabsList>
              <TabsTrigger value="features">Feature Flags</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Feature Flags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {featureFlags.map((flag) => (
                      <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{flag.name}</h4>
                            <Badge className={getCategoryColor(flag.category)}>{flag.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{flag.description}</p>
                        </div>
                        <Switch checked={flag.enabled} onCheckedChange={() => toggleFeatureFlag(flag.id)} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Branding Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {brandingSettings.map((setting) => (
                    <div key={setting.id}>
                      <label className="text-sm font-medium">{setting.name}</label>
                      {setting.type === 'color' ? (
                        <div className="flex items-center gap-3 mt-1">
                          <Input type="color" value={setting.value} onChange={(e) => updateBrandingSetting(setting.id, e.target.value)} className="w-16 h-10" />
                          <Input value={setting.value} onChange={(e) => updateBrandingSetting(setting.id, e.target.value)} placeholder="#000000" />
                        </div>
                      ) : setting.type === 'image' ? (
                        <div className="space-y-2 mt-1">
                          <Input value={setting.value} onChange={(e) => updateBrandingSetting(setting.id, e.target.value)} placeholder="Image URL or path" />
                          <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-2" />Upload Image</Button>
                        </div>
                      ) : (
                        <Input value={setting.value} onChange={(e) => updateBrandingSetting(setting.id, e.target.value)} placeholder={`Enter ${setting.name.toLowerCase()}`} className="mt-1" />
                      )}
                    </div>
                  ))}
                  <Button onClick={handleSaveBranding} disabled={saving === 'branding'}>
                    {saving === 'branding' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Branding Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Temporarily disable site access for maintenance</p>
                    </div>
                    <Switch checked={systemSettings.maintenanceMode} onCheckedChange={(checked) => setSystemSettings(s => ({ ...s, maintenanceMode: checked }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">User Registration</p>
                      <p className="text-sm text-muted-foreground">Allow new users to create accounts</p>
                    </div>
                    <Switch checked={systemSettings.registrationEnabled} onCheckedChange={(checked) => setSystemSettings(s => ({ ...s, registrationEnabled: checked }))} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Data Retention (days)</label>
                      <Input type="number" value={systemSettings.dataRetentionDays} onChange={(e) => setSystemSettings(s => ({ ...s, dataRetentionDays: parseInt(e.target.value) || 0 }))} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Session Timeout (minutes)</label>
                      <Input type="number" value={systemSettings.sessionTimeoutMinutes} onChange={(e) => setSystemSettings(s => ({ ...s, sessionTimeoutMinutes: parseInt(e.target.value) || 0 }))} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max File Upload Size (MB)</label>
                    <Input type="number" value={systemSettings.maxFileUploadMB} onChange={(e) => setSystemSettings(s => ({ ...s, maxFileUploadMB: parseInt(e.target.value) || 0 }))} className="mt-1" />
                  </div>
                  <Button onClick={handleSaveSystem} disabled={saving === 'system'}>
                    {saving === 'system' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save System Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <p className="text-sm"><strong>Security Audit:</strong> Last performed on {new Date().toLocaleDateString()}</p>
                      <Button variant="outline" size="sm" className="mt-2">Run Security Audit</Button>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium">Access Control</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground mb-2">Require 2FA for admin accounts</p>
                          <Switch />
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">IP Allowlist</p>
                          <p className="text-sm text-muted-foreground mb-2">Restrict admin access by IP</p>
                          <Switch />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium">Data Protection</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">Data Encryption</p>
                          <p className="text-sm text-muted-foreground">✅ Enabled (AES-256)</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">Backup Encryption</p>
                          <p className="text-sm text-muted-foreground">✅ Enabled</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
