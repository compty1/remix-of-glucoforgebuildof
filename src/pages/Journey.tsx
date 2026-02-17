import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Target, Heart } from 'lucide-react';

export default function Journey() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-6">
            Journey to a Cure
          </h1>
          
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Target className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-semibold">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  GlucoForge is dedicated to accelerating Type 1 diabetes research through 
                  community-driven data collection, real-world evidence, and collaborative 
                  intelligence. We bridge the gap between clinical trials and lived experience.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Community First</h3>
                  <p className="text-muted-foreground">
                    Built by and for the T1D community, ensuring real needs drive our innovation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Heart className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Hope Through Data</h3>
                  <p className="text-muted-foreground">
                    Every data point shared brings us closer to better treatments and cures.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <ArrowRight className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Future Forward</h3>
                  <p className="text-muted-foreground">
                    Advancing research through cutting-edge technology and collaborative science.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}