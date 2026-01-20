import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Battery, 
  Droplets, 
  Activity, 
  Shield, 
  Smartphone,
  Phone,
  Mail,
  FileText,
  ExternalLink,
  DollarSign,
  Stethoscope,
  Link2,
  Settings,
  Syringe,
  Gauge,
  Zap,
  Timer,
  Cpu,
  Beaker
} from 'lucide-react';

interface DeviceSpecsCardProps {
  device: {
    sensor_wear_days?: number | null;
    warmup_time?: string | null;
    accuracy_mard?: string | null;
    battery_life?: string | null;
    waterproof_rating?: string | null;
    fda_clearance_date?: string | null;
    fda_510k_number?: string | null;
    fda_pma_number?: string | null;
    regulatory_class?: string | null;
    compatibility?: {
      pumps?: string[];
      apps?: string[];
      third_party?: string[];
    } | null;
    app_compatibility?: {
      ios?: string;
      android?: string;
    } | null;
    insurance_coverage?: string | null;
    user_manual_url?: string | null;
    support_phone?: string | null;
    support_email?: string | null;
    specifications?: Record<string, string> | unknown | null;
    device_type?: string | null;
    price_range?: string | null;
    availability?: string | null;
    fda_status?: string | null;
  };
}

// Helper function to get icon for specification type
const getSpecIcon = (key: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    bolus: <Syringe className="h-5 w-5 text-primary" />,
    reservoir: <Beaker className="h-5 w-5 text-primary" />,
    basal_rates: <Activity className="h-5 w-5 text-primary" />,
    battery: <Battery className="h-5 w-5 text-primary" />,
    waterproof: <Droplets className="h-5 w-5 text-primary" />,
    algorithm: <Cpu className="h-5 w-5 text-primary" />,
    reading_interval: <Timer className="h-5 w-5 text-primary" />,
    calibration: <Gauge className="h-5 w-5 text-primary" />,
    sensor_life: <Clock className="h-5 w-5 text-primary" />,
    transmitter: <Zap className="h-5 w-5 text-primary" />,
    transmitter_life: <Zap className="h-5 w-5 text-primary" />,
    warmup: <Timer className="h-5 w-5 text-primary" />,
    mard: <Activity className="h-5 w-5 text-primary" />,
    pod_life: <Clock className="h-5 w-5 text-primary" />,
    bolus_increment: <Syringe className="h-5 w-5 text-primary" />,
    auto_corrections: <Cpu className="h-5 w-5 text-primary" />,
    setup: <Settings className="h-5 w-5 text-primary" />,
    carb_counting: <Settings className="h-5 w-5 text-primary" />,
    size: <Settings className="h-5 w-5 text-primary" />,
  };
  return iconMap[key] || <Settings className="h-5 w-5 text-muted-foreground" />;
};

// Helper function to format specification labels
const formatSpecLabel = (key: string): string => {
  const labelMap: Record<string, string> = {
    bolus: "Bolus Range",
    reservoir: "Reservoir",
    basal_rates: "Basal Rates",
    battery: "Battery",
    waterproof: "Water Rating",
    algorithm: "Algorithm",
    reading_interval: "Reading Interval",
    calibration: "Calibration",
    sensor_life: "Sensor Life",
    transmitter: "Transmitter",
    transmitter_life: "Transmitter Life",
    warmup: "Warmup Time",
    mard: "MARD Accuracy",
    pod_life: "Pod Life",
    bolus_increment: "Bolus Increment",
    auto_corrections: "Auto Corrections",
    setup: "Setup",
    carb_counting: "Carb Counting",
    size: "Size",
  };
  return labelMap[key] || key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const DeviceSpecsCard: React.FC<DeviceSpecsCardProps> = ({ device }) => {
  const hasSpecs = device.sensor_wear_days || device.warmup_time || device.accuracy_mard || 
                   device.battery_life || device.waterproof_rating;
  
  const hasRegulatory = device.fda_clearance_date || device.fda_510k_number || 
                        device.fda_pma_number || device.regulatory_class;
  
  const hasCompatibility = device.compatibility && (
    (device.compatibility.pumps && device.compatibility.pumps.length > 0) ||
    (device.compatibility.apps && device.compatibility.apps.length > 0) ||
    (device.compatibility.third_party && device.compatibility.third_party.length > 0)
  );

  const hasSupport = device.support_phone || device.support_email || device.user_manual_url;

  // Parse compatibility if it's a string
  const compatibility = typeof device.compatibility === 'string' 
    ? JSON.parse(device.compatibility) 
    : device.compatibility;

  const appCompatibility = typeof device.app_compatibility === 'string'
    ? JSON.parse(device.app_compatibility)
    : device.app_compatibility;

  // Parse specifications if it's a string
  const specifications = typeof device.specifications === 'string'
    ? JSON.parse(device.specifications)
    : device.specifications;

  const hasDeviceSpecs = specifications && Object.keys(specifications).length > 0;

  return (
    <div className="space-y-6">
      {/* Device-Specific Specifications (from JSONB) */}
      {hasDeviceSpecs && (
        <Card className="command-center-widget">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  {getSpecIcon(key)}
                  <div>
                    <p className="text-xs text-muted-foreground">{formatSpecLabel(key)}</p>
                    <p className="font-medium">{String(value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Specifications (legacy fields) */}
      {hasSpecs && !hasDeviceSpecs && (
        <Card className="command-center-widget">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Technical Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {device.sensor_wear_days && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Wear Time</p>
                    <p className="font-medium">{device.sensor_wear_days} days</p>
                  </div>
                </div>
              )}
              {device.warmup_time && device.warmup_time !== 'N/A' && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Warmup</p>
                    <p className="font-medium">{device.warmup_time}</p>
                  </div>
                </div>
              )}
              {device.accuracy_mard && device.accuracy_mard !== 'N/A' && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Accuracy (MARD)</p>
                    <p className="font-medium">{device.accuracy_mard}</p>
                  </div>
                </div>
              )}
              {device.battery_life && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Battery className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Battery Life</p>
                    <p className="font-medium">{device.battery_life}</p>
                  </div>
                </div>
              )}
              {device.waterproof_rating && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Droplets className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Water Resistance</p>
                    <p className="font-medium">{device.waterproof_rating}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regulatory Information */}
      {hasRegulatory && (
        <Card className="command-center-widget">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              Regulatory Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {device.fda_clearance_date && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">FDA Clearance</p>
                  <p className="font-medium">{new Date(device.fda_clearance_date).toLocaleDateString()}</p>
                </div>
              )}
              {device.fda_510k_number && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">510(k) Number</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium"
                    onClick={() => window.open(`https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMN/pmn.cfm?ID=${device.fda_510k_number}`, '_blank')}
                  >
                    {device.fda_510k_number}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
              {device.fda_pma_number && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">PMA Number</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium"
                    onClick={() => window.open(`https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMA/pma.cfm?ID=${device.fda_pma_number}`, '_blank')}
                  >
                    {device.fda_pma_number}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
              {device.regulatory_class && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Device Class</p>
                  <p className="font-medium">{device.regulatory_class}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compatibility */}
      {hasCompatibility && compatibility && (
        <Card className="command-center-widget">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="h-5 w-5 text-highlight" />
              Compatibility & Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {compatibility.pumps && compatibility.pumps.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Compatible Pumps</p>
                <div className="flex flex-wrap gap-2">
                  {compatibility.pumps.map((pump: string, index: number) => (
                    <Badge key={index} variant="secondary">{pump}</Badge>
                  ))}
                </div>
              </div>
            )}
            {compatibility.apps && compatibility.apps.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Official Apps</p>
                <div className="flex flex-wrap gap-2">
                  {compatibility.apps.map((app: string, index: number) => (
                    <Badge key={index} variant="outline">{app}</Badge>
                  ))}
                </div>
              </div>
            )}
            {compatibility.third_party && compatibility.third_party.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Third-Party Integrations</p>
                <div className="flex flex-wrap gap-2">
                  {compatibility.third_party.map((app: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-muted">{app}</Badge>
                  ))}
                </div>
              </div>
            )}
            {appCompatibility && (
              <div>
                <p className="text-sm font-medium mb-2">Mobile Requirements</p>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {appCompatibility.ios && (
                    <span className="flex items-center gap-1">
                      <Smartphone className="h-4 w-4" />
                      iOS {appCompatibility.ios}
                    </span>
                  )}
                  {appCompatibility.android && (
                    <span className="flex items-center gap-1">
                      <Smartphone className="h-4 w-4" />
                      Android {appCompatibility.android}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Insurance & Coverage */}
      {device.insurance_coverage && (
        <Card className="command-center-widget">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              Insurance & Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{device.insurance_coverage}</p>
          </CardContent>
        </Card>
      )}

      {/* Support Resources */}
      {hasSupport && (
        <Card className="command-center-widget">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Support Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {device.support_phone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${device.support_phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    {device.support_phone}
                  </a>
                </Button>
              )}
              {device.support_email && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${device.support_email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </a>
                </Button>
              )}
              {device.user_manual_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={device.user_manual_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    User Manual
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};