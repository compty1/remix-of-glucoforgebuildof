import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
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
  const [zoomLevel, setZoomLevel] = useState(0.4); // Start more zoomed out
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const minYear = Math.min(...events.map(e => e.year));
  const maxYear = Math.max(...events.map(e => e.year));
  const yearRange = maxYear - minYear;

  // Smaller base width and adjusted calculations for more compact view
  const baseWidth = 60; // Reduced from 100 - pixels per 10 years at zoom level 1
  const totalWidth = Math.max((yearRange / 10) * baseWidth * zoomLevel, 2000);

  // Scroll to modern era on mount (around year 2000)
  useEffect(() => {
    if (containerRef.current && events.length > 0) {
      const modernYearPosition = ((2000 - minYear) / yearRange) * totalWidth;
      // Center the view around year 2000
      const scrollTo = Math.max(0, modernYearPosition - containerRef.current.clientWidth / 2);
      containerRef.current.scrollLeft = scrollTo;
    }
  }, [events.length, minYear, yearRange, totalWidth]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.2));
  const handleReset = () => {
    setZoomLevel(0.4);
    if (containerRef.current) {
      const modernYearPosition = ((2000 - minYear) / yearRange) * totalWidth;
      containerRef.current.scrollLeft = Math.max(0, modernYearPosition - containerRef.current.clientWidth / 2);
    }
  };

  const handleFitAll = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 100; // Account for padding
      const newZoom = containerWidth / ((yearRange / 10) * baseWidth);
      setZoomLevel(Math.max(0.15, Math.min(newZoom, 0.5)));
      containerRef.current.scrollLeft = 0;
    }
  };

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
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

  // Generate decade markers - show every 20 years when zoomed out
  const decades = [];
  const decadeStep = zoomLevel < 0.5 ? 20 : 10;
  for (let year = Math.floor(minYear / 100) * 100; year <= maxYear; year += decadeStep) {
    if (year >= minYear - 50) {
      decades.push(year);
    }
  }

  // Calculate card width based on zoom level
  const cardWidth = Math.max(120, Math.min(160, 140 * zoomLevel));

  return (
    <div className="relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 flex-wrap">
        <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleFitAll} title="Fit All Events">
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleReset} title="Reset View">
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
        className="overflow-x-auto overflow-y-visible py-6 px-12 scrollbar-thin scrollbar-thumb-muted-foreground/20"
        style={{ cursor: 'grab' }}
      >
        <div 
          ref={timelineRef}
          className="relative"
          style={{ 
            width: `${totalWidth}px`,
            height: '320px', // Slightly reduced height
            minWidth: '100%',
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
                  <div className="w-0.5 h-3 bg-muted-foreground/40" />
                  <span className="mt-1 text-[10px] text-muted-foreground font-medium whitespace-nowrap">
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
              // Stagger events vertically to prevent overlap - use modulo for variety
              const rowIndex = index % 4;
              const isTopHalf = rowIndex < 2;
              const verticalOffset = isTopHalf 
                ? (rowIndex === 0 ? '5%' : '20%')
                : (rowIndex === 2 ? '55%' : '70%');
              
              const eraColor = eraColors[event.era || 'digital'] || 'bg-brand-purple-dark';

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: index * 0.01 }}
                  className="absolute cursor-pointer group"
                  style={{ 
                    left: `${position}%`,
                    top: verticalOffset,
                  }}
                  onClick={() => onEventClick(event)}
                >
                  {/* Connector Line */}
                  <div 
                    className={`absolute left-1/2 w-0.5 bg-muted-foreground/20 group-hover:bg-brand-teal transition-colors ${
                      isTopHalf ? 'bottom-0' : 'top-0'
                    }`}
                    style={{ 
                      transform: 'translateX(-50%)',
                      height: isTopHalf 
                        ? `calc(${rowIndex === 0 ? '45%' : '30%'} - 4px)`
                        : `calc(${rowIndex === 2 ? '45%' : '30%'} - 4px)`,
                    }}
                  />

                  {/* Event Card - Compact */}
                  <Card 
                    className={`transform -translate-x-1/2 hover:scale-105 transition-all shadow-sm hover:shadow-md border-l-3 ${eraColor.replace('bg-', 'border-')}`}
                    style={{ width: `${cardWidth}px` }}
                  >
                    <CardContent className="p-2">
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <span className="text-sm">{categoryIcons[event.category] || '📌'}</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">
                          {event.year < 0 ? `${Math.abs(event.year)} BCE` : event.year}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-xs leading-tight mb-0.5 line-clamp-2">
                        {event.title}
                      </h4>
                      {zoomLevel > 0.3 && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {event.short_description}
                        </p>
                      )}
                      {event.impact_score && event.impact_score >= 8 && zoomLevel > 0.4 && (
                        <Badge className="mt-1 text-[8px] px-1 py-0 bg-brand-red/10 text-brand-red border-0">
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
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {Object.entries(eraColors).map(([era, color]) => (
          <div key={era} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-xs text-muted-foreground capitalize">
              {era.replace('-', ' ')}
            </span>
          </div>
        ))}
      </div>

      {/* Zoom Level Indicator */}
      <div className="text-center mt-2">
        <span className="text-xs text-muted-foreground">
          Zoom: {Math.round(zoomLevel * 100)}% • {events.length} events
        </span>
      </div>
    </div>
  );
}
