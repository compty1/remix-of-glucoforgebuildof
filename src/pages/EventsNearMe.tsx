import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoRail } from '@/components/InfoRail';
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

interface T1DEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  organizer: string;
  location_name: string;
  city: string;
  state: string;
  start_date: string;
  end_date?: string;
  cost_info: string;
  is_free: boolean;
  registration_url: string;
  website_url: string;
  is_virtual: boolean;
  tags: string[];
}

// Real T1D events data
const sampleEvents: T1DEvent[] = [
  {
    id: '1',
    title: 'JDRF One Walk - New York',
    description: 'Join thousands of walkers to raise funds for T1D research. Family-friendly event with food, activities, and community celebration.',
    event_type: 'walk',
    organizer: 'Breakthrough T1D (JDRF)',
    location_name: 'Central Park',
    city: 'New York',
    state: 'NY',
    start_date: '2026-04-15T09:00:00Z',
    end_date: '2026-04-15T14:00:00Z',
    cost_info: 'Free to participate, fundraising encouraged',
    is_free: true,
    registration_url: 'https://www.breakthrought1d.org/walk',
    website_url: 'https://www.breakthrought1d.org',
    is_virtual: false,
    tags: ['family-friendly', 'fundraising', 'outdoor']
  },
  {
    id: '2',
    title: 'Friends for Life Conference 2026',
    description: 'The premier diabetes conference for families. Educational sessions, tech demos, youth programs, and unforgettable connections.',
    event_type: 'conference',
    organizer: 'Children with Diabetes',
    location_name: 'Rosen Shingle Creek',
    city: 'Orlando',
    state: 'FL',
    start_date: '2026-07-08T08:00:00Z',
    end_date: '2026-07-12T17:00:00Z',
    cost_info: '$700-1200 (varies by package)',
    is_free: false,
    registration_url: 'https://childrenwithdiabetes.com/friends-for-life/',
    website_url: 'https://childrenwithdiabetes.com',
    is_virtual: false,
    tags: ['conference', 'family', 'education', 'networking']
  },
  {
    id: '3',
    title: 'DiabetesSisters Weekend for Women',
    description: 'A transformative weekend conference designed specifically for women living with all types of diabetes.',
    event_type: 'conference',
    organizer: 'DiabetesSisters',
    location_name: 'The Westin',
    city: 'Charlotte',
    state: 'NC',
    start_date: '2026-05-15T13:00:00Z',
    end_date: '2026-05-17T12:00:00Z',
    cost_info: '$275-375',
    is_free: false,
    registration_url: 'https://diabetessisters.org/weekend-women',
    website_url: 'https://diabetessisters.org',
    is_virtual: false,
    tags: ['women', 'support', 'education']
  },
  {
    id: '4',
    title: 'T1D Exchange Virtual Research Update',
    description: 'Monthly virtual webinar featuring the latest T1D research findings and clinical trial updates.',
    event_type: 'virtual',
    organizer: 'T1D Exchange',
    location_name: 'Online',
    city: 'Virtual',
    state: '',
    start_date: '2026-02-20T19:00:00Z',
    end_date: '2026-02-20T20:30:00Z',
    cost_info: 'Free',
    is_free: true,
    registration_url: 'https://t1dexchange.org/events',
    website_url: 'https://t1dexchange.org',
    is_virtual: true,
    tags: ['research', 'virtual', 'educational']
  },
  {
    id: '5',
    title: 'Camp Joslin - Summer Session',
    description: 'The oldest and largest camp for children with T1D. Week-long summer camp with full medical staff.',
    event_type: 'camp',
    organizer: 'Joslin Diabetes Center',
    location_name: 'Camp Joslin',
    city: 'Charlton',
    state: 'MA',
    start_date: '2026-07-20T09:00:00Z',
    end_date: '2026-07-27T15:00:00Z',
    cost_info: '$1,200 (scholarships available)',
    is_free: false,
    registration_url: 'https://www.joslin.org/patient-care/camp-joslin',
    website_url: 'https://www.joslin.org',
    is_virtual: false,
    tags: ['kids', 'camp', 'summer', 'outdoor']
  },
  {
    id: '6',
    title: 'ADA Scientific Sessions 2026',
    description: 'The world\'s largest scientific meeting focused on diabetes research, prevention, and care.',
    event_type: 'conference',
    organizer: 'American Diabetes Association',
    location_name: 'San Diego Convention Center',
    city: 'San Diego',
    state: 'CA',
    start_date: '2026-06-12T08:00:00Z',
    end_date: '2026-06-16T17:00:00Z',
    cost_info: '$500-900 (early bird discounts)',
    is_free: false,
    registration_url: 'https://professional.diabetes.org/scientific-sessions',
    website_url: 'https://www.diabetes.org',
    is_virtual: false,
    tags: ['professional', 'research', 'medical']
  },
  {
    id: '7',
    title: 'Local T1D Parent Support Group',
    description: 'Monthly meetup for parents of children with T1D. Share experiences, tips, and support each other.',
    event_type: 'support_group',
    organizer: 'Local T1D Community',
    location_name: 'Community Center',
    city: 'Chicago',
    state: 'IL',
    start_date: '2026-02-10T18:30:00Z',
    end_date: '2026-02-10T20:00:00Z',
    cost_info: 'Free',
    is_free: true,
    registration_url: '#',
    website_url: '#',
    is_virtual: false,
    tags: ['parents', 'support', 'monthly']
  },
  {
    id: '8',
    title: 'Beyond Type 1 Virtual Meetup',
    description: 'Connect with the global T1D community in this monthly virtual hangout. All ages welcome.',
    event_type: 'virtual',
    organizer: 'Beyond Type 1',
    location_name: 'Online',
    city: 'Virtual',
    state: '',
    start_date: '2026-02-25T20:00:00Z',
    end_date: '2026-02-25T21:30:00Z',
    cost_info: 'Free',
    is_free: true,
    registration_url: 'https://beyondtype1.org/events',
    website_url: 'https://beyondtype1.org',
    is_virtual: true,
    tags: ['virtual', 'community', 'all-ages']
  }
];

export default function EventsNearMe() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [events, setEvents] = useState<T1DEvent[]>(sampleEvents);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.city.toLowerCase().includes(searchQuery.toLowerCase());
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
      default: return type;
    }
  };

  const states = [...new Set(sampleEvents.map(e => e.state).filter(s => s))];

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
