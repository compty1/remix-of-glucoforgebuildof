import { useState } from "react";
import { usePageMeta } from '@/hooks/usePageMeta';
import Layout from "@/components/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQualityOfLifeResources } from "@/hooks/useQualityOfLifeResources";
import { BackButton } from "@/components/ui/back-button";
import RealExperiencesSection from "@/components/quality-of-life/RealExperiencesSection";
import QoLComparisonSection from "@/components/quality-of-life/QoLComparisonSection";
import { QoLDetailModal } from "@/components/quality-of-life/QoLDetailModal";
import { 
  Sparkles, 
  Pill, 
  Wrench, 
  Heart, 
  Wallet,
  Sun,
  Moon,
  Zap,
  AlertTriangle,
  ExternalLink,
  Leaf,
  Brain,
  Activity
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  supplements: <Pill className="h-5 w-5" />,
  tools: <Wrench className="h-5 w-5" />,
  prescription: <Wallet className="h-5 w-5" />,
  symptom_relief: <Heart className="h-5 w-5" />,
  lifestyle: <Sun className="h-5 w-5" />,
};

const evidenceLevelColors: Record<string, string> = {
  strong: "bg-success/10 text-success border-success/20",
  moderate: "bg-warning/10 text-warning border-warning/20",
  emerging: "bg-info/10 text-info border-info/20",
  anecdotal: "bg-muted text-muted-foreground",
};

export default function QualityOfLife() {
  usePageMeta('Quality of Life', 'Evidence-based supplements, tools, and lifestyle strategies to reduce the daily burden of T1D.');
  const [activeTab, setActiveTab] = useState("supplements");
  const [selectedDeficiency, setSelectedDeficiency] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const { resources, deficiencies, isLoading } = useQualityOfLifeResources();

  const filteredResources = resources.filter(r => r.category === activeTab);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 px-4 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container mx-auto max-w-4xl">
            <BackButton fallbackPath="/dashboard" className="mb-6" />
            <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-highlight" />
              <Badge variant="secondary">Quality of Life</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Live Better with T1D
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Evidence-based resources, supplements, and tools to reduce the daily burden of 
              Type 1 Diabetes management and improve your overall well-being.
            </p>
          </div>
          </div>
        </section>

        {/* Common Deficiencies Section */}
        <section className="py-8 px-4 border-b">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="text-xl font-semibold">Common Deficiencies in T1D</h2>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deficiencies.map((def) => (
                  <Card 
                    key={def.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50"
                    onClick={() => setSelectedDeficiency(def)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{def.nutrient_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {def.recommended_daily_amount}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {def.prevalence_in_t1d}% deficient
                        </Badge>
                      </div>
                      
                      <Progress 
                        value={def.prevalence_in_t1d || 0} 
                        className="h-2 mb-3" 
                      />
                      
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Symptoms:</span>{" "}
                          {def.symptoms_of_deficiency?.slice(0, 3).join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Food sources:</span>{" "}
                          {def.food_sources?.slice(0, 3).join(", ")}
                        </p>
                        {def.optimal_timing && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Best time:</span>{" "}
                            {def.optimal_timing}
                          </p>
                        )}
                      </div>
                      <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-primary">
                        Learn more →
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* T1D vs Healthy Comparison */}
        <QoLComparisonSection />

        {/* Real Experiences Section */}
        <RealExperiencesSection />

        {/* Main Resources Section */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto gap-1 p-1 mb-8">
                <TabsTrigger value="supplements" className="gap-2">
                  <Pill className="h-4 w-4" />
                  Supplements
                </TabsTrigger>
                <TabsTrigger value="tools" className="gap-2">
                  <Wrench className="h-4 w-4" />
                  Management Tools
                </TabsTrigger>
                <TabsTrigger value="prescription" className="gap-2">
                  <Wallet className="h-4 w-4" />
                  Prescription Savings
                </TabsTrigger>
                <TabsTrigger value="symptom_relief" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Symptom Relief
                </TabsTrigger>
                <TabsTrigger value="lifestyle" className="gap-2">
                  <Sun className="h-4 w-4" />
                  Lifestyle
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <Skeleton className="h-6 w-1/2 mb-2" />
                          <Skeleton className="h-4 w-full mb-4" />
                          <Skeleton className="h-20 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredResources.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Resources Yet</h3>
                      <p className="text-muted-foreground">
                        Resources for this category are being added.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredResources.map((resource) => (
                      <Card 
                        key={resource.id} 
                        className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50"
                        onClick={() => setSelectedResource(resource)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {categoryIcons[resource.category]}
                              <CardTitle className="text-lg">{resource.name}</CardTitle>
                            </div>
                            {resource.scientific_evidence_level && (
                              <Badge 
                                variant="outline" 
                                className={evidenceLevelColors[resource.scientific_evidence_level]}
                              >
                                {resource.scientific_evidence_level} evidence
                              </Badge>
                            )}
                          </div>
                          {resource.recommended_by_community && (
                            <Badge variant="secondary" className="w-fit">
                              ⭐ Community Recommended
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {resource.description}
                          </p>
                          
                          {resource.benefits_for_t1d && (
                            <div className="bg-success/5 border border-success/20 rounded-lg p-3 mb-4">
                              <p className="text-sm">
                                <span className="font-medium text-success">T1D Benefits:</span>{" "}
                                {resource.benefits_for_t1d}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
                            {resource.dosage_info && (
                              <p><span className="font-medium">Dosage:</span> {resource.dosage_info}</p>
                            )}
                            {resource.cost_range && (
                              <p><span className="font-medium">Cost:</span> {resource.cost_range}</p>
                            )}
                            {resource.availability && (
                              <p><span className="font-medium">Where:</span> {resource.availability}</p>
                            )}
                          </div>

                          {resource.precautions && (
                            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 mb-4">
                              <p className="text-xs text-warning">
                                <AlertTriangle className="h-3 w-3 inline mr-1" />
                                {resource.precautions}
                              </p>
                            </div>
                          )}

                          <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                            View full details →
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Quick Tips Section */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-center mb-8">Evidence-Based QoL Improvements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Moon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Optimize Sleep</h3>
                  <p className="text-sm text-muted-foreground">
                    7-9 hours of quality sleep improves insulin sensitivity by up to 30%. 
                    Use CGM alerts wisely to minimize disruptions.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2">Strategic Exercise</h3>
                  <p className="text-sm text-muted-foreground">
                    Resistance training before cardio stabilizes glucose. 
                    Post-meal walks reduce spikes by 30-50%.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-highlight/10 flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-6 w-6 text-highlight" />
                  </div>
                  <h3 className="font-semibold mb-2">Reduce Diabetes Distress</h3>
                  <p className="text-sm text-muted-foreground">
                    Scheduled "diabetes breaks" and community connection 
                    significantly reduce burnout and improve A1C.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Detail Modals */}
        <QoLDetailModal 
          item={selectedDeficiency}
          type="deficiency"
          open={!!selectedDeficiency}
          onOpenChange={(open) => !open && setSelectedDeficiency(null)}
        />
        <QoLDetailModal 
          item={selectedResource}
          type="resource"
          open={!!selectedResource}
          onOpenChange={(open) => !open && setSelectedResource(null)}
        />
      </div>
    </Layout>
  );
}
