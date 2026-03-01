import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EntityLogo } from '@/components/ui/entity-logo';
import { 
  Star, 
  AlertTriangle, 
  Phone,
  Droplets,
  Syringe,
  Smartphone,
  ExternalLink,
  DollarSign,
  MapPin,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Device, DeviceMetrics } from '@/hooks/useDeviceDetails';

interface DeviceHeroProps {
  device: Device;
  metrics: DeviceMetrics | null;
  totalReviews: number;
  onReportIssue: () => void;
  onGetSupport: () => void;
}

export const DeviceHero: React.FC<DeviceHeroProps> = ({
  device,
  metrics,
  totalReviews,
  onReportIssue,
  onGetSupport
}) => {
  const getDeviceIcon = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'cgm': return <Droplets className="h-6 w-6" />;
      case 'pump': 
      case 'insulin pump': return <Syringe className="h-6 w-6" />;
      case 'smart pen': return <Smartphone className="h-6 w-6" />;
      default: return <Smartphone className="h-6 w-6" />;
    }
  };

  const getDeviceTypeLabel = (category: string | null, deviceType: string | null | undefined) => {
    if (deviceType) return deviceType;
    switch (category?.toLowerCase()) {
      case 'cgm': return 'Continuous Glucose Monitor';
      case 'pump': return 'Insulin Pump';
      default: return category || 'Medical Device';
    }
  };

  const getFdaStatusColor = (status: string | null | undefined) => {
    if (!status) return 'bg-muted text-muted-foreground';
    const s = status.toLowerCase();
    if (s.includes('approved')) return 'bg-success/10 text-success border-success/20';
    if (s.includes('cleared')) return 'bg-primary/10 text-primary border-primary/20';
    if (s.includes('pending')) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-muted text-muted-foreground';
  };

  const getAvailabilityColor = (availability: string | null | undefined) => {
    if (!availability) return 'bg-muted text-muted-foreground';
    const a = availability.toLowerCase();
    if (a.includes('widely')) return 'bg-success/10 text-success border-success/20';
    if (a.includes('limited')) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-muted text-muted-foreground';
  };

  // C1: Use device.avg_rating from recalculate_device_ratings() instead of wrong formula
  const averageRating = (device as any).avg_rating ?? 0;

  const deviceType = getDeviceTypeLabel(device.category, device.device_type);
  const fdaStatus = device.fda_status || (device.fda_clearance_date ? 'FDA Cleared' : null);
  const availability = device.availability || 'Available';
  const priceRange = device.price_range || (device.retail_price_usd ? `$${device.retail_price_usd}` : null);

  return (
    <div className="space-y-6">
      {/* Main Hero Card */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-card">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Device Image */}
          <div className="w-full md:w-48 h-48 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            <EntityLogo 
              type="device"
              name={device.manufacturer || device.name}
              logoUrl={device.image_url}
              websiteUrl={device.website_url}
              size="xl"
              className="w-full h-full"
            />
          </div>

          {/* Device Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <EntityLogo 
                type="company"
                name={device.manufacturer || device.name}
                logoUrl={device.image_url}
                websiteUrl={device.website_url}
                size="md"
              />
              <Badge variant="outline">{device.category?.toUpperCase() === 'CGM' ? 'CGM' : device.category === 'pump' ? 'Insulin Pump' : device.category === 'smart_pen' ? 'Smart Pen' : device.category}</Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
              {device.name}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-2">
              by {device.manufacturer}
            </p>

            {device.description && (
              <p className="text-muted-foreground mb-4 max-w-2xl">
                {device.description}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating) 
                        ? 'fill-warning text-warning' 
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({totalReviews} reviews)</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={onReportIssue} variant="destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report an Issue
              </Button>
              <Button onClick={onGetSupport} variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Get Support
              </Button>
              {device.website_url && (
                <Button variant="ghost" asChild>
                  <a href={device.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Official Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Device Information Card */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Device Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Type */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{deviceType}</p>
            </div>

            {/* Price Range */}
            {priceRange && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Price Range
                </p>
                <p className="font-medium">{priceRange}</p>
              </div>
            )}

            {/* Availability */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Availability
              </p>
              <Badge variant="outline" className={getAvailabilityColor(availability)}>
                {availability}
              </Badge>
            </div>

            {/* FDA Status */}
            {fdaStatus && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  FDA Status
                </p>
                <Badge variant="outline" className={getFdaStatusColor(fdaStatus)}>
                  {fdaStatus}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
