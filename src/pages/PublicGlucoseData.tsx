import React from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { Database, Activity } from 'lucide-react';

export default function PublicGlucoseData() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-heading font-bold">Public Glucose Data</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Explore anonymized glucose data from public repositories and discover population-wide patterns.
          </p>
        </div>
        <Card className="command-center-widget">
          <CardContent className="p-12 text-center">
            <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Data Repository Coming Soon</h3>
            <p className="text-muted-foreground">
              We're integrating with OpenAPS and Nightscout public datasets.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
