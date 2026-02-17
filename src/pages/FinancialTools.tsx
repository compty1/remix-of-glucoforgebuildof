import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InfoRail } from "@/components/InfoRail";
import { DollarSign, FileText, Copy, ExternalLink, Search, Filter, TrendingUp, RefreshCw } from "lucide-react";
import { useMedicareData } from "@/hooks/useMedicareData";
import { useDrugPricing } from "@/hooks/useDrugPricing";
import { useMarketData } from "@/hooks/useMarketData";

interface FinancialResource {
  id: string;
  resource_title: string;
  description: string;
  link: string;
  category: string;
}

const appealTemplate = `[Date]

[Insurance Company Name]
[Address]

Re: Appeal for Coverage of Continuous Glucose Monitor (CGM)
Policy Number: [Your Policy Number]
Member Name: [Your Name]
Member ID: [Your Member ID]

Dear Appeals Review Team,

I am writing to formally appeal your denial of coverage for a Continuous Glucose Monitor (CGM) prescribed by my healthcare provider, Dr. [Doctor's Name], on [Date of Prescription].

MEDICAL NECESSITY:
As a person with [Type 1/Type 2] diabetes, continuous glucose monitoring is medically necessary for:
- Preventing dangerous hypoglycemic episodes
- Reducing HbA1c levels and improving overall glucose control
- Meeting ADA standards of care for diabetes management
- Avoiding costly emergency room visits and hospitalizations

SUPPORTING EVIDENCE:
1. My current HbA1c is [X]%, which is [above/below] target
2. I experience [frequency] of hypoglycemic episodes monthly
3. Traditional fingerstick monitoring is insufficient due to [specific reasons]
4. My healthcare provider has documented medical necessity (see attached)

COVERAGE JUSTIFICATION:
- CGMs are FDA-approved medical devices, not convenience items
- The American Diabetes Association recommends CGM for intensive insulin therapy
- Long-term cost savings through reduced complications and hospitalizations
- Improved quality of life and diabetes management outcomes

I respectfully request that you:
1. Reverse the denial decision
2. Authorize coverage for the prescribed CGM system
3. Provide written confirmation of coverage approval

Please find attached:
- Healthcare provider's letter of medical necessity
- Recent lab results and medical records
- Prescription for CGM system

I am happy to provide additional documentation if needed. Please contact me at [Phone] or [Email] if you require clarification.

Thank you for your time and consideration. I look forward to your prompt response.

Sincerely,
[Your Signature]
[Your Printed Name]
[Date]

Attachments: [List all attachments]`;

const FinancialTools = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<FinancialResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<FinancialResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Real data hooks
  const { data: medicareCoverage, loading: medicareLoading, refetch: refetchMedicare } = useMedicareData();
  const { data: drugPricing, loading: drugPricingLoading, refetch: refetchDrugPricing } = useDrugPricing();
  const { data: marketData, loading: marketDataLoading, refetch: refetchMarketData } = useMarketData();

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchQuery, selectedCategory]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_resources')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching financial resources:', error);
      toast({
        title: "Error",
        description: "Failed to load financial resources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.resource_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    setFilteredResources(filtered);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const openLink = (url: string) => {
    if (url === '#') {
      toast({
        title: "Coming Soon",
        description: "This resource link will be available soon",
      });
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category)))];

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
          <h1 className="text-4xl font-bold text-foreground mb-2">Financial Tools Hub</h1>
          <p className="text-muted-foreground">Resources to help manage the financial aspects of diabetes care</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="templates" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="templates">Appeal Templates</TabsTrigger>
                <TabsTrigger value="coverage">Medicare Coverage</TabsTrigger>
                <TabsTrigger value="pricing">Drug Pricing</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              {/* Appeal Templates */}
              <TabsContent value="templates" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Insurance Appeal Letter Template
                    </CardTitle>
                    <CardDescription>
                      Professional template for appealing CGM coverage denials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">How to Use This Template:</h4>
                        <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                          <li>Copy the template below</li>
                          <li>Replace all bracketed placeholders with your information</li>
                          <li>Attach supporting documents from your healthcare provider</li>
                          <li>Submit via certified mail or your insurance company's preferred method</li>
                        </ol>
                      </div>

                      <div className="relative">
                        <Textarea
                          value={appealTemplate}
                          readOnly
                          className="min-h-[400px] font-mono text-xs"
                        />
                        <Button
                          onClick={() => copyToClipboard(appealTemplate, 'Appeal template')}
                          className="absolute top-2 right-2"
                          size="sm"
                          variant="outline"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">💡 Pro Tips:</h4>
                        <ul className="text-sm space-y-1 list-disc list-inside text-blue-800 dark:text-blue-200">
                          <li>Include specific medical documentation and recent lab results</li>
                          <li>Emphasize cost savings from preventing complications</li>
                          <li>Reference your insurance policy's coverage of "durable medical equipment"</li>
                          <li>Request expedited review if medically urgent</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Templates</CardTitle>
                    <CardDescription>More templates for common financial challenges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Prescription Assistance Request</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Template for requesting manufacturer assistance programs
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast({ title: "Coming Soon", description: "This template will be available soon" })}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Template
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">FSA/HSA Documentation</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Letter for qualifying diabetes expenses
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast({ title: "Coming Soon", description: "This template will be available soon" })}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medicare Coverage Tab */}
              <TabsContent value="coverage" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Medicare Coverage for Diabetes Devices
                        </CardTitle>
                        <CardDescription>Real Medicare coverage data for diabetes equipment</CardDescription>
                      </div>
                      <Button onClick={refetchMedicare} size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {medicareLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse p-4 border rounded-lg">
                            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {medicareCoverage.map((item) => (
                          <div key={item.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{item.device_name}</h3>
                              <Badge variant={item.coverage_status === 'Covered' ? 'default' : 'secondary'}>
                                {item.coverage_status}
                              </Badge>
                            </div>
                            {item.coverage_details && (
                              <div className="text-sm space-y-2 text-muted-foreground">
                                <p><strong>Category:</strong> {item.coverage_details.benefit_category}</p>
                                <p><strong>Copay:</strong> {item.coverage_details.copay_info}</p>
                                {item.coverage_details.requirements && (
                                  <div>
                                    <strong>Requirements:</strong>
                                    <ul className="list-disc list-inside ml-2">
                                      {item.coverage_details.requirements.map((req: string, idx: number) => (
                                        <li key={idx}>{req}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                            {item.source_url && (
                              <a
                                href={item.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                              >
                                View CMS Documentation <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Drug Pricing Tab */}
              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Diabetes Drug Pricing Data
                        </CardTitle>
                        <CardDescription>Medicare Part D pricing for common diabetes medications</CardDescription>
                      </div>
                      <Button onClick={refetchDrugPricing} size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {drugPricingLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse p-4 border rounded-lg">
                            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {drugPricing.map((item) => (
                          <div key={item.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{item.drug_name}</h3>
                                <p className="text-sm text-muted-foreground">{item.manufacturer}</p>
                              </div>
                              <Badge variant="outline">{item.year}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                              <div>
                                <p className="text-muted-foreground">Retail Price</p>
                                <p className="font-semibold text-lg">${item.unit_price?.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Medicare Price</p>
                                <p className="font-semibold text-lg text-green-600">${item.medicare_price?.toFixed(2)}</p>
                              </div>
                            </div>
                            {item.ndc_code && (
                              <p className="text-xs text-muted-foreground mt-2">NDC: {item.ndc_code}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Market Data */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Diabetes Company Stock Performance</CardTitle>
                      <Button onClick={refetchMarketData} size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {marketDataLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="animate-pulse p-4 border rounded-lg">
                            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {marketData.slice(0, 8).map((stock) => (
                          <div key={stock.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{stock.ticker_symbol}</h4>
                                <p className="text-xs text-muted-foreground">{stock.company_name}</p>
                              </div>
                              <Badge variant={stock.change_percent && stock.change_percent > 0 ? 'default' : 'secondary'}>
                                {stock.change_percent && stock.change_percent > 0 ? '+' : ''}{stock.change_percent?.toFixed(2)}%
                              </Badge>
                            </div>
                            <div className="text-2xl font-bold">${stock.current_price?.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Market Cap: ${(stock.market_cap ? stock.market_cap / 1000000000 : 0).toFixed(1)}B
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resource Library */}
              <TabsContent value="resources" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Resource Library
                    </CardTitle>
                    <CardDescription>Curated list of financial assistance programs and resources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-2">
                          {categories.map((category) => (
                            <Button
                              key={category}
                              variant={selectedCategory === category ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedCategory(category)}
                            >
                              {category}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Resources List */}
                    {filteredResources.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No resources found matching your criteria</p>
                        <p className="text-sm">Try adjusting your search or filter</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredResources.map((resource) => (
                          <div key={resource.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">{resource.resource_title}</h3>
                                  <Badge variant="outline">{resource.category}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openLink(resource.link)}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Access
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="Templates, resources, and tools to help navigate the financial aspects of diabetes care and insurance coverage."
              whyItMatters="Diabetes care can be expensive. These tools help you access available assistance and advocate for proper coverage."
              nextSteps="Use templates to appeal denials, explore assistance programs, and track your diabetes-related expenses for tax purposes."
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Available Templates</span>
                  <Badge variant="secondary">4</Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Resource Categories</span>
                  <Badge variant="secondary">{categories.length - 1}</Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Total Resources</span>
                  <Badge variant="secondary">{resources.length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  If you need personalized assistance with insurance appeals or finding financial resources, 
                  consider consulting with a diabetes educator or social worker who specializes in diabetes care.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Find Local Resources
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FinancialTools;