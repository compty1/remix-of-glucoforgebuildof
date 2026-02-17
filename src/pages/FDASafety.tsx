import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ExternalLink, 
  AlertTriangle, 
  Shield, 
  FileText, 
  AlertCircle,
  Search,
  Filter,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useState } from 'react';
import { useFDAData } from '@/hooks/useFDAData';

export default function FDASafety() {
  const { data: fdaEvents, loading, error } = useFDAData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const eventTypes = ['all', 'recall', '510k', 'pma', 'adverse_event'];
  const severityLevels = ['all', 'critical', 'high', 'medium', 'low'];

  const filteredEvents = fdaEvents.filter(event => {
    const matchesSearch = 
      event.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.manufacturer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event_description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEventType = selectedEventType === 'all' || event.event_type === selectedEventType;
    const matchesSeverity = selectedSeverity === 'all' || event.severity_level?.toLowerCase() === selectedSeverity;

    return matchesSearch && matchesEventType && matchesSeverity;
  });

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning/10 text-warning dark:bg-warning/20';
      case 'medium':
        return 'bg-chart-3/10 text-chart-3 dark:bg-chart-3/20';
      case 'low':
        return 'bg-success/10 text-success dark:bg-success/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'recall':
        return 'bg-destructive/10 text-destructive dark:bg-destructive/20';
      case '510k':
        return 'bg-primary/10 text-primary dark:bg-primary/20';
      case 'pma':
        return 'bg-accent text-accent-foreground';
      case 'adverse_event':
        return 'bg-warning/10 text-warning dark:bg-warning/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'recall':
        return AlertTriangle;
      case '510k':
      case 'pma':
        return Shield;
      case 'adverse_event':
        return AlertCircle;
      default:
        return FileText;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-6">FDA Safety Dashboard</h1>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              FDA Safety Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time FDA device events, recalls, clearances, and safety alerts for diabetes medical devices.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-2xl font-bold">{fdaEvents.filter(e => e.event_type === 'recall').length}</p>
                <p className="text-sm text-muted-foreground">Recalls</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{fdaEvents.filter(e => e.event_type === '510k').length}</p>
                <p className="text-sm text-muted-foreground">510(k) Clearances</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{fdaEvents.filter(e => e.event_type === 'pma').length}</p>
                <p className="text-sm text-muted-foreground">PMA Approvals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{fdaEvents.filter(e => e.event_type === 'adverse_event').length}</p>
                <p className="text-sm text-muted-foreground">Adverse Events</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search devices, manufacturers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Event Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Event Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {eventTypes.map(type => (
                      <Button
                        key={type}
                        size="sm"
                        variant={selectedEventType === type ? "default" : "outline"}
                        onClick={() => setSelectedEventType(type)}
                      >
                        {type === 'all' ? 'All' : type.replace('_', ' ').toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Severity Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Severity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {severityLevels.map(level => (
                      <Button
                        key={level}
                        size="sm"
                        variant={selectedSeverity === level ? "default" : "outline"}
                        onClick={() => setSelectedSeverity(level)}
                      >
                        {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredEvents.length} of {fdaEvents.length} FDA events
          </div>

          {/* FDA Events List */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No FDA events found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredEvents.map((event) => {
                const EventIcon = getEventTypeIcon(event.event_type);
                return (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <EventIcon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{event.device_name || 'Unknown Device'}</CardTitle>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.manufacturer_name || 'Unknown Manufacturer'}
                          </p>
                          {event.event_description && (
                            <p className="text-sm">{event.event_description}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getEventTypeColor(event.event_type)}>
                            {event.event_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {event.severity_level && (
                            <Badge className={getSeverityColor(event.severity_level)}>
                              {event.severity_level}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Date unknown'}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            FDA ID: {event.fda_event_id}
                          </Badge>
                          <Badge 
                            variant={event.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {event.status}
                          </Badge>
                        </div>
                        {event.source_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={event.source_url} target="_blank" rel="noopener noreferrer">
                              View on FDA
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Information Card */}
          <Card className="mt-12 bg-muted/50">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                About FDA Safety Data
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  This dashboard aggregates real-time data from multiple FDA databases:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Device Recalls:</strong> FDA-mandated recalls of diabetes medical devices</li>
                  <li><strong>510(k) Clearances:</strong> Premarket notifications for new devices</li>
                  <li><strong>PMA Approvals:</strong> Premarket approvals for high-risk devices</li>
                  <li><strong>Adverse Events:</strong> Reported device malfunctions and patient injuries</li>
                </ul>
                <p className="mt-4">
                  Data is updated regularly from the openFDA API. Always consult with healthcare professionals 
                  regarding device safety concerns.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
