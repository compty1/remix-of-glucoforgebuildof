import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  AlertTriangle, 
  Phone,
  Droplets,
  Syringe,
  Smartphone,
  ExternalLink
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
    switch (category) {
      case 'CGM': return <Droplets className="h-6 w-6" />;
      case 'Insulin Pump': return <Syringe className="h-6 w-6" />;
      case 'Smart Pen': return <Smartphone className="h-6 w-6" />;
      default: return <Smartphone className="h-6 w-6" />;
    }
  };

  const averageRating = metrics 
    ? ((metrics.reliability_score || 0) + (metrics.social_setting_score || 0)) / 20 
    : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-card">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Device Image */}
        <div className="w-full md:w-48 h-48 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
          {device.image_url ? (
            <img 
              src={device.image_url} 
              alt={device.name}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="text-muted-foreground">
              {getDeviceIcon(device.category)}
            </div>
          )}
        </div>

        {/* Device Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getDeviceIcon(device.category)}
            <Badge variant="outline">{device.category}</Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            {device.name}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-4">
            by {device.manufacturer}
          </p>

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
  );
};
