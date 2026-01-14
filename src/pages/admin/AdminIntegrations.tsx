import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Webhook, Mail, Database, CheckCircle, XCircle, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Integration {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  icon: React.ReactNode;
  settings?: Record<string, any>;
}

export default function AdminIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      name: 'Stripe',
      status: 'connected',
      description: 'Payment processing for donations',
      icon: <CreditCard className="h-6 w-6" />,
      settings: { testMode: true }
    },
    {
      name: 'Supabase',
      status: 'connected',
      description: 'Database and authentication',
      icon: <Database className="h-6 w-6" />,
    },
    {
      name: 'Email Service',
      status: 'disconnected',
      description: 'Email notifications and newsletters',
      icon: <Mail className="h-6 w-6" />,
    },
    {
      name: 'Webhooks',
      status: 'connected',
      description: 'Real-time event notifications',
      icon: <Webhook className="h-6 w-6" />,
    }
  ]);

  const [webhookLogs, setWebhookLogs] = useState([
    {
      id: '1',
      event: 'checkout.session.completed',
      status: 'success',
      timestamp: new Date().toISOString(),
      payload: { amount: 5000, customer: 'cus_123' }
    },
    {
      id: '2',
      event: 'payment_intent.succeeded',
      status: 'success',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      payload: { amount: 2500, customer: 'cus_456' }
    }
  ]);

  const [stripeSettings, setStripeSettings] = useState({
    testMode: true,
    publishableKey: 'pk_test_...',
    secretKey: '••••••••',
    webhookSecret: '••••••••'
  });

  const handleTestStripeConnection = async () => {
    toast.success('Stripe connection test successful');
  };

  const handleSaveStripeSettings = async () => {
    toast.success('Stripe settings saved successfully');
  };

  const toggleIntegrationStatus = (integrationName: string) => {
    setIntegrations(integrations.map(integration => 
      integration.name === integrationName 
        ? { 
            ...integration, 
            status: integration.status === 'connected' ? 'disconnected' : 'connected' 
          }
        : integration
    ));
    toast.success(`${integrationName} ${integrations.find(i => i.name === integrationName)?.status === 'connected' ? 'disconnected' : 'connected'}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-8">
            Integrations & Settings
          </h1>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map((integration) => (
                  <Card key={integration.name}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {integration.icon}
                          <div>
                            <h3 className="font-semibold">{integration.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {integration.description}
                            </p>
                          </div>
                        </div>
                        {getStatusIcon(integration.status)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleIntegrationStatus(integration.name)}
                          >
                            {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stripe" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Stripe Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Test Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Use test API keys for development
                      </p>
                    </div>
                    <Switch 
                      checked={stripeSettings.testMode}
                      onCheckedChange={(checked) => 
                        setStripeSettings({...stripeSettings, testMode: checked})
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Publishable Key</label>
                      <Input
                        value={stripeSettings.publishableKey}
                        onChange={(e) => setStripeSettings({
                          ...stripeSettings, 
                          publishableKey: e.target.value
                        })}
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Secret Key</label>
                      <Input
                        type="password"
                        value={stripeSettings.secretKey}
                        onChange={(e) => setStripeSettings({
                          ...stripeSettings, 
                          secretKey: e.target.value
                        })}
                        placeholder="sk_test_..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Webhook Secret</label>
                    <Input
                      type="password"
                      value={stripeSettings.webhookSecret}
                      onChange={(e) => setStripeSettings({
                        ...stripeSettings, 
                        webhookSecret: e.target.value
                      })}
                      placeholder="whsec_..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleTestStripeConnection} variant="outline">
                      Test Connection
                    </Button>
                    <Button onClick={handleSaveStripeSettings}>
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Webhook Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {webhookLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{log.event}</Badge>
                            <Badge className={log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {log.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Service Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Email service integration is not yet configured. 
                      This will allow sending notifications, newsletters, and transactional emails.
                    </p>
                    <Button variant="outline">
                      Configure Email Service
                    </Button>
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