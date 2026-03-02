/**
 * Phase 16.4: Device Connection Guide Component
 * Provides step-by-step instructions for connecting health devices.
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Smartphone, Watch, Upload, ExternalLink, MonitorSmartphone } from 'lucide-react';

interface DeviceGuide {
  id: string;
  name: string;
  icon: React.ReactNode;
  platform: 'ios' | 'android' | 'both';
  steps: string[];
  exportFormat: string;
  helpUrl?: string;
}

const DEVICE_GUIDES: DeviceGuide[] = [
  {
    id: 'dexcom-clarity',
    name: 'Dexcom Clarity',
    icon: <MonitorSmartphone className="h-5 w-5" />,
    platform: 'both',
    exportFormat: 'CSV',
    steps: [
      'Open Dexcom Clarity app or visit clarity.dexcom.com',
      'Log in with your Dexcom account',
      'Navigate to Reports → Export Data',
      'Select date range and click "Export"',
      'Download the CSV file',
      'Upload the CSV file to GlucoForge using the Data Upload page',
    ],
    helpUrl: 'https://www.dexcom.com/clarity',
  },
  {
    id: 'libre-libreview',
    name: 'FreeStyle LibreView',
    icon: <MonitorSmartphone className="h-5 w-5" />,
    platform: 'both',
    exportFormat: 'CSV',
    steps: [
      'Visit libreview.com and log in',
      'Go to My Reports → Export Data',
      'Select the date range',
      'Download as CSV',
      'Upload to GlucoForge',
    ],
    helpUrl: 'https://www.libreview.com',
  },
  {
    id: 'apple-health',
    name: 'Apple Health',
    icon: <Watch className="h-5 w-5" />,
    platform: 'ios',
    exportFormat: 'XML/CSV',
    steps: [
      'Open the Health app on your iPhone',
      'Tap your profile picture → Export All Health Data',
      'This creates a ZIP file — extract it',
      'Find export.xml or use a converter tool for CSV',
      'Upload the glucose data CSV to GlucoForge',
    ],
  },
  {
    id: 'google-health-connect',
    name: 'Google Health Connect',
    icon: <Smartphone className="h-5 w-5" />,
    platform: 'android',
    exportFormat: 'CSV',
    steps: [
      'Open Health Connect app on Android',
      'Go to Data & Access → Blood Glucose',
      'Use "Export" or share with a compatible app',
      'Save as CSV and upload to GlucoForge',
    ],
  },
  {
    id: 'nightscout',
    name: 'Nightscout',
    icon: <MonitorSmartphone className="h-5 w-5" />,
    platform: 'both',
    exportFormat: 'JSON/CSV',
    steps: [
      'Navigate to your Nightscout URL',
      'Go to Reports → Day to Day or Admin Tools',
      'Export data as JSON or CSV',
      'Upload to GlucoForge — Nightscout format is auto-detected',
    ],
  },
];

export function DeviceConnectionGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Connect Your Device
        </CardTitle>
        <CardDescription>
          Step-by-step guides to export data from your CGM or health app and import it into GlucoForge.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-2">
          {DEVICE_GUIDES.map(guide => (
            <AccordionItem key={guide.id} value={guide.id} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {guide.icon}
                  <span className="font-medium">{guide.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {guide.exportFormat}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {guide.platform === 'both' ? 'iOS & Android' : guide.platform === 'ios' ? 'iOS' : 'Android'}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
                  {guide.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                {guide.helpUrl && (
                  <a
                    href={guide.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Official Help Page
                  </a>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
