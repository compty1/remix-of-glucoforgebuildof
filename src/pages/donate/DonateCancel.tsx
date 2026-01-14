import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { X, ArrowLeft, Heart, HelpCircle } from 'lucide-react';

export default function DonateCancel() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <X className="h-20 w-20 text-orange-500 mx-auto mb-6" />
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              Donation Cancelled
            </h1>
            <p className="text-xl text-muted-foreground">
              Your donation was not processed. No charges have been made to your account.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Still want to support our mission?
                </h3>
                
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Every contribution, no matter the size, helps accelerate Type 1 diabetes research and brings us closer to a cure.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                      <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-medium">Fund Research</p>
                        <p>Support clinical trials and breakthrough studies</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-medium">Build Technology</p>
                        <p>Improve tools and platform capabilities</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button asChild className="accent-gradient">
                      <Link to="/donate">
                        <Heart className="h-4 w-4 mr-2" />
                        Try Again
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/dashboard">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Other Ways to Help</h3>
                <p className="text-sm text-muted-foreground">
                  There are many ways to contribute to our mission beyond financial donations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/data-upload">
                      Share Data
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/surveys">
                      Join Studies
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/contact">
                      Volunteer
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Need Help?
                </h3>
                <p className="text-sm text-muted-foreground">
                  If you experienced technical difficulties or have questions about donating, we're here to help.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/contact">
                    Contact Support
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}