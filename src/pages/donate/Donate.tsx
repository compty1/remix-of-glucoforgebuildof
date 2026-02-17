import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Users, Target, TrendingUp, Check, Sparkles, Calendar, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { DonationImpactVisualization } from '@/components/donate/DonationImpactVisualization';
import { BackButton } from '@/components/ui/back-button';

const quickAmounts = [25, 50, 100, 250, 500, 1000];

export default function Donate() {
  const [sliderValue, setSliderValue] = useState<number[]>([100]);
  const [processing, setProcessing] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const currentAmount = sliderValue[0];

  const handleDonate = async () => {
    if (currentAmount < 5) {
      toast.error('Minimum donation amount is $5');
      return;
    }

    setProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-donation', {
        body: { amount: currentAmount } // Send dollars - edge function converts to cents
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton fallbackPath="/dashboard" className="mb-6" />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              Support Type 1 Diabetes Research
            </h1>
            <p className="text-xl text-muted-foreground">
              Your donation directly funds breakthrough research and accelerates the path to a cure.
            </p>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">10,000+</p>
                <p className="text-sm text-muted-foreground">Active Participants</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">25</p>
                <p className="text-sm text-muted-foreground">Active Trials</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">$500K</p>
                <p className="text-sm text-muted-foreground">Research Funded</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">501(c)(3)</p>
                <p className="text-sm text-muted-foreground">Tax Deductible</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Make a Donation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Display */}
                <div className="text-center py-6 bg-muted/30 rounded-xl">
                  <p className="text-5xl font-bold text-primary">${currentAmount}</p>
                  <p className="text-muted-foreground mt-2">Your donation amount</p>
                </div>

                {/* Slider */}
                <div className="space-y-4">
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    min={5}
                    max={5000}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>$5</span>
                    <span>$5,000</span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-sm font-medium mb-3">Quick select:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={currentAmount === amount ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSliderValue([amount])}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Recurring Donation Toggle */}
                <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-primary" />
                      <Label htmlFor="recurring" className="font-medium">Make it recurring</Label>
                    </div>
                    <Switch
                      id="recurring"
                      checked={isRecurring}
                      onCheckedChange={setIsRecurring}
                    />
                  </div>
                  
                  {isRecurring && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Frequency</Label>
                      <Select value={recurringFrequency} onValueChange={(val: 'monthly' | 'quarterly' | 'annual') => setRecurringFrequency(val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Monthly - ${currentAmount}/month
                            </div>
                          </SelectItem>
                          <SelectItem value="quarterly">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Quarterly - ${currentAmount}/quarter
                            </div>
                          </SelectItem>
                          <SelectItem value="annual">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Annually - ${currentAmount}/year
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {recurringFrequency === 'monthly' && `You'll be charged $${currentAmount} every month. Cancel anytime.`}
                        {recurringFrequency === 'quarterly' && `You'll be charged $${currentAmount} every 3 months. Cancel anytime.`}
                        {recurringFrequency === 'annual' && `You'll be charged $${currentAmount} once a year. Cancel anytime.`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Impact Visualization */}
                <DonationImpactVisualization amount={currentAmount} />

                <Button
                  onClick={handleDonate}
                  disabled={processing || currentAmount < 5}
                  className="w-full accent-gradient"
                  size="lg"
                >
                  {processing ? (
                    'Processing...'
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      {isRecurring ? `Donate $${currentAmount}/${recurringFrequency === 'monthly' ? 'mo' : recurringFrequency === 'quarterly' ? 'qtr' : 'yr'}` : `Donate $${currentAmount}`}
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-success" />
                    Secure payment processing by Stripe
                  </p>
                  <p className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-success" />
                    Tax-deductible as allowed by law
                  </p>
                  <p className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-success" />
                    100% goes to research and operations
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Impact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Accelerate Research</h4>
                        <p className="text-sm text-muted-foreground">
                          Fund clinical trials, data analysis, and breakthrough research initiatives.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Platform Development</h4>
                        <p className="text-sm text-muted-foreground">
                          Improve tools, add features, and enhance the research experience.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Community Support</h4>
                        <p className="text-sm text-muted-foreground">
                          Enable workshops, education, and community-building initiatives.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Other Ways to Help</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/data-upload">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Share Your Data
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/surveys">
                      <Users className="h-4 w-4 mr-2" />
                      Join Research Studies
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Volunteer
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      GlucoForge is a 501(c)(3) nonprofit organization. 
                      Your donation is tax-deductible to the full extent allowed by law.
                    </p>
                    <p>
                      EIN: [To be provided when 501(c)(3) status is approved]
                    </p>
                    <p>
                      You will receive a receipt via email for your records.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}