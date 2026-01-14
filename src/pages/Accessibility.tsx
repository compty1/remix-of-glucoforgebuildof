import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Keyboard, Volume2, Eye, MousePointer } from 'lucide-react';

export default function Accessibility() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-6">
            Accessibility Statement
          </h1>
          <p className="text-muted-foreground mb-8">
            GlucoForge is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <Keyboard className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Keyboard Navigation</h3>
                <p className="text-sm text-muted-foreground">
                  Full keyboard accessibility with tab navigation and focus indicators.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Volume2 className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Screen Reader Support</h3>
                <p className="text-sm text-muted-foreground">
                  Compatible with NVDA, JAWS, and VoiceOver screen readers.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Eye className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Visual Accessibility</h3>
                <p className="text-sm text-muted-foreground">
                  High contrast mode and adjustable font sizes available.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <MousePointer className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Motor Accessibility</h3>
                <p className="text-sm text-muted-foreground">
                  Large click targets and voice control compatibility.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conformance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
                </p>
                <p className="text-muted-foreground">
                  GlucoForge is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accessibility Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    GlucoForge includes the following accessibility features:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Alternative text for images and charts</li>
                    <li>Proper heading structure for screen readers</li>
                    <li>High contrast color schemes</li>
                    <li>Keyboard-only navigation support</li>
                    <li>Focus indicators for interactive elements</li>
                    <li>Descriptive link text</li>
                    <li>Form labels and error messages</li>
                    <li>Skip navigation links</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Known Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We are aware of the following accessibility issues and are working to address them:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Some charts may not be fully accessible to screen readers (alternative data tables provided)</li>
                    <li>Certain third-party integrations may have limited accessibility</li>
                    <li>Some dynamic content updates may not be announced to screen readers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assistive Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    GlucoForge is designed to be compatible with the following assistive technologies:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>JAWS (Windows)</li>
                    <li>NVDA (Windows)</li>
                    <li>VoiceOver (macOS and iOS)</li>
                    <li>TalkBack (Android)</li>
                    <li>Dragon NaturallySpeaking (Windows)</li>
                    <li>Voice Control (macOS and iOS)</li>
                    <li>Switch Control (iOS)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback and Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We welcome your feedback on the accessibility of GlucoForge. Please let us know if you encounter accessibility barriers:
                  </p>
                  <div className="space-y-2">
                    <p>Email: accessibility@glucoforge.com</p>
                    <p>Phone: [To be provided]</p>
                    <p>Address: [To be provided]</p>
                  </div>
                  <p className="mt-4">
                    We try to respond to accessibility feedback within 5 business days.
                  </p>
                </div>
                <Button className="mt-4" variant="outline">
                  Report Accessibility Issue
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formal Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  If you are not satisfied with our response to your accessibility concern, you may file a formal complaint with the U.S. Department of Health and Human Services Office for Civil Rights at <a href="https://www.hhs.gov/civil-rights/filing-a-complaint/index.html" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.hhs.gov/civil-rights/filing-a-complaint</a>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}