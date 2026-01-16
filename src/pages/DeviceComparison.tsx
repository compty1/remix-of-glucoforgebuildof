import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from '@/components/device/StarRating';
import { useDeviceComparison, ComparisonDevice } from '@/hooks/useDeviceComparison';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Star, 
  Shield, 
  Users, 
  AlertTriangle,
  DollarSign,
  Zap,
  Check,
  Minus,
  Share2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const DeviceComparison = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const {
    selectedDeviceIds,
    comparisonDevices,
    allDevices,
    loading,
    error,
    addDevice,
    removeDevice,
    clearAll,
    maxDevices
  } = useDeviceComparison(initialIds);

  // Update URL when selection changes
  React.useEffect(() => {
    if (selectedDeviceIds.length > 0) {
      setSearchParams({ ids: selectedDeviceIds.join(',') });
    } else {
      setSearchParams({});
    }
  }, [selectedDeviceIds, setSearchParams]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Comparison link copied to clipboard!');
  };

  const availableDevices = allDevices.filter(d => !selectedDeviceIds.includes(d.id));

  const renderComparisonRow = (
    label: string,
    icon: React.ReactNode,
    getValue: (device: ComparisonDevice) => React.ReactNode,
    className?: string
  ) => (
    <tr className={className}>
      <td className="py-3 px-4 font-medium flex items-center gap-2 bg-muted/50">
        {icon}
        {label}
      </td>
      {comparisonDevices.map(device => (
        <td key={device.id} className="py-3 px-4 text-center">
          {getValue(device)}
        </td>
      ))}
      {/* Empty cells for remaining slots */}
      {Array.from({ length: maxDevices - comparisonDevices.length }).map((_, i) => (
        <td key={`empty-${i}`} className="py-3 px-4" />
      ))}
    </tr>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" onClick={() => navigate('/devices')} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Devices
            </Button>
            <h1 className="text-3xl font-heading font-bold">Compare Devices</h1>
            <p className="text-muted-foreground">
              Select up to {maxDevices} devices to compare side-by-side
            </p>
          </div>
          {selectedDeviceIds.length >= 2 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Device Selector */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium">Selected devices:</span>
              
              {comparisonDevices.map(device => (
                <Badge key={device.id} variant="secondary" className="text-sm py-1.5 px-3">
                  {device.name}
                  <button 
                    onClick={() => removeDevice(device.id)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {selectedDeviceIds.length < maxDevices && (
                <Select onValueChange={addDevice}>
                  <SelectTrigger className="w-[200px]">
                    <Plus className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Add device..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDevices.map(device => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.name}
                        {device.category && (
                          <span className="text-muted-foreground ml-2">({device.category})</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ) : selectedDeviceIds.length === 0 ? (
          <Card className="command-center-widget">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Devices Selected</h2>
              <p className="text-muted-foreground mb-6">
                Add devices using the selector above to start comparing.
              </p>
              <Button onClick={() => navigate('/devices')}>
                Browse Devices
              </Button>
            </CardContent>
          </Card>
        ) : selectedDeviceIds.length === 1 ? (
          <Card className="command-center-widget">
            <CardContent className="p-12 text-center">
              <Plus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Add More Devices</h2>
              <p className="text-muted-foreground">
                Select at least 2 devices to compare them side-by-side.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Device Headers */}
              <thead>
                <tr>
                  <th className="py-4 px-4 text-left bg-muted/50 w-48">Device</th>
                  {comparisonDevices.map(device => (
                    <th key={device.id} className="py-4 px-4 text-center min-w-[200px]">
                      <div className="space-y-2">
                        {device.image_url && (
                          <img 
                            src={device.image_url} 
                            alt={device.name}
                            className="h-24 w-24 object-contain mx-auto rounded-lg bg-muted"
                          />
                        )}
                        <div className="font-semibold">{device.name}</div>
                        <div className="text-sm text-muted-foreground">{device.manufacturer}</div>
                        <Badge variant="outline">{device.category}</Badge>
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => navigate(`/devices/${device.id}`)}
                        >
                          View Details
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </th>
                  ))}
                  {Array.from({ length: maxDevices - comparisonDevices.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="py-4 px-4 min-w-[200px]" />
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {/* Ratings Section */}
                <tr>
                  <td colSpan={maxDevices + 1} className="py-3 px-4 bg-primary/5 font-semibold">
                    Ratings & Reviews
                  </td>
                </tr>
                
                {renderComparisonRow(
                  'User Rating',
                  <Star className="h-4 w-4 text-warning" />,
                  (device) => (
                    <div className="flex flex-col items-center gap-1">
                      {device.userReviewStats.totalReviews > 0 ? (
                        <>
                          <StarRating rating={Math.round(device.userReviewStats.averageRating)} size="sm" />
                          <span className="text-sm">
                            {device.userReviewStats.averageRating.toFixed(1)} ({device.userReviewStats.totalReviews})
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">No reviews</span>
                      )}
                    </div>
                  )
                )}

                {renderComparisonRow(
                  'Reliability Score',
                  <Shield className="h-4 w-4 text-primary" />,
                  (device) => (
                    <span className={`font-semibold ${
                      (device.metrics?.reliability_score || 0) >= 90 ? 'text-success' :
                      (device.metrics?.reliability_score || 0) >= 75 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {device.metrics?.reliability_score || 'N/A'}%
                    </span>
                  )
                )}

                {renderComparisonRow(
                  'Social Setting Score',
                  <Users className="h-4 w-4 text-primary" />,
                  (device) => (
                    <span className={`font-semibold ${
                      (device.metrics?.social_setting_score || 0) >= 90 ? 'text-success' :
                      (device.metrics?.social_setting_score || 0) >= 75 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {device.metrics?.social_setting_score || 'N/A'}%
                    </span>
                  )
                )}

                {renderComparisonRow(
                  'Known Issues',
                  <AlertTriangle className="h-4 w-4 text-destructive" />,
                  (device) => (
                    <span className={device.issueCount > 3 ? 'text-destructive' : ''}>
                      {device.issueCount}
                    </span>
                  )
                )}

                {/* Pricing Section */}
                <tr>
                  <td colSpan={maxDevices + 1} className="py-3 px-4 bg-primary/5 font-semibold">
                    Pricing
                  </td>
                </tr>

                {renderComparisonRow(
                  'Retail Price',
                  <DollarSign className="h-4 w-4 text-success" />,
                  (device) => (
                    <span className="font-semibold">
                      {device.retail_price_usd 
                        ? `$${device.retail_price_usd.toLocaleString()}`
                        : 'N/A'
                      }
                    </span>
                  )
                )}

                {/* Features Section */}
                <tr>
                  <td colSpan={maxDevices + 1} className="py-3 px-4 bg-primary/5 font-semibold">
                    Key Features
                  </td>
                </tr>

                {renderComparisonRow(
                  'Features',
                  <Zap className="h-4 w-4 text-warning" />,
                  (device) => (
                    <div className="flex flex-wrap justify-center gap-1">
                      {device.key_features?.slice(0, 3).map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      )) || <span className="text-muted-foreground">N/A</span>}
                    </div>
                  )
                )}

                {/* Pros Section */}
                <tr>
                  <td colSpan={maxDevices + 1} className="py-3 px-4 bg-primary/5 font-semibold">
                    Pros & Cons
                  </td>
                </tr>

                {renderComparisonRow(
                  'Pros',
                  <Check className="h-4 w-4 text-success" />,
                  (device) => (
                    <ul className="text-left text-sm space-y-1">
                      {device.pros?.slice(0, 3).map((pro, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <Check className="h-3 w-3 text-success mt-0.5 shrink-0" />
                          <span>{pro}</span>
                        </li>
                      )) || <span className="text-muted-foreground">N/A</span>}
                    </ul>
                  )
                )}

                {renderComparisonRow(
                  'Cons',
                  <Minus className="h-4 w-4 text-destructive" />,
                  (device) => (
                    <ul className="text-left text-sm space-y-1">
                      {device.cons?.slice(0, 3).map((con, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <Minus className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                          <span>{con}</span>
                        </li>
                      )) || <span className="text-muted-foreground">N/A</span>}
                    </ul>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DeviceComparison;