import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Beaker, 
  Pill, 
  Cpu, 
  BookOpen, 
  Star,
  ChevronRight
} from 'lucide-react';
import { T1DHistoryEvent } from '@/hooks/useT1DHistory';

interface HistoryEventCardProps {
  event: T1DHistoryEvent;
  onClick: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  discovery: <Beaker className="h-4 w-4" />,
  treatment: <Pill className="h-4 w-4" />,
  technology: <Cpu className="h-4 w-4" />,
  research: <BookOpen className="h-4 w-4" />,
  landmark: <Star className="h-4 w-4" />,
};

const eraColors: Record<string, string> = {
  ancient: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'pre-insulin': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'insulin-discovery': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'mid-century': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  technology: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  digital: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
};

export function HistoryEventCard({ event, onClick }: HistoryEventCardProps) {
  const yearDisplay = event.year < 0 
    ? `${Math.abs(event.year)} BCE` 
    : event.year.toString();

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg hover:border-primary/40 active:scale-[0.99] transition-all duration-200"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Year and Era Badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge className={eraColors[event.era] || 'bg-muted'}>
            {yearDisplay}
          </Badge>
          {event.impact_score && event.impact_score >= 9 && (
            <Badge variant="default" className="gap-1">
              <Star className="h-3 w-3 fill-current" />
              High Impact
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {/* Short Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {event.short_description}
        </p>

        {/* Category */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          {categoryIcons[event.category] || <Beaker className="h-4 w-4" />}
          <span className="capitalize">{event.category}</span>
        </div>

        {/* Learn More Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full group-hover:bg-primary/10"
        >
          Learn More <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
