// Gap 133/207: Clinic whitelabel portal route
import { useParams } from 'react-router-dom';
import { useClinicBranding } from '@/hooks/useClinicBranding';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function ClinicPortal() {
  const { slug } = useParams<{ slug: string }>();
  const { branding, isLoading } = useClinicBranding(slug || '');

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!branding) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Clinic Not Found</h1>
          <p className="text-muted-foreground">The clinic portal you're looking for doesn't exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          {branding.logo_url && (
            <img src={branding.logo_url} alt={branding.clinic_name} className="h-16 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-bold text-foreground">{branding.clinic_name}</h1>
          <p className="text-muted-foreground mt-2">Patient Portal powered by GlucoForge</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome to {branding.clinic_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is your clinic's dedicated portal. Sign in to access your health data and connect with your care team.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
