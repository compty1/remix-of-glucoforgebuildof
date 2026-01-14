import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Terms() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-6">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: January 2024
          </p>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  By accessing and using the GlucoForge platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Use License</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Permission is granted to temporarily use GlucoForge for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>modify or copy the materials</li>
                    <li>use the materials for any commercial purpose or for any public display</li>
                    <li>attempt to reverse engineer any software contained on the website</li>
                    <li>remove any copyright or other proprietary notations from the materials</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Data and Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    GlucoForge is committed to protecting your privacy and health data. All personal health information is:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Encrypted in transit and at rest</li>
                    <li>De-identified for research purposes</li>
                    <li>Never sold or shared without explicit consent</li>
                    <li>Subject to HIPAA compliance standards</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Medical Disclaimer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  GlucoForge is not a medical device and should not be used for medical diagnosis or treatment decisions. Always consult with your healthcare provider before making changes to your diabetes management plan. The information provided is for research and educational purposes only.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Research Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    By participating in GlucoForge research activities:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You consent to the use of de-identified data for research purposes</li>
                    <li>You understand participation is voluntary and can be withdrawn at any time</li>
                    <li>You acknowledge that research findings may be published in scientific journals</li>
                    <li>You will not receive compensation for data contribution</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  In no event shall GlucoForge or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GlucoForge's website, even if GlucoForge or its authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  <p className="mb-2">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <p>
                    Email: legal@glucoforge.com<br />
                    Address: [To be provided]
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}