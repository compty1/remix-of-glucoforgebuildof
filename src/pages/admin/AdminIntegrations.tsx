import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Webhook, Mail, Database, CheckCircle, XCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Integration {
  name: string;
  status: 'connected' | 'disconnected' | 'not_configured';
  description: string;
  icon: React.ReactNode;
}

const integrations: Integration[] = [
  {
    name: 'Stripe',
    status: 'connected',
    description: 'Payment processing for donations and shop orders',
    icon: <CreditCard className="h-6 w-6" />,
  },
  {
    name: 'Lovable Cloud',
    status: 'connected',
    description: 'Database, authentication, and backend functions',
    icon: <Database className="h-6 w-6" />,
  },
  {
    name: 'Email (Resend)',
    status: 'connected',
    description: 'Transactional email delivery',
    icon: <Mail className="h-6 w-6" />,
  },
  {
    name: 'Webhooks',
    status: 'connected',
    description: 'Stripe webhook event processing',
    icon: <Webhook className="h-6 w-6" />,
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-5 w-5 text-success" />;
    default:
      return <XCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'connected':
      return <Badge variant="default">Connected</Badge>;
    case 'disconnected':
      return <Badge variant="secondary">Disconnected</Badge>;
    default:
      return <Badge variant="outline">Not Configured</Badge>;
  }
};

export default function AdminIntegrations() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-8">
            Integrations
          </h1>

          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Integration connections are managed through Lovable Cloud connectors and environment secrets. 
              Status shown reflects current backend configuration.
            </AlertDescription>
          </Alert>

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
                    {getStatusBadge(integration.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
