import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoRail } from '@/components/InfoRail';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { 
  Megaphone, 
  Heart, 
  Users, 
  Target,
  CheckCircle,
  FileText,
  Mail,
  MessageSquare,
  Building2,
  Globe,
  Award,
  Star,
  Sparkles,
  BookOpen,
  Calendar
} from 'lucide-react';

const advocacyInterests = [
  { id: 'federal_policy', label: 'Federal Policy & Legislation' },
  { id: 'state_policy', label: 'State Policy & Legislation' },
  { id: 'insurance_access', label: 'Insurance & Access Issues' },
  { id: 'research_funding', label: 'Research Funding Advocacy' },
  { id: 'school_awareness', label: 'School & Education Awareness' },
  { id: 'workplace_advocacy', label: 'Workplace Rights & Accommodations' },
  { id: 'media_outreach', label: 'Media & Public Relations' },
  { id: 'community_events', label: 'Community Events & Fundraising' },
  { id: 'story_sharing', label: 'Story Sharing & Awareness' }
];

const skills = [
  { id: 'public_speaking', label: 'Public Speaking' },
  { id: 'writing', label: 'Writing & Content Creation' },
  { id: 'social_media', label: 'Social Media' },
  { id: 'event_planning', label: 'Event Planning' },
  { id: 'fundraising', label: 'Fundraising' },
  { id: 'healthcare_background', label: 'Healthcare Background' },
  { id: 'legal_policy', label: 'Legal/Policy Background' },
  { id: 'media_relations', label: 'Media Relations' },
  { id: 'languages', label: 'Multilingual' }
];

export default function BecomeAdvocate() {
  usePageMeta("Become an Advocate", "Join the GlucoForge advocate program to amplify T1D voices and drive change in diabetes care.");
  const { user } = useAuthStore();
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    zip_code: '',
    connection_to_t1d: '',
    diagnosis_year: '',
    personal_story: '',
    advocacy_interests: [] as string[],
    skills: [] as string[],
    availability: '',
    prior_advocacy_experience: '',
    how_heard_about: '',
    consent_to_contact: false,
    consent_to_share_story: false
  });
import { usePageMeta } from '@/hooks/usePageMeta';

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'advocacy_interests' | 'skills', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to submit your application');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('advocate_applications')
        .insert({
          user_id: user.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          connection_to_t1d: formData.connection_to_t1d,
          diagnosis_year: formData.diagnosis_year ? parseInt(formData.diagnosis_year) : null,
          personal_story: formData.personal_story,
          advocacy_interests: formData.advocacy_interests,
          skills: formData.skills,
          availability: formData.availability,
          prior_advocacy_experience: formData.prior_advocacy_experience,
          how_heard_about: formData.how_heard_about,
          consent_to_contact: formData.consent_to_contact,
          consent_to_share_story: formData.consent_to_share_story
        });

      if (error) throw error;

      toast.success('Application submitted successfully! We will be in touch soon.');
      setFormStep(4); // Success state
    } catch {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <BackButton fallbackPath="/get-involved" />

        {/* Hero Section */}
        <section className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
              <Megaphone className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Become a GlucoForge Advocate</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our community of passionate advocates working to improve the lives of 
            people with Type 1 diabetes through policy, awareness, and community action.
          </p>
        </section>

        {/* Why Advocate Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Make Real Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Advocate for policies that improve access to insulin, CGMs, and 
                  essential diabetes technology.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Join a Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with fellow advocates who share your passion and understand 
                  your journey with T1D.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-highlight/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-highlight" />
                </div>
                <h3 className="font-semibold mb-2">Share Your Story</h3>
                <p className="text-sm text-muted-foreground">
                  Your personal experience with T1D is powerful. Help others by 
                  sharing what you've learned.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {formStep === 4 ? (
              /* Success State */
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-success" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Application Submitted!</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Thank you for your interest in becoming a GlucoForge advocate. 
                    We'll review your application and contact you within 5-7 business days.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => setFormStep(1)}>
                      Submit Another
                    </Button>
                    <Button asChild>
                      <a href="/get-involved">Explore Other Ways to Help</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Advocate Application</CardTitle>
                  <CardDescription>
                    Step {formStep} of 3 - {formStep === 1 ? 'Personal Information' : formStep === 2 ? 'Your Story' : 'Interests & Skills'}
                  </CardDescription>
                  {/* Progress Bar */}
                  <div className="flex gap-2 mt-4">
                    {[1, 2, 3].map(step => (
                      <div 
                        key={step}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          step <= formStep ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formStep === 1 && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name *</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                            placeholder="Your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="connection_to_t1d">Connection to T1D *</Label>
                          <Select
                            value={formData.connection_to_t1d}
                            onValueChange={(val) => handleInputChange('connection_to_t1d', val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="self">I have T1D</SelectItem>
                              <SelectItem value="child">Parent of child with T1D</SelectItem>
                              <SelectItem value="family_member">Family member has T1D</SelectItem>
                              <SelectItem value="friend">Friend has T1D</SelectItem>
                              <SelectItem value="healthcare_provider">Healthcare Provider</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zip_code">ZIP</Label>
                          <Input
                            id="zip_code"
                            value={formData.zip_code}
                            onChange={(e) => handleInputChange('zip_code', e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {formStep === 2 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="diagnosis_year">Year of Diagnosis (if applicable)</Label>
                        <Input
                          id="diagnosis_year"
                          type="number"
                          min="1920"
                          max={new Date().getFullYear()}
                          value={formData.diagnosis_year}
                          onChange={(e) => handleInputChange('diagnosis_year', e.target.value)}
                          placeholder="2010"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="personal_story">Your Personal Story *</Label>
                        <Textarea
                          id="personal_story"
                          rows={6}
                          value={formData.personal_story}
                          onChange={(e) => handleInputChange('personal_story', e.target.value)}
                          placeholder="Share your experience with T1D - how has it affected your life, what challenges have you faced, and what motivates you to advocate?"
                        />
                        <p className="text-xs text-muted-foreground">
                          This story may be used in advocacy efforts (with your permission)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prior_experience">Prior Advocacy Experience</Label>
                        <Textarea
                          id="prior_experience"
                          rows={3}
                          value={formData.prior_advocacy_experience}
                          onChange={(e) => handleInputChange('prior_advocacy_experience', e.target.value)}
                          placeholder="Describe any previous advocacy work, volunteer experience, or community involvement..."
                        />
                      </div>
                    </>
                  )}

                  {formStep === 3 && (
                    <>
                      <div className="space-y-4">
                        <Label>Advocacy Interests (select all that apply)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {advocacyInterests.map(interest => (
                            <div key={interest.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={interest.id}
                                checked={formData.advocacy_interests.includes(interest.id)}
                                onCheckedChange={() => handleArrayToggle('advocacy_interests', interest.id)}
                              />
                              <Label htmlFor={interest.id} className="text-sm font-normal cursor-pointer">
                                {interest.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Skills You Can Contribute</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {skills.map(skill => (
                            <div key={skill.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={skill.id}
                                checked={formData.skills.includes(skill.id)}
                                onCheckedChange={() => handleArrayToggle('skills', skill.id)}
                              />
                              <Label htmlFor={skill.id} className="text-sm font-normal cursor-pointer">
                                {skill.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="availability">Availability</Label>
                        <Select
                          value={formData.availability}
                          onValueChange={(val) => handleInputChange('availability', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="How much time can you commit?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-2_hours_month">1-2 hours/month</SelectItem>
                            <SelectItem value="3-5_hours_month">3-5 hours/month</SelectItem>
                            <SelectItem value="5-10_hours_month">5-10 hours/month</SelectItem>
                            <SelectItem value="10+_hours_month">10+ hours/month</SelectItem>
                            <SelectItem value="varies">Varies by project</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="consent_contact"
                            checked={formData.consent_to_contact}
                            onCheckedChange={(checked) => handleInputChange('consent_to_contact', checked as boolean)}
                          />
                          <Label htmlFor="consent_contact" className="text-sm font-normal cursor-pointer">
                            I consent to be contacted about advocacy opportunities *
                          </Label>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="consent_story"
                            checked={formData.consent_to_share_story}
                            onCheckedChange={(checked) => handleInputChange('consent_to_share_story', checked as boolean)}
                          />
                          <Label htmlFor="consent_story" className="text-sm font-normal cursor-pointer">
                            I consent to have my story shared for advocacy purposes (optional)
                          </Label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    {formStep > 1 && (
                      <Button variant="outline" onClick={() => setFormStep(formStep - 1)}>
                        Previous
                      </Button>
                    )}
                    {formStep < 3 ? (
                      <Button 
                        onClick={() => setFormStep(formStep + 1)}
                        className="ml-auto"
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.consent_to_contact}
                        className="ml-auto"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="Application to become an official GlucoForge advocate, helping advance T1D awareness and policy."
              whyItMatters="Advocates are crucial to improving access to insulin, technology, and research funding."
              nextSteps="Complete the application. We'll review and contact you about next steps and training."
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  What Advocates Do
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Meet with legislators about diabetes policy</span>
                </div>
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Share stories with media outlets</span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Participate in awareness events</span>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Represent the T1D community</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">No experience needed!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We provide training and support for all new advocates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
