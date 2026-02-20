import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDeviceDetails } from '@/hooks/useDeviceDetails';
import { useDeviceFixes } from '@/hooks/useDeviceFixes';
import { useDeviceSolutions } from '@/hooks/useDeviceSolutions';
import { DeviceHero } from '@/components/device/DeviceHero';
import { DeviceMetricsCard } from '@/components/device/DeviceMetricsCard';
import { DeviceOverviewTab } from '@/components/device/DeviceOverviewTab';
import { DeviceReviewsTab } from '@/components/device/DeviceReviewsTab';
import { DeviceIssuesTab } from '@/components/device/DeviceIssuesTab';
import { DeviceFDATab } from '@/components/device/DeviceFDATab';
import { DeviceSupportTab } from '@/components/device/DeviceSupportTab';
import { DeviceUserFixesTab } from '@/components/device/DeviceUserFixesTab';
import { DeviceSolutionsTab } from '@/components/device/DeviceSolutionsTab';
import { RelatedDevicesSection } from '@/components/device/RelatedDevicesSection';
import { usePageMeta } from '@/hooks/usePageMeta';
import { 
  ArrowLeft, 
  AlertCircle,
  LayoutGrid,
  MessageSquare,
  AlertTriangle,
  Shield,
  Headphones,
  Bot,
  Lightbulb,
  Wrench
} from 'lucide-react';
import { DeviceAIChat } from '@/components/device/DeviceAIChat';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DeviceDetail = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  // Validate UUID before querying DB — prevents Postgres errors on invalid paths (Issue 107)
  const isValidDeviceId = deviceId ? UUID_REGEX.test(deviceId) : false;
  const { data, loading, error } = useDeviceDetails(isValidDeviceId ? deviceId : undefined);
  const { data: userFixes } = useDeviceFixes(isValidDeviceId ? deviceId : undefined);
  const { totalCount: solutionsCount } = useDeviceSolutions(isValidDeviceId ? deviceId : undefined, data?.device?.name);
  const [activeTab, setActiveTab] = useState('overview');

  const scrollToSupport = () => {
    setActiveTab('support');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const scrollToIssues = () => {
    setActiveTab('issues');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Invalid UUID path — show 404-style error instead of triggering Postgres error (Issue 107)
  if (!isValidDeviceId) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => navigate('/devices')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Devices
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Device not found. The link may be invalid or the device may have been removed.</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => navigate('/devices')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Devices
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" disabled className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Devices
          </Button>
          
          {/* Hero Skeleton */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <Skeleton className="w-full md:w-48 h-48 rounded-lg" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-48" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>

          {/* Tabs Skeleton */}
          <Skeleton className="h-12 w-full mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => navigate('/devices')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Devices
          </Button>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Device not found.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const { device, metrics, issues, communityPosts, fdaEvents, supportResources, relatedDevices, reviewStats } = data;

  // Issue 231: Update document title with device name for SEO
  usePageMeta(device.name, `${device.name} reviews, issues, FDA data, and community insights for T1D users on GlucoForge.`);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/devices')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Devices
        </Button>

        {/* Hero Section */}
        <section className="mb-8">
          <DeviceHero
            device={device}
            metrics={metrics}
            totalReviews={reviewStats.total}
            onReportIssue={scrollToIssues}
            onGetSupport={scrollToSupport}
          />
        </section>

        {/* Metrics Dashboard */}
        <section className="mb-8">
          <DeviceMetricsCard
            metrics={metrics}
            issueCount={issues.length}
            reviewCount={reviewStats.total}
          />
        </section>

        {/* Tabbed Content */}
        <section>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Scrollable tabs on mobile to prevent overflow (Issue 166) */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 mb-6">
              <TabsList className="flex w-max min-w-full sm:w-full sm:flex-wrap sm:h-auto justify-start gap-1 bg-transparent p-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Reviews ({reviewStats.total})
              </TabsTrigger>
              <TabsTrigger 
                value="issues"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Issues ({issues.length})
              </TabsTrigger>
              <TabsTrigger 
                value="fixes"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                User Fixes ({userFixes?.length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="solutions"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Solutions ({solutionsCount})
              </TabsTrigger>
              <TabsTrigger 
                value="fda"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Shield className="h-4 w-4 mr-2" />
                FDA ({fdaEvents.length})
              </TabsTrigger>
              <TabsTrigger 
                value="support"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Headphones className="h-4 w-4 mr-2" />
                Support
              </TabsTrigger>
              <TabsTrigger 
                value="ai-assistant"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </TabsTrigger>
            </TabsList>
            </div>

            <TabsContent value="overview">
              <DeviceOverviewTab device={device} />
            </TabsContent>

            <TabsContent value="reviews">
              <DeviceReviewsTab posts={communityPosts} reviewStats={reviewStats} deviceId={deviceId} />
            </TabsContent>

            <TabsContent value="issues">
              <DeviceIssuesTab issues={issues} onReportIssue={scrollToSupport} deviceName={device.name} />
            </TabsContent>

            <TabsContent value="fixes">
              <DeviceUserFixesTab deviceId={deviceId} deviceName={device.name} />
            </TabsContent>

            <TabsContent value="solutions">
              <DeviceSolutionsTab deviceId={deviceId || ''} deviceName={device.name} />
            </TabsContent>

            <TabsContent value="fda">
              <DeviceFDATab events={fdaEvents} />
            </TabsContent>

            <TabsContent value="support">
              <DeviceSupportTab resources={supportResources} device={device} />
            </TabsContent>

            <TabsContent value="ai-assistant">
              <DeviceAIChat
                deviceId={deviceId || ''}
                deviceName={device.name}
                deviceCategory={device.category}
                deviceManufacturer={device.manufacturer}
                deviceIssues={issues}
              />
            </TabsContent>
          </Tabs>
        </section>

        {/* Related Devices */}
        <RelatedDevicesSection 
          devices={relatedDevices} 
          currentCategory={device.category}
        />
      </div>
    </Layout>
  );
};

export default DeviceDetail;
