import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { T1DHistoryEvent } from '@/hooks/useT1DHistory';

interface InteractiveTimelineProps {
  events: T1DHistoryEvent[];
  onEventClick: (event: T1DHistoryEvent) => void;
}

const eraColors: Record<string, string> = {
  'ancient': 'bg-amber-500',
  'pre-insulin': 'bg-orange-500',
  'insulin-discovery': 'bg-green-500',
  'mid-century': 'bg-blue-500',
  'technology': 'bg-purple-500',
  'digital': 'bg-brand-teal',
};

const categoryIcons: Record<string, string> = {
  'discovery': '🔬',
  'treatment': '💉',
  'technology': '📱',
  'research': '📚',
  'cultural': '🌍',
  'landmark': '⭐',
};

export function InteractiveTimeline({ events, onEventClick }: InteractiveTimelineProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const minYear = Math.min(...events.map(e => e.year));
  const maxYear = Math.max(...events.map(e => e.year));
  const yearRange = maxYear - minYear;

  const baseWidth = 100; // pixels per 10 years at zoom level 1
  const totalWidth = (yearRange / 10) * baseWidth * zoomLevel;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  const handleReset = () => {
    setZoomLevel(1);
    setScrollPosition(0);
  };

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const getEventPosition = (year: number) => {
    return ((year - minYear) / yearRange) * 100;
  };

  // Group events by decade for density management
  const eventsByDecade = events.reduce((acc, event) => {
    const decade = Math.floor(event.year / 10) * 10;
    if (!acc[decade]) acc[decade] = [];
    acc[decade].push(event);
    return acc;
  }, {} as Record<number, T1DHistoryEvent[]>);

  // Generate decade markers
  const decades = [];
  for (let year = Math.floor(minYear / 100) * 100; year <= maxYear; year += 10) {
    if (year >= minYear - 50) {
      decades.push(year);
    }
  }

  return (
    <div className="relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Arrows */}
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
        onClick={scrollLeft}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
        onClick={scrollRight}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Timeline Container */}
      <div 
        ref={containerRef}
        className="overflow-x-auto overflow-y-visible py-8 px-12 scrollbar-thin scrollbar-thumb-muted-foreground/20"
        style={{ cursor: 'grab' }}
      >
        <div 
          ref={timelineRef}
          className="relative"
          style={{ 
            width: `${Math.max(totalWidth, 1500)}px`,
            height: '400px'
          }}
        >
          {/* Main Timeline Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-green-500 via-blue-500 to-brand-teal rounded-full" />

          {/* Decade Markers */}
          {decades.map((decade) => {
            const position = getEventPosition(decade);
            return (
              <div 
                key={decade}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${position}%` }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-muted-foreground/30" />
                  <span className="mt-2 text-xs text-muted-foreground font-medium">
                    {decade < 0 ? `${Math.abs(decade)} BCE` : decade}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Event Nodes */}
          <AnimatePresence>
            {events.map((event, index) => {
              const position = getEventPosition(event.year);
              const isTopRow = index % 2 === 0;
              const eraColor = eraColors[event.era || 'digital'] || 'bg-brand-purple-dark';

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`absolute cursor-pointer group`}
                  style={{ 
                    left: `${position}%`,
                    top: isTopRow ? '10%' : '60%',
                  }}
                  onClick={() => onEventClick(event)}
                >
                  {/* Connector Line */}
                  <div 
                    className={`absolute left-1/2 w-0.5 bg-muted-foreground/30 group-hover:bg-brand-teal transition-colors ${
                      isTopRow ? 'bottom-0 h-[calc(40%-8px)]' : 'top-0 h-[calc(40%-8px)]'
                    }`}
                    style={{ transform: 'translateX(-50%)' }}
                  />

                  {/* Event Card */}
                  <Card className={`w-48 transform -translate-x-1/2 hover:scale-105 transition-all shadow-md hover:shadow-lg border-l-4 ${eraColor.replace('bg-', 'border-')}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-lg">{categoryIcons[event.category] || '📌'}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {event.year < 0 ? `${Math.abs(event.year)} BCE` : event.year}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
                        {event.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {event.short_description}
                      </p>
                      {event.impact_score && event.impact_score >= 8 && (
                        <Badge className="mt-2 text-[10px] bg-brand-red/10 text-brand-red border-0">
                          Major Milestone
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Era Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {Object.entries(eraColors).map(([era, color]) => (
          <div key={era} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-sm text-muted-foreground capitalize">
              {era.replace('-', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
