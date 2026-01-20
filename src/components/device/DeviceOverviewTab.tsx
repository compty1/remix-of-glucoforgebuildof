import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Device } from '@/hooks/useDeviceDetails';
import { DeviceSpecsCard } from './DeviceSpecsCard';
import { CheckCircle2, XCircle, Zap, DollarSign, Hash, ExternalLink } from 'lucide-react';

interface DeviceOverviewTabProps {
  device: Device;
}

export const DeviceOverviewTab: React.FC<DeviceOverviewTabProps> = ({ device }) => {
  return (
    <div className="space-y-6">
      {/* Description */}
      <Card className="command-center-widget">
        <CardHeader>
          <CardTitle className="text-lg">About This Device</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {device.description || 'No description available for this device.'}
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card className="command-center-widget">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-highlight" />
            Key Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          {device.key_features && device.key_features.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {device.key_features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="py-1.5 px-3">
                  <Zap className="h-3 w-3 mr-1.5" />
                  {feature}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No features listed</p>
          )}
        </CardContent>
      </Card>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros */}
        <Card className="command-center-widget border-l-4 border-l-success">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              Pros
            </CardTitle>
          </CardHeader>
          <CardContent>
            {device.pros && device.pros.length > 0 ? (
              <ul className="space-y-2">
                {device.pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{pro}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No pros listed yet</p>
            )}
          </CardContent>
        </Card>

        {/* Cons */}
        <Card className="command-center-widget border-l-4 border-l-destructive">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Cons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {device.cons && device.cons.length > 0 ? (
              <ul className="space-y-2">
                {device.cons.map((con, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{con}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No cons listed yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Basic Tech Specs */}
      <Card className="command-center-widget">
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Model Number</p>
                <p className="font-medium">{device.model_number || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Retail Price</p>
                <p className="font-medium">
                  {device.retail_price_usd 
                    ? `$${device.retail_price_usd.toLocaleString()}` 
                    : 'Price not available'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extended Device Specs - Technical, Regulatory, Compatibility, Support */}
      <DeviceSpecsCard device={device} />
    </div>
  );
};
