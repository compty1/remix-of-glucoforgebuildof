import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Database } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Privacy() {
  usePageMeta('Privacy Policy', 'How GlucoForge handles your data, privacy rights, and security practices.');
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-6">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: January 2024
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <Shield className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Security-First Design</h3>
                <p className="text-sm text-muted-foreground">
                  Health data is protected with industry-standard security practices. Full HIPAA compliance is a goal we are actively working toward.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Lock className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">End-to-End Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  Data encrypted in transit and at rest.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Eye className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Transparent Practices</h3>
                <p className="text-sm text-muted-foreground">
                  Clear visibility into how your data is used.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Database className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Data Control</h3>
                <p className="text-sm text-muted-foreground">
                  You control your data and can delete it anytime.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Information We Collect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We collect information you provide directly to us, such as when you:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Create an account or update your profile</li>
                    <li>Upload health data (CGM readings, insulin doses, etc.)</li>
                    <li>Participate in surveys or research studies</li>
                    <li>Communicate with us for support</li>
                    <li>Use our mobile applications or website</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Generate personalized insights and analytics</li>
                    <li>Conduct research to advance diabetes treatment (with de-identified data)</li>
                    <li>Communicate with you about your account and our services</li>
                    <li>Comply with legal obligations and protect our rights</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Sharing and Research</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    For research purposes, we may share de-identified, aggregated data with:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Academic research institutions</li>
                    <li>Approved clinical researchers</li>
                    <li>Non-profit diabetes organizations</li>
                    <li>Government health agencies (when required by law)</li>
                  </ul>
                  <p className="mt-4">
                    <strong>Important:</strong> We never share personally identifiable health information without your explicit consent.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access, update, or delete your personal information</li>
                    <li>Withdraw consent for research participation at any time</li>
                    <li>Request a copy of your data in a portable format</li>
                    <li>Opt out of certain communications</li>
                    <li>Request deletion of your account and associated data</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Measures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We implement industry-standard security measures including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>AES-256 encryption for data at rest</li>
                    <li>TLS 1.3 encryption for data in transit</li>
                    <li>Multi-factor authentication for account access</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>HIPAA-compliant infrastructure and procedures</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  <p className="mb-4">
                    If you have questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p>Email: privacy@glucoforge.com</p>
                    <p>Phone: [To be provided]</p>
                    <p>Address: [To be provided]</p>
                  </div>
                  <p className="mt-4 text-sm">
                    For HIPAA-related requests, please allow up to 30 days for response.
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