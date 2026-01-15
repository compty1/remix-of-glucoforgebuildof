import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ManufacturerResource, Device } from '@/hooks/useDeviceDetails';
import { 
  Phone, 
  ExternalLink,
  RefreshCcw,
  HelpCircle,
  Shield,
  AlertTriangle,
  FileQuestion,
  Headphones
} from 'lucide-react';

interface DeviceSupportTabProps {
  resources: ManufacturerResource[];
  device: Device;
}

export const DeviceSupportTab: React.FC<DeviceSupportTabProps> = ({ 
  resources,
  device 
}) => {
  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'replacement':
        return <RefreshCcw className="h-5 w-5 text-highlight" />;
      case 'support':
        return <Headphones className="h-5 w-5 text-primary" />;
      case 'warranty':
        return <Shield className="h-5 w-5 text-success" />;
      case 'faq':
        return <HelpCircle className="h-5 w-5 text-warning" />;
      case 'adverse_report':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <FileQuestion className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getResourceTypeLabel = (resourceType: string) => {
    switch (resourceType) {
      case 'replacement': return 'Replacement';
      case 'support': return 'Support';
      case 'warranty': return 'Warranty';
      case 'faq': return 'FAQ';
      case 'adverse_report': return 'Report Issue';
      default: return resourceType;
    }
  };

  // Group resources by type
  const groupedResources = resources.reduce((acc, resource) => {
    const type = resource.resource_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(resource);
    return acc;
  }, {} as Record<string, ManufacturerResource[]>);

  const resourceOrder = ['replacement', 'support', 'warranty', 'faq', 'adverse_report'];

  return (
    <div className="space-y-6">
      {/* Quick Contact Card */}
      <Card className="command-center-widget hero-gradient text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-heading font-semibold mb-2">
                Need Help with Your {device.name}?
              </h2>
              <p className="text-white/80">
                Contact {device.manufacturer} support for immediate assistance
              </p>
            </div>
            {resources.find(r => r.resource_type === 'support')?.phone_number && (
              <Button size="lg" variant="secondary" asChild>
                <a href={`tel:${resources.find(r => r.resource_type === 'support')?.phone_number}`}>
                  <Phone className="h-5 w-5 mr-2" />
                  {resources.find(r => r.resource_type === 'support')?.phone_number}
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resources by Category */}
      {resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resourceOrder.map(type => {
            const typeResources = groupedResources[type];
            if (!typeResources || typeResources.length === 0) return null;

            return typeResources.map((resource) => (
              <Card key={resource.id} className="command-center-widget hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      {getResourceIcon(resource.resource_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getResourceTypeLabel(resource.resource_type)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {resource.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Visit
                            </a>
                          </Button>
                        )}
                        {resource.phone_number && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`tel:${resource.phone_number}`}>
                              <Phone className="h-4 w-4 mr-1" />
                              {resource.phone_number}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ));
          })}
        </div>
      ) : (
        <Card className="command-center-widget">
          <CardContent className="p-8 text-center">
            <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Support Resources Available</h3>
            <p className="text-muted-foreground mb-4">
              Support resources for {device.manufacturer} are not available yet.
            </p>
            {device.website_url && (
              <Button variant="outline" asChild>
                <a href={device.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Official Website
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Resources */}
      <Card className="command-center-widget">
        <CardHeader>
          <CardTitle className="text-lg">Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href="https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-sm">FDA MedWatch</p>
                <p className="text-xs text-muted-foreground">Report adverse events</p>
              </div>
            </a>
            <a 
              href="https://www.medicare.gov/coverage/durable-medical-equipment-dme-coverage"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Medicare Coverage</p>
                <p className="text-xs text-muted-foreground">Check DME coverage</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
