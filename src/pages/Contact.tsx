import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    // Honeypot field — hidden from real users, bots will fill it (Issue 142)
    _honeypot: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Honeypot check — if filled, silently reject (bot detected)
    if (formData._honeypot) {
      toast.success('Message sent successfully!');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          category: formData.category || null,
          message: formData.message,
        });

      if (error) throw error;
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      setFormData({ name: '', email: '', subject: '', category: '', message: '', _honeypot: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-6">
            Contact Us
          </h1>
          <p className="text-muted-foreground mb-8">
            Get in touch with our team. We're here to help and answer any questions you might have.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">For general inquiries:</p>
                  <p className="font-medium">support@glucoforge.com</p>
                  <p className="text-muted-foreground mt-4 mb-2">For research partnerships:</p>
                  <p className="font-medium">research@glucoforge.com</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-muted-foreground">
                    <p>General inquiries: 24-48 hours</p>
                    <p>Technical support: 4-8 hours</p>
                    <p>Emergency issues: 1-2 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Office Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">
                    <p>Coming Soon</p>
                    <p className="text-sm mt-2">
                      GlucoForge is currently a distributed team. 
                      Physical office location to be announced.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Honeypot field — hidden from real users via CSS, traps bots */}
                    <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true" tabIndex={-1}>
                      <Label htmlFor="contact_url">Leave this field blank</Label>
                      <Input
                        id="contact_url"
                        type="text"
                        value={formData._honeypot}
                        onChange={(e) => setFormData(prev => ({ ...prev, _honeypot: e.target.value }))}
                        autoComplete="off"
                        tabIndex={-1}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value.slice(0, 100))}
                          required
                          maxLength={100}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          required
                          pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Question</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="research">Research Inquiry</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="privacy">Privacy Concern</SelectItem>
                          <SelectItem value="accessibility">Accessibility Issue</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value.slice(0, 200))}
                        required
                        maxLength={200}
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value.slice(0, 5000))}
                        required
                        maxLength={5000}
                        placeholder="Please provide details about your inquiry..."
                        className="min-h-[150px]"
                      />
                      <p className="text-xs text-muted-foreground text-right">{formData.message.length}/5000</p>
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'Sending...' : 'Send Message'}
                    </Button>
                    
                    <p className="text-sm text-muted-foreground">
                      * Required fields. We typically respond within 24 hours during business days.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">How do I get started with GlucoForge?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Simply create a free account and you can immediately start exploring our research tools and upload your first health data.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Is my health data secure?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Yes, we use industry-standard encryption and follow healthcare data security best practices. Your data is never shared without your explicit consent.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Can I delete my account and data?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Absolutely. You can delete your account and all associated data at any time from your settings page.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How can I contribute to research?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your health data, participate in surveys, and engage with our citizen science programs to contribute to breakthrough research.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
