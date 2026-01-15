import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Device } from '@/hooks/useDeviceDetails';
import { useNavigate } from 'react-router-dom';
import { 
  Droplets, 
  Syringe, 
  Smartphone,
  ArrowRight
} from 'lucide-react';

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
            className="command-center-widget cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate(`/devices/${device.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {getDeviceIcon(device.category)}
                <Badge variant="outline" className="text-xs">
                  {device.category}
                </Badge>
              </div>
              
              <h3 className="font-semibold mb-1 line-clamp-1">{device.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {device.manufacturer}
              </p>
              
              {device.retail_price_usd && (
                <p className="text-sm font-medium mt-2">
                  ${device.retail_price_usd.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
