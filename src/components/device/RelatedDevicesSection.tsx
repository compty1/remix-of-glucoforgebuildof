import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Device } from '@/hooks/useDeviceDetails';
import { useNavigate } from 'react-router-dom';
import { 
  Droplets, 
  Syringe, 
  Smartphone,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { EntityLogo } from '@/components/ui/entity-logo';

interface RelatedDevicesSectionProps {
  devices: Device[];
  currentCategory: string | null;
}

export const RelatedDevicesSection: React.FC<RelatedDevicesSectionProps> = ({ 
  devices,
  currentCategory 
}) => {
  const navigate = useNavigate();

  const getDeviceIcon = (category: string | null) => {
    switch (category) {
      case 'CGM': return <Droplets className="h-5 w-5" />;
      case 'Insulin Pump': return <Syringe className="h-5 w-5" />;
      case 'Smart Pen': return <Smartphone className="h-5 w-5" />;
      default: return <Smartphone className="h-5 w-5" />;
    }
  };

  if (devices.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-semibold">
          Related {currentCategory ? `${currentCategory}s` : 'Devices'}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => navigate('/devices')}>
          View All Devices
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {devices.map((device) => (
          <Card 
            key={device.id} 
            className="group command-center-widget cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate(`/devices/${device.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <EntityLogo 
                  type="device"
                  name={device.manufacturer || device.name}
                  logoUrl={device.image_url}
                  websiteUrl={device.website_url}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs mb-1">
                    {device.category}
                  </Badge>
                  <h3 className="font-semibold line-clamp-1">{device.name}</h3>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {device.manufacturer}
              </p>
              
              {device.retail_price_usd && (
                <p className="text-sm font-medium">
                  ${device.retail_price_usd.toLocaleString()}
                </p>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-3 opacity-70 group-hover:opacity-100 group-hover:bg-primary/10 transition-all"
              >
                Learn More <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
