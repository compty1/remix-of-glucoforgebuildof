import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Target, TrendingUp, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const donationAmounts = [
  { amount: 25, description: 'Supports one research survey' },
  { amount: 50, description: 'Funds data analysis for 100 participants' },
  { amount: 100, description: 'Sponsors one week of platform hosting' },
  { amount: 250, description: 'Enables advanced research features' },
  { amount: 500, description: 'Supports one month of operations' },
  { amount: 1000, description: 'Major research initiative support' }
];

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleDonate = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    
    if (!amount || amount < 5) {
      toast.error('Minimum donation amount is $5');
      return;
    }

    setProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-donation', {
        body: { amount: Math.round(amount * 100) } // Convert to cents
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
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
                <CardTitle>Make a Donation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-4">Select Amount:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {donationAmounts.map(({ amount, description }) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          selectedAmount === amount && !customAmount
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className="font-semibold">${amount}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Or enter custom amount:</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      min="5"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(0);
                      }}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleDonate}
                  disabled={processing || (!selectedAmount && !customAmount)}
                  className="w-full accent-gradient"
                  size="lg"
                >
                  {processing ? (
                    'Processing...'
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Donate ${customAmount || selectedAmount}
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    Secure payment processing by Stripe
                  </p>
                  <p className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    Tax-deductible as allowed by law
                  </p>
                  <p className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
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