import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, Heart, Mail, Share2 } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function DonateSuccess() {
  usePageMeta('Thank You for Donating', 'Your donation will help accelerate Type 1 diabetes research and bring us closer to a cure.');
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              Thank You!
            </h1>
            <p className="text-xl text-muted-foreground">
              Your generous donation will help accelerate Type 1 diabetes research and bring us closer to a cure.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <Heart className="h-6 w-6 text-red-500" />
                  <span className="text-lg font-medium">
                    Your contribution makes a real difference
                  </span>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-left">
                      <strong>Receipt:</strong> A donation receipt has been sent to your email address for tax purposes.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-left">
                      <strong>Impact:</strong> Your donation directly funds research initiatives, platform development, and community support.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-left">
                      <strong>Updates:</strong> We'll keep you informed about the research progress your donation helps enable.
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-foreground">What's Next?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/dashboard">
                        <Heart className="h-4 w-4 mr-2" />
                        View Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/surveys">
                        Join Research
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Join Our Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with other supporters and stay updated on research breakthroughs.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Newsletter
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://twitter.com/GlucoForge" target="_blank" rel="noopener noreferrer">
                      Follow on Twitter
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://facebook.com/GlucoForge" target="_blank" rel="noopener noreferrer">
                      Like on Facebook
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Button asChild className="accent-gradient">
              <Link to="/">
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}