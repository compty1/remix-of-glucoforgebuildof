import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoRail } from '@/components/InfoRail';
import { Skeleton } from '@/components/ui/skeleton';
import { useT1DEvents, T1DEvent } from '@/hooks/useT1DEvents';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ExternalLink,
  Search,
  Filter,
  DollarSign,
  Globe,
  Heart,
  Ticket
} from 'lucide-react';
import { format } from 'date-fns';

export default function EventsNearMe() {
  const { events, loading, error } = useT1DEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || event.event_type === selectedType;
    const matchesState = selectedState === 'all' || event.state === selectedState || (event.is_virtual && selectedState === 'virtual');
    const matchesFree = !showFreeOnly || event.is_free;
    return matchesSearch && matchesType && matchesState && matchesFree;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'walk': return 'bg-success/10 text-success border-success/20';
      case 'conference': return 'bg-primary/10 text-primary border-primary/20';
      case 'support_group': return 'bg-highlight/10 text-highlight border-highlight/20';
      case 'camp': return 'bg-warning/10 text-warning border-warning/20';
      case 'virtual': return 'bg-accent/10 text-accent border-accent/20';
      case 'educational': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'walk': return 'Walk/Run';
      case 'conference': return 'Conference';
      case 'support_group': return 'Support Group';
      case 'camp': return 'Camp';
      case 'virtual': return 'Virtual';
      case 'educational': return 'Educational';
      case 'fundraiser': return 'Fundraiser';
      case 'meetup': return 'Meetup';
      case 'advocacy': return 'Advocacy';
      default: return type;
    }
  };

  const states = [...new Set(events.map(e => e.state).filter(s => s))];

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <BackButton fallbackPath="/dashboard" />
          <div className="space-y-6 mt-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <BackButton fallbackPath="/dashboard" />

        {/* Hero Section */}
        <section className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-highlight rounded-xl flex items-center justify-center">
              <Calendar className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">T1D Events Near You</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover conferences, walks, support groups, camps, and community events 
            for the Type 1 diabetes community.
          </p>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 text-center">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Globe className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold">{events.filter(e => e.is_virtual).length}</p>
              <p className="text-sm text-muted-foreground">Virtual Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <DollarSign className="h-6 w-6 text-highlight mx-auto mb-2" />
              <p className="text-2xl font-bold">{events.filter(e => e.is_free).length}</p>
              <p className="text-sm text-muted-foreground">Free Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="h-6 w-6 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold">10+</p>
              <p className="text-sm text-muted-foreground">Organizations</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Search & Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events, cities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="walk">Walk/Run</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="support_group">Support Group</SelectItem>
                      <SelectItem value="camp">Camp</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="virtual">Virtual Only</SelectItem>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant={showFreeOnly ? "default" : "outline"}
                    onClick={() => setShowFreeOnly(!showFreeOnly)}
                    className="gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Free Only
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Events Grid */}
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Date Box */}
                      <div className="flex-shrink-0 w-20 text-center bg-primary/5 rounded-lg p-3">
                        <p className="text-sm font-medium text-primary">
                          {format(new Date(event.start_date), 'MMM')}
                        </p>
                        <p className="text-2xl font-bold">
                          {format(new Date(event.start_date), 'd')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.start_date), 'yyyy')}
                        </p>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={getTypeColor(event.event_type)}>
                                {getTypeLabel(event.event_type)}
                              </Badge>
                              {event.is_free && (
                                <Badge variant="secondary" className="bg-success/10 text-success">
                                  Free
                                </Badge>
                              )}
                              {event.is_virtual && (
                                <Badge variant="secondary">
                                  <Globe className="h-3 w-3 mr-1" />
                                  Virtual
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold">{event.title}</h3>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {event.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.is_virtual ? 'Online' : `${event.city}, ${event.state}`}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(event.start_date), 'h:mm a')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.organizer}
                          </div>
                          {!event.is_free && (
                            <div className="flex items-center gap-1">
                              <Ticket className="h-4 w-4" />
                              {event.cost_info}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {event.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => window.open(event.registration_url, '_blank')}
                          >
                            Register
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(event.website_url, '_blank')}
                          >
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredEvents.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Events Found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search terms.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="Upcoming T1D events including walks, conferences, support groups, and virtual meetups."
              whyItMatters="Connecting with the T1D community provides support, education, and opportunities to make a difference."
              nextSteps="Register for events that interest you and consider volunteering or fundraising."
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Featured Organizations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <a href="https://www.breakthrought1d.org" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between hover:text-primary transition-colors">
                  <span>Breakthrough T1D</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a href="https://childrenwithdiabetes.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between hover:text-primary transition-colors">
                  <span>Children with Diabetes</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a href="https://diabetessisters.org" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between hover:text-primary transition-colors">
                  <span>DiabetesSisters</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a href="https://beyondtype1.org" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between hover:text-primary transition-colors">
                  <span>Beyond Type 1</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Host an Event?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact us to list your T1D community event.
                </p>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Submit Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
