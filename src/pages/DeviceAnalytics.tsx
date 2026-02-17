import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoRail } from '@/components/InfoRail';
import { DeviceDetailsModal } from '@/components/DeviceDetailsModal';
import Layout from '@/components/Layout';
import { useDeviceAnalytics, Device } from '@/hooks/useDeviceAnalytics';
import { useFDAData } from '@/hooks/useFDAData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Syringe,
  Star,
  Shield,
  Droplets,
  RefreshCw,
  AlertCircle,
  Zap,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const DeviceAnalytics = () => {
  const navigate = useNavigate();
  const { data, loading, error, refreshCommunityFeed } = useDeviceAnalytics();
  const { data: fdaData, loading: fdaLoading, error: fdaError, refreshData: refreshFDA } = useFDAData();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'CGM' | 'Insulin Pump' | 'Smart Pen'>('all');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fdaEventType, setFdaEventType] = useState<string>('all');

  const handleRefreshFeed = async () => {
    setRefreshing(true);
    try {
      const result = await refreshCommunityFeed();
      if (result.success) {
        toast.success(`Community feed refreshed! Processed ${result.data?.inserted || 0} new posts.`);
      } else {
        toast.error(`Failed to refresh feed: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to refresh community feed');
    } finally {
      setRefreshing(false);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading device data: {error}
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const devices = data?.devices || [];
  const filteredDevices = selectedCategory === 'all' 
    ? devices 
    : devices.filter(device => device.category === selectedCategory);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-destructive';
  };

  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'CGM': return <Droplets className="h-5 w-5" />;
      case 'Insulin Pump': return <Syringe className="h-5 w-5" />;
      case 'Smart Pen': return <Smartphone className="h-5 w-5" />;
      default: return <Smartphone className="h-5 w-5" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Device Performance Tracker & Tech Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Community-sourced ratings and reliability scores for pumps, CGMs, and smart pens. 
            Real fixes from real warriors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              <Button 
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
              >
                All Devices ({devices.length})
              </Button>
              <Button 
                variant={selectedCategory === 'CGM' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('CGM')}
              >
                <Droplets className="h-4 w-4 mr-2" />
                CGMs ({devices.filter(d => d.category === 'CGM').length})
              </Button>
              <Button 
                variant={selectedCategory === 'Insulin Pump' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('Insulin Pump')}
              >
                <Syringe className="h-4 w-4 mr-2" />
                Pumps ({devices.filter(d => d.category === 'Insulin Pump').length})
              </Button>
              <Button 
                variant={selectedCategory === 'Smart Pen' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('Smart Pen')}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Smart Pens ({devices.filter(d => d.category === 'Smart Pen').length})
              </Button>
            </div>

            {/* Refresh Feed Button */}
            <Button 
              variant="outline" 
              onClick={handleRefreshFeed}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Feed
            </Button>
          </div>
        </section>

        {/* Device Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="command-center-widget">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-18" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredDevices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Devices Found</h3>
              <p className="text-muted-foreground">
                No devices match your current filter selection.
              </p>
            </div>
          ) : (
            filteredDevices.map((device) => (
              <Card key={device.id} className="command-center-widget hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.category)}
                      <Badge variant="outline" className="text-xs">
                        {device.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-warning" />
                      <span className="font-semibold">
                        {device.metrics ? (
                          ((device.metrics.reliability_score + device.metrics.social_setting_score) / 20).toFixed(1)
                        ) : (
                          'N/A'
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({device.metrics?.total_reviews || 0})
                      </span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-heading">{device.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{device.manufacturer}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Reliability Score Gauge */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Reliability Score</span>
                        <span className={`text-lg font-bold ${getScoreColor(device.metrics?.reliability_score || 0)}`}>
                          {device.metrics?.reliability_score || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (device.metrics?.reliability_score || 0) >= 90 ? 'bg-success' :
                            (device.metrics?.reliability_score || 0) >= 75 ? 'bg-warning' : 'bg-destructive'
                          }`}
                          style={{ width: `${device.metrics?.reliability_score || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Social Setting Score */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Social Setting Score</span>
                        <span className={`text-lg font-bold ${getScoreColor(device.metrics?.social_setting_score || 0)}`}>
                          {device.metrics?.social_setting_score || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (device.metrics?.social_setting_score || 0) >= 90 ? 'bg-success' :
                            (device.metrics?.social_setting_score || 0) >= 75 ? 'bg-warning' : 'bg-destructive'
                          }`}
                          style={{ width: `${device.metrics?.social_setting_score || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Key Features */}
                    <div className="flex flex-wrap gap-2">
                      {(device.key_features || []).slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                      {(!device.key_features || device.key_features.length === 0) && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          No features listed
                        </Badge>
                      )}
                    </div>
                    
                    {/* Price */}
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        {device.retail_price_usd ? `$${device.retail_price_usd.toLocaleString()}/device` : 'Price not available'}
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate(`/devices/${device.id}`)}
                    >
                      View Details & Community Fixes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>

        {/* Small Fixes, Massive Relief Section */}
        <section className="mb-12">
          <Card className="p-8 hero-gradient text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-heading font-bold mb-4">
                Small Fixes. Massive Relief.
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Community-sourced solutions for the most common device issues. 
                Real fixes from real T1D warriors.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data && data.devices.length > 0 && data.devices
                .flatMap(device => device.issues || [])
                .sort((a, b) => b.community_reports - a.community_reports)
                .slice(0, 3)
                .map((issue, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <h3 className="font-heading font-semibold mb-3">{issue.issue_title}</h3>
                    <p className="text-sm text-white/80 mb-4">
                      {issue.community_reports} community reports • {issue.frequency_percentage}% frequency
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-white/30 text-white hover:bg-white/10"
                      onClick={() => {
                        const device = data.devices.find(d => 
                          d.issues?.some(i => i.id === issue.id)
                        );
                        if (device) setSelectedDevice(device);
                      }}
                    >
                      View Solutions
                    </Button>
                  </div>
                ))
              }
              
              {(!data || data.devices.length === 0) && (
                <div className="col-span-full text-center">
                  <p className="text-white/80">Loading community issues...</p>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* FDA Safety Alerts Section */}
        <section className="mb-12">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-heading font-bold mb-2">FDA Device Safety Alerts</h2>
                <p className="text-muted-foreground">Real-time FDA recalls, clearances, and adverse event reports</p>
              </div>
              <Button 
                variant="outline" 
                onClick={refreshFDA}
                disabled={fdaLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${fdaLoading ? 'animate-spin' : ''}`} />
                Refresh FDA Data
              </Button>
            </div>

            {fdaError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fdaError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 mb-6">
              <Button 
                variant={fdaEventType === 'all' ? 'default' : 'outline'}
                onClick={() => setFdaEventType('all')}
              >
                All Events ({fdaData?.length || 0})
              </Button>
              <Button 
                variant={fdaEventType === 'recall' ? 'default' : 'outline'}
                onClick={() => setFdaEventType('recall')}
              >
                Recalls ({fdaData?.filter(e => e.event_type === 'recall').length || 0})
              </Button>
              <Button 
                variant={fdaEventType === 'clearance' ? 'default' : 'outline'}
                onClick={() => setFdaEventType('clearance')}
              >
                510(k) Clearances ({fdaData?.filter(e => e.event_type === 'clearance').length || 0})
              </Button>
              <Button 
                variant={fdaEventType === 'adverse_event' ? 'default' : 'outline'}
                onClick={() => setFdaEventType('adverse_event')}
              >
                Adverse Events ({fdaData?.filter(e => e.event_type === 'adverse_event').length || 0})
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fdaLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                  </Card>
                ))
              ) : (
                (fdaData || [])
                  .filter(event => fdaEventType === 'all' || event.event_type === fdaEventType)
                  .slice(0, 6)
                  .map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={
                            event.event_type === 'recall' ? 'destructive' :
                            event.event_type === 'adverse_event' ? 'default' : 'outline'
                          }>
                            {event.event_type}
                          </Badge>
                          {event.severity_level && (
                            <Badge variant="outline">{event.severity_level}</Badge>
                          )}
                        </div>
                        <CardTitle className="text-sm line-clamp-2">{event.device_name || 'Unknown Device'}</CardTitle>
                        <p className="text-xs text-muted-foreground">{event.manufacturer_name}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                          {event.event_description || 'No description available'}
                        </p>
                        {event.source_url ? (
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <a href={event.source_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-2" />
                              View FDA Report
                            </a>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="w-full" disabled>
                            <ExternalLink className="h-3 w-3 mr-2" />
                            No Report Link
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>

            {!fdaLoading && (!fdaData || fdaData.length === 0) && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No FDA safety data available yet. Try refreshing.</p>
              </div>
            )}
          </Card>
        </section>

        {/* Analytics Summary */}
        {data && (
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-primary">
                    {data.totalDevices}
                  </CardTitle>
                  <p className="text-muted-foreground">Devices Tracked</p>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-primary">
                    {data.avgReliabilityScore}%
                  </CardTitle>
                  <p className="text-muted-foreground">Avg Reliability</p>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-lg font-bold text-primary">
                    {data.mostReportedIssue}
                  </CardTitle>
                  <p className="text-muted-foreground">Most Reported Issue</p>
                </CardHeader>
              </Card>
            </div>
          </section>
        )}

        {/* Device Details Modal */}
        <DeviceDetailsModal
          device={selectedDevice}
          isOpen={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
          onRefreshFeed={refreshCommunityFeed}
        />

        {/* Info Rail */}
        <section className="mb-8">
          <InfoRail
            whatThisShows="Device reliability scores are calculated from community reports of device failures, accuracy issues, and user satisfaction surveys. Social setting scores reflect discretion, alarm customization, and phone control capabilities."
            whyItMatters="Making informed device choices can dramatically improve daily quality of life for T1D management. Community-sourced solutions help solve common problems quickly without waiting for manufacturer support."
            nextSteps="Compare devices side-by-side, browse community solutions for your current device issues, or contribute your own fixes to help other warriors."
          />
        </section>
      </div>
    </Layout>
  );
};

export default DeviceAnalytics;