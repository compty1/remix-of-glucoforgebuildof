import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Stethoscope, 
  Users, 
  BarChart3,
  CheckCircle,
  Send,
  Heart,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { usePageMeta } from '@/hooks/usePageMeta';

const partnerBenefits = [
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: 'Real-World Data Access',
    description: 'Gain insights from aggregated, anonymized patient-reported outcomes and real-world glucose data.'
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Patient Engagement',
    description: 'Connect with an engaged community of T1D patients actively managing their condition.'
  },
  {
    icon: <Stethoscope className="h-8 w-8" />,
    title: 'Clinical Trial Recruitment',
    description: 'Access our trial matching platform to find eligible participants for your research.'
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'HIPAA Compliant',
    description: 'All data sharing follows strict privacy protocols and regulatory compliance.'
  }
];

const interestAreas = [
  'Clinical Trial Recruitment',
  'Real-World Data Access',
  'Patient Education Programs',
  'Device/Medication Feedback',
  'Research Collaboration',
  'Quality Improvement Initiatives',
  'Other'
];

export default function HealthcareProviders() {
  usePageMeta("Healthcare Providers", "Find endocrinologists, CDEs, and T1D-friendly providers reviewed by the community.");
  const [formData, setFormData] = useState({
    organization_name: '',
    contact_name: '',
    email: '',
    phone: '',
    organization_type: '',
    interest_areas: [] as string[],
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('healthcare_partner_inquiries')
        .insert({
          ...formData,
          interest_areas: formData.interest_areas
        });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Thank you! We\'ll be in touch soon.');
    } catch (error) {
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleInterestArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      interest_areas: prev.interest_areas.includes(area)
        ? prev.interest_areas.filter(a => a !== area)
        : [...prev.interest_areas, area]
    }));
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Thank You for Your Interest!</h1>
            <p className="text-muted-foreground mb-8">
              We've received your partnership inquiry. Our team will review your information 
              and reach out within 2-3 business days to discuss how we can collaborate.
            </p>
            <Button asChild>
              <a href="/dashboard">Return to Dashboard</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 md:p-12 mb-12 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-10 w-10" />
              <Badge variant="secondary" className="bg-white/20 text-white">
                Partner With Us
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              For Healthcare Providers
            </h1>
            <p className="text-xl text-white/90">
              Join our mission to improve outcomes for Type 1 diabetics through 
              data-driven insights and patient-centered research.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Partnership Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerBenefits.map((benefit, index) => (
              <Card key={index} className="command-center-widget text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="command-center-widget">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Partner Inquiry Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization_name">Organization Name *</Label>
                    <Input
                      id="organization_name"
                      required
                      value={formData.organization_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                      placeholder="Hospital, Clinic, Research Institution..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization_type">Organization Type</Label>
                    <Input
                      id="organization_type"
                      value={formData.organization_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, organization_type: e.target.value }))}
                      placeholder="Hospital, Pharma, Research, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Contact Name *</Label>
                    <Input
                      id="contact_name"
                      required
                      value={formData.contact_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Areas of Interest</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {interestAreas.map(area => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={area}
                          checked={formData.interest_areas.includes(area)}
                          onCheckedChange={() => toggleInterestArea(area)}
                        />
                        <label htmlFor={area} className="text-sm cursor-pointer">{area}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us about your organization and how you'd like to partner..."
                    className="min-h-[120px]"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Partnership Inquiry
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
