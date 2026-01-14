import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Globe, Palette, Shield, Zap, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

export default function AdminSettings() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    {
      id: 'dark_mode',
      name: 'Dark Mode',
      description: 'Enable dark mode theme support',
      enabled: true,
      category: 'ui'
    },
    {
      id: 'pwa_features',
      name: 'PWA Features',
      description: 'Progressive Web App capabilities',
      enabled: true,
      category: 'features'
    },
    {
      id: 'experimental_charts',
      name: 'Experimental Charts',
      description: 'New chart visualizations in beta',
      enabled: false,
      category: 'experimental'
    },
    {
      id: 'social_login',
      name: 'Social Login',
      description: 'Google/Facebook authentication',
      enabled: false,
      category: 'features'
    },
    {
      id: 'advanced_analytics',
      name: 'Advanced Analytics',
      description: 'Detailed user behavior tracking',
      enabled: true,
      category: 'features'
    }
  ]);

  const [brandingSettings, setBrandingSettings] = useState<BrandingSetting[]>([
    {
      id: 'site_name',
      name: 'Site Name',
      value: 'GlucoForge',
      type: 'text'
    },
    {
      id: 'primary_color',
      name: 'Primary Color',
      value: '#8B5CF6',
      type: 'color'
    },
    {
      id: 'logo_url',
      name: 'Logo URL',
      value: '/src/assets/glucoforge-logo.svg',
      type: 'image'
    },
    {
      id: 'support_email',
      name: 'Support Email',
      value: 'support@glucoforge.com',
      type: 'text'
    },
    {
      id: 'privacy_url',
      name: 'Privacy Policy URL',
      value: '/privacy',
      type: 'url'
    }
  ]);

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    dataRetentionDays: 365,
    sessionTimeoutMinutes: 60,
    maxFileUploadMB: 50
  });

  const toggleFeatureFlag = (flagId: string) => {
    setFeatureFlags(flags => 
      flags.map(flag => 
        flag.id === flagId 
          ? { ...flag, enabled: !flag.enabled }
          : flag
      )
    );
    toast.success('Feature flag updated');
  };

  const updateBrandingSetting = (settingId: string, value: string) => {
    setBrandingSettings(settings =>
      settings.map(setting =>
        setting.id === settingId
          ? { ...setting, value }
          : setting
      )
    );
  };

  const saveBrandingSettings = () => {
    toast.success('Branding settings saved successfully');
  };

  const saveSystemSettings = () => {
    toast.success('System settings saved successfully');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'features':
        return 'bg-blue-100 text-blue-800';
      case 'ui':
        return 'bg-purple-100 text-purple-800';
      case 'experimental':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-8">
            System Settings
          </h1>

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
                            <Badge className={getCategoryColor(flag.category)}>
                              {flag.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {flag.description}
                          </p>
                        </div>
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => toggleFeatureFlag(flag.id)}
                        />
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
                          <Input
                            type="color"
                            value={setting.value}
                            onChange={(e) => updateBrandingSetting(setting.id, e.target.value)}
                            className="w-16 h-10"
                          />
                          <Input
                            value={setting.value}
                            onChange={(e) => updateBrandingSetting(setting.id, e.target.value)}
                            placeholder="#000000"
                          />
                        </div>
                      ) : setting.type === 'image' ? (
                        <div className="space-y-2 mt-1">
                          <Input
                            value={setting.value}
                            onChange={(e) => updateBrandingSetting(setting.id, e.target.value)}
                            placeholder="Image URL or path"
                          />
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </Button>
                        </div>
                      ) : (
                        <Input
                          value={setting.value}
                          onChange={(e) => updateBrandingSetting(setting.id, e.target.value)}
                          placeholder={`Enter ${setting.name.toLowerCase()}`}
                          className="mt-1"
                        />
                      )}
                    </div>
                  ))}
                  
                  <Button onClick={saveBrandingSettings}>
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
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable site access for maintenance
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setSystemSettings({...systemSettings, maintenanceMode: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">User Registration</p>
                      <p className="text-sm text-muted-foreground">
                        Allow new users to create accounts
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.registrationEnabled}
                      onCheckedChange={(checked) =>
                        setSystemSettings({...systemSettings, registrationEnabled: checked})
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Data Retention (days)</label>
                      <Input
                        type="number"
                        value={systemSettings.dataRetentionDays}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          dataRetentionDays: parseInt(e.target.value)
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Session Timeout (minutes)</label>
                      <Input
                        type="number"
                        value={systemSettings.sessionTimeoutMinutes}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          sessionTimeoutMinutes: parseInt(e.target.value)
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Max File Upload Size (MB)</label>
                    <Input
                      type="number"
                      value={systemSettings.maxFileUploadMB}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        maxFileUploadMB: parseInt(e.target.value)
                      })}
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={saveSystemSettings}>
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
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm">
                        <strong>Security Audit:</strong> Last performed on {new Date().toLocaleDateString()}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Run Security Audit
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Access Control</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Require 2FA for admin accounts
                          </p>
                          <Switch />
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">IP Allowlist</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Restrict admin access by IP
                          </p>
                          <Switch />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Data Protection</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">Data Encryption</p>
                          <p className="text-sm text-muted-foreground">
                            ✅ Enabled (AES-256)
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">Backup Encryption</p>
                          <p className="text-sm text-muted-foreground">
                            ✅ Enabled
                          </p>
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