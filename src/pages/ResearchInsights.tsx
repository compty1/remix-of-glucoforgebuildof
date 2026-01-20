import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TLDRCard } from '@/components/research/TLDRCard';
import { CitationMetrics } from '@/components/research/CitationMetrics';
import { InfluentialPapersList } from '@/components/research/InfluentialPapersList';
import { CitationNetwork } from '@/components/research/CitationNetwork';
import { EmailSubscriptionForm } from '@/components/research/EmailSubscriptionForm';
import { PaperDetailsModal } from '@/components/research/PaperDetailsModal';
import { FoundConnectionsTab } from '@/components/research/FoundConnectionsTab';
import { useResearchInsights } from '@/hooks/useResearchInsights';
import { useCitationNetwork, type NetworkNode } from '@/hooks/useCitationNetwork';
import { RefreshCw, Sparkles, TrendingUp, Network, Mail, BarChart3, Link2 } from 'lucide-react';

const ResearchInsights = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPaper, setSelectedPaper] = useState<NetworkNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { papers, papersWithTLDR, topInfluentialPapers, stats, loading, error, refreshData } = useResearchInsights();
  const { networkData, loading: networkLoading, refreshNetwork, fetchCitationData } = useCitationNetwork();

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedPaper(node);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge className="bg-highlight/10 text-highlight border-highlight/20">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Research Intelligence
            </Badge>
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Research Insights Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            AI-generated summaries, influential citations, and research network visualization
          </p>
          <Button onClick={refreshData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </section>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tldr" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Summaries
            </TabsTrigger>
            <TabsTrigger value="influential" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Influential
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network
            </TabsTrigger>
            <TabsTrigger value="digest" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Weekly Digest
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {loading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
                </div>
                <Skeleton className="h-64" />
              </div>
            ) : (
              <CitationMetrics stats={stats} />
            )}
          </TabsContent>

          {/* AI Summaries Tab */}
          <TabsContent value="tldr">
            <div className="mb-4">
              <Badge variant="outline">{papersWithTLDR.length} papers with AI summaries</Badge>
            </div>
            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64" />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {papersWithTLDR.slice(0, 20).map(paper => (
                  <TLDRCard key={paper.id} paper={paper} showFullAbstract />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Influential Papers Tab */}
          <TabsContent value="influential">
            {loading ? (
              <Skeleton className="h-[600px]" />
            ) : (
              <InfluentialPapersList papers={topInfluentialPapers} />
            )}
          </TabsContent>

          {/* Found Connections Tab */}
          <TabsContent value="connections">
            <FoundConnectionsTab />
          </TabsContent>

          {/* Citation Network Tab */}
          <TabsContent value="network">
            <CitationNetwork
              data={networkData}
              loading={networkLoading}
              onRefresh={refreshNetwork}
              onFetchData={fetchCitationData}
              onNodeClick={handleNodeClick}
            />
          </TabsContent>

          {/* Weekly Digest Tab */}
          <TabsContent value="digest">
            <div className="max-w-xl mx-auto">
              <EmailSubscriptionForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Paper Details Modal */}
      <PaperDetailsModal
        paper={selectedPaper}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </Layout>
  );
};

export default ResearchInsights;
