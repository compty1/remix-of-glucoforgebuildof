import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { InfoRail } from "@/components/InfoRail";
import { FileText, Calendar, TrendingUp, AlertCircle, CheckCircle, Download, User } from "lucide-react";

const PrepareForVisit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const generateSnapshot = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('snapshot-generator');
      
      if (error) throw error;

      setSnapshot(data);
      toast({
        title: "Snapshot Generated",
        description: "Your clinical visit snapshot is ready!",
      });
    } catch (error) {
      console.error('Error generating snapshot:', error);
      toast({
        title: "Error",
        description: "Failed to generate clinical snapshot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadSnapshot = () => {
    if (!snapshot) return;
    
    // Create HTML content for printing
    const htmlContent = `
      <html>
        <head>
          <title>Clinical Visit Snapshot - ${snapshot.user_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #6A4C93; }
            .section { margin-bottom: 20px; }
            .metric { margin: 10px 0; }
            .trigger { background: #f0f0f0; padding: 5px; margin: 2px; display: inline-block; }
          </style>
        </head>
        <body>
          <h1>GlucoForge Clinical Visit Snapshot</h1>
          <div class="section">
            <h2>Patient Information</h2>
            <p><strong>Name:</strong> ${snapshot.user_name}</p>
            <p><strong>Report Period:</strong> ${snapshot.period}</p>
            <p><strong>Generated:</strong> ${new Date(snapshot.generated_at).toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Glycemic Pattern Summary</h2>
            <div class="metric">Total Logged Events: ${snapshot.total_shifts}</div>
            <div class="metric">High Glucose Events: ${snapshot.high_shifts}</div>
            <div class="metric">Low Glucose Events: ${snapshot.low_shifts}</div>
          </div>
          
          <div class="section">
            <h2>Top Personal Triggers</h2>
            ${snapshot.top_triggers.map((trigger: any) => 
              `<span class="trigger">${trigger.tag} (${trigger.count}x)</span>`
            ).join(' ')}
          </div>
          
          <div class="section">
            <h2>Healthcare Provider Summary</h2>
            <p>${snapshot.summary}</p>
          </div>
          
          <div class="section">
            <h2>Recommendations</h2>
            <ul>
              ${snapshot.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-snapshot-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Your clinical snapshot HTML file will download shortly.",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Prepare for Your Visit</h1>
          <p className="text-muted-foreground">Generate a comprehensive snapshot for your healthcare provider</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Generate Snapshot Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Clinical Visit Snapshot
                </CardTitle>
                <CardDescription>
                  Create a comprehensive summary of your glucose patterns and triggers for your healthcare provider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">What's Included in Your Snapshot:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Glucose Pattern Summary</h4>
                        <p className="text-sm text-muted-foreground">Recent trends and key metrics</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Personal Triggers</h4>
                        <p className="text-sm text-muted-foreground">Your most common identified patterns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Recent Journal Entries</h4>
                        <p className="text-sm text-muted-foreground">Glycemic shift logs and context</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Recommendations</h4>
                        <p className="text-sm text-muted-foreground">Data-driven insights for discussion</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={generateSnapshot} disabled={generating} className="w-full" size="lg">
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Snapshot...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate My Clinical Snapshot
                    </>
                  )}
                </Button>

                {snapshot && (
                  <Button onClick={downloadSnapshot} variant="outline" className="w-full" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Download Snapshot (HTML)
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Snapshot Preview */}
            {snapshot && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generated Snapshot Preview</CardTitle>
                  <CardDescription>Your clinical visit summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Summary ({snapshot.period})</h4>
                      <p className="text-sm text-muted-foreground">{snapshot.summary}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Key Metrics</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{snapshot.total_shifts}</div>
                          <div className="text-muted-foreground">Total Events</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{snapshot.high_shifts}</div>
                          <div className="text-muted-foreground">High Events</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{snapshot.low_shifts}</div>
                          <div className="text-muted-foreground">Low Events</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Top Triggers</h4>
                      <div className="flex flex-wrap gap-1">
                        {snapshot.top_triggers?.map((trigger: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {trigger.tag} ({trigger.count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips and Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Making the Most of Your Visit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Before Your Appointment</h4>
                      <p className="text-sm text-muted-foreground">
                        Generate and print your snapshot 1-2 days before your visit to review any patterns
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">During Your Visit</h4>
                      <p className="text-sm text-muted-foreground">
                        Share your snapshot with your provider and discuss the identified patterns and triggers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Questions to Ask</h4>
                      <p className="text-sm text-muted-foreground">
                        Ask about adjusting your management plan based on your personal patterns and triggers
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="A personalized summary of your glucose patterns, triggers, and key metrics for your healthcare provider."
              whyItMatters="Helps your provider quickly understand your current diabetes management and identify areas for discussion."
              nextSteps="Generate your snapshot before your next appointment and bring it with you."
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">30-day glucose pattern summary</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Top 5 personal triggers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Recent glycemic shift events</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Personalized recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Printable format</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrepareForVisit;