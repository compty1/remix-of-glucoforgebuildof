import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, Pill, Shield, DollarSign, ExternalLink, 
  CheckCircle, Clock, ThumbsUp, ChevronDown, ChevronUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Workaround {
  id: string;
  title: string;
  description: string;
  instructions: string | null;
  category: string;
  source_url: string | null;
  source_platform: string | null;
  is_verified: boolean;
  last_verified_at: string | null;
  is_active: boolean;
  tags: string[] | null;
  upvotes: number;
  created_at: string;
}

const categoryConfig: Record<string, { icon: React.ElementType; label: string }> = {
  device: { icon: Wrench, label: 'Devices' },
  medication: { icon: Pill, label: 'Medications' },
  insurance: { icon: Shield, label: 'Insurance' },
  financial: { icon: DollarSign, label: 'Financial' },
};

const CommunityWorkaroundsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('device');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: workarounds = [], isLoading } = useQuery({
    queryKey: ['community-workarounds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_workarounds')
        .select('*')
        .eq('is_active', true)
        .order('upvotes', { ascending: false });
      if (error) throw error;
      return data as Workaround[];
    },
  });

  const filtered = workarounds.filter(w => w.category === activeTab);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <section className="py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Community Workarounds & Financial Assistance
          </CardTitle>
          <CardDescription>
            Real, verified workarounds shared by the T1D community for device coverage, medication costs, 
            insurance navigation, and financial assistance. All programs verified as currently active.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap h-auto gap-1 mb-6">
              {Object.entries(categoryConfig).map(([key, config]) => (
                <TabsTrigger key={key} value={key} className="gap-1.5">
                  <config.icon className="h-4 w-4" />
                  {config.label}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {workarounds.filter(w => w.category === key).length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No workarounds in this category yet.</p>
              ) : (
                <div className="space-y-4">
                  {filtered.map((w) => (
                    <Card key={w.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <h3 className="font-semibold">{w.title}</h3>
                              {w.is_verified && (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {w.source_platform && (
                                <Badge variant="secondary" className="text-xs">{w.source_platform}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{w.description}</p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Verified: {formatDate(w.last_verified_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {w.upvotes} helpful
                              </span>
                            </div>

                            {w.tags && w.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {w.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            )}

                            {/* Expandable Instructions */}
                            {w.instructions && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
                                  className="text-primary p-0 h-auto"
                                >
                                  {expandedId === w.id ? (
                                    <><ChevronUp className="h-4 w-4 mr-1" /> Hide Instructions</>
                                  ) : (
                                    <><ChevronDown className="h-4 w-4 mr-1" /> View Step-by-Step Instructions</>
                                  )}
                                </Button>
                                {expandedId === w.id && (
                                  <div className="mt-3 p-3 rounded-lg bg-muted/50 border text-sm whitespace-pre-line">
                                    {w.instructions}
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {w.source_url && (
                            <Button size="sm" variant="outline" asChild className="shrink-0">
                              <a href={w.source_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Visit
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
};

export default CommunityWorkaroundsSection;
