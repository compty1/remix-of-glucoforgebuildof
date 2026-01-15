import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FDAEvent } from '@/hooks/useDeviceDetails';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  FileWarning,
  ExternalLink,
  Calendar,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';

interface DeviceFDATabProps {
  events: FDAEvent[];
}

export const DeviceFDATab: React.FC<DeviceFDATabProps> = ({ events }) => {
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  const filteredEvents = events.filter(event => 
    eventTypeFilter === 'all' || event.event_type === eventTypeFilter
  );

  const eventCounts = {
    all: events.length,
    recall: events.filter(e => e.event_type === 'recall').length,
    clearance: events.filter(e => e.event_type === 'clearance').length,
    adverse_event: events.filter(e => e.event_type === 'adverse_event').length
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'recall':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'clearance':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'adverse_event':
        return <FileWarning className="h-5 w-5 text-warning" />;
      default:
        return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'recall':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Recall</Badge>;
      case 'clearance':
        return <Badge className="bg-success/10 text-success border-success/20">510(k) Clearance</Badge>;
      case 'adverse_event':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Adverse Event</Badge>;
      default:
        return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string | null) => {
    if (!severity) return null;
    switch (severity.toLowerCase()) {
      case 'class i':
      case 'high':
        return <Badge variant="destructive">Class I</Badge>;
      case 'class ii':
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Class II</Badge>;
      case 'class iii':
      case 'low':
        return <Badge variant="secondary">Class III</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            FDA Safety Data
          </h2>
          <p className="text-muted-foreground text-sm">
            Official FDA recalls, clearances, and adverse event reports
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a 
            href="https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Report to FDA
          </a>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={eventTypeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setEventTypeFilter('all')}
        >
          All ({eventCounts.all})
        </Button>
        <Button
          variant={eventTypeFilter === 'recall' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setEventTypeFilter('recall')}
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Recalls ({eventCounts.recall})
        </Button>
        <Button
          variant={eventTypeFilter === 'clearance' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setEventTypeFilter('clearance')}
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Clearances ({eventCounts.clearance})
        </Button>
        <Button
          variant={eventTypeFilter === 'adverse_event' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setEventTypeFilter('adverse_event')}
        >
          <FileWarning className="h-4 w-4 mr-1" />
          Adverse Events ({eventCounts.adverse_event})
        </Button>
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="command-center-widget">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {getEventBadge(event.event_type)}
                      {getSeverityBadge(event.severity_level)}
                    </div>
                    
                    <h3 className="font-semibold mb-2">
                      {event.device_name || 'Unknown Device'}
                    </h3>
                    
                    {event.event_description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {event.event_description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {event.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(event.event_date), 'MMM d, yyyy')}
                        </span>
                      )}
                      {event.manufacturer_name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {event.manufacturer_name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {event.source_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a 
                        href={event.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="command-center-widget">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No FDA Events Found</h3>
            <p className="text-muted-foreground">
              {eventTypeFilter === 'all' 
                ? 'No FDA events on record for this device.'
                : `No ${eventTypeFilter.replace('_', ' ')} events found.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
