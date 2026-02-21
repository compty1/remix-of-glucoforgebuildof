import React, { useState } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { motion } from 'framer-motion';
import { History, Search, Filter, Loader2, Calendar, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InteractiveTimeline } from '@/components/explore/InteractiveTimeline';
import { EventDetailModal } from '@/components/explore/EventDetailModal';
import { DecadeTreatmentCard } from '@/components/explore/DecadeTreatmentCard';
import { HistoryEventCard } from '@/components/explore/HistoryEventCard';
import { useT1DHistory, useT1DHistoryDecades, T1DHistoryEvent } from '@/hooks/useT1DHistory';

const eras = [
  { value: 'all', label: 'All Eras' },
  { value: 'ancient', label: 'Ancient Period' },
  { value: 'pre-insulin', label: 'Pre-Insulin Era' },
  { value: 'insulin-discovery', label: 'Insulin Discovery' },
  { value: 'mid-century', label: 'Mid-Century' },
  { value: 'technology', label: 'Technology Revolution' },
  { value: 'digital', label: 'Digital & Modern' },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'discovery', label: 'Discoveries' },
  { value: 'treatment', label: 'Treatments' },
  { value: 'technology', label: 'Technology' },
  { value: 'research', label: 'Research' },
  { value: 'landmark', label: 'Landmarks' },
];

export default function Explore() {
  const [selectedEra, setSelectedEra] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<T1DHistoryEvent | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: events, isLoading } = useT1DHistory({
    era: selectedEra === 'all' ? undefined : selectedEra,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
  });

  const { data: decades } = useT1DHistoryDecades();

  // Filter events by search query
  const filteredEvents = events?.filter(event => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.short_description.toLowerCase().includes(query) ||
      event.detailed_description.toLowerCase().includes(query)
    );
  });

  const handleEventClick = (event: T1DHistoryEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const clearFilters = () => {
    setSelectedEra('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedEra !== 'all' || selectedCategory !== 'all' || searchQuery;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-brand-purple-dark via-brand-purple-light to-brand-teal overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container mx-auto px-4 py-16 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center text-white"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <History className="h-10 w-10" />
                <h1 className="heading-hero">Explore T1D History</h1>
              </div>
              <p className="text-xl opacity-90 mb-6">
                Journey through 3,500+ years of diabetes history—from ancient papyrus 
                scrolls to modern AI-powered insulin delivery systems.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <Calendar className="h-3 w-3 mr-1" />
                  1550 BCE - Present
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {events?.length || 0} Historical Events
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedEra} onValueChange={setSelectedEra}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Era" />
              </SelectTrigger>
              <SelectContent>
                {eras.map(era => (
                  <SelectItem key={era.value} value={era.value}>
                    {era.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* Timeline */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
            </div>
          ) : filteredEvents && filteredEvents.length > 0 ? (
            <div className="mb-12">
              <h2 className="heading-subsection mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-brand-teal" />
                Interactive Timeline
              </h2>
              <div className="bg-card border rounded-xl p-4 shadow-card">
                <InteractiveTimeline 
                  events={filteredEvents} 
                  onEventClick={handleEventClick}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <History className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query.
              </p>
            </div>
          )}

          {/* Event Cards Grid - Shows all filtered events as cards */}
          {filteredEvents && filteredEvents.length > 0 && (
            <div className="mt-8">
              <h2 className="heading-subsection mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-teal" />
                {selectedCategory !== 'all' 
                  ? `${categories.find(c => c.value === selectedCategory)?.label || 'Filtered'} Events`
                  : 'All Historical Events'
                }
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredEvents.length} events)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map(event => (
                  <HistoryEventCard 
                    key={event.id} 
                    event={event} 
                    onClick={() => handleEventClick(event)} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Decade Treatment Cards */}
          {decades && decades.length > 0 && (
            <div className="mt-12">
              <h2 className="heading-subsection mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-teal" />
                Treatment Through the Decades
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {decades.map((decade, index) => (
                  <DecadeTreatmentCard
                    key={decade.decade}
                    decade={decade.decade}
                    summary={decade.summary}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Event Detail Modal */}
        <EventDetailModal
          event={selectedEvent}
          open={showModal}
          onOpenChange={setShowModal}
        />
      </div>
    </Layout>
  );
}
