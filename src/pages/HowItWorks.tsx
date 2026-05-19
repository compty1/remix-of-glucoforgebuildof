import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Upload, BarChart3, Users, Target, ArrowRight } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function HowItWorks() {
  usePageMeta("How It Works", "Learn how GlucoForge helps you understand, manage, and contribute to T1D research.");
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-6">
            How GlucoForge Works
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Discover how we're accelerating Type 1 diabetes research through community collaboration and data science.
          </p>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Share Your Data</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Securely upload your CGM data, pump settings, and health metrics. 
                  Our platform analyzes patterns and contributes to the larger research dataset 
                  while maintaining your privacy.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/data-upload">
                    Start Uploading
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <Card className="w-full md:w-96">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Upload CGM Data</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Get Personal Insights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Receive personalized analytics and insights about your glucose patterns, 
                  treatment effectiveness, and how your experience compares to similar profiles 
                  in our anonymized research database.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/dashboard">
                    View Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <Card className="w-full md:w-96">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Personal Analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Join the Community</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Participate in citizen science surveys, share experiences, and contribute 
                  to research studies. Connect with others facing similar challenges and 
                  help build the world's largest T1D research community.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/surveys">
                    Join Research
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <Card className="w-full md:w-96">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Community Research</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Accelerate Research</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your contributions help researchers identify patterns, test hypotheses, 
                  and develop better treatments. Track cure progress in real-time and see 
                  how your participation is making a difference.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/cure">
                    Track Progress
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <Card className="w-full md:w-96">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg">
                    <div className="text-center">
                      <Target className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Research Impact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
                <p className="text-muted-foreground mb-6">
                  Join thousands of T1D community members contributing to breakthrough research.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link to="/auth">Sign Up Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/dashboard">View Demo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}